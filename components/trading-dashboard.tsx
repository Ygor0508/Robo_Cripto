"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts"

interface Position {
  symbol: string
  quantity: number
  entryPrice: number
  currentPrice: number
  pnl: number
  pnlPercent: number
}

interface MarketData {
  symbol: string
  price: number
  change24h: number
  volume: number
  signal: "BUY" | "SELL" | "HOLD"
  rsi: number
  confidence: number
}

export function TradingDashboard() {
  const [positions, setPositions] = useState<Position[]>([])
  const [marketData, setMarketData] = useState<MarketData[]>([])
  const [priceHistory, setPriceHistory] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Simular dados para demonstração
        const mockPositions: Position[] = [
          {
            symbol: "BTCUSDT",
            quantity: 0.025,
            entryPrice: 42000,
            currentPrice: 43500,
            pnl: 37.5,
            pnlPercent: 3.57,
          },
          {
            symbol: "ETHUSDT",
            quantity: 0.5,
            entryPrice: 2800,
            currentPrice: 2750,
            pnl: -25,
            pnlPercent: -1.79,
          },
        ]

        const mockMarketData: MarketData[] = [
          {
            symbol: "BTCUSDT",
            price: 43500,
            change24h: 2.3,
            volume: 1250000,
            signal: "HOLD",
            rsi: 65,
            confidence: 0.75,
          },
          {
            symbol: "ETHUSDT",
            price: 2750,
            change24h: -1.2,
            volume: 850000,
            signal: "BUY",
            rsi: 35,
            confidence: 0.82,
          },
          {
            symbol: "BNBUSDT",
            price: 320,
            change24h: 1.8,
            volume: 450000,
            signal: "SELL",
            rsi: 78,
            confidence: 0.68,
          },
        ]

        const mockPriceHistory = Array.from({ length: 24 }, (_, i) => ({
          time: `${i}:00`,
          portfolio: 10000 + Math.random() * 1000 - 500,
          btc: 42000 + Math.random() * 2000 - 1000,
          eth: 2800 + Math.random() * 200 - 100,
        }))

        setPositions(mockPositions)
        setMarketData(mockMarketData)
        setPriceHistory(mockPriceHistory)
        setIsLoading(false)
      } catch (error) {
        console.error("Erro ao carregar dados:", error)
        setIsLoading(false)
      }
    }

    fetchData()
    const interval = setInterval(fetchData, 30000) // Atualizar a cada 30 segundos

    return () => clearInterval(interval)
  }, [])

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="bg-slate-800 border-slate-700">
            <CardContent className="p-6">
              <div className="animate-pulse space-y-4">
                <div className="h-4 bg-slate-700 rounded w-1/4"></div>
                <div className="h-8 bg-slate-700 rounded w-1/2"></div>
                <div className="h-32 bg-slate-700 rounded"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Posições Abertas */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">Posições Abertas</CardTitle>
          <CardDescription className="text-slate-400">Suas posições atuais e performance</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {positions.map((position) => (
              <div key={position.symbol} className="flex items-center justify-between p-4 bg-slate-700 rounded-lg">
                <div className="flex items-center gap-4">
                  <div>
                    <h4 className="font-semibold text-white">{position.symbol}</h4>
                    <p className="text-sm text-slate-400">
                      {position.quantity} @ ${position.entryPrice.toLocaleString()}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`font-semibold ${position.pnl >= 0 ? "text-green-500" : "text-red-500"}`}>
                    ${Math.abs(position.pnl).toFixed(2)}
                  </div>
                  <div className={`text-sm ${position.pnl >= 0 ? "text-green-400" : "text-red-400"}`}>
                    {position.pnlPercent >= 0 ? "+" : ""}
                    {position.pnlPercent.toFixed(2)}%
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfico de Performance */}
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Performance do Portfólio</CardTitle>
            <CardDescription className="text-slate-400">Últimas 24 horas</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={priceHistory}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="time" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1F2937",
                    border: "1px solid #374151",
                    borderRadius: "8px",
                  }}
                />
                <Line type="monotone" dataKey="portfolio" stroke="#10B981" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Sinais de Trading */}
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Sinais de Trading</CardTitle>
            <CardDescription className="text-slate-400">Análise em tempo real</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {marketData.map((data) => (
                <div key={data.symbol} className="flex items-center justify-between p-3 bg-slate-700 rounded-lg">
                  <div>
                    <h4 className="font-semibold text-white">{data.symbol}</h4>
                    <p className="text-sm text-slate-400">${data.price.toLocaleString()}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <Badge
                        variant={
                          data.signal === "BUY" ? "default" : data.signal === "SELL" ? "destructive" : "secondary"
                        }
                        className="mb-1"
                      >
                        {data.signal}
                      </Badge>
                      <div className="text-xs text-slate-400">Confiança: {(data.confidence * 100).toFixed(0)}%</div>
                    </div>
                    <div className="w-16">
                      <Progress value={data.rsi} className="h-2" />
                      <div className="text-xs text-slate-400 mt-1">RSI: {data.rsi}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Análise de Mercado */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">Análise de Volume</CardTitle>
          <CardDescription className="text-slate-400">Volume de negociação por ativo</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={marketData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="symbol" stroke="#9CA3AF" />
              <YAxis stroke="#9CA3AF" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1F2937",
                  border: "1px solid #374151",
                  borderRadius: "8px",
                }}
              />
              <Bar dataKey="volume" fill="#3B82F6" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  )
}
