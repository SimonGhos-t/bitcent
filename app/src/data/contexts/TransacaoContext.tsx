'use client'
import { createContext, ReactNode, useCallback, useContext, useEffect, useState } from 'react'
import { useDisclosure, useLocalStorage } from '@mantine/hooks'
import Transacao, { ehPrevista } from '../../logic/core/financas/Transacao'
import Recorrencia, {
	geraNoMes,
	gerarLancamento,
	mesFuturo,
} from '../../logic/core/financas/Recorrencia'
import { Escopo, OpcoesRepetir } from '../../logic/core/financas/ServicosRecorrencia'
import Usuario from '../../logic/core/usuario/Usuario'
import servicos from '../../logic/core'
import AutenticacaoContext from './AutenticacaoContext'
import ModalTransacao from '../../components/financas/ModalTransacao'
import ModalConfirmarValor from '../../components/financas/ModalConfirmarValor'

export type TipoExibicao = 'lista' | 'grade'

export interface OpcoesSalvar {
	// Lançamento novo com "Repetir todo mês"
	repetir?: OpcoesRepetir
	// Lançamento de conta fixa: só este mês ou este e os próximos
	escopo?: Escopo
}

export interface OpcoesNova {
	// Abre o formulário com "Repetir todo mês" já ligado
	repetir?: boolean
}

interface TransacaoContextProps {
	data: Date
	transacoes: Transacao[]
	// Contas fixas cadastradas (ativas e pausadas)
	recorrencias: Recorrencia[]
	// Meses futuros: lançamentos das contas fixas que ainda não foram gravados
	projecoes: Transacao[]
	carregando: boolean
	tipoExibicao: TipoExibicao
	alterarData: (data: Date) => void
	alterarTipoExibicao: (tipo: TipoExibicao) => void
	salvar: (transacao: Transacao, opcoes?: OpcoesSalvar) => Promise<void>
	excluir: (transacao: Transacao, escopo?: Escopo) => Promise<void>
	confirmarValor: (transacao: Transacao, valor: number, data: Date) => Promise<void>
	editarRecorrencia: (r: Recorrencia, mudancas: Partial<Recorrencia>) => Promise<string>
	alterarAtiva: (r: Recorrencia, ativa: boolean) => Promise<void>
	excluirRecorrencia: (r: Recorrencia) => Promise<void>
	abrirNova: (opcoes?: OpcoesNova) => void
	abrirEdicao: (transacao: Transacao) => void
	abrirConfirmacao: (transacao: Transacao) => void
}

const TransacaoContext = createContext<TransacaoContextProps>({} as TransacaoContextProps)

const CHAVE_EXIBICAO = 'bitcent:exibicao'

interface DadosDoMes {
	transacoes: Transacao[]
	recorrencias: Recorrencia[]
}

// Busca o mês e as contas fixas e grava os lançamentos que faltam no mês
async function carregarMes(usuario: Usuario, data: Date): Promise<DadosDoMes> {
	const [doMes, recorrencias] = await Promise.all([
		servicos.transacao.consultarPorMes(usuario, data),
		servicos.recorrencia.consultar(usuario),
	])
	const transacoes = doMes ?? []
	try {
		const criadas = await servicos.recorrencia.garantirLancamentosDoMes(
			usuario,
			data,
			recorrencias,
			transacoes,
		)
		return { transacoes: [...transacoes, ...criadas], recorrencias }
	} catch (erro) {
		// Sem os lançamentos automáticos o mês ainda abre; tenta de novo na próxima vez
		console.warn('Não foi possível lançar as contas fixas do mês', erro)
		return { transacoes, recorrencias }
	}
}

