import { type NextRequest, NextResponse } from "next/server"

// Estado global simples para demonstração
// Em produção, use um banco de dados ou Redis
const tradingState = {
  isActive: false,
  startTime: null as Date | null,
  stopTime: null as Date | null,
}

export async function POST(request: NextRequest) {
  try {
    const { action } = await request.json()

    if (action === "start") {
      tradingState.isActive = true
      tradingState.startTime = new Date()
      tradingState.stopTime = null

      // Aqui você iniciaria o processo de trading
      console.log("Trading iniciado em:", tradingState.startTime)

      return NextResponse.json({
        success: true,
        message: "Trading iniciado com sucesso",
        state: tradingState,
      })
    } else if (action === "stop") {
      tradingState.isActive = false
      tradingState.stopTime = new Date()

      // Aqui você pararia o processo de trading
      console.log("Trading parado em:", tradingState.stopTime)

      return NextResponse.json({
        success: true,
        message: "Trading parado com sucesso",
        state: tradingState,
      })
    } else {
      return NextResponse.json({ error: 'Ação inválida. Use "start" ou "stop"' }, { status: 400 })
    }
  } catch (error) {
    console.error("Erro ao alternar trading:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({
    state: tradingState,
  })
}
