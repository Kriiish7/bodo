import { useState, useEffect, useCallback } from 'react'

type Theme = 'light' | 'dark' | 'auto' | 'blue' | 'rose' | 'amber'
type ResolvedTheme = 'light' | 'dark' | 'blue' | 'rose' | 'amber'

const THEMES: Theme[] = ['light', 'dark', 'auto', 'blue', 'rose', 'amber']
const RESOLVED_THEMES: ResolvedTheme[] = ['light', 'dark', 'blue', 'rose', 'amber']

function getSystemPreference(): ResolvedTheme {
  if (typeof window === 'undefined') return 'light'
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

function resolveTheme(theme: Theme): ResolvedTheme {
  return theme === 'auto' ? getSystemPreference() : theme
}

function applyTheme(resolved: ResolvedTheme, mode: Theme) {
  const root = document.documentElement
  root.classList.remove(...RESOLVED_THEMES)
  root.classList.add(resolved)
  if (mode === 'auto') {
    root.removeAttribute('data-theme')
  } else {
    root.setAttribute('data-theme', mode)
  }
  // colorScheme should just be light or dark ideally, but let's fall back to light for custom themes
  root.style.colorScheme = (resolved === 'dark' || resolved === 'blue') ? 'dark' : 'light'
}

export function useTheme() {
  const [theme, setThemeState] = useState<Theme>(() => {
    if (typeof window === 'undefined') return 'auto'
    const stored = window.localStorage.getItem('theme') as Theme
    if (THEMES.includes(stored)) return stored
    return 'auto'
  })

  const resolved = resolveTheme(theme)

  const setTheme = useCallback((newTheme: Theme) => {
    setThemeState(newTheme)
    window.localStorage.setItem('theme', newTheme)
    applyTheme(resolveTheme(newTheme), newTheme)
  }, [])

  const toggle = useCallback(() => {
    const next: ResolvedTheme = resolved === 'light' ? 'dark' : 'light'
    setTheme(next)
  }, [resolved, setTheme])

  useEffect(() => {
    applyTheme(resolved, theme)
  }, [resolved, theme])

  // Listen for system preference changes when set to 'auto'
  useEffect(() => {
    if (theme !== 'auto') return
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const handler = () => applyTheme(resolveTheme('auto'), 'auto')
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [theme])

  return { theme, resolved, setTheme, toggle }
}
