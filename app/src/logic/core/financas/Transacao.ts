import { TipoTransacao } from './TipoTransacao'

export default interface Transacao {
	id?: string
	categoria: string
	descricao: string
	icone?: string
	valor: number
	data: Date
	tipo: TipoTransacao
	parcelada?: boolean
	// Contas fixas (v2.2): lançamento gerado por uma recorrência
	recorrenciaId?: string
	// "prevista" = valor ainda não confirmado; não entra nos totais nem no saldo
	situacao?: SituacaoTransacao
}

export type SituacaoTransacao = 'prevista' | 'confirmada'

export function ehPrevista(transacao: Transacao): boolean {
	return transacao.situacao === 'prevista'
}

// Função (e não constante) para que a data padrão seja sempre a de hoje,
// mesmo com o app aberto de um dia para o outro
export function criarTransacaoVazia(): Transacao {
	return {
		categoria: '',
		descricao: '',
		valor: 0,
		data: new Date(),
		tipo: TipoTransacao.DESPESA,
	}
}

export function transacaoValida(transacao: Transacao): boolean {
	return (
		!!transacao.categoria &&
		!!transacao.descricao &&
		Number.isFinite(transacao.valor) &&
		transacao.valor > 0 &&
		!!transacao.data
	)
}
