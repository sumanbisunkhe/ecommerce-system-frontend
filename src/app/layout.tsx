//src\app\layout.tsx

import type { Metadata } from 'next'
import { Fascinate, Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })
const fascinate = Fascinate({
  subsets: ["latin"],
  weight: "400",
})
export const metadata: Metadata = {
  title: 'HoT🔥sHoP',
  description: 'Multi-role e-commerce platform',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {children}
      </body>
    </html>
  )
}