'use client'
import { Button, Modal } from '@mantine/core'
import { IconCashBanknotePlus, IconClipboardList, IconEdit } from '@tabler/icons-react'
import useTransacao from '../../src/data/hooks/useTransacao'
import CampoMesAno from '../../src/components/template/CampoMesAno'
import Resumo from '../../src/components/financas/Resumo'
import PaginaInicial from '@/app/src/components/template/PaginaInicial'
import { transacaoVazia } from '@/app/src/logic/core/financas/Transacao'
import { useDisclosure } from '@mantine/hooks'
import NovaTransacao from '../../src/components/financas/NovaTransacao'
import EditarTransacao from '@/app/src/components/financas/EditarTransacao'
import TituloFormulario from '@/app/src/components/template/TituloFormulario'

export default function Inicio() {
	const { data, alterarData, transacoes, transacaoSelecionada, selecionar, salvar, excluir } =
		useTransacao()
	const [novaTransacaoAberta, { open: novaTransacao, close: fecharTransacao }] =
		useDisclosure(false)
	const [editarTransacaoAberta, { open: editarTransacao, close: fecharEdicao }] =
		useDisclosure(false)

	return (
		<PaginaInicial>
			<Resumo transacoes={transacoes} className="mb-5" />
			<div className='flex flex-1 justify-between'>
				<Button
					leftSection={<IconCashBanknotePlus />}
					onClick={() => {
						;(selecionar(transacaoVazia), novaTransacao())
					}}
					className="mb-2 min-h-10"
					variant="gradient"
					gradient={{ from: 'blue', to: 'cyan', deg: 90 }}
					size="md"
				>
					Nova Transação
				</Button>
				<CampoMesAno data={data} dataMudou={alterarData} />
			</div>
			<Modal
				opened={novaTransacaoAberta}
				onClose={fecharTransacao}
				centered
				size={'lg'}
				title={
					<TituloFormulario
						icone={<IconClipboardList />}
						titulo="Cadastrar nova transação"
					/>
				}
			>
				<NovaTransacao
					transacao={transacaoVazia}
					salvar={salvar}
					excluir={excluir}
					fechar={fecharTransacao}
				/>
			</Modal>
			<Modal
				opened={editarTransacaoAberta}
				onClose={fecharEdicao}
				centered
				size={'lg'}
				title={<TituloFormulario icone={<IconEdit />} titulo="Editar transação" />}
			>
				<EditarTransacao
					transacao={transacaoSelecionada ?? transacaoVazia}
					excluir={excluir}
					salvar={salvar}
					fechar={fecharEdicao}
				/>
			</Modal>
		</PaginaInicial>
	)
}
