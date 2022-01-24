import React from "react"
import { openBrowser } from "src/utils"

type Props = React.AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }

/**
 * Link is a component to wrap a standard anchor tag. Since the Docker Desktop
 * extension is in an iframe, this is the only way we can open links in the
 * user's host machine browser.
 */
export default function Link(props: Props) {
  const { href, onClick } = props

  return (
    // eslint-disable-next-line jsx-a11y/anchor-has-content
    <a
      {...props}
      href={href}
      onClick={(e) => {
        e.preventDefault()
        openBrowser(href)
        onClick?.(e)
      }}
    />
  )
}
