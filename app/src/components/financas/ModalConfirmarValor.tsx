'use client'
import 'dayjs/locale/pt-br'
import { Anchor, Button, Group, Modal, Paper, Stack, Text, TextInput } from '@mantine/core'
import { DatePickerInput } from '@mantine/dates'
import { IconCalendarWeek, IconCheck, IconInfoCircle } from '@tabler/icons-react'
import dayjs from 'dayjs'
import { useState } from 'react'
import Transacao from '../../logic/core/financas/Transacao'
import Dinheiro from '../../logic/utils/Dinheiro'
import Data from '../../logic/utils/Data'
import IconeTransacao from './IconeTransacao'

interface ModalConfirmarValorProps {
	transacao: Transacao | null
	fechar: () => void
	confirmar: (transacao: Transacao, valor: number, data: Date) => Promise<void>
	// Abre o formulário completo (mudar categoria, excluir...)
	editarTudo: (transacao: Transacao) => void
}

// Conta de valor variável: troca o valor previsto pelo valor real
export default function ModalConfirmarValor(props: ModalConfirmarValorProps) {
	return (
		<Modal
			opened={!!props.transacao}
			onClose={props.fechar}
			title="Confirmar valor"
			centered
			size="md"
		>
			{props.transacao && (
				<Conteudo key={props.transacao.id} {...props} transacao={props.transacao} />
			)}
		</Modal>
	)
}

function Conteudo(props: ModalConfirmarValorProps & { transacao: Transacao }) {
	const t = props.transacao
	const [valor, setValor] = useState(t.valor)
	const [data, setData] = useState<Date>(new Date(t.data))
	const [salvando, setSalvando] = useState(false)
	const diferenca = valor - t.valor
	const mes = Data.mmyy.formatar(new Date(t.data)).split(' de ')[0]

	async function confirmar() {
		if (valor <= 0 || salvando) return
		setSalvando(true)
		try {
			await props.confirmar(t, valor, data)
			props.fechar()
		} finally {
			setSalvando(false)
		}
	}

	return (
		<form
			onSubmit={(e) => {
				e.preventDefault()
				confirmar()
			}}
		>
			<Stack gap="md">
				<Paper withBorder radius="md" p="sm" bg="dark.9">
					<Group wrap="nowrap" gap="sm">
						<IconeTransacao categoria={t.categoria} tipo={t.tipo} />
						<div className="flex-1 min-w-0">
							<Text fw={700} c="bright" truncate>
								{t.descricao || t.categoria} · {mes}
							</Text>
							<Text size="sm" c="dimmed" truncate>
								{t.categoria}
							</Text>
						</div>
						<div className="text-right">
							<Text size="xs" c="dimmed">
								Previsto
							</Text>
							<Text fw={700} c="dark.2">
								{Dinheiro.formatar(t.valor)}
							</Text>
						</div>
					</Group>
				</Paper>

				<TextInput
					label="Valor real da conta"
					size="lg"
					inputMode="numeric"
					data-autofocus
					leftSection={
						<Text c="dimmed" fw={600}>
							R$
						</Text>
					}
					styles={{
						label: { fontSize: 'var(--mantine-font-size-sm)', fontWeight: 500 },
						input: { fontWeight: 700, fontSize: 22 },
					}}
					value={Dinheiro.formatarNumero(valor)}
					onChange={(e) => setValor(Dinheiro.desformatar(e.currentTarget.value))}
					description={
						diferenca === 0
							? 'Igual ao previsto'
							: `${Dinheiro.formatar(Math.abs(diferenca))} a ${diferenca > 0 ? 'mais' : 'menos'} que o previsto`
					}
					inputWrapperOrder={['label', 'input', 'description']}
				/>

				<DatePickerInput
					label="Data"
					leftSection={<IconCalendarWeek size={18} />}
					locale="pt-br"
					valueFormat="DD/MM/YYYY"
					firstDayOfWeek={0}
					value={data}
					onChange={(v) => v && setData(dayjs(v).toDate())}
				/>

				<Group gap={8} wrap="nowrap" align="flex-start">
					<IconInfoCircle
						size={18}
						color="var(--mantine-color-cyan-4)"
						style={{ flexShrink: 0, marginTop: 2 }}
						aria-hidden
					/>
					<Text size="sm" c="dark.1">
						Ao confirmar, a conta passa a contar nas despesas e no saldo de {mes}. O
						valor previsto dos próximos meses continua {Dinheiro.formatar(t.valor)}.
					</Text>
				</Group>
			</Stack>

			<Group
				justify="space-between"
				gap="xs"
				mt="lg"
				pt="md"
				style={{ borderTop: '1px solid var(--mantine-color-dark-5)' }}
			>
				<Anchor component="button" type="button" size="sm" onClick={() => props.editarTudo(t)}>
					Editar tudo
				</Anchor>
				<Group gap="xs">
					<Button variant="subtle" color="gray" onClick={props.fechar}>
						Cancelar
					</Button>
					<Button
						type="submit"
						color="green.9"
						leftSection={<IconCheck size={18} />}
						loading={salvando}
						disabled={valor <= 0}
					>
						Confirmar valor
					</Button>
				</Group>
			</Group>
		</form>
	)
}
