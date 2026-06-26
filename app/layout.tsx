import type { Metadata } from 'next'
import '@mantine/core/styles.css'
import { Nunito } from 'next/font/google'
import './globals.css'
import { MantineProvider } from '@mantine/core'

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
				<MantineProvider forceColorScheme='dark'>{children}</MantineProvider>
			</body>
		</html>
	)
}
