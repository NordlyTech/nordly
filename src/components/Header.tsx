import { Button } from '@/components/ui/button'
import { Leaf } from '@phosphor-icons/react'
import { Link, useLocation } from 'react-router-dom'

export function Header() {
  const location = useLocation()
  
  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/'
    return location.pathname.startsWith(path)
  }
  
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-lg border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <Leaf size={20} weight="bold" className="text-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-foreground">Nordly</span>
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            <Link 
              to="/" 
              className={`text-sm font-medium transition-colors ${
                isActive('/') ? 'text-primary' : 'text-muted-foreground hover:text-primary'
              }`}
            >
              Home
            </Link>
            <Link 
              to="/pricing" 
              className={`text-sm font-medium transition-colors ${
                isActive('/pricing') ? 'text-primary' : 'text-muted-foreground hover:text-primary'
              }`}
            >
              Pricing
            </Link>
            <Link 
              to="/onboarding" 
              className={`text-sm font-medium transition-colors ${
                isActive('/onboarding') ? 'text-primary' : 'text-muted-foreground hover:text-primary'
              }`}
            >
              Dashboard
            </Link>
          </nav>

          <div className="flex items-center gap-3">
            <Button variant="ghost" className="text-sm font-medium">
              Sign in
            </Button>
            <Button asChild className="bg-primary hover:bg-accent text-primary-foreground text-sm font-medium">
              <Link to="/onboarding">Get started</Link>
            </Button>
          </div>
        </div>
      </div>
    </header>
  )
}
