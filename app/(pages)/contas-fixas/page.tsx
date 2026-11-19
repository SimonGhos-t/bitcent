'use client'
import {
	ActionIcon,
	Badge,
	Button,
	Group,
	Modal,
	SimpleGrid,
	Stack,
	Text,
	ThemeIcon,
	Title,
	Tooltip,
} from '@mantine/core'
import {
	IconArrowDownLeft,
	IconArrowUpRight,
	IconInfoCircle,
	IconPencil,
	IconPigMoney,
	IconPlayerPause,
	IconPlayerPlay,
	IconPlus,
} from '@tabler/icons-react'
import { ReactNode, useState } from 'react'
import PaginaInicial from '@/app/src/components/template/PaginaInicial'
import Cartao from '@/app/src/components/template/Cartao'
import NaoEncontrado from '@/app/src/components/template/NaoEncontrado'
import IconeTransacao from '@/app/src/components/financas/IconeTransacao'
import FormularioRecorrencia from '@/app/src/components/financas/FormularioRecorrencia'
import useTransacao from '@/app/src/data/hooks/useTransacao'
import Recorrencia, {
	mesDeAnoMes,
	totaisRecorrencias,
} from '@/app/src/logic/core/financas/Recorrencia'
import { TipoTransacao } from '@/app/src/logic/core/financas/TipoTransacao'
import Dinheiro from '@/app/src/logic/utils/Dinheiro'
import Data from '@/app/src/logic/utils/Data'

const corValor: Record<TipoTransacao, string> = {
	[TipoTransacao.DESPESA]: 'red.4',
	[TipoTransacao.RECEITA]: 'green.4',
	[TipoTransacao.GUARDADO]: 'blue.3',
}

// "novembro de 2026"
const nomeMes = (anoMes: string) => Data.mmyy.formatar(mesDeAnoMes(anoMes))

function Total(props: {
	titulo: string
	valor: number
	detalhe: string
	cor: string
	icone: ReactNode
}) {
	return (
		<Cartao p="md">
			<Group justify="space-between" wrap="nowrap" gap="xs" mb="xs">
				<Text c="dark.2" fw={500} size="sm" lh={1.2}>
					{props.titulo}
				</Text>
				<ThemeIcon variant="light" color={props.cor} radius="md" size={34}>
					{props.icone}
				</ThemeIcon>
			</Group>
			<Text fz={{ base: 20, sm: 26 }} fw={800} c="bright">
				{Dinheiro.formatar(props.valor)}
			</Text>
			<Text size="xs" c="dimmed" mt={4}>
				{props.detalhe}
			</Text>
		</Cartao>
	)
}

function periodo(r: Recorrencia, mesAtual: string) {
	const partes = [`Todo dia ${r.diaDoMes}`]
	if (r.inicio > mesAtual) partes.push(`a partir de ${nomeMes(r.inicio)}`)
	if (r.fim) partes.push(`até ${nomeMes(r.fim)}`)
	return partes.join(' · ')
}

function Linha(props: {
	r: Recorrencia
	mesAtual: string
	divisoria: boolean
	editar: () => void
	alternar: () => void
}) {
	const r = props.r
	const pausada = !r.ativa
	return (
		<Group
			wrap="nowrap"
			gap="sm"
			px={{ base: 'sm', sm: 'lg' }}
			py="sm"
			style={{
				borderTop: props.divisoria ? '1px solid var(--mantine-color-dark-6)' : undefined,
			}}
		>
			<div style={{ opacity: pausada ? 0.5 : 1 }}>
				<IconeTransacao categoria={r.categoria} tipo={r.tipo} />
			</div>
			<div className="flex-1 min-w-0" style={{ opacity: pausada ? 0.5 : 1 }}>
				<Group gap={8} wrap="nowrap">
					<Text fw={700} c="bright" truncate>
						{r.descricao}
					</Text>
					{r.valorVariavel && (
						<Badge size="sm" variant="light" color="yellow" className="shrink-0">
							Valor variável
						</Badge>
					)}
				</Group>
				<Text size="sm" c="dimmed" truncate>
					{r.categoria} · {periodo(r, props.mesAtual)}
				</Text>
			</div>
			<Text
				fw={800}
				c={corValor[r.tipo]}
				style={{ whiteSpace: 'nowrap', opacity: pausada ? 0.5 : 1 }}
				visibleFrom="xs"
			>
				{r.valorVariavel ? '≈ ' : ''}
				{Dinheiro.formatar(r.valor)}
			</Text>
			<Group gap={6} wrap="nowrap">
				{pausada ? (
					<Button
						variant="light"
						size="xs"
						leftSection={<IconPlayerPlay size={14} />}
						onClick={props.alternar}
					>
						Reativar
					</Button>
				) : (
					<Tooltip label="Pausar" withArrow>
						<ActionIcon
							variant="default"
							size={36}
							aria-label={`Pausar ${r.descricao}`}
							onClick={props.alternar}
						>
							<IconPlayerPause size={16} />
						</ActionIcon>
					</Tooltip>
				)}
				<Tooltip label="Editar" withArrow>
					<ActionIcon
						variant="default"
						size={36}
						aria-label={`Editar ${r.descricao}`}
						onClick={props.editar}
					>
						<IconPencil size={16} />
					</ActionIcon>
				</Tooltip>
			</Group>
		</Group>
	)
}

