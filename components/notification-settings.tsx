"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Bell, Mail, MessageSquare, Smartphone, CheckCircle } from "lucide-react"

export function NotificationSettings() {
  const [emailNotifications, setEmailNotifications] = useState(true)
  const [telegramNotifications, setTelegramNotifications] = useState(false)
  const [pushNotifications, setPushNotifications] = useState(true)
  const [email, setEmail] = useState("")
  const [telegramChatId, setTelegramChatId] = useState("")
  const [telegramBotToken, setTelegramBotToken] = useState("")
  const [notificationFrequency, setNotificationFrequency] = useState("immediate")
  const [tradeNotifications, setTradeNotifications] = useState(true)
  const [errorNotifications, setErrorNotifications] = useState(true)
  const [dailyReports, setDailyReports] = useState(true)
  const [profitLossAlerts, setProfitLossAlerts] = useState(true)

  const handleSaveSettings = async () => {
    const settings = {
      email: {
        enabled: emailNotifications,
        address: email,
      },
      telegram: {
        enabled: telegramNotifications,
        chatId: telegramChatId,
        botToken: telegramBotToken,
      },
      push: {
        enabled: pushNotifications,
      },
      frequency: notificationFrequency,
      types: {
        trades: tradeNotifications,
        errors: errorNotifications,
        dailyReports: dailyReports,
        profitLoss: profitLossAlerts,
      },
    }

    try {
      const response = await fetch("/api/notification-settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      })

      if (response.ok) {
        console.log("Configurações de notificação salvas")
      }
    } catch (error) {
      console.error("Erro ao salvar configurações:", error)
    }
  }

  const testNotification = async (type: string) => {
    try {
      const response = await fetch("/api/test-notification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type }),
      })

      if (response.ok) {
        console.log(`Notificação de teste ${type} enviada`)
      }
    } catch (error) {
      console.error("Erro ao enviar notificação de teste:", error)
    }
  }

  return (
    <div className="space-y-6">
      {/* Canais de Notificação */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <Bell className="w-5 h-5" />
            Canais de Notificação
          </CardTitle>
          <CardDescription className="text-slate-400">
            Configure como você deseja receber as notificações
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Email */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-blue-500" />
                <div>
                  <Label className="text-slate-200">Notificações por Email</Label>
                  <p className="text-sm text-slate-400">Receba alertas no seu email</p>
                </div>
              </div>
              <Switch checked={emailNotifications} onCheckedChange={setEmailNotifications} />
            </div>

            {emailNotifications && (
              <div className="ml-8 space-y-2">
                <Label htmlFor="email" className="text-slate-200">
                  Endereço de Email
                </Label>
                <div className="flex gap-2">
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="seu@email.com"
                    className="bg-slate-700 border-slate-600 text-white"
                  />
                  <Button variant="outline" onClick={() => testNotification("email")} size="sm">
                    Testar
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Telegram */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <MessageSquare className="w-5 h-5 text-green-500" />
                <div>
                  <Label className="text-slate-200">Notificações via Telegram</Label>
                  <p className="text-sm text-slate-400">Receba alertas instantâneos no Telegram</p>
                </div>
              </div>
              <Switch checked={telegramNotifications} onCheckedChange={setTelegramNotifications} />
            </div>

            {telegramNotifications && (
              <div className="ml-8 space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="botToken" className="text-slate-200">
                    Bot Token
                  </Label>
                  <Input
                    id="botToken"
                    type="password"
                    value={telegramBotToken}
                    onChange={(e) => setTelegramBotToken(e.target.value)}
                    placeholder="1234567890:ABCdefGHIjklMNOpqrsTUVwxyz"
                    className="bg-slate-700 border-slate-600 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="chatId" className="text-slate-200">
                    Chat ID
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      id="chatId"
                      value={telegramChatId}
                      onChange={(e) => setTelegramChatId(e.target.value)}
                      placeholder="123456789"
                      className="bg-slate-700 border-slate-600 text-white"
                    />
                    <Button variant="outline" onClick={() => testNotification("telegram")} size="sm">
                      Testar
                    </Button>
                  </div>
                </div>
                <Alert className="border-blue-500 bg-blue-500/10">
                  <AlertDescription className="text-blue-200 text-sm">
                    <strong>Como configurar:</strong> Crie um bot no @BotFather, obtenha o token, adicione o bot ao seu
                    chat e use /start para obter o Chat ID.
                  </AlertDescription>
                </Alert>
              </div>
            )}
          </div>

          {/* Push Notifications */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Smartphone className="w-5 h-5 text-purple-500" />
              <div>
                <Label className="text-slate-200">Notificações Push</Label>
                <p className="text-sm text-slate-400">Alertas no navegador</p>
              </div>
            </div>
            <Switch checked={pushNotifications} onCheckedChange={setPushNotifications} />
          </div>
        </CardContent>
      </Card>

      {/* Tipos de Notificação */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">Tipos de Notificação</CardTitle>
          <CardDescription className="text-slate-400">Escolha quais eventos devem gerar notificações</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-slate-200">Execução de Trades</Label>
                <p className="text-sm text-slate-400">Compras e vendas realizadas</p>
              </div>
              <Switch checked={tradeNotifications} onCheckedChange={setTradeNotifications} />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label className="text-slate-200">Alertas de Erro</Label>
                <p className="text-sm text-slate-400">Falhas e problemas do sistema</p>
              </div>
              <Switch checked={errorNotifications} onCheckedChange={setErrorNotifications} />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label className="text-slate-200">Relatórios Diários</Label>
                <p className="text-sm text-slate-400">Resumo diário de performance</p>
              </div>
              <Switch checked={dailyReports} onCheckedChange={setDailyReports} />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label className="text-slate-200">Alertas de P&L</Label>
                <p className="text-sm text-slate-400">Lucros e perdas significativos</p>
              </div>
              <Switch checked={profitLossAlerts} onCheckedChange={setProfitLossAlerts} />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-slate-200">Frequência de Notificações</Label>
            <Select value={notificationFrequency} onValueChange={setNotificationFrequency}>
              <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="immediate">Imediata</SelectItem>
                <SelectItem value="hourly">A cada hora</SelectItem>
                <SelectItem value="daily">Diária</SelectItem>
                <SelectItem value="weekly">Semanal</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Ações */}
      <div className="flex gap-4">
        <Button onClick={handleSaveSettings} className="flex items-center gap-2">
          <CheckCircle className="w-4 h-4" />
          Salvar Configurações
        </Button>
        <Button variant="outline" onClick={() => testNotification("all")}>
          Testar Todas as Notificações
        </Button>
      </div>
    </div>
  )
}
