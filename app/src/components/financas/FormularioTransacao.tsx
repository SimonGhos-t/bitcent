'use client'
import 'dayjs/locale/pt-br'
import {
	ActionIcon,
	Anchor,
	Button,
	Checkbox,
	Group,
	Modal,
	NumberInput,
	Paper,
	SegmentedControl,
	Select,
	SimpleGrid,
	Stack,
	Text,
	TextInput,
} from '@mantine/core'
import { DatePickerInput, MonthPickerInput } from '@mantine/dates'
import {
	IconCalendarRepeat,
	IconCalendarWeek,
	IconCategory,
	IconCategoryPlus,
	IconCreditCard,
	IconDeviceFloppy,
	IconRepeat,
	IconTrash,
} from '@tabler/icons-react'
import dayjs from 'dayjs'
import { useRef, useState } from 'react'
import Transacao, { ehParcela, transacaoValida } from '../../logic/core/financas/Transacao'
import Recorrencia, { mesDeAnoMes } from '../../logic/core/financas/Recorrencia'
import {
	dataDaParcela,
	MAX_PARCELAS,
	MIN_PARCELAS,
	quantidadeValida,
} from '../../logic/core/financas/Parcelas'
import { EscopoParcela } from '../../logic/core/financas/ServicosParcelas'
import { ComoLancar, OpcoesSalvar } from '../../data/contexts/TransacaoContext'
import { TipoTransacao } from '../../logic/core/financas/TipoTransacao'
import Dinheiro from '../../logic/utils/Dinheiro'
import Data from '../../logic/utils/Data'
import useFormulario from '../../data/hooks/useFormulario'
import useCategorias from '../../data/hooks/useCategorias'
import useCelular from '../../data/hooks/useCelular'
import ModalEscopo, { OpcaoEscopo } from './ModalEscopo'

interface FormularioTransacaoProps {
	transacao: Transacao
	modo: 'nova' | 'editar'
	// Nova: como o formulário começa (ex.: "mensal" na tela Contas fixas)
	comoLancar?: ComoLancar
	// Para mostrar de qual conta fixa é o lançamento
	recorrencias?: Recorrencia[]
	salvar?: (transacao: Transacao, opcoes?: OpcoesSalvar) => Promise<void> | void
	excluir?: (transacao: Transacao, escopo?: EscopoParcela) => Promise<void> | void
	// Parcelas lançadas da compra (para mostrar quantas serão apagadas)
	consultarCompra?: (transacao: Transacao) => Promise<Transacao[]>
	fechar?: () => void
}

const DIAS_DO_MES = Array.from({ length: 31 }, (_, i) => String(i + 1))

// Campos que, mudados num lançamento de conta fixa ou numa parcela, fazem perguntar
// "só este" ou "este e os próximos"
function mudouValores(original: Transacao, atual: Transacao) {
	return (
		original.valor !== atual.valor ||
		original.tipo !== atual.tipo ||
		original.categoria !== atual.categoria ||
		original.descricao !== atual.descricao ||
		new Date(original.data).getDate() !== new Date(atual.data).getDate()
	)
}

// "novembro de 2026"
const mesAno = (d: Date) => Data.mmyy.formatar(d)

const corDoTipo: Record<TipoTransacao, string> = {
	[TipoTransacao.DESPESA]: 'red.9',
	[TipoTransacao.RECEITA]: 'green.9',
	[TipoTransacao.GUARDADO]: 'blue.8',
}

const textoSalvar: Record<TipoTransacao, string> = {
	[TipoTransacao.DESPESA]: 'Salvar despesa',
	[TipoTransacao.RECEITA]: 'Salvar receita',
	[TipoTransacao.GUARDADO]: 'Salvar valor guardado',
}

const somar = (lista: Transacao[]) => lista.reduce((s, t) => s + t.valor, 0)

