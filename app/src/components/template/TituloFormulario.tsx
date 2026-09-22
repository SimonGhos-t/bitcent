import React from "react"

interface TituloForularioProps {
	icone: any
	titulo: string
	descricao?: string
}

export default function TituloFormulario(props: TituloForularioProps) {
	return (
		<div className="flex gap-1 items-center text-zinc-300">
			<span>
				{React.cloneElement(props.icone, {
					size: 30,
					stroke: 1,
				})}
			</span>
			<span className="text-lg font-semibold">{props.titulo}</span>
			<span>{props.descricao}</span>
		</div>
	)
}
