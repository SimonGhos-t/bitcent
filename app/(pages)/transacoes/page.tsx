'use client'
import EditarTransacao from '@/app/src/components/financas/EditarTransacao'
import Grade from '@/app/src/components/financas/Grade'
import Lista from '@/app/src/components/financas/Lista'
import CampoMesAno from '@/app/src/components/template/CampoMesAno'
import NaoEncontrado from '@/app/src/components/template/NaoEncontrado'
import PaginaInicial from '@/app/src/components/template/PaginaInicial'
import TituloFormulario from '@/app/src/components/template/TituloFormulario'
import TituloPagina from '@/app/src/components/template/TituloPagina'
import useTransacao, { TipoExibicao } from '@/app/src/data/hooks/useTransacao'
import { transacaoVazia } from '@/app/src/logic/core/financas/Transacao'
import { Modal, Pagination, SegmentedControl } from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import { IconEdit, IconLayoutGrid, IconList, IconReportMoney } from '@tabler/icons-react'
import { useState } from 'react'

export default function Transacoes() {
	const {
		tipoExibicao,
		transacoes,
		data,
		transacaoSelecionada,
		excluir,
		salvar,
		selecionar,
		alterarData,
		alterarTipoExibicao,
	} = useTransacao()
	const [editarTransacaoAberta, { open: editarTransacao, close: fecharEdicao }] =
		useDisclosure(false)

	function renderizarTransacoes() {
		return tipoExibicao === 'grade' ? (
			<Grade
				transacoes={transacoes}
				selecionarTransacao={selecionar}
				abrirEditar={editarTransacao}
			/>
		) : (
			<Lista
				transacoes={transacoes}
				selecionarTransacao={selecionar}
				abrirEditar={editarTransacao}
			/>
		)
	}

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

	return (
		<PaginaInicial>
			<TituloPagina
				icone={<IconReportMoney />}
				principal="Meus Registros"
				secundario="Todas as transações cadastradas"
			/>
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
			{renderizarBotoes()}
			<div className='flex flex-col h-full'>
				{transacoes.length ? (
					renderizarTransacoes()
				) : (
					<NaoEncontrado>Nenhuma transação encontrada</NaoEncontrado>
				)}
				{/* <Pagination total={transacoes.length} className='self-center'/> */}
			</div>
		</PaginaInicial>
	)
}
