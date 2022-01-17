import React from "react"
import cx from "classnames"

type Props = {
  className?: string
  children?: React.ReactNode
  size?: "sm" | "md" | "lg"
  variant?: "primary" | "danger" | "secondary" | "minimal"
  loading?: boolean
  disabled?: boolean
} & React.ButtonHTMLAttributes<HTMLButtonElement>

const Button = React.forwardRef(
  (props: Props, ref: React.Ref<HTMLButtonElement>) => {
    const { className, children, size, variant, loading, disabled, ...rest } =
      props
    return (
      <button
        {...rest}
        className={cx(
          className,
          "flex items-center text-center relative whitespace-nowrap focus:ring focus:outline-none rounded-md font-semibold transition",
          {
            "px-3 py-1": size === "sm",
            "px-3 py-2": size === "md",
            "px-4 py-2 text-base": size === "lg",
            "bg-blue-500 hover:bg-blue-600 focus:bg-blue-600 text-white":
              !disabled && variant === "primary",
            "bg-gray-500 text-white": disabled && variant === "primary",
            "bg-docker-dark-red-400 hover:bg-docker-dark-red-500 text-white":
              !disabled && variant === "danger",
            "bg-red-500 text-white": disabled && variant === "danger",
            "bg-gray-200 text-gray-500 dark:text-gray-300 dark:bg-docker-dark-gray-500":
              disabled && variant === "secondary",
            "bg-gray-200 hover:bg-gray-300 text-gray-700 dark:text-white dark:bg-docker-dark-gray-500 dark:hover:bg-docker-dark-gray-400":
              !disabled && variant === "secondary",
            "text-transparent dark:text-transparent": loading,
          },
        )}
        disabled={loading || disabled}
        ref={ref}
      >
        {loading && (
          <LoadingDots
            className={cx(
              "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2",
              {
                "text-white": variant !== "secondary",
                "text-gray-700 dark:text-white": variant === "secondary",
              },
            )}
          />
        )}
        <span className="flex-grow">{children}</span>
      </button>
    )
  },
)

Button.defaultProps = {
  size: "md",
  variant: "secondary",
}

export default Button

/**
 * LoadingDots provides a set of horizontal dots to indicate a loading state.
 * These dots are helpful in horizontal contexts (like buttons) where a spinner
 * doesn't fit as well.
 */
function LoadingDots(props: React.HTMLAttributes<HTMLDivElement>) {
  const { className, ...rest } = props
  return (
    <div className={cx(className, "loading-dots")} {...rest}>
      <span />
      <span />
      <span />
    </div>
  )
}
