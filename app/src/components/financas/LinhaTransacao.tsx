import { Text, UnstyledButton } from '@mantine/core'
import Transacao from '../../logic/core/financas/Transacao'
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
	return (
		<UnstyledButton
			onClick={() => props.aoClicar?.(t)}
			aria-label={`Editar ${t.descricao || t.categoria}`}
			px="md"
			py="sm"
			style={{
				borderTop: props.divisoria ? '1px solid var(--mantine-color-dark-6)' : undefined,
			}}
			className="w-full flex items-center gap-3 hover:bg-(--mantine-color-dark-6) transition-colors"
		>
			<IconeTransacao categoria={t.categoria} tipo={t.tipo} />
			<div className="flex-1 min-w-0 flex flex-col">
				<Text fw={600} c="bright" truncate>
					{t.descricao || t.categoria || 'Sem categoria'}
				</Text>
				<Text size="xs" c="dimmed" truncate>
					{t.categoria}
					{props.mostrarData && ` · ${Data.ddmm.formatar(new Date(t.data))}`}
				</Text>
			</div>
			<ValorTransacao valor={t.valor} tipo={t.tipo} />
		</UnstyledButton>
	)
}
