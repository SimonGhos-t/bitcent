'use client'
import { Button, Group, SegmentedControl, Select, TextInput } from '@mantine/core'
import { IconLayoutGrid, IconList, IconPlus, IconSearch } from '@tabler/icons-react'
import { useMemo, useState } from 'react'
import Grade from '@/app/src/components/financas/Grade'
import TotaisTransacoes from '@/app/src/components/financas/TotaisTransacoes'
import Lista from '@/app/src/components/financas/Lista'
import CampoMesAno from '@/app/src/components/template/CampoMesAno'
import NaoEncontrado from '@/app/src/components/template/NaoEncontrado'
import PaginaInicial from '@/app/src/components/template/PaginaInicial'
import useTransacao, { TipoExibicao } from '@/app/src/data/hooks/useTransacao'
import { calcularResumo } from '@/app/src/logic/core/financas/ResumoMensal'
import { TipoTransacao } from '@/app/src/logic/core/financas/TipoTransacao'
import categorias from '@/app/src/data/constants/categorias'

// Ignora maiúsculas e acentos na busca
function normalizar(texto: string) {
	return (texto ?? '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
}

export default function Transacoes() {
	const {
		tipoExibicao,
		transacoes,
		data,
		carregando,
		alterarData,
		alterarTipoExibicao,
		abrirNova,
		abrirEdicao,
	} = useTransacao()
	const [busca, setBusca] = useState('')
	const [tipo, setTipo] = useState<'todas' | TipoTransacao>('todas')
	const [categoria, setCategoria] = useState<string | null>(null)

	const filtradas = useMemo(() => {
		const termo = normalizar(busca.trim())
		return transacoes.filter(
			(t) =>
				(tipo === 'todas' || t.tipo === tipo) &&
				(!categoria || t.categoria === categoria) &&
				(!termo || normalizar(`${t.descricao} ${t.categoria}`).includes(termo)),
		)
	}, [transacoes, busca, tipo, categoria])

	const totais = calcularResumo(filtradas)
	const filtrando = busca.trim() !== '' || tipo !== 'todas' || !!categoria

	return (
		<PaginaInicial
			titulo="Transações"
			subtitulo="Todos os lançamentos do mês, do mais recente ao mais antigo."
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
			<Group gap="sm" wrap="wrap">
				<TextInput
					className="flex-1 min-w-60"
					placeholder="Buscar por subcategoria ou categoria"
					aria-label="Buscar transação"
					leftSection={<IconSearch size={16} />}
					value={busca}
					onChange={(e) => setBusca(e.currentTarget.value)}
				/>
				<SegmentedControl
					aria-label="Tipo"
					value={tipo}
					onChange={(valor) => setTipo(valor as typeof tipo)}
					data={[
						{ label: 'Todas', value: 'todas' },
						{ label: 'Receitas', value: TipoTransacao.RECEITA },
						{ label: 'Despesas', value: TipoTransacao.DESPESA },
						{ label: 'Guardado', value: TipoTransacao.GUARDADO },
					]}
				/>
				<Select
					aria-label="Categoria"
					placeholder="Todas as categorias"
					clearable
					searchable
					w={210}
					data={categorias.map((c) => c.nome)}
					value={categoria}
					onChange={setCategoria}
				/>
				<SegmentedControl
					aria-label="Modo de exibição"
					value={tipoExibicao}
					onChange={(valor) => alterarTipoExibicao(valor as TipoExibicao)}
					data={[
						{
							value: 'lista',
							label: <IconList size={18} aria-label="Lista" />,
						},
						{
							value: 'grade',
							label: <IconLayoutGrid size={18} aria-label="Grade" />,
						},
					]}
				/>
			</Group>

			<TotaisTransacoes totais={totais} />

			{filtradas.length ? (
				tipoExibicao === 'grade' ? (
					<Grade transacoes={filtradas} aoClicar={abrirEdicao} />
				) : (
					<Lista transacoes={filtradas} aoClicar={abrirEdicao} />
				)
			) : (
				!carregando && (
					<NaoEncontrado>
						{filtrando
							? 'Nenhuma transação com esses filtros'
							: 'Nenhuma transação neste mês'}
					</NaoEncontrado>
				)
			)}
		</PaginaInicial>
	)
}
