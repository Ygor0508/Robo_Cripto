//app/api/test-connection/route.ts

import { type NextRequest, NextResponse } from "next/server";
import Binance from "binance-api-node";

export async function POST(request: NextRequest) {
  try {
    const { apiKey, secretKey } = await request.json();

    console.log("Recebido na API /api/test-connection:");
    console.log("API Key (parcial):", apiKey ? apiKey.slice(0, 5) + '...' : 'NÃO RECEBIDA');
    console.log("Secret Key (parcial):", secretKey ? secretKey.slice(0, 5) + '...' : 'NÃO RECEBIDA');

    if (!apiKey || !secretKey) {
      return NextResponse.json(
        { error: "API Key e Secret Key são obrigatórios e não foram recebidos no backend." },
        { status: 400 }
      );
    }

    // --- CORREÇÃO FINAL: USANDO A OPÇÃO 'getTime' CORRETA ---

    // 1. Buscar a hora oficial do servidor da Binance.
    const timeResponse = await fetch("https://api.binance.com/api/v3/time");
    const timeData = await timeResponse.json();
    const serverTime = timeData.serverTime;

    // 2. Calcular a diferença (offset) entre o tempo do servidor e o tempo local.
    const timeOffset = serverTime - Date.now();
    console.log(`Diferença de tempo calculada (offset): ${timeOffset}ms`);

    // 3. Inicializar o cliente passando uma função para `getTime`.
    // Esta função irá fornecer o tempo local corrigido com o offset em todas as requisições.
    const client = Binance({
      apiKey: apiKey,
      apiSecret: secretKey,
      getTime: () => Date.now() + timeOffset,
    });
    
    try {
      // A chamada para obter informações da conta é 'accountInfo'
      const accountInfo = await client.accountInfo();

      return NextResponse.json({
        success: true,
        message: "Conexão com a Binance estabelecida com sucesso!",
        accountInfo: {
          canTrade: accountInfo.canTrade,
          canWithdraw: accountInfo.canWithdraw,
          canDeposit: accountInfo.canDeposit,
          accountType: accountInfo.accountType,
          balanceCount: accountInfo.balances.length,
        },
      });
    } catch (binanceError: any) {
      console.error("Erro da API Binance:", binanceError.message);
      
      const errorMessage = `Erro da Binance: ${binanceError.message || "Falha na autenticação."}`;

      return NextResponse.json({ 
        error: errorMessage,
        details: "Verifique se suas chaves API estão corretas, se as permissões estão habilitadas e se não há restrições de IP."
      }, { status: 400 });
    }
  } catch (error) {
    console.error("Erro ao testar conexão:", error);
    return NextResponse.json({ 
      error: `Erro interno: ${error instanceof Error ? error.message : "Erro desconhecido"}` 
    }, { status: 500 });
  }
}