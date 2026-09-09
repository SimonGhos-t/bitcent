'use client'
import 'dayjs/locale/pt-br'
import { Button, Group, Radio, TextInput } from '@mantine/core'
import Transacao from '../../logic/core/financas/Transacao'
import Dinheiro from '../../logic/utils/Dinheiro'
import { DatePickerInput } from '@mantine/dates'
import { TipoTransacao } from '../../logic/core/financas/TipoTransacao'
import useFormulario from '../../data/hooks/useFormulario'

interface EditarTransacaoProps {
	transacao: Transacao
    fechar?: () => void
	salvar?: (transacao: Transacao) => void
	excluir?: (transacao: Transacao) => void
	cancelar?: () => void
}

export default function EditarTransacao(props: EditarTransacaoProps) {
	const { dados, alterarAtributo, transformarDataFiresbase } = useFormulario<Transacao>(
		props.transacao,
	)

	return (
		<div className="flex flex-col border bg-black border-zinc-700 rounded-xl overflow-hidden">
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
					<Group onChange={alterarAtributo('tipo')} justify='space-between'>
						<Radio value={TipoTransacao.RECEITA} label="Receita" />
						<Radio value={TipoTransacao.DESPESA} label="Despesa" />
						<Radio value={TipoTransacao.GUARDADO} label="Guardado" />
					</Group>
				</Radio.Group>
			</div>
			<div className="flex px-4 py-4 sm:px-7 gap-3 bg-zinc-900">
				<Button
					className="bg-green-500"
					color="green"
					onClick={() => {props.salvar?.(dados), props.fechar?.()}}
				>
					Salvar
				</Button>
				<div className="flex flex-1"></div>
				<Button className="bg-red-500" color="red" onClick={() => {props.excluir?.(dados), props.fechar?.()}}>
					Excluir
				</Button>
			</div>
		</div>
	)
}
