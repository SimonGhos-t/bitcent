import Image from 'next/image'
import Link from 'next/link'
import logo from '../../../../public/logo.jpg'
import nome from '../../../../public/nome-logo.jpg'

export default function Logo() {
	return (
		<Link
			href="/inicio"
			className="flex items-center gap-1"
			aria-label="BitCent, ir para o início"
		>
			<Image src={logo} alt="" height={44} width={44} />
			<Image src={nome} alt="" height={36} width={72} />
		</Link>
	)
}
