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
	},
	{
		nome: 'Alimentação',
		descricao: ['Mercado', 'Lanche', 'Delivery'],
		tipo: TipoTransacao.DESPESA,
	},
	{
		nome: 'Transporte',
		descricao: ['Combustível', 'Transporte Público', 'Uber/Táxi'],
		tipo: TipoTransacao.DESPESA,
	},
	{
		nome: 'Compras',
		descricao: ['Roupas', 'Sapatos', 'Acessórios', 'Cosméticos', 'Eletrônicos'],
		tipo: TipoTransacao.DESPESA,
	},
	{
		nome: 'Dívidas',
		descricao: ['Financiamento', 'Empréstimo Pessoal', 'Cheque Especial'],
		tipo: TipoTransacao.DESPESA,
	},
	{
		nome: 'Educação',
		descricao: ['Faculdade', 'Curso', 'Escola', 'Idiomas'],
		tipo: TipoTransacao.DESPESA,
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
	},
	{
		nome: 'Lazer',
		descricao: ['Cinema', 'Streaming', 'Jogos', 'Passeios', 'Festas', 'Viagens'],
		tipo: TipoTransacao.DESPESA,
	},
	{
		nome: 'Pessoal',
		descricao: [
			'Salão/Barbearia',
			'Presentes',
			'Pet',
		],
		tipo: TipoTransacao.DESPESA,
	},
	{
		nome: 'Assinaturas',
		descricao: [
			'Celular/Plano de Dados',
			'Softwares',
			'Nuvem (iCloud/Google)',
			'Seguros (Vida/Carro/Casa)',
		],
		tipo: TipoTransacao.DESPESA,
	},
	{
		nome: 'Impostos',
		descricao: ['IRPF', 'Taxa Bancária', 'Cartório', 'Licenciamento', 'IPVA', 'IPTU'],
		tipo: TipoTransacao.DESPESA,
	},
    {
		nome: 'Outros',
		descricao: [
			'Diversos',
			'Imprevistos',
			'Outros',
		],
		tipo: TipoTransacao.DESPESA,
	},
    //Receitas
	{
		nome: 'Salário',
		descricao: ['Salário Mensal', 'Bônus', 'Comissão', 'Férias', 'Décimo Terceiro'],
		tipo: TipoTransacao.RECEITA,
	},
	{
		nome: 'Investimentos',
		descricao: ['Rendimentos', 'Dividendos', 'Aluguel de Imóvel', 'Venda de Ativos'],
		tipo: TipoTransacao.RECEITA,
	},
	//Guardado
	{
		nome: 'Economias',
		descricao: ['Guardado', 'Investido', 'Poupança'],
		tipo: TipoTransacao.GUARDADO,
	},
]

export default categorias
