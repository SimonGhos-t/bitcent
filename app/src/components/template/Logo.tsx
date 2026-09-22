import Image from "next/image";
import logo from "../../../../public/logo.jpg"
import nome from '../../../../public/nome-logo.jpg'

export default function Logo() {
    return (
        <div className="flex items-center">
            <Image src={logo} alt="Logo" height={60} width={60}/>
            <Image src={nome} alt="Nome" height={50} />
        </div>
    )
}