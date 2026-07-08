import type { Metadata } from 'next'
import '@mantine/core/styles.css'
import { Nunito } from 'next/font/google'
import './globals.css'
import { MantineProvider } from '@mantine/core'
import { AutenticacaoProvider } from './src/data/contexts/AutenticacaoContext'

const fontNunito = Nunito({
	subsets: ['latin'],
})

export const metadata: Metadata = {
	title: 'BitCenter',
	description: 'App de finanças',
}

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode
}>) {
	return (
		<html lang="pt-BR" className={`${fontNunito} h-full antialiased`}>
			<body className="min-h-full flex flex-col">
				<AutenticacaoProvider>
					<MantineProvider forceColorScheme="dark">{children}</MantineProvider>
				</AutenticacaoProvider>
			</body>
		</html>
	)
}
