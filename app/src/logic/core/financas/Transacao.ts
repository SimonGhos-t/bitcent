import Categoria from './Categoria'
import { TipoTransacao } from './TipoTransacao'

export default interface Transacao {
	id?: string
	categoria: string
	descricao: string
	valor: number
	data: Date
	tipo: TipoTransacao
	parcelada?: boolean
}

export const transacaoVazia: Transacao = {
	categoria: '',
	descricao: '',
	valor: 0,
	data: new Date(),
	tipo: TipoTransacao.DESPESA,
}
