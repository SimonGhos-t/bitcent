import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { calcularResumo, maisRecentesPrimeiro } from '../app/src/logic/core/financas/ResumoMensal'
import Transacao from '../app/src/logic/core/financas/Transacao'
import { TipoTransacao } from '../app/src/logic/core/financas/TipoTransacao'

let contador = 0
function transacao(tipo: TipoTransacao, valor: number, dia: number, categoria = 'Outros'): Transacao {
	contador++
	return {
		id: `t${contador}`,
		tipo,
		valor,
		categoria,
		descricao: `Transação ${contador}`,
		data: new Date(2026, 10, dia),
	}
}

describe('calcularResumo', () => {
	it('mês vazio fica zerado', () => {
		const resumo = calcularResumo([])
		assert.deepEqual(resumo, {
			receitas: 0,
			despesas: 0,
			guardado: 0,
			saldo: 0,
			qtdReceitas: 0,
			gastosPorCategoria: [],
			maioresGastos: [],
			ultimas: [],
		})
	})

	it('soma por tipo e calcula o saldo (receitas - despesas - guardado)', () => {
		const resumo = calcularResumo([
			transacao(TipoTransacao.RECEITA, 5000, 5),
			transacao(TipoTransacao.RECEITA, 300, 20),
			transacao(TipoTransacao.DESPESA, 1200, 10, 'Moradia'),
			transacao(TipoTransacao.DESPESA, 250.5, 12, 'Alimentação'),
			transacao(TipoTransacao.GUARDADO, 500, 6),
		])
		assert.equal(resumo.receitas, 5300)
		assert.equal(resumo.despesas, 1450.5)
		assert.equal(resumo.guardado, 500)
		assert.equal(resumo.saldo, 3349.5)
		assert.equal(resumo.qtdReceitas, 2)
	})

	it('agrupa só despesas por categoria, da maior para a menor', () => {
		const resumo = calcularResumo([
			transacao(TipoTransacao.DESPESA, 100, 1, 'Alimentação'),
			transacao(TipoTransacao.DESPESA, 1200, 2, 'Moradia'),
			transacao(TipoTransacao.DESPESA, 50, 3, 'Alimentação'),
			transacao(TipoTransacao.DESPESA, 30, 4, ''),
			transacao(TipoTransacao.RECEITA, 9999, 5, 'Salário'),
		])
		assert.deepEqual(resumo.gastosPorCategoria, [
			{ categoria: 'Moradia', total: 1200 },
			{ categoria: 'Alimentação', total: 150 },
			{ categoria: 'Sem categoria', total: 30 },
		])
	})

	it('maiores gastos: até 5 despesas, da maior para a menor', () => {
		const valores = [10, 70, 30, 90, 50, 20, 80]
		const resumo = calcularResumo([
			...valores.map((v, i) => transacao(TipoTransacao.DESPESA, v, i + 1)),
			transacao(TipoTransacao.RECEITA, 1000, 1),
		])
		assert.deepEqual(
			resumo.maioresGastos.map((t) => t.valor),
			[90, 80, 70, 50, 30],
		)
	})

	it('últimas: até 5 transações, da mais recente para a mais antiga', () => {
		const resumo = calcularResumo(
			[3, 15, 1, 28, 9, 22].map((dia) => transacao(TipoTransacao.DESPESA, dia, dia)),
		)
		assert.deepEqual(
			resumo.ultimas.map((t) => t.data.getDate()),
			[28, 22, 15, 9, 3],
		)
	})

	it('valor ausente conta como zero', () => {
		const resumo = calcularResumo([
			{ ...transacao(TipoTransacao.DESPESA, 0, 1), valor: undefined as any },
			transacao(TipoTransacao.DESPESA, 10, 2),
		])
		assert.equal(resumo.despesas, 10)
	})

	it('não altera a lista recebida', () => {
		const lista = [5, 1, 3].map((dia) => transacao(TipoTransacao.DESPESA, dia, dia))
		const ordemOriginal = lista.map((t) => t.id)
		calcularResumo(lista)
		assert.deepEqual(lista.map((t) => t.id), ordemOriginal)
	})
})

describe('maisRecentesPrimeiro', () => {
	it('ordena por data decrescente', () => {
		const a = transacao(TipoTransacao.DESPESA, 1, 1)
		const b = transacao(TipoTransacao.DESPESA, 1, 2)
		assert.deepEqual([a, b].sort(maisRecentesPrimeiro), [b, a])
	})
})
