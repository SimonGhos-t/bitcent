// Divide um valor em parcelas com centavos exatos.
// A diferença do arredondamento vai para a última parcela:
// R$ 100 em 3x = 33,33 + 33,33 + 33,34
export function dividirEmParcelas(total: number, quantidade: number): number[] {
	if (!Number.isInteger(quantidade) || quantidade < 1) {
		throw new Error('A quantidade de parcelas deve ser um número inteiro maior que zero')
	}
	if (!Number.isFinite(total) || total < 0) {
		throw new Error('O valor total deve ser um número positivo')
	}

	// Conta em centavos para não acumular erro de ponto flutuante
	const centavos = Math.round(total * 100)
	const base = Math.floor(centavos / quantidade)
	const resto = centavos - base * quantidade

	return Array.from({ length: quantidade }, (_, i) =>
		i === quantidade - 1 ? (base + resto) / 100 : base / 100,
	)
}
