import type { Metadata, Viewport } from 'next'
import '@mantine/dates/styles.css'
import '@mantine/core/styles.css'
import { Nunito } from 'next/font/google'
import './globals.css'
import Provedores from './src/components/template/Provedores'

const fontNunito = Nunito({
	subsets: ['latin'],
	variable: '--font-nunito',
})

export const metadata: Metadata = {
	title: 'BitCent',
	description: 'Controle de gastos e registro de despesas',
	applicationName: 'BitCent',
	appleWebApp: {
		capable: true,
		title: 'BitCent',
		statusBarStyle: 'black-translucent',
	},
}

export const viewport: Viewport = {
	themeColor: '#000000',
}

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode
}>) {
	return (
		<html
			lang="pt-BR"
			className={`${fontNunito.variable} ${fontNunito.className} h-full antialiased`}
		>
			<body className="min-h-full flex flex-col">
				<Provedores>{children}</Provedores>
			</body>
		</html>
	)
}
