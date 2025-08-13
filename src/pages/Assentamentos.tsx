import React from "react"
import { Helmet } from "react-helmet-async"
import { api } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"

type Item = { id?: string | number; estado: string; assentamento: string }

const AssentamentosPage: React.FC = () => {
  const [itens, setItens] = React.useState<Item[]>([])
  const [loading, setLoading] = React.useState(false)
  const [estado, setEstado] = React.useState("")
  const [assentamento, setAssentamento] = React.useState("")

  const carregar = React.useCallback(async () => {
    setLoading(true)
    try {
      const data = await api.get<any>("/cidades")
      const arr: Item[] = Array.isArray(data) ? data : data?.data || []
      setItens(arr)
    } catch (e: any) {
      toast.error(e?.message || "Erro ao carregar assentamentos")
    } finally {
      setLoading(false)
    }
  }, [])

  React.useEffect(() => { carregar() }, [carregar])

  const onCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await api.post("/cidades", { estado, assentamento })
      toast.success("Assentamento criado")
      setEstado("")
      setAssentamento("")
      await carregar()
    } catch (e: any) {
      toast.error(e?.message || "Erro ao criar assentamento")
    }
  }

  return (
    <>
      <Helmet>
        <title>Assentamentos | SoloVivo Gestão</title>
        <meta name="description" content="Gerencie os assentamentos vinculados aos estados." />
        <link rel="canonical" href={typeof window !== 'undefined' ? window.location.href : ''} />
      </Helmet>
      <main className="container py-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-semibold">Assentamentos</h1>
        </div>
        <section className="grid md:grid-cols-2 gap-6">
          <article className="border rounded-lg p-4 bg-card">
            <h2 className="font-medium mb-4">Novo Assentamento</h2>
            <form onSubmit={onCreate} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="estado">Estado</Label>
                <Input id="estado" value={estado} onChange={(e) => setEstado(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="assentamento">Assentamento</Label>
                <Input id="assentamento" value={assentamento} onChange={(e) => setAssentamento(e.target.value)} required />
              </div>
              <Button type="submit">Adicionar</Button>
            </form>
          </article>

          <article className="border rounded-lg p-4 bg-card">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-medium">Lista atual</h2>
              <Button variant="secondary" onClick={carregar} disabled={loading}>
                {loading ? "Atualizando..." : "Atualizar"}
              </Button>
            </div>
            <div className="max-h-[420px] overflow-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left border-b">
                    <th className="py-2 pr-2">Estado</th>
                    <th className="py-2">Assentamento</th>
                  </tr>
                </thead>
                <tbody>
                  {itens.map((c, idx) => (
                    <tr key={`${c.id ?? idx}`} className="border-b last:border-0">
                      <td className="py-2 pr-2">{c.estado}</td>
                      <td className="py-2">{c.assentamento}</td>
                    </tr>
                  ))}
                  {itens.length === 0 && (
                    <tr>
                      <td colSpan={2} className="py-6 text-center text-muted-foreground">Nenhum registro</td>
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

export default AssentamentosPage
