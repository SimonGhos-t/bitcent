import Image from 'next/image'
import useCategorias from '../../data/hooks/useCategorias'

export default function IconeTransacao(props: { src: string }) {
	const { iconeCategoria } = useCategorias()
	return <Image src={iconeCategoria(props.src) ?? '/icons/dots.png'} width={40} height={40} alt="Icone" />
}
