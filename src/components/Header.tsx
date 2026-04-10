import { Button } from '@/components/ui/button'
import { Leaf } from '@phosphor-icons/react'

export function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-lg border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <Leaf size={20} weight="bold" className="text-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-foreground">Nordly</span>
          </div>

          <nav className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
              Features
            </a>
            <a href="#pricing" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
              Pricing
            </a>
            <a href="#about" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
              About
            </a>
          </nav>

          <div className="flex items-center gap-3">
            <Button variant="ghost" className="text-sm font-medium">
              Sign in
            </Button>
            <Button className="bg-primary hover:bg-accent text-primary-foreground text-sm font-medium">
              Get started
            </Button>
          </div>
        </div>
      </div>
    </header>
  )
}
