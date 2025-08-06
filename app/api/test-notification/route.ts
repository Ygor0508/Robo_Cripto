// import { type NextRequest, NextResponse } from "next/server"

// export async function POST(request: NextRequest) {
//   try {
//     const { type } = await request.json()

//     // Simular envio de notificação de teste
//     console.log(`Enviando notificação de teste do tipo: ${type}`)

//     switch (type) {
//       case "email":
//         // Aqui você enviaria um email de teste
//         console.log("Email de teste enviado")
//         break
//       case "telegram":
//         // Aqui você enviaria uma mensagem de teste via Telegram
//         console.log("Mensagem de teste enviada via Telegram")
//         break
//       case "push":
//         // Aqui você enviaria uma notificação push
//         console.log("Notificação push de teste enviada")
//         break
//       case "all":
//         console.log("Todas as notificações de teste enviadas")
//         break
//       default:
//         return NextResponse.json({ error: "Tipo de notificação inválido" }, { status: 400 })
//     }

//     return NextResponse.json({
//       success: true,
//       message: `Notificação de teste ${type} enviada com sucesso`,
//     })
//   } catch (error) {
//     console.error("Erro ao enviar notificação de teste:", error)
//     return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
//   }
// }




import { type NextRequest, NextResponse } from "next/server"
import nodemailer from "nodemailer"

async function sendTelegramMessage(message: string) {
  try {
    const botToken = process.env.TELEGRAM_BOT_TOKEN
    const chatId = process.env.TELEGRAM_CHAT_ID

    if (!botToken || !chatId) {
      throw new Error("Token do bot ou Chat ID não configurados")
    }

    const url = `https://api.telegram.org/bot${botToken}/sendMessage`
    
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: "HTML",
      }),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(`Erro do Telegram: ${data.description || "Erro desconhecido"}`)
    }

    return { success: true, data }
  } catch (error) {
    console.error("Erro ao enviar Telegram:", error)
    throw error
  }
}

async function sendEmail(subject: string, message: string) {
  try {
    const smtpHost = process.env.SMTP_HOST
    const smtpPort = parseInt(process.env.SMTP_PORT || "587")
    const smtpUser = process.env.SMTP_USER
    const smtpPass = process.env.SMTP_PASS

    if (!smtpHost || !smtpUser || !smtpPass) {
      throw new Error("Configurações SMTP não encontradas")
    }

    // Criar transporter
    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: false, // true para 465, false para outras portas
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
    })

    // Verificar conexão
    await transporter.verify()

    // Enviar email
    const info = await transporter.sendMail({
      from: `"Trading Bot" <${smtpUser}>`,
      to: smtpUser, // Enviar para você mesmo
      subject: subject,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #10B981;">🤖 Trading Bot Notification</h2>
          <p>${message}</p>
          <hr style="border: 1px solid #e5e7eb;">
          <p style="color: #6b7280; font-size: 12px;">
            Esta é uma notificação automática do seu Trading Bot.
          </p>
        </div>
      `,
    })

    return { success: true, messageId: info.messageId }
  } catch (error) {
    console.error("Erro ao enviar email:", error)
    throw error
  }
}

export async function POST(request: NextRequest) {
  try {
    const { type } = await request.json()

    const results: any = {}

    switch (type) {
      case "email":
        try {
          await sendEmail(
            "🤖 Teste Trading Bot - Email",
            "Email configurado com sucesso! O bot pode enviar notificações por email."
          )
          results.email = { success: true, message: "Email enviado com sucesso" }
        } catch (error) {
          results.email = { 
            success: false, 
            error: error instanceof Error ? error.message : "Erro desconhecido" 
          }
        }
        break

      case "telegram":
        try {
          await sendTelegramMessage(
            "🤖 <b>Teste Trading Bot</b>\n\n✅ Telegram configurado com sucesso!\n\nO bot pode enviar notificações via Telegram."
          )
          results.telegram = { success: true, message: "Telegram enviado com sucesso" }
        } catch (error) {
          results.telegram = { 
            success: false, 
            error: error instanceof Error ? error.message : "Erro desconhecido" 
          }
        }
        break

      case "push":
        // Push notifications seriam implementadas com service workers
        results.push = { success: true, message: "Push notification simulada" }
        break

      case "all":
        // Testar todos os tipos
        try {
          await sendEmail(
            "🤖 Teste Completo Trading Bot",
            "Teste completo das notificações! Todos os canais estão funcionando."
          )
          results.email = { success: true }
        } catch (error) {
          results.email = { success: false, error: error instanceof Error ? error.message : "Erro" }
        }

        try {
          await sendTelegramMessage(
            "🤖 <b>Teste Completo Trading Bot</b>\n\n✅ Todos os canais de notificação testados com sucesso!"
          )
          results.telegram = { success: true }
        } catch (error) {
          results.telegram = { success: false, error: error instanceof Error ? error.message : "Erro" }
        }

        results.push = { success: true }
        break

      default:
        return NextResponse.json({ error: "Tipo de notificação inválido" }, { status: 400 })
    }

    // Verificar se pelo menos uma notificação foi bem-sucedida
    const hasSuccess = Object.values(results).some((result: any) => result.success)
    const hasError = Object.values(results).some((result: any) => !result.success)

    return NextResponse.json({
      success: hasSuccess,
      results,
      message: hasError 
        ? "Algumas notificações falharam. Verifique as configurações." 
        : "Todas as notificações enviadas com sucesso!",
    })
  } catch (error) {
    console.error("Erro ao enviar notificação de teste:", error)
    return NextResponse.json({ 
      error: `Erro interno: ${error instanceof Error ? error.message : "Erro desconhecido"}` 
    }, { status: 500 })
  }
}
