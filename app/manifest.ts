import type { MetadataRoute } from 'next'

// Permite instalar o BitCent no celular ("Adicionar à tela inicial") e abrir em tela cheia
export default function manifest(): MetadataRoute.Manifest {
	return {
		id: '/',
		name: 'BitCent — Controle financeiro',
		short_name: 'BitCent',
		description: 'Controle de gastos e registro de despesas',
		lang: 'pt-BR',
		start_url: '/',
		scope: '/',
		display: 'standalone',
		orientation: 'portrait',
		background_color: '#000000',
		theme_color: '#000000',
		icons: [
			{ src: '/icones/bitcent-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
			{ src: '/icones/bitcent-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
			// O símbolo ocupa ~60% da arte, dentro da área segura da máscara do Android
			{
				src: '/icones/bitcent-512.png',
				sizes: '512x512',
				type: 'image/png',
				purpose: 'maskable',
			},
		],
	}
}
