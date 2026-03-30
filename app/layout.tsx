import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { Toaster } from '@/components/ui/sonner'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'SmartFlow Outreach',
  description: 'Real estate agent outreach management dashboard',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Apply saved theme before first paint to avoid flash */}
        <script dangerouslySetInnerHTML={{ __html: `(function(){try{var t=localStorage.getItem('sf-theme');if(t!=='dark')document.documentElement.classList.add('light');}catch(e){document.documentElement.classList.add('light');}})()` }} />
      </head>
      <body className={`${inter.className} min-h-screen bg-slate-950 text-slate-100`}>
        {children}
        <Toaster position="bottom-right" />
      </body>
    </html>
  )
}
