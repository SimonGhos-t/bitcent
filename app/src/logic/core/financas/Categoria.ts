import { TipoTransacao } from "./TipoTransacao"

export default interface Categoria {
    nome: string
    descricao: string[]
    tipo: TipoTransacao
    icone?: any
}