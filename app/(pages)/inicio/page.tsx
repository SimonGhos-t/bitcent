'use client'
import { Button } from '@mantine/core'
import { IconPlus } from '@tabler/icons-react'
import { useMemo } from 'react'
import useTransacao from '../../src/data/hooks/useTransacao'
import CampoMesAno from '../../src/components/template/CampoMesAno'
import Resumo from '../../src/components/financas/Resumo'
import PainelMes from '../../src/components/financas/PainelMes'
import PaginaInicial from '@/app/src/components/template/PaginaInicial'
import { calcularResumo } from '@/app/src/logic/core/financas/ResumoMensal'
import Data from '@/app/src/logic/utils/Data'

export default function Inicio() {
	const { data, alterarData, transacoes, abrirNova, abrirEdicao } = useTransacao()
	const resumo = useMemo(() => calcularResumo(transacoes), [transacoes])
	const mes = Data.mmyy.formatar(data).split(' de ')[0]

	return (
		<PaginaInicial
			titulo={`Resumo de ${mes}`}
			subtitulo="Quanto entrou, quanto saiu e para onde foi."
			acoes={
				<>
					<CampoMesAno data={data} dataMudou={alterarData} />
					<Button
						visibleFrom="sm"
						size="md"
						leftSection={<IconPlus size={18} stroke={2.2} />}
						onClick={abrirNova}
					>
						Nova transação
					</Button>
				</>
			}
		>
			<Resumo resumo={resumo} />
			<PainelMes resumo={resumo} aoClicar={abrirEdicao} />
		</PaginaInicial>
	)
}
