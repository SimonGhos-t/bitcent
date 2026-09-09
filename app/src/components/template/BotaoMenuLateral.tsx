import { Burger } from '@mantine/core'

interface BotaoMenuLateralProps {
	aberto: boolean
	className?: string
	aoAlternar: () => void
}

export default function BotaoMenuLateral(props: BotaoMenuLateralProps) {
	return (
		<div className={`${props.className}`}>
			<Burger opened={props.aberto} onClick={props.aoAlternar} lineSize={1} size={25} />
		</div>
	)
}
