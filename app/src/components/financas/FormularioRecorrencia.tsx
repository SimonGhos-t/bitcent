'use client'
import 'dayjs/locale/pt-br'
import {
	ActionIcon,
	Button,
	Checkbox,
	Group,
	SegmentedControl,
	Select,
	SimpleGrid,
	Stack,
	Text,
	TextInput,
} from '@mantine/core'
import { MonthPickerInput } from '@mantine/dates'
import {
	IconCalendarRepeat,
	IconCalendarWeek,
	IconCategory,
	IconCategoryPlus,
	IconDeviceFloppy,
	IconInfoCircle,
	IconTrash,
} from '@tabler/icons-react'
import dayjs from 'dayjs'
import { useState } from 'react'
import Recorrencia, { mesDeAnoMes, recorrenciaValida } from '../../logic/core/financas/Recorrencia'
import { TipoTransacao } from '../../logic/core/financas/TipoTransacao'
import Dinheiro from '../../logic/utils/Dinheiro'
import useCategorias from '../../data/hooks/useCategorias'
import useCelular from '../../data/hooks/useCelular'

interface FormularioRecorrenciaProps {
	recorrencia: Recorrencia
	salvar: (mudancas: Partial<Recorrencia>) => Promise<void>
	pedirExclusao: () => void
	fechar: () => void
}

const corDoTipo: Record<TipoTransacao, string> = {
	[TipoTransacao.DESPESA]: 'red.9',
	[TipoTransacao.RECEITA]: 'green.9',
	[TipoTransacao.GUARDADO]: 'blue.8',
}

const DIAS_DO_MES = Array.from({ length: 31 }, (_, i) => String(i + 1))

// Edição de uma conta fixa pela tela Contas fixas
export default function FormularioRecorrencia(props: FormularioRecorrenciaProps) {
	const [dados, setDados] = useState<Recorrencia>(props.recorrencia)
	const [salvando, setSalvando] = useState(false)
	const { categoriasPorNome, categoriasPorDescricao } = useCategorias()
	const celular = useCelular()

	const unicaOpcao = (lista?: string[]) => (lista?.length === 1 ? lista[0] : '')
	const mudou = JSON.stringify(dados) !== JSON.stringify(props.recorrencia)

	function alterarTipo(valor: string) {
		const tipo = valor as TipoTransacao
		const categoria = unicaOpcao(categoriasPorNome(tipo))
		setDados({ ...dados, tipo, categoria, descricao: unicaOpcao(categoriasPorDescricao(categoria)) })
	}

	async function salvar() {
		if (!recorrenciaValida(dados) || !mudou || salvando) return
		setSalvando(true)
		try {
			const { tipo, categoria, descricao, valor, valorVariavel, diaDoMes, fim } = dados
			await props.salvar({ tipo, categoria, descricao, valor, valorVariavel, diaDoMes, fim })
			props.fechar()
		} finally {
			setSalvando(false)
		}
	}

	return (
		<form
			onSubmit={(e) => {
				e.preventDefault()
				salvar()
			}}
		>
			<Stack gap="md">
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
					label={dados.valorVariavel ? 'Valor previsto' : 'Valor'}
					size="lg"
					inputMode="numeric"
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
						setDados({ ...dados, valor: Dinheiro.desformatar(e.currentTarget.value) })
					}
				/>
				<SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
					<Select
						label="Categoria"
						placeholder="Selecione"
						leftSection={<IconCategory size={18} />}
						data={categoriasPorNome(dados.tipo)}
						searchable={!celular}
						value={dados.categoria || null}
						onChange={(categoria) =>
							setDados({
								...dados,
								categoria: categoria ?? '',
								descricao: unicaOpcao(categoriasPorDescricao(categoria ?? '')),
							})
						}
					/>
					<Select
						label="Subcategoria"
						placeholder={dados.categoria ? 'Selecione' : 'Escolha a categoria'}
						leftSection={<IconCategoryPlus size={18} />}
						data={categoriasPorDescricao(dados.categoria) ?? []}
						searchable={!celular}
						disabled={!dados.categoria}
						value={dados.descricao || null}
						onChange={(descricao) => setDados({ ...dados, descricao: descricao ?? '' })}
					/>
					<Select
						label="Dia do mês"
						leftSection={<IconCalendarRepeat size={18} />}
						data={DIAS_DO_MES}
						value={String(dados.diaDoMes)}
						onChange={(dia) => setDados({ ...dados, diaDoMes: Number(dia ?? 1) })}
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
						minDate={mesDeAnoMes(dados.inicio)}
						value={dados.fim ? mesDeAnoMes(dados.fim) : null}
						onChange={(v) => setDados({ ...dados, fim: v ? dayjs(v).format('YYYY-MM') : null })}
						description="Opcional"
					/>
				</SimpleGrid>
				<Checkbox
					checked={dados.valorVariavel}
					onChange={(e) => setDados({ ...dados, valorVariavel: e.currentTarget.checked })}
					label="O valor muda todo mês (luz, água)"
					description="Entra como prevista e só conta no saldo depois que você confirmar o valor."
				/>
				<Group gap={8} wrap="nowrap" align="flex-start">
					<IconInfoCircle
						size={18}
						color="var(--mantine-color-cyan-4)"
						style={{ flexShrink: 0, marginTop: 2 }}
						aria-hidden
					/>
					<Text size="sm" c="dark.1">
						Os meses anteriores não mudam. Se o lançamento deste mês já foi feito, ele
						fica como está e a mudança vale do próximo mês em diante (para mudar só
						este mês, edite o lançamento em Transações).
					</Text>
				</Group>
			</Stack>

			<Group
				justify="space-between"
				gap="xs"
				mt="lg"
				pt="md"
				style={{ borderTop: '1px solid var(--mantine-color-dark-5)' }}
			>
				<Button
					visibleFrom="sm"
					variant="subtle"
					color="red"
					c="red.4"
					leftSection={<IconTrash size={16} />}
					onClick={props.pedirExclusao}
				>
					Excluir
				</Button>
				<ActionIcon
					hiddenFrom="sm"
					variant="subtle"
					color="red"
					c="red.4"
					size={36}
					aria-label="Excluir conta fixa"
					onClick={props.pedirExclusao}
				>
					<IconTrash size={20} />
				</ActionIcon>
				<Group gap="xs" ml="auto">
					<Button variant="subtle" color="gray" onClick={props.fechar}>
						Cancelar
					</Button>
					<Button
						type="submit"
						color="green.9"
						leftSection={<IconDeviceFloppy size={18} />}
						loading={salvando}
						disabled={!recorrenciaValida(dados) || !mudou}
					>
						Salvar alterações
					</Button>
				</Group>
			</Group>
		</form>
	)
}
