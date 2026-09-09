'use client'
import { ReactNode } from 'react'
import ForcarAutenticacao from '../autenticacao/ForcarAutenticacao'

interface PaginaProps {
	externa?: boolean
	children: ReactNode
	className?: string
}

export default function Pagina(props: PaginaProps) {
	function renderizar() {
		return <div className={`flex h-screen w-full ${props.className ?? ''}`}>{props.children}</div>
	}

	return props.externa ? renderizar() : <ForcarAutenticacao>{renderizar()}</ForcarAutenticacao>
}
