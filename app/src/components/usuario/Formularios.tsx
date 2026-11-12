'use client'
import { Button, Group, Paper, Text, TextInput, Title } from '@mantine/core'
import { IconLogout } from '@tabler/icons-react'
import useFormulario from '../../data/hooks/useFormulario'
import Usuario from '../../logic/core/usuario/Usuario'
import MiniFormulario from '../template/MiniFormulario'
import Texto from '../../logic/utils/Texto'
import { useContext, useEffect } from 'react'
import AutenticacaoContext from '../../data/contexts/AutenticacaoContext'

export default function Formularios() {
	const { usuario, atualizarUsuario, logout } = useContext(AutenticacaoContext)
	const { dados, alterarAtributo, alterarDados } = useFormulario<Usuario>()

	useEffect(() => {
		if (!usuario) return
		alterarDados(usuario)
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [usuario])

	async function salvarNome() {
		if (!usuario) return
		await atualizarUsuario({ ...usuario, nome: dados.nome ?? '' })
	}

	return (
		<div className="flex flex-col gap-4 max-w-215">
			<MiniFormulario
				titulo="Nome"
				descricao="Como você gostaria de ser chamado?"
				msgRodape="Entre 3 e 80 caracteres."
				podeSalvar={Texto.entre(dados.nome, 3, 80) && dados.nome !== usuario?.nome}
				salvar={salvarNome}
			>
				<TextInput
					aria-label="Nome"
					value={dados.nome ?? ''}
					onChange={alterarAtributo('nome')}
				/>
			</MiniFormulario>

			<Paper withBorder radius="lg" bg="dark.7" p={24}>
				<Title order={2} size="h4" c="bright">
					E-mail
				</Title>
				<Text c="dark.2" mt={4}>
					{usuario?.email}
				</Text>
				<Text size="sm" c="dimmed" mt="xs">
					É o e-mail da conta Google usada para entrar.
				</Text>
			</Paper>

			<Group justify="flex-end">
				<Button variant="default" leftSection={<IconLogout size={16} />} onClick={logout}>
					Sair da conta
				</Button>
			</Group>
		</div>
	)
}
