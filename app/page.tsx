'use client'
import { useContext } from 'react'
import Landing from './src/components/landing'
import AutenticacaoContext from './src/data/contexts/AutenticacaoContext'
import Finanças from './src/components/financas'
import Carregando from './src/components/template/Carregando'

export default function Home() {
	const { usuario, carregando } = useContext(AutenticacaoContext)

	if(carregando) return <Carregando/>

	return usuario ? <Finanças /> : <Landing />
}
