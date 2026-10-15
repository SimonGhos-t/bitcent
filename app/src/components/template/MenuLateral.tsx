'use client'
import Link from 'next/link'
import {
	IconArrowsRightLeft,
	IconHomeDollar,
	IconLogout,
	IconReportMoney,
	IconUser,
	IconX,
} from '@tabler/icons-react'
import React, { useContext, useState } from 'react'
import AutenticacaoContext from '../../data/contexts/AutenticacaoContext'
import Logo from './Logo'
import { usePathname } from 'next/navigation'

interface MenuLateralProps {
	aberto: boolean
	aoAlternar: () => void
}

export default function MenuLateral(props: MenuLateralProps) {
	const { logout } = useContext(AutenticacaoContext)
	const caminho = usePathname()

	return (
		<div
			className={`flex flex-col h-screen border-r bg-black border-zinc-800 sm:transition-all sm:duration-300 overflow-hidden z-30 ${props.aberto ? 'w-60 sm:w-80 p-3 absolute sm:relative' : 'w-0 p-0 border-0'}`}
		>
			<div className="flex items-center justify-between">
				<Logo />
				<BotaoFecharMenu fecharMenu={props.aoAlternar} />
			</div>
			<div className="flex flex-col flex-1 pt-7 border-y border-zinc-800">
				<Link href={'/inicio'}>
					<MenuItem
						icone={<IconHomeDollar />}
						nome="Início"
						selecionado={caminho.startsWith('/inicio')}
					/>
				</Link>
				<Link href={'/transacoes'}>
					<MenuItem icone={<IconReportMoney />} nome="Transações" selecionado={caminho.startsWith('/transacoes')}/>
				</Link>
				<Link href={'/usuario'}>
					<MenuItem icone={<IconUser />} nome="Meus Dados" selecionado={caminho.startsWith('/usuario')}/>
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
	selecionado?: boolean
	onClick?: () => void
	className?: string
}

function MenuItem(props: MenuItemProps) {
	const [ativo, setAtivo] = useState(false)
	return (
		<div
			onClick={props.onClick}
			className={`flex gap-2.5 p-3 rounded-md items-center  cursor-pointer ${props.selecionado ? 'bg-linear-to-r bg-blue-500 to-cyan-500 text-white' : 'hover:bg-zinc-700 hover:text-white text-zinc-400'}`}
		>
			{React.cloneElement(props.icone, {
				size: 25,
				stroke: 1,
			})}
			<span>{props.nome}</span>
		</div>
	)
}

function BotaoFecharMenu(props: { fecharMenu: () => void }) {
	return (
		<div className="text-zinc-300 sm:hidden" onClick={props.fecharMenu}>
			<IconX size={25} />
		</div>
	)
}
