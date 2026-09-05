'use client'
import Link from 'next/link'
import {
	IconArrowsRightLeft,
	IconLogout,
	IconUser,
} from '@tabler/icons-react'
import React, { useContext } from 'react'
import AutenticacaoContext from '../../data/contexts/AutenticacaoContext'
import Logo from './Logo'

interface MenuLateralProps {
	aberto: boolean
}

export default function MenuLateral(props: MenuLateralProps) {
	const { logout } = useContext(AutenticacaoContext)
	return (
		<div
			className={`flex flex-col h-screen border-r bg-black border-zinc-800 transition-all duration-300 overflow-hidden ${props.aberto ? 'w-75 p-3' : 'w-0 p-0 border-0'}`}
		>
			<Logo/>
			<div className="flex flex-col flex-1 pt-7 border-y border-zinc-800">
				<Link href={'/financas'}>
					<MenuItem icone={<IconArrowsRightLeft />} nome="Finanças" />
				</Link>
				<Link href={'/usuario'}>
					<MenuItem icone={<IconUser />} nome="Meus Dados" />
				</Link>
			</div>
			<div className="flex flex-col py-7">
				<MenuItem icone={<IconLogout />} nome="Sair" onClick={logout} />
			</div>
		</div>
	)
}

interface MenuItemProps {
	nome: string
	icone: React.ReactElement<{ size?: number; stroke?: number }>
	onClick?: () => void
}

function MenuItem(props: MenuItemProps) {
	return (
		<div
			onClick={props.onClick}
			className="flex gap-2.5 p-3 hover:bg-zinc-700 rounded-md items-center text-zinc-400 hover:text-white cursor-pointer"
		>
			{React.cloneElement(props.icone, {
				size: 25,
				stroke: 1,
			})}
			<span>{props.nome}</span>
		</div>
	)
}
