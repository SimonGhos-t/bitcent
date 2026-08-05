export default class Data {
	private static _lingua = 'pt-BR'

	static ddmmyy = {
		formatar(data: any, separador: string = '/'): string {
			if (!data) return 'Data não definida'

			let dateObj: Date

			// Tenta converter para Date
			if (data.toDate && typeof data.toDate === 'function') {
				dateObj = data.toDate()
			} else if (typeof data === 'string' || typeof data === 'number') {
				dateObj = new Date(data)
			} else if (data instanceof Date) {
				dateObj = data
			} else {
				return 'Data inválida'
			}

			if (isNaN(dateObj.getTime())) {
				return 'Data inválida'
			}

			const dia = dateObj.getDate().toString().padStart(2, '0')
			const mes = (dateObj.getMonth() + 1).toString().padStart(2, '0')
			return `${dia}${separador}${mes}${separador}${dateObj.getFullYear()}`
		},
	}

	static mmyy = {
		formatar(data: Date, lingua?: string): string {
			return data?.toLocaleDateString?.(lingua ?? Data._lingua, {
				month: 'long',
				year: 'numeric',
			} as Intl.DateTimeFormatOptions)
		},
	}

	static ddmm = {
		formatar(data: Date): string {
			return data?.toLocaleDateString?.(Data._lingua, {
				day: '2-digit',
				month: 'short',
			} as Intl.DateTimeFormatOptions)
		},
	}

	static meses() {
		return Array(12)
			.fill(0)
			.map((_, i) =>
				new Date(2000, i, 1)
					.toLocaleDateString(Data._lingua, { month: 'short' })
					.toUpperCase()
					.substring(0, 3),
			)
	}

	static primeiroDiaMes(data: Date) {
		return new Date(data.getFullYear(), data.getMonth(), 1)
	}

	static ultimoDiaMes(data: Date) {
		return new Date(data.getFullYear(), data.getMonth() + 1, 0, 23, 59, 59)
	}
}
