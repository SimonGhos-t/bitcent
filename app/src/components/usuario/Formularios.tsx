'use client'
import { ActionIcon, Button, Group, Paper, Text, TextInput, Title, Tooltip } from '@mantine/core'
import { IconEye, IconEyeOff, IconLogout } from '@tabler/icons-react'
import useFormulario from '../../data/hooks/useFormulario'
import Usuario from '../../logic/core/usuario/Usuario'
import MiniFormulario from '../template/MiniFormulario'
import Texto from '../../logic/utils/Texto'
import Cpf from '../../logic/utils/Cpf'
import Telefone from '../../logic/utils/Telefone'
import { useContext, useEffect, useState } from 'react'
import AutenticacaoContext from '../../data/contexts/AutenticacaoContext'

export default function Formularios() {
	const { usuario, atualizarUsuario, logout } = useContext(AutenticacaoContext)
	const { dados, alterarAtributo, alterarDados } = useFormulario<Usuario>()
	const [mostrarCpf, setMostrarCpf] = useState(false)

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
	// CPF fica oculto até clicar em "mostrar"; enquanto oculto, não dá para editar
	const cpfOculto = !mostrarCpf && !!usuario?.cpf && cpf === usuario.cpf

	return (
		<div className="flex flex-col gap-4 max-w-215">
			<MiniFormulario
				titulo="Nome"
				descricao="Como você gostaria de ser chamado?"
				msgRodape="Entre 3 e 80 caracteres."
				podeSalvar={Texto.entre(dados.nome, 3, 80) && dados.nome !== usuario?.nome}
				salvar={salvarCampo('nome')}
			>
				<TextInput
					aria-label="Nome"
					value={dados.nome ?? ''}
					onChange={alterarAtributo('nome')}
				/>
			</MiniFormulario>

			<MiniFormulario
				titulo="CPF"
				opcional
				descricao="Fica oculto por padrão. Usado apenas internamente pelo sistema."
				msgRodape="Deixe em branco para remover."
				podeSalvar={(cpf === '' || Cpf.valido(cpf)) && cpf !== (usuario?.cpf ?? '')}
				salvar={salvarCampo('cpf')}
			>
				<TextInput
					aria-label="CPF"
					inputMode="numeric"
					readOnly={cpfOculto}
					value={cpfOculto ? '•••.•••.•••-••' : Cpf.formatar(cpf)}
					onChange={alterarAtributo('cpf', Cpf.desformatar)}
					error={cpf.length === 11 && !Cpf.valido(cpf) ? 'CPF inválido' : undefined}
					rightSection={
						!!usuario?.cpf && (
							<Tooltip label={mostrarCpf ? 'Ocultar' : 'Mostrar'}>
								<ActionIcon
									variant="subtle"
									color="gray"
									aria-label={mostrarCpf ? 'Ocultar CPF' : 'Mostrar CPF'}
									onClick={() => setMostrarCpf(!mostrarCpf)}
								>
									{mostrarCpf ? <IconEyeOff size={18} /> : <IconEye size={18} />}
								</ActionIcon>
							</Tooltip>
						)
					}
				/>
			</MiniFormulario>

			<MiniFormulario
				titulo="Telefone"
				opcional
				descricao="Usado para notificações importantes sobre a sua conta."
				msgRodape="Com DDD. Deixe em branco para remover."
				podeSalvar={
					(telefone === '' || Telefone.valido(telefone)) &&
					telefone !== (usuario?.telefone ?? '')
				}
				salvar={salvarCampo('telefone')}
			>
				<TextInput
					aria-label="Telefone"
					inputMode="tel"
					value={Telefone.formatar(telefone)}
					onChange={alterarAtributo('telefone', Telefone.desformatar)}
				/>
			</MiniFormulario>

			<Paper withBorder radius="lg" bg="dark.7" p="lg">
				<Group justify="space-between" gap="md">
					<div>
						<Title order={2} size="h4" c="bright">
							E-mail de acesso
						</Title>
						<Text c="dark.2">{usuario?.email}</Text>
					</div>
					<Button
						variant="default"
						leftSection={<IconLogout size={16} />}
						onClick={logout}
					>
						Sair da conta
					</Button>
				</Group>
			</Paper>
		</div>
	)
}
