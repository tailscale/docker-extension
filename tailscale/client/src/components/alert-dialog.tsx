import React from "react"
import Button from "src/components/button"
import * as Primitive from "@radix-ui/react-alert-dialog"

type Props = {
  title: string
  trigger?: React.ReactNode
  children?: React.ReactNode
  action: string
  destructive?: boolean

  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
}

export default function AlertDialog(props: Props) {
  const {
    action,
    children,
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
        <Primitive.Overlay className="fixed inset-0 py-8 z-10 bg-gray-900 bg-opacity-[0.25]">
          <Primitive.Content
            aria-label={title}
            className="bg-white dark:bg-docker-dark-gray-600 dark:text-white rounded-lg relative p-6 text-gray-700 max-w-lg min-w-[19rem] my-8 mx-auto w-[97%] shadow-2xl z-30"
          >
            <header className="flex items-center justify-between space-x-4 mb-2">
              <h1 className="font-semibold text-lg truncate">{title}</h1>
            </header>
            <div className="mb-6 text-sm">{children}</div>
            <footer className="flex space-x-2 justify-end">
              <Primitive.Cancel asChild>
                <Button>Cancel</Button>
              </Primitive.Cancel>
              <Primitive.Action asChild>
                <Button
                  variant={destructive ? "danger" : "primary"}
                  onClick={onConfirm}
                >
                  {action}
                </Button>
              </Primitive.Action>
            </footer>
          </Primitive.Content>
        </Primitive.Overlay>
      </Primitive.Portal>
    </Primitive.Root>
  )
}

AlertDialog.defaultProps = {
  action: "Save",
}
