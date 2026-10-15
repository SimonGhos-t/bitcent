import Categoria from '../../logic/core/financas/Categoria'
import { TipoTransacao } from '../../logic/core/financas/TipoTransacao'

const categorias: Categoria[] = [
	//Despesas
	{
		nome: 'Moradia',
		descricao: [
			'Aluguel',
			'Condomínio',
			'IPTU',
			'Conta de Luz',
			'Conta de Água',
			'Gás',
			'Internet',
		],
		tipo: TipoTransacao.DESPESA,
		icone: '/icons/home.png',
	},
	{
		nome: 'Alimentação',
		descricao: ['Mercado', 'Lanche', 'Delivery'],
		tipo: TipoTransacao.DESPESA,
		icone: '/icons/tools-kitchen-2.png',
	},
	{
		nome: 'Lazer',
		descricao: ['Cinema', 'Jogos', 'Passeios', 'Festas', 'Viagens'],
		tipo: TipoTransacao.DESPESA,
		icone: '/icons/ticket.png',
	},
	{
		nome: 'Transporte',
		descricao: ['Combustível', 'Transporte Público', 'Uber/Táxi'],
		tipo: TipoTransacao.DESPESA,
		icone: '/icons/car.png',
	},
	{
		nome: 'Compras',
		descricao: ['Roupas', 'Sapatos', 'Acessórios', 'Cosméticos', 'Eletrônicos'],
		tipo: TipoTransacao.DESPESA,
		icone: '/icons/shopping-bag.png',
	},
	{
		nome: 'Dívidas',
		descricao: ['Cartão de crédito', 'Financiamento', 'Empréstimo Pessoal', 'Cheque Especial'],
		tipo: TipoTransacao.DESPESA,
		icone: '/icons/coin.png',
	},
	{
		nome: 'Educação',
		descricao: ['Faculdade', 'Curso', 'Escola', 'Idiomas'],
		tipo: TipoTransacao.DESPESA,
		icone: '/icons/school.png',
	},
	{
		nome: 'Saúde',
		descricao: [
			'Plano de Saúde',
			'Academia',
			'Farmácia',
			'Consultas',
			'Suplementos',
			'Esportes',
		],
		tipo: TipoTransacao.DESPESA,
		icone: '/icons/heartbeat.png',
	},
	{
		nome: 'Pessoal',
		descricao: ['Salão/Barbearia', 'Presentes', 'Pet'],
		tipo: TipoTransacao.DESPESA,
		icone: '/icons/user-dollar.png',
	},
	{
		nome: 'Assinaturas',
		descricao: [
			'Streaming',
			'Plano de Celular',
			'Softwares',
			'Nuvem',
			'Seguros',
		],
		tipo: TipoTransacao.DESPESA,
		icone: '/icons/repeat.png',
	},
	{
		nome: 'Impostos',
		descricao: ['IRPF', 'Taxa Bancária', 'Cartório', 'Licenciamento', 'IPVA', 'IPTU'],
		tipo: TipoTransacao.DESPESA,
		icone: '/icons/receipt-tax.png',
	},
	{
		nome: 'Outros',
		descricao: ['Diversos', 'Imprevistos'],
		tipo: TipoTransacao.DESPESA,
		icone: '/icons/dots.png',
	},
	//Receitas
	{
		nome: 'Salário',
		descricao: [
			'Salário Mensal',
			'Vale Alimentação',
			'Vale Refeição',
			'Comissão',
			'Bônus',
			'Férias',
			'Décimo Terceiro',
		],
		tipo: TipoTransacao.RECEITA,
		icone: '/icons/cash-banknote-plus.png',
	},
	{
		nome: 'Investimentos',
		descricao: ['Rendimentos', 'Dividendos', 'Aluguel de Imóvel', 'Venda de Ativos'],
		tipo: TipoTransacao.RECEITA,
		icone: '/icons/trending-up.png',
	},
	//Guardado
	{
		nome: 'Economizado',
		descricao: ['Guardado', 'Investido', 'Poupança'],
		tipo: TipoTransacao.GUARDADO,
		icone: '/icons/pig-money.png',
	},
]

export default categorias
