import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
})

export const metadata = {
  title: 'Lockstash',
  description: '',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`h-screen w-screen flex ${inter.variable}`}>{children}</body>
    </html>
  )
}
