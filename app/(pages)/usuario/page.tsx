'use client'
import Formularios from '@/app/src/components/usuario/Formularios'
import PaginaInicial from '@/app/src/components/template/PaginaInicial'
import { useContext } from 'react'
import AutenticacaoContext from '@/app/src/data/contexts/AutenticacaoContext'

export default function Home() {
	const { usuario } = useContext(AutenticacaoContext)

	return (
		<PaginaInicial
			titulo="Meus dados"
			subtitulo={`Informações da conta ${usuario?.email ?? ''}`}
		>
			<Formularios />
		</PaginaInicial>
	)
}
