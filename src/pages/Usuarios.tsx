import React from "react"
import { Helmet } from "react-helmet-async"
import { api } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"

const roles = ["USER", "LABS", "MANAGERS"] as const

type User = {
  id?: string | number
  id_user?: string
  nome: string
  email: string
  aparelho?: string
  assentamento?: string
  role?: typeof roles[number]
  senha?: string
}

const UsuariosPage: React.FC = () => {
  const [lista, setLista] = React.useState<User[]>([])
  const [loading, setLoading] = React.useState(false)

  const [form, setForm] = React.useState<User>({ nome: "", email: "", senha: "" })

  const carregar = React.useCallback(async () => {
    setLoading(true)
    try {
      const data = await api.get<any>("/usuario")
      const arr: User[] = Array.isArray(data) ? data : data?.data || []
      setLista(arr)
    } catch (e: any) {
      toast.error(e?.message || "Erro ao carregar usuários")
    } finally {
      setLoading(false)
    }
  }, [])

  React.useEffect(() => { carregar() }, [carregar])

  const onCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const payload = { ...form }
      await api.post("/usuario/create", payload)
      toast.success("Usuário criado")
      setForm({ nome: "", email: "", senha: "" })
      await carregar()
    } catch (e: any) {
      toast.error(e?.message || "Erro ao criar usuário")
    }
  }

  const onDelete = async (id?: string | number) => {
    if (!id) return
    try {
      await api.del(`/usuario/${id}`)
      toast.success("Usuário excluído")
      await carregar()
    } catch (e: any) {
      toast.error(e?.message || "Erro ao excluir usuário")
    }
  }

  return (
    <>
      <Helmet>
        <title>Usuários | SoloVivo Gestão</title>
        <meta name="description" content="Crie, visualize e gerencie usuários do sistema." />
        <link rel="canonical" href={typeof window !== 'undefined' ? window.location.href : ''} />
      </Helmet>
      <main className="container py-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-semibold">Usuários</h1>
          <Button variant="secondary" onClick={carregar} disabled={loading}>
            {loading ? "Atualizando..." : "Atualizar"}
          </Button>
        </div>
        <section className="grid md:grid-cols-2 gap-6">
          <article className="border rounded-lg p-4 bg-card">
            <h2 className="font-medium mb-4">Novo Usuário</h2>
            <form onSubmit={onCreate} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="nome">Nome</Label>
                <Input id="nome" value={form.nome} onChange={(e) => setForm((f) => ({ ...f, nome: e.target.value }))} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">E-mail</Label>
                <Input id="email" type="email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="senha">Senha</Label>
                <Input id="senha" type="password" value={form.senha || ""} onChange={(e) => setForm((f) => ({ ...f, senha: e.target.value }))} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="aparelho">Aparelho (opcional)</Label>
                <Input id="aparelho" value={form.aparelho || ""} onChange={(e) => setForm((f) => ({ ...f, aparelho: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="assentamento">Assentamento (opcional)</Label>
                <Input id="assentamento" value={form.assentamento || ""} onChange={(e) => setForm((f) => ({ ...f, assentamento: e.target.value }))} />
              </div>
              <Button type="submit">Criar</Button>
            </form>
          </article>

          <article className="border rounded-lg p-4 bg-card">
            <h2 className="font-medium mb-3">Lista de Usuários</h2>
            <div className="max-h-[480px] overflow-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left border-b">
                    <th className="py-2 pr-2">Nome</th>
                    <th className="py-2 pr-2">E-mail</th>
                    <th className="py-2">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {lista.map((u, idx) => (
                    <tr key={`${u.id ?? u.id_user ?? idx}`} className="border-b last:border-0">
                      <td className="py-2 pr-2">{u.nome}</td>
                      <td className="py-2 pr-2">{u.email}</td>
                      <td className="py-2">
                        <div className="flex gap-2">
                          {/* Edição avançada pode ser adicionada depois (evitando id_user/roles no form) */}
                          <Button variant="destructive" size="sm" onClick={() => onDelete(u.id ?? u.id_user)}>
                            Excluir
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {lista.length === 0 && (
                    <tr>
                      <td colSpan={3} className="py-6 text-center text-muted-foreground">Nenhum usuário</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </article>
        </section>
      </main>
    </>
  )
}

export default UsuariosPage
