import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import Dinheiro from '../app/src/logic/utils/Dinheiro'

// O Intl usa espaço não separável depois do "R$"; normaliza para comparar
const semEspacoEspecial = (texto: string) => texto.replace(/\s/g, ' ')

describe('Dinheiro', () => {
	it('formata em reais', () => {
		assert.equal(semEspacoEspecial(Dinheiro.formatar(1234.56)), 'R$ 1.234,56')
		assert.equal(semEspacoEspecial(Dinheiro.formatar(0)), 'R$ 0,00')
		assert.equal(semEspacoEspecial(Dinheiro.formatar(-50)), '-R$ 50,00')
	})

	it('trata valor ausente como zero', () => {
		assert.equal(semEspacoEspecial(Dinheiro.formatar(undefined as any)), 'R$ 0,00')
		assert.equal(Dinheiro.formatarNumero(null as any), '0,00')
	})

	it('formata sem o símbolo, sempre com 2 casas', () => {
		assert.equal(Dinheiro.formatarNumero(1234.5), '1.234,50')
		assert.equal(Dinheiro.formatarNumero(0.1 + 0.2), '0,30')
	})

	it('desformata como máscara de centavos', () => {
		assert.equal(Dinheiro.desformatar('R$ 1.234,56'), 1234.56)
		assert.equal(Dinheiro.desformatar('12'), 0.12)
		assert.equal(Dinheiro.desformatar('1'), 0.01)
		assert.equal(Dinheiro.desformatar(''), 0)
		assert.equal(Dinheiro.desformatar('abc'), 0)
		assert.equal(Dinheiro.desformatar(undefined as any), 0)
	})

	it('formata e desformata de volta para o mesmo valor', () => {
		for (const valor of [0.01, 9.99, 1200, 3000.33, 987654.32]) {
			assert.equal(Dinheiro.desformatar(Dinheiro.formatar(valor)), valor)
		}
	})

	it('decimal usa vírgula e 2 casas', () => {
		assert.equal(Dinheiro.decimal(10), '10,00')
		assert.equal(Dinheiro.decimal(3.456), '3,46')
	})
})
