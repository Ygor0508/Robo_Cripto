"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { Play, BarChart3, TrendingUp, TrendingDown, DollarSign } from "lucide-react"

interface BacktestResult {
  totalReturn: number
  totalTrades: number
  winRate: number
  maxDrawdown: number
  sharpeRatio: number
  profitFactor: number
  chartData: Array<{
    date: string
    portfolio: number
    benchmark: number
  }>
}

export function BacktestingPanel() {
  const [isRunning, setIsRunning] = useState(false)
  const [progress, setProgress] = useState(0)
  const [results, setResults] = useState<BacktestResult | null>(null)
  const [startDate, setStartDate] = useState("2024-01-01")
  const [endDate, setEndDate] = useState("2024-01-31")
  const [initialCapital, setInitialCapital] = useState(10000)
  const [selectedSymbol, setSelectedSymbol] = useState("BTCUSDT")

  const runBacktest = async () => {
    setIsRunning(true)
    setProgress(0)
    setResults(null)

    // Simular progresso do backtest
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressInterval)
          return 100
        }
        return prev + 10
      })
    }, 200)

    // Simular resultado após 2 segundos
    setTimeout(() => {
      const mockResults: BacktestResult = {
        totalReturn: 15.7,
        totalTrades: 45,
        winRate: 67.8,
        maxDrawdown: -8.2,
        sharpeRatio: 1.34,
        profitFactor: 1.89,
        chartData: Array.from({ length: 30 }, (_, i) => ({
          date: `2024-01-${String(i + 1).padStart(2, "0")}`,
          portfolio: initialCapital + (Math.random() * 2000 - 500) + i * 50,
          benchmark: initialCapital + i * 30 + (Math.random() * 1000 - 500),
        })),
      }

      setResults(mockResults)
      setIsRunning(false)
      clearInterval(progressInterval)
    }, 2000)
  }

  return (
    <div className="space-y-6">
      {/* Configurações do Backtest */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <BarChart3 className="w-5 h-5" />
            Configurações do Backtest
          </CardTitle>
          <CardDescription className="text-slate-400">
            Configure os parâmetros para testar sua estratégia
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="symbol" className="text-slate-200">
                Símbolo
              </Label>
              <Select value={selectedSymbol} onValueChange={setSelectedSymbol}>
                <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="BTCUSDT">BTCUSDT</SelectItem>
                  <SelectItem value="ETHUSDT">ETHUSDT</SelectItem>
                  <SelectItem value="BNBUSDT">BNBUSDT</SelectItem>
                  <SelectItem value="ALL">Todos os Símbolos</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="startDate" className="text-slate-200">
                Data Inicial
              </Label>
              <Input
                id="startDate"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="bg-slate-700 border-slate-600 text-white"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="endDate" className="text-slate-200">
                Data Final
              </Label>
              <Input
                id="endDate"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="bg-slate-700 border-slate-600 text-white"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="capital" className="text-slate-200">
                Capital Inicial
              </Label>
              <Input
                id="capital"
                type="number"
                value={initialCapital}
                onChange={(e) => setInitialCapital(Number(e.target.value))}
                className="bg-slate-700 border-slate-600 text-white"
                min={1000}
              />
            </div>
          </div>

          <div className="flex gap-4">
            <Button onClick={runBacktest} disabled={isRunning} className="flex items-center gap-2">
              <Play className="w-4 h-4" />
              {isRunning ? "Executando..." : "Executar Backtest"}
            </Button>
          </div>

          {isRunning && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-slate-400">
                <span>Progresso do Backtest</span>
                <span>{progress}%</span>
              </div>
              <Progress value={progress} className="w-full" />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Resultados */}
      {results && (
        <>
          {/* Métricas de Performance */}
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-200">Retorno Total</CardTitle>
                <TrendingUp className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-500">
                  {results.totalReturn > 0 ? "+" : ""}
                  {results.totalReturn.toFixed(1)}%
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-800 border-slate-700">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-200">Total de Trades</CardTitle>
                <BarChart3 className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">{results.totalTrades}</div>
              </CardContent>
            </Card>

            <Card className="bg-slate-800 border-slate-700">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-200">Taxa de Acerto</CardTitle>
                <TrendingUp className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">{results.winRate.toFixed(1)}%</div>
              </CardContent>
            </Card>

            <Card className="bg-slate-800 border-slate-700">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-200">Max Drawdown</CardTitle>
                <TrendingDown className="h-4 w-4 text-red-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-500">{results.maxDrawdown.toFixed(1)}%</div>
              </CardContent>
            </Card>

            <Card className="bg-slate-800 border-slate-700">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-200">Sharpe Ratio</CardTitle>
                <BarChart3 className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">{results.sharpeRatio.toFixed(2)}</div>
              </CardContent>
            </Card>

            <Card className="bg-slate-800 border-slate-700">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-200">Profit Factor</CardTitle>
                <DollarSign className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">{results.profitFactor.toFixed(2)}</div>
              </CardContent>
            </Card>
          </div>

          {/* Gráfico de Performance */}
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Performance vs Benchmark</CardTitle>
              <CardDescription className="text-slate-400">Comparação da estratégia com buy & hold</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={results.chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="date" stroke="#9CA3AF" />
                  <YAxis stroke="#9CA3AF" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1F2937",
                      border: "1px solid #374151",
                      borderRadius: "8px",
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="portfolio"
                    stroke="#10B981"
                    strokeWidth={2}
                    name="Estratégia"
                    dot={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="benchmark"
                    stroke="#6B7280"
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    name="Buy & Hold"
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}
