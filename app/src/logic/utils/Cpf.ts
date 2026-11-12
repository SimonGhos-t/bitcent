export default class Cpf {
	private static _padrao = '???.???.???-??'

	static formatar(valor: string): string {
		const nums = Cpf.desformatar(valor).split('')
		return nums
			.reduce((formatado: string, num: string) => {
				return formatado.replace('?', num)
			}, Cpf._padrao)
			.split('?')[0]
			.replace(/[-.]$/, '')
	}

	static desformatar(valor: string): string {
		return valor.replace(/[^0-9]+/g, '')
	}

	// Confere tamanho e dígitos verificadores
	static valido(valor: string): boolean {
		const cpf = Cpf.desformatar(valor ?? '')
		if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) return false
		const digito = (base: string) => {
			const soma = base
				.split('')
				.reduce((total, num, i) => total + Number(num) * (base.length + 1 - i), 0)
			const resto = (soma * 10) % 11
			return resto === 10 ? 0 : resto
		}
		return (
			digito(cpf.substring(0, 9)) === Number(cpf[9]) &&
			digito(cpf.substring(0, 10)) === Number(cpf[10])
		)
	}
}
