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
    const fetch = () => {
      savedFetcher.current?.()
    }

    fetch()
    window.addEventListener("focus", fetch)
    const timerId = window.setInterval(fetch, interval)
    return () => {
      window.clearInterval(timerId)
      window.removeEventListener("focus", fetch)
    }
  }, [interval])
}
