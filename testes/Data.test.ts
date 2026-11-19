import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import Data from '../app/src/logic/utils/Data'
import Id from '../app/src/logic/core/comum/Id'

// Compara só a data (dia/mês/ano), no horário local
const dia = (d: Date) => `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`

describe('Data.ultimoDiaMes', () => {
	it('último dia de meses com 31, 30, 29 e 28 dias, às 23:59:59', () => {
		assert.equal(dia(Data.ultimoDiaMes(new Date(2026, 0, 15))), '2026-1-31')
		assert.equal(dia(Data.ultimoDiaMes(new Date(2026, 3, 1))), '2026-4-30')
		assert.equal(dia(Data.ultimoDiaMes(new Date(2028, 1, 10))), '2028-2-29')
		assert.equal(dia(Data.ultimoDiaMes(new Date(2026, 1, 10))), '2026-2-28')
		const fim = Data.ultimoDiaMes(new Date(2026, 11, 31))
		assert.equal(dia(fim), '2026-12-31')
		assert.deepEqual([fim.getHours(), fim.getMinutes(), fim.getSeconds()], [23, 59, 59])
	})

	it('primeiro dia do mês', () => {
		assert.equal(dia(Data.primeiroDiaMes(new Date(2026, 10, 19))), '2026-11-1')
	})
})

describe('Data.diaNoMes', () => {
	it('dia 31 em mês com 30 dias (ou fevereiro) vira o último dia', () => {
		assert.equal(dia(Data.diaNoMes(2026, 3, 31)), '2026-4-30')
		assert.equal(dia(Data.diaNoMes(2026, 1, 31)), '2026-2-28')
		assert.equal(dia(Data.diaNoMes(2028, 1, 30)), '2028-2-29')
		assert.equal(dia(Data.diaNoMes(2026, 0, 31)), '2026-1-31')
	})

	it('mês acima de 11 passa para o ano seguinte', () => {
		assert.equal(dia(Data.diaNoMes(2026, 12, 10)), '2027-1-10')
		assert.equal(dia(Data.diaNoMes(2026, 13, 31)), '2027-2-28')
	})

	it('diasNoMes', () => {
		assert.equal(Data.diasNoMes(2026, 1), 28)
		assert.equal(Data.diasNoMes(2028, 1), 29)
		assert.equal(Data.diasNoMes(2026, 10), 30)
		assert.equal(Data.diasNoMes(2026, 11), 31)
	})
})

describe('Data.somarMeses', () => {
	it('mantém o dia; dia 31 ajusta sem "perder" o dia nos meses seguintes', () => {
		const compra = new Date(2026, 0, 31, 14, 30)
		const parcelas = [0, 1, 2, 3, 4].map((n) => dia(Data.somarMeses(compra, n)))
		assert.deepEqual(parcelas, ['2026-1-31', '2026-2-28', '2026-3-31', '2026-4-30', '2026-5-31'])
	})

	it('mantém o horário e não altera a data original', () => {
		const original = new Date(2026, 10, 19, 13, 39, 5)
		const depois = Data.somarMeses(original, 3)
		assert.equal(dia(depois), '2027-2-19')
		assert.deepEqual([depois.getHours(), depois.getMinutes(), depois.getSeconds()], [13, 39, 5])
		assert.equal(dia(original), '2026-11-19')
	})

	it('aceita meses negativos', () => {
		assert.equal(dia(Data.somarMeses(new Date(2026, 2, 31), -1)), '2026-2-28')
	})
})

describe('Data.anoMes e ids fixos', () => {
	it('anoMes no formato AAAA-MM', () => {
		assert.equal(Data.anoMes(new Date(2026, 11, 1)), '2026-12')
		assert.equal(Data.anoMes(new Date(2027, 0, 31, 23, 59)), '2027-01')
	})

	it('id da recorrência é o mesmo em qualquer dia do mês', () => {
		assert.equal(Id.recorrencia('abc', new Date(2026, 11, 1)), 'abc_2026-12')
		assert.equal(Id.recorrencia('abc', new Date(2026, 11, 31)), 'abc_2026-12')
	})

	it('id da parcela', () => {
		assert.equal(Id.parcela('compra1', 3), 'compra1_3')
	})
})
