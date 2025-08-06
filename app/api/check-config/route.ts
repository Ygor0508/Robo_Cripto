import { NextResponse } from "next/server"

export async function GET() {
  try {
    // Verificar se as chaves API estão configuradas
    // Em um ambiente real, você verificaria se as chaves estão no banco de dados ou variáveis de ambiente
    const apiKey = process.env.BINANCE_API_KEY
    const secretKey = process.env.BINANCE_SECRET_KEY

    return NextResponse.json({
      configured: !!(apiKey && secretKey),
    })
  } catch (error) {
    return NextResponse.json(
      {
        configured: false,
      },
      { status: 500 },
    )
  }
}
