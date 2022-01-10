import * as AvatarPrimitive from "@radix-ui/react-avatar"
import cx from "classnames"

type Props = {
  className?: string
  src?: string
  name: string
}

export default function Avatar(props: Props) {
  const { className, name, src } = props
  return (
    <AvatarPrimitive.Root
      className={cx(
        "inline-block rounded-full overflow-hidden select-none border shadow-avatar",
        className,
      )}
    >
      <AvatarPrimitive.Image src={src} alt={name} />
      <AvatarPrimitive.Fallback
        className={cx(
          "flex items-center justify-center text-center h-full w-full",
          getBackgroundColor(name),
        )}
        delayMs={300}
      >
        <span className="font-semibold text-xs tracking-wider antialiased">
          {getInitials(name)}
        </span>
      </AvatarPrimitive.Fallback>
    </AvatarPrimitive.Root>
  )
}

function hashCode(str: string): number {
  return str
    .split("")
    .reduce(
      (prevHash: number, currVal: string) =>
        Math.trunc((prevHash << 5) - prevHash + currVal.charCodeAt(0)),
      0,
    )
}

const colors = ["bg-blue-500", "bg-purple-500", "bg-emerald-500"]

function getBackgroundColor(userId: string) {
  const n = Math.abs(hashCode(userId))
  return colors[n % colors.length]
}

function getInitials(name: string) {
  return name
    .split(" ")
    .map((word) => (word.trim().length > 0 ? word[0] : ""))
    .join("")
    .slice(0, 2)
}
