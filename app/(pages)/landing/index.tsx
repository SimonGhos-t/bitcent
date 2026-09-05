import Pagina from '../../src/components/template/Pagina'
import Cabecalho from '../../src/components/landing/cabecalho'
import Depoimentos from '../../src/components/landing/depoimentos'
import Destaque from '../../src/components/landing/destaque'
import Rodape from '../../src/components/landing/rodape'
import Vantagens from '../../src/components/landing/vantagens'

export default function Landing() {
	return (
		<Pagina externa className='flex-col'>
			<Cabecalho />
			<Destaque />
			<Vantagens />
			<Depoimentos />
			<Rodape />
		</Pagina>
	)
}
