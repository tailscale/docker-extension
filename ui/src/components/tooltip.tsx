import React, { useCallback } from "react"
import * as Primitive from "@radix-ui/react-tooltip"

type Props = {
  asChild?: boolean
  closeOnClick?: boolean
  open?: boolean
  onOpenChange?: (open: boolean) => void
  content: React.ReactNode
  children: React.ReactNode
  sideOffset?: number
}

export default function Tooltip(props: Props) {
  const {
    asChild,
    closeOnClick = true,
    open,
    onOpenChange,
    content,
    children,
    sideOffset,
  } = props

  const preventDefault = useCallback((e) => e.preventDefault(), [])
  const handler = closeOnClick ? undefined : preventDefault

  return (
    <Primitive.Root delayDuration={200} open={open} onOpenChange={onOpenChange}>
      <Primitive.Trigger
        asChild={asChild}
        onMouseDown={handler}
        onClick={handler}
        onMouseUp={handler}
      >
        {children}
      </Primitive.Trigger>
      <Primitive.Content
        className="tooltip px-2 py-1 bg-[#5e6971] text-white text-sm text-center rounded-md max-w-xs"
        sideOffset={sideOffset}
      >
        {content}
      </Primitive.Content>
    </Primitive.Root>
  )
}

Tooltip.defaultProps = {
  sideOffset: 10,
}

Tooltip.Provider = Primitive.Provider
