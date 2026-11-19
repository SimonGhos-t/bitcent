'use client'
import { Button, Group, Modal, Radio, Stack, Text } from '@mantine/core'
import { IconDeviceFloppy } from '@tabler/icons-react'

export interface OpcaoEscopo<T extends string> {
	valor: T
	titulo: string
	descricao: string
	desabilitada?: boolean
}

interface ModalEscopoProps<T extends string> {
	aberto: boolean
	titulo: string
	opcoes: OpcaoEscopo<T>[]
	valor: T
	alterar: (valor: T) => void
	acao: 'salvar' | 'excluir'
	textoAcao?: string
	carregando?: boolean
	confirmar: () => void
	fechar: () => void
}

// "Só este mês / esta parcela" × "este e os próximos" (× "a compra inteira")
export default function ModalEscopo<T extends string>(props: ModalEscopoProps<T>) {
	return (
		<Modal opened={props.aberto} onClose={props.fechar} title={props.titulo} centered size="md">
			<Radio.Group value={props.valor} onChange={(v) => props.alterar(v as T)}>
				<Stack gap="sm">
					{props.opcoes.map((o) => (
						<Radio.Card
							key={o.valor}
							value={o.valor}
							radius="md"
							p="md"
							disabled={o.desabilitada}
							style={{ opacity: o.desabilitada ? 0.45 : 1 }}
						>
							<Group wrap="nowrap" align="flex-start">
								<Radio.Indicator disabled={o.desabilitada} />
								<div>
									<Text fw={700} c="bright">
										{o.titulo}
									</Text>
									<Text size="sm" c="dimmed">
										{o.descricao}
									</Text>
								</div>
							</Group>
						</Radio.Card>
					))}
				</Stack>
			</Radio.Group>
			<Group justify="flex-end" mt="lg">
				<Button variant="subtle" color="gray" onClick={props.fechar}>
					Cancelar
				</Button>
				{props.acao === 'excluir' ? (
					<Button color="red.9" loading={props.carregando} onClick={props.confirmar}>
						{props.textoAcao ?? 'Excluir'}
					</Button>
				) : (
					<Button
						color="green.9"
						loading={props.carregando}
						leftSection={<IconDeviceFloppy size={18} />}
						onClick={props.confirmar}
					>
						{props.textoAcao ?? 'Salvar alteração'}
					</Button>
				)}
			</Group>
		</Modal>
	)
}
