import Id from '../comum/Id'
import Data from '../../utils/Data'
import Transacao from './Transacao'
import { TipoTransacao } from './TipoTransacao'

// Conta fixa: cadastrada uma vez, gera um lançamento por mês.
// Fica em financas/{email}/recorrencias/{id}.
export default interface Recorrencia {
	id?: string
	tipo: TipoTransacao
	categoria: string
	descricao: string
	// Valor padrão de cada mês
	valor: number
	// true: o lançamento nasce "previsto" e pede confirmação do valor real
	valorVariavel: boolean
	// 1 a 31 (dia 31 em mês curto vira o último dia do mês)
	diaDoMes: number
	// "AAAA-MM": primeiro mês em que aparece
	inicio: string
	// "AAAA-MM": último mês; null = sem data para acabar
	fim: string | null
	// false = pausada (não gera novos lançamentos, mantém o histórico)
	ativa: boolean
	// "AAAA-MM" dos meses em que o lançamento foi excluído só naquele mês
	mesesPulados?: string[]
}

export function recorrenciaValida(r: Recorrencia): boolean {
	return (
		!!r.categoria &&
		!!r.descricao &&
		Number.isFinite(r.valor) &&
		r.valor > 0 &&
		Number.isInteger(r.diaDoMes) &&
		r.diaDoMes >= 1 &&
		r.diaDoMes <= 31 &&
		/^\d{4}-\d{2}$/.test(r.inicio) &&
		(!r.fim || r.fim >= r.inicio)
	)
}

// "AAAA-MM" → Date no dia 1 desse mês
export function mesDeAnoMes(anoMes: string): Date {
	const [ano, mes] = anoMes.split('-').map(Number)
	return new Date(ano, mes - 1, 1)
}

// A recorrência dentro do período (início/fim), sem olhar se está ativa ou pulada
export function dentroDoPeriodo(r: Recorrencia, mes: Date): boolean {
	const am = Data.anoMes(mes)
	return am >= r.inicio && (!r.fim || am <= r.fim)
}

// Gera lançamento neste mês? (ativa, dentro do período e não pulada)
export function geraNoMes(r: Recorrencia, mes: Date): boolean {
	return (
		r.ativa && dentroDoPeriodo(r, mes) && !(r.mesesPulados ?? []).includes(Data.anoMes(mes))
	)
}

// Lançamento da recorrência no mês, com id fixo {recorrenciaId}_{AAAA-MM}
export function gerarLancamento(r: Recorrencia, mes: Date): Transacao {
	if (!r.id) throw new Error('A recorrência precisa de id para gerar lançamentos')
	return {
		id: Id.recorrencia(r.id, mes),
		recorrenciaId: r.id,
		tipo: r.tipo,
		categoria: r.categoria,
		descricao: r.descricao,
		valor: r.valor,
		data: Data.diaNoMes(mes.getFullYear(), mes.getMonth(), r.diaDoMes),
		situacao: r.valorVariavel ? 'prevista' : 'confirmada',
	}
}

// Lançamentos que ainda faltam no mês (os que já existem, pelo id fixo, ficam de fora)
export function lancamentosFaltando(
	recorrencias: Recorrencia[],
	transacoesDoMes: Transacao[],
	mes: Date,
): Transacao[] {
	const existentes = new Set(transacoesDoMes.map((t) => t.id))
	return recorrencias
		.filter((r) => r.id && geraNoMes(r, mes))
		.map((r) => gerarLancamento(r, mes))
		.filter((t) => !existentes.has(t.id))
}

// Mês posterior ao mês atual (o de hoje)? Esses não são gravados: só projeção.
export function mesFuturo(mes: Date, hoje: Date = new Date()): boolean {
	return Data.anoMes(mes) > Data.anoMes(hoje)
}

export function mesAnterior(anoMes: string): string {
	return Data.anoMes(Data.somarMeses(mesDeAnoMes(anoMes), -1))
}

export interface DivisaoRecorrencia {
	// A recorrência que já existia, encerrada no mês anterior (null = foi atualizada no lugar)
	antiga: Recorrencia | null
	// A recorrência que vale de `mes` em diante
	nova: Recorrencia
}

// "Este e os próximos": a recorrência antiga termina no mês anterior e uma nova começa
// em `mes` com as mudanças, para o histórico não mudar. Se `mes` é o início (ou antes),
// não há histórico: atualiza a própria recorrência.
export function dividirRecorrencia(
	r: Recorrencia,
	mes: Date,
	mudancas: Partial<Recorrencia>,
	novoId: string = Id.novo(),
): DivisaoRecorrencia {
	const am = Data.anoMes(mes)
	if (am <= r.inicio) {
		return { antiga: null, nova: { ...r, ...mudancas, id: r.id } }
	}
	return {
		antiga: { ...r, fim: mesAnterior(am) },
		nova: {
			...r,
			...mudancas,
			id: novoId,
			inicio: am,
			fim: mudancas.fim !== undefined ? mudancas.fim : r.fim,
			mesesPulados: (r.mesesPulados ?? []).filter((m) => m >= am),
		},
	}
}

// Recorrência a partir de um lançamento novo com "Repetir todo mês"
export function recorrenciaDaTransacao(
	t: Transacao,
	opcoes: { diaDoMes: number; valorVariavel: boolean; fim: string | null },
	id: string = Id.novo(),
): Recorrencia {
	const data = new Date(t.data)
	return {
		id,
		tipo: t.tipo,
		categoria: t.categoria,
		descricao: t.descricao,
		valor: t.valor,
		valorVariavel: opcoes.valorVariavel,
		diaDoMes: opcoes.diaDoMes,
		inicio: Data.anoMes(data),
		fim: opcoes.fim,
		ativa: true,
		mesesPulados: [],
	}
}

export interface TotaisRecorrencias {
	despesasFixas: number
	despesasVariaveis: number
	receitas: number
	guardado: number
	qtdReceitas: number
	qtdGuardado: number
}

// Totais por mês das contas fixas ativas (para a tela Contas fixas)
export function totaisRecorrencias(recorrencias: Recorrencia[], mes: Date): TotaisRecorrencias {
	const totais: TotaisRecorrencias = {
		despesasFixas: 0,
		despesasVariaveis: 0,
		receitas: 0,
		guardado: 0,
		qtdReceitas: 0,
		qtdGuardado: 0,
	}
	for (const r of recorrencias) {
		if (!r.ativa || (r.fim && r.fim < Data.anoMes(mes))) continue
		if (r.tipo === TipoTransacao.DESPESA) {
			if (r.valorVariavel) totais.despesasVariaveis += r.valor
			else totais.despesasFixas += r.valor
		} else if (r.tipo === TipoTransacao.RECEITA) {
			totais.receitas += r.valor
			totais.qtdReceitas++
		} else {
			totais.guardado += r.valor
			totais.qtdGuardado++
		}
	}
	return totais
}
