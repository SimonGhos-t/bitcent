'use client'
import TituloPagina from '@/app/src/components/template/TituloPagina'
import { IconForms } from '@tabler/icons-react'
import Formularios from '@/app/src/components/usuario/Formularios'
import PaginaInicial from '@/app/src/components/template/PaginaInicial'
import { useContext } from 'react'
import AutenticacaoContext from '@/app/src/data/contexts/AutenticacaoContext'

export default function Home() {
	const { usuario } = useContext(AutenticacaoContext)

	return (
		<PaginaInicial>
			<TituloPagina
				icone={<IconForms />}
				principal="Dados Cadastrais"
				secundario={`Informações de ${usuario?.email ?? ''}`}
			/>
			<Formularios />
		</PaginaInicial>
	)
}
