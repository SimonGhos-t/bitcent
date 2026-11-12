'use client'
import 'dayjs/locale/pt-br'
import {
	Button,
	Checkbox,
	Group,
	Modal,
	SegmentedControl,
	Select,
	SimpleGrid,
	Stack,
	Text,
	TextInput,
} from '@mantine/core'
import { DatePickerInput } from '@mantine/dates'
import { IconCalendarWeek, IconCategory, IconCategoryPlus, IconTrash } from '@tabler/icons-react'
import dayjs from 'dayjs'
import { useRef, useState } from 'react'
import Transacao, { transacaoValida } from '../../logic/core/financas/Transacao'
import { TipoTransacao } from '../../logic/core/financas/TipoTransacao'
import Dinheiro from '../../logic/utils/Dinheiro'
import Data from '../../logic/utils/Data'
import useFormulario from '../../data/hooks/useFormulario'
import useCategorias from '../../data/hooks/useCategorias'
import useCelular from '../../data/hooks/useCelular'

interface FormularioTransacaoProps {
	transacao: Transacao
	modo: 'nova' | 'editar'
	salvar?: (transacao: Transacao) => Promise<void> | void
	excluir?: (transacao: Transacao) => Promise<void> | void
	fechar?: () => void
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

	async function salvar() {
		if (!transacaoValida(dados) || salvando) return
		setSalvando(true)
		try {
			await props.salvar?.(dados)
		} finally {
			setSalvando(false)
		}
		if (props.modo === 'nova' && cadastrarOutra) {
			// Mantém tipo, categoria e data; limpa só o valor
			alterarDados({ ...dados, valor: 0 })
			campoValor.current?.focus()
			return
		}
		props.fechar?.()
	}

	async function excluir() {
		await props.excluir?.(dados)
		setConfirmarExclusao(false)
		props.fechar?.()
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
						Data
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
			</Stack>

			<Group
				justify="space-between"
				mt="lg"
				pt="md"
				style={{ borderTop: '1px solid var(--mantine-color-dark-5)' }}
			>
				{props.modo === 'nova' ? (
					<Checkbox
						label="Cadastrar outra depois"
						checked={cadastrarOutra}
						onChange={(e) => setCadastrarOutra(e.currentTarget.checked)}
					/>
				) : (
					<Button
						variant="subtle"
						color="red"
						c="red.4"
						leftSection={<IconTrash size={16} />}
						onClick={() => setConfirmarExclusao(true)}
					>
						Excluir
					</Button>
				)}
				<Group gap="xs">
					<Button variant="subtle" color="gray" onClick={props.fechar}>
						Cancelar
					</Button>
					<Button type="submit" loading={salvando} disabled={!transacaoValida(dados)}>
						{props.modo === 'nova' ? textoSalvar[dados.tipo] : 'Salvar alterações'}
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
					<Button color="red.9" onClick={excluir}>
						Excluir
					</Button>
				</Group>
			</Modal>
		</form>
	)
}
