import { describe, it, beforeEach } from 'node:test'
import assert from 'node:assert/strict'
import {
	alterarDaquiEmDiante,
	dividirEmParcelas,
	gerarParcelas,
	quantidadeValida,
	resumirParcelasFuturas,
} from '../app/src/logic/core/financas/Parcelas'
import ServicosParcelas from '../app/src/logic/core/financas/ServicosParcelas'
import Transacao from '../app/src/logic/core/financas/Transacao'
import { TipoTransacao } from '../app/src/logic/core/financas/TipoTransacao'
import { calcularResumo } from '../app/src/logic/core/financas/ResumoMensal'
import Usuario from '../app/src/logic/core/usuario/Usuario'
import ColecaoFalsa from './apoio/ColecaoFalsa'

const dia = (d: Date) => `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`
const somaEmCentavos = (parcelas: number[]) =>
	parcelas.reduce((total, p) => total + Math.round(p * 100), 0)

function base(extra: Partial<Transacao> = {}): Transacao {
	return {
		tipo: TipoTransacao.DESPESA,
		categoria: 'Tecnologia',
		descricao: 'Computador',
		valor: 300,
		data: new Date(2026, 10, 19),
		...extra,
	}
}

describe('dividirEmParcelas', () => {
	it('R$ 100 em 3x = 33,33 + 33,33 + 33,34', () => {
		assert.deepEqual(dividirEmParcelas(100, 3), [33.33, 33.33, 33.34])
	})

	it('a soma das parcelas é sempre o total, centavo a centavo', () => {
		for (const total of [0.01, 0.1, 1, 10, 99.99, 100, 1234.56, 3000, 7777.77]) {
			for (const qtd of [1, 2, 3, 6, 7, 10, 12, 24, 48]) {
				const parcelas = dividirEmParcelas(total, qtd)
				assert.equal(parcelas.length, qtd)
				assert.equal(somaEmCentavos(parcelas), Math.round(total * 100), `${total} em ${qtd}x`)
			}
		}
	})

	it('rejeita quantidade ou valor inválidos', () => {
		assert.throws(() => dividirEmParcelas(100, 0))
		assert.throws(() => dividirEmParcelas(100, 2.5))
		assert.throws(() => dividirEmParcelas(-1, 2))
		assert.throws(() => dividirEmParcelas(NaN, 2))
	})
})

describe('gerarParcelas', () => {
	it('10x: ids fixos, número da parcela e mesmo dia nos meses seguintes', () => {
		const p = gerarParcelas(base(), 10, 1, 'nb')
		assert.equal(p.length, 10)
		assert.deepEqual(
			p.map((t) => t.id),
			Array.from({ length: 10 }, (_, i) => `nb_${i + 1}`),
		)
		assert.ok(p.every((t) => t.compraId === 'nb' && t.totalParcelas === 10 && t.valor === 300))
		assert.equal(dia(p[0].data), '2026-11-19')
		assert.equal(dia(p[9].data), '2027-8-19')
	})

	it('dia 31 vira o último dia do mês sem perder o 31 nos seguintes', () => {
		const p = gerarParcelas(base({ data: new Date(2027, 0, 31) }), 4, 1, 'c')
		assert.deepEqual(
			p.map((t) => dia(t.data)),
			['2027-1-31', '2027-2-28', '2027-3-31', '2027-4-30'],
		)
	})

	it('"já paguei algumas parcelas": começa da parcela informada, na data escolhida', () => {
		const p = gerarParcelas(base({ data: new Date(2026, 10, 5) }), 10, 3, 'nb')
		assert.equal(p.length, 8)
		assert.equal(p[0].parcela, 3)
		assert.equal(p[0].id, 'nb_3')
		assert.equal(dia(p[0].data), '2026-11-5')
		assert.equal(dia(p[7].data), '2027-6-5')
	})

	it('receita também pode ser parcelada', () => {
		const p = gerarParcelas(base({ tipo: TipoTransacao.RECEITA, valor: 400 }), 3, 1, 'venda')
		assert.ok(p.every((t) => t.tipo === TipoTransacao.RECEITA))
	})

	it('limites de 2 a 48 parcelas', () => {
		assert.ok(quantidadeValida(2) && quantidadeValida(48))
		assert.equal(quantidadeValida(1), false)
		assert.equal(quantidadeValida(49), false)
		assert.throws(() => gerarParcelas(base(), 1))
		assert.throws(() => gerarParcelas(base(), 10, 11))
		assert.throws(() => gerarParcelas(base(), 10, 0))
	})

	it('parcelas entram no saldo do mês em que caem', () => {
		const [primeira] = gerarParcelas(base(), 10, 1, 'nb')
		assert.equal(calcularResumo([primeira]).despesas, 300)
	})
})

