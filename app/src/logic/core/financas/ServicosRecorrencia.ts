import Colecao from '../../firebase/db/Colecao'
import Id from '../comum/Id'
import Data from '../../utils/Data'
import Usuario from '../usuario/Usuario'
import Transacao, { ehPrevista } from './Transacao'
import ServicosTransacao from './ServicosTransacao'
import Recorrencia, {
	dividirRecorrencia,
	gerarLancamento,
	lancamentosFaltando,
	mesAnterior,
	mesDeAnoMes,
	mesFuturo,
	recorrenciaDaTransacao,
} from './Recorrencia'

// "este" = só este mês; "proximos" = este e os próximos meses
export type Escopo = 'este' | 'proximos'

export interface OpcoesRepetir {
	diaDoMes: number
	valorVariavel: boolean
	fim: string | null
}

// Mês do lançamento pelo id fixo ({recorrenciaId}_{AAAA-MM}), mesmo que a data tenha sido mudada
function mesDoLancamento(t: Transacao): Date {
	const sufixo = t.id?.match(/_(\d{4}-\d{2})$/)?.[1]
	return sufixo ? mesDeAnoMes(sufixo) : Data.primeiroDiaMes(new Date(t.data))
}

export default class ServicosRecorrencia {
	private _colecao = new Colecao()
	private _transacoes = new ServicosTransacao()

	private _caminho(usuario: Usuario) {
		return `financas/${usuario.email}/recorrencias`
	}

	async consultar(usuario: Usuario): Promise<Recorrencia[]> {
		return (await this._colecao.consultar(this._caminho(usuario))) ?? []
	}

	async salvar(r: Recorrencia, usuario: Usuario): Promise<Recorrencia> {
		return this._colecao.salvar(this._caminho(usuario), r)
	}

	// Cria os lançamentos do mês que ainda não existem. Meses futuros não são gravados.
	// Antes de criar, confere pelo id se o lançamento já existe (por exemplo, com a data
	// mudada para outro mês, ou criado por outro aparelho), para nunca duplicar.
	async garantirLancamentosDoMes(
		usuario: Usuario,
		mes: Date,
		recorrencias: Recorrencia[],
		transacoesDoMes: Transacao[],
	): Promise<Transacao[]> {
		if (mesFuturo(mes)) return []
		const candidatos = lancamentosFaltando(recorrencias, transacoesDoMes, mes)
		if (!candidatos.length) return []

		const existentes = await Promise.all(
			candidatos.map((t) => this._transacoes.consultarPorId(usuario, t.id!)),
		)
		const novos = candidatos.filter((_, i) => !existentes[i])
		if (!novos.length) return []
		await this._transacoes.salvarVarias(novos, usuario)
		// Só os que caem neste mês entram na lista do mês
		return novos
	}

	// Lançamento novo com "Repetir todo mês": cria a conta fixa e o lançamento do mês
	// (se o mês não for futuro)
	async criarDeTransacao(usuario: Usuario, t: Transacao, opcoes: OpcoesRepetir) {
		const r = await this.salvar(recorrenciaDaTransacao(t, opcoes), usuario)
		const mes = Data.primeiroDiaMes(new Date(t.data))
		if (!mesFuturo(mes)) {
			await this._transacoes.salvar(gerarLancamento(r, mes), usuario)
		}
		return r
	}

	// Salva um lançamento de conta fixa. Salvar pelo formulário confirma o valor.
	async salvarLancamento(
		usuario: Usuario,
		t: Transacao,
		escopo: Escopo,
		recorrencias: Recorrencia[],
	) {
		const confirmado: Transacao = { ...t, situacao: 'confirmada' }
		const r = recorrencias.find((rec) => rec.id === t.recorrenciaId)
		if (escopo === 'este' || !r?.id) {
			await this._transacoes.salvar(confirmado, usuario)
			return
		}

		const mes = mesDoLancamento(t)
		const data = new Date(t.data)
		const { antiga, nova } = dividirRecorrencia(r, mes, {
			tipo: t.tipo,
			categoria: t.categoria,
			descricao: t.descricao,
			valor: t.valor,
			diaDoMes: data.getDate(),
		})
		if (antiga) await this.salvar(antiga, usuario)
		await this.salvar(nova, usuario)

		// Este mês: o lançamento passa a ser da recorrência nova (mesmo id se ela não mudou)
		const atual: Transacao = {
			...confirmado,
			id: Id.recorrencia(nova.id!, mes),
			recorrenciaId: nova.id,
		}
		const lancamentos = await this._transacoes.consultarPorRecorrencia(usuario, r.id)
		const am = Data.anoMes(mes)
		const seguintes = lancamentos.filter(
			(l) => l.id !== t.id && Data.anoMes(mesDoLancamento(l)) > am,
		)
		const { excluir, gravar } = this._religar(seguintes, nova)
		if (t.id && t.id !== atual.id) excluir.push(t)
		await this._transacoes.excluirVarias(excluir, usuario)
		await this._transacoes.salvarVarias([atual, ...gravar], usuario)
	}

