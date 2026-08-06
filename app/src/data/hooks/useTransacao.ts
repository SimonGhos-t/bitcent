import { useContext, useEffect, useState } from 'react'
import Transacao from '../../logic/core/financas/Transacao'
import AutenticacaoContext from '../contexts/AutenticacaoContext'
import servicos from '../../logic/core'

export type TipoExibicao = 'lista' | 'grade'

export default function UseTransacao() {
	const { usuario } = useContext(AutenticacaoContext)
	const [data, setData] = useState<Date>(new Date())
	const [tipoExibicao, setTipoExibicao] = useState<TipoExibicao>('grade')
	const [transacoes, setTransacoes] = useState<Transacao[]>([])
	const [transacaoSelecionada, setTransacao] = useState<Transacao | null>(null)

	useEffect(() => {
		buscarTransacoes()
	}, [data])

	async function buscarTransacoes() {
		if (!usuario) return
		const transacoes = await servicos.transacao.consultarPorMes(usuario, data)
		setTransacoes(transacoes)
	}

	async function salvar(transacao: Transacao) {
		if (!usuario) return
		servicos.transacao.salvar(transacao, usuario)
		setTransacao(null)
		await buscarTransacoes()
	}

	async function excluir(transacao: Transacao) {
		if (!usuario) return
		await servicos.transacao.excluir(transacao, usuario)
		setTransacao(null)
		await buscarTransacoes()
	}

	return {
		data,
		transacoes,
		transacaoSelecionada,
        tipoExibicao,
		salvar,
		excluir,
		selecionar: setTransacao,
		alterarData: setData,
        alterarTipoExibicao: setTipoExibicao
	}
}
