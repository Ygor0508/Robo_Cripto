"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Play, Pause, TrendingUp, TrendingDown, DollarSign, Activity } from "lucide-react"
import { ApiKeySetup } from "@/components/api-key-setup"
import { TradingDashboard } from "@/components/trading-dashboard"
import { RiskManagement } from "@/components/risk-management"
import { TradeHistory } from "@/components/trade-history"
import { BacktestingPanel } from "@/components/backtesting-panel"
import { NotificationSettings } from "@/components/notification-settings"

export default function Home() {
  const [isTrading, setIsTrading] = useState(false)
  const [apiConfigured, setApiConfigured] = useState(false)
  const [portfolioValue, setPortfolioValue] = useState(0)
  const [dailyPnL, setDailyPnL] = useState(0)
  const [totalTrades, setTotalTrades] = useState(0)
  const [winRate, setWinRate] = useState(0)

  useEffect(() => {
    // Verificar se as chaves API estão configuradas
    const checkApiConfig = async () => {
      try {
        const response = await fetch("/api/check-config")
        const data = await response.json()
        setApiConfigured(data.configured)
      } catch (error) {
        console.error("Erro ao verificar configuração:", error)
      }
    }

    checkApiConfig()
  }, [])

  const toggleTrading = async () => {
    try {
      const response = await fetch("/api/trading/toggle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: isTrading ? "stop" : "start" }),
      })

      if (response.ok) {
        setIsTrading(!isTrading)
      }
    } catch (error) {
      console.error("Erro ao alternar trading:", error)
    }
  }

  if (!apiConfigured) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-white mb-2">Trading Bot Dashboard</h1>
            <p className="text-slate-400">Configure suas chaves API para começar</p>
          </div>
          <ApiKeySetup onConfigured={() => setApiConfigured(true)} />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Trading Bot Dashboard</h1>
            <p className="text-slate-400">Sistema de Trading Automatizado com IA</p>
          </div>
          <div className="flex gap-4">
            <Button
              onClick={toggleTrading}
              variant={isTrading ? "destructive" : "default"}
              size="lg"
              className="flex items-center gap-2"
            >
              {isTrading ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
              {isTrading ? "Parar Trading" : "Iniciar Trading"}
            </Button>
            <Badge variant={isTrading ? "default" : "secondary"} className="px-4 py-2">
              {isTrading ? "ATIVO" : "INATIVO"}
            </Badge>
          </div>
        </div>

        {/* Métricas Principais */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-200">Valor do Portfólio</CardTitle>
              <DollarSign className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">${portfolioValue.toLocaleString()}</div>
              <p className="text-xs text-slate-400">+2.5% desde ontem</p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-200">P&L Diário</CardTitle>
              {dailyPnL >= 0 ? (
                <TrendingUp className="h-4 w-4 text-green-500" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-500" />
              )}
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${dailyPnL >= 0 ? "text-green-500" : "text-red-500"}`}>
                ${Math.abs(dailyPnL).toLocaleString()}
              </div>
              <p className="text-xs text-slate-400">{dailyPnL >= 0 ? "Lucro" : "Prejuízo"} hoje</p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-200">Total de Trades</CardTitle>
              <Activity className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{totalTrades}</div>
              <p className="text-xs text-slate-400">Últimas 24h</p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-200">Taxa de Acerto</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{winRate}%</div>
              <p className="text-xs text-slate-400">Trades vencedores</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs Principais */}
        <Tabs defaultValue="dashboard" className="space-y-6">
          <TabsList className="grid w-full grid-cols-6 bg-slate-800">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="risk">Gestão de Risco</TabsTrigger>
            <TabsTrigger value="history">Histórico</TabsTrigger>
            <TabsTrigger value="backtest">Backtesting</TabsTrigger>
            <TabsTrigger value="notifications">Notificações</TabsTrigger>
            <TabsTrigger value="settings">Configurações</TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard">
            <TradingDashboard />
          </TabsContent>

          <TabsContent value="risk">
            <RiskManagement />
          </TabsContent>

          <TabsContent value="history">
            <TradeHistory />
          </TabsContent>

          <TabsContent value="backtest">
            <BacktestingPanel />
          </TabsContent>

          <TabsContent value="notifications">
            <NotificationSettings />
          </TabsContent>

          <TabsContent value="settings">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Configurações do Sistema</CardTitle>
                <CardDescription className="text-slate-400">Gerencie as configurações gerais do bot</CardDescription>
              </CardHeader>
              <CardContent>
                <ApiKeySetup onConfigured={() => setApiConfigured(true)} />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
