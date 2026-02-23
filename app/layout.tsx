import type { Metadata, Viewport } from 'next'
export const metadata: Metadata = {
  title: 'MASTRO ERP',
  description: 'Il sistema operativo del serramentista',
  manifest: '/manifest.json',
  appleWebApp: { capable: true, statusBarStyle: 'black-translucent', title: 'MASTRO' },
}
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#1A1A1C',
}
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="it">
      <head>
        <link rel="apple-touch-icon" href="/icon-192.png" />
      </head>
      <body style={{ margin: 0, padding: 0, fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif' }}>
        {children}
        <script dangerouslySetInnerHTML={{ __html: "if('serviceWorker' in navigator) navigator.serviceWorker.register('/sw.js')" }} />
      </body>
    </html>
  )
}
