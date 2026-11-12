'use client'
import Formularios from '@/app/src/components/usuario/Formularios'
import PaginaInicial from '@/app/src/components/template/PaginaInicial'

export default function Home() {
	return (
		<PaginaInicial titulo="Meus dados" subtitulo="Informações da conta">
			<Formularios />
		</PaginaInicial>
	)
}
