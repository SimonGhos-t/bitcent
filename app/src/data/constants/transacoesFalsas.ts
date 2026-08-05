import Transacao from '../../logic/core/financas/Transacao'
import { TipoTransacao } from '../../logic/core/financas/TipoTransacao'

const transacoesFalsas: Transacao[] = [
	{
		id: `${Math.random()}`,
		descricao: 'Luz',
		valor: 320.0,
		data: new Date(2022, 10, 3),
		tipo: TipoTransacao.DESPESA,
	},
	{
		id: `${Math.random()}`,
		descricao: 'Aluguel',
		valor: 1817.59,
		data: new Date(2022, 11, 3),
		tipo: TipoTransacao.DESPESA,
	},
	{
		id: `${Math.random()}`,
		descricao: 'Ane',
		valor: 2200.0,
		data: new Date(2022, 11, 1),
		tipo: TipoTransacao.DESPESA,
	},
	{
		id: `${Math.random()}`,
		descricao: 'Tia Rute',
		valor: 2200.0,
		data: new Date(2022, 11, 1),
		tipo: TipoTransacao.DESPESA,
	},
	{
		id: `${Math.random()}`,
		descricao: 'AT Manhã',
		valor: 1000.0,
		data: new Date(2022, 11, 2),
		tipo: TipoTransacao.DESPESA,
	},
	{
		id: `${Math.random()}`,
		descricao: 'Salário Leo',
		data: new Date(2022, 11, 10),
		valor: 7123.34,
		tipo: TipoTransacao.RECEITA,
	},
	{
		id: `${Math.random()}`,
		descricao: 'Salário Larisse',
		data: new Date(2022, 11, 1),
		valor: 7123.34,
		tipo: TipoTransacao.RECEITA,
	},
]

export default transacoesFalsas
