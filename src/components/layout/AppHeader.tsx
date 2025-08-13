import React from "react"
import { Link, NavLink, useNavigate } from "react-router-dom"
import { useAuth } from "@/contexts/AuthContext"
import { Button } from "@/components/ui/button"

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  `px-3 py-2 rounded-md text-sm font-medium transition-colors ${
    isActive ? "bg-secondary text-secondary-foreground" : "text-muted-foreground hover:text-foreground"
  }`

const AppHeader: React.FC = () => {
  const { name, logout, token } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate("/login")
  }

  return (
    <header className="w-full border-b bg-background/60 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex items-center justify-between h-14">
        <Link to={token ? "/estados" : "/"} className="font-semibold">
          SoloVivo Gestão
        </Link>
        <nav className="flex items-center gap-1">
          {token && (
            <>
              <NavLink to="/estados" className={navLinkClass}>Estados</NavLink>
              <NavLink to="/assentamentos" className={navLinkClass}>Assentamentos</NavLink>
              <NavLink to="/usuarios" className={navLinkClass}>Usuários</NavLink>
            </>
          )}
        </nav>
        <div className="flex items-center gap-2">
          {token ? (
            <>
              <span className="hidden sm:inline text-sm text-muted-foreground">Olá, {name || "usuário"}</span>
              <Button variant="secondary" onClick={handleLogout}>Sair</Button>
            </>
          ) : (
            <Button asChild>
              <Link to="/login">Entrar</Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  )
}

export default AppHeader
