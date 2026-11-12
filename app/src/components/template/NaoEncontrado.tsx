import { Text } from '@mantine/core'
import { IconReceiptOff } from '@tabler/icons-react'

export default function NaoEncontrado(props: { children: string }) {
	return (
		<div className="flex flex-col items-center gap-2 py-12">
			<IconReceiptOff
				size={56}
				stroke={1.2}
				color="var(--mantine-color-dark-3)"
				aria-hidden
			/>
			<Text c="dimmed">{props.children}</Text>
		</div>
	)
}
