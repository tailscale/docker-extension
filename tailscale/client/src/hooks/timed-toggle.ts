import { useEffect, useRef, useState } from "react"

/**
 * useTimedToggle is a hook for providing a UI state change that resets to the
 * default value after a set amount of time. This is useful for confirmation
 * changes where we temporarily show a confirmation that later disappears.
 */
export default function useTimedToggle(
  defaultValue: boolean,
  timeout: number = 3000,
): [boolean, React.Dispatch<React.SetStateAction<boolean>>] {
  const [value, setValue] = useState(defaultValue)
  const timeoutId = useRef<number>()

  useEffect(() => {
    if (value !== defaultValue) {
      timeoutId.current = window.setTimeout(() => {
        setValue(defaultValue)
      }, timeout)
    }

    return () => {
      if (!timeoutId.current) {
        return
      }
      clearTimeout(timeoutId.current)
    }
  }, [value, defaultValue, timeout])

  return [value, setValue]
}
