export const HEADER_THEME_GREEN = 'green'
export const HEADER_THEME_BLUE = 'blue'

export type HeaderTheme = typeof HEADER_THEME_GREEN | typeof HEADER_THEME_BLUE

export const DEFAULT_HEADER_THEME: HeaderTheme = HEADER_THEME_GREEN

const VALID_HEADER_THEMES: HeaderTheme[] = [HEADER_THEME_GREEN, HEADER_THEME_BLUE]

export function normalizeHeaderTheme(value: unknown): HeaderTheme {
  if (typeof value === 'string' && VALID_HEADER_THEMES.includes(value as HeaderTheme)) {
    return value as HeaderTheme
  }

  return DEFAULT_HEADER_THEME
}

export function parseHeaderThemeRecord(value: unknown): HeaderTheme {
  if (value && typeof value === 'object' && 'value' in value) {
    return normalizeHeaderTheme((value as { value?: unknown }).value)
  }

  return normalizeHeaderTheme(value)
}