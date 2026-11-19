import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import Recorrencia, {
	dentroDoPeriodo,
	dividirRecorrencia,
	geraNoMes,
	gerarLancamento,
	lancamentosFaltando,
	mesAnterior,
	mesDeAnoMes,
	mesFuturo,
	recorrenciaDaTransacao,
	recorrenciaValida,
	totaisRecorrencias,
} from '../app/src/logic/core/financas/Recorrencia'
import { TipoTransacao } from '../app/src/logic/core/financas/TipoTransacao'

const dia = (d: Date) => `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`
const nov = new Date(2026, 10, 1)
const dez = new Date(2026, 11, 1)

function rec(extra: Partial<Recorrencia> = {}): Recorrencia {
	return {
		id: 'aluguel',
		tipo: TipoTransacao.DESPESA,
		categoria: 'Moradia',
		descricao: 'Aluguel',
		valor: 1200,
		valorVariavel: false,
		diaDoMes: 10,
		inicio: '2026-11',
		fim: null,
		ativa: true,
		mesesPulados: [],
		...extra,
	}
}

describe('período da recorrência', () => {
	it('vale do início em diante, sem fim', () => {
		assert.equal(dentroDoPeriodo(rec(), new Date(2026, 9, 31)), false)
		assert.equal(dentroDoPeriodo(rec(), new Date(2026, 10, 30)), true)
		assert.equal(dentroDoPeriodo(rec(), new Date(2030, 0, 1)), true)
	})

	it('respeita o mês de fim (inclusive)', () => {
		const r = rec({ fim: '2026-12' })
		assert.equal(dentroDoPeriodo(r, dez), true)
		assert.equal(dentroDoPeriodo(r, new Date(2027, 0, 1)), false)
	})

	it('pausada e mês pulado não geram', () => {
		assert.equal(geraNoMes(rec({ ativa: false }), nov), false)
		assert.equal(geraNoMes(rec({ mesesPulados: ['2026-11'] }), nov), false)
		assert.equal(geraNoMes(rec({ mesesPulados: ['2026-11'] }), dez), true)
	})
})

describe('gerarLancamento', () => {
	it('id fixo, dia do mês e vínculo com a recorrência', () => {
		const t = gerarLancamento(rec(), nov)
		assert.equal(t.id, 'aluguel_2026-11')
		assert.equal(t.recorrenciaId, 'aluguel')
		assert.equal(dia(t.data), '2026-11-10')
		assert.equal(t.valor, 1200)
		assert.equal(t.situacao, 'confirmada')
	})

	it('valor variável nasce prevista, com o valor padrão', () => {
		const t = gerarLancamento(rec({ id: 'luz', valorVariavel: true, valor: 180 }), nov)
		assert.equal(t.situacao, 'prevista')
		assert.equal(t.valor, 180)
	})

	it('dia 31 vira o último dia do mês', () => {
		assert.equal(dia(gerarLancamento(rec({ diaDoMes: 31 }), nov).data), '2026-11-30')
		assert.equal(dia(gerarLancamento(rec({ diaDoMes: 31 }), new Date(2027, 1, 1)).data), '2027-2-28')
	})

	it('sem id não gera', () => {
		assert.throws(() => gerarLancamento(rec({ id: undefined }), nov))
	})
})

describe('lancamentosFaltando', () => {
	it('gera só o que não existe no mês, pelo id fixo', () => {
		const aluguel = rec()
		const luz = rec({ id: 'luz', descricao: 'Conta de Luz', valorVariavel: true })
		const pausada = rec({ id: 'academia', ativa: false })
		const futura = rec({ id: 'curso', inicio: '2027-01' })
		const jaLancado = gerarLancamento(aluguel, nov)
		const faltando = lancamentosFaltando([aluguel, luz, pausada, futura], [jaLancado], nov)
		assert.deepEqual(
			faltando.map((t) => t.id),
			['luz_2026-11'],
		)
	})

	it('chamar de novo depois de gravar não duplica', () => {
		const r = rec()
		const primeira = lancamentosFaltando([r], [], nov)
		assert.equal(primeira.length, 1)
		assert.deepEqual(lancamentosFaltando([r], primeira, nov), [])
	})
})

describe('meses', () => {
	it('mesFuturo compara com o mês de hoje', () => {
		const hoje = new Date(2026, 10, 19)
		assert.equal(mesFuturo(nov, hoje), false)
		assert.equal(mesFuturo(new Date(2026, 9, 1), hoje), false)
		assert.equal(mesFuturo(dez, hoje), true)
	})

	it('mesAnterior e mesDeAnoMes', () => {
		assert.equal(mesAnterior('2027-01'), '2026-12')
		assert.equal(mesAnterior('2026-11'), '2026-10')
		assert.equal(dia(mesDeAnoMes('2026-02')), '2026-2-1')
	})
})

describe('dividirRecorrencia (este e os próximos)', () => {
	it('encerra a antiga no mês anterior e cria a nova a partir do mês', () => {
		const r = rec({ inicio: '2026-06', mesesPulados: ['2026-08', '2027-01'] })
		const { antiga, nova } = dividirRecorrencia(r, nov, { valor: 1300 }, 'novo')
		assert.equal(antiga?.fim, '2026-10')
		assert.equal(antiga?.valor, 1200)
		assert.equal(nova.id, 'novo')
		assert.equal(nova.inicio, '2026-11')
		assert.equal(nova.valor, 1300)
		assert.equal(nova.fim, null)
		assert.deepEqual(nova.mesesPulados, ['2027-01'])
	})

	it('no mês de início, atualiza a própria recorrência', () => {
		const { antiga, nova } = dividirRecorrencia(rec(), nov, { valor: 1300 }, 'novo')
		assert.equal(antiga, null)
		assert.equal(nova.id, 'aluguel')
		assert.equal(nova.inicio, '2026-11')
		assert.equal(nova.valor, 1300)
	})

	it('a antiga e a nova não se sobrepõem', () => {
		const { antiga, nova } = dividirRecorrencia(rec({ inicio: '2026-01' }), nov, {}, 'novo')
		assert.equal(dentroDoPeriodo(antiga!, nov), false)
		assert.equal(dentroDoPeriodo(antiga!, new Date(2026, 9, 1)), true)
		assert.equal(dentroDoPeriodo(nova, nov), true)
		assert.equal(dentroDoPeriodo(nova, new Date(2026, 9, 1)), false)
	})
})

describe('recorrenciaDaTransacao', () => {
	it('começa no mês da data do primeiro lançamento', () => {
		const r = recorrenciaDaTransacao(
			{
				tipo: TipoTransacao.DESPESA,
				categoria: 'Moradia',
				descricao: 'Conta de Luz',
				valor: 180,
				data: new Date(2026, 10, 19),
			},
			{ diaDoMes: 20, valorVariavel: true, fim: null },
			'luz',
		)
		assert.equal(r.inicio, '2026-11')
		assert.equal(r.diaDoMes, 20)
		assert.equal(r.ativa, true)
		assert.ok(recorrenciaValida(r))
		assert.equal(gerarLancamento(r, nov).situacao, 'prevista')
	})
})

describe('recorrenciaValida', () => {
	it('recusa dia, valor e período inválidos', () => {
		assert.ok(recorrenciaValida(rec()))
		assert.equal(recorrenciaValida(rec({ diaDoMes: 0 })), false)
		assert.equal(recorrenciaValida(rec({ diaDoMes: 32 })), false)
		assert.equal(recorrenciaValida(rec({ valor: 0 })), false)
		assert.equal(recorrenciaValida(rec({ fim: '2026-10' })), false)
		assert.equal(recorrenciaValida(rec({ descricao: '' })), false)
	})
})

describe('totaisRecorrencias', () => {
	it('separa fixas, variáveis, receitas e guardado; ignora pausadas e encerradas', () => {
		const t = totaisRecorrencias(
			[
				rec(),
				rec({ id: 'internet', valor: 99.9 }),
				rec({ id: 'luz', valor: 180, valorVariavel: true }),
				rec({ id: 'salario', tipo: TipoTransacao.RECEITA, valor: 3500 }),
				rec({ id: 'reserva', tipo: TipoTransacao.GUARDADO, valor: 300 }),
				rec({ id: 'academia', valor: 89.9, ativa: false }),
				rec({ id: 'antiga', valor: 500, inicio: '2026-01', fim: '2026-10' }),
			],
			nov,
		)
		assert.equal(t.despesasFixas, 1299.9)
		assert.equal(t.despesasVariaveis, 180)
		assert.equal(t.receitas, 3500)
		assert.equal(t.guardado, 300)
		assert.equal(t.qtdReceitas, 1)
	})
})
