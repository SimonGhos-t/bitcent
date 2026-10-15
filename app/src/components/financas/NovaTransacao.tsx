'use client'
import 'dayjs/locale/pt-br'
import { Button, Group, Radio, Select, TextInput } from '@mantine/core'
import Transacao from '../../logic/core/financas/Transacao'
import Dinheiro from '../../logic/utils/Dinheiro'
import { DatePickerInput, DatePickerInputProps } from '@mantine/dates'
import { TipoTransacao } from '../../logic/core/financas/TipoTransacao'
import { IconCalendarWeek, IconCategory, IconCategoryPlus, IconFileCheck } from '@tabler/icons-react'
import useFormulario from '../../data/hooks/useFormulario'
import dayjs from 'dayjs'
import useCategorias from '../../data/hooks/useCategorias'
import Image from 'next/image'

interface NovaTransacaoProps {
	transacao: Transacao
	fechar?: () => void
	salvar?: (transacao: Transacao) => void
	excluir?: (transacao: Transacao) => void
	cancelar?: () => void
}

export default function NovaTransacao(props: NovaTransacaoProps) {
	const { dados, alterarAtributo, transformarDataFiresbase } = useFormulario<Transacao>(
		props.transacao,
	)
	const {categoriasPorNome, categoriasPorDescricao, iconeCategoria} = useCategorias()

	const renderizarDia: DatePickerInputProps['renderDay'] = (date) => {
		const dia = dayjs(date).date()
		const hoje = dayjs().date()
		return (
			<div className={`${ dia !== hoje ? '' : 'bg-blue-500'} rounded p-1`}>{dia}</div>
		)
	}

	return (
		<div className="flex flex-col border bg-black border-zinc-700 rounded-xl overflow-hidden">
			<div className="flex flex-col gap-5 p-4 sm:p-5">
				<Radio.Group value={dados.tipo}>
					<Group onChange={alterarAtributo('tipo')} justify="space-between">
						<Radio value={TipoTransacao.RECEITA} label="Receita" />
						<Radio value={TipoTransacao.DESPESA} label="Despesa" />
						<Radio value={TipoTransacao.GUARDADO} label="Guardado" />
					</Group>
				</Radio.Group>
				<Image src={iconeCategoria('Moradia')} width={35} height={35} alt='Icone'/>
				<Select
					label="Categoria"
					leftSection={<IconCategory />}
					placeholder="Selecione uma categoria"
					data={categoriasPorNome(dados.tipo)}
					searchable
					value={dados.categoria}
					onChange={alterarAtributo('categoria')}
				/>
				<Select
					label="Descrição"
					leftSection={<IconCategoryPlus />}
					placeholder="Selecione uma descrição"
					data={categoriasPorDescricao(dados.categoria)}
					value={dados.descricao}
					onChange={alterarAtributo('descricao')}
					disabled={dados.categoria ? false : true}
				/>
				<TextInput
					label="Valor"
					value={Dinheiro.formatar(dados.valor)}
					onChange={alterarAtributo('valor', Dinheiro.desformatar)}
				/>
				<DatePickerInput
					label="Data"
					leftSection={<IconCalendarWeek />}
					firstDayOfWeek={0}
					value={transformarDataFiresbase(dados.data)}
					locale="pt-BR"
					valueFormat="DD/MM/YYYY"
					renderDay={renderizarDia}
					onChange={(valor) => alterarAtributo('data')(transformarDataFiresbase(valor))}
				/>
			</div>
			<div className="flex justify-end px-4 py-4 sm:px-7 gap-3 bg-zinc-800">
				<Button
					leftSection={<IconFileCheck size={16} />}
					onClick={() => {
						;(props.salvar?.(dados), props.fechar?.())
					}}
					color="green"
				>
					Salvar
				</Button>
			</div>
		</div>
	)
}
