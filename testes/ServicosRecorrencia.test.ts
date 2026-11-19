import { beforeEach, describe, it } from 'node:test'
import assert from 'node:assert/strict'
import ServicosRecorrencia from '../app/src/logic/core/financas/ServicosRecorrencia'
import Recorrencia from '../app/src/logic/core/financas/Recorrencia'
import Transacao from '../app/src/logic/core/financas/Transacao'
import { TipoTransacao } from '../app/src/logic/core/financas/TipoTransacao'
import Usuario from '../app/src/logic/core/usuario/Usuario'
import Data from '../app/src/logic/utils/Data'
import ColecaoFalsa from './apoio/ColecaoFalsa'

const usuario: Usuario = { id: 'u', nome: 'Teste', email: 't@t.com', imagemUrl: null }
const T = 'financas/t@t.com/transacoes'
const R = 'financas/t@t.com/recorrencias'

let banco: ColecaoFalsa
let servico: ServicosRecorrencia

function criarServico() {
	banco = new ColecaoFalsa()
	servico = new ServicosRecorrencia()
	;(servico as any)._colecao = banco
	;(servico as any)._transacoes._colecao = banco
}

const hoje = new Date()
const mesAtual = Data.primeiroDiaMes(hoje)
const mes = (n: number) => Data.somarMeses(mesAtual, n)
const am = (n: number) => Data.anoMes(mes(n))

function rec(extra: Partial<Recorrencia> = {}): Recorrencia {
	return {
		id: 'aluguel',
		tipo: TipoTransacao.DESPESA,
		categoria: 'Moradia',
		descricao: 'Aluguel',
		valor: 1200,
		valorVariavel: false,
		diaDoMes: 10,
		inicio: am(-2),
		fim: null,
		ativa: true,
		mesesPulados: [],
		...extra,
	}
}

async function abrirMes(n: number) {
	const recorrencias = await servico.consultar(usuario)
	const doMes = await (servico as any)._transacoes.consultarPorMes(usuario, mes(n))
	const criadas = await servico.garantirLancamentosDoMes(usuario, mes(n), recorrencias, doMes)
	return [...doMes, ...criadas] as Transacao[]
}

const ids = (caminho: string) => banco.ids(caminho)

