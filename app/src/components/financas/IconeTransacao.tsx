import { ThemeIcon } from '@mantine/core'
import {
	Icon,
	IconCar,
	IconCashBanknotePlus,
	IconCoin,
	IconDots,
	IconHeartbeat,
	IconHome,
	IconPigMoney,
	IconReceiptTax,
	IconRepeat,
	IconSchool,
	IconShoppingBag,
	IconTicket,
	IconToolsKitchen2,
	IconTrendingUp,
	IconUserDollar,
} from '@tabler/icons-react'
import { TipoTransacao } from '../../logic/core/financas/TipoTransacao'

const iconesPorCategoria: Record<string, Icon> = {
	Moradia: IconHome,
	Alimentação: IconToolsKitchen2,
	Lazer: IconTicket,
	Transporte: IconCar,
	Compras: IconShoppingBag,
	Dívidas: IconCoin,
	Educação: IconSchool,
	Saúde: IconHeartbeat,
	Pessoal: IconUserDollar,
	Assinaturas: IconRepeat,
	Impostos: IconReceiptTax,
	Outros: IconDots,
	Salário: IconCashBanknotePlus,
	Investimentos: IconTrendingUp,
	Economizado: IconPigMoney,
}

export const corPorTipo: Record<TipoTransacao, string> = {
	[TipoTransacao.RECEITA]: 'green',
	[TipoTransacao.DESPESA]: 'red',
	[TipoTransacao.GUARDADO]: 'blue',
}

interface IconeTransacaoProps {
	categoria: string
	tipo: TipoTransacao
	tamanho?: number
}

export default function IconeTransacao(props: IconeTransacaoProps) {
	const Icone = iconesPorCategoria[props.categoria] ?? IconDots
	const tamanho = props.tamanho ?? 38
	return (
		<ThemeIcon
			variant="light"
			color={corPorTipo[props.tipo] ?? 'gray'}
			size={tamanho}
			radius="md"
			aria-hidden
		>
			<Icone size={tamanho * 0.5} stroke={1.8} />
		</ThemeIcon>
	)
}
