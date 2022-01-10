import { useEffect } from "react"

export default function useInterval(fetcher: () => void, interval: number) {
  useEffect(() => {
    // TODO: add support for refetching when the window regains focus, and
    // pausing polling while the window isn't in view.
    const timerId = window.setInterval(() => {
      fetcher()
    }, interval)
    fetcher()
    return () => {
      window.clearInterval(timerId)
    }
  }, [fetcher, interval])
}