export default function FormularioTransacao(props: FormularioTransacaoProps) {
	const { dados, alterarDados, transformarDataFiresbase } = useFormulario<Transacao>(
		props.transacao,
	)
	const { categoriasPorNome, categoriasPorDescricao } = useCategorias()
	// No celular os selects não abrem o teclado: só tocar e escolher
	const celular = useCelular()
	const [subcategoriaAberta, setSubcategoriaAberta] = useState(false)
	const [cadastrarOutra, setCadastrarOutra] = useState(false)
	const [confirmarExclusao, setConfirmarExclusao] = useState(false)
	const [salvando, setSalvando] = useState(false)
	const campoValor = useRef<HTMLInputElement>(null)

	// Como lançar (só ao cadastrar): uma vez, todo mês ou parcelado
	const [comoLancar, setComoLancar] = useState<ComoLancar>(props.comoLancar ?? 'uma')
	// Todo mês
	const [diaDoMes, setDiaDoMes] = useState<string | null>(null)
	const [valorVariavel, setValorVariavel] = useState(false)
	const [fim, setFim] = useState<string | null>(null)
	// Parcelado (ao cadastrar) ou quantidade de parcelas (ao editar uma parcela)
	const [qtdParcelas, setQtdParcelas] = useState<number | string>(
		props.transacao.totalParcelas ?? '',
	)
	const [jaPaguei, setJaPaguei] = useState(false)
	const [parcelaAtual, setParcelaAtual] = useState<number | string>(1)

	// Conta fixa ou parcela: pergunta o escopo antes de salvar ou excluir
	const [perguntarEscopo, setPerguntarEscopo] = useState<'salvar' | 'excluir' | null>(null)
	const [escopo, setEscopo] = useState<EscopoParcela>('este')
	const [compra, setCompra] = useState<Transacao[] | null>(null)

	const recorrencia = props.recorrencias?.find((r) => r.id === dados.recorrenciaId)
	const parcela = props.modo === 'editar' && ehParcela(props.transacao) ? props.transacao : null
	const parcelado = props.modo === 'nova' && comoLancar === 'parcelado'
	const mensal = props.modo === 'nova' && comoLancar === 'mensal'

	const categorias = categoriasPorNome(dados.tipo)
	const subcategorias = categoriasPorDescricao(dados.categoria) ?? []
	const data = transformarDataFiresbase(dados.data)
	const hoje = dayjs().startOf('day')
	const ontem = hoje.subtract(1, 'day')

	const qtd = Number(qtdParcelas)
	const atual = jaPaguei ? Number(parcelaAtual) : 1
	const parcelasValidas =
		quantidadeValida(qtd) && Number.isInteger(atual) && atual >= 1 && atual <= qtd
	const podeSalvar = transacaoValida(dados) && (!parcelado || parcelasValidas)
	const mudouQuantidade = !!parcela && qtd !== parcela.totalParcelas

	// Quando só existe uma opção, ela já vem escolhida
	function unicaOpcao(lista: string[] | undefined) {
		return lista?.length === 1 ? lista[0] : ''
	}

	function alterarTipo(valor: string) {
		const tipo = valor as TipoTransacao
		const categoria = unicaOpcao(categoriasPorNome(tipo))
		alterarDados({
			...dados,
			tipo,
			categoria,
			descricao: unicaOpcao(categoriasPorDescricao(categoria)),
		})
	}

	function alterarCategoria(categoria: string | null) {
		const opcoes = categoriasPorDescricao(categoria ?? '')
		const descricao = unicaOpcao(opcoes)
		alterarDados({ ...dados, categoria: categoria ?? '', descricao })
		// Abre a subcategoria logo em seguida, para escolher sem clicar de novo
		if (categoria && !descricao) setSubcategoriaAberta(true)
	}

	function alterarData(valor: Date | string | null) {
		alterarDados({ ...dados, data: transformarDataFiresbase(valor) ?? new Date() })
	}

	// Dia da conta fixa: o escolhido, ou o dia da data do lançamento
	const diaEscolhido = Number(diaDoMes ?? (data ?? new Date()).getDate())

	function pedirSalvar() {
		if (!podeSalvar || salvando) return
		if (parcela && (mudouValores(parcela, dados) || mudouQuantidade)) {
			if (!quantidadeValida(qtd) || qtd < parcela.parcela!) return
			setEscopo(mudouQuantidade ? 'proximos' : 'este')
			setPerguntarEscopo('salvar')
			return
		}
		if (recorrencia && mudouValores(props.transacao, dados)) {
			setEscopo('este')
			setPerguntarEscopo('salvar')
			return
		}
		salvar()
	}

	async function salvar(escopoEscolhido: EscopoParcela = 'este') {
		if (!podeSalvar || salvando) return
		setSalvando(true)
		try {
			await props.salvar?.(dados, {
				escopo: escopoEscolhido,
				repetir: mensal ? { diaDoMes: diaEscolhido, valorVariavel, fim } : undefined,
				parcelar: parcelado ? { quantidade: qtd, parcelaAtual: atual } : undefined,
				totalParcelas: parcela ? qtd : undefined,
			})
		} finally {
			setSalvando(false)
			setPerguntarEscopo(null)
		}
		if (props.modo === 'nova' && cadastrarOutra && comoLancar === 'uma') {
			// Mantém tipo, categoria e data; limpa só o valor
			alterarDados({ ...dados, valor: 0 })
			campoValor.current?.focus()
			return
		}
		props.fechar?.()
	}

	async function pedirExcluir() {
		if (parcela) {
			setEscopo('este')
			setCompra(null)
			setPerguntarEscopo('excluir')
			setCompra((await props.consultarCompra?.(parcela)) ?? null)
		} else if (recorrencia) {
			setEscopo('este')
			setPerguntarEscopo('excluir')
		} else {
			setConfirmarExclusao(true)
		}
	}

	async function excluir(escopoEscolhido: EscopoParcela = 'este') {
		setSalvando(true)
		try {
			await props.excluir?.(props.transacao, escopoEscolhido)
		} finally {
			setSalvando(false)
		}
		setConfirmarExclusao(false)
		setPerguntarEscopo(null)
		props.fechar?.()
	}

	// Resumo do parcelado: total da compra e período das parcelas lançadas
	const resumoParcelado =
		parcelado && parcelasValidas && data
			? {
					total: dados.valor * qtd,
					inicio: mesAno(data),
					fim: mesAno(dataDaParcela(data, atual, qtd)),
				}
			: null

	const opcoesEscopo = (): OpcaoEscopo<EscopoParcela>[] => {
		const mesDoLancamento = Data.mmyy.formatar(new Date(props.transacao.data)).split(' de ')[0]
		if (parcela) {
			const n = parcela.parcela!
			const total = parcela.totalParcelas!
			if (perguntarEscopo === 'salvar') {
				const valor = Dinheiro.formatar(dados.valor)
				const proximos =
					qtd > total
						? `As parcelas ${n} a ${total} ficam com ${valor} e entram as parcelas ${total + 1} a ${qtd}.`
						: qtd < total
							? `As parcelas ${n} a ${qtd} ficam com ${valor} e as parcelas ${qtd + 1} a ${total} são apagadas.`
							: `As parcelas ${n} a ${total} ficam com ${valor}.`
				return [
					{
						valor: 'este',
						titulo: 'Só esta parcela',
						descricao: mudouQuantidade
							? 'Para mudar o número de parcelas, use a outra opção.'
							: `Muda apenas a parcela ${n}. As outras ficam como estão.`,
						desabilitada: mudouQuantidade,
					},
					{
						valor: 'proximos',
						titulo: 'Esta e as próximas',
						descricao: `${proximos}${n > 1 ? ' As anteriores não mudam.' : ''}`,
					},
				]
			}
			const lista = compra ?? []
			const daqui = lista.filter((t) => (t.parcela ?? 0) >= n)
			const carregou = compra !== null
			return [
				{
					valor: 'este',
					titulo: `Só esta parcela (${n}/${total})`,
					descricao: 'As outras parcelas continuam.',
				},
				{
					valor: 'proximos',
					titulo: carregou
						? `Esta e as próximas · ${daqui.length} ${daqui.length === 1 ? 'parcela' : 'parcelas'}`
						: 'Esta e as próximas',
					descricao: carregou
						? `Apaga da ${n}ª em diante (${Dinheiro.formatar(somar(daqui))}).${n > 1 ? ' As anteriores ficam no histórico.' : ''}`
						: 'Contando as parcelas…',
				},
				{
					valor: 'todas',
					titulo: carregou
						? `A compra inteira · ${lista.length} ${lista.length === 1 ? 'parcela' : 'parcelas'}`
						: 'A compra inteira',
					descricao: carregou
						? `Apaga todas as parcelas, inclusive as que já venceram (${Dinheiro.formatar(somar(lista))}).`
						: 'Contando as parcelas…',
				},
			]
		}
		const excluindo = perguntarEscopo === 'excluir'
		return [
			{
				valor: 'este',
				titulo: `Só ${mesDoLancamento}`,
				descricao: excluindo
					? 'A conta fixa continua e volta no mês seguinte.'
					: 'Muda só este lançamento. A conta fixa continua como está.',
			},
			{
				valor: 'proximos',
				titulo: 'Este e os próximos meses',
				descricao: excluindo
					? 'Encerra a conta fixa no mês anterior. Os meses anteriores ficam no histórico.'
					: 'A conta fixa passa a usar estes valores daqui em diante. Os meses anteriores ficam como estão.',
			},
		]
	}

	const textoExcluirEscopo = () => {
		if (!parcela || !compra) return 'Excluir'
		const qtdApagar =
			escopo === 'todas'
				? compra.length
				: escopo === 'proximos'
					? compra.filter((t) => (t.parcela ?? 0) >= parcela.parcela!).length
					: 1
		return qtdApagar === 1 ? 'Excluir 1 parcela' : `Excluir ${qtdApagar} parcelas`
	}

	return (
		<form
			onSubmit={(e) => {
				e.preventDefault()
				pedirSalvar()
			}}
		>
			<Stack gap="md">
				{recorrencia && (
					<Group gap={8} wrap="nowrap" c="cyan.4">
						<IconRepeat size={18} aria-hidden />
						<Text size="sm" c="dark.1">
							Conta fixa · todo dia {recorrencia.diaDoMes}
							{recorrencia.valorVariavel && ' · valor variável'}
						</Text>
					</Group>
				)}
				{parcela && (
					<Group gap={8} wrap="nowrap" c="cyan.4">
						<IconCreditCard size={18} aria-hidden />
						<Text size="sm" c="dark.1">
							Parcela {parcela.parcela} de {parcela.totalParcelas} · compra parcelada
						</Text>
					</Group>
				)}

				<SegmentedControl
					fullWidth
					value={dados.tipo}
					onChange={alterarTipo}
					color={corDoTipo[dados.tipo]}
					data={[
						{ label: 'Despesa', value: TipoTransacao.DESPESA },
						{ label: 'Receita', value: TipoTransacao.RECEITA },
						{ label: 'Guardado', value: TipoTransacao.GUARDADO },
					]}
				/>

				{props.modo === 'nova' && (
					<div>
						<Text id="como-lancar" size="sm" fw={500} mb={4}>
							Como lançar
						</Text>
						<SegmentedControl
							aria-labelledby="como-lancar"
							fullWidth
							value={comoLancar}
							onChange={(v) => setComoLancar(v as ComoLancar)}
							data={[
								{ label: 'Só uma vez', value: 'uma' },
								{ label: 'Todo mês', value: 'mensal' },
								{ label: 'Parcelado', value: 'parcelado' },
							]}
						/>
					</div>
				)}

				<TextInput
					ref={campoValor}
					label={parcelado || parcela ? 'Valor da parcela' : 'Valor'}
					size="lg"
					inputMode="numeric"
					data-autofocus
					leftSection={
						<Text c="dimmed" fw={600}>
							R$
						</Text>
					}
					styles={{
						label: { fontSize: 'var(--mantine-font-size-sm)', fontWeight: 500 },
						input: { fontWeight: 700, fontSize: 22 },
					}}
					value={Dinheiro.formatarNumero(dados.valor)}
					onChange={(e) =>
						alterarDados({
							...dados,
							valor: Dinheiro.desformatar(e.currentTarget.value),
						})
					}
				/>

				{parcela && (
					<Group gap="md" wrap="nowrap" align="flex-end">
						<NumberInput
							label="Parcelas"
							w={64}
							min={Math.max(MIN_PARCELAS, parcela.parcela!)}
							max={MAX_PARCELAS}
							allowDecimal={false}
							allowNegative={false}
							hideControls
							suffix="x"
							value={qtdParcelas}
							onChange={setQtdParcelas}
						/>
						<Text size="sm" c="dimmed" pb={8} style={{ whiteSpace: 'nowrap' }}>
							{quantidadeValida(qtd)
								? `${qtd}x de ${Dinheiro.formatar(dados.valor)}`
								: `De ${Math.max(MIN_PARCELAS, parcela.parcela!)} a ${MAX_PARCELAS} parcelas`}
						</Text>
					</Group>
				)}

				<SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
					<Select
						label="Categoria"
						placeholder="Selecione"
						leftSection={<IconCategory size={18} />}
						data={categorias}
						searchable={!celular}
						nothingFoundMessage="Nenhuma categoria encontrada"
						value={dados.categoria || null}
						onChange={alterarCategoria}
					/>
					<Select
						label="Subcategoria"
						placeholder={dados.categoria ? 'Selecione' : 'Escolha a categoria'}
						leftSection={<IconCategoryPlus size={18} />}
						data={subcategorias}
						searchable={!celular}
						nothingFoundMessage="Nenhuma subcategoria encontrada"
						disabled={!dados.categoria}
						value={dados.descricao || null}
						onChange={(descricao) =>
							alterarDados({ ...dados, descricao: descricao ?? '' })
						}
						dropdownOpened={subcategoriaAberta}
						onDropdownOpen={() => setSubcategoriaAberta(true)}
						onDropdownClose={() => setSubcategoriaAberta(false)}
					/>
				</SimpleGrid>

				<div>
					<Text component="label" htmlFor="data-transacao" size="sm" fw={500}>
						{mensal
							? 'Primeiro lançamento'
							: parcelado
								? jaPaguei
									? `Data da parcela ${Number.isInteger(atual) && atual > 0 ? atual : ''}`
									: 'Data da 1ª parcela'
								: 'Data'}
					</Text>
					<Group gap="xs" wrap="nowrap" mt={4}>
						<DatePickerInput
							id="data-transacao"
							className="flex-1"
							leftSection={<IconCalendarWeek size={18} />}
							locale="pt-br"
							valueFormat="DD/MM/YYYY"
							firstDayOfWeek={0}
							highlightToday
							value={data}
							onChange={alterarData}
						/>
						<Button
							variant={hoje.isSame(data, 'day') ? 'light' : 'default'}
							aria-pressed={hoje.isSame(data, 'day')}
							onClick={() => alterarData(hoje.toDate())}
						>
							Hoje
						</Button>
						<Button
							variant={ontem.isSame(data, 'day') ? 'light' : 'default'}
							aria-pressed={ontem.isSame(data, 'day')}
							onClick={() => alterarData(ontem.toDate())}
						>
							Ontem
						</Button>
					</Group>
				</div>

				{(mensal || parcelado) && (
					<Paper
						withBorder
						radius="md"
						p="sm"
						bg="rgba(34, 184, 207, 0.05)"
						style={{ borderColor: 'rgba(34, 184, 207, 0.45)' }}
					>
						{mensal && (
							<Stack gap="md">
								<SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
									<Select
										label="Dia do mês"
										leftSection={<IconCalendarRepeat size={18} />}
										data={DIAS_DO_MES}
										value={String(diaEscolhido)}
										onChange={setDiaDoMes}
										allowDeselect={false}
										description="Dia 31 em mês curto vira o último dia"
									/>
									<MonthPickerInput
										label="Termina em"
										placeholder="Sem data para acabar"
										leftSection={<IconCalendarWeek size={18} />}
										locale="pt-br"
										valueFormat="MMMM YYYY"
										clearable
										minDate={data ?? undefined}
										value={fim ? mesDeAnoMes(fim) : null}
										onChange={(valor) =>
											setFim(valor ? dayjs(valor).format('YYYY-MM') : null)
										}
										description="Opcional"
									/>
								</SimpleGrid>
								<Checkbox
									checked={valorVariavel}
									onChange={(e) => setValorVariavel(e.currentTarget.checked)}
									label="O valor muda todo mês (luz, água)"
									description="Entra como prevista com o valor acima. Você confirma o valor real, e só então ela conta no saldo."
								/>
							</Stack>
						)}

						{parcelado && (
							<Stack gap="sm">
								<Group gap="md" wrap="nowrap" align="flex-end">
									<NumberInput
										label="Parcelas"
										w={64}
										min={MIN_PARCELAS}
										max={MAX_PARCELAS}
										allowDecimal={false}
										allowNegative={false}
										hideControls
										suffix="x"
										placeholder="10x"
										value={qtdParcelas}
										onChange={setQtdParcelas}
									/>
									<div className="min-w-0">
										{resumoParcelado ? (
											<>
												<Text
													fw={800}
													fz="lg"
													c="bright"
													style={{ whiteSpace: 'nowrap' }}
												>
													{Dinheiro.formatar(resumoParcelado.total)} no
													total
												</Text>
												<Text
													size="sm"
													c="dimmed"
													style={{ whiteSpace: 'nowrap' }}
												>
													{resumoParcelado.inicio === resumoParcelado.fim
														? `Em ${resumoParcelado.inicio}`
														: `De ${resumoParcelado.inicio} a ${resumoParcelado.fim}`}
												</Text>
											</>
										) : (
											<Text size="sm" c="dimmed" pb={8}>
												De {MIN_PARCELAS} a {MAX_PARCELAS} parcelas
											</Text>
										)}
									</div>
								</Group>
								{jaPaguei ? (
									<Group gap="xs" wrap="nowrap" align="center">
										<Text size="sm">Este lançamento é a parcela</Text>
										<NumberInput
											aria-label="Número da parcela deste lançamento"
											w={56}
											min={1}
											max={quantidadeValida(qtd) ? qtd : MAX_PARCELAS}
											allowDecimal={false}
											allowNegative={false}
											hideControls
											value={parcelaAtual}
											onChange={setParcelaAtual}
										/>
										<Text size="sm">
											{quantidadeValida(qtd) ? `de ${qtd}` : ''}
										</Text>
										<Anchor
											component="button"
											type="button"
											size="sm"
											ml="auto"
											onClick={() => {
												setJaPaguei(false)
												setParcelaAtual(1)
											}}
										>
											Cancelar
										</Anchor>
									</Group>
								) : (
									<Anchor
										component="button"
										type="button"
										size="sm"
										fw={700}
										className="self-start"
										onClick={() => setJaPaguei(true)}
									>
										Já paguei algumas parcelas
									</Anchor>
								)}
							</Stack>
						)}
					</Paper>
				)}
			</Stack>

			<Group
				justify="space-between"
				gap="xs"
				mt="lg"
				pt="md"
				style={{ borderTop: '1px solid var(--mantine-color-dark-5)' }}
			>
				{props.modo === 'nova' ? (
					<Checkbox
						disabled={comoLancar !== 'uma'}
						label="Cadastrar outra depois"
						checked={cadastrarOutra}
						onChange={(e) => setCadastrarOutra(e.currentTarget.checked)}
					/>
				) : (
					<>
						<Button
							visibleFrom="sm"
							variant="subtle"
							color="red"
							c="red.4"
							leftSection={<IconTrash size={16} />}
							onClick={pedirExcluir}
						>
							Excluir
						</Button>
						{/* No celular só o ícone, para o rodapé caber em uma linha */}
						<ActionIcon
							hiddenFrom="sm"
							variant="subtle"
							color="red"
							c="red.4"
							size={36}
							aria-label="Excluir transação"
							onClick={pedirExcluir}
						>
							<IconTrash size={20} />
						</ActionIcon>
					</>
				)}
				{/* ml="auto": quando quebra a linha no celular, os botões continuam à direita */}
				<Group gap="xs" ml="auto">
					<Button
						variant="subtle"
						color="gray"
						px={{ base: 'xs', sm: 'md' }}
						onClick={props.fechar}
					>
						Cancelar
					</Button>
					<Button
						type="submit"
						color="green.9"
						leftSection={<IconDeviceFloppy size={18} />}
						loading={salvando}
						disabled={!podeSalvar}
					>
						{props.modo === 'nova'
							? mensal
								? 'Salvar conta fixa'
								: parcelado
									? 'Salvar compra parcelada'
									: textoSalvar[dados.tipo]
							: 'Salvar alterações'}
					</Button>
				</Group>
			</Group>

			<Modal
				opened={confirmarExclusao}
				onClose={() => setConfirmarExclusao(false)}
				title="Excluir esta transação?"
				centered
				size="sm"
			>
				<Text c="dimmed">
					<Text span c="bright" fw={700}>
						{dados.descricao || dados.categoria} · {Dinheiro.formatar(dados.valor)}
					</Text>{' '}
					de {Data.ddmmyy.formatar(dados.data)} será apagada. Não dá para desfazer.
				</Text>
				<Group justify="flex-end" mt="lg">
					<Button
						variant="subtle"
						color="gray"
						onClick={() => setConfirmarExclusao(false)}
					>
						Cancelar
					</Button>
					<Button color="red.9" loading={salvando} onClick={() => excluir()}>
						Excluir
					</Button>
				</Group>
			</Modal>

			{/* Conta fixa: só este mês ou este e os próximos.
			    Parcela: só esta, esta e as próximas ou a compra inteira. */}
			<ModalEscopo<EscopoParcela>
				aberto={!!perguntarEscopo}
				titulo={
					parcela
						? perguntarEscopo === 'excluir'
							? 'Excluir compra parcelada'
							: 'Alterar parcela'
						: perguntarEscopo === 'excluir'
							? 'Excluir lançamento de conta fixa'
							: 'Alterar conta fixa'
				}
				opcoes={perguntarEscopo ? opcoesEscopo() : []}
				valor={escopo}
				alterar={setEscopo}
				acao={perguntarEscopo === 'excluir' ? 'excluir' : 'salvar'}
				textoAcao={perguntarEscopo === 'excluir' ? textoExcluirEscopo() : undefined}
				carregando={salvando}
				confirmar={() => (perguntarEscopo === 'excluir' ? excluir(escopo) : salvar(escopo))}
				fechar={() => setPerguntarEscopo(null)}
			/>
		</form>
	)
}
