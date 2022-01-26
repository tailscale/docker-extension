import React, { useCallback } from "react"
import cx from "classnames"
import * as MenuPrimitive from "@radix-ui/react-dropdown-menu"
import { openBrowser } from "src/utils"

type Props = {
  children: React.ReactNode
  asChild?: boolean
  trigger: React.ReactNode
} & Pick<
  MenuPrimitive.MenuContentProps,
  "side" | "sideOffset" | "align" | "alignOffset" | "onCloseAutoFocus"
> &
  Pick<MenuPrimitive.DropdownMenuProps, "open" | "onOpenChange">

/**
 * DropdownMenu is a floating menu with actions. It should be used to provide
 * additional actions for users that don't warrant a top-level button.
 */
export default function DropdownMenu(props: Props) {
  const {
    children,
    asChild,
    trigger,
    side,
    sideOffset,
    align,
    alignOffset,
    open,
    onOpenChange,
    onCloseAutoFocus,
  } = props

  return (
    <MenuPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <MenuPrimitive.Trigger asChild={asChild}>{trigger}</MenuPrimitive.Trigger>
      <MenuPrimitive.Content
        className="dropdown shadow-popover overflow-hidden text-sm bg-white dark:bg-[#333e46] rounded-md py-1 z-50"
        side={side}
        sideOffset={sideOffset}
        align={align}
        alignOffset={alignOffset}
        onCloseAutoFocus={onCloseAutoFocus}
      >
        {children}
      </MenuPrimitive.Content>
    </MenuPrimitive.Root>
  )
}

DropdownMenu.defaultProps = {
  sideOffset: 10,
}

DropdownMenu.Group = DropdownMenuGroup
DropdownMenu.Item = DropdownMenuItem
DropdownMenu.Link = DropdownMenuLink
DropdownMenu.RadioGroup = MenuPrimitive.RadioGroup
DropdownMenu.RadioItem = MenuPrimitive.RadioItem
/**
 * DropdownMenu.Separator should be used to divide items into sections within a
 * DropdownMenu.
 */
DropdownMenu.Separator = DropdownSeparator

const menuItemClasses = "block px-4 py-2"
const menuItemInteractiveClasses =
  "cursor-pointer focus:outline-none hover:enabled:bg-gray-100 focus:bg-gray-100 dark:hover:enabled:bg-[#5E6971] dark:focus:bg-[#5E6971]"

type CommonMenuItemProps = {
  className?: string
  disabled?: boolean
  /**
   * hidden determines whether or not the menu item should appear. It's exposed as
   * a convenience for menus with many nested conditionals.
   */
  hidden?: boolean
}

type DropdownMenuGroupProps = CommonMenuItemProps & MenuPrimitive.MenuGroupProps

function DropdownMenuGroup(props: DropdownMenuGroupProps) {
  const { className, ...rest } = props

  return (
    <MenuPrimitive.Group className={cx(className, menuItemClasses)} {...rest} />
  )
}

type DropdownMenuItemProps = {
  intent?: "danger"
} & CommonMenuItemProps &
  Omit<MenuPrimitive.MenuItemProps, "onClick">

function DropdownMenuItem(props: DropdownMenuItemProps) {
  const { className, disabled, intent, hidden, ...rest } = props

  if (hidden === true) {
    return null
  }

  return (
    <MenuPrimitive.Item
      className={cx(className, menuItemClasses, menuItemInteractiveClasses, {
        "text-red-400": intent === "danger",
        "text-gray-400 bg-white cursor-default": disabled,
      })}
      disabled={disabled}
      {...rest}
    />
  )
}

type DropdownMenuLinkProps = {
  className?: string
  href: string
} & Omit<MenuPrimitive.MenuItemProps, "onClick" | "onSelect" | "asChild">

function DropdownMenuLink(props: DropdownMenuLinkProps) {
  const { className, children, disabled, href, ...rest } = props

  // handleSelect handles when users use the keyboard to select a link.
  const handleSelect = useCallback(() => {
    openBrowser(href)
  }, [href])

  // handleClick handles when users click on the link.
  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault()
      handleSelect()
    },
    [handleSelect],
  )

  return (
    <MenuPrimitive.Item
      className={cx(
        "relative",
        className,
        menuItemClasses,
        menuItemInteractiveClasses,
        {
          "text-gray-400 bg-white cursor-default": disabled,
        },
      )}
      disabled={disabled}
      onSelect={handleSelect}
      {...rest}
    >
      {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
      <a className="stretched-link" href="#" onClick={handleClick}>
        {children}
      </a>
    </MenuPrimitive.Item>
  )
}

type DropdownSeparatorProps = Omit<CommonMenuItemProps, "disabled"> &
  MenuPrimitive.MenuSeparatorProps

function DropdownSeparator(props: DropdownSeparatorProps) {
  const { className, hidden, ...rest } = props

  if (hidden === true) {
    return null
  }

  return (
    <MenuPrimitive.Separator
      className={cx(
        "my-1 border-b border-gray-200 dark:border-white dark:opacity-10",
        className,
      )}
      {...rest}
    />
  )
}
