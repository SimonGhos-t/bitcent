'use client'
import { Avatar, Menu, MenuItem } from '@mantine/core'
import { IconArrowsRightLeft, IconChevronRight, IconLogout, IconUser } from '@tabler/icons-react'
import Link from 'next/link'
import { useContext } from 'react'
import AutenticacaoContext from '../../data/contexts/AutenticacaoContext'

export default function MenuUsuario() {

	const { usuario, logout} = useContext(AutenticacaoContext)
	return (
		<Menu shadow="md" width={200}>
			<Menu.Target>
				<div className="flex items-center gap-3 cursor-pointer">
					<div className="hidden md:flex flex-col select-none">
						<span className="text-sm font-bold text-zinc-200">{usuario?.nome}</span>
						<span className="text-xs text-zinc-400">{usuario?.email}</span>
					</div>
					<Avatar
						size={40}
						radius={'xl'}
						src={
							usuario?.imagemUrl ??
							'https://source.unsplash.com/random/100x100/?abstract'
						}
					/>
					<IconChevronRight />
				</div>
			</Menu.Target>
			<Menu.Dropdown>
				<Menu.Label>Usuário</Menu.Label>
				<Link href="/">
					<MenuItem leftSection={<IconArrowsRightLeft size={14} />}>Finanças</MenuItem>
				</Link>
				<Link href="/usuario">
					<MenuItem leftSection={<IconUser size={14} />}>Meus Dados</MenuItem>
				</Link>
				<Menu.Divider />
				<Menu.Item color="red" leftSection={<IconLogout size={14} />} onClick={logout}>
					Sair
				</Menu.Item>
			</Menu.Dropdown>
		</Menu>
	)
}
