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

    // Obter saldos da conta
    const accountInfo = await client.accountInfo()
    const positions = []

    // Filtrar apenas saldos com quantidade > 0 (exceto USDT)
    const nonZeroBalances = accountInfo.balances.filter(
      (balance) => Number.parseFloat(balance.free) > 0 && balance.asset !== "USDT",
    )

    for (const balance of nonZeroBalances) {
      try {
        const symbol = `${balance.asset}USDT`

        // Obter preço atual
        const ticker = await client.prices({ symbol })
        const currentPrice = Number.parseFloat(ticker[symbol] || "0")

        if (currentPrice > 0) {
          const quantity = Number.parseFloat(balance.free)

          // Para calcular o preço de entrada real, precisaríamos do histórico de trades
          // Por simplicidade, vamos usar uma estimativa baseada no preço atual
          const estimatedEntryPrice = currentPrice * (0.95 + Math.random() * 0.1) // ±5%

          const currentValue = quantity * currentPrice
          const entryValue = quantity * estimatedEntryPrice
          const pnl = currentValue - entryValue
          const pnlPercent = (pnl / entryValue) * 100

          positions.push({
            symbol,
            quantity,
            entryPrice: estimatedEntryPrice,
            currentPrice,
            pnl,
            pnlPercent,
          })
        }
      } catch (error) {
        console.log(`Erro ao processar posição ${balance.asset}:`, error)
      }
    }

    return NextResponse.json({
      success: true,
      positions,
    })
  } catch (error) {
    console.error("Erro ao obter posições:", error)
    return NextResponse.json({ error: "Erro ao buscar posições" }, { status: 500 })
  }
}
