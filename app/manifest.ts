import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
    return {
        name: 'Làng Nghề Travel – Hành trình về nguồn cội',
        short_name: 'Làng Nghề',
        description: 'Khám phá làng nghề truyền thống, gặp gỡ nghệ nhân, trải nghiệm thủ công và văn hóa địa phương cùng Làng Nghề Travel.',
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
