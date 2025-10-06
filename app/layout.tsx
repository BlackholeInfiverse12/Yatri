import type { Metadata } from 'next'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import { Analytics } from '@vercel/analytics/next'
import { ThemeProvider } from '@/components/theme-provider'
import { CSSLoader } from '@/components/css-loader'
import './globals.css'

export const metadata: Metadata = {
  title: 'Yatri - Mumbai Transit',
  description: 'Smart multimodal transportation planner for Mumbai commuters',
  generator: 'Next.js',
  keywords: ['mumbai', 'transit', 'train', 'route planner', 'local train'],
  authors: [{ name: 'Yatri Team' }],
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Preload critical fonts */}
        <link
          rel="preload"
          href="/fonts/geist-sans-webfont.woff2"
          as="font"
          type="font/woff2"
          crossOrigin=""
        />
        
        {/* Preload deferred CSS for faster loading */}
        <link
          rel="preload"
          href="/styles/deferred.css"
          as="style"
        />
        
        {/* DNS prefetch for external resources */}
        <link rel="dns-prefetch" href="//vercel.com" />
        
        {/* Optimize render blocking */}
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
      </head>
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable}`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <CSSLoader />
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  )
}
