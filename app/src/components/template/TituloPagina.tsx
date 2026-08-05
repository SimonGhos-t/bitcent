import React from 'react'

interface TituloPaginaProps {
    principal: string
	icone?: any
	secundario?: string
	className?: string
}
export default function TituloPagina(props: TituloPaginaProps) {
	return (
		<div className={`flex items-center mb-4 gap-2 ${props.className ?? ''}`}>
			{props.icone && (
				<div className="text-zinc-200">
					{React.cloneElement(props.icone, {
						stroke: 1,
						size: props.secundario ? 50 : 24,
					})}
				</div>
			)}
			<div className="flex flex-col text-zinc-200">
				<h1 className="text-3xl font-black">{props.principal}</h1>
				{props.secundario && (
					<h2 className="text-zinc-400 text-sm font-thin -mt-1">{props.secundario}</h2>
				)}
			</div>
		</div>
	)
}
