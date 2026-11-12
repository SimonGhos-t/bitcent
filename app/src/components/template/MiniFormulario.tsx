'use client'
import { Badge, Button, Group, Paper, Text, Title } from '@mantine/core'
import { ReactNode, useState } from 'react'
import { IconDeviceFloppy } from '@tabler/icons-react'

interface MiniFormularioProps {
	titulo: string
	descricao: string
	msgRodape: string
	podeSalvar: boolean
	salvar: () => Promise<void> | void
	opcional?: boolean
	children: ReactNode
}

export default function MiniFormulario(props: MiniFormularioProps) {
	const [salvando, setSalvando] = useState(false)

	async function salvar() {
		if (!props.podeSalvar) return
		setSalvando(true)
		try {
			await props.salvar()
		} finally {
			setSalvando(false)
		}
	}

	return (
		<Paper component="section" withBorder radius="lg" bg="dark.7" className="overflow-hidden">
			<form
				onSubmit={(e) => {
					e.preventDefault()
					salvar()
				}}
			>
				<div className="flex flex-col gap-3 p-6">
					<Group gap="xs">
						<Title order={2} size="h4" c="bright">
							{props.titulo}
						</Title>
						{props.opcional && (
							<Badge variant="default" size="sm">
								Opcional
							</Badge>
						)}
					</Group>
					<Text c="dark.2">{props.descricao}</Text>
					{props.children}
				</div>
				<Group
					justify="space-between"
					gap="sm"
					px="lg"
					py="sm"
					bg="dark.8"
					style={{ borderTop: '1px solid var(--mantine-color-dark-6)' }}
				>
					<Text size="sm" c="dimmed">
						{props.msgRodape}
					</Text>
					<Button
						type="submit"
						ml="auto"
						color="green.9"
						leftSection={<IconDeviceFloppy size={18} />}
						disabled={!props.podeSalvar}
						loading={salvando}
					>
						Salvar
					</Button>
				</Group>
			</form>
		</Paper>
	)
}
