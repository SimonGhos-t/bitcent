import Usuario from '../usuario/Usuario'
import Data from '../../utils/Data'
import Colecao from '../../firebase/db/Colecao'
import Transacao from './Transacao'
import ServicosTransacao from './ServicosTransacao'
import { alterarDaquiEmDiante, gerarParcelas } from './Parcelas'

// "este" = só esta parcela; "proximos" = esta e as próximas; "todas" = a compra inteira
export type EscopoParcela = 'este' | 'proximos' | 'todas'

export interface OpcoesParcelar {
	quantidade: number
	// "Já paguei algumas parcelas": número da parcela deste lançamento
	parcelaAtual: number
}

export default class ServicosParcelas {
	private _colecao = new Colecao()
	private _transacoes = new ServicosTransacao()

	private _caminho(usuario: Usuario) {
		return `financas/${usuario.email}/transacoes`
	}

	// Todas as parcelas lançadas de uma compra, em ordem
	async consultarCompra(usuario: Usuario, compraId: string): Promise<Transacao[]> {
		const parcelas: Transacao[] = await this._colecao.consultarComFiltros(this._caminho(usuario), [
			{ atributo: 'compraId', op: '==', valor: compraId },
		])
		return parcelas.sort((a, b) => (a.parcela ?? 0) - (b.parcela ?? 0))
	}

	// Transações com data depois do fim do mês (para o card de parcelas futuras)
	async consultarDepoisDoMes(usuario: Usuario, mes: Date): Promise<Transacao[]> {
		return await this._colecao.consultarComFiltros(this._caminho(usuario), [
			{ atributo: 'data', op: '>', valor: Data.ultimoDiaMes(mes) },
		])
	}

	// Grava todas as parcelas de uma vez (todas ou nenhuma)
	async criar(usuario: Usuario, base: Transacao, opcoes: OpcoesParcelar) {
		const parcelas = gerarParcelas(base, opcoes.quantidade, opcoes.parcelaAtual)
		await this._transacoes.salvarVarias(parcelas, usuario)
		return parcelas
	}

	async salvar(
		usuario: Usuario,
		parcela: Transacao,
		escopo: EscopoParcela,
		novaQuantidade?: number,
	) {
		const mudouQuantidade =
			novaQuantidade !== undefined && novaQuantidade !== parcela.totalParcelas
		if (escopo === 'este' && !mudouQuantidade) {
			await this._transacoes.salvar(parcela, usuario)
			return
		}
		const todas = await this.consultarCompra(usuario, parcela.compraId!)
		const { gravar, excluir } = alterarDaquiEmDiante(todas, parcela, novaQuantidade)
		await this._transacoes.excluirVarias(excluir, usuario)
		await this._transacoes.salvarVarias(gravar, usuario)
	}

	async excluir(usuario: Usuario, parcela: Transacao, escopo: EscopoParcela) {
		if (escopo === 'este') {
			await this._transacoes.excluir(parcela, usuario)
			return
		}
		const todas = await this.consultarCompra(usuario, parcela.compraId!)
		const apagar =
			escopo === 'todas' ? todas : todas.filter((t) => (t.parcela ?? 0) >= parcela.parcela!)
		await this._transacoes.excluirVarias(apagar, usuario)
	}
}
