'use client'
import { Button } from '@mantine/core'
import { IconCashBanknotePlus } from '@tabler/icons-react'
import { useDisclosure } from '@mantine/hooks'
import useTransacao from '../../src/data/hooks/useTransacao'
import CampoMesAno from '../../src/components/template/CampoMesAno'
import Resumo from '../../src/components/financas/Resumo'
import PaginaInicial from '@/app/src/components/template/PaginaInicial'
import ModalTransacao from '@/app/src/components/financas/ModalTransacao'

export default function Inicio() {
	const { data, alterarData, transacoes, transacaoSelecionada, selecionar, salvar, excluir } =
		useTransacao()
	const [modalAberto, { open: abrirModal, close: fecharModal }] = useDisclosure(false)

	return (
		<PaginaInicial>
			<Resumo transacoes={transacoes} className="mb-5" />
			<div className="flex flex-1 justify-between">
				<Button
					leftSection={<IconCashBanknotePlus />}
					onClick={() => {
						selecionar(null)
						abrirModal()
					}}
					className="mb-2 min-h-10"
					size="md"
				>
					Nova transação
				</Button>
				<CampoMesAno data={data} dataMudou={alterarData} />
			</div>
			<ModalTransacao
				aberto={modalAberto}
				fechar={fecharModal}
				transacao={transacaoSelecionada}
				salvar={salvar}
				excluir={excluir}
			/>
		</PaginaInicial>
	)
}
