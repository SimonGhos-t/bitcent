import { Paper, Text, ThemeIcon } from '@mantine/core'
import {
	Icon,
	IconArrowDownLeft,
	IconArrowUpRight,
	IconPigMoney,
	IconScale,
} from '@tabler/icons-react'
import { ResumoMensal } from '../../logic/core/financas/ResumoMensal'
import Dinheiro from '../../logic/utils/Dinheiro'

interface ItemProps {
	nome: string
	icone: Icon
	cor: string
	valor: number
	sinal: '+' | '−' | ''
}

// No computador: ícone + nome + valor. No celular: só o ícone, com o valor (sem "R$")
// logo abaixo, para os quatro caberem na mesma linha
function Item(props: ItemProps) {
	return (
		<div
			className="min-w-0 flex flex-col sm:flex-row items-center gap-1 sm:gap-1.5"
			title={props.nome}
		>
			<ThemeIcon variant="light" color={props.cor} size={24} radius="md" aria-hidden>
				<props.icone size={15} stroke={2} />
			</ThemeIcon>
			<Text fz={{ base: 'xs', sm: 'md' }} style={{ whiteSpace: 'nowrap' }}>
				<span className="sr-only sm:not-sr-only">{props.nome} </span>
				<Text span fw={700} c={`${props.cor}.${props.cor === 'blue' ? 3 : 4}`} inherit>
					{props.sinal}
					<span className="hidden sm:inline">R$ </span>
					{Dinheiro.formatarNumero(props.valor)}
				</Text>
			</Text>
		</div>
	)
}

export default function TotaisTransacoes(props: { totais: ResumoMensal }) {
	const t = props.totais
	const saldoNegativo = t.saldo < 0

	return (
		<Paper withBorder radius="md" px={{ base: 'sm', sm: 'md' }} py="sm" bg="dark.7">
			<div className="grid grid-flow-col auto-cols-fr gap-2 sm:flex sm:gap-8">
				<Item
					nome="Receitas"
					icone={IconArrowDownLeft}
					cor="green"
					sinal="+"
					valor={t.receitas}
				/>
				<Item
					nome="Despesas"
					icone={IconArrowUpRight}
					cor="red"
					sinal="−"
					valor={t.despesas}
				/>
				{t.guardado > 0 && (
					<Item
						nome="Guardado"
						icone={IconPigMoney}
						cor="blue"
						sinal=""
						valor={t.guardado}
					/>
				)}
				<Item
					nome="Saldo"
					icone={IconScale}
					cor={saldoNegativo ? 'red' : 'green'}
					sinal={saldoNegativo ? '−' : '+'}
					valor={Math.abs(t.saldo)}
				/>
			</div>
		</Paper>
	)
}
