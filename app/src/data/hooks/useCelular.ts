import { useMediaQuery } from '@mantine/hooks'

// Telas menores que o breakpoint "sm" do Mantine (48em = 768px)
export default function useCelular(): boolean {
	return useMediaQuery('(max-width: 47.99em)') ?? false
}
