export function asset(path: string): string {
  const base = import.meta.env.BASE_URL
  return `${base}${path.replace(/^\//, '')}`
}

export function exerciseImage(path: string): string {
  return asset(`exercises/${path}`)
}
