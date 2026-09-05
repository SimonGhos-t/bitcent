import { IconTrendingDown, IconTrendingUp } from '@tabler/icons-react'
import { TipoTransacao } from '../../logic/core/financas/TipoTransacao'
import Transacao from '../../logic/core/financas/Transacao'
import Data from '../../logic/utils/Data'
import Dinheiro from '../../logic/utils/Dinheiro'

export interface GradeProps {
	transacoes: Transacao[]
	abrirEditar: () => void
	selecionarTransacao?: (transacao: Transacao) => void
}

export default function Grade(props: GradeProps) {
	function renderizarItem(transacao: Transacao) {
		function renderizarCor() {
			var cor = 'bg-blue-500'

			if (transacao.tipo === TipoTransacao.RECEITA) {
				cor = 'from-green-400 via-green-500 to-green-800'
			} else if (transacao.tipo === TipoTransacao.DESPESA) {
				cor ='from-red-400 via-red-500 to-red-700'
			} else {
				cor ='from-blue-400 via-blue-500 to-blue-800'
			}
			return cor

		}
			return (
				<div
					key={transacao.id}
					className="relative flex flex-col justify-between rounded-lg p-4 text-white overflow-hidden h-24 cursor-pointer"
					onClick={() => {props.selecionarTransacao?.(transacao), props.abrirEditar()}}
				>
					<div
						className={`absolute top-0 left-0 w-full h-full bg-linear-to-r opacity-50 ${renderizarCor()}`}
					></div>
					<div className="flex justify-between items-center">
						<span className="z-10 font-light opacity-80">{transacao.descricao}</span>
						<span className="z-10 font-light text-xs opacity-75">
							{Data.ddmm.formatar(transacao.data)}
						</span>
					</div>
					<span className="z-10 text-3xl font-black">
						{Dinheiro.formatar(transacao.valor)}
					</span>
					{transacao.tipo === TipoTransacao.RECEITA ? (
						<IconTrendingUp
							size={40}
							stroke={1}
							className="absolute bottom-1 right-2 text-white"
						/>
					) : (
						<IconTrendingDown
							size={40}
							stroke={1}
							className="absolute bottom-1 right-2 text-white"
						/>
					)}
				</div>
			)
	}

	return (
		<div className="grid grid-cols-1 sm:grid-cols-1 lg:grid-cols-4 gap-5">
			{props.transacoes.map(renderizarItem)}
		</div>
	)
}

//transacao.tipo === TipoTransacao.RECEITA ? 'from-teal-500 via-green-600 to-teal-700' : 'from-pink-500 via-red-600 to-pink-700'