import { useContext } from 'react'
import TransacaoContext from '../contexts/TransacaoContext'

export type { TipoExibicao } from '../contexts/TransacaoContext'

export default function useTransacao() {
	return useContext(TransacaoContext)
}
