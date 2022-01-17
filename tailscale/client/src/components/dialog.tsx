import React from "react"
import cx from "classnames"
import Button from "src/components/button"
import * as Primitive from "@radix-ui/react-dialog"

type Props = {
  className?: string
  title: string
  trigger?: React.ReactNode
  children?: React.ReactNode
  cancel?: string
  action?: string
  destructive?: boolean

  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
}

export default function AlertDialog(props: Props) {
  const {
    action,
    cancel = "Cancel",
    children,
    className,
    destructive = false,
    trigger,
    title,
    open,
    onOpenChange,
    onConfirm,
  } = props

  return (
    <Primitive.Root open={open} onOpenChange={onOpenChange}>
      {trigger && <Primitive.Trigger>{trigger}</Primitive.Trigger>}
      <Primitive.Portal>
        <Primitive.Overlay className="dialog-overlay fixed inset-0 py-8 z-10 bg-gray-800 bg-opacity-25 dark:bg-opacity-75">
          <Primitive.Content
            aria-label={title}
            className={cx(
              "dialog-content bg-white dark:bg-docker-dark-gray-600 text-gray-700 dark:text-white rounded-lg relative px-5 pt-4 pb-5 max-w-lg min-w-[19rem] my-8 mx-auto w-[97%] shadow-2xl z-30",
              className,
            )}
          >
            <header className="flex items-center justify-between space-x-4 mb-4">
              <h1 className="font-semibold text-lg truncate">{title}</h1>
            </header>
            <div className="mb-6 text-sm">{children}</div>
            <footer className="flex space-x-2 justify-end">
              <Primitive.Close asChild>
                <Button
                  className={cx({ "w-full": cancel && !action })}
                  size="lg"
                >
                  {cancel}
                </Button>
              </Primitive.Close>
              {action && (
                <Button
                  variant={destructive ? "danger" : "primary"}
                  size="lg"
                  onClick={onConfirm}
                >
                  {action}
                </Button>
              )}
            </footer>
            <Primitive.Close asChild>
              <button className="absolute top-3 right-3 px-2 py-2 rounded-lg focus:outline-none focus:ring text-gray-400 dark:text-gray-400 hover:text-gray-800 focus:text-gray-800 dark:hover:text-gray-300 dark:focus:text-gray-300 transition">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M18 6L6 18"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M6 6L18 18"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </Primitive.Close>
          </Primitive.Content>
        </Primitive.Overlay>
      </Primitive.Portal>
    </Primitive.Root>
  )
}
