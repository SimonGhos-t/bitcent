import type { Metadata } from 'next'
import '@mantine/dates/styles.css'
import '@mantine/core/styles.css'
import { Nunito } from 'next/font/google'
import './globals.css'
import { MantineProvider } from '@mantine/core'
import { AutenticacaoProvider } from './src/data/contexts/AutenticacaoContext'

const fontNunito = Nunito({
	subsets: ['latin'],
	variable: '--font-nunito',
})

export const metadata: Metadata = {
	title: 'BitCent',
	description: 'App de finanças',
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
				<MantineProvider forceColorScheme="dark">
					<AutenticacaoProvider>{children}</AutenticacaoProvider>
				</MantineProvider>
			</body>
		</html>
	)
}