describe('alterarDaquiEmDiante', () => {
	const todas = gerarParcelas(base({ data: new Date(2026, 8, 5) }), 10, 1, 'nb')
	const terceira = todas[2]

	it('valor novo da parcela atual em diante; as anteriores não mudam', () => {
		const { gravar, excluir } = alterarDaquiEmDiante(todas, { ...terceira, valor: 350 })
		assert.deepEqual(excluir, [])
		assert.deepEqual(
			gravar.map((t) => [t.parcela, t.valor]),
			[3, 4, 5, 6, 7, 8, 9, 10].map((n) => [n, 350]),
		)
	})

	it('aumentar para 12x acrescenta as parcelas 11 e 12 no fim', () => {
		const { gravar, excluir } = alterarDaquiEmDiante(todas, terceira, 12)
		assert.deepEqual(excluir, [])
		const novas = gravar.filter((t) => t.parcela! > 10)
		assert.deepEqual(
			novas.map((t) => [t.id, dia(t.data)]),
			[
				['nb_11', '2027-7-5'],
				['nb_12', '2027-8-5'],
			],
		)
		// as anteriores só mudam o total (para o selo 1/12, 2/12)
		const anteriores = gravar.filter((t) => t.parcela! < 3)
		assert.deepEqual(
			anteriores.map((t) => [t.parcela, t.totalParcelas, t.valor]),
			[
				[1, 12, 300],
				[2, 12, 300],
			],
		)
		assert.ok(gravar.every((t) => t.totalParcelas === 12))
	})

	it('diminuir para 6x apaga as últimas', () => {
		const { gravar, excluir } = alterarDaquiEmDiante(todas, terceira, 6)
		assert.deepEqual(
			excluir.map((t) => t.parcela),
			[7, 8, 9, 10],
		)
		assert.ok(gravar.every((t) => t.parcela! <= 6 && t.totalParcelas === 6))
	})

	it('não deixa a quantidade ficar menor que a parcela atual', () => {
		assert.throws(() => alterarDaquiEmDiante(todas, terceira, 2))
	})

	it('mudar a data da parcela leva as seguintes junto', () => {
		const { gravar } = alterarDaquiEmDiante(todas, { ...terceira, data: new Date(2026, 10, 10) })
		assert.equal(dia(gravar.find((t) => t.parcela === 4)!.data), '2026-12-10')
	})
})

describe('resumirParcelasFuturas', () => {
	it('soma por mês, separa receitas e lista as compras em andamento', () => {
		const nov = new Date(2026, 10, 1)
		const notebook = gerarParcelas(base({ data: new Date(2026, 8, 5) }), 10, 1, 'nb')
		const tenis = gerarParcelas(
			base({ descricao: 'Calçados', valor: 133.3, data: new Date(2026, 9, 8) }),
			3,
			1,
			'tn',
		)
		const venda = gerarParcelas(
			base({ tipo: TipoTransacao.RECEITA, valor: 400, data: new Date(2026, 9, 10) }),
			3,
			1,
			'vd',
		)
		const outra: Transacao = base({ data: new Date(2026, 11, 25), valor: 50 })
		const fimNov = new Date(2026, 10, 30, 23, 59, 59)
		const futuras = [...notebook, ...tenis, ...venda, outra].filter(
			(t) => new Date(t.data) > fimNov,
		)
		const r = resumirParcelasFuturas(futuras, nov)
		assert.equal(r.meses.length, 6)
		assert.equal(r.meses[0].anoMes, '2026-12')
		assert.equal(r.meses[0].despesas, 433.3)
		assert.equal(r.meses[0].receitas, 400)
		assert.equal(r.meses[1].despesas, 300)
		assert.equal(r.totalDespesas, 433.3 + 300 * 5)
		const nb = r.compras.find((c) => c.compraId === 'nb')!
		assert.equal(nb.restantes, 7)
		assert.equal(nb.valorRestante, 2100)
		assert.equal(nb.totalParcelas - nb.restantes, 3)
		assert.equal(dia(nb.ultimaData), '2027-6-5')
		// compra que termina antes vem primeiro
		assert.equal(r.compras[0].compraId, 'tn')
	})
})

describe('ServicosParcelas (banco em memória)', () => {
	const usuario: Usuario = { id: 'u', nome: 'Teste', email: 't@t.com', imagemUrl: null }
	const T = 'financas/t@t.com/transacoes'
	let banco: ColecaoFalsa
	let servico: ServicosParcelas

	beforeEach(() => {
		banco = new ColecaoFalsa()
		servico = new ServicosParcelas()
		;(servico as any)._colecao = banco
		;(servico as any)._transacoes._colecao = banco
	})

	async function criar10x() {
		const parcelas = await servico.criar(usuario, base({ data: new Date(2026, 8, 5) }), {
			quantidade: 10,
			parcelaAtual: 1,
		})
		return parcelas
	}

	it('cria todas as parcelas de uma vez', async () => {
		const p = await criar10x()
		assert.equal(banco.ids(T).length, 10)
		assert.equal((await servico.consultarCompra(usuario, p[0].compraId!)).length, 10)
	})

	it('salvar só esta parcela', async () => {
		const p = await criar10x()
		await servico.salvar(usuario, { ...p[2], valor: 999 }, 'este')
		const todas = await servico.consultarCompra(usuario, p[0].compraId!)
		assert.deepEqual(
			todas.filter((t) => t.valor === 999).map((t) => t.parcela),
			[3],
		)
	})

	it('esta e as próximas com 12x', async () => {
		const p = await criar10x()
		await servico.salvar(usuario, { ...p[2], valor: 320 }, 'proximos', 12)
		const todas = await servico.consultarCompra(usuario, p[0].compraId!)
		assert.equal(todas.length, 12)
		assert.deepEqual(
			todas.map((t) => t.valor),
			[300, 300, ...Array(10).fill(320)],
		)
		assert.ok(todas.every((t) => t.totalParcelas === 12))
	})

	it('excluir esta, esta e as próximas, ou a compra inteira', async () => {
		const p = await criar10x()
		await servico.excluir(usuario, p[1], 'este')
		assert.equal(banco.ids(T).length, 9)
		await servico.excluir(usuario, p[5], 'proximos')
		assert.deepEqual(
			(await servico.consultarCompra(usuario, p[0].compraId!)).map((t) => t.parcela),
			[1, 3, 4, 5],
		)
		await servico.excluir(usuario, p[0], 'todas')
		assert.deepEqual(banco.ids(T), [])
	})

	it('consulta só o que vence depois do mês', async () => {
		await criar10x()
		const depois = await servico.consultarDepoisDoMes(usuario, new Date(2026, 10, 1))
		assert.equal(depois.length, 7)
	})
})
