"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Download, Filter, TrendingUp, TrendingDown } from "lucide-react"

interface Trade {
  id: string
  symbol: string
  type: "BUY" | "SELL"
  quantity: number
  price: number
  total: number
  pnl?: number
  timestamp: string
  status: "COMPLETED" | "PENDING" | "CANCELLED"
}

export function TradeHistory() {
  const [trades, setTrades] = useState<Trade[]>([])
  const [filteredTrades, setFilteredTrades] = useState<Trade[]>([])
  const [filterSymbol, setFilterSymbol] = useState("all")
  const [filterType, setFilterType] = useState("all")
  const [searchTerm, setSearchTerm] = useState("")
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchTrades = async () => {
      try {
        // Simular dados para demonstração
        const mockTrades: Trade[] = [
          {
            id: "1",
            symbol: "BTCUSDT",
            type: "BUY",
            quantity: 0.025,
            price: 42000,
            total: 1050,
            timestamp: "2024-01-15 10:30:00",
            status: "COMPLETED",
          },
          {
            id: "2",
            symbol: "BTCUSDT",
            type: "SELL",
            quantity: 0.025,
            price: 43500,
            total: 1087.5,
            pnl: 37.5,
            timestamp: "2024-01-15 14:20:00",
            status: "COMPLETED",
          },
          {
            id: "3",
            symbol: "ETHUSDT",
            type: "BUY",
            quantity: 0.5,
            price: 2800,
            total: 1400,
            timestamp: "2024-01-15 16:45:00",
            status: "COMPLETED",
          },
          {
            id: "4",
            symbol: "BNBUSDT",
            type: "BUY",
            quantity: 3.2,
            price: 320,
            total: 1024,
            timestamp: "2024-01-16 09:15:00",
            status: "COMPLETED",
          },
          {
            id: "5",
            symbol: "BNBUSDT",
            type: "SELL",
            quantity: 3.2,
            price: 325,
            total: 1040,
            pnl: 16,
            timestamp: "2024-01-16 11:30:00",
            status: "COMPLETED",
          },
        ]

        setTrades(mockTrades)
        setFilteredTrades(mockTrades)
        setIsLoading(false)
      } catch (error) {
        console.error("Erro ao carregar histórico:", error)
        setIsLoading(false)
      }
    }

    fetchTrades()
  }, [])

  useEffect(() => {
    let filtered = trades

    if (filterSymbol !== "all") {
      filtered = filtered.filter((trade) => trade.symbol === filterSymbol)
    }

    if (filterType !== "all") {
      filtered = filtered.filter((trade) => trade.type === filterType)
    }

    if (searchTerm) {
      filtered = filtered.filter(
        (trade) => trade.symbol.toLowerCase().includes(searchTerm.toLowerCase()) || trade.id.includes(searchTerm),
      )
    }

    setFilteredTrades(filtered)
  }, [trades, filterSymbol, filterType, searchTerm])

  const exportTrades = () => {
    const csvContent = [
      ["ID", "Símbolo", "Tipo", "Quantidade", "Preço", "Total", "P&L", "Data", "Status"],
      ...filteredTrades.map((trade) => [
        trade.id,
        trade.symbol,
        trade.type,
        trade.quantity.toString(),
        trade.price.toString(),
        trade.total.toString(),
        trade.pnl?.toString() || "",
        trade.timestamp,
        trade.status,
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n")

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "trade-history.csv"
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const totalPnL = trades.reduce((sum, trade) => sum + (trade.pnl || 0), 0)
  const winningTrades = trades.filter((trade) => trade.pnl && trade.pnl > 0).length
  const totalTrades = trades.filter((trade) => trade.pnl !== undefined).length
  const winRate = totalTrades > 0 ? (winningTrades / totalTrades) * 100 : 0

  if (isLoading) {
    return (
      <Card className="bg-slate-800 border-slate-700">
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-slate-700 rounded w-1/4"></div>
            <div className="h-8 bg-slate-700 rounded w-1/2"></div>
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-12 bg-slate-700 rounded"></div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-200">P&L Total</CardTitle>
            {totalPnL >= 0 ? (
              <TrendingUp className="h-4 w-4 text-green-500" />
            ) : (
              <TrendingDown className="h-4 w-4 text-red-500" />
            )}
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${totalPnL >= 0 ? "text-green-500" : "text-red-500"}`}>
              ${Math.abs(totalPnL).toFixed(2)}
            </div>
            <p className="text-xs text-slate-400">{totalPnL >= 0 ? "Lucro" : "Prejuízo"} acumulado</p>
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-slate-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-200">Taxa de Acerto</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{winRate.toFixed(1)}%</div>
            <p className="text-xs text-slate-400">
              {winningTrades} de {totalTrades} trades
            </p>
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-slate-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-200">Total de Trades</CardTitle>
            <Filter className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{trades.length}</div>
            <p className="text-xs text-slate-400">Operações realizadas</p>
          </CardContent>
        </Card>
      </div>

      {/* Filtros e Histórico */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-white">Histórico de Trades</CardTitle>
              <CardDescription className="text-slate-400">Todas as suas operações de compra e venda</CardDescription>
            </div>
            <Button onClick={exportTrades} variant="outline" className="flex items-center gap-2 bg-transparent">
              <Download className="w-4 h-4" />
              Exportar CSV
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Filtros */}
          <div className="flex flex-wrap gap-4 mb-6">
            <Input
              placeholder="Buscar por símbolo ou ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-xs bg-slate-700 border-slate-600 text-white"
            />

            <Select value={filterSymbol} onValueChange={setFilterSymbol}>
              <SelectTrigger className="w-40 bg-slate-700 border-slate-600 text-white">
                <SelectValue placeholder="Símbolo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="BTCUSDT">BTCUSDT</SelectItem>
                <SelectItem value="ETHUSDT">ETHUSDT</SelectItem>
                <SelectItem value="BNBUSDT">BNBUSDT</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-32 bg-slate-700 border-slate-600 text-white">
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="BUY">Compra</SelectItem>
                <SelectItem value="SELL">Venda</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Tabela */}
          <div className="rounded-md border border-slate-700">
            <Table>
              <TableHeader>
                <TableRow className="border-slate-700">
                  <TableHead className="text-slate-200">ID</TableHead>
                  <TableHead className="text-slate-200">Símbolo</TableHead>
                  <TableHead className="text-slate-200">Tipo</TableHead>
                  <TableHead className="text-slate-200">Quantidade</TableHead>
                  <TableHead className="text-slate-200">Preço</TableHead>
                  <TableHead className="text-slate-200">Total</TableHead>
                  <TableHead className="text-slate-200">P&L</TableHead>
                  <TableHead className="text-slate-200">Data</TableHead>
                  <TableHead className="text-slate-200">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTrades.map((trade) => (
                  <TableRow key={trade.id} className="border-slate-700">
                    <TableCell className="text-slate-300">{trade.id}</TableCell>
                    <TableCell className="text-slate-300 font-medium">{trade.symbol}</TableCell>
                    <TableCell>
                      <Badge variant={trade.type === "BUY" ? "default" : "destructive"}>{trade.type}</Badge>
                    </TableCell>
                    <TableCell className="text-slate-300">{trade.quantity}</TableCell>
                    <TableCell className="text-slate-300">${trade.price.toLocaleString()}</TableCell>
                    <TableCell className="text-slate-300">${trade.total.toFixed(2)}</TableCell>
                    <TableCell>
                      {trade.pnl !== undefined ? (
                        <span className={trade.pnl >= 0 ? "text-green-500" : "text-red-500"}>
                          ${Math.abs(trade.pnl).toFixed(2)}
                        </span>
                      ) : (
                        <span className="text-slate-500">-</span>
                      )}
                    </TableCell>
                    <TableCell className="text-slate-300">{trade.timestamp}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          trade.status === "COMPLETED"
                            ? "default"
                            : trade.status === "PENDING"
                              ? "secondary"
                              : "destructive"
                        }
                      >
                        {trade.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {filteredTrades.length === 0 && (
            <div className="text-center py-8 text-slate-400">Nenhum trade encontrado com os filtros aplicados.</div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
