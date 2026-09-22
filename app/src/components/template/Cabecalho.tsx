import BoasVindas from './BoasVindas'
import BotaoMenuLateral from './BotaoMenuLateral'
import MostrarUsuario from './MostrarUsuario'

export interface CabecalhoProps {
	aberto: boolean
	aoAlternar: () => void
}

export default function Cabecalho(props: CabecalhoProps) {
	return (
		<div className="flex justify-between min-h-16 sm:min-h-18 items-center px-5 sm:px-8 border-b border-zinc-800">
			<div className="flex items-center gap-3">
				<BotaoMenuLateral aberto={props.aberto} aoAlternar={props.aoAlternar}/>
				<BoasVindas />
				{/* <BotaoMenuLateral aberto={props.aberto} aoAlternar={props.aoAlternar} className='hidden'/> */}
			</div>
			<MostrarUsuario />
		</div>
	)
}
