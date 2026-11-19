import ServicosRecorrencia from './financas/ServicosRecorrencia'
import ServicosTransacao from './financas/ServicosTransacao'
import ServicosUsuario from './usuario/ServicosUsuario'

class Serviços {
	get transacao() {
		return new ServicosTransacao()
	}
	get recorrencia() {
		return new ServicosRecorrencia()
	}
	get usuario() {
		return new ServicosUsuario()
	}
}

const servicos = new Serviços()
export default servicos
