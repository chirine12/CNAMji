// src/components/Header.tsx
import React from "react"
import { Heart, Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import { NavLink, Link } from "react-router-dom"

const Header = () => {
  return (
    <header className="bg-white border-b border-border sticky top-0 z-50">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">

        {/* --- Logo -------------------------------------------------- */}
        <Link to="/" className="flex items-center space-x-2">
          <Heart className="h-8 w-8 text-primary" />
          <span className="text-xl font-bold text-primary">CNAMji</span>
        </Link>

        {/* --- Menu desktop ----------------------------------------- */}
        <nav className="hidden md:flex items-center space-x-6">
          {/* le style NavLink.active change la couleur quand la route est active */}
          <NavLink to="/cnam"
         className="text-foreground hover:text-primary">
  Simulateur De Remboursement
</NavLink>

          <NavLink
            to="/documents"
            className={({ isActive }) =>
              `transition-colors ${
                isActive ? "text-primary" : "text-foreground hover:text-primary"
              }`
            }
          >
            Documents
          </NavLink>

          <NavLink
            to="/services"
            className={({ isActive }) =>
              `transition-colors ${
                isActive ? "text-primary" : "text-foreground hover:text-primary"
              }`
            }
          >
            Services
          </NavLink>

          <Button variant="outline" asChild>
            <Link to="/login">Se connecter</Link>
          </Button>
        </nav>

        {/* --- Bouton burger mobile (à implémenter plus tard) -------- */}
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-5 w-5" />
        </Button>
      </div>
    </header>
  )
}

export default Header
