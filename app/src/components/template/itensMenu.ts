import { IconHomeDollar, IconRepeat, IconReportMoney, IconUser } from '@tabler/icons-react'

// nomeCurto: rótulo da barra inferior do celular, onde o espaço é menor
export const itensMenu: { nome: string; nomeCurto?: string; href: string; icone: typeof IconUser }[] = [
	{ nome: 'Início', href: '/inicio', icone: IconHomeDollar },
	{ nome: 'Transações', href: '/transacoes', icone: IconReportMoney },
	{ nome: 'Contas fixas', href: '/contas-fixas', icone: IconRepeat },
	{ nome: 'Meus dados', href: '/usuario', icone: IconUser },
]
