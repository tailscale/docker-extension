import React from "react"
import * as Primitive from "@radix-ui/react-tooltip"

type Props = {
  asChild?: boolean
  content: React.ReactNode
  children: React.ReactNode
  sideOffset?: number
}

export default function Tooltip(props: Props) {
  const { asChild, content, children, sideOffset } = props
  return (
    <Primitive.Root>
      <Primitive.Trigger asChild={asChild}>{children}</Primitive.Trigger>
      <Primitive.Content
        className="px-2 py-1 bg-[#5e6971] text-white rounded-md"
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
