import categorias from '../constants/categorias'

export default function useCategorias() {
	function categoriasPorNome(tipo: string) {
		return categorias
			.filter((categoria) => categoria.tipo === tipo)
			.map((categoria) => categoria.nome)
	}

	function categoriasPorDescricao(nome: string) {
		const categoria = categorias.find((categoria) => categoria.nome === nome)
		return categoria?.descricao
	}

	function iconeCategoria (nome: string) {
		const categoria = categorias.find((categoria) => categoria.nome === nome)
		return categoria?.icone 
	}

	return { categoriasPorNome, categoriasPorDescricao, iconeCategoria }
}
