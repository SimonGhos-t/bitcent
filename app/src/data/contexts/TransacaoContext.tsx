'use client'
import { createContext, ReactNode, useCallback, useContext, useEffect, useState } from 'react'
import { useDisclosure } from '@mantine/hooks'
import Transacao from '../../logic/core/financas/Transacao'
import servicos from '../../logic/core'
import AutenticacaoContext from './AutenticacaoContext'
import ModalTransacao from '../../components/financas/ModalTransacao'

export type TipoExibicao = 'lista' | 'grade'

interface TransacaoContextProps {
	data: Date
	transacoes: Transacao[]
	carregando: boolean
	tipoExibicao: TipoExibicao
	alterarData: (data: Date) => void
	alterarTipoExibicao: (tipo: TipoExibicao) => void
	salvar: (transacao: Transacao) => Promise<void>
	excluir: (transacao: Transacao) => Promise<void>
	abrirNova: () => void
	abrirEdicao: (transacao: Transacao) => void
}

const TransacaoContext = createContext<TransacaoContextProps>({} as TransacaoContextProps)

const CHAVE_EXIBICAO = 'bitcent:exibicao'

// Fica acima das páginas: o mês escolhido vale para Início e Transações,
// e o modal de transação é um só para o app inteiro
export function TransacaoProvider(props: { children: ReactNode }) {
	const { usuario } = useContext(AutenticacaoContext)
	const [data, setData] = useState<Date>(new Date())
	const [tipoExibicao, setTipoExibicao] = useState<TipoExibicao>('lista')
	const [transacoes, setTransacoes] = useState<Transacao[]>([])
	const [carregando, setCarregando] = useState(true)
	const [selecionada, setSelecionada] = useState<Transacao | null>(null)
	const [modalAberto, { open: abrirModal, close: fecharModal }] = useDisclosure(false)

	useEffect(() => {
		try {
			const salvo = localStorage.getItem(CHAVE_EXIBICAO)
			if (salvo === 'lista' || salvo === 'grade') setTipoExibicao(salvo)
		} catch {}
	}, [])

	const buscarTransacoes = useCallback(async () => {
		if (!usuario) return
		const resultado = await servicos.transacao.consultarPorMes(usuario, data)
		setTransacoes(resultado ?? [])
		setCarregando(false)
	}, [usuario, data])

	useEffect(() => {
		buscarTransacoes()
	}, [buscarTransacoes])

	async function salvar(transacao: Transacao) {
		if (!usuario) return
		await servicos.transacao.salvar(transacao, usuario)
		await buscarTransacoes()
	}

	async function excluir(transacao: Transacao) {
		if (!usuario) return
		await servicos.transacao.excluir(transacao, usuario)
		await buscarTransacoes()
	}

	function alterarTipoExibicao(tipo: TipoExibicao) {
		setTipoExibicao(tipo)
		try {
			localStorage.setItem(CHAVE_EXIBICAO, tipo)
		} catch {}
	}

	return (
		<TransacaoContext.Provider
			value={{
				data,
				transacoes,
				carregando,
				tipoExibicao,
				alterarData: setData,
				alterarTipoExibicao,
				salvar,
				excluir,
				abrirNova: () => {
					setSelecionada(null)
					abrirModal()
				},
				abrirEdicao: (transacao) => {
					setSelecionada(transacao)
					abrirModal()
				},
			}}
		>
			{props.children}
			<ModalTransacao
				aberto={modalAberto}
				fechar={fecharModal}
				transacao={selecionada}
				salvar={salvar}
				excluir={excluir}
			/>
		</TransacaoContext.Provider>
	)
}

export default TransacaoContext
