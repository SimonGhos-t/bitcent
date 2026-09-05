import { Avatar } from '@mantine/core'
import { useContext } from 'react'
import AutenticacaoContext from '../../data/contexts/AutenticacaoContext'

export default function MostrarUsuario() {
	const { usuario } = useContext(AutenticacaoContext)
	return (
		<div className="flex items-center gap-2">
			<Avatar size={40} radius={'xl'} src={usuario?.imagemUrl ?? ''} />
			<div className="flex flex-col select-none pl-3">
				<span className="font-bold text-zinc-200">{usuario?.nome}</span>
				<span className="text-xs text-zinc-400">{usuario?.email}</span>
			</div>
		</div>
	)
}
