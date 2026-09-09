'use client'
import Link from 'next/link'
import { IconArrowsRightLeft, IconLogout, IconUser, IconX } from '@tabler/icons-react'
import React, { useContext } from 'react'
import AutenticacaoContext from '../../data/contexts/AutenticacaoContext'
import Logo from './Logo'

interface MenuLateralProps {
	aberto: boolean
	aoAlternar: () => void
}

export default function MenuLateral(props: MenuLateralProps) {
	const { logout } = useContext(AutenticacaoContext)
	return (
		<div
			className={`flex flex-col h-screen border-r bg-black border-zinc-800 sm:transition-all sm:duration-300 overflow-hidden z-30 ${props.aberto ? 'w-60 sm:w-80 p-3 absolute sm:relative' : 'w-0 p-0 border-0'}`}
		>
			<div className="flex items-center justify-between">
				<Logo />
				<BotaoFecharMenu fecharMenu={props.aoAlternar} />
			</div>
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

function BotaoFecharMenu(props: {fecharMenu: () => void}) {
	return(
		<div className='text-zinc-300 sm:hidden' onClick={props.fecharMenu}>
			<IconX size={25}/>
		</div>
	)
}
