'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useContext } from 'react'
import { Avatar, Box, NavLink, Stack, Text } from '@mantine/core'
import { IconLogout } from '@tabler/icons-react'
import AutenticacaoContext from '../../data/contexts/AutenticacaoContext'
import Logo from './Logo'
import { itensMenu } from './itensMenu'

// Menu do computador. No celular a navegação fica na BarraInferior.
export default function MenuLateral() {
	const { usuario, logout } = useContext(AutenticacaoContext)
	const caminho = usePathname()

	return (
		<Box
			component="nav"
			aria-label="Principal"
			visibleFrom="sm"
			w={240}
			p="md"
			className="shrink-0 h-screen flex flex-col gap-6"
			style={{ borderRight: '1px solid var(--mantine-color-dark-5)' }}
		>
			<Logo />
			<Stack gap={4} className="flex-1">
				{itensMenu.map((item) => (
					<NavLink
						key={item.href}
						component={Link}
						href={item.href}
						label={item.nome}
						leftSection={<item.icone size={20} stroke={1.8} />}
						active={caminho.startsWith(item.href)}
						variant="light"
						style={{ borderRadius: 'var(--mantine-radius-md)' }}
						fw={600}
					/>
				))}
			</Stack>
			<Stack gap="sm" pt="md" style={{ borderTop: '1px solid var(--mantine-color-dark-5)' }}>
				<div className="flex items-center gap-3 px-2 min-w-0">
					<Avatar
						src={usuario?.imagemUrl ?? undefined}
						name={usuario?.nome}
						radius="xl"
					/>
					<div className="flex flex-col min-w-0">
						<Text fw={600} c="bright" truncate>
							{usuario?.nome}
						</Text>
						<Text size="xs" c="dimmed" truncate>
							{usuario?.email}
						</Text>
					</div>
				</div>
				{/* Mesmo componente dos itens do menu, para ficar alinhado com eles */}
				<NavLink
					component="button"
					onClick={logout}
					label="Sair"
					leftSection={<IconLogout size={20} stroke={1.8} />}
					style={{ borderRadius: 'var(--mantine-radius-md)' }}
					fw={600}
				/>
			</Stack>
		</Box>
	)
}
