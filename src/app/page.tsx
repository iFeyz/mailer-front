"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"

export default function AuthPage() {
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [mounted, setMounted] = useState(false)
  const router = useRouter()

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (password === process.env.NEXT_PUBLIC_AUTH_PASSWORD) {
        document.cookie = "authenticated=true; path=/"
        router.push("/dashboard")
      } else {
        toast.error("Mot de passe incorrect")
      }
    } catch (error) {
      console.error("Erreur d'authentification:", error)
      toast.error("Une erreur est survenue")
    } finally {
      setLoading(false)
    }
  }

  if (!mounted) {
    return null
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Authentification</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              type="password"
              placeholder="Mot de passe"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoFocus
            />
            <Button 
              type="submit" 
              className="w-full"
              disabled={loading}
            >
              {loading ? "Vérification..." : "Connexion"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
} 