function Secao(props: { titulo: string; qtd: number; dica?: string; children: ReactNode }) {
	return (
		<Stack gap="xs">
			<Group justify="space-between" align="baseline">
				<Title order={2} size="h5" c="bright">
					{props.titulo}{' '}
					<Text span c="dimmed" fw={600} inherit>
						· {props.qtd}
					</Text>
				</Title>
				{props.dica && (
					<Text size="sm" c="dimmed" visibleFrom="sm">
						{props.dica}
					</Text>
				)}
			</Group>
			<Cartao p={0} py={4} className="overflow-hidden">
				{props.children}
			</Cartao>
		</Stack>
	)
}

const porDia = (a: Recorrencia, b: Recorrencia) =>
	a.diaDoMes - b.diaDoMes || a.descricao.localeCompare(b.descricao)

export default function ContasFixas() {
	const {
		recorrencias,
		carregando,
		abrirNova,
		editarRecorrencia,
		alterarAtiva,
		excluirRecorrencia,
	} = useTransacao()
	const [editando, setEditando] = useState<Recorrencia | null>(null)
	const [excluindo, setExcluindo] = useState<Recorrencia | null>(null)
	const [excluindoAgora, setExcluindoAgora] = useState(false)
	const [aviso, setAviso] = useState<string | null>(null)

	const hoje = new Date()
	const mesAtual = Data.anoMes(hoje)
	// Encerradas (fim antes deste mês) são só histórico: ficam fora da lista
	const vigentes = recorrencias.filter((r) => !r.fim || r.fim >= mesAtual)
	const ativas = vigentes.filter((r) => r.ativa).sort(porDia)
	const pausadas = vigentes.filter((r) => !r.ativa).sort(porDia)
	const encerradas = recorrencias.length - vigentes.length
	const totais = totaisRecorrencias(vigentes, hoje)

	async function salvar(r: Recorrencia, mudancas: Partial<Recorrencia>) {
		const aPartirDe = await editarRecorrencia(r, mudancas)
		setAviso(
			aPartirDe > mesAtual
				? `Alterações salvas. Valem a partir de ${nomeMes(aPartirDe)}; o lançamento deste mês ficou como estava.`
				: 'Alterações salvas.',
		)
	}

	async function excluir() {
		if (!excluindo) return
		setExcluindoAgora(true)
		try {
			await excluirRecorrencia(excluindo)
			setExcluindo(null)
			setEditando(null)
		} finally {
			setExcluindoAgora(false)
		}
	}

	return (
		<PaginaInicial
			titulo="Contas fixas"
			subtitulo="Cadastre uma vez e elas aparecem sozinhas todo mês."
			acoes={
				<Button
					size="md"
					leftSection={<IconPlus size={18} stroke={2.2} />}
					onClick={() => abrirNova({ comoLancar: 'mensal' })}
				>
					Nova conta fixa
				</Button>
			}
		>
			{aviso && (
				<Text size="sm" c="cyan.3" role="status" className="flex items-center gap-2">
					<IconInfoCircle size={16} aria-hidden />
					{aviso}
				</Text>
			)}

			{!vigentes.length ? (
				!carregando && (
					<Stack align="center" gap="md">
						<NaoEncontrado>Nenhuma conta fixa ainda</NaoEncontrado>
						<Text c="dimmed" ta="center" maw={420}>
							Aluguel, internet, salário… Cadastre uma vez e o BitCent lança sozinho
							todo mês.
						</Text>
						<Button
							leftSection={<IconPlus size={18} />}
							onClick={() => abrirNova({ comoLancar: 'mensal' })}
						>
							Nova conta fixa
						</Button>
					</Stack>
				)
			) : (
				<>
					<SimpleGrid cols={{ base: 1, xs: 2, md: 3 }} spacing={{ base: 'sm', sm: 'md' }}>
						<Total
							titulo="Despesas fixas por mês"
							valor={totais.despesasFixas}
							cor="red"
							icone={<IconArrowUpRight size={18} />}
							detalhe={
								totais.despesasVariaveis
									? `+ cerca de ${Dinheiro.formatar(totais.despesasVariaveis)} em contas de valor variável`
									: 'Nenhuma conta de valor variável'
							}
						/>
						<Total
							titulo="Receitas fixas"
							valor={totais.receitas}
							cor="green"
							icone={<IconArrowDownLeft size={18} />}
							detalhe={
								totais.qtdReceitas === 1
									? '1 conta'
									: `${totais.qtdReceitas} contas`
							}
						/>
						<Total
							titulo="Guardado todo mês"
							valor={totais.guardado}
							cor="blue"
							icone={<IconPigMoney size={18} />}
							detalhe={
								totais.qtdGuardado === 1
									? '1 conta'
									: `${totais.qtdGuardado} contas`
							}
						/>
					</SimpleGrid>

					{ativas.length > 0 && (
						<Secao
							titulo="Ativas"
							qtd={ativas.length}
							dica="Entram sozinhas em cada mês, a partir do mês de início"
						>
							{ativas.map((r, i) => (
								<Linha
									key={r.id}
									r={r}
									mesAtual={mesAtual}
									divisoria={i > 0}
									editar={() => setEditando(r)}
									alternar={() => alterarAtiva(r, false)}
								/>
							))}
						</Secao>
					)}

					{pausadas.length > 0 && (
						<Secao titulo="Pausadas" qtd={pausadas.length}>
							{pausadas.map((r, i) => (
								<Linha
									key={r.id}
									r={r}
									mesAtual={mesAtual}
									divisoria={i > 0}
									editar={() => setEditando(r)}
									alternar={() => alterarAtiva(r, true)}
								/>
							))}
						</Secao>
					)}

					<Text size="sm" c="dimmed" className="flex items-start gap-2">
						<IconInfoCircle
							size={16}
							style={{ flexShrink: 0, marginTop: 2 }}
							aria-hidden
						/>
						<span>
							Pausar ou excluir uma conta fixa não apaga os lançamentos que já foram
							confirmados.
							{encerradas > 0 &&
								` ${encerradas === 1 ? '1 conta encerrada fica' : `${encerradas} contas encerradas ficam`} só no histórico.`}
						</span>
					</Text>
				</>
			)}

			<Modal
				opened={!!editando && !excluindo}
				onClose={() => setEditando(null)}
				title="Editar conta fixa"
				centered
				size="lg"
			>
				{editando && (
					<FormularioRecorrencia
						key={editando.id}
						recorrencia={editando}
						salvar={(mudancas) => salvar(editando, mudancas)}
						pedirExclusao={() => setExcluindo(editando)}
						fechar={() => setEditando(null)}
					/>
				)}
			</Modal>

			<Modal
				opened={!!excluindo}
				onClose={() => setExcluindo(null)}
				title="Excluir esta conta fixa?"
				centered
				size="sm"
			>
				<Text c="dimmed">
					<Text span c="bright" fw={700}>
						{excluindo?.descricao} · {Dinheiro.formatar(excluindo?.valor ?? 0)}
					</Text>{' '}
					deixa de ser lançada. Os lançamentos já confirmados ficam no histórico; os que
					ainda estão a confirmar são apagados.
				</Text>
				<Group justify="flex-end" mt="lg">
					<Button variant="subtle" color="gray" onClick={() => setExcluindo(null)}>
						Cancelar
					</Button>
					<Button color="red.9" loading={excluindoAgora} onClick={excluir}>
						Excluir
					</Button>
				</Group>
			</Modal>
		</PaginaInicial>
	)
}
