import Link from 'next/link'
import { Anchor, Group, Progress, Stack, Text, Title } from '@mantine/core'
import { ResumoMensal } from '../../logic/core/financas/ResumoMensal'
import Transacao from '../../logic/core/financas/Transacao'
import Dinheiro from '../../logic/utils/Dinheiro'
import Cartao from '../template/Cartao'
import LinhaTransacao from './LinhaTransacao'

interface PainelMesProps {
	resumo: ResumoMensal
	aoClicar: (transacao: Transacao) => void
}

function Vazio(props: { children: string }) {
	return (
		<Text c="dimmed" size="sm" py="md">
			{props.children}
		</Text>
	)
}

function CabecalhoCartao(props: { titulo: string; link?: boolean }) {
	return (
		<Group justify="space-between" align="baseline" mb="sm" px={props.link ? 'lg' : 0}>
			<Title order={2} size="h5" c="bright">
				{props.titulo}
			</Title>
			{props.link && (
				<Anchor component={Link} href="/transacoes" size="sm">
					Ver todas
				</Anchor>
			)}
		</Group>
	)
}

// Gastos por categoria, maiores gastos e últimas transações do mês
export default function PainelMes(props: PainelMesProps) {
	const { gastosPorCategoria, maioresGastos, ultimas } = props.resumo
	const maior = gastosPorCategoria[0]?.total ?? 0

	return (
		<>
			<div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
				<Cartao className="lg:col-span-3">
					<CabecalhoCartao titulo="Gastos por categoria" />
					{gastosPorCategoria.length ? (
						<Stack gap="md">
							{gastosPorCategoria.map((item) => (
								<div key={item.categoria}>
									<Group justify="space-between" mb={6}>
										<Text>{item.categoria}</Text>
										<Text fw={700} c="bright">
											{Dinheiro.formatar(item.total)}
										</Text>
									</Group>
									<Progress
										value={maior ? (item.total / maior) * 100 : 0}
										size="md"
										radius="xl"
										color="cyan"
										bg="dark.5"
										aria-label={`${item.categoria}: ${Dinheiro.formatar(item.total)}`}
									/>
								</div>
							))}
						</Stack>
					) : (
						<Vazio>Nenhuma despesa neste mês.</Vazio>
					)}
				</Cartao>

				<Cartao className="lg:col-span-2" px={0} pb="xs">
					<div className="px-5">
						<CabecalhoCartao titulo="Maiores gastos" />
					</div>
					{maioresGastos.length ? (
						maioresGastos.map((t, i) => (
							<LinhaTransacao
								key={t.id}
								transacao={t}
								mostrarData
								divisoria={i > 0}
								aoClicar={props.aoClicar}
							/>
						))
					) : (
						<div className="px-5">
							<Vazio>Nenhuma despesa neste mês.</Vazio>
						</div>
					)}
				</Cartao>
			</div>

			<Cartao px={0} pb="xs">
				<CabecalhoCartao titulo="Últimas transações" link />
				{ultimas.length ? (
					ultimas.map((t, i) => (
						<LinhaTransacao
							key={t.id}
							transacao={t}
							mostrarData
							divisoria={i > 0}
							aoClicar={props.aoClicar}
						/>
					))
				) : (
					<div className="px-5">
						<Vazio>
							Nenhuma transação neste mês. Toque em “Nova transação” para começar.
						</Vazio>
					</div>
				)}
			</Cartao>
		</>
	)
}
