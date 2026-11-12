'use client'
import { MantineProvider } from '@mantine/core'
import { ReactNode } from 'react'
import { AutenticacaoProvider } from '../../data/contexts/AutenticacaoContext'
import { TransacaoProvider } from '../../data/contexts/TransacaoContext'
import { tema, variaveisCss } from '../../theme'

// Fica num componente de cliente porque o tema leva funções,
// que não podem ser passadas a partir do layout (componente de servidor)
export default function Provedores(props: { children: ReactNode }) {
	return (
		<MantineProvider theme={tema} cssVariablesResolver={variaveisCss} forceColorScheme="dark">
			<AutenticacaoProvider>
				<TransacaoProvider>{props.children}</TransacaoProvider>
			</AutenticacaoProvider>
		</MantineProvider>
	)
}
