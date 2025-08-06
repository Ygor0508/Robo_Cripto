import { NextResponse } from "next/server"
import { Client } from "binance-api-node"

export async function GET() {
  try {
    const apiKey = process.env.BINANCE_API_KEY
    const apiSecret = process.env.BINANCE_SECRET_KEY

    if (!apiKey || !apiSecret) {
      return NextResponse.json({ error: "Chaves API não configuradas" }, { status: 400 })
    }

    const client = Client({
      apiKey,
      apiSecret,
    })

    // Símbolos para buscar trades
    const symbols = ["BTCUSDT", "ETHUSDT", "BNBUSDT", "ADAUSDT", "SOLUSDT"]
    let allTrades: any[] = []

    // Buscar trades para cada símbolo
    for (const symbol of symbols) {
      try {
        const trades = await client.myTrades({ symbol, limit: 100 })
        allTrades = [...allTrades, ...trades]
      } catch (error) {
        console.log(`Erro ao buscar trades para ${symbol}:`, error)
      }
    }

    // Ordenar por data (mais recente primeiro)
    allTrades.sort((a, b) => b.time - a.time)

    // Calcular estatísticas
    const totalTrades = allTrades.length
    let totalPnL = 0
    let totalCommission = 0
    let winningTrades = 0

    // Agrupar trades por símbolo para calcular P&L
    const tradesBySymbol: { [key: string]: any[] } = {}

    allTrades.forEach((trade) => {
      if (!tradesBySymbol[trade.symbol]) {
        tradesBySymbol[trade.symbol] = []
      }
      tradesBySymbol[trade.symbol].push(trade)

      // Somar comissões
      if (trade.commissionAsset === "USDT") {
        totalCommission += Number.parseFloat(trade.commission)
      }
    })

    // Calcular P&L simplificado (diferença entre compras e vendas)
    Object.keys(tradesBySymbol).forEach((symbol) => {
      const symbolTrades = tradesBySymbol[symbol]
      let buyTotal = 0
      let sellTotal = 0

      symbolTrades.forEach((trade) => {
        if (trade.isBuyer) {
          buyTotal += Number.parseFloat(trade.quoteQty)
        } else {
          sellTotal += Number.parseFloat(trade.quoteQty)
          if (sellTotal > buyTotal) {
            winningTrades++
          }
        }
      })

      totalPnL += sellTotal - buyTotal
    })

    const winRate = totalTrades > 0 ? (winningTrades / totalTrades) * 100 : 0

    return NextResponse.json({
      success: true,
      trades: allTrades.map((trade) => ({
        id: trade.id.toString(),
        symbol: trade.symbol,
        side: trade.isBuyer ? "BUY" : "SELL",
        quantity: Number.parseFloat(trade.qty),
        price: Number.parseFloat(trade.price),
        quoteQty: Number.parseFloat(trade.quoteQty),
        commission: Number.parseFloat(trade.commission),
        commissionAsset: trade.commissionAsset,
        time: trade.time,
        isBuyer: trade.isBuyer,
        isMaker: trade.isMaker,
        isBestMatch: trade.isBestMatch,
      })),
      stats: {
        totalPnL: totalPnL,
        totalTrades: totalTrades,
        winRate: winRate,
        totalCommission: totalCommission,
      },
    })
  } catch (error) {
    console.error("Erro ao obter histórico de trades:", error)
    return NextResponse.json({ error: "Erro ao buscar histórico de trades" }, { status: 500 })
  }
}
