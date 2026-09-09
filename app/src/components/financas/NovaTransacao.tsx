'use client'
import 'dayjs/locale/pt-br'
import { Button, Group, Radio, Select, TextInput } from '@mantine/core'
import Transacao from '../../logic/core/financas/Transacao'
import Dinheiro from '../../logic/utils/Dinheiro'
import { DatePickerInput } from '@mantine/dates'
import { TipoTransacao } from '../../logic/core/financas/TipoTransacao'
import { IconClipboardText, IconFileCheck } from '@tabler/icons-react'
import useFormulario from '../../data/hooks/useFormulario'
import categorias from '../../data/constants/categorias'

interface NovaTransacaoProps {
	transacao: Transacao
	fechar?: () => void
	salvar?: (transacao: Transacao) => void
	excluir?: (transacao: Transacao) => void
	cancelar?: () => void
}

export default function NovaTransacao(props: NovaTransacaoProps) {
	const { dados, alterarAtributo, transformarDataFiresbase } = useFormulario<Transacao>(props.transacao)
	

	return (
			<div className="flex flex-col border bg-black border-zinc-700 rounded-xl overflow-hidden">
				<div className="flex justify-center gap-1 bg-zinc-900 py-2 px-7 text-zinc-400">
					<IconClipboardText stroke={1} /> Formulário
				</div>
				<div className="flex flex-col gap-5 p-4 sm:p-5">
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
						onChange={(valor) =>
							alterarAtributo('data')(transformarDataFiresbase(valor))
						}
					/>
					{/* <Select label='Categoria' placeholder='Selecione uma categoria' data={categorias}/> */}
					<Radio.Group value={dados.tipo}>
						<Group onChange={alterarAtributo('tipo')} justify='space-between'>
							<Radio value={TipoTransacao.RECEITA} label="Receita" />
							<Radio value={TipoTransacao.DESPESA} label="Despesa" />
							<Radio value={TipoTransacao.GUARDADO} label="Guardado" />
						</Group>
					</Radio.Group>
				</div>
				<div className="flex justify-end px-4 py-4 sm:px-7 gap-3 bg-zinc-800">
					<Button
						leftSection={<IconFileCheck size={16}/>}
						onClick={() => {props.salvar?.(dados), props.fechar?.()}}
						className="bg-green-500"
						color="green"
					>
						Salvar
					</Button>
				</div>
			</div>
	)
}
