import { useEffect } from 'react'

/**
 * Sets document.title for the current page.
 * Called at the top of each page component for per-route SEO titles.
 */
export function useDocumentTitle(title: string) {
  useEffect(() => {
    const previous = document.title
    document.title = title
    return () => { document.title = previous }
  }, [title])
}
