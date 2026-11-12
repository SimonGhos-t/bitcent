'use client'
import { Modal, Stack, Text, Title } from '@mantine/core'
import Transacao, { criarTransacaoVazia } from '../../logic/core/financas/Transacao'
import Data from '../../logic/utils/Data'
import FormularioTransacao from './FormularioTransacao'

interface ModalTransacaoProps {
	aberto: boolean
	fechar: () => void
	// Sem transação (ou sem id) = cadastrar nova
	transacao?: Transacao | null
	salvar: (transacao: Transacao) => Promise<void> | void
	excluir: (transacao: Transacao) => Promise<void> | void
}

export default function ModalTransacao(props: ModalTransacaoProps) {
	const editando = !!props.transacao?.id

	return (
		<Modal
			opened={props.aberto}
			onClose={props.fechar}
			centered
			size="lg"
			title={
				<Stack gap={0}>
					<Title order={3} size="h4">
						{editando ? 'Editar transação' : 'Nova transação'}
					</Title>
					{editando && props.transacao && (
						<Text size="sm" c="dimmed">
							{props.transacao.descricao || props.transacao.categoria} ·{' '}
							{Data.ddmmyy.formatar(props.transacao.data)}
						</Text>
					)}
				</Stack>
			}
		>
			<FormularioTransacao
				key={props.transacao?.id ?? 'nova'}
				modo={editando ? 'editar' : 'nova'}
				transacao={editando && props.transacao ? props.transacao : criarTransacaoVazia()}
				salvar={props.salvar}
				excluir={props.excluir}
				fechar={props.fechar}
			/>
		</Modal>
	)
}
