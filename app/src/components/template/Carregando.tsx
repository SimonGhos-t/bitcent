import Pagina from './Pagina'
import { Loader } from '@mantine/core'

export default function Carregando() {
	return (
		<Pagina externa className="justify-center items-center">
			<Loader size={40} color="blue" />
		</Pagina>
	)
}
