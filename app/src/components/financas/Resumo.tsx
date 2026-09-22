import ResumoItem from './ResumoItem'
import Transacao from '../../logic/core/financas/Transacao'
import { TipoTransacao } from '../../logic/core/financas/TipoTransacao'
import {
	IconArrowsDoubleNeSw,
	IconCalendarDollar,
	IconCashPlus,
	IconCreditCard,
	IconPigMoney,
} from '@tabler/icons-react'
import TituloPagina from '../template/TituloPagina'

interface ResumoProps {
	transacoes: Transacao[]
	className?: string
}

export default function Resumo(props: ResumoProps) {
	const totalizar = (total: number, r: Transacao) => total + r.valor

	const receitas = props.transacoes
		.filter((r) => r.tipo === TipoTransacao.RECEITA)
		.reduce(totalizar, 0)

	const despesas = props.transacoes
		.filter((r) => r.tipo === TipoTransacao.DESPESA)
		.reduce(totalizar, 0)

	const guardado = props.transacoes
		.filter((r) => r.tipo === TipoTransacao.GUARDADO)
		.reduce(totalizar, 0)

	const total = receitas - despesas - guardado

	return (
		<div className="flex flex-col">
			<TituloPagina
				icone={<IconCalendarDollar />}
				principal="Resumo mensal"
				secundario="Acompanhe o que você gastou no mês"
			/>
			<div className={`grid grid-cols-1 lg:grid-cols-2 gap-3 ${props.className ?? ''}`}>
				<ResumoItem
					titulo="Receitas"
					valor={receitas}
					icone={<IconCashPlus />}
					iconeClassName="text-green-500"
				/>
				<ResumoItem
					titulo="Despesas"
					valor={despesas}
					icone={<IconCreditCard />}
					iconeClassName="text-red-500"
				/>
				<ResumoItem
					titulo="Guardado / Investido"
					valor={guardado}
					icone={<IconPigMoney />}
					iconeClassName="text-blue-500"
					valorClassName={
						guardado > 0 ? 'text-green-400' : guardado === 0 ? 'text-red-400' : ''
					}
				/>
				<ResumoItem
					titulo="Total"
					valor={total}
					icone={<IconArrowsDoubleNeSw />}
					iconeClassName="text-white"
					valorClassName={total > 0 ? 'text-green-400' : total < 0 ? 'text-red-400' : ''}
				/>
			</div>
		</div>
	)
}
