import { Badge, Group, Tooltip } from '@mantine/core'
import { IconRepeat } from '@tabler/icons-react'
import Transacao, { ehParcela, ehPrevista } from '../../logic/core/financas/Transacao'

// Selo da parcela (3/10), ícone de conta fixa e selo "Prevista", ao lado do nome
export default function MarcasTransacao(props: { transacao: Transacao }) {
	const t = props.transacao
	const parcela = ehParcela(t)
	if (!t.recorrenciaId && !parcela) return null
	return (
		<Group gap={6} wrap="nowrap" className="shrink-0">
			{parcela && (
				<Tooltip label={`Parcela ${t.parcela} de ${t.totalParcelas}`} withArrow>
					<Badge
						size="sm"
						radius="sm"
						variant="filled"
						color="dark.5"
						c="dark.1"
						styles={{ label: { fontVariantNumeric: 'tabular-nums' } }}
						aria-label={`Parcela ${t.parcela} de ${t.totalParcelas}`}
					>
						{t.parcela}/{t.totalParcelas}
					</Badge>
				</Tooltip>
			)}
			{t.recorrenciaId && (
				<Tooltip label="Conta fixa" withArrow>
					<IconRepeat
						size={15}
						stroke={2}
						color="var(--mantine-color-cyan-4)"
						aria-label="Conta fixa"
					/>
				</Tooltip>
			)}
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
