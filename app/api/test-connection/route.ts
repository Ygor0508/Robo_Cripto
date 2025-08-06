// import { type NextRequest, NextResponse } from "next/server"

// export async function POST(request: NextRequest) {
//   try {
//     const { apiKey, secretKey } = await request.json()

//     if (!apiKey || !secretKey) {
//       return NextResponse.json({ error: "API Key e Secret Key são obrigatórios" }, { status: 400 })
//     }

//     // Simular teste de conexão com a Binance
//     // Em um ambiente real, você faria uma chamada real para a API da Binance
//     const isValidKey = apiKey.length > 20 && secretKey.length > 20

//     if (!isValidKey) {
//       return NextResponse.json({ error: "Chaves API inválidas" }, { status: 400 })
//     }

//     // Simular sucesso na conexão
//     return NextResponse.json({
//       success: true,
//       message: "Conexão com a Binance estabelecida com sucesso",
//       accountInfo: {
//         canTrade: true,
//         canWithdraw: false,
//         canDeposit: true,
//       },
//     })
//   } catch (error) {
//     console.error("Erro ao testar conexão:", error)
//     return NextResponse.json({ error: "Erro ao conectar com a Binance" }, { status: 500 })
//   }
// }




import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { apiKey, secretKey } = await request.json()

    if (!apiKey || !secretKey) {
      return NextResponse.json({ error: "API Key e Secret Key são obrigatórios" }, { status: 400 })
    }

    // Importar dinamicamente para evitar erros de build
    const { Spot } = await import("@binance/connector")

    // Criar cliente Binance
    const client = new Spot(apiKey, secretKey, {
      baseURL: "https://api.binance.com",
    })

    try {
      // Testar conexão obtendo informações da conta
      const accountInfo = await client.account()
      
      return NextResponse.json({
        success: true,
        message: "Conexão com a Binance estabelecida com sucesso",
        accountInfo: {
          canTrade: accountInfo.data.canTrade,
          canWithdraw: accountInfo.data.canWithdraw,
          canDeposit: accountInfo.data.canDeposit,
          accountType: accountInfo.data.accountType,
          balanceCount: accountInfo.data.balances.length,
        },
      })
    } catch (binanceError: any) {
      console.error("Erro da API Binance:", binanceError)
      
      let errorMessage = "Erro ao conectar com a Binance"
      
      if (binanceError.response?.data?.msg) {
        errorMessage = binanceError.response.data.msg
      } else if (binanceError.message) {
        errorMessage = binanceError.message
      }

      return NextResponse.json({ 
        error: errorMessage,
        details: "Verifique se suas chaves API estão corretas e têm as permissões necessárias"
      }, { status: 400 })
    }
  } catch (error) {
    console.error("Erro ao testar conexão:", error)
    return NextResponse.json({ 
      error: `Erro interno: ${error instanceof Error ? error.message : "Erro desconhecido"}` 
    }, { status: 500 })
  }
}