describe('ServicosRecorrencia (banco em memória)', () => {
	beforeEach(criarServico)

	it('abrir o mês gera os lançamentos uma vez só', async () => {
		await servico.salvar(rec(), usuario)
		const primeira = await abrirMes(0)
		const segunda = await abrirMes(0)
		assert.equal(primeira.length, 1)
		assert.equal(segunda.length, 1)
		assert.deepEqual(ids(T), [`aluguel_${am(0)}`])
	})

	it('mês futuro não grava nada', async () => {
		await servico.salvar(rec(), usuario)
		await abrirMes(1)
		assert.deepEqual(ids(T), [])
	})

	it('lançamento com a data movida para outro mês não é recriado', async () => {
		await servico.salvar(rec(), usuario)
		const [l] = await abrirMes(0)
		// Usuário mudou a data para o mês anterior
		await banco.salvar(T, { ...l, data: Data.diaNoMes(mes(-1).getFullYear(), mes(-1).getMonth(), 28) })
		await abrirMes(0)
		assert.deepEqual(ids(T), [`aluguel_${am(0)}`])
	})

	it('criar a partir de uma transação gera o lançamento do mês', async () => {
		const r = await servico.criarDeTransacao(
			usuario,
			{
				tipo: TipoTransacao.DESPESA,
				categoria: 'Moradia',
				descricao: 'Conta de Luz',
				valor: 180,
				data: new Date(hoje.getFullYear(), hoje.getMonth(), 5),
			},
			{ diaDoMes: 20, valorVariavel: true, fim: null },
		)
		const l = await banco.consultarPorId(T, `${r.id}_${am(0)}`)
		assert.equal(l.situacao, 'prevista')
		assert.equal(new Date(l.data).getDate(), Math.min(20, Data.diasNoMes(hoje.getFullYear(), hoje.getMonth())))
		// e abrir o mês não duplica
		await abrirMes(0)
		assert.equal(ids(T).length, 1)
	})

	it('excluir só este mês: o lançamento não volta ao abrir o mês', async () => {
		await servico.salvar(rec(), usuario)
		const [l] = await abrirMes(0)
		await servico.excluirLancamento(usuario, l, 'este', await servico.consultar(usuario))
		await abrirMes(0)
		assert.deepEqual(ids(T), [])
		const r = (await servico.consultar(usuario))[0]
		assert.deepEqual(r.mesesPulados, [am(0)])
	})

	it('excluir este e os próximos: encerra no mês anterior e mantém o histórico', async () => {
		await servico.salvar(rec(), usuario)
		await abrirMes(-2)
		await abrirMes(-1)
		const [l] = await abrirMes(0)
		await servico.excluirLancamento(usuario, l, 'proximos', await servico.consultar(usuario))
		assert.deepEqual(ids(T), [`aluguel_${am(-1)}`, `aluguel_${am(-2)}`].sort())
		const [r] = await servico.consultar(usuario)
		assert.equal(r.fim, am(-1))
		await abrirMes(0)
		assert.equal(ids(T).length, 2)
	})

	it('excluir este e os próximos no mês de início apaga a conta fixa', async () => {
		await servico.salvar(rec({ inicio: am(0) }), usuario)
		const [l] = await abrirMes(0)
		await servico.excluirLancamento(usuario, l, 'proximos', await servico.consultar(usuario))
		assert.deepEqual(ids(R), [])
		assert.deepEqual(ids(T), [])
	})

	it('alterar este e os próximos: histórico igual, mês atual com o valor novo, sem duplicar', async () => {
		await servico.salvar(rec(), usuario)
		await abrirMes(-1)
		const [l] = await abrirMes(0)
		await servico.salvarLancamento(
			usuario,
			{ ...l, valor: 1300 },
			'proximos',
			await servico.consultar(usuario),
		)
		const recs = await servico.consultar(usuario)
		assert.equal(recs.length, 2)
		const antiga = recs.find((r) => r.id === 'aluguel')!
		const nova = recs.find((r) => r.id !== 'aluguel')!
		assert.equal(antiga.fim, am(-1))
		assert.equal(nova.inicio, am(0))
		assert.equal(nova.valor, 1300)

		const doMes = await abrirMes(0)
		assert.equal(doMes.length, 1)
		assert.equal(doMes[0].valor, 1300)
		assert.equal(doMes[0].recorrenciaId, nova.id)
		const anterior = await banco.consultarPorId(T, `aluguel_${am(-1)}`)
		assert.equal(anterior.valor, 1200)
		assert.equal(ids(T).length, 2)
	})

	it('alterar este e os próximos num mês passado religa os meses seguintes sem duplicar', async () => {
		await servico.salvar(rec(), usuario)
		const [anterior] = await abrirMes(-1)
		await abrirMes(0)
		await servico.salvarLancamento(
			usuario,
			{ ...anterior, valor: 1300 },
			'proximos',
			await servico.consultar(usuario),
		)
		const nova = (await servico.consultar(usuario)).find((r) => r.id !== 'aluguel')!
		// Mês atual: o lançamento confirmado continua com o valor que tinha, ligado à nova
		const atual = await abrirMes(0)
		assert.equal(atual.length, 1)
		assert.equal(atual[0].recorrenciaId, nova.id)
		assert.equal(atual[0].valor, 1200)
		assert.equal(ids(T).length, 2)
	})

	it('alterar só este mês confirma a prevista e não mexe na conta fixa', async () => {
		await servico.salvar(rec({ id: 'luz', valorVariavel: true, valor: 180 }), usuario)
		const [l] = await abrirMes(0)
		assert.equal(l.situacao, 'prevista')
		await servico.salvarLancamento(usuario, { ...l, valor: 196.4 }, 'este', await servico.consultar(usuario))
		const salvo = await banco.consultarPorId(T, l.id!)
		assert.equal(salvo.situacao, 'confirmada')
		assert.equal(salvo.valor, 196.4)
		assert.equal((await servico.consultar(usuario))[0].valor, 180)
	})

	it('confirmar valor', async () => {
		await servico.salvar(rec({ id: 'luz', valorVariavel: true, valor: 180 }), usuario)
		const [l] = await abrirMes(0)
		await servico.confirmarValor(usuario, l, 210, l.data)
		const salvo = await banco.consultarPorId(T, l.id!)
		assert.equal(salvo.situacao, 'confirmada')
		assert.equal(salvo.valor, 210)
	})

	it('editar pela tela: com o lançamento do mês já feito, vale do próximo mês', async () => {
		await servico.salvar(rec(), usuario)
		await abrirMes(0)
		const aPartirDe = await servico.editar(usuario, (await servico.consultar(usuario))[0], { valor: 1300 })
		assert.equal(aPartirDe, am(1))
		const atual = await banco.consultarPorId(T, `aluguel_${am(0)}`)
		assert.equal(atual.valor, 1200)
		const recs = await servico.consultar(usuario)
		assert.equal(recs.find((r) => r.id === 'aluguel')!.fim, am(0))
		assert.equal(recs.find((r) => r.id !== 'aluguel')!.inicio, am(1))
	})

	it('editar pela tela: sem lançamento no mês, vale já', async () => {
		await servico.salvar(rec({ inicio: am(0) }), usuario)
		const aPartirDe = await servico.editar(usuario, (await servico.consultar(usuario))[0], { valor: 1300 })
		assert.equal(aPartirDe, am(0))
		const recs = await servico.consultar(usuario)
		assert.equal(recs.length, 1)
		assert.equal(recs[0].valor, 1300)
	})

	it('excluir a conta fixa: confirmados ficam, previstos vão', async () => {
		await servico.salvar(rec({ id: 'luz', valorVariavel: true }), usuario)
		const [anterior] = await abrirMes(-1)
		await servico.confirmarValor(usuario, anterior, 190, anterior.data)
		await abrirMes(0)
		await servico.excluir(usuario, (await servico.consultar(usuario))[0])
		assert.deepEqual(ids(R), [])
		assert.deepEqual(ids(T), [`luz_${am(-1)}`])
	})

	it('pausada não gera lançamentos', async () => {
		await servico.salvar(rec(), usuario)
		await servico.alterarAtiva(usuario, (await servico.consultar(usuario))[0], false)
		await abrirMes(0)
		assert.deepEqual(ids(T), [])
	})
})
