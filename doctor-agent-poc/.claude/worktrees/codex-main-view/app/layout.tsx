import type { Metadata } from 'next'
import { Mulish, Inter } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { TPThemeProvider } from '@/components/tp-theme-provider'
import './globals.css'

const mulish = Mulish({
  subsets: ['latin'],
  variable: '--font-heading',
  weight: ['400', '500', '600', '700', '800'],
})

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
})


export const metadata: Metadata = {
  title: 'TatvaPractice Design System',
  description: 'TatvaPractice Design System. Locked brand colors, gradient rules, semantic tokens, and component demos.',
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${mulish.variable} ${inter.variable} font-sans antialiased`}>
        <TPThemeProvider>
          {children}
          <Analytics />
        </TPThemeProvider>
      </body>
    </html>
  )
}
