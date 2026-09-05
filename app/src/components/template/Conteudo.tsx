interface ConteudoProps {
    children: any
    className?: string
}

export default function Conteudo(props: ConteudoProps) {
    return (
		<div
			className={`flex flex-col h-full px-5 py-3 sm:p-8 bg-linear-to-r from-zinc-900 via-black to-zinc-900 ${props.className ?? ''}`}
		>
			{props.children}
		</div>
	)
}