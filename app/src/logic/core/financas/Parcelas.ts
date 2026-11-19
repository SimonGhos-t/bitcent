import Id from '../comum/Id'
import Data from '../../utils/Data'
import Transacao, { ehParcela } from './Transacao'
import { TipoTransacao } from './TipoTransacao'

export const MIN_PARCELAS = 2
export const MAX_PARCELAS = 48

// Divide um valor em parcelas com centavos exatos.
// A diferença do arredondamento vai para a última parcela:
// R$ 100 em 3x = 33,33 + 33,33 + 33,34
export function dividirEmParcelas(total: number, quantidade: number): number[] {
	if (!Number.isInteger(quantidade) || quantidade < 1) {
		throw new Error('A quantidade de parcelas deve ser um número inteiro maior que zero')
	}
	if (!Number.isFinite(total) || total < 0) {
		throw new Error('O valor total deve ser um número positivo')
	}

	// Conta em centavos para não acumular erro de ponto flutuante
	const centavos = Math.round(total * 100)
	const base = Math.floor(centavos / quantidade)
	const resto = centavos - base * quantidade

	return Array.from({ length: quantidade }, (_, i) =>
		i === quantidade - 1 ? (base + resto) / 100 : base / 100,
	)
}

export function quantidadeValida(quantidade: number): boolean {
	return Number.isInteger(quantidade) && quantidade >= MIN_PARCELAS && quantidade <= MAX_PARCELAS
}

// Data da parcela n, contando a partir de uma parcela de referência (mesmo dia nos
// meses seguintes; dia 31 em mês curto vira o último dia)
export function dataDaParcela(referencia: Date, numeroReferencia: number, n: number): Date {
	return Data.somarMeses(new Date(referencia), n - numeroReferencia)
}

// Cria as parcelas de uma compra a partir do lançamento digitado.
// `base.valor` é o valor de cada parcela; `base.data` é a data da parcela `parcelaAtual`.
// Com parcelaAtual > 1 ("já paguei algumas parcelas"), as anteriores não são lançadas.
export function gerarParcelas(
	base: Transacao,
	quantidade: number,
	parcelaAtual: number = 1,
	compraId: string = Id.novo(),
): Transacao[] {
	if (!quantidadeValida(quantidade)) {
		throw new Error(`A compra deve ter de ${MIN_PARCELAS} a ${MAX_PARCELAS} parcelas`)
	}
	if (!Number.isInteger(parcelaAtual) || parcelaAtual < 1 || parcelaAtual > quantidade) {
		throw new Error('A parcela atual deve estar entre 1 e a quantidade de parcelas')
	}
	const parcelas: Transacao[] = []
	for (let n = parcelaAtual; n <= quantidade; n++) {
		parcelas.push({
			tipo: base.tipo,
			categoria: base.categoria,
			descricao: base.descricao,
			valor: base.valor,
			id: Id.parcela(compraId, n),
			compraId,
			parcela: n,
			totalParcelas: quantidade,
			data: dataDaParcela(base.data, parcelaAtual, n),
		})
	}
	return parcelas
}

export interface MudancaParcelas {
	gravar: Transacao[]
	excluir: Transacao[]
}

