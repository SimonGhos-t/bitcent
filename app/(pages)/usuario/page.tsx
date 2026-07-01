import Conteudo from "@/app/src/components/template/Conteudo";
import Cabecalho from "../../src/components/template/Cabecalho";
import Pagina from "../../src/components/template/Pagina";
import TituloPagina from "@/app/src/components/template/TituloPagina";
import { IconForms } from "@tabler/icons-react";
import usuario from "@/app/src/data/constants/usuarioFalso";
import Formularios from "@/app/src/components/usuario/Formularios";

export default function Home() {

    return (
        <Pagina>
            <Cabecalho/>
            <Conteudo>
                <TituloPagina icone={<IconForms/>} principal="Dados Cadastrais" secundario={`Informações de ${usuario.email}`}/>
                <Formularios/>
            </Conteudo>
        </Pagina>
    )	
}