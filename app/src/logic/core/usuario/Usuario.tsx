export default interface Usuario {
	id: string
	nome: string
	email: string
	imagemUrl: string | null
}

// Campos gravados em usuarios/{email} (os mesmos aceitos pelas regras do Firestore)
export const CAMPOS_USUARIO = ['id', 'nome', 'email', 'imagemUrl'] as const

// Campos de versões antigas, que a tela não usa mais e são apagados do banco
export const CAMPOS_ANTIGOS_USUARIO = ['cpf', 'telefone'] as const
