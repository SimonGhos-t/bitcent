'use client'
import { Modal, Stack, Text, Title } from '@mantine/core'
import Transacao, { criarTransacaoVazia } from '../../logic/core/financas/Transacao'
import Recorrencia from '../../logic/core/financas/Recorrencia'
import { Escopo } from '../../logic/core/financas/ServicosRecorrencia'
import { OpcoesSalvar } from '../../data/contexts/TransacaoContext'
import Data from '../../logic/utils/Data'
import FormularioTransacao from './FormularioTransacao'
import useCelular from '../../data/hooks/useCelular'

interface ModalTransacaoProps {
	aberto: boolean
	fechar: () => void
	// Sem transação (ou sem id) = cadastrar nova
	transacao?: Transacao | null
	repetir?: boolean
	recorrencias?: Recorrencia[]
	salvar: (transacao: Transacao, opcoes?: OpcoesSalvar) => Promise<void> | void
	excluir: (transacao: Transacao, escopo?: Escopo) => Promise<void> | void
}

export default function ModalTransacao(props: ModalTransacaoProps) {
	const editando = !!props.transacao?.id
	const celular = useCelular()

	return (
		<Modal
			opened={props.aberto}
			onClose={props.fechar}
			centered
			size="lg"
			// No celular o modal usa quase toda a largura, para o rodapé caber em uma linha
			xOffset={celular ? 8 : '5vw'}
			padding={celular ? 'sm' : 'md'}
			title={
				<Stack gap={0}>
					<Title order={3} size="h4">
						{editando
							? 'Editar transação'
							: props.repetir
								? 'Nova conta fixa'
								: 'Nova transação'}
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
				key={props.transacao?.id ?? (props.repetir ? 'nova-fixa' : 'nova')}
				modo={editando ? 'editar' : 'nova'}
				repetir={props.repetir}
				recorrencias={props.recorrencias}
				transacao={editando && props.transacao ? props.transacao : criarTransacaoVazia()}
				salvar={props.salvar}
				excluir={props.excluir}
				fechar={props.fechar}
			/>
		</Modal>
	)
}
