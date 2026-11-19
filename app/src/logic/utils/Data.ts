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

	// "AAAA-MM" pelo horário local (ex.: 2026-12)
	static anoMes(data: Date): string {
		const mes = (data.getMonth() + 1).toString().padStart(2, '0')
		return `${data.getFullYear()}-${mes}`
	}

	// Quantos dias o mês tem (mes de 0 a 11)
	static diasNoMes(ano: number, mes: number): number {
		return new Date(ano, mes + 1, 0).getDate()
	}

	// Data no dia pedido; se o mês não tem esse dia (31 em abril, 30 em fevereiro),
	// usa o último dia do mês. Mês de 0 a 11 (pode passar de 11: vira o ano seguinte).
	static diaNoMes(ano: number, mes: number, dia: number): Date {
		const inicio = new Date(ano, mes, 1)
		const ultimo = Data.diasNoMes(inicio.getFullYear(), inicio.getMonth())
		return new Date(inicio.getFullYear(), inicio.getMonth(), Math.min(dia, ultimo))
	}

	// Mesmo dia (e horário) n meses depois, ajustando para o último dia quando preciso:
	// 31/01 + 1 mês = 28/02 (ou 29/02); 31/01 + 2 meses = 31/03
	static somarMeses(data: Date, meses: number): Date {
		const resultado = Data.diaNoMes(data.getFullYear(), data.getMonth() + meses, data.getDate())
		resultado.setHours(data.getHours(), data.getMinutes(), data.getSeconds(), data.getMilliseconds())
		return resultado
	}
}
