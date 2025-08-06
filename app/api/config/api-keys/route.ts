// import { type NextRequest, NextResponse } from "next/server"
// import crypto from "crypto"

// // Em um ambiente real, você usaria um banco de dados seguro
// const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || "your-32-character-secret-key-here"

// function encrypt(text: string): string {
//   const cipher = crypto.createCipher("aes-256-cbc", ENCRYPTION_KEY)
//   let encrypted = cipher.update(text, "utf8", "hex")
//   encrypted += cipher.final("hex")
//   return encrypted
// }

// export async function POST(request: NextRequest) {
//   try {
//     const { apiKey, secretKey } = await request.json()

//     if (!apiKey || !secretKey) {
//       return NextResponse.json({ error: "API Key e Secret Key são obrigatórios" }, { status: 400 })
//     }

//     // Criptografar as chaves antes de armazenar
//     const encryptedApiKey = encrypt(apiKey)
//     const encryptedSecretKey = encrypt(secretKey)

//     // Em um ambiente real, você salvaria no banco de dados
//     // Por enquanto, vamos simular o salvamento
//     console.log("Chaves API criptografadas e salvas:", {
//       apiKey: encryptedApiKey.substring(0, 10) + "...",
//       secretKey: encryptedSecretKey.substring(0, 10) + "...",
//     })

//     return NextResponse.json({
//       success: true,
//       message: "Chaves API configuradas com sucesso",
//     })
//   } catch (error) {
//     console.error("Erro ao configurar chaves API:", error)
//     return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
//   }
// }



import { type NextRequest, NextResponse } from "next/server"
import crypto from "crypto"

// Chave de criptografia segura
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || "your-32-character-secret-key-here"
const ALGORITHM = "aes-256-cbc"

function encrypt(text: string): string {
  try {
    // Gerar IV aleatório
    const iv = crypto.randomBytes(16)
    
    // Criar cipher
    const cipher = crypto.createCipheriv(ALGORITHM, Buffer.from(ENCRYPTION_KEY), iv)
    
    // Criptografar
    let encrypted = cipher.update(text, "utf8", "hex")
    encrypted += cipher.final("hex")
    
    // Retornar IV + dados criptografados
    return iv.toString("hex") + ":" + encrypted
  } catch (error) {
    console.error("Erro na criptografia:", error)
    throw new Error("Falha na criptografia")
  }
}

function decrypt(encryptedData: string): string {
  try {
    const parts = encryptedData.split(":")
    const iv = Buffer.from(parts[0], "hex")
    const encrypted = parts[1]
    
    const decipher = crypto.createDecipheriv(ALGORITHM, Buffer.from(ENCRYPTION_KEY), iv)
    let decrypted = decipher.update(encrypted, "hex", "utf8")
    decrypted += decipher.final("utf8")
    
    return decrypted
  } catch (error) {
    console.error("Erro na descriptografia:", error)
    throw new Error("Falha na descriptografia")
  }
}

export async function POST(request: NextRequest) {
  try {
    const { apiKey, secretKey } = await request.json()

    if (!apiKey || !secretKey) {
      return NextResponse.json({ error: "API Key e Secret Key são obrigatórios" }, { status: 400 })
    }

    if (!ENCRYPTION_KEY || ENCRYPTION_KEY.length !== 32) {
      return NextResponse.json({ error: "Chave de criptografia inválida. Deve ter 32 caracteres." }, { status: 500 })
    }

    // Criptografar as chaves antes de armazenar
    const encryptedApiKey = encrypt(apiKey)
    const encryptedSecretKey = encrypt(secretKey)

    // Em um ambiente real, você salvaria no banco de dados
    // Por enquanto, vamos salvar em variáveis de ambiente temporárias
    process.env.ENCRYPTED_BINANCE_API_KEY = encryptedApiKey
    process.env.ENCRYPTED_BINANCE_SECRET_KEY = encryptedSecretKey

    console.log("✅ Chaves API criptografadas e salvas com sucesso")

    return NextResponse.json({
      success: true,
      message: "Chaves API configuradas com sucesso",
    })
  } catch (error) {
    console.error("Erro ao configurar chaves API:", error)
    return NextResponse.json({ 
      error: `Erro interno do servidor: ${error instanceof Error ? error.message : 'Erro desconhecido'}` 
    }, { status: 500 })
  }
}

// Função para recuperar chaves descriptografadas
export function getDecryptedKeys() {
  try {
    const encryptedApiKey = process.env.ENCRYPTED_BINANCE_API_KEY
    const encryptedSecretKey = process.env.ENCRYPTED_BINANCE_SECRET_KEY

    if (!encryptedApiKey || !encryptedSecretKey) {
      return null
    }

    return {
      apiKey: decrypt(encryptedApiKey),
      secretKey: decrypt(encryptedSecretKey)
    }
  } catch (error) {
    console.error("Erro ao recuperar chaves:", error)
    return null
  }
}
