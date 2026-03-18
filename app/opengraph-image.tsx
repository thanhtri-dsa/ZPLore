import { ImageResponse } from 'next/og'
import { Roboto } from 'next/font/google'

const roboto = Roboto({
  subsets: ['latin'],
  weight: ['400', '700'],
})

export const runtime = 'edge'
export const alt = 'Làng Nghề Travel'
export const size = {
  width: 1200,
  height: 630,
}
export const contentType = 'image/png'

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          backgroundColor: 'white',
          fontFamily: roboto.style.fontFamily,
        }}
      >
        {/* Left content section */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            width: '50%',
            padding: '40px',
            gap: '20px',
          }}
        >
          <h1
            style={{
              fontSize: '64px',
              fontWeight: 700,
              lineHeight: 1.1,
              margin: 0,
              color: '#000',
            }}
          >
            Làng Nghề Travel
          </h1>
          <p
            style={{
              fontSize: '32px',
              color: '#666',
              margin: 0,
              lineHeight: 1.4,
            }}
          >
            Hành trình về nguồn cội: làng nghề, nghệ nhân, workshop trải nghiệm
          </p>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              marginTop: '20px',
            }}
          >
            {/* Small circular avatar/logo */}
            <div
              style={{
                width: '30px',
                height: '30px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #064e3b 0%, #16a34a 100%)',
              }}
            />
            <span
              style={{
                fontSize: '24px',
                color: '#666',
              }}
            >
              langnghetravel.vn
            </span>
          </div>
        </div>

        {/* Right image section */}
        <div
          style={{
            width: '50%',
            height: '100%',
            background: 'radial-gradient(circle at top left, rgba(16,185,129,0.28), transparent 55%), radial-gradient(circle at bottom right, rgba(6,95,70,0.30), transparent 55%), linear-gradient(135deg, #0b1220 0%, #0f172a 100%)',
          }}
        />
      </div>
    ),
    {
      ...size,
    }
  )
}
