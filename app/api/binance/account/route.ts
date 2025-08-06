import { NextResponse } from "next/server"
import Client from "binance-api-node"

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

    // Obter informações da conta
    const accountInfo = await client.accountInfo()

    // Calcular saldo total em USDT
    let totalBalance = 0
    let availableBalance = 0

    for (const balance of accountInfo.balances) {
      const free = Number.parseFloat(balance.free)
      const locked = Number.parseFloat(balance.locked)

      if (free > 0 || locked > 0) {
        if (balance.asset === "USDT") {
          totalBalance += free + locked
          availableBalance += free
        } else {
          // Para outros ativos, converter para USDT (simplificado)
          try {
            const ticker = await client.prices({ symbol: `${balance.asset}USDT` })
            const price = Number.parseFloat(ticker[`${balance.asset}USDT`] || "0")
            totalBalance += (free + locked) * price
            availableBalance += free * price
          } catch (error) {
            // Se não conseguir converter, ignora
            console.log(`Não foi possível converter ${balance.asset} para USDT`)
          }
        }
      }
    }

    return NextResponse.json({
      success: true,
      totalWalletBalance: totalBalance.toFixed(2),
      availableBalance: availableBalance.toFixed(2),
      canTrade: accountInfo.canTrade,
      canWithdraw: accountInfo.canWithdraw,
      canDeposit: accountInfo.canDeposit,
      balances: accountInfo.balances.filter((b: { free: string; locked: string; }) => Number.parseFloat(b.free) > 0 || Number.parseFloat(b.locked) > 0),
    })
  } catch (error) {
    console.error("Erro ao obter informações da conta:", error)
    return NextResponse.json({ error: "Erro ao conectar com a Binance" }, { status: 500 })
  }
}