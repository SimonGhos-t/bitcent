import TituloPagina from '@/app/src/components/template/TituloPagina'
import { IconForms } from '@tabler/icons-react'
import usuario from '@/app/src/data/constants/usuarioFalso'
import Formularios from '@/app/src/components/usuario/Formularios'
import PaginaInicial from '@/app/src/components/template/PaginaInicial'

export default function Home() {
	return (
		<PaginaInicial>
			<TituloPagina
				icone={<IconForms />}
				principal="Dados Cadastrais"
				secundario={`Informações de ${usuario.email}`}
			/>
			<Formularios />
		</PaginaInicial>
	)
}
