import { Link } from '@tanstack/react-router'
import { Menu } from 'lucide-react'
import { useState } from 'react'

import { ThemeToggle } from '#/components/ThemeToggle'
import { UserMenu } from '#/components/UserMenu'
import { Button } from '#/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from '#/components/ui/sheet'

const links = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/applications', label: 'Applications' },
  { to: '/github', label: 'GitHub' },
  { to: '/pricing', label: 'Pricing' },
] as const

const navBase = 'rounded-md px-3 py-1.5 text-sm transition-colors'
const navActive = { className: 'bg-accent text-foreground' }
const navInactive = { className: 'text-muted-foreground hover:text-foreground' }

export default function Header() {
  const [open, setOpen] = useState(false)

  return (
    <header className="sticky top-4 z-40 mx-auto mt-4 max-w-4xl rounded-2xl border bg-background/70 shadow-sm backdrop-blur">
      <div className="flex h-14 items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <Link
            to="/dashboard"
            className="px-2 font-display text-lg font-semibold"
          >
            TailorCV
          </Link>
          {/* desktop nav */}
          <nav className="hidden items-center gap-1 sm:flex">
            {links.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                className={navBase}
                activeProps={navActive}
                inactiveProps={navInactive}
              >
                {l.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          {/* desktop user menu */}
          <div className="hidden sm:block">
            <UserMenu />
          </div>
          {/* mobile hamburger */}
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="sm:hidden"
                aria-label="Open menu"
              >
                <Menu className="size-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-64 px-4">
              <SheetTitle className="px-3 pt-4 font-display text-lg">
                TailorCV
              </SheetTitle>
              <nav className="mt-4 flex flex-col gap-1">
                {links.map((l) => (
                  <Link
                    key={l.to}
                    to={l.to}
                    className={`${navBase} py-2.5`}
                    activeProps={navActive}
                    inactiveProps={navInactive}
                    onClick={() => setOpen(false)}
                  >
                    {l.label}
                  </Link>
                ))}
              </nav>
              <div className="mt-4 border-t pt-4">
                <UserMenu />
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}
