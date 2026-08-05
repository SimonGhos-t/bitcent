import Colecao from "../../firebase/db/Colecao";
import Usuario from "../usuario/Usuario";
import Transacao from "./Transacao";
import Data from "../../utils/Data";

export default class ServicosTransacao {
	private _colecao = new Colecao()

	async salvar(transacao: Transacao, usuario: Usuario) {
		return this._colecao.salvar(`financas/${usuario.email}/transacoes`, transacao)
	}

	async consultar(usuario: Usuario) {
		const caminho = `financas/${usuario.email}/transacoes`
		return await this._colecao.consultar(caminho, 'data', 'asc')
	}

    async excluir(transacao: Transacao, usuario: Usuario) {
        const caminho = `financas/${usuario.email}/transacoes`
        return this._colecao.excluir(caminho, transacao.id)
    }

	async consultarPorMes(usuario: Usuario, data: any) {
	    const caminho = `financas/${usuario.email}/transacoes`
	    return await this._colecao.consultarComFiltros(caminho, [
			{ atributo: 'data', op: '>=', valor: Data.primeiroDiaMes(data) },
			{ atributo: 'data', op: '<=', valor: Data.ultimoDiaMes(data) },
		])
	}
}