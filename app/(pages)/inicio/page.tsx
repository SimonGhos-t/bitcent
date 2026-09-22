'use client'
import Lista from '../../src/components/financas/Lista'
import NaoEncontrado from '../../src/components/template/NaoEncontrado'
import { Button, Modal, SegmentedControl } from '@mantine/core'
import {
	IconCashBanknotePlus,
	IconClipboardList,
	IconEdit,
	IconLayoutGrid,
	IconList,
	IconReportMoney,
} from '@tabler/icons-react'
import useTransacao, { TipoExibicao } from '../../src/data/hooks/useTransacao'
import CampoMesAno from '../../src/components/template/CampoMesAno'
import Grade from '../../src/components/financas/Grade'
import Resumo from '../../src/components/financas/Resumo'
import PaginaInicial from '@/app/src/components/template/PaginaInicial'
import { transacaoVazia } from '@/app/src/logic/core/financas/Transacao'
import { useDisclosure } from '@mantine/hooks'
import NovaTransacao from '../../src/components/financas/NovaTransacao'
import EditarTransacao from '@/app/src/components/financas/EditarTransacao'
import TituloPagina from '@/app/src/components/template/TituloPagina'
import TituloFormulario from '@/app/src/components/template/TituloFormulario'

export default function Inicio() {
	const {
		data,
		alterarData,
		tipoExibicao,
		alterarTipoExibicao,
		transacoes,
		transacaoSelecionada,
		selecionar,
		salvar,
		excluir,
	} = useTransacao()
	const [novaTransacaoAberta, { open: novaTransacao, close: fecharTransacao }] =
		useDisclosure(false)
	const [editarTransacaoAberta, { open: editarTransacao, close: fecharEdicao }] =
		useDisclosure(false)

	function renderizarBotoes() {
		return (
			<div className="flex justify-between items-center">
				<CampoMesAno data={data} dataMudou={alterarData} />
				<div className="flex justify-center items-center gap-2">
					<SegmentedControl
						data={[
							{ label: <IconLayoutGrid />, value: 'grade' },
							{ label: <IconList />, value: 'lista' },
						]}
						onChange={(tipo) => alterarTipoExibicao(tipo as TipoExibicao)}
					/>
				</div>
			</div>
		)
	}

	function renderizarTransacoes() {
		return tipoExibicao === 'grade' ? (
			<Grade
				transacoes={transacoes}
				selecionarTransacao={selecionar}
				abrirEditar={editarTransacao}
			/>
		) : (
			<Lista transacoes={transacoes} selecionarTransacao={selecionar} />
		)
	}

	return (
		<PaginaInicial>
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
			<Resumo transacoes={transacoes} className="mb-5" />
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
			<TituloPagina
				icone={<IconReportMoney />}
				principal="Meus Registros"
				secundario="Todas as transações cadastradas"
			/>
			{renderizarBotoes()}
			{transacoes.length ? (
				renderizarTransacoes()
			) : (
				<NaoEncontrado>Nenhuma transação encontrada</NaoEncontrado>
			)}
		</PaginaInicial>
	)
}
