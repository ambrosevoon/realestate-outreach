'use client'

import { useEffect, useState } from 'react'
import { Sun, Moon } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function ThemeToggle() {
  const [light, setLight] = useState(false)

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
      className="text-slate-500 hover:text-white cursor-pointer w-8 h-8"
      title={light ? 'Switch to dark mode' : 'Switch to light mode'}
    >
      {light ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
    </Button>
  )
}
