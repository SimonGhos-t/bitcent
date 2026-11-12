export default class Dinheiro {
	private static _lingua = 'pt-BR'
	private static _moeda = 'BRL'

	static formatar(num: number): string {
		return (num ?? 0).toLocaleString(Dinheiro._lingua, {
			style: 'currency',
			currency: Dinheiro._moeda,
		})
	}

	static desformatar(valor: string): number {
		// Máscara de centavos: os dígitos digitados são lidos da direita para a esquerda
		const numeros = (valor ?? '').replace(/[^0-9]+/g, '')
		if (!numeros) return 0
		return Number(numeros) / 100
	}

	static decimal(valor: number) {
		return valor.toFixed(2).replace('.', ',')
	}
}
