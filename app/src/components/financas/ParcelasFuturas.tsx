import Link from 'next/link'
import { Anchor, Group, Progress, Stack, Text, Title, Tooltip } from '@mantine/core'
import { IconArrowDownLeft, IconCreditCard } from '@tabler/icons-react'
import { useMemo } from 'react'
import Transacao from '../../logic/core/financas/Transacao'
import { resumirParcelasFuturas } from '../../logic/core/financas/Parcelas'
import Dinheiro from '../../logic/utils/Dinheiro'
import Data from '../../logic/utils/Data'
import Cartao from '../template/Cartao'
import IconeTransacao from './IconeTransacao'

interface ParcelasFuturasProps {
	// Transações com data depois do mês escolhido
	futuras: Transacao[]
	mes: Date
}

const nomeMesCurto = (d: Date) => d.toLocaleDateString('pt-BR', { month: 'short' }).replace('.', '')

// Valor já comprometido em parcelas nos próximos 6 meses e as compras em andamento
export default function ParcelasFuturas(props: ParcelasFuturasProps) {
	const r = useMemo(
		() => resumirParcelasFuturas(props.futuras, props.mes),
		[props.futuras, props.mes],
	)
	if (!r.compras.length) return null

	const maior = Math.max(...r.meses.map((m) => m.despesas), 0)
	const receber = r.meses.filter((m) => m.receitas > 0)

	return (
		<div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
			<Cartao className="lg:col-span-3">
				<Stack gap="md">
					<Group justify="space-between" align="center" gap="sm">
						<Title order={2} size="h5" c="bright" className="flex items-center gap-2">
							<IconCreditCard size={20} stroke={1.8} aria-hidden />
							Parcelas dos próximos meses
						</Title>
						<Anchor component={Link} href="/transacoes" size="sm">
							Ver transações
						</Anchor>
					</Group>
					{r.totalDespesas > 0 && (
						<Text size="sm">
							Já comprometido em despesas:{' '}
							<Text span fw={700} c="bright" inherit>
								{Dinheiro.formatar(r.totalDespesas)}
							</Text>{' '}
							nos próximos 6 meses.
						</Text>
					)}
					<div
						className="grid grid-cols-6 gap-2 sm:gap-3 items-end h-44"
						role="list"
						aria-label="Despesas em parcelas por mês"
					>
						{r.meses.map((m) => (
							<div
								key={m.anoMes}
								role="listitem"
								className="flex flex-col items-center justify-end gap-1.5 h-full min-w-0"
							>
								<Text
									fz={{ base: 10, sm: 12 }}
									fw={700}
									c={m.despesas ? 'bright' : 'dimmed'}
									style={{ whiteSpace: 'nowrap' }}
								>
									{m.despesas ? Dinheiro.formatarNumero(m.despesas) : '—'}
								</Text>
								<Tooltip
									label={`${Data.mmyy.formatar(m.mes)}: ${Dinheiro.formatar(m.despesas)}`}
									withArrow
								>
									<div
										className="w-full max-w-14 rounded-t-md rounded-b-sm"
										style={{
											height: maior
												? Math.max(
														(m.despesas / maior) * 112,
														m.despesas ? 4 : 0,
													)
												: 0,
											background: 'var(--mantine-color-red-4)',
											opacity: 0.85,
										}}
										aria-label={`${Data.mmyy.formatar(m.mes)}: ${Dinheiro.formatar(m.despesas)}`}
									/>
								</Tooltip>
								<Text size="xs" c="dark.2">
									{nomeMesCurto(m.mes)}
								</Text>
							</div>
						))}
					</div>
					{receber.length > 0 && (
						<Group
							gap={8}
							wrap="nowrap"
							p="xs"
							style={{
								background: 'rgba(105, 219, 124, 0.06)',
								border: '1px solid rgba(105, 219, 124, 0.25)',
								borderRadius: 'var(--mantine-radius-md)',
							}}
						>
							<IconArrowDownLeft
								size={16}
								color="var(--mantine-color-green-4)"
								aria-hidden
							/>
							<Text size="sm">
								A receber:{' '}
								<Text span fw={700} c="bright" inherit>
									{Dinheiro.formatar(r.totalReceitas)}
								</Text>{' '}
								em parcelas nos próximos 6 meses
							</Text>
						</Group>
					)}
				</Stack>
			</Cartao>

			<Cartao className="lg:col-span-2">
				<Title order={2} size="h5" c="bright" mb="xs">
					Compras em andamento
				</Title>
				{r.compras.map((c, i) => {
					const pagas = c.totalParcelas - c.restantes
					return (
						<Group
							key={c.compraId}
							wrap="nowrap"
							gap="sm"
							py="sm"
							style={{
								borderTop:
									i > 0 ? '1px solid var(--mantine-color-dark-6)' : undefined,
							}}
						>
							<IconeTransacao categoria={c.categoria} tipo={c.tipo} tamanho={34} />
							<div className="flex-1 min-w-0">
								<Group justify="space-between" wrap="nowrap" gap="xs" mb={6}>
									<Text fw={700} c="bright" size="sm" truncate>
										{c.descricao}{' '}
										<Text span size="xs" c="dark.1" fw={700}>
											{pagas}/{c.totalParcelas}
										</Text>
									</Text>
									<Text size="xs" c="dark.2" style={{ whiteSpace: 'nowrap' }}>
										{c.tipo === 'receita' ? 'a receber' : 'faltam'}{' '}
										<Text span fw={700} c="bright" inherit>
											{Dinheiro.formatar(c.valorRestante)}
										</Text>
									</Text>
								</Group>
								<Progress
									value={(pagas / c.totalParcelas) * 100}
									size="sm"
									radius="xl"
									color="cyan"
									bg="dark.5"
									aria-label={`${pagas} de ${c.totalParcelas} parcelas`}
								/>
								<Text size="xs" c="dimmed" mt={4} truncate>
									{c.totalParcelas}x de {Dinheiro.formatar(c.valorParcela)} ·
									termina em {Data.mmyy.formatar(c.ultimaData)}
								</Text>
							</div>
						</Group>
					)
				})}
			</Cartao>
		</div>
	)
}
