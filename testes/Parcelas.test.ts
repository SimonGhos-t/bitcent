import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { dividirEmParcelas } from '../app/src/logic/core/financas/Parcelas'

const somaEmCentavos = (parcelas: number[]) =>
	parcelas.reduce((total, p) => total + Math.round(p * 100), 0)

describe('dividirEmParcelas', () => {
	it('R$ 100 em 3x = 33,33 + 33,33 + 33,34', () => {
		assert.deepEqual(dividirEmParcelas(100, 3), [33.33, 33.33, 33.34])
	})

	it('divisão exata fica igual em todas', () => {
		assert.deepEqual(dividirEmParcelas(3000, 10), Array(10).fill(300))
	})

	it('1x devolve o próprio valor', () => {
		assert.deepEqual(dividirEmParcelas(59.9, 1), [59.9])
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

	it('a diferença vai só para a última parcela', () => {
		const parcelas = dividirEmParcelas(1000, 7)
		const primeiras = parcelas.slice(0, -1)
		assert.ok(primeiras.every((p) => p === primeiras[0]))
		assert.ok(parcelas[6] >= parcelas[0])
	})

	it('nenhuma parcela tem mais de 2 casas decimais', () => {
		for (const p of dividirEmParcelas(1234.56, 48)) {
			assert.equal(Math.round(p * 100) / 100, p)
		}
	})

	it('rejeita quantidade ou valor inválidos', () => {
		assert.throws(() => dividirEmParcelas(100, 0))
		assert.throws(() => dividirEmParcelas(100, 2.5))
		assert.throws(() => dividirEmParcelas(-1, 2))
		assert.throws(() => dividirEmParcelas(NaN, 2))
	})
})
