import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const settings = await request.json()

    // Validar configurações de email
    if (settings.email?.enabled && !settings.email?.address) {
      return NextResponse.json(
        { error: "Endereço de email é obrigatório quando notificações por email estão ativadas" },
        { status: 400 },
      )
    }

    // Validar configurações do Telegram
    if (settings.telegram?.enabled && (!settings.telegram?.chatId || !settings.telegram?.botToken)) {
      return NextResponse.json(
        { error: "Chat ID e Bot Token são obrigatórios para notificações do Telegram" },
        { status: 400 },
      )
    }

    // Em um ambiente real, salvar no banco de dados
    console.log("Configurações de notificação salvas:", settings)

    return NextResponse.json({
      success: true,
      message: "Configurações de notificação salvas com sucesso",
    })
  } catch (error) {
    console.error("Erro ao salvar configurações de notificação:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
