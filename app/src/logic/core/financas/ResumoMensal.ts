import Transacao, { ehParcela, ehPrevista } from './Transacao'
import { TipoTransacao } from './TipoTransacao'

export interface TotalCategoria {
	categoria: string
	total: number
}

export interface ResumoMensal {
	receitas: number
	despesas: number
	// Parte das despesas que são parcelas de compras
	despesasParceladas: number
	guardado: number
	saldo: number
	qtdReceitas: number
	gastosPorCategoria: TotalCategoria[]
	maioresGastos: Transacao[]
	ultimas: Transacao[]
	// Contas de valor variável ainda não confirmadas: ficam fora de todos os totais
	previstas: Transacao[]
	totalPrevisto: number
}

const somar = (lista: Transacao[]) => lista.reduce((total, t) => total + (t.valor ?? 0), 0)

export function maisRecentesPrimeiro(a: Transacao, b: Transacao) {
	return new Date(b.data).getTime() - new Date(a.data).getTime()
}

export function calcularResumo(todas: Transacao[]): ResumoMensal {
	const previstas = todas.filter(ehPrevista)
	const transacoes = todas.filter((t) => !ehPrevista(t))
	const receitas = transacoes.filter((t) => t.tipo === TipoTransacao.RECEITA)
	const despesas = transacoes.filter((t) => t.tipo === TipoTransacao.DESPESA)
	const guardado = transacoes.filter((t) => t.tipo === TipoTransacao.GUARDADO)

	const porCategoria = despesas.reduce<Record<string, number>>((mapa, t) => {
		const chave = t.categoria || 'Sem categoria'
		mapa[chave] = (mapa[chave] ?? 0) + (t.valor ?? 0)
		return mapa
	}, {})

	const totalReceitas = somar(receitas)
	const totalDespesas = somar(despesas)
	const totalGuardado = somar(guardado)

	return {
		receitas: totalReceitas,
		despesas: totalDespesas,
		despesasParceladas: somar(despesas.filter(ehParcela)),
		guardado: totalGuardado,
		saldo: totalReceitas - totalDespesas - totalGuardado,
		qtdReceitas: receitas.length,
		gastosPorCategoria: Object.entries(porCategoria)
			.map(([categoria, total]) => ({ categoria, total }))
			.sort((a, b) => b.total - a.total),
		maioresGastos: [...despesas].sort((a, b) => b.valor - a.valor).slice(0, 5),
		ultimas: [...transacoes].sort(maisRecentesPrimeiro).slice(0, 5),
		previstas,
		totalPrevisto: somar(previstas),
	}
}
