import ResumoItem from './ResumoItem'
import Transacao from '../../logic/core/financas/Transacao'
import { TipoTransacao } from '../../logic/core/financas/TipoTransacao'
import { IconArrowsDoubleNeSw, IconCash, IconCreditCard } from '@tabler/icons-react'

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

	const total = receitas - despesas

	return (
		<div className={`grid grid-cols-1 lg:grid-cols-3 gap-4 ${props.className ?? ''}`}>
			<ResumoItem
				titulo="Receitas"
				valor={receitas}
				icone={<IconCash />}
				iconeClassName="text-green-500"
			/>
			<ResumoItem
				titulo="Despesas"
				valor={despesas}
				icone={<IconCreditCard />}
				iconeClassName="text-red-500"
			/>
			<ResumoItem
				titulo="Total"
				valor={total}
				icone={<IconArrowsDoubleNeSw />}
				iconeClassName="text-blue-500"
				valorClassName={total > 0 ? 'text-green-400' : total < 0 ? 'text-red-400' : ''}
			/>
		</div>
	)
}
