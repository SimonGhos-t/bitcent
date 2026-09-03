import BoasVindas from "./BoasVindas";
import MenuUsuario from "./MenuFlutuante";

export default function Cabecalho() {
    return (
		<div className="flex justify-between items-center p-4 sm:p-7 border-b bg-black border-zinc-900 shadow shadow-blue-950">
			<BoasVindas />
			<MenuUsuario />
		</div>
	)
}