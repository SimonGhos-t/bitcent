import { Alert, Badge, Group, SimpleGrid, Text, ThemeIcon } from '@mantine/core'
import {
	IconAlertCircle,
	IconArrowDownLeft,
	IconArrowUpRight,
	IconPigMoney,
	IconScale,
} from '@tabler/icons-react'
import { ReactNode } from 'react'
import { ResumoMensal } from '../../logic/core/financas/ResumoMensal'
import Dinheiro from '../../logic/utils/Dinheiro'
import Cartao from '../template/Cartao'

function porcentagem(parte: number, total: number) {
	if (!total) return null
	return (parte / total).toLocaleString('pt-BR', { style: 'percent', maximumFractionDigits: 1 })
}

interface ItemProps {
	titulo: string
	valor: string
	cor?: string
	detalhe?: string | null
	destaque: ReactNode
}

function Item(props: ItemProps) {
	return (
		<Cartao p="md">
			{/* Altura fixa: com ícone ou com selo (e título em até 2 linhas no celular),
			    o valor fica na mesma linha em todos os cards */}
			<Group justify="space-between" wrap="nowrap" gap="xs" h={34} mb="xs">
				<Text c="dark.2" fw={500} size="sm" lh={1.2} lineClamp={2}>
					{props.titulo}
				</Text>
				<div className="shrink-0">{props.destaque}</div>
			</Group>
			<Text fz={{ base: 20, sm: 26 }} fw={800} c={props.cor ?? 'bright'}>
				{props.valor}
			</Text>
			{props.detalhe && (
				<Text size="xs" c="dimmed" mt={4}>
					{props.detalhe}
				</Text>
			)}
		</Cartao>
	)
}

export default function Resumo(props: { resumo: ResumoMensal }) {
	const r = props.resumo
	const saldoNegativo = r.saldo < 0
	const lancamentos = r.qtdReceitas === 1 ? '1 lançamento' : `${r.qtdReceitas} lançamentos`

	return (
		<>
			{saldoNegativo && (
				<Alert
					variant="light"
					color="red"
					icon={<IconAlertCircle size={20} />}
					styles={{ message: { color: 'var(--mantine-color-red-1)' } }}
				>
					Você gastou <strong>{Dinheiro.formatar(Math.abs(r.saldo))} a mais</strong> do
					que recebeu neste mês.
				</Alert>
			)}
			<SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }} spacing={{ base: 'sm', sm: 'md' }}>
				<Item
					titulo="Receitas"
					valor={Dinheiro.formatar(r.receitas)}
					detalhe={r.qtdReceitas ? lancamentos : 'Nenhuma receita no mês'}
					destaque={
						<ThemeIcon variant="light" color="green" radius="md" size={34}>
							<IconArrowDownLeft size={18} />
						</ThemeIcon>
					}
				/>
				<Item
					titulo="Despesas"
					valor={Dinheiro.formatar(r.despesas)}
					detalhe={
						r.receitas ? `${porcentagem(r.despesas, r.receitas)} do que entrou` : null
					}
					destaque={
						<ThemeIcon variant="light" color="red" radius="md" size={34}>
							<IconArrowUpRight size={18} />
						</ThemeIcon>
					}
				/>
				<Item
					titulo="Guardado / investido"
					valor={Dinheiro.formatar(r.guardado)}
					detalhe={
						r.guardado
							? r.receitas
								? `${porcentagem(r.guardado, r.receitas)} das receitas`
								: null
							: 'Nada guardado este mês'
					}
					destaque={
						<ThemeIcon variant="light" color="blue" radius="md" size={34}>
							<IconPigMoney size={18} />
						</ThemeIcon>
					}
				/>
				<Item
					titulo="Saldo do mês"
					valor={`${saldoNegativo ? '−' : ''}${Dinheiro.formatar(Math.abs(r.saldo))}`}
					cor={saldoNegativo ? 'red.4' : r.saldo > 0 ? 'green.4' : 'bright'}
					detalhe="Receitas − despesas − guardado"
					destaque={
						r.saldo === 0 ? (
							<ThemeIcon variant="light" color="gray" radius="md" size={34}>
								<IconScale size={18} />
							</ThemeIcon>
						) : (
							<Badge variant="light" color={saldoNegativo ? 'red' : 'green'}>
								{saldoNegativo ? 'Negativo' : 'Positivo'}
							</Badge>
						)
					}
				/>
			</SimpleGrid>
		</>
	)
}
