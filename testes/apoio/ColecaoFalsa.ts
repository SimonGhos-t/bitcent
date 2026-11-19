// Banco em memória com a mesma interface da Colecao (só o que os serviços usam)
export default class ColecaoFalsa {
	docs = new Map<string, Map<string, any>>()

	private _c(caminho: string) {
		if (!this.docs.has(caminho)) this.docs.set(caminho, new Map())
		return this.docs.get(caminho)!
	}

	// Ids gravados numa coleção, em ordem
	ids(caminho: string) {
		return [...(this.docs.get(caminho)?.keys() ?? [])].sort()
	}

	async salvar(caminho: string, e: any, id?: string) {
		const idFinal = id ?? e.id ?? `gerado-${this._c(caminho).size + 1}`
		const limpo = Object.fromEntries(Object.entries(e).filter(([, v]) => v !== undefined))
		this._c(caminho).set(idFinal, { ...limpo, id: idFinal })
		return { ...e, id: idFinal }
	}

	async salvarVarios(caminho: string, es: any[]) {
		return Promise.all(es.map((e) => this.salvar(caminho, e)))
	}

	async excluir(caminho: string, id?: string) {
		return !!id && this._c(caminho).delete(id)
	}

	async excluirVarios(caminho: string, ids: string[]) {
		ids.forEach((id) => this._c(caminho).delete(id))
		return ids.length
	}

	async consultar(caminho: string) {
		return [...this._c(caminho).values()]
	}

	async consultarPorId(caminho: string, id: string) {
		return this._c(caminho).get(id) ?? null
	}

	async consultarComFiltros(caminho: string, filtros: any[]) {
		return [...this._c(caminho).values()].filter((d) =>
			filtros.every((f) => {
				const v = d[f.atributo]
				if (f.op === '==') return v === f.valor
				if (v === undefined) return false
				if (f.op === '>') return v > f.valor
				if (f.op === '>=') return v >= f.valor
				return v <= f.valor
			}),
		)
	}
}
