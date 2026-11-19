import { Text, TextProps } from '@mantine/core'
import { TipoTransacao } from '../../logic/core/financas/TipoTransacao'
import Dinheiro from '../../logic/utils/Dinheiro'

// Valor com sinal e cor: receita "+" verde, despesa "−" vermelha, guardado "+" azul.
// Prevista (valor ainda não confirmado): "≈", em cinza e itálico.
export default function ValorTransacao(
	props: TextProps & { valor: number; tipo: TipoTransacao; prevista?: boolean },
) {
	const { valor, tipo, prevista, ...resto } = props
	if (prevista) {
		return (
			<Text fw={700} c="dimmed" fs="italic" style={{ whiteSpace: 'nowrap' }} {...resto}>
				≈ {Dinheiro.formatar(valor)}
			</Text>
		)
	}
	// Receita e valor guardado/investido somam (+); despesa subtrai (−)
	const sinal = tipo === TipoTransacao.DESPESA ? '−' : '+'
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
