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
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [usuario])

	// Salva só o campo do formulário clicado, sem levar junto
	// o que estiver pela metade nos outros campos
	function salvarCampo(campo: 'nome' | 'cpf' | 'telefone') {
		return async () => {
			if (!usuario) return
			await atualizarUsuario({ ...usuario, [campo]: dados[campo] ?? '' })
		}
	}

	const cpf = dados.cpf ?? ''
	const telefone = dados.telefone ?? ''

	return (
		<div className="flex flex-col gap-4">
			<MiniFormulario
				titulo="Seu Nome"
				descricao="Como você gostaria de ser chamado?"
				msgRodape="O nome deve possuir entre 3 e 80 caracteres."
				podeSalvar={Texto.entre(dados.nome, 3, 80) && dados.nome !== usuario?.nome}
				salvar={salvarCampo('nome')}
			>
				<TextInput value={dados.nome ?? ''} onChange={alterarAtributo('nome')} />
			</MiniFormulario>
			<MiniFormulario
				titulo="Seu CPF"
				descricao="Seu CPF é usado internamente pelo sistema."
				msgRodape="Opcional. Deixe em branco para remover."
				podeSalvar={(cpf === '' || Cpf.valido(cpf)) && cpf !== (usuario?.cpf ?? '')}
				salvar={salvarCampo('cpf')}
			>
				<TextInput
					value={Cpf.formatar(cpf)}
					onChange={alterarAtributo('cpf', Cpf.desformatar)}
					error={cpf.length === 11 && !Cpf.valido(cpf) ? 'CPF inválido' : undefined}
				/>
			</MiniFormulario>
			<MiniFormulario
				titulo="Seu Telefone"
				descricao="Usado para notificações importantes sobre a sua conta."
				msgRodape="Com DDD. Deixe em branco para remover."
				podeSalvar={
					(telefone === '' || Telefone.valido(telefone)) &&
					telefone !== (usuario?.telefone ?? '')
				}
				salvar={salvarCampo('telefone')}
			>
				<TextInput
					value={Telefone.formatar(telefone)}
					onChange={alterarAtributo('telefone', Telefone.desformatar)}
				/>
			</MiniFormulario>
		</div>
	)
}
