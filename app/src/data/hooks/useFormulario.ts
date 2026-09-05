import { Timestamp } from 'firebase/firestore'
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

	function transformarDataFiresbase(data: any): Date | null {
			if (!data) return null
	
			// Se for Timestamp do Firebase
			if (data instanceof Timestamp) {
				return data.toDate()
			}
			// Se for Date
			if (data instanceof Date) {
				return data
			}
			// Se for string ISO
			if (typeof data === 'string') {
				const partes = data.split('-')
				if (partes.length === 3) {
					const [ano, mes, dia] = partes.map(Number)
					return new Date(ano, mes - 1, dia)
				}
			}

			return null
		}

	return {
		dados,
		alterarDados: setDados,
		alterarAtributo,
		transformarDataFiresbase
	}
}
