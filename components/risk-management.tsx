"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Shield, AlertTriangle, TrendingDown, TrendingUp } from "lucide-react"

export function RiskManagement() {
  const [stopLossEnabled, setStopLossEnabled] = useState(true)
  const [takeProfitEnabled, setTakeProfitEnabled] = useState(true)
  const [stopLossPercent, setStopLossPercent] = useState([2])
  const [takeProfitPercent, setTakeProfitPercent] = useState([5])
  const [maxPositionSize, setMaxPositionSize] = useState([10])
  const [maxDailyLoss, setMaxDailyLoss] = useState(500)
  const [maxOpenPositions, setMaxOpenPositions] = useState(3)
  const [riskPerTrade, setRiskPerTrade] = useState([1])

  const handleSaveSettings = async () => {
    const settings = {
      stopLoss: {
        enabled: stopLossEnabled,
        percent: stopLossPercent[0],
      },
      takeProfit: {
        enabled: takeProfitEnabled,
        percent: takeProfitPercent[0],
      },
      maxPositionSize: maxPositionSize[0],
      maxDailyLoss,
      maxOpenPositions,
      riskPerTrade: riskPerTrade[0],
    }

    try {
      const response = await fetch("/api/risk-settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      })

      if (response.ok) {
        // Mostrar sucesso
        console.log("Configurações salvas com sucesso")
      }
    } catch (error) {
      console.error("Erro ao salvar configurações:", error)
    }
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Stop Loss e Take Profit */}
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <Shield className="w-5 h-5" />
              Stop Loss & Take Profit
            </CardTitle>
            <CardDescription className="text-slate-400">
              Configure os limites automáticos de perda e lucro
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label className="text-slate-200">Stop Loss Automático</Label>
                <p className="text-sm text-slate-400">Vender automaticamente em caso de perda</p>
              </div>
              <Switch checked={stopLossEnabled} onCheckedChange={setStopLossEnabled} />
            </div>

            {stopLossEnabled && (
              <div className="space-y-2">
                <Label className="text-slate-200">Percentual de Stop Loss: {stopLossPercent[0]}%</Label>
                <Slider
                  value={stopLossPercent}
                  onValueChange={setStopLossPercent}
                  max={10}
                  min={0.5}
                  step={0.1}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-slate-400">
                  <span>0.5%</span>
                  <span>10%</span>
                </div>
              </div>
            )}

            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label className="text-slate-200">Take Profit Automático</Label>
                <p className="text-sm text-slate-400">Vender automaticamente em caso de lucro</p>
              </div>
              <Switch checked={takeProfitEnabled} onCheckedChange={setTakeProfitEnabled} />
            </div>

            {takeProfitEnabled && (
              <div className="space-y-2">
                <Label className="text-slate-200">Percentual de Take Profit: {takeProfitPercent[0]}%</Label>
                <Slider
                  value={takeProfitPercent}
                  onValueChange={setTakeProfitPercent}
                  max={20}
                  min={1}
                  step={0.5}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-slate-400">
                  <span>1%</span>
                  <span>20%</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Gestão de Posições */}
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <TrendingUp className="w-5 h-5" />
              Gestão de Posições
            </CardTitle>
            <CardDescription className="text-slate-400">Controle o tamanho e quantidade de posições</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label className="text-slate-200">Tamanho Máximo por Posição: {maxPositionSize[0]}% do portfólio</Label>
              <Slider
                value={maxPositionSize}
                onValueChange={setMaxPositionSize}
                max={25}
                min={1}
                step={1}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-slate-400">
                <span>1%</span>
                <span>25%</span>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="maxPositions" className="text-slate-200">
                Máximo de Posições Abertas
              </Label>
              <Input
                id="maxPositions"
                type="number"
                value={maxOpenPositions}
                onChange={(e) => setMaxOpenPositions(Number(e.target.value))}
                className="bg-slate-700 border-slate-600 text-white"
                min={1}
                max={10}
              />
            </div>

            <div className="space-y-2">
              <Label className="text-slate-200">Risco por Trade: {riskPerTrade[0]}% do portfólio</Label>
              <Slider
                value={riskPerTrade}
                onValueChange={setRiskPerTrade}
                max={5}
                min={0.1}
                step={0.1}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-slate-400">
                <span>0.1%</span>
                <span>5%</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Limites Diários */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <AlertTriangle className="w-5 h-5" />
            Limites de Segurança
          </CardTitle>
          <CardDescription className="text-slate-400">Defina limites para proteger seu capital</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="maxDailyLoss" className="text-slate-200">
                Perda Máxima Diária (USD)
              </Label>
              <Input
                id="maxDailyLoss"
                type="number"
                value={maxDailyLoss}
                onChange={(e) => setMaxDailyLoss(Number(e.target.value))}
                className="bg-slate-700 border-slate-600 text-white"
                min={0}
              />
              <p className="text-xs text-slate-400">O bot será pausado se atingir esta perda</p>
            </div>
          </div>

          <Alert className="border-amber-500 bg-amber-500/10">
            <AlertTriangle className="h-4 w-4 text-amber-500" />
            <AlertDescription className="text-amber-200">
              <strong>Importante:</strong> Estes limites são aplicados automaticamente para proteger seu capital. O bot
              será pausado se qualquer limite for atingido.
            </AlertDescription>
          </Alert>

          <Button onClick={handleSaveSettings} className="w-full">
            Salvar Configurações de Risco
          </Button>
        </CardContent>
      </Card>

      {/* Status Atual */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">Status Atual dos Riscos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-slate-700 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <TrendingDown className="w-4 h-4 text-red-500" />
                <span className="text-slate-200">Perda Diária</span>
              </div>
              <div className="text-2xl font-bold text-white">$125.50</div>
              <div className="text-sm text-slate-400">de $500 limite</div>
            </div>

            <div className="p-4 bg-slate-700 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Shield className="w-4 h-4 text-blue-500" />
                <span className="text-slate-200">Posições Abertas</span>
              </div>
              <div className="text-2xl font-bold text-white">2</div>
              <div className="text-sm text-slate-400">de 3 máximo</div>
            </div>

            <div className="p-4 bg-slate-700 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-4 h-4 text-green-500" />
                <span className="text-slate-200">Exposição Total</span>
              </div>
              <div className="text-2xl font-bold text-white">15%</div>
              <div className="text-sm text-slate-400">do portfólio</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
