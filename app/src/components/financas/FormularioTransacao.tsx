'use client'
import 'dayjs/locale/pt-br'
import {
	ActionIcon,
	Button,
	Checkbox,
	Group,
	Modal,
	Paper,
	Radio,
	SegmentedControl,
	Select,
	SimpleGrid,
	Stack,
	Switch,
	Text,
	TextInput,
} from '@mantine/core'
import { DatePickerInput, MonthPickerInput } from '@mantine/dates'
import {
	IconCalendarRepeat,
	IconCalendarWeek,
	IconCategory,
	IconCategoryPlus,
	IconDeviceFloppy,
	IconRepeat,
	IconTrash,
} from '@tabler/icons-react'
import dayjs from 'dayjs'
import { useRef, useState } from 'react'
import Transacao, { transacaoValida } from '../../logic/core/financas/Transacao'
import Recorrencia, { mesDeAnoMes } from '../../logic/core/financas/Recorrencia'
import { Escopo } from '../../logic/core/financas/ServicosRecorrencia'
import { OpcoesSalvar } from '../../data/contexts/TransacaoContext'
import { TipoTransacao } from '../../logic/core/financas/TipoTransacao'
import Dinheiro from '../../logic/utils/Dinheiro'
import Data from '../../logic/utils/Data'
import useFormulario from '../../data/hooks/useFormulario'
import useCategorias from '../../data/hooks/useCategorias'
import useCelular from '../../data/hooks/useCelular'

interface FormularioTransacaoProps {
	transacao: Transacao
	modo: 'nova' | 'editar'
	// Nova: começa com "Repetir todo mês" ligado
	repetir?: boolean
	// Para mostrar de qual conta fixa é o lançamento
	recorrencias?: Recorrencia[]
	salvar?: (transacao: Transacao, opcoes?: OpcoesSalvar) => Promise<void> | void
	excluir?: (transacao: Transacao, escopo?: Escopo) => Promise<void> | void
	fechar?: () => void
}

const DIAS_DO_MES = Array.from({ length: 31 }, (_, i) => String(i + 1))

// Campos que, mudados num lançamento de conta fixa, fazem perguntar "só este mês ou os próximos"
function mudouValores(original: Transacao, atual: Transacao) {
	return (
		original.valor !== atual.valor ||
		original.tipo !== atual.tipo ||
		original.categoria !== atual.categoria ||
		original.descricao !== atual.descricao ||
		new Date(original.data).getDate() !== new Date(atual.data).getDate()
	)
}

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
	// Repetir todo mês (só ao cadastrar)
	const [repetir, setRepetir] = useState(!!props.repetir)
	const [diaDoMes, setDiaDoMes] = useState<string | null>(null)
	const [valorVariavel, setValorVariavel] = useState(false)
	const [fim, setFim] = useState<string | null>(null)
	// Lançamento de conta fixa: pergunta o escopo antes de salvar ou excluir
	const [perguntarEscopo, setPerguntarEscopo] = useState<'salvar' | 'excluir' | null>(null)
	const [escopo, setEscopo] = useState<Escopo>('este')
	const recorrencia = props.recorrencias?.find((r) => r.id === dados.recorrenciaId)

	const categorias = categoriasPorNome(dados.tipo)
	const subcategorias = categoriasPorDescricao(dados.categoria) ?? []
	const data = transformarDataFiresbase(dados.data)
	const hoje = dayjs().startOf('day')
	const ontem = hoje.subtract(1, 'day')

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
		if (!transacaoValida(dados) || salvando) return
		if (recorrencia && mudouValores(props.transacao, dados)) {
			setEscopo('este')
			setPerguntarEscopo('salvar')
			return
		}
		salvar()
	}

	async function salvar(escopoEscolhido: Escopo = 'este') {
		if (!transacaoValida(dados) || salvando) return
		setSalvando(true)
		try {
			await props.salvar?.(dados, {
				escopo: escopoEscolhido,
				repetir:
					props.modo === 'nova' && repetir
						? { diaDoMes: diaEscolhido, valorVariavel, fim }
						: undefined,
			})
		} finally {
			setSalvando(false)
			setPerguntarEscopo(null)
		}
		if (props.modo === 'nova' && cadastrarOutra && !repetir) {
			// Mantém tipo, categoria e data; limpa só o valor
			alterarDados({ ...dados, valor: 0 })
			campoValor.current?.focus()
			return
		}
		props.fechar?.()
	}

	function pedirExcluir() {
		if (recorrencia) {
			setEscopo('este')
			setPerguntarEscopo('excluir')
		} else {
			setConfirmarExclusao(true)
		}
	}

	async function excluir(escopoEscolhido: Escopo = 'este') {
		await props.excluir?.(props.transacao, escopoEscolhido)
		setConfirmarExclusao(false)
		setPerguntarEscopo(null)
		props.fechar?.()
	}

	const mesDoLancamento = Data.mmyy.formatar(new Date(props.transacao.data)).split(' de ')[0]

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

				<TextInput
					ref={campoValor}
					label="Valor"
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
						{repetir ? 'Primeiro lançamento' : 'Data'}
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

				{props.modo === 'nova' && (
					<Paper
						withBorder
						radius="md"
						p="sm"
						bg={repetir ? 'rgba(34, 184, 207, 0.05)' : 'transparent'}
						style={{
							borderColor: repetir
								? 'rgba(34, 184, 207, 0.45)'
								: 'var(--mantine-color-dark-5)',
						}}
					>
						<Switch
							checked={repetir}
							onChange={(e) => setRepetir(e.currentTarget.checked)}
							labelPosition="left"
							label={
								<Group gap="sm" wrap="nowrap">
									<IconRepeat
										size={20}
										color="var(--mantine-color-cyan-4)"
										aria-hidden
									/>
									<div>
										<Text fw={700} c="bright">
											Repetir todo mês
										</Text>
										<Text size="xs" c="dimmed">
											Vira uma conta fixa e aparece sozinha nos próximos meses
										</Text>
									</div>
								</Group>
							}
							styles={{
								body: { justifyContent: 'space-between', alignItems: 'center' },
								labelWrapper: { flex: 1 },
							}}
						/>
						{repetir && (
							<Stack gap="md" mt="md">
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
						disabled={repetir}
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
						disabled={!transacaoValida(dados)}
					>
						{props.modo === 'nova'
							? repetir
								? 'Salvar conta fixa'
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
					<Button color="red.9" onClick={() => excluir()}>
						Excluir
					</Button>
				</Group>
			</Modal>

			{/* Conta fixa: só este mês ou este e os próximos */}
			<Modal
				opened={!!perguntarEscopo}
				onClose={() => setPerguntarEscopo(null)}
				title={
					perguntarEscopo === 'excluir'
						? 'Excluir lançamento de conta fixa'
						: 'Alterar conta fixa'
				}
				centered
				size="md"
			>
				<Radio.Group value={escopo} onChange={(v) => setEscopo(v as Escopo)}>
					<Stack gap="sm">
						<Radio.Card value="este" radius="md" p="md">
							<Group wrap="nowrap" align="flex-start">
								<Radio.Indicator />
								<div>
									<Text fw={700} c="bright">
										Só {mesDoLancamento}
									</Text>
									<Text size="sm" c="dimmed">
										{perguntarEscopo === 'excluir'
											? 'A conta fixa continua e volta no mês seguinte.'
											: 'Muda só este lançamento. A conta fixa continua como está.'}
									</Text>
								</div>
							</Group>
						</Radio.Card>
						<Radio.Card value="proximos" radius="md" p="md">
							<Group wrap="nowrap" align="flex-start">
								<Radio.Indicator />
								<div>
									<Text fw={700} c="bright">
										Este e os próximos meses
									</Text>
									<Text size="sm" c="dimmed">
										{perguntarEscopo === 'excluir'
											? 'Encerra a conta fixa no mês anterior. Os meses anteriores ficam no histórico.'
											: 'A conta fixa passa a usar estes valores daqui em diante. Os meses anteriores ficam como estão.'}
									</Text>
								</div>
							</Group>
						</Radio.Card>
					</Stack>
				</Radio.Group>
				<Group justify="flex-end" mt="lg">
					<Button variant="subtle" color="gray" onClick={() => setPerguntarEscopo(null)}>
						Cancelar
					</Button>
					{perguntarEscopo === 'excluir' ? (
						<Button color="red.9" onClick={() => excluir(escopo)}>
							Excluir
						</Button>
					) : (
						<Button
							color="green.9"
							loading={salvando}
							leftSection={<IconDeviceFloppy size={18} />}
							onClick={() => salvar(escopo)}
						>
							Salvar alteração
						</Button>
					)}
				</Group>
			</Modal>
		</form>
	)
}
