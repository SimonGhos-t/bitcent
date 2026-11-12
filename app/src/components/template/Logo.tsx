import Image from 'next/image'
import Link from 'next/link'

interface LogoProps {
	// Altura do símbolo em px; o nome acompanha a proporção
	tamanho?: number
	href?: string
}

// Símbolo + nome do BitCent (arquivos em public/marca)
export default function Logo(props: LogoProps) {
	const tamanho = props.tamanho ?? 36
	return (
		<Link
			href={props.href ?? '/inicio'}
			className="flex items-center gap-2.5"
			aria-label="BitCent, ir para o início"
		>
			<Image
				src="/marca/bitcent-simbolo.svg"
				alt=""
				width={tamanho}
				height={tamanho}
				unoptimized
				priority
			/>
			<Image
				src="/marca/bitcent-nome.svg"
				alt=""
				// o arquivo do nome tem proporção 440 × 120
				height={Math.round(tamanho * 0.72)}
				width={Math.round((tamanho * 0.72 * 440) / 120)}
				unoptimized
				priority
			/>
		</Link>
	)
}
