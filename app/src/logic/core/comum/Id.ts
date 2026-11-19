import { v4 as uuid } from 'uuid'
import Data from '../../utils/Data'

export default class Id {
	static novo(): string {
		return uuid()
	}

	// Lançamento de uma conta fixa num mês: {recorrenciaId}_{AAAA-MM}.
	// O mesmo mês sempre gera o mesmo id, então dois aparelhos abrindo o mês não duplicam.
	static recorrencia(recorrenciaId: string, mes: Date): string {
		return `${recorrenciaId}_${Data.anoMes(mes)}`
	}

	// Parcela n (a partir de 1) de uma compra parcelada: {compraId}_{n}
	static parcela(compraId: string, numero: number): string {
		return `${compraId}_${numero}`
	}
}
