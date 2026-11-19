import { Badge, Group, Tooltip } from '@mantine/core'
import { IconRepeat } from '@tabler/icons-react'
import Transacao, { ehPrevista } from '../../logic/core/financas/Transacao'

// Ícone de conta fixa e selo "Prevista", ao lado do nome da transação
export default function MarcasTransacao(props: { transacao: Transacao }) {
	const t = props.transacao
	if (!t.recorrenciaId) return null
	return (
		<Group gap={6} wrap="nowrap" className="shrink-0">
			<Tooltip label="Conta fixa" withArrow>
				<IconRepeat
					size={15}
					stroke={2}
					color="var(--mantine-color-cyan-4)"
					aria-label="Conta fixa"
				/>
			</Tooltip>
			{ehPrevista(t) && (
				<Badge
					size="sm"
					variant="outline"
					color="yellow"
					styles={{ root: { borderColor: 'rgba(255, 212, 59, 0.45)' } }}
				>
					Prevista
				</Badge>
			)}
		</Group>
	)
}
