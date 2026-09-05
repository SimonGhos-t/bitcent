'use client'
import { useContext } from 'react'
import Landing from './(pages)/landing'
import AutenticacaoContext from './src/data/contexts/AutenticacaoContext'
import Carregando from './src/components/template/Carregando'
import PaginaInicial from './src/components/template/PaginaInicial'

export default function Home() {
	const { usuario, carregando } = useContext(AutenticacaoContext)

	if (carregando) return <Carregando />

	return usuario ? <PaginaInicial /> : <Landing />
}
