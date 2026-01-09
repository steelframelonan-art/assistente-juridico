"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Scale, CheckCircle2, AlertCircle, FileText, User, Building2, Calendar, DollarSign, LogOut } from "lucide-react"

type Step = 1 | 2 | 3 | 4 | 5 | 6

interface FormData {
  nomeCompleto: string
  cpf: string
  tipoReu: "empresa" | "pessoa" | ""
  nomeReu: string
  cpfCnpjReu: string
  descricaoFatos: string
  dataOcorrido: string
  tentativaAmigavel: string
  tipoPedido: string[]
  outroPedido: string
  valorCausa: string
}

export default function AssistenteJuridico() {
  const router = useRouter()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  const [step, setStep] = useState<Step>(1)
  const [formData, setFormData] = useState<FormData>({
    nomeCompleto: "",
    cpf: "",
    tipoReu: "",
    nomeReu: "",
    cpfCnpjReu: "",
    descricaoFatos: "",
    dataOcorrido: "",
    tentativaAmigavel: "",
    tipoPedido: [],
    outroPedido: "",
    valorCausa: ""
  })
  const [showMinuta, setShowMinuta] = useState(false)
  const [warnings, setWarnings] = useState<string[]>([])

  const salarioMinimo = 1412 // Valor de 2024
  const limiteJEC = salarioMinimo * 40

  // Verifica autenticação
  useEffect(() => {
    const user = localStorage.getItem("currentUser")
    if (user) {
      setCurrentUser(JSON.parse(user))
      setIsAuthenticated(true)
    } else {
      router.push("/login")
    }
    setLoading(false)
  }, [router])

  const handleLogout = () => {
    localStorage.removeItem("currentUser")
    router.push("/login")
  }

  const validateCPF = (cpf: string): boolean => {
    const cleaned = cpf.replace(/\D/g, "")
    return cleaned.length === 11
  }

  const formatCPF = (value: string): string => {
    const cleaned = value.replace(/\D/g, "")
    if (cleaned.length <= 11) {
      return cleaned.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4")
    }
    return cleaned.slice(0, 11).replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4")
  }

  const formatCurrency = (value: string): string => {
    const cleaned = value.replace(/\D/g, "")
    const number = parseInt(cleaned) / 100
    return number.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
  }

  const handleNext = () => {
    const newWarnings: string[] = []

    // Validações por etapa
    if (step === 1) {
      if (!formData.nomeCompleto.trim()) {
        newWarnings.push("Por favor, informe seu nome completo.")
      }
      if (!validateCPF(formData.cpf)) {
        newWarnings.push("Por favor, informe um CPF válido com 11 dígitos.")
      }
    }

    if (step === 2) {
      if (!formData.tipoReu) {
        newWarnings.push("Por favor, selecione se é empresa ou pessoa física.")
      }
      if (!formData.nomeReu.trim()) {
        newWarnings.push("Por favor, informe o nome do réu.")
      }
    }

    if (step === 3) {
      if (!formData.descricaoFatos.trim() || formData.descricaoFatos.length < 50) {
        newWarnings.push("Por favor, descreva os fatos com mais detalhes (mínimo 50 caracteres).")
      }
      if (!formData.dataOcorrido) {
        newWarnings.push("Por favor, informe quando aconteceu.")
      }
    }

    if (step === 4) {
      if (formData.tipoPedido.length === 0) {
        newWarnings.push("Por favor, selecione pelo menos um pedido.")
      }
    }

    if (step === 5) {
      const valor = parseFloat(formData.valorCausa.replace(/\D/g, "")) / 100
      if (!formData.valorCausa || valor <= 0) {
        newWarnings.push("Por favor, informe o valor da causa.")
      }
      if (valor > limiteJEC) {
        newWarnings.push(
          `⚠️ ATENÇÃO: O valor da causa (${formatCurrency(formData.valorCausa)}) ultrapassa 40 salários mínimos (R$ ${limiteJEC.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}). Você precisará OBRIGATORIAMENTE de um advogado para esta ação.`
        )
      }
    }

    setWarnings(newWarnings)

    if (newWarnings.length === 0) {
      if (step < 5) {
        setStep((step + 1) as Step)
      } else {
        setShowMinuta(true)
        setStep(6)
      }
    }
  }

  const handleBack = () => {
    if (step > 1) {
      setStep((step - 1) as Step)
      setWarnings([])
    }
  }

  const handlePedidoChange = (pedido: string) => {
    if (formData.tipoPedido.includes(pedido)) {
      setFormData({
        ...formData,
        tipoPedido: formData.tipoPedido.filter(p => p !== pedido)
      })
    } else {
      setFormData({
        ...formData,
        tipoPedido: [...formData.tipoPedido, pedido]
      })
    }
  }

  const gerarMinuta = () => {
    const valor = parseFloat(formData.valorCausa.replace(/\D/g, "")) / 100
    const pedidos = [...formData.tipoPedido]
    if (formData.outroPedido.trim()) {
      pedidos.push(formData.outroPedido)
    }

    return {
      fatos: formData.descricaoFatos,
      data: new Date(formData.dataOcorrido).toLocaleDateString("pt-BR"),
      tentativa: formData.tentativaAmigavel,
      pedidos: pedidos,
      valor: valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
    }
  }

  const resetForm = () => {
    setFormData({
      nomeCompleto: "",
      cpf: "",
      tipoReu: "",
      nomeReu: "",
      cpfCnpjReu: "",
      descricaoFatos: "",
      dataOcorrido: "",
      tentativaAmigavel: "",
      tipoPedido: [],
      outroPedido: "",
      valorCausa: ""
    })
    setStep(1)
    setShowMinuta(false)
    setWarnings([])
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <Scale className="w-16 h-16 text-blue-600 dark:text-blue-400 animate-pulse mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Carregando...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  if (showMinuta) {
    const minuta = gerarMinuta()
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800 p-4 md:p-8">
        <div className="max-w-4xl mx-auto">
          {/* User Header */}
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold">
                {currentUser?.nome?.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{currentUser?.nome}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{currentUser?.email}</p>
              </div>
            </div>
            <Button onClick={handleLogout} variant="outline" size="sm">
              <LogOut className="w-4 h-4 mr-2" />
              Sair
            </Button>
          </div>

          <Card className="shadow-2xl">
            <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-t-lg">
              <div className="flex items-center gap-3">
                <FileText className="w-8 h-8" />
                <div>
                  <CardTitle className="text-2xl md:text-3xl">Minuta de Reclamação Prévia</CardTitle>
                  <CardDescription className="text-blue-100 mt-2">
                    Documento gerado automaticamente - Revise antes de usar
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6 md:p-8 space-y-6">
              <div className="space-y-6 bg-white dark:bg-gray-800 p-6 rounded-lg border-2 border-gray-200 dark:border-gray-700">
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2 flex items-center gap-2">
                    <User className="w-5 h-5 text-blue-600" />
                    QUALIFICAÇÃO DAS PARTES
                  </h3>
                  <div className="pl-7 space-y-1 text-gray-700 dark:text-gray-300">
                    <p><strong>Requerente:</strong> {formData.nomeCompleto}</p>
                    <p><strong>CPF:</strong> {formData.cpf}</p>
                    <p className="mt-3"><strong>Requerido:</strong> {formData.nomeReu}</p>
                    {formData.cpfCnpjReu && (
                      <p><strong>{formData.tipoReu === "empresa" ? "CNPJ" : "CPF"}:</strong> {formData.cpfCnpjReu}</p>
                    )}
                  </div>
                </div>

                <div className="border-t-2 border-gray-200 dark:border-gray-700 pt-6">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2 flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-blue-600" />
                    DOS FATOS
                  </h3>
                  <div className="pl-7 space-y-3 text-gray-700 dark:text-gray-300">
                    <p className="text-justify leading-relaxed">{minuta.fatos}</p>
                    <p><strong>Data dos fatos:</strong> {minuta.data}</p>
                    <p><strong>Tentativa de resolução amigável:</strong> {minuta.tentativa}</p>
                  </div>
                </div>

                <div className="border-t-2 border-gray-200 dark:border-gray-700 pt-6">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2 flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-blue-600" />
                    DOS PEDIDOS
                  </h3>
                  <div className="pl-7 space-y-2 text-gray-700 dark:text-gray-300">
                    <p className="mb-3">Diante do exposto, requer-se:</p>
                    <ul className="list-disc list-inside space-y-2">
                      {minuta.pedidos.map((pedido, index) => (
                        <li key={index} className="leading-relaxed">{pedido}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="border-t-2 border-gray-200 dark:border-gray-700 pt-6">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2 flex items-center gap-2">
                    <DollarSign className="w-5 h-5 text-blue-600" />
                    VALOR DA CAUSA
                  </h3>
                  <div className="pl-7">
                    <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{minuta.valor}</p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <Button 
                  onClick={() => window.print()} 
                  className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                  size="lg"
                >
                  <FileText className="w-5 h-5 mr-2" />
                  Imprimir Minuta
                </Button>
                <Button 
                  onClick={resetForm} 
                  variant="outline"
                  className="flex-1"
                  size="lg"
                >
                  Nova Reclamação
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800 p-4 md:p-8">
      <div className="max-w-3xl mx-auto">
        {/* User Header */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold">
              {currentUser?.nome?.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{currentUser?.nome}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">{currentUser?.email}</p>
            </div>
          </div>
          <Button onClick={handleLogout} variant="outline" size="sm">
            <LogOut className="w-4 h-4 mr-2" />
            Sair
          </Button>
        </div>

        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Scale className="w-12 h-12 text-blue-600 dark:text-blue-400" />
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-gray-100">
              Assistente Jurídico
            </h1>
          </div>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Juizados Especiais Cíveis - Pequenas Causas
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
            Organize seus fatos e documentos de forma simples e clara
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Etapa {step} de 5
            </span>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {Math.round((step / 5) * 100)}% concluído
            </span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
            <div 
              className="bg-gradient-to-r from-blue-600 to-indigo-600 h-3 rounded-full transition-all duration-300"
              style={{ width: `${(step / 5) * 100}%` }}
            />
          </div>
        </div>

        {/* Form Card */}
        <Card className="shadow-2xl">
          <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-t-lg">
            <CardTitle className="text-xl md:text-2xl">
              {step === 1 && "Identificação"}
              {step === 2 && "Contra quem é a ação?"}
              {step === 3 && "O que aconteceu?"}
              {step === 4 && "O que você quer?"}
              {step === 5 && "Valor da causa"}
            </CardTitle>
            <CardDescription className="text-blue-100">
              {step === 1 && "Vamos começar com suas informações pessoais"}
              {step === 2 && "Informe os dados de quem você está processando"}
              {step === 3 && "Conte-nos o que aconteceu com detalhes"}
              {step === 4 && "Quais são seus pedidos?"}
              {step === 5 && "Qual o valor total do seu prejuízo?"}
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6 md:p-8">
            {/* Warnings */}
            {warnings.length > 0 && (
              <Alert className="mb-6 bg-red-50 border-red-200 dark:bg-red-950 dark:border-red-800">
                <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
                <AlertDescription className="text-red-800 dark:text-red-200">
                  <ul className="list-disc list-inside space-y-1">
                    {warnings.map((warning, index) => (
                      <li key={index}>{warning}</li>
                    ))}
                  </ul>
                </AlertDescription>
              </Alert>
            )}

            {/* Step 1: Identificação */}
            {step === 1 && (
              <div className="space-y-6">
                <Alert className="bg-blue-50 border-blue-200 dark:bg-blue-950 dark:border-blue-800">
                  <AlertCircle className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  <AlertDescription className="text-blue-800 dark:text-blue-200">
                    <strong>Bem-vindo!</strong> Vou ajudar você a organizar suas informações para entrar com uma ação no Juizado Especial Cível.
                  </AlertDescription>
                </Alert>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="nomeCompleto" className="text-base">Nome completo *</Label>
                    <Input
                      id="nomeCompleto"
                      placeholder="Digite seu nome completo"
                      value={formData.nomeCompleto}
                      onChange={(e) => setFormData({ ...formData, nomeCompleto: e.target.value })}
                      className="mt-2 text-base"
                    />
                  </div>

                  <div>
                    <Label htmlFor="cpf" className="text-base">CPF *</Label>
                    <Input
                      id="cpf"
                      placeholder="000.000.000-00"
                      value={formData.cpf}
                      onChange={(e) => setFormData({ ...formData, cpf: formatCPF(e.target.value) })}
                      maxLength={14}
                      className="mt-2 text-base"
                    />
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      Digite apenas os números do seu CPF
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: O Réu */}
            {step === 2 && (
              <div className="space-y-6">
                <div>
                  <Label className="text-base mb-3 block">Você está processando uma empresa ou pessoa física? *</Label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <Button
                      type="button"
                      variant={formData.tipoReu === "empresa" ? "default" : "outline"}
                      className={`h-auto py-4 ${formData.tipoReu === "empresa" ? "bg-blue-600 hover:bg-blue-700" : ""}`}
                      onClick={() => setFormData({ ...formData, tipoReu: "empresa" })}
                    >
                      <Building2 className="w-5 h-5 mr-2" />
                      Empresa
                    </Button>
                    <Button
                      type="button"
                      variant={formData.tipoReu === "pessoa" ? "default" : "outline"}
                      className={`h-auto py-4 ${formData.tipoReu === "pessoa" ? "bg-blue-600 hover:bg-blue-700" : ""}`}
                      onClick={() => setFormData({ ...formData, tipoReu: "pessoa" })}
                    >
                      <User className="w-5 h-5 mr-2" />
                      Pessoa Física
                    </Button>
                  </div>
                </div>

                <div>
                  <Label htmlFor="nomeReu" className="text-base">
                    {formData.tipoReu === "empresa" ? "Nome da empresa *" : "Nome completo da pessoa *"}
                  </Label>
                  <Input
                    id="nomeReu"
                    placeholder={formData.tipoReu === "empresa" ? "Ex: Loja XYZ Ltda" : "Ex: João da Silva"}
                    value={formData.nomeReu}
                    onChange={(e) => setFormData({ ...formData, nomeReu: e.target.value })}
                    className="mt-2 text-base"
                  />
                </div>

                <div>
                  <Label htmlFor="cpfCnpjReu" className="text-base">
                    {formData.tipoReu === "empresa" ? "CNPJ (se souber)" : "CPF (se souber)"}
                  </Label>
                  <Input
                    id="cpfCnpjReu"
                    placeholder={formData.tipoReu === "empresa" ? "00.000.000/0000-00" : "000.000.000-00"}
                    value={formData.cpfCnpjReu}
                    onChange={(e) => setFormData({ ...formData, cpfCnpjReu: e.target.value })}
                    className="mt-2 text-base"
                  />
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Não é obrigatório, mas ajuda a identificar corretamente
                  </p>
                </div>
              </div>
            )}

            {/* Step 3: Os Fatos */}
            {step === 3 && (
              <div className="space-y-6">
                <div>
                  <Label htmlFor="descricaoFatos" className="text-base">
                    Descreva o que aconteceu *
                  </Label>
                  <Textarea
                    id="descricaoFatos"
                    placeholder="Conte com detalhes: O que você comprou ou contratou? O que deu errado? Como isso te prejudicou?"
                    value={formData.descricaoFatos}
                    onChange={(e) => setFormData({ ...formData, descricaoFatos: e.target.value })}
                    className="mt-2 text-base min-h-[150px]"
                  />
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Seja claro e objetivo. Quanto mais detalhes, melhor! ({formData.descricaoFatos.length} caracteres)
                  </p>
                </div>

                <div>
                  <Label htmlFor="dataOcorrido" className="text-base">Quando isso aconteceu? *</Label>
                  <Input
                    id="dataOcorrido"
                    type="date"
                    value={formData.dataOcorrido}
                    onChange={(e) => setFormData({ ...formData, dataOcorrido: e.target.value })}
                    className="mt-2 text-base"
                    max={new Date().toISOString().split('T')[0]}
                  />
                </div>

                <div>
                  <Label htmlFor="tentativaAmigavel" className="text-base">
                    Você tentou resolver o problema diretamente com {formData.tipoReu === "empresa" ? "a empresa" : "a pessoa"}? *
                  </Label>
                  <Textarea
                    id="tentativaAmigavel"
                    placeholder="Ex: Sim, liguei 3 vezes para o SAC nos dias 10/01, 15/01 e 20/01, mas não resolveram. OU: Não, porque a empresa não tem canal de atendimento."
                    value={formData.tentativaAmigavel}
                    onChange={(e) => setFormData({ ...formData, tentativaAmigavel: e.target.value })}
                    className="mt-2 text-base min-h-[100px]"
                  />
                </div>
              </div>
            )}

            {/* Step 4: O Pedido */}
            {step === 4 && (
              <div className="space-y-6">
                <div>
                  <Label className="text-base mb-3 block">O que você quer que seja feito? * (pode marcar mais de uma opção)</Label>
                  <div className="space-y-3">
                    {[
                      "Devolução do dinheiro pago",
                      "Cancelamento do contrato",
                      "Indenização por danos morais (sofrimento, constrangimento)",
                      "Entrega do produto ou serviço contratado",
                      "Conserto ou troca do produto defeituoso"
                    ].map((pedido) => (
                      <label
                        key={pedido}
                        className={`flex items-start gap-3 p-4 border-2 rounded-lg cursor-pointer transition-all ${
                          formData.tipoPedido.includes(pedido)
                            ? "border-blue-600 bg-blue-50 dark:bg-blue-950"
                            : "border-gray-200 dark:border-gray-700 hover:border-blue-300"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={formData.tipoPedido.includes(pedido)}
                          onChange={() => handlePedidoChange(pedido)}
                          className="mt-1 w-5 h-5 text-blue-600 rounded"
                        />
                        <span className="text-base text-gray-700 dark:text-gray-300">{pedido}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <Label htmlFor="outroPedido" className="text-base">Outro pedido (se houver)</Label>
                  <Input
                    id="outroPedido"
                    placeholder="Descreva outro pedido específico"
                    value={formData.outroPedido}
                    onChange={(e) => setFormData({ ...formData, outroPedido: e.target.value })}
                    className="mt-2 text-base"
                  />
                </div>
              </div>
            )}

            {/* Step 5: Valor */}
            {step === 5 && (
              <div className="space-y-6">
                <Alert className="bg-blue-50 border-blue-200 dark:bg-blue-950 dark:border-blue-800">
                  <AlertCircle className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  <AlertDescription className="text-blue-800 dark:text-blue-200">
                    <strong>Importante:</strong> Some todos os valores: o que você pagou, o prejuízo que teve, 
                    e se for pedir danos morais, estime um valor justo (geralmente entre R$ 1.000 e R$ 10.000 
                    dependendo da gravidade).
                  </AlertDescription>
                </Alert>

                <div>
                  <Label htmlFor="valorCausa" className="text-base">Valor total da causa *</Label>
                  <div className="relative mt-2">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 text-lg">
                      R$
                    </span>
                    <Input
                      id="valorCausa"
                      placeholder="0,00"
                      value={formData.valorCausa}
                      onChange={(e) => {
                        const cleaned = e.target.value.replace(/\D/g, "")
                        setFormData({ ...formData, valorCausa: cleaned })
                      }}
                      className="pl-12 text-base text-lg font-semibold"
                    />
                  </div>
                  {formData.valorCausa && (
                    <p className="text-lg font-medium text-blue-600 dark:text-blue-400 mt-2">
                      {formatCurrency(formData.valorCausa)}
                    </p>
                  )}
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                    Limite para Juizados Especiais sem advogado: R$ {limiteJEC.toLocaleString("pt-BR", { minimumFractionDigits: 2 })} 
                    (40 salários mínimos)
                  </p>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
              {step > 1 && (
                <Button
                  onClick={handleBack}
                  variant="outline"
                  className="flex-1"
                  size="lg"
                >
                  Voltar
                </Button>
              )}
              <Button
                onClick={handleNext}
                className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                size="lg"
              >
                {step === 5 ? "Gerar Minuta" : "Próximo"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Footer Info */}
        <div className="mt-8 text-center text-sm text-gray-500 dark:text-gray-400">
          <p>
            💡 <strong>Dica:</strong> Os Juizados Especiais Cíveis atendem apenas causas cíveis (problemas com compras, 
            serviços, contratos). Para casos criminais, trabalhistas ou de família, procure a Defensoria Pública.
          </p>
        </div>
      </div>
    </div>
  )
}
