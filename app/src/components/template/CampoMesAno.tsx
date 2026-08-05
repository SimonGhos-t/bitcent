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
		<div className="flex items-center gap-2">
			<Button
				className={`
                flex justify-center items-center bg-red-500
                text-white cursor-pointer p-1
            `}
				color="red"
				onClick={decrementar}
			>
				<IconChevronLeft size={14} />
			</Button>
			<Popover withArrow>
				<Popover.Target>
					<Button
						className={`
                        bg-linear-to-r from-indigo-600 to-cyan-600
                        text-white cursor-pointer select-none 
                        w-20 md:w-44 text-xs md:text-base px-0 md:px-3
                    `}
					>
						<span className="inline">{Data.mmyy.formatar(data)}</span>
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
			<Button
				className={`
                flex justify-center items-center 
                text-white cursor-pointer
            `}
				color="red"
				onClick={incrementar}
			>
				<IconChevronRight size={14} />
			</Button>
		</div>
	)
}
