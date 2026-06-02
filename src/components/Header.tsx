import { Link } from '@tanstack/react-router'

export default function Header() {
  return (
    <nav className="flex gap-4 p-4 border-b">
      <Link to="/dashboard" activeProps={{ className: 'font-bold' }}>
        Dashboard
      </Link>
      <Link to="/applications" activeProps={{ className: 'font-bold' }}>
        Applications
      </Link>
      <Link to="/applications/new" activeProps={{ className: 'font-bold' }}>
        New Application
      </Link>
    </nav>
  )
}
