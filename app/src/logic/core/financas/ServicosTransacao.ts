import Colecao from '../../firebase/db/Colecao'
import Usuario from '../usuario/Usuario'
import Transacao from './Transacao'
import Data from '../../utils/Data'

export default class ServicosTransacao {
	private _colecao = new Colecao()

	private _caminho(usuario: Usuario) {
		return `financas/${usuario.email}/transacoes`
	}

	async salvar(transacao: Transacao, usuario: Usuario) {
		return this._colecao.salvar(this._caminho(usuario), transacao)
	}

	async consultar(usuario: Usuario) {
		return await this._colecao.consultar(this._caminho(usuario), 'data', 'asc')
	}

	async consultarPorId(usuario: Usuario, id: string): Promise<Transacao | null> {
		return await this._colecao.consultarPorId(this._caminho(usuario), id)
	}

	// Todos os lançamentos gerados por uma conta fixa
	async consultarPorRecorrencia(usuario: Usuario, recorrenciaId: string): Promise<Transacao[]> {
		return await this._colecao.consultarComFiltros(this._caminho(usuario), [
			{ atributo: 'recorrenciaId', op: '==', valor: recorrenciaId },
		])
	}

	// Várias transações de uma vez (todas ou nenhuma), ex.: parcelas de uma compra
	async salvarVarias(transacoes: Transacao[], usuario: Usuario): Promise<Transacao[]> {
		return this._colecao.salvarVarios(this._caminho(usuario), transacoes)
	}

	async excluirVarias(transacoes: Transacao[], usuario: Usuario): Promise<number> {
		const ids = transacoes.map((t) => t.id).filter((id): id is string => !!id)
		return this._colecao.excluirVarios(this._caminho(usuario), ids)
	}

	async excluir(transacao: Transacao, usuario: Usuario) {
		return this._colecao.excluir(this._caminho(usuario), transacao.id)
	}

	async consultarPorMes(usuario: Usuario, data: Date): Promise<Transacao[]> {
		return await this._colecao.consultarComFiltros(this._caminho(usuario), [
			{ atributo: 'data', op: '>=', valor: Data.primeiroDiaMes(data) },
			{ atributo: 'data', op: '<=', valor: Data.ultimoDiaMes(data) },
		])
	}
}
