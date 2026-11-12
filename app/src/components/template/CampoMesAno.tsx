'use client'
import 'dayjs/locale/pt-br'
import { ActionIcon, Button, Group, Paper, Popover } from '@mantine/core'
import { MonthPicker } from '@mantine/dates'
import { IconCalendar, IconChevronLeft, IconChevronRight } from '@tabler/icons-react'
import { useDisclosure } from '@mantine/hooks'
import dayjs from 'dayjs'
import Data from '../../logic/utils/Data'

export interface CampoMesAnoProps {
	data: Date
	dataMudou: (data: Date) => void
	// Versão menor para o topo do celular ("Nov 2026", sem ícone)
	compacto?: boolean
}

export default function CampoMesAno(props: CampoMesAnoProps) {
	const [aberto, { toggle, close }] = useDisclosure(false)
	const mes = dayjs(props.data).startOf('month')
	const rotulo = props.compacto
		? mes.toDate().toLocaleDateString('pt-BR', { month: 'short' }).replace('.', '') +
			` ${mes.year()}`
		: Data.mmyy.formatar(mes.toDate()).replace(' de ', ' ')
	const tamanho = props.compacto ? 32 : 36

	return (
		<Paper withBorder p={3} radius="md" bg="dark.7">
			<Group gap={2} wrap="nowrap">
				<ActionIcon
					variant="subtle"
					color="gray"
					size={tamanho}
					aria-label="Mês anterior"
					onClick={() => props.dataMudou(mes.subtract(1, 'month').toDate())}
				>
					<IconChevronLeft size={18} />
				</ActionIcon>
				<Popover opened={aberto} onChange={toggle} position="bottom" shadow="md">
					<Popover.Target>
						<Button
							variant="subtle"
							color="gray"
							c="bright"
							h={tamanho}
							leftSection={props.compacto ? undefined : <IconCalendar size={16} />}
							px={props.compacto ? 'xs' : undefined}
							onClick={toggle}
							className="capitalize"
						>
							{rotulo}
						</Button>
					</Popover.Target>
					<Popover.Dropdown>
						<MonthPicker
							locale="pt-br"
							value={mes.toDate()}
							onChange={(valor) => {
								if (!valor) return
								props.dataMudou(dayjs(valor).toDate())
								close()
							}}
						/>
					</Popover.Dropdown>
				</Popover>
				<ActionIcon
					variant="subtle"
					color="gray"
					size={tamanho}
					aria-label="Próximo mês"
					onClick={() => props.dataMudou(mes.add(1, 'month').toDate())}
				>
					<IconChevronRight size={18} />
				</ActionIcon>
			</Group>
		</Paper>
	)
}
