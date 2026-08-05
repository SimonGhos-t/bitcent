import Id from "../../logic/core/comum/Id"
import Usuario from "../../logic/core/usuario/Usuario"

const usuarioFalso = {
    id: Id.novo(),
    nome: 'Robson Vale',
    email: 'robson@gmail.com',
    imagemUrl: null
} as Usuario

export default usuarioFalso