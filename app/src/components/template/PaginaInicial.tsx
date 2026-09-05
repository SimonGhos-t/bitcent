'use client'
import Cabecalho from './Cabecalho'
import Conteudo from './Conteudo'
import MenuLateral from './MenuLateral'
import Pagina from './Pagina'
import { ReactNode } from 'react'
import { useDisclosure } from '@mantine/hooks'
import { redirect } from 'next/navigation'

interface PaginaInicialProps {
	children?: ReactNode
}

export default function PaginaInicial(props: PaginaInicialProps) {
	const [menuAberto, { toggle: alternarMenu }] = useDisclosure(true)
	if (!props.children) {
		return redirect('/financas')
	}

	return (
		<Pagina>
			<MenuLateral aberto={menuAberto} />
			<div className="flex flex-col flex-1">
				<Cabecalho aberto={menuAberto} aoAlternar={alternarMenu} />
				<Conteudo>{props.children}</Conteudo>
			</div>
		</Pagina>
	)
}
