import { Avatar } from '@mantine/core'
import { useContext } from 'react'
import AutenticacaoContext from '../../data/contexts/AutenticacaoContext'

export default function MostrarUsuario() {
	const { usuario } = useContext(AutenticacaoContext)
	return (
		<div className="flex items-center gap-2">
			<Avatar size={40} radius={'xl'} src={usuario?.imagemUrl ?? ''} />
			<div className="flex flex-col">
				<span className="font-bold text-zinc-200 hidden sm:block">{usuario?.nome}</span>
				<span className="text-xs text-zinc-400 hidden sm:block">{usuario?.email}</span>
			</div>
		</div>
	)
}
