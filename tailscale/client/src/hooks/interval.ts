import { useEffect, useRef } from "react"

export default function useInterval(fetcher: () => void, interval: number) {
  const savedFetcher = useRef<() => void>()

  useEffect(() => {
    savedFetcher.current = fetcher
  })

  useEffect(() => {
    if (interval === null) {
      return
    }
    // TODO: add support for refetching when the window regains focus, and
    // pausing polling while the window isn't in view.
    savedFetcher.current?.()
    const timerId = window.setInterval(() => {
      savedFetcher.current?.()
    }, interval)
    return () => {
      window.clearInterval(timerId)
    }
  }, [interval])
}
