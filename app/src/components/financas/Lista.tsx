import { Group, Text } from '@mantine/core'
import Transacao from '../../logic/core/financas/Transacao'
import { TipoTransacao } from '../../logic/core/financas/TipoTransacao'
import { maisRecentesPrimeiro } from '../../logic/core/financas/ResumoMensal'
import Dinheiro from '../../logic/utils/Dinheiro'
import Cartao from '../template/Cartao'
import LinhaTransacao from './LinhaTransacao'

interface ListaProps {
	transacoes: Transacao[]
	aoClicar: (transacao: Transacao) => void
}

interface Dia {
	chave: string
	data: Date
	itens: Transacao[]
	saldo: number
}

// Agrupa por dia, do mais recente para o mais antigo
export function agruparPorDia(transacoes: Transacao[]): Dia[] {
	const dias = new Map<string, Dia>()
	for (const t of [...transacoes].sort(maisRecentesPrimeiro)) {
		const data = new Date(t.data)
		const chave = data.toDateString()
		const dia = dias.get(chave) ?? { chave, data, itens: [], saldo: 0 }
		dia.itens.push(t)
		dia.saldo += t.tipo === TipoTransacao.RECEITA ? t.valor : -t.valor
		dias.set(chave, dia)
	}
	return [...dias.values()]
}

export default function Lista(props: ListaProps) {
	return (
		<div className="flex flex-col gap-4">
			{agruparPorDia(props.transacoes).map((dia) => (
				<Cartao key={dia.chave} component="section" p={0} className="overflow-hidden">
					<Group justify="space-between" px="md" py={10} bg="dark.6">
						<Text
							component="h2"
							size="xs"
							fw={700}
							tt="uppercase"
							c="dark.1"
							style={{ letterSpacing: 0.5 }}
						>
							{dia.data.toLocaleDateString('pt-BR', {
								weekday: 'short',
								day: 'numeric',
								month: 'long',
							})}
						</Text>
						<Text size="sm" c="dark.2">
							{dia.saldo < 0 ? '−' : '+'}
							{Dinheiro.formatar(Math.abs(dia.saldo))}
						</Text>
					</Group>
					<div>
						{dia.itens.map((t, i) => (
							<LinhaTransacao
								key={t.id}
								transacao={t}
								divisoria={i > 0}
								aoClicar={props.aoClicar}
							/>
						))}
					</div>
				</Cartao>
			))}
		</div>
	)
}
