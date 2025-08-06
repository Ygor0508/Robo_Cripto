import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Robo_Trader',
  description: 'Dashboard para gerenciamento de robôs de trading',
  generator: 'Ygor Campos',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  )
}
