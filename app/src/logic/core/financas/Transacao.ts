import { TipoTransacao } from "./TipoTransacao"

export default interface Transacao {
    id?: string
    descricao: string
    valor: number
    data: Date
    tipo: TipoTransacao
    categoria?: string[]
    parcelada?: boolean
}

export const transacaoVazia: Transacao = {
    descricao: '',
    valor: 0,
    data: new Date(),
    tipo: TipoTransacao.DESPESA
}