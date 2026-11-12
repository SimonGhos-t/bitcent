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
		<SimpleGrid cols={{ base: 1, xs: 2, md: 3 }} spacing="md">
			{[...props.transacoes].sort(maisRecentesPrimeiro).map((t) => (
				<UnstyledButton
					key={t.id}
					onClick={() => props.aoClicar(t)}
					aria-label={`Editar ${t.descricao || t.categoria}`}
					p="md"
					className="flex flex-col gap-4 rounded-xl transition-colors"
					style={{
						border: '1px solid var(--mantine-color-dark-5)',
						background: 'var(--mantine-color-dark-7)',
					}}
				>
					{/* Ícone com subcategoria e categoria ao lado, como nas listas do Início */}
					<Group wrap="nowrap" gap="sm">
						<IconeTransacao categoria={t.categoria} tipo={t.tipo} />
						<div className="min-w-0">
							<Text fw={600} c="bright" truncate>
								{t.descricao || t.categoria || 'Sem categoria'}
							</Text>
							<Text size="xs" c="dimmed" truncate>
								{t.categoria}
							</Text>
						</div>
					</Group>
					<Group justify="space-between" align="baseline" wrap="nowrap" gap="sm">
						<ValorTransacao valor={t.valor} tipo={t.tipo} fz="xl" />
						<Text size="xs" c="dimmed" style={{ whiteSpace: 'nowrap' }}>
							{Data.ddmm.formatar(new Date(t.data))}
						</Text>
					</Group>
				</UnstyledButton>
			))}
		</SimpleGrid>
	)
}
