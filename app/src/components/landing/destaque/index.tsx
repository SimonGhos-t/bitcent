import Area from '../comum/Area'
import ImagemResponsiva from '../comum/ImagemResponsiva'
import Slogan from './Slogan'
import principal from '../../../../../public/principal-3.jpg'

export default function Destaque() {
	return (
		<Area id="inicio" className="pt-20">
			<div className={`flex items-center h-125 justify-around`}>
				<Slogan />
				<ImagemResponsiva imagem={principal} className='rotate-3 hidden md:inline'/>
			</div>
		</Area>
	)
}
