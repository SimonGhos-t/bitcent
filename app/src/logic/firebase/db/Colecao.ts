import {
	collection,
	deleteDoc,
	deleteField,
	doc,
	DocumentData,
	DocumentSnapshot,
	getDoc,
	getDocs,
	getFirestore,
	orderBy,
	OrderByDirection,
	query,
	QueryConstraint,
	setDoc,
	updateDoc,
	where,
	WhereFilterOp,
	writeBatch,
} from 'firebase/firestore'
import { app } from '../config/app'
import Id from '../../core/comum/Id'

export interface Filtro {
	atributo: string
	op: WhereFilterOp
	valor: any
}

// O Firestore recusa campos com undefined: ficam de fora do documento
function semIndefinidos(entidade: any) {
	return Object.fromEntries(Object.entries(entidade).filter(([, valor]) => valor !== undefined))
}

// Limite de operações de um writeBatch no Firestore
const LIMITE_LOTE = 500

export default class Colecao {
	async salvar(caminho: string, entidade: any, id?: string): Promise<any> {
		const db = getFirestore(app)
		const idFinal = id ?? entidade.id ?? Id.novo()
		const docRef = doc(db, caminho, idFinal)
		await setDoc(docRef, semIndefinidos(entidade))

		return {
			...entidade,
			id: entidade.id ?? idFinal,
		}
	}

	// Grava vários documentos de uma vez: ou todos são gravados, ou nenhum
	// (acima de 500 o Firestore exige mais de um lote, e cada lote é independente).
	// Quem já tem id (ex.: ids fixos de lançamentos gerados) sobrescreve o mesmo documento,
	// então gravar de novo não duplica.
	async salvarVarios(caminho: string, entidades: any[]): Promise<any[]> {
		const db = getFirestore(app)
		// Mesmo comportamento de salvar(): grava a entidade como veio, no id dela ou num novo
		const itens = entidades.map((entidade) => ({
			id: (entidade.id ?? Id.novo()) as string,
			entidade,
		}))

		for (const lote of this._dividirEmLotes(itens)) {
			const batch = writeBatch(db)
			lote.forEach(({ id, entidade }) => batch.set(doc(db, caminho, id), semIndefinidos(entidade)))
			await batch.commit()
		}
		return itens.map(({ id, entidade }) => ({ ...entidade, id }))
	}

	// Exclui vários documentos de uma vez (ids que não existem são ignorados)
	async excluirVarios(caminho: string, ids: string[]): Promise<number> {
		const idsValidos = [...new Set(ids.filter(Boolean))]
		if (!idsValidos.length) return 0

		const db = getFirestore(app)
		for (const lote of this._dividirEmLotes(idsValidos)) {
			const batch = writeBatch(db)
			lote.forEach((id) => batch.delete(doc(db, caminho, id)))
			await batch.commit()
		}
		return idsValidos.length
	}

	// Apaga campos de um documento existente, sem mexer nos outros
	async removerCampos(caminho: string, id: string, campos: string[]): Promise<void> {
		if (!id || !campos.length) return
		const db = getFirestore(app)
		const remocoes = Object.fromEntries(campos.map((campo) => [campo, deleteField()]))
		await updateDoc(doc(db, caminho, id), remocoes)
	}

	async excluir(caminho: string, id?: string): Promise<boolean> {
		if (!id) return false

		const db = getFirestore(app)
		const docRef = doc(db, caminho, id)
		const itemBanco = await getDoc(docRef)
		if (!itemBanco.exists()) return false
		await deleteDoc(docRef)
		return true
	}

	async consultar(caminho: string, ordenarPor?: string, direcao?: OrderByDirection) {
		const db = getFirestore(app)
		const colecaoRef = collection(db, caminho)
		const filtro: QueryConstraint[] = []
		const ordenacao = ordenarPor ? [orderBy(ordenarPor, direcao)] : []
		const consulta = query(colecaoRef, ...filtro, ...ordenacao)
		const resultado = await getDocs(consulta)
		return resultado.docs.map(this._converterDoFirebase) ?? []
	}

	async consultarPorId(caminho: string, id: string): Promise<any> {
		if (!id) return null
		const db = getFirestore(app)
		const docRef = doc(db, caminho, id)
		const resultado = await getDoc(docRef)
		return this._converterDoFirebase(resultado)
	}

	async consultarComFiltros(
		caminho: string,
		filtros: Filtro[],
		ordenarPor?: string,
		direcao?: OrderByDirection,
	): Promise<any> {
        const db = getFirestore(app)
        const colecaoRef = collection(db, caminho)

        const filtrosWhere = filtros?.map(f => where(f.atributo, f.op, f.valor)) ?? []
        const ordenacao = ordenarPor ? [orderBy(ordenarPor, direcao)] : []
        const consulta = query(colecaoRef, ...filtrosWhere, ...ordenacao)
        const resultado = await getDocs(consulta)
        return resultado.docs.map(this._converterDoFirebase) ?? []
    }

	private _dividirEmLotes<T>(itens: T[]): T[][] {
		const lotes: T[][] = []
		for (let i = 0; i < itens.length; i += LIMITE_LOTE) {
			lotes.push(itens.slice(i, i + LIMITE_LOTE))
		}
		return lotes
	}

	private _converterDoFirebase(snapshot: DocumentSnapshot<DocumentData>) {
		if(!snapshot.exists()) return null 
		const entidade: any = { ...snapshot.data(), id: snapshot.id }
		if (!entidade) return entidade
		return Object.keys(entidade).reduce((obj: any, atributo: string) => {
			const valor: any = entidade[atributo]
			return { ...obj, [atributo]: valor?.toDate?.() ?? valor }
		}, {})
	}
}
