'use client'
import { useContext, useEffect } from "react"
import AutenticacaoContext from "../../data/contexts/AutenticacaoContext"
import Carregando from "../template/Carregando"
import { useRouter } from "next/navigation"

interface ForcarAutenticacaoProps {
    children: React.ReactNode
}
export default function ForcarAutenticacao(props: ForcarAutenticacaoProps) {
    const router = useRouter()
    const { usuario, carregando } = useContext(AutenticacaoContext)

    useEffect(() => {
        if (!carregando && !usuario?.email) {
            router.push('/')
        }
    }, [carregando, usuario, router])

    if (carregando || !usuario?.email) {
        return <Carregando/>
    }

    return props.children
}