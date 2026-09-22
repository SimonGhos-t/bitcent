import categorias from '../constants/categorias'

export default function useCategorias() {
	function categoriaDespesasPorNome(tipo: string) {
		return categorias
			.filter((categoria) => categoria.tipo === tipo)
			.map((categoria) => categoria.nome)
	}

	function categoriasPorDescricao(nome: string) {
		const categoria = categorias.find((categoria) => categoria.nome === nome)
		return categoria?.descricao
	}

	return { categoriaDespesasPorNome, categoriasPorDescricao }
}
