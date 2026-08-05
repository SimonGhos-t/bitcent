'use client'
import { Button, NumberInput, Popover } from '@mantine/core'
import { IconChevronLeft, IconChevronRight } from '@tabler/icons-react'
import { useState } from 'react'
import Data from '../../logic/utils/Data'

export interface CampoMesAnoProps {
	data?: Date
	dataMudou?: (data: Date) => void
}

export default function CampoMesAno(props: CampoMesAnoProps) {
	const hoje = new Date()

	const [data, setData] = useState<Date>(
		new Date(
			props.data?.getFullYear() ?? hoje.getFullYear(),
			props.data?.getMonth() ?? hoje.getMonth(),
			1,
		),
	)

	function alterarAno(ano: any) {
		if (!ano) return
		const novaData = new Date(data)
		novaData.setFullYear(ano)
		setData(novaData)
		props.dataMudou?.(novaData)
	}

	function alterarMes(mes: number) {
		const novaData = new Date(data)
		novaData.setMonth(mes)
		setData(novaData)
		props.dataMudou?.(novaData)
	}

	function incrementar() {
		const novaData = new Date(data)
		novaData.setMonth(novaData.getMonth() + 1)
		setData(novaData)
		props.dataMudou?.(novaData)
	}

	function decrementar() {
		const novaData = new Date(data)
		novaData.setMonth(novaData.getMonth() - 1)
		setData(novaData)
		props.dataMudou?.(novaData)
	}

	return (
		<div className="flex items-center gap-1 h-12">
			<button
				onClick={incrementar}
				className="flex justify-center items-center bg-[#424242]
                text-white cursor-pointer h-9 w-5 rounded-sm"
			>
				<IconChevronLeft size={14} />
			</button>
			<Popover withArrow>
				<Popover.Target>
					<Button
						className={`
                        bg-linear-to-r from-indigo-600 to-cyan-600
                        text-white cursor-pointer select-none 
                        md:w-44 text-xs md:text-base px-0 md:px-3
                    `}
					>
						<span>{Data.mmyy.formatar(data)}</span>
					</Button>
				</Popover.Target>
				<Popover.Dropdown>
					<div className="flex justify-center mb-5">
						<NumberInput value={data.getFullYear()} onChange={alterarAno} />
					</div>
					<div className="grid grid-cols-3 gap-3">
						{Data.meses().map((mes, i) => {
							const selecionada = data.getMonth() === i
							return (
								<Button
									key={i}
									color={selecionada ? 'red' : 'blue'}
									className={`${selecionada ? 'bg-red-500' : 'bg-blue-500'}`}
									onClick={() => alterarMes(i)}
								>
									{mes}
								</Button>
							)
						})}
					</div>
				</Popover.Dropdown>
			</Popover>
			<button
				onClick={incrementar}
				className="flex justify-center items-center bg-[#424242]
                text-white cursor-pointer h-9 w-5 rounded-sm"
			>
				<IconChevronRight size={14} />
			</button>
		</div>
	)
}
