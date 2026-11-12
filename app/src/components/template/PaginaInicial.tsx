'use client'
import { ReactNode, useContext } from 'react'
import { redirect } from 'next/navigation'
import { Avatar, Group, Stack, Text, Title } from '@mantine/core'
import AutenticacaoContext from '../../data/contexts/AutenticacaoContext'
import MenuLateral from './MenuLateral'
import BarraInferior from './BarraInferior'
import Pagina from './Pagina'
import CampoMesAno from './CampoMesAno'
import useTransacao from '../../data/hooks/useTransacao'

interface PaginaInicialProps {
	titulo?: string
	subtitulo?: string
	// Botões e campos à direita do título (ex.: mês, nova transação); só no computador
	acoes?: ReactNode
	// Mostra o seletor de mês no topo do celular (no computador ele vai em `acoes`)
	mostrarMes?: boolean
	children?: ReactNode
}

export default function PaginaInicial(props: PaginaInicialProps) {
	const { usuario } = useContext(AutenticacaoContext)
	const { data, alterarData } = useTransacao()
	if (!props.children) {
		return redirect('/inicio')
	}

	return (
		<Pagina>
			<MenuLateral />
			<main className="flex-1 min-w-0 h-screen overflow-y-auto">
				{/* Topo do celular: saudação, seletor de mês e linha separadora */}
				<Group
					hiddenFrom="sm"
					justify="space-between"
					wrap="nowrap"
					gap="sm"
					px="md"
					py="sm"
					style={{ borderBottom: '1px solid var(--mantine-color-dark-5)' }}
				>
					<Group gap="sm" wrap="nowrap" className="min-w-0">
						<Avatar
							src={usuario?.imagemUrl ?? undefined}
							name={usuario?.nome}
							radius="xl"
						/>
						<Stack gap={0} className="min-w-0">
							<Text size="xs" c="dimmed">
								Olá,
							</Text>
							<Text fw={700} c="bright" truncate>
								{usuario?.nome?.split(' ')[0]}
							</Text>
						</Stack>
					</Group>
					{props.mostrarMes && (
						<CampoMesAno data={data} dataMudou={alterarData} compacto />
					)}
				</Group>

				<div className="w-full max-w-310 px-4 pt-4 pb-28 sm:px-10 sm:pt-8 sm:pb-12 flex flex-col gap-6">
					{(props.titulo || props.acoes) && (
						<Group justify="space-between" align="flex-end" gap="md">
							<Stack gap={4}>
								{props.titulo && (
									<Title order={1} size="h2" fw={900} c="bright">
										{props.titulo}
									</Title>
								)}
								{props.subtitulo && <Text c="dimmed">{props.subtitulo}</Text>}
							</Stack>
							{/* No celular o mês fica no topo e a nova transação no botão "+" */}
							{props.acoes && (
								<Group gap="sm" wrap="wrap" visibleFrom="sm">
									{props.acoes}
								</Group>
							)}
						</Group>
					)}
					{props.children}
				</div>
			</main>
			<BarraInferior />
		</Pagina>
	)
}
