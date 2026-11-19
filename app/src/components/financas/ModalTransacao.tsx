'use client'
import { Modal, Stack, Text, Title } from '@mantine/core'
import Transacao, { criarTransacaoVazia } from '../../logic/core/financas/Transacao'
import Recorrencia from '../../logic/core/financas/Recorrencia'
import { EscopoParcela } from '../../logic/core/financas/ServicosParcelas'
import { ComoLancar, OpcoesSalvar } from '../../data/contexts/TransacaoContext'
import Data from '../../logic/utils/Data'
import FormularioTransacao from './FormularioTransacao'
import useCelular from '../../data/hooks/useCelular'

interface ModalTransacaoProps {
	aberto: boolean
	fechar: () => void
	// Sem transação (ou sem id) = cadastrar nova
	transacao?: Transacao | null
	comoLancar?: ComoLancar
	recorrencias?: Recorrencia[]
	salvar: (transacao: Transacao, opcoes?: OpcoesSalvar) => Promise<void> | void
	excluir: (transacao: Transacao, escopo?: EscopoParcela) => Promise<void> | void
	consultarCompra?: (parcela: Transacao) => Promise<Transacao[]>
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
							: props.comoLancar === 'mensal'
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
				key={props.transacao?.id ?? `nova-${props.comoLancar ?? 'uma'}`}
				modo={editando ? 'editar' : 'nova'}
				comoLancar={props.comoLancar}
				recorrencias={props.recorrencias}
				consultarCompra={props.consultarCompra}
				transacao={editando && props.transacao ? props.transacao : criarTransacaoVazia()}
				salvar={props.salvar}
				excluir={props.excluir}
				fechar={props.fechar}
			/>
		</Modal>
	)
}
