import { useEffect, useState } from "react"
import cx from "classnames"

export default function LoadingView() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <div className="w-full h-full flex justify-center">
      <div
        className={cx(
          "rounded-full border-gray-400 dark:border-gray-500 border-4 border-t-transparent w-12 h-12 animate-spin transition mt-28",
          {
            "opacity-0": !mounted,
            "opacity-100": mounted,
          },
        )}
      />
    </div>
  )
}
