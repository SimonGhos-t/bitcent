import Conteudo from "@/app/src/components/template/Conteudo";
import Cabecalho from "../../src/components/template/Cabecalho";
import Pagina from "../../src/components/template/Pagina";

export default function Home() {
    return (
        <Pagina>
            <Cabecalho/>
            <Conteudo>
                <div>Usuario</div>
            </Conteudo>
        </Pagina>
    )	
}