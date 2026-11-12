import { createTheme, CSSVariablesResolver, MantineColorsTuple } from '@mantine/core'

// Paleta "preto + ciano" (ver o canvas de redesign)
const dark: MantineColorsTuple = [
	'#F5F7FA', // 0 – texto forte
	'#D0D5DE', // 1 – texto
	'#AEB5C2', // 2 – texto secundário
	'#8B93A3', // 3 – texto apagado
	'#3A4252', // 4 – borda de campos
	'#1C212B', // 5 – bordas de cards, trilhos
	'#0F1117', // 6 – divisórias, cabeçalhos, hover
	'#07080B', // 7 – cards e modais
	'#040506', // 8 – rodapés de cards
	'#000000', // 9 – fundo
]

export const tema = createTheme({
	colors: { dark },
	primaryColor: 'cyan',
	primaryShade: 5,
	// Texto escuro sobre o ciano (branco não tem contraste suficiente)
	autoContrast: true,
	luminanceThreshold: 0.4,
	fontFamily: 'var(--font-nunito), system-ui, sans-serif',
	headings: { fontFamily: 'var(--font-nunito), system-ui, sans-serif', fontWeight: '800' },
	defaultRadius: 'md',
	components: {
		Modal: {
			defaultProps: { overlayProps: { backgroundOpacity: 0.7, blur: 2 } },
			styles: {
				content: {
					backgroundColor: 'var(--mantine-color-dark-7)',
					border: '1px solid var(--mantine-color-dark-5)',
				},
				header: { backgroundColor: 'var(--mantine-color-dark-7)' },
			},
		},
		Input: {
			styles: {
				input: {
					backgroundColor: 'var(--mantine-color-dark-9)',
					borderColor: 'var(--mantine-color-dark-5)',
				},
			},
		},
		Popover: {
			styles: { dropdown: { backgroundColor: 'var(--mantine-color-dark-7)' } },
		},
		Combobox: {
			styles: { dropdown: { backgroundColor: 'var(--mantine-color-dark-7)' } },
		},
	},
})

export const variaveisCss: CSSVariablesResolver = () => ({
	variables: {},
	light: {},
	dark: {
		'--mantine-color-body': '#000000',
		'--mantine-color-dimmed': 'var(--mantine-color-dark-3)',
		'--mantine-color-default-border': 'var(--mantine-color-dark-5)',
	},
})
