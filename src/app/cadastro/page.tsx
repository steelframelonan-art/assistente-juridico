"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Scale, Mail, Lock, User, AlertCircle, CheckCircle2 } from "lucide-react"

export default function CadastroPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    nome: "",
    email: "",
    password: "",
    confirmPassword: ""
  })
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleCadastro = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    // Validações
    if (!formData.nome || !formData.email || !formData.password || !formData.confirmPassword) {
      setError("Por favor, preencha todos os campos.")
      setLoading(false)
      return
    }

    if (!formData.email.includes("@")) {
      setError("Por favor, insira um email válido.")
      setLoading(false)
      return
    }

    if (formData.password.length < 6) {
      setError("A senha deve ter no mínimo 6 caracteres.")
      setLoading(false)
      return
    }

    if (formData.password !== formData.confirmPassword) {
      setError("As senhas não coincidem.")
      setLoading(false)
      return
    }

    try {
      // Simulação de cadastro - aqui você integraria com sua API/Supabase
      const users = JSON.parse(localStorage.getItem("users") || "[]")
      
      // Verifica se email já existe
      if (users.some((u: any) => u.email === formData.email)) {
        setError("Este email já está cadastrado.")
        setLoading(false)
        return
      }

      // Adiciona novo usuário
      const newUser = {
        id: Date.now().toString(),
        nome: formData.nome,
        email: formData.email,
        password: formData.password,
        createdAt: new Date().toISOString()
      }

      users.push(newUser)
      localStorage.setItem("users", JSON.stringify(users))
      localStorage.setItem("currentUser", JSON.stringify(newUser))

      // Redireciona para a página principal
      router.push("/")
    } catch (err) {
      setError("Erro ao criar conta. Tente novamente.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Scale className="w-12 h-12 text-blue-600 dark:text-blue-400" />
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              Assistente Jurídico
            </h1>
          </div>
          <p className="text-gray-600 dark:text-gray-400">
            Crie sua conta gratuitamente
          </p>
        </div>

        {/* Cadastro Card */}
        <Card className="shadow-2xl">
          <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-t-lg">
            <CardTitle className="text-2xl">Criar Conta</CardTitle>
            <CardDescription className="text-blue-100">
              Preencha os dados abaixo para começar
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            {error && (
              <Alert className="mb-6 bg-red-50 border-red-200 dark:bg-red-950 dark:border-red-800">
                <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
                <AlertDescription className="text-red-800 dark:text-red-200">
                  {error}
                </AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleCadastro} className="space-y-5">
              <div>
                <Label htmlFor="nome" className="text-base flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Nome completo
                </Label>
                <Input
                  id="nome"
                  type="text"
                  placeholder="Seu nome completo"
                  value={formData.nome}
                  onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                  className="mt-2 text-base"
                  disabled={loading}
                />
              </div>

              <div>
                <Label htmlFor="email" className="text-base flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="mt-2 text-base"
                  disabled={loading}
                />
              </div>

              <div>
                <Label htmlFor="password" className="text-base flex items-center gap-2">
                  <Lock className="w-4 h-4" />
                  Senha
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Mínimo 6 caracteres"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="mt-2 text-base"
                  disabled={loading}
                />
              </div>

              <div>
                <Label htmlFor="confirmPassword" className="text-base flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  Confirmar senha
                </Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Digite a senha novamente"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  className="mt-2 text-base"
                  disabled={loading}
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                size="lg"
                disabled={loading}
              >
                {loading ? "Criando conta..." : "Criar conta"}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Já tem uma conta?{" "}
                <Link 
                  href="/login" 
                  className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
                >
                  Faça login aqui
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
          <p>
            Ao criar uma conta, você concorda com nossos termos de uso
          </p>
        </div>
      </div>
    </div>
  )
}
