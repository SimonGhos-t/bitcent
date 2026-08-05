import Image, { StaticImageData } from 'next/image'

interface ImagemResponsivaProps {
	imagem: StaticImageData
	className?: string
}

export default function ImagemResponsiva(props: ImagemResponsivaProps) {
	return (
		<Image
			src={props.imagem}
			alt="Imagem"
			className={`w-full h-30 sm:w-50 sm:h-82.5 md:w-87.5 md:h-91.25 lg:w-137.5 lg:h-91.25 rounded-xl object-cover ${props.className ?? ''}`}
		/>
	)
}
