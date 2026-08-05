'use client'
import { useContext } from "react"
import AutenticacaoContext from "../../data/contexts/AutenticacaoContext"

export default function BoasVindas() {
    const {usuario} = useContext(AutenticacaoContext)

    function renderizarNome() {
        return <span>{usuario?.nome.split(' ')[0]}</span>
    }
    return (
		<div className="text-3xl font-black">
			Olá {renderizarNome()} 👋
		</div>
	)
}