// Fica acima das páginas: o mês escolhido vale para todas as telas,
// e os modais de transação são um só para o app inteiro
export function TransacaoProvider(props: { children: ReactNode }) {
	const { usuario } = useContext(AutenticacaoContext)
	const [data, setData] = useState<Date>(new Date())
	// Valor salvo como texto puro ('lista' | 'grade'), igual à versão anterior
	const [tipoExibicao, setTipoExibicao] = useLocalStorage<TipoExibicao>({
		key: CHAVE_EXIBICAO,
		defaultValue: 'lista',
		getInitialValueInEffect: true,
		serialize: (valor) => valor,
		deserialize: (valor) => (valor === 'grade' ? 'grade' : 'lista'),
	})
	const [transacoes, setTransacoes] = useState<Transacao[]>([])
	const [recorrencias, setRecorrencias] = useState<Recorrencia[]>([])
	const [carregando, setCarregando] = useState(true)
	const [selecionada, setSelecionada] = useState<Transacao | null>(null)
	const [repetirNova, setRepetirNova] = useState(false)
	const [modalAberto, { open: abrirModal, close: fecharModal }] = useDisclosure(false)
	const [aConfirmar, setAConfirmar] = useState<Transacao | null>(null)

	const aplicar = useCallback((dados: DadosDoMes) => {
		setTransacoes(dados.transacoes)
		setRecorrencias(dados.recorrencias)
		setCarregando(false)
	}, [])

	const recarregar = useCallback(async () => {
		if (!usuario) return
		aplicar(await carregarMes(usuario, data))
	}, [usuario, data, aplicar])

	// Busca ao trocar de usuário ou de mês. O "ativo" descarta a resposta
	// de um mês antigo que chegue depois da do mês atual.
	useEffect(() => {
		if (!usuario) return
		let ativo = true
		carregarMes(usuario, data).then((dados) => {
			if (ativo) aplicar(dados)
		})
		return () => {
			ativo = false
		}
	}, [usuario, data, aplicar])

	const projecoes = mesFuturo(data)
		? recorrencias.filter((r) => r.id && geraNoMes(r, data)).map((r) => gerarLancamento(r, data))
		: []

	async function salvar(transacao: Transacao, opcoes: OpcoesSalvar = {}) {
		if (!usuario) return
		if (opcoes.repetir && !transacao.id) {
			await servicos.recorrencia.criarDeTransacao(usuario, transacao, opcoes.repetir)
		} else if (transacao.recorrenciaId) {
			await servicos.recorrencia.salvarLancamento(
				usuario,
				transacao,
				opcoes.escopo ?? 'este',
				recorrencias,
			)
		} else {
			await servicos.transacao.salvar(transacao, usuario)
		}
		await recarregar()
	}

	async function excluir(transacao: Transacao, escopo: Escopo = 'este') {
		if (!usuario) return
		if (transacao.recorrenciaId) {
			await servicos.recorrencia.excluirLancamento(usuario, transacao, escopo, recorrencias)
		} else {
			await servicos.transacao.excluir(transacao, usuario)
		}
		await recarregar()
	}

	async function confirmarValor(transacao: Transacao, valor: number, novaData: Date) {
		if (!usuario) return
		await servicos.recorrencia.confirmarValor(usuario, transacao, valor, novaData)
		await recarregar()
	}

	async function editarRecorrencia(r: Recorrencia, mudancas: Partial<Recorrencia>) {
		if (!usuario) return ''
		const aPartirDe = await servicos.recorrencia.editar(usuario, r, mudancas)
		await recarregar()
		return aPartirDe
	}

	async function alterarAtiva(r: Recorrencia, ativa: boolean) {
		if (!usuario) return
		await servicos.recorrencia.alterarAtiva(usuario, r, ativa)
		await recarregar()
	}

	async function excluirRecorrencia(r: Recorrencia) {
		if (!usuario) return
		await servicos.recorrencia.excluir(usuario, r)
		await recarregar()
	}

	function abrirEdicao(transacao: Transacao) {
		// Prevista: o primeiro passo é confirmar o valor
		if (ehPrevista(transacao)) {
			setAConfirmar(transacao)
			return
		}
		setRepetirNova(false)
		setSelecionada(transacao)
		abrirModal()
	}

	return (
		<TransacaoContext.Provider
			value={{
				data,
				transacoes,
				recorrencias,
				projecoes,
				carregando,
				tipoExibicao,
				alterarData: setData,
				alterarTipoExibicao: setTipoExibicao,
				salvar,
				excluir,
				confirmarValor,
				editarRecorrencia,
				alterarAtiva,
				excluirRecorrencia,
				abrirNova: (opcoes) => {
					setSelecionada(null)
					setRepetirNova(!!opcoes?.repetir)
					abrirModal()
				},
				abrirEdicao,
				abrirConfirmacao: setAConfirmar,
			}}
		>
			{props.children}
			<ModalTransacao
				aberto={modalAberto}
				fechar={fecharModal}
				transacao={selecionada}
				repetir={repetirNova}
				recorrencias={recorrencias}
				salvar={salvar}
				excluir={excluir}
			/>
			<ModalConfirmarValor
				transacao={aConfirmar}
				fechar={() => setAConfirmar(null)}
				confirmar={confirmarValor}
				editarTudo={(t) => {
					setAConfirmar(null)
					setRepetirNova(false)
					setSelecionada(t)
					abrirModal()
				}}
			/>
		</TransacaoContext.Provider>
	)
}

export default TransacaoContext
