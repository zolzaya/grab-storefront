import { useEffect, useState } from 'react'

interface ScreenReaderAnnouncerProps {
  message: string
  clearAfter?: number
}

export default function ScreenReaderAnnouncer({
  message,
  clearAfter = 3000
}: ScreenReaderAnnouncerProps) {
  const [currentMessage, setCurrentMessage] = useState('')

  useEffect(() => {
    if (message) {
      setCurrentMessage(message)

      if (clearAfter > 0) {
        const timer = setTimeout(() => {
          setCurrentMessage('')
        }, clearAfter)

        return () => clearTimeout(timer)
      }
    }
  }, [message, clearAfter])

  if (!currentMessage) return null

  return (
    <div
      aria-live="polite"
      aria-atomic="true"
      className="sr-only"
      role="status"
    >
      {currentMessage}
    </div>
  )
}

interface FilterAnnouncementProps {
  totalProducts: number
  isLoading: boolean
}

export function FilterAnnouncement({ totalProducts, isLoading }: FilterAnnouncementProps) {
  const [announcement, setAnnouncement] = useState('')

  useEffect(() => {
    if (!isLoading && totalProducts >= 0) {
      const message = totalProducts === 0
        ? 'No products found matching your filters'
        : `${totalProducts} products found`

      setAnnouncement(message)
    } else if (isLoading) {
      setAnnouncement('Filtering products...')
    }
  }, [totalProducts, isLoading])

  return <ScreenReaderAnnouncer message={announcement} />
}