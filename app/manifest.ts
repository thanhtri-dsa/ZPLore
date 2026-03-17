import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
    return {
        name: 'Forestline Tours and Travel : Sustainable Adventures',
        short_name: 'Eco Tours',
        description: 'Experience sustainable and eco-friendly tours and safaris with Forestline Tours. Discover wildlife, explore natural landscapes, and contribute to conservation efforts. Book your green adventure today!',
        start_url: '/',
        display: 'standalone',
        background_color: '#F0FFF4',
        theme_color: '#166534',
        icons: [
            {
                src: '/favicon.ico',
                sizes: 'any',
                type: 'image/x-icon',
            },
        ],
    }
}