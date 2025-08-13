import React from "react"
import { Helmet } from "react-helmet-async"
import { useAuth } from "@/contexts/AuthContext"
import { useNavigate, useLocation } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"

const Login: React.FC = () => {
  const { login, token } = useAuth()
  const navigate = useNavigate()
  const location = useLocation() as any
  const from = location.state?.from?.pathname || "/estados"

  const [email, setEmail] = React.useState("")
  const [senha, setSenha] = React.useState("")
  const [loading, setLoading] = React.useState(false)

  React.useEffect(() => {
    if (token) navigate(from, { replace: true })
  }, [token, from, navigate])

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      await login(email, senha)
      toast.success("Login realizado com sucesso")
      navigate(from, { replace: true })
    } catch (err: any) {
      toast.error(err?.message || "Falha no login")
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Helmet>
        <title>Login | SoloVivo Gestão</title>
        <meta name="description" content="Acesse o SoloVivo Gestão com seu e-mail e senha." />
        <link rel="canonical" href={typeof window !== 'undefined' ? window.location.href : ''} />
      </Helmet>
      <main className="min-h-[calc(100vh-56px)] grid place-items-center">
        <section className="w-full max-w-md border rounded-lg p-6 bg-card">
          <h1 className="text-2xl font-semibold mb-6">Entrar</h1>
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="senha">Senha</Label>
              <Input id="senha" type="password" value={senha} onChange={(e) => setSenha(e.target.value)} required />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Entrando..." : "Entrar"}
            </Button>
          </form>
        </section>
      </main>
    </>
  )
}

export default Login
