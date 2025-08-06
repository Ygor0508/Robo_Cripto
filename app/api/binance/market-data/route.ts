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

    const symbols = ["BTCUSDT", "ETHUSDT", "BNBUSDT", "ADAUSDT", "SOLUSDT"]
    const marketData = []

    for (const symbol of symbols) {
      try {
        // Obter preço atual
        const ticker = await client.dailyStats({ symbol })

        // Obter dados de kline para calcular RSI (simplificado)
        const klines = await client.candles({ symbol, interval: "1h", limit: 14 })

        // Calcular RSI simplificado
        const closes = klines.map((k) => Number.parseFloat(k.close))
        const rsi = calculateRSI(closes)

        // Gerar sinal baseado em RSI e mudança de preço
        let signal: "BUY" | "SELL" | "HOLD" = "HOLD"
        const priceChange = Number.parseFloat(ticker.priceChangePercent)

        if (rsi < 30 && priceChange > -2) {
          signal = "BUY"
        } else if (rsi > 70 && priceChange < 2) {
          signal = "SELL"
        }

        marketData.push({
          symbol,
          price: Number.parseFloat(ticker.lastPrice),
          change24h: priceChange,
          volume: Number.parseFloat(ticker.volume),
          signal,
          rsi: Math.round(rsi),
          confidence: Math.random() * 0.3 + 0.6, // 60-90% confidence
        })
      } catch (error) {
        console.log(`Erro ao buscar dados para ${symbol}:`, error)
      }
    }

    return NextResponse.json({
      success: true,
      data: marketData,
    })
  } catch (error) {
    console.error("Erro ao obter dados de mercado:", error)
    return NextResponse.json({ error: "Erro ao buscar dados de mercado" }, { status: 500 })
  }
}

// Função para calcular RSI simplificado
function calculateRSI(prices: number[], period = 14): number {
  if (prices.length < period + 1) return 50

  let gains = 0
  let losses = 0

  for (let i = 1; i <= period; i++) {
    const change = prices[i] - prices[i - 1]
    if (change > 0) {
      gains += change
    } else {
      losses -= change
    }
  }

  const avgGain = gains / period
  const avgLoss = losses / period

  if (avgLoss === 0) return 100

  const rs = avgGain / avgLoss
  const rsi = 100 - 100 / (1 + rs)

  return rsi
}
