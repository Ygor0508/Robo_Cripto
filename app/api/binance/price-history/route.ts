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

    // Obter dados de kline do BTC para as últimas 24 horas
    const klines = await client.candles({
      symbol: "BTCUSDT",
      interval: "1h",
      limit: 24,
    })

    // Simular valor do portfólio baseado no movimento do BTC
    const basePortfolioValue = 10000 // Valor base do portfólio

    const history = klines.map((kline, index) => {
      const btcPrice = Number.parseFloat(kline.close)
      const time = new Date(kline.closeTime).toLocaleTimeString("pt-BR", {
        hour: "2-digit",
        minute: "2-digit",
      })

      // Simular variação do portfólio baseada no BTC (com alguma variação)
      const btcVariation = (btcPrice - Number.parseFloat(klines[0].close)) / Number.parseFloat(klines[0].close)
      const portfolioValue = basePortfolioValue * (1 + btcVariation * 0.8 + (Math.random() - 0.5) * 0.02)

      return {
        time,
        portfolio: Math.round(portfolioValue),
        btc: Math.round(btcPrice),
      }
    })

    return NextResponse.json({
      success: true,
      history,
    })
  } catch (error) {
    console.error("Erro ao obter histórico de preços:", error)
    return NextResponse.json({ error: "Erro ao buscar histórico de preços" }, { status: 500 })
  }
}
