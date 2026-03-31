'use client'

import { useEffect, useState } from 'react'
import { Sun, Moon } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function ThemeToggle() {
  const [light, setLight] = useState(true)

  useEffect(() => {
    setLight(document.documentElement.classList.contains('light'))
  }, [])

  const toggle = () => {
    const next = !light
    setLight(next)
    if (next) {
      document.documentElement.classList.add('light')
      localStorage.setItem('sf-theme', 'light')
    } else {
      document.documentElement.classList.remove('light')
      localStorage.setItem('sf-theme', 'dark')
    }
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggle}
      className="theme-toggle-button w-8 h-8 cursor-pointer rounded-full border border-white/10 bg-white/[0.04] text-stone-400 hover:bg-white/[0.08] hover:text-white"
      title={light ? 'Switch to dark mode' : 'Switch to light mode'}
    >
      {light ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
    </Button>
  )
}
