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
    const { className, size, variant, loading, disabled, ...rest } = props
    return (
      <button
        {...rest}
        className={cx(
          className,
          "flex items-center whitespace-nowrap focus:ring focus:outline-none rounded-md font-semibold transition",
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
            "bg-gray-300 hover:bg-gray-400 text-gray-700 dark:text-white dark:bg-docker-dark-gray-500 dark:hover:bg-docker-dark-gray-600":
              !disabled && variant === "secondary",
          },
        )}
        disabled={loading || disabled}
        ref={ref}
      />
    )
  },
)

Button.defaultProps = {
  size: "md",
  variant: "secondary",
}

export default Button
