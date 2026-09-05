'use client'
import Lista from '../../src/components/financas/Lista'
import Formulario from '../../src/components/financas/Formulario'
import NaoEncontrado from '../../src/components/template/NaoEncontrado'
import { Button, SegmentedControl } from '@mantine/core'
import { IconCashBanknotePlus, IconLayoutGrid, IconList } from '@tabler/icons-react'
import UseTransacao, { TipoExibicao } from '../../src/data/hooks/useTransacao'
import CampoMesAno from '../../src/components/template/CampoMesAno'
import Grade from '../../src/components/financas/Grade'
import Resumo from '../../src/components/financas/Resumo'
import PaginaInicial from '@/app/src/components/template/PaginaInicial'
import { transacaoVazia } from '@/app/src/logic/core/financas/Transacao'

export default function Finanças() {
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
	} = UseTransacao()

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
			<Grade transacoes={transacoes} selecionarTransacao={selecionar} />
		) : (
			<Lista transacoes={transacoes} selecionarTransacao={selecionar} />
		)
	}

	return (
		<PaginaInicial>
			<Button
				leftSection={<IconCashBanknotePlus />}
				onClick={() => selecionar(transacaoVazia)}
				className="mb-2"
				variant="gradient"
				gradient={{ from: 'blue', to: 'cyan', deg: 90 }}
				size="md"
			>
				Nova Transação
			</Button>
			<Resumo transacoes={transacoes} className="mb-5" />
			{renderizarBotoes()}
			{transacaoSelecionada ? (
				<Formulario
					transacao={transacaoSelecionada}
					cancelar={() => selecionar(null)}
					salvar={salvar}
					excluir={excluir}
				/>
			) : transacoes.length ? (
				renderizarTransacoes()
			) : (
				<NaoEncontrado>Nenhuma transação encontrada</NaoEncontrado>
			)}
		</PaginaInicial>
	)
}