// "Esta e as próximas": a parcela editada e as seguintes passam a ter os valores dela
// (tipo, categoria, valor) e seguem a data dela mês a mês. Mudar a quantidade acrescenta
// parcelas no fim ou apaga as últimas. As anteriores só têm o total de parcelas atualizado.
export function alterarDaquiEmDiante(
	todas: Transacao[],
	editada: Transacao,
	novaQuantidade: number = editada.totalParcelas!,
): MudancaParcelas {
	const atual = editada.parcela!
	if (!quantidadeValida(novaQuantidade) || novaQuantidade < atual) {
		throw new Error('A quantidade não pode ser menor que o número desta parcela')
	}
	const compraId = editada.compraId!
	const porNumero = new Map(todas.map((t) => [t.parcela!, t]))
	const gravar: Transacao[] = []
	const excluir: Transacao[] = []

	for (const t of todas) {
		const n = t.parcela!
		if (n > novaQuantidade) {
			excluir.push(t)
		} else if (n < atual) {
			if (t.totalParcelas !== novaQuantidade) gravar.push({ ...t, totalParcelas: novaQuantidade })
		}
	}
	for (let n = atual; n <= novaQuantidade; n++) {
		const existente = porNumero.get(n)
		gravar.push({
			...(existente ?? {}),
			tipo: editada.tipo,
			categoria: editada.categoria,
			descricao: editada.descricao,
			valor: editada.valor,
			id: existente?.id ?? Id.parcela(compraId, n),
			compraId,
			parcela: n,
			totalParcelas: novaQuantidade,
			data: n === atual ? editada.data : dataDaParcela(editada.data, atual, n),
		})
	}
	return { gravar, excluir }
}

export interface MesParcelas {
	anoMes: string
	mes: Date
	despesas: number
	receitas: number
}

export interface CompraEmAndamento {
	compraId: string
	tipo: TipoTransacao
	categoria: string
	descricao: string
	valorParcela: number
	totalParcelas: number
	// Parcelas que vencem depois do mês de referência
	restantes: number
	valorRestante: number
	ultimaData: Date
}

export interface ResumoParcelasFuturas {
	meses: MesParcelas[]
	totalDespesas: number
	totalReceitas: number
	compras: CompraEmAndamento[]
}

// Parcelas dos próximos `quantosMeses` meses depois de `mes`, e as compras que ainda têm
// parcelas por vencer. Recebe as transações com data depois do fim de `mes`.
export function resumirParcelasFuturas(
	futuras: Transacao[],
	mes: Date,
	quantosMeses: number = 6,
): ResumoParcelasFuturas {
	const parcelas = futuras.filter(ehParcela)
	const meses: MesParcelas[] = Array.from({ length: quantosMeses }, (_, i) => {
		const m = Data.somarMeses(Data.primeiroDiaMes(mes), i + 1)
		return { anoMes: Data.anoMes(m), mes: m, despesas: 0, receitas: 0 }
	})
	const porAnoMes = new Map(meses.map((m) => [m.anoMes, m]))
	const compras = new Map<string, CompraEmAndamento>()

	for (const t of parcelas) {
		const data = new Date(t.data)
		const m = porAnoMes.get(Data.anoMes(data))
		if (m) {
			if (t.tipo === TipoTransacao.DESPESA) m.despesas += t.valor
			else if (t.tipo === TipoTransacao.RECEITA) m.receitas += t.valor
		}
		const c = compras.get(t.compraId!)
		if (!c) {
			compras.set(t.compraId!, {
				compraId: t.compraId!,
				tipo: t.tipo,
				categoria: t.categoria,
				descricao: t.descricao,
				valorParcela: t.valor,
				totalParcelas: t.totalParcelas!,
				restantes: 1,
				valorRestante: t.valor,
				ultimaData: data,
			})
		} else {
			c.restantes++
			c.valorRestante += t.valor
			if (data > c.ultimaData) c.ultimaData = data
		}
	}

	const arredondar = (v: number) => Math.round(v * 100) / 100
	for (const m of meses) {
		m.despesas = arredondar(m.despesas)
		m.receitas = arredondar(m.receitas)
	}
	const lista = [...compras.values()]
		.map((c) => ({ ...c, valorRestante: arredondar(c.valorRestante) }))
		.sort((a, b) => a.ultimaData.getTime() - b.ultimaData.getTime())

	return {
		meses,
		totalDespesas: arredondar(meses.reduce((s, m) => s + m.despesas, 0)),
		totalReceitas: arredondar(meses.reduce((s, m) => s + m.receitas, 0)),
		compras: lista,
	}
}
