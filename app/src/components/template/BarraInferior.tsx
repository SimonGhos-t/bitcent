'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ActionIcon, Box, Text } from '@mantine/core'
import { IconPlus } from '@tabler/icons-react'
import useTransacao from '../../data/hooks/useTransacao'
import { itensMenu } from './itensMenu'

// Navegação do celular: barra fixa embaixo + botão flutuante de nova transação
export default function BarraInferior() {
	const caminho = usePathname()
	const { abrirNova } = useTransacao()

	return (
		<Box hiddenFrom="sm">
			<ActionIcon
				size={56}
				radius="xl"
				aria-label="Nova transação"
				onClick={abrirNova}
				className="fixed! right-5 bottom-22 z-40 shadow-lg shadow-black/60"
			>
				<IconPlus size={26} stroke={2.4} />
			</ActionIcon>
			<nav
				aria-label="Principal"
				className="fixed bottom-0 inset-x-0 z-30 grid grid-cols-3 h-18 pb-2 bg-black border-t border-(--mantine-color-dark-5)"
			>
				{itensMenu.map((item) => {
					const ativo = caminho.startsWith(item.href)
					return (
						<Link
							key={item.href}
							href={item.href}
							aria-current={ativo ? 'page' : undefined}
							className="flex flex-col items-center justify-center gap-1"
							style={{
								color: ativo
									? 'var(--mantine-color-cyan-4)'
									: 'var(--mantine-color-dark-2)',
							}}
						>
							<item.icone size={22} stroke={1.8} />
							<Text size="xs" fw={ativo ? 700 : 500} c="inherit">
								{item.nome}
							</Text>
						</Link>
					)
				})}
			</nav>
		</Box>
	)
}
