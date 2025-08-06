import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const settings = await request.json()

    // Validar configurações
    if (settings.stopLoss?.percent < 0 || settings.stopLoss?.percent > 100) {
      return NextResponse.json({ error: "Percentual de stop loss inválido" }, { status: 400 })
    }

    if (settings.takeProfit?.percent < 0 || settings.takeProfit?.percent > 100) {
      return NextResponse.json({ error: "Percentual de take profit inválido" }, { status: 400 })
    }

    // Em um ambiente real, salvar no banco de dados
    console.log("Configurações de risco salvas:", settings)

    return NextResponse.json({
      success: true,
      message: "Configurações de risco salvas com sucesso",
    })
  } catch (error) {
    console.error("Erro ao salvar configurações de risco:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
