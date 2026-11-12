import { Group, SimpleGrid, Text, UnstyledButton } from '@mantine/core'
import Transacao from '../../logic/core/financas/Transacao'
import { maisRecentesPrimeiro } from '../../logic/core/financas/ResumoMensal'
import Data from '../../logic/utils/Data'
import IconeTransacao from './IconeTransacao'
import ValorTransacao from './ValorTransacao'

export interface GradeProps {
	transacoes: Transacao[]
	aoClicar: (transacao: Transacao) => void
}

export default function Grade(props: GradeProps) {
	return (
		<SimpleGrid cols={{ base: 1, xs: 2, md: 3, xl: 4 }} spacing="md">
			{[...props.transacoes].sort(maisRecentesPrimeiro).map((t) => (
				<UnstyledButton
					key={t.id}
					onClick={() => props.aoClicar(t)}
					aria-label={`Editar ${t.descricao || t.categoria}`}
					p="md"
					className="flex flex-col gap-3 rounded-xl transition-colors"
					style={{
						border: '1px solid var(--mantine-color-dark-5)',
						background: 'var(--mantine-color-dark-7)',
					}}
				>
					<Group justify="space-between" wrap="nowrap" gap="sm">
						<IconeTransacao categoria={t.categoria} tipo={t.tipo} />
						<Text size="xs" c="dimmed">
							{Data.ddmm.formatar(new Date(t.data))}
						</Text>
					</Group>
					<div className="min-w-0">
						<Text fw={600} c="bright" truncate>
							{t.descricao || t.categoria || 'Sem categoria'}
						</Text>
						<Text size="xs" c="dimmed" truncate>
							{t.categoria}
						</Text>
					</div>
					<ValorTransacao valor={t.valor} tipo={t.tipo} fz="xl" />
				</UnstyledButton>
			))}
		</SimpleGrid>
	)
}
