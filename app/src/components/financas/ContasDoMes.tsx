import Link from 'next/link'
import { ReactNode } from 'react'
import { Alert, Anchor, Button, Group, Progress, Stack, Text, Title } from '@mantine/core'
import { IconCheck, IconInfoCircle, IconRepeat } from '@tabler/icons-react'
import Transacao, { ehPrevista } from '../../logic/core/financas/Transacao'
import Dinheiro from '../../logic/utils/Dinheiro'
import Cartao from '../template/Cartao'
import IconeTransacao from './IconeTransacao'
import ValorTransacao from './ValorTransacao'

interface ContasDoMesProps {
	// Transações do mês (só as das contas fixas são usadas)
	transacoes: Transacao[]
	// Mês futuro: lançamentos que ainda não foram gravados
	projecoes: Transacao[]
	mes: string
	aoClicar: (t: Transacao) => void
	confirmar: (t: Transacao) => void
}

function Titulo() {
	return (
		<Group justify="space-between" align="center" gap="sm">
			<Title order={2} size="h5" c="bright" className="flex items-center gap-2">
				<IconRepeat size={20} stroke={1.8} aria-hidden />
				Contas do mês
			</Title>
			<Anchor component={Link} href="/contas-fixas" size="sm">
				Ver contas fixas
			</Anchor>
		</Group>
	)
}

function Linha(props: { t: Transacao; acao: ReactNode; detalhe: string }) {
	const prevista = ehPrevista(props.t)
	return (
		<Group
			wrap="nowrap"
			gap="sm"
			py={10}
			style={{ borderTop: '1px solid var(--mantine-color-dark-6)' }}
		>
			<div style={{ opacity: prevista ? 0.7 : 1 }}>
				<IconeTransacao categoria={props.t.categoria} tipo={props.t.tipo} tamanho={34} />
			</div>
			<div className="flex-1 min-w-0">
				<Text fw={600} c="bright" size="sm" truncate>
					{props.t.descricao || props.t.categoria}
				</Text>
				<Text size="xs" c="dimmed" truncate>
					{props.detalhe}
				</Text>
			</div>
			{props.acao}
		</Group>
	)
}

function Secao(props: { titulo: string; cor: string; children: ReactNode }) {
	return (
		<div>
			<Text size="xs" fw={700} tt="uppercase" c={props.cor} pb={4} style={{ letterSpacing: 0.5 }}>
				{props.titulo}
			</Text>
			{props.children}
		</div>
	)
}

const porDia = (a: Transacao, b: Transacao) =>
	new Date(a.data).getTime() - new Date(b.data).getTime()

export default function ContasDoMes(props: ContasDoMesProps) {
	const fixas = props.transacoes.filter((t) => t.recorrenciaId).sort(porDia)

	// Mês futuro: só a projeção, nada gravado ainda
	if (!fixas.length && props.projecoes.length) {
		const total = props.projecoes.reduce(
			(soma, t) => soma + (t.tipo === 'despesa' ? t.valor : 0),
			0,
		)
		return (
			<Cartao>
				<Stack gap="sm">
					<Titulo />
					<Text size="sm" c="dimmed">
						Previsão de {props.mes}: {props.projecoes.length} contas fixas, com{' '}
						{Dinheiro.formatar(total)} em despesas. Elas são lançadas quando o mês
						chegar e não entram no saldo antes disso.
					</Text>
					<div>
						{[...props.projecoes].sort(porDia).map((t) => (
							<Linha
								key={t.id}
								t={t}
								detalhe={`Dia ${new Date(t.data).getDate()}${t.situacao === 'prevista' ? ' · valor variável' : ''}`}
								acao={<ValorTransacao valor={t.valor} tipo={t.tipo} prevista />}
							/>
						))}
					</div>
				</Stack>
			</Cartao>
		)
	}

	if (!fixas.length) return null

	const aConfirmar = fixas.filter(ehPrevista)
	const lancadas = fixas.filter((t) => !ehPrevista(t))
	const totalPrevisto = aConfirmar.reduce((soma, t) => soma + t.valor, 0)

	return (
		<Cartao>
			<Stack gap="md">
				<Titulo />
				<div>
					<Group justify="space-between" mb={6}>
						<Text size="sm">
							<Text span fw={700} c="bright" inherit>
								{lancadas.length} de {fixas.length}
							</Text>{' '}
							lançadas
						</Text>
						{aConfirmar.length > 0 && (
							<Text size="sm" c="dimmed">
								{aConfirmar.length} a confirmar
							</Text>
						)}
					</Group>
					<Progress
						value={(lancadas.length / fixas.length) * 100}
						size="md"
						radius="xl"
						color="cyan"
						bg="dark.5"
						aria-label={`${lancadas.length} de ${fixas.length} contas lançadas`}
					/>
				</div>

				{aConfirmar.length > 0 && (
					<Secao titulo="A confirmar" cor="yellow.4">
						{aConfirmar.map((t) => (
							<Linha
								key={t.id}
								t={t}
								detalhe={`Dia ${new Date(t.data).getDate()} · ≈ ${Dinheiro.formatar(t.valor)}`}
								acao={
									<Button size="xs" variant="light" onClick={() => props.confirmar(t)}>
										Confirmar
									</Button>
								}
							/>
						))}
					</Secao>
				)}

				{lancadas.length > 0 && (
					<Secao titulo="Lançadas" cor="dimmed">
						{lancadas.map((t) => (
							<Linha
								key={t.id}
								t={t}
								detalhe={`Dia ${new Date(t.data).getDate()}`}
								acao={
									<Group gap={6} wrap="nowrap">
										<Anchor
											component="button"
											type="button"
											underline="never"
											onClick={() => props.aoClicar(t)}
											aria-label={`Editar ${t.descricao || t.categoria}`}
										>
											<ValorTransacao valor={t.valor} tipo={t.tipo} size="sm" />
										</Anchor>
										<IconCheck
											size={18}
											stroke={2.4}
											color="var(--mantine-color-green-4)"
											aria-label="Lançada"
										/>
									</Group>
								}
							/>
						))}
					</Secao>
				)}

				{aConfirmar.length > 0 && (
					<Alert
						variant="light"
						color="yellow"
						icon={<IconInfoCircle size={18} />}
						py="xs"
						styles={{ message: { color: 'var(--mantine-color-dark-1)' } }}
					>
						As previstas somam{' '}
						<strong style={{ color: 'var(--mantine-color-bright)' }}>
							≈ {Dinheiro.formatar(totalPrevisto)}
						</strong>{' '}
						e só entram no saldo depois que você confirmar o valor.
					</Alert>
				)}
			</Stack>
		</Cartao>
	)
}
