import { Link } from '@tanstack/react-router'

import { ThemeToggle } from '#/components/ThemeToggle'
import { UserMenu } from '#/components/UserMenu'

const navBase = 'rounded-md px-3 py-1.5 text-sm transition-colors'
const navActive = { className: 'bg-accent text-foreground' }
const navInactive = { className: 'text-muted-foreground hover:text-foreground' }

export default function Header() {
  return (
    <header className="sticky top-4 z-40 mx-auto mt-4 max-w-5xl rounded-2xl border bg-background/70 shadow-sm backdrop-blur">
      <div className="flex h-14 items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <Link
            to="/dashboard"
            className="px-2 font-display text-lg font-semibold"
          >
            TailorCV
          </Link>
          <nav className="flex items-center gap-1">
            <Link
              to="/dashboard"
              className={navBase}
              activeProps={navActive}
              inactiveProps={navInactive}
            >
              Dashboard
            </Link>
            <Link
              to="/applications"
              className={navBase}
              activeProps={navActive}
              inactiveProps={navInactive}
            >
              Applications
            </Link>
            <Link
              to="/github"
              className={navBase}
              activeProps={navActive}
              inactiveProps={navInactive}
            >
              GitHub
            </Link>
            <Link
              to="/pricing"
              className={navBase}
              activeProps={navActive}
              inactiveProps={navInactive}
            >
              Pricing
            </Link>
          </nav>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <UserMenu />
        </div>
      </div>
    </header>
  )
}
