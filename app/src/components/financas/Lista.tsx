import { IconCalendarWeek } from '@tabler/icons-react'
import Transacao from '../../logic/core/financas/Transacao'
import Data from '../../logic/utils/Data'
import Dinheiro from '../../logic/utils/Dinheiro'
import IconeTransacao from './IconeTransacao'
import { TipoTransacao } from '../../logic/core/financas/TipoTransacao'

interface ListaProps {
	transacoes: Transacao[]
	abrirEditar: () => void
	selecionarTransacao?: (transacao: Transacao) => void
}

export default function Lista(props: ListaProps) {
	function renderizarLinha(transacao: Transacao, indice: number) {
		function renderizarCor() {
			var cor

			if (transacao.tipo === TipoTransacao.RECEITA) {
				cor = 'bg-green-500/50'
			} else if (transacao.tipo === TipoTransacao.DESPESA) {
				cor = 'bg-red-500/50'
			} else {
				cor = 'bg-blue-500/50'
			}
			return cor
		}

		return (
			<div
				key={transacao.id}
				className={`flex items-center gap-3 p-1.5 px-2 md:px-7 cursor-pointer ${indice % 2 === 0 ? 'bg-zinc-900' : 'bg-zinc-900/60'}`}
				onClick={() => {
					;(props.selecionarTransacao?.(transacao), props.abrirEditar())
				}}
			>
				<div className={`rounded-lg ${renderizarCor()} `}>
					<IconeTransacao src={transacao.categoria} />
				</div>
				<span className="w-full md:w-1/2">{transacao.descricao}</span>
				<span className="flex-1 hidden md:inline">
					<div className="flex gap-2 ">
						<IconCalendarWeek stroke={1} />
						<span>{Data.ddmmyy.formatar(transacao.data)}</span>
					</div>
				</span>
				<span>{Dinheiro.formatar(transacao.valor)}</span>
			</div>
		)
	}

	return (
		<div className="flex flex-col border border-zinc-700 rounded-xl ">
			{props.transacoes.map(renderizarLinha)}
		</div>
	)
}
