"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Eye, EyeOff, Shield, AlertTriangle } from "lucide-react"

interface ApiKeySetupProps {
  onConfigured: () => void
}

export function ApiKeySetup({ onConfigured }: ApiKeySetupProps) {
  const [apiKey, setApiKey] = useState("")
  const [secretKey, setSecretKey] = useState("")
  const [showSecret, setShowSecret] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      const response = await fetch("/api/config/api-keys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ apiKey, secretKey }),
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess(true)
        setTimeout(() => {
          onConfigured()
        }, 2000)
      } else {
        setError(data.error || "Erro ao configurar chaves API")
      }
    } catch (error) {
      setError("Erro de conexão. Tente novamente.")
    } finally {
      setIsLoading(false)
    }
  }

  const testConnection = async () => {
    if (!apiKey || !secretKey) {
      setError("Preencha ambas as chaves antes de testar")
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch("/api/test-connection", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ apiKey, secretKey }),
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess(true)
        setError("")
      } else {
        setError(data.error || "Falha na conexão com a Binance")
      }
    } catch (error) {
      setError("Erro ao testar conexão")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="max-w-2xl mx-auto bg-slate-800 border-slate-700">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-white">
          <Shield className="w-5 h-5" />
          Configuração de Chaves API
        </CardTitle>
        <CardDescription className="text-slate-400">
          Configure suas chaves API da Binance de forma segura
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <Alert className="border-amber-500 bg-amber-500/10">
          <AlertTriangle className="h-4 w-4 text-amber-500" />
          <AlertDescription className="text-amber-200">
            <strong>Importante:</strong> Suas chaves API são criptografadas e armazenadas localmente. Nunca compartilhe
            essas informações.
          </AlertDescription>
        </Alert>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="apiKey" className="text-slate-200">
              API Key
            </Label>
            <Input
              id="apiKey"
              type="text"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Sua API Key da Binance"
              className="bg-slate-700 border-slate-600 text-white"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="secretKey" className="text-slate-200">
              Secret Key
            </Label>
            <div className="relative">
              <Input
                id="secretKey"
                type={showSecret ? "text" : "password"}
                value={secretKey}
                onChange={(e) => setSecretKey(e.target.value)}
                placeholder="Sua Secret Key da Binance"
                className="bg-slate-700 border-slate-600 text-white pr-10"
                required
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 text-slate-400 hover:text-white"
                onClick={() => setShowSecret(!showSecret)}
              >
                {showSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </Button>
            </div>
          </div>

          {error && (
            <Alert className="border-red-500 bg-red-500/10">
              <AlertTriangle className="h-4 w-4 text-red-500" />
              <AlertDescription className="text-red-200">{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="border-green-500 bg-green-500/10">
              <AlertDescription className="text-green-200">
                Chaves configuradas com sucesso! Redirecionando...
              </AlertDescription>
            </Alert>
          )}

          <div className="flex gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={testConnection}
              disabled={isLoading}
              className="flex-1 bg-transparent"
            >
              {isLoading ? "Testando..." : "Testar Conexão"}
            </Button>
            <Button type="submit" disabled={isLoading} className="flex-1">
              {isLoading ? "Salvando..." : "Salvar Configuração"}
            </Button>
          </div>
        </form>

        <div className="mt-6 p-4 bg-slate-700 rounded-lg">
          <h4 className="font-semibold text-white mb-2">Como obter suas chaves API:</h4>
          <ol className="list-decimal list-inside space-y-1 text-sm text-slate-300">
            <li>Acesse sua conta na Binance</li>
            <li>Vá em "API Management" no menu do usuário</li>
            <li>Crie uma nova API Key</li>
            <li>Configure as permissões (recomendado: apenas "Spot & Margin Trading")</li>
            <li>Copie a API Key e Secret Key</li>
          </ol>
        </div>
      </CardContent>
    </Card>
  )
}
