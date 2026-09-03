interface ConteudoProps {
    children: any
    className?: string
}

export default function Conteudo(props: ConteudoProps) {
    return (
        <div className={`flex flex-col px-5 py-3 sm:p-7 ${props.className ?? '' }`}>
            {props.children}
        </div>
    )
}