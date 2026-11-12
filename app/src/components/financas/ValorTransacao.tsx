import { Text, TextProps } from '@mantine/core'
import { TipoTransacao } from '../../logic/core/financas/TipoTransacao'
import Dinheiro from '../../logic/utils/Dinheiro'

// Valor com sinal e cor: receita "+" verde, despesa "−" vermelha, guardado azul
export default function ValorTransacao(props: TextProps & { valor: number; tipo: TipoTransacao }) {
	const { valor, tipo, ...resto } = props
	const sinal = tipo === TipoTransacao.RECEITA ? '+' : '−'
	const cor =
		tipo === TipoTransacao.RECEITA
			? 'green.4'
			: tipo === TipoTransacao.DESPESA
				? 'red.4'
				: 'blue.3'
	return (
		<Text fw={700} c={cor} style={{ whiteSpace: 'nowrap' }} {...resto}>
			{sinal}
			{Dinheiro.formatar(valor)}
		</Text>
	)
}
