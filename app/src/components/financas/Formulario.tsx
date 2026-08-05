'use client'
import 'dayjs/locale/pt-br'
import { Button, Group, Radio, TextInput } from '@mantine/core'
import Transacao from '../../logic/core/financas/Transacao'
import Dinheiro from '../../logic/utils/Dinheiro'
import { DatePickerInput } from '@mantine/dates'
import { TipoTransacao } from '../../logic/core/financas/TipoTransacao'
import { IconClipboardText } from '@tabler/icons-react'
import useFormulario from '../../data/hooks/useFormulario'
import { Timestamp } from 'firebase/firestore'

interface FormularioProps {
	transacao: Transacao
	salvar?: (transacao: Transacao) => void
	excluir?: (transacao: Transacao) => void
	cancelar?: () => void
}

export default function Formulario(props: FormularioProps) {
	const { dados, alterarAtributo } = useFormulario<Transacao>(props.transacao)

	function transformarDataFiresbase(data: any): Date | null {
		if (!data) return null

		// Se for Timestamp do Firebase
		if (data instanceof Timestamp) {
			return data.toDate()
		}

		// Se for Date
		if (data instanceof Date) {
			return data
		}

		// Se for string ISO
		if (typeof data === 'string') {
			const partes = data.split('-')
			if (partes.length === 3) {
				const [ano, mes, dia] = partes.map(Number)
				return new Date(ano, mes - 1, dia)
			}
		}

		return null
	}
	
	return (
		<div className="flex flex-col border bg-black border-zinc-700 rounded-xl overflow-hidden">
			<div className="flex gap-1 bg-zinc-900 py-2 px-7 text-zinc-400">
				<IconClipboardText stroke={1} /> Formulário
			</div>
			<div className="flex flex-col gap-4 p-4 sm:p-7">
				<TextInput
					label="Descrição"
					value={dados.descricao}
					onChange={alterarAtributo('descricao')}
				/>
				<TextInput
					label="Valor"
					value={Dinheiro.formatar(dados.valor)}
					onChange={alterarAtributo('valor', Dinheiro.desformatar)}
				/>
				<DatePickerInput
					label="Data"
					value={transformarDataFiresbase(dados.data)}
					locale="pt-BR"
					valueFormat="DD/MM/YYYY"
					onChange={(valor) => alterarAtributo('data')(transformarDataFiresbase(valor))}
				/>
				<Radio.Group value={dados.tipo}>
					<Group onChange={alterarAtributo('tipo')}>
						<Radio value={TipoTransacao.RECEITA} label="Receita" />
						<Radio value={TipoTransacao.DESPESA} label="Despesa" />
					</Group>
				</Radio.Group>
			</div>
			<div className="flex px-4 py-4 sm:px-7 gap-3 bg-zinc-800">
				<Button
					className="bg-green-500"
					color="green"
					onClick={() => props.salvar?.(dados)}
				>
					Salvar
				</Button>
				<Button className="bg-gray-500" color="gray" onClick={props.cancelar}>
					Voltar
				</Button>
				<div className="flex flex-1"></div>
				{dados.id && (
					<Button
						className="bg-red-500"
						color="red"
						onClick={() => props.excluir?.(dados)}
					>
						Excluir
					</Button>
				)}
			</div>
		</div>
	)
}
