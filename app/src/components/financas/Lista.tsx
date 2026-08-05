import { IconCalendarWeek, IconTrendingDown, IconTrendingUp } from '@tabler/icons-react'
import Transacao from '../../logic/core/financas/Transacao'
import Data from '../../logic/utils/Data'
import Dinheiro from '../../logic/utils/Dinheiro'

interface ListaProps {
	transacoes: Transacao[]
	selecionarTransacao?: (transacao: Transacao) => void
}

export default function Lista(props: ListaProps) {
	function renderizarTipo(transacao: Transacao) {
		return (
			<span
				className={`flex justify-center items-center h-8 w-8 sm:w-10 sm:h-10 rounded-full 
                    ${transacao.tipo === 'receita' ? 'bg-green-500' : 'bg-red-500'}`}
			>
				{transacao.tipo === 'receita' ? <IconTrendingUp /> : <IconTrendingDown />}
			</span>
		)
	}
	
	function renderizarLinha(transacao: Transacao, indice: number) {
		return (
			<div
				key={transacao.id}
				className={`flex items-center gap-3 p-1.5 px-7 cursor-pointer ${indice % 2 === 0 ? 'bg-zinc-900' : 'bg-zinc-800'}`}
				onClick={() => props.selecionarTransacao?.(transacao)}
			>
				{renderizarTipo(transacao)}
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
		<div className="flex flex-col border border-zinc-700 rounded-xl overflow-hidden">
			{props.transacoes.map(renderizarLinha)}
		</div>
	)
}
