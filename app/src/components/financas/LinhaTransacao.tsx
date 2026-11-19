import { Text, UnstyledButton } from '@mantine/core'
import Transacao, { ehPrevista } from '../../logic/core/financas/Transacao'
import MarcasTransacao from './MarcasTransacao'
import Data from '../../logic/utils/Data'
import IconeTransacao from './IconeTransacao'
import ValorTransacao from './ValorTransacao'

interface LinhaTransacaoProps {
	transacao: Transacao
	mostrarData?: boolean
	// Linha separadora acima (para listas)
	divisoria?: boolean
	aoClicar?: (transacao: Transacao) => void
}

export default function LinhaTransacao(props: LinhaTransacaoProps) {
	const t = props.transacao
	const prevista = ehPrevista(t)
	return (
		<UnstyledButton
			onClick={() => props.aoClicar?.(t)}
			aria-label={
				prevista
					? `Confirmar valor de ${t.descricao || t.categoria}`
					: `Editar ${t.descricao || t.categoria}`
			}
			px="md"
			py="sm"
			style={{
				borderTop: props.divisoria ? '1px solid var(--mantine-color-dark-6)' : undefined,
			}}
			className="w-full flex items-center gap-3 hover:bg-(--mantine-color-dark-6) transition-colors"
		>
			<div style={{ opacity: prevista ? 0.55 : 1 }}>
				<IconeTransacao categoria={t.categoria} tipo={t.tipo} />
			</div>
			<div className="flex-1 min-w-0 flex flex-col">
				<div className="flex items-center gap-2 min-w-0">
					<Text fw={600} c={prevista ? 'dark.2' : 'bright'} truncate>
						{t.descricao || t.categoria || 'Sem categoria'}
					</Text>
					<MarcasTransacao transacao={t} />
				</div>
				<Text size="xs" c="dimmed" truncate>
					{t.categoria}
					{props.mostrarData && ` · ${Data.ddmm.formatar(new Date(t.data))}`}
					{prevista && ' · toque para confirmar o valor'}
				</Text>
			</div>
			<ValorTransacao valor={t.valor} tipo={t.tipo} prevista={prevista} />
		</UnstyledButton>
	)
}
