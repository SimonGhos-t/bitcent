import React from 'react'
import Dinheiro from '../../logic/utils/Dinheiro'
import { IconRosetteNumber1, IconRosetteNumber2, IconRosetteNumber3 } from '@tabler/icons-react'
import Transacao from '../../logic/core/financas/Transacao'

interface ResumoMaiorDespesaProps {
	transacoes?: Transacao[]
}

export default function ResumoMaiorDespesa(props: ResumoMaiorDespesaProps) {
	return (
		<div className='grid grid-cols-2 gap-3'>
			<div
				className="flex flex-col justify-between bg-black p-3 mb-3 rounded-lg
            border border-zinc-800 text-white shadow shadow-blue-950 bg"
			>
				{' '}
				<div className="ml-11 text-sm text-zinc-500">Por categoria</div>
				<div className="flex flex-col">
					<DespesaItem valor={3000} icone={<IconRosetteNumber1 />} corIcone="gold" />
					<DespesaItem valor={2000} icone={<IconRosetteNumber2 />} corIcone="white" />
					<DespesaItem valor={1500} icone={<IconRosetteNumber3 />} corIcone="orange" />
				</div>
			</div>
			<div
				className="flex flex-col justify-between bg-black p-3 mb-3 rounded-lg
            border border-zinc-800 text-white shadow shadow-blue-950 bg"
			>
				{' '}
				<div className="ml-11 text-sm text-zinc-500">Por descrição</div>
				<div className="flex flex-col">
					<DespesaItem valor={3000} icone={<IconRosetteNumber1 />} corIcone="gold" />
					<DespesaItem valor={2000} icone={<IconRosetteNumber2 />} corIcone="white" />
					<DespesaItem valor={1500} icone={<IconRosetteNumber3 />} corIcone="orange" />
				</div>
			</div>
		</div>
	)
}

interface DespesaItemProps {
	valor: number
	icone: any
	corIcone: string
}

function DespesaItem(props: DespesaItemProps) {
	return (
		<div className="flex flex-1 justify-between items-center p-1">
			<div className="flex items-center gap-1">
				<span>
					{React.cloneElement(props.icone, {
						size: 35,
						stroke: 1,
						color: props.corIcone,
					})}
				</span>
				<span className="text-2xl font-semibold">{Dinheiro.formatar(props.valor)}</span>
			</div>
		</div>
	)
}
