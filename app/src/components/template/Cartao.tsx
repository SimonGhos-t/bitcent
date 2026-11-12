import { Paper, PaperProps } from '@mantine/core'
import { ReactNode } from 'react'

// Superfície padrão (cards) da paleta preto + ciano
export default function Cartao(props: PaperProps & { children: ReactNode; component?: any }) {
	return <Paper withBorder radius="lg" p="lg" bg="dark.7" {...props} />
}
