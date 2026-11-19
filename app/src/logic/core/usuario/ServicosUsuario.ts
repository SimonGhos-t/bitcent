import Autenticacao, {
	CancelarMonitoramento,
	MonitorarUsuario,
} from '../../firebase/auth/Autenticacao'
import Colecao from '../../firebase/db/Colecao'
import Usuario, { CAMPOS_ANTIGOS_USUARIO, CAMPOS_USUARIO } from './Usuario'

export default class ServicosUsuario {
	private _autenticacao = new Autenticacao()
	private _colecao = new Colecao()

	monitorarAutenticacao(observador: MonitorarUsuario): CancelarMonitoramento {
		return this._autenticacao.monitorar(async (usuario) => {
			observador(
				usuario
					? {
							...usuario,
							...(await this.consultar(usuario.email)),
						}
					: null,
			)
		})
	}

	async loginGoogle(): Promise<Usuario | null> {
		const usuario = await this._autenticacao.loginGoogle()
		if (!usuario) return null

		let usuarioDoBanco = await this.consultar(usuario.email)
		if (!usuarioDoBanco) usuarioDoBanco = await this.salvar(usuario)

		return { ...usuario, ...usuarioDoBanco }
	}

	logout(): Promise<void> {
		return this._autenticacao.logout()
	}

	async consultar(email: string): Promise<Usuario | null> {
		const usuario = await this._colecao.consultarPorId('usuarios', email)
		if (!usuario) return null

		// Apaga do banco CPF e telefone de cadastros antigos (só acontece uma vez por usuário)
		const antigos = CAMPOS_ANTIGOS_USUARIO.filter((campo) => campo in usuario)
		if (antigos.length) {
			// Se falhar, tenta de novo no próximo acesso: não pode impedir o login
			await this._colecao
				.removerCampos('usuarios', email, [...antigos])
				.catch((erro) => console.warn('Não foi possível limpar CPF/telefone', erro))
		}
		return this._somenteCamposDoUsuario(usuario)
	}

	async salvar(usuario: Usuario): Promise<Usuario> {
		return await this._colecao.salvar(
			'usuarios',
			this._somenteCamposDoUsuario(usuario),
			usuario.email,
		)
	}

	// Só os campos que a tela usa, mesmo que o objeto traga outros.
	// Campos ausentes ficam de fora (não sobrescrevem os dados da conta Google com undefined).
	private _somenteCamposDoUsuario(usuario: any): Usuario {
		return CAMPOS_USUARIO.reduce((dados: any, campo) => {
			if (usuario[campo] !== undefined) dados[campo] = usuario[campo]
			return dados
		}, {})
	}
}
