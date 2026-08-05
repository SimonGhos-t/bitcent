import { useState } from 'react'

export default function useFormulario<T = any>(dadosIniciais?: T) {
	const [dados, setDados] = useState<T>(dadosIniciais ?? ({} as T))

	function alterarAtributo(atributo: string, fn?: Function) {
		return (valorOuEvento: any) => {
			let valor = valorOuEvento?.target?.value ?? valorOuEvento

			if (fn) {
				valor = fn(valor)
			}
			setDados({ ...dados, [atributo]: valor })
		}
	}

	return {
		dados,
		alterarDados: setDados,
		alterarAtributo,
	}
}