	// Lançamentos dos meses seguintes ao mudar a recorrência: os previstos são apagados
	// (voltam com o valor novo ao abrir o mês); os confirmados ficam como estão, só
	// passam a apontar para a recorrência nova (com o id dela, para não duplicar)
	private _religar(seguintes: Transacao[], nova: Recorrencia) {
		const excluir: Transacao[] = []
		const gravar: Transacao[] = []
		for (const l of seguintes) {
			if (ehPrevista(l)) {
				excluir.push(l)
				continue
			}
			const id = Id.recorrencia(nova.id!, mesDoLancamento(l))
			if (id === l.id) continue
			excluir.push(l)
			gravar.push({ ...l, id, recorrenciaId: nova.id })
		}
		return { excluir, gravar }
	}

	async excluirLancamento(
		usuario: Usuario,
		t: Transacao,
		escopo: Escopo,
		recorrencias: Recorrencia[],
	) {
		const r = recorrencias.find((rec) => rec.id === t.recorrenciaId)
		if (!r?.id) {
			await this._transacoes.excluir(t, usuario)
			return
		}

		const mes = mesDoLancamento(t)
		const am = Data.anoMes(mes)
		if (escopo === 'este') {
			// Marca o mês como pulado, para o lançamento não voltar ao abrir o mês
			const pulados = [...new Set([...(r.mesesPulados ?? []), am])]
			await this.salvar({ ...r, mesesPulados: pulados }, usuario)
			await this._transacoes.excluir(t, usuario)
			return
		}

		// Este e os próximos: a conta fixa termina no mês anterior
		if (am <= r.inicio) {
			await this._colecao.excluir(this._caminho(usuario), r.id)
		} else {
			await this.salvar({ ...r, fim: mesAnterior(am) }, usuario)
		}
		const lancamentos = await this._transacoes.consultarPorRecorrencia(usuario, r.id)
		const apagar = lancamentos.filter((l) => Data.anoMes(mesDoLancamento(l)) >= am)
		if (t.id && !apagar.some((l) => l.id === t.id)) apagar.push(t)
		await this._transacoes.excluirVarias(apagar, usuario)
	}

	async confirmarValor(usuario: Usuario, t: Transacao, valor: number, data: Date) {
		await this._transacoes.salvar({ ...t, valor, data, situacao: 'confirmada' }, usuario)
	}

	// Edição pela tela Contas fixas. Se o lançamento deste mês já existe, ele fica como
	// está e a mudança vale do próximo mês em diante. Devolve o mês em que passa a valer.
	async editar(usuario: Usuario, r: Recorrencia, mudancas: Partial<Recorrencia>): Promise<string> {
		const hoje = Data.primeiroDiaMes(new Date())
		const idDeste = Id.recorrencia(r.id!, hoje)
		const jaLancado = await this._transacoes.consultarPorId(usuario, idDeste)
		const mes = jaLancado ? Data.somarMeses(hoje, 1) : hoje
		const { antiga, nova } = dividirRecorrencia(r, mes, mudancas)
		if (antiga) await this.salvar(antiga, usuario)
		await this.salvar(nova, usuario)
		return nova.inicio > Data.anoMes(mes) ? nova.inicio : Data.anoMes(mes)
	}

	async alterarAtiva(usuario: Usuario, r: Recorrencia, ativa: boolean) {
		await this.salvar({ ...r, ativa }, usuario)
	}

	// Apaga a conta fixa. Os lançamentos já confirmados ficam no histórico;
	// os previstos (valor ainda não confirmado) são apagados junto.
	async excluir(usuario: Usuario, r: Recorrencia) {
		if (!r.id) return
		const lancamentos = await this._transacoes.consultarPorRecorrencia(usuario, r.id)
		await this._transacoes.excluirVarias(lancamentos.filter(ehPrevista), usuario)
		await this._colecao.excluir(this._caminho(usuario), r.id)
	}
}
