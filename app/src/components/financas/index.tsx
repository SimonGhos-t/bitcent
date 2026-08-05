'use client'
import Cabecalho from '../template/Cabecalho'
import Conteudo from '../template/Conteudo'
import Pagina from '../template/Pagina'
import Lista from './Lista'
import { transacaoVazia } from '../../logic/core/financas/Transacao'
import Formulario from './Formulario'
import NaoEncontrado from '../template/NaoEncontrado'
import { Button, SegmentedControl } from '@mantine/core'
import { IconLayoutGrid, IconList, IconPlus } from '@tabler/icons-react'
import UseTransacao, { TipoExibicao } from '../../data/hooks/useTransacao'
import CampoMesAno from '../template/CampoMesAno'
import Grade from './Grade'
import Resumo from './Resumo'

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
							{ label: <IconList />, value: 'lista' },
							{ label: <IconLayoutGrid />, value: 'grade' },
						]}
						onChange={(tipo) => alterarTipoExibicao(tipo as TipoExibicao)}
					/>
				</div>
			</div>
		)
	}

	function renderizarTransacoes() {
		return tipoExibicao === 'lista' ? (
			<Lista transacoes={transacoes} selecionarTransacao={selecionar} />
		) : (
			<Grade transacoes={transacoes} selecionarTransacao={selecionar} />
		)
	}

	return (
		<Pagina>
			<Cabecalho />
			<Conteudo className="gap-5">
				<Button className="bg-blue-500 max-w-xl" onClick={() => selecionar(transacaoVazia)}>
					<IconPlus />
					<span>Nova Transação</span>
				</Button>
				<Resumo transacoes={transacoes} className="mb-7" />
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
			</Conteudo>
		</Pagina>
	)
}
