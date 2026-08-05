'use client'
import { TextInput } from '@mantine/core'
import useFormulario from '../../data/hooks/useFormulario'
import Usuario from '../../logic/core/usuario/Usuario'
import MiniFormulario from '../template/MiniFormulario'
import Texto from '../../logic/utils/Texto'
import Cpf from '../../logic/utils/Cpf'
import Telefone from '../../logic/utils/Telefone'
import { useContext, useEffect } from 'react'
import AutenticacaoContext from '../../data/contexts/AutenticacaoContext'

export default function Formularios() {
	const { usuario, atualizarUsuario } = useContext(AutenticacaoContext)
	const { dados, alterarAtributo, alterarDados } = useFormulario<Usuario>()

	useEffect(() => {
		if (!usuario) return
		alterarDados(usuario)
	}, [usuario])

	async function salvar() {
		if(!usuario) return
		await atualizarUsuario(dados)
	}

	return (
		<div className="flex flex-col gap-4">
			<MiniFormulario
				titulo="Seu Nome"
				descricao="Como você gostaria de ser chamado?"
				msgRodape="O nome deve possuir entre  3 e 80 caracteres."
				podeSalvar={Texto.entre(dados.nome, 3, 80)}
				salvar={salvar}
			>
				<TextInput value={dados.nome} onChange={alterarAtributo('nome')} />
			</MiniFormulario>
			<MiniFormulario
				titulo="Seu CPF"
				descricao="Seu CPF é usado internamente pelo sistema."
				msgRodape="Pode relaxar, daqui ele não sai!"
				podeSalvar={true}
				salvar={salvar}
			>
				<TextInput
					value={Cpf.formatar(dados.cpf ?? '')}
					onChange={alterarAtributo('cpf', Cpf.desformatar)}
				/>
			</MiniFormulario>
			<MiniFormulario
				titulo="Seu Telefone"
				descricao="Usado para notificações importantes sobre a sua conta."
				msgRodape="Se receber chamadas a cobrar, não sei de nada!"
				podeSalvar={true}
				salvar={salvar}
			>
				<TextInput
					value={Telefone.formatar(dados.telefone ?? '')}
					onChange={alterarAtributo('telefone', Telefone.desformatar)}
				/>
			</MiniFormulario>
		</div>
	)
}
