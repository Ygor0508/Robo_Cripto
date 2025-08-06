import asyncio
import json
import logging
from datetime import datetime
from typing import Dict, List, Optional
import numpy as np
import pandas as pd
from binance.client import Client
from binance.enums import *
import ta

# Configuração de logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class TradingBot:
    def __init__(self, api_key: str, secret_key: str):
        self.client = Client(api_key, secret_key)
        self.is_running = False
        self.positions = {}
        self.risk_settings = {
            'stop_loss_percent': 2.0,
            'take_profit_percent': 5.0,
            'max_position_size_percent': 10.0,
            'max_daily_loss': 500.0,
            'risk_per_trade_percent': 1.0
        }
        
    async def start_trading(self):
        """Inicia o bot de trading"""
        self.is_running = True
        logger.info("Bot de trading iniciado")
        
        while self.is_running:
            try:
                await self.trading_loop()
                await asyncio.sleep(60)  # Aguarda 1 minuto entre ciclos
            except Exception as e:
                logger.error(f"Erro no loop de trading: {e}")
                await asyncio.sleep(30)
    
    async def stop_trading(self):
        """Para o bot de trading"""
        self.is_running = False
        logger.info("Bot de trading parado")
    
    async def trading_loop(self):
        """Loop principal de trading"""
        symbols = ['BTCUSDT', 'ETHUSDT', 'BNBUSDT']
        
        for symbol in symbols:
            try:
                # Obter dados históricos
                df = await self.get_historical_data(symbol)
                if df is None:
                    continue
                
                # Calcular indicadores técnicos
                df = self.add_technical_indicators(df)
                
                # Gerar sinal de trading
                signal = self.generate_signal(df)
                
                # Executar trade baseado no sinal
                await self.execute_trade(symbol, signal, df)
                
            except Exception as e:
                logger.error(f"Erro ao processar {symbol}: {e}")
    
    async def get_historical_data(self, symbol: str, interval='15m', limit=200) -> Optional[pd.DataFrame]:
        """Obtém dados históricos da Binance"""
        try:
            klines = self.client.get_historical_klines(symbol, interval, f"{limit} hours ago UTC")
            
            if not klines:
                return None
            
            df = pd.DataFrame(klines, columns=[
                'timestamp', 'open', 'high', 'low', 'close', 'volume',
                'close_time', 'quote_asset_volume', 'number_of_trades',
                'taker_buy_base_asset_volume', 'taker_buy_quote_asset_volume', 'ignore'
            ])
            
            # Converter para tipos apropriados
            for col in ['open', 'high', 'low', 'close', 'volume']:
                df[col] = df[col].astype(float)
            
            df['timestamp'] = pd.to_datetime(df['timestamp'], unit='ms')
            df.set_index('timestamp', inplace=True)
            
            return df[['open', 'high', 'low', 'close', 'volume']]
            
        except Exception as e:
            logger.error(f"Erro ao obter dados históricos para {symbol}: {e}")
            return None
    
    def add_technical_indicators(self, df: pd.DataFrame) -> pd.DataFrame:
        """Adiciona indicadores técnicos ao DataFrame"""
        try:
            # RSI
            df['rsi'] = ta.momentum.RSIIndicator(df['close'], window=14).rsi()
            
            # EMA
            df['ema_12'] = ta.trend.EMAIndicator(df['close'], window=12).ema_indicator()
            df['ema_26'] = ta.trend.EMAIndicator(df['close'], window=26).ema_indicator()
            
            # MACD
            macd = ta.trend.MACD(df['close'])
            df['macd'] = macd.macd()
            df['macd_signal'] = macd.macd_signal()
            
            # Bollinger Bands
            bb = ta.volatility.BollingerBands(df['close'], window=20)
            df['bb_upper'] = bb.bollinger_hband()
            df['bb_lower'] = bb.bollinger_lband()
            df['bb_middle'] = bb.bollinger_mavg()
            
            # Volume MA
            df['volume_ma'] = df['volume'].rolling(window=20).mean()
            
            # Remover NaN
            df.dropna(inplace=True)
            
            return df
            
        except Exception as e:
            logger.error(f"Erro ao calcular indicadores técnicos: {e}")
            return df
    
    def generate_signal(self, df: pd.DataFrame) -> str:
        """Gera sinal de trading baseado nos indicadores"""
        try:
            if len(df) < 2:
                return 'HOLD'
            
            latest = df.iloc[-1]
            previous = df.iloc[-2]
            
            # Condições de compra
            buy_conditions = [
                latest['rsi'] < 30,  # RSI oversold
                latest['close'] < latest['bb_lower'],  # Preço abaixo da banda inferior
                latest['macd'] > latest['macd_signal'],  # MACD bullish
                latest['volume'] > latest['volume_ma'] * 1.2  # Volume alto
            ]
            
            # Condições de venda
            sell_conditions = [
                latest['rsi'] > 70,  # RSI overbought
                latest['close'] > latest['bb_upper'],  # Preço acima da banda superior
                latest['macd'] < latest['macd_signal'],  # MACD bearish
            ]
            
            # Decisão baseada na maioria das condições
            if sum(buy_conditions) >= 3:
                return 'BUY'
            elif sum(sell_conditions) >= 2:
                return 'SELL'
            else:
                return 'HOLD'
                
        except Exception as e:
            logger.error(f"Erro ao gerar sinal: {e}")
            return 'HOLD'
    
    async def execute_trade(self, symbol: str, signal: str, df: pd.DataFrame):
        """Executa trade baseado no sinal"""
        try:
            current_price = float(self.client.get_symbol_ticker(symbol=symbol)['price'])
            
            if signal == 'BUY':
                await self.execute_buy_order(symbol, current_price)
            elif signal == 'SELL':
                await self.execute_sell_order(symbol, current_price, df)
                
        except Exception as e:
            logger.error(f"Erro ao executar trade para {symbol}: {e}")
    
    async def execute_buy_order(self, symbol: str, current_price: float):
        """Executa ordem de compra"""
        try:
            # Verificar se já temos posição aberta
            if symbol in self.positions:
                logger.info(f"Posição já aberta para {symbol}")
                return
            
            # Calcular quantidade baseada no risco
            account_balance = float(self.client.get_account()['totalWalletBalance'])
            risk_amount = account_balance * (self.risk_settings['risk_per_trade_percent'] / 100)
            quantity = risk_amount / current_price
            
            # Ajustar quantidade conforme regras da exchange
            quantity = self.adjust_quantity(symbol, quantity)
            
            if quantity <= 0:
                logger.warning(f"Quantidade inválida para compra de {symbol}")
                return
            
            # Executar ordem
            order = self.client.order_market_buy(
                symbol=symbol,
                quantity=quantity
            )
            
            # Registrar posição
            self.positions[symbol] = {
                'entry_price': current_price,
                'quantity': quantity,
                'timestamp': datetime.now(),
                'stop_loss': current_price * (1 - self.risk_settings['stop_loss_percent'] / 100),
                'take_profit': current_price * (1 + self.risk_settings['take_profit_percent'] / 100)
            }
            
            logger.info(f"Ordem de compra executada para {symbol}: {order}")
            
        except Exception as e:
            logger.error(f"Erro ao executar ordem de compra para {symbol}: {e}")
    
    async def execute_sell_order(self, symbol: str, current_price: float, df: pd.DataFrame):
        """Executa ordem de venda"""
        try:
            if symbol not in self.positions:
                logger.info(f"Nenhuma posição aberta para {symbol}")
                return
            
            position = self.positions[symbol]
            
            # Verificar condições de venda
            should_sell = False
            sell_reason = ""
            
            # Stop Loss
            if current_price <= position['stop_loss']:
                should_sell = True
                sell_reason = "Stop Loss"
            
            # Take Profit
            elif current_price >= position['take_profit']:
                should_sell = True
                sell_reason = "Take Profit"
            
            # Sinal técnico de venda
            elif self.generate_signal(df) == 'SELL':
                pnl_percent = ((current_price - position['entry_price']) / position['entry_price']) * 100
                if pnl_percent > 0.5:  # Só vender com lucro mínimo
                    should_sell = True
                    sell_reason = "Sinal Técnico"
            
            if should_sell:
                # Executar ordem de venda
                order = self.client.order_market_sell(
                    symbol=symbol,
                    quantity=position['quantity']
                )
                
                # Calcular P&L
                pnl = (current_price - position['entry_price']) * position['quantity']
                
                logger.info(f"Ordem de venda executada para {symbol}: {order}")
                logger.info(f"Motivo: {sell_reason}, P&L: ${pnl:.2f}")
                
                # Remover posição
                del self.positions[symbol]
                
        except Exception as e:
            logger.error(f"Erro ao executar ordem de venda para {symbol}: {e}")
    
    def adjust_quantity(self, symbol: str, quantity: float) -> float:
        """Ajusta quantidade conforme regras da exchange"""
        try:
            symbol_info = self.client.get_symbol_info(symbol)
            lot_size_filter = next(f for f in symbol_info['filters'] if f['filterType'] == 'LOT_SIZE')
            
            min_qty = float(lot_size_filter['minQty'])
            step_size = float(lot_size_filter['stepSize'])
            
            # Ajustar para o step size
            precision = len(str(step_size).split('.')[-1]) if '.' in str(step_size) else 0
            quantity = round(quantity, precision)
            
            return max(quantity, min_qty)
            
        except Exception as e:
            logger.error(f"Erro ao ajustar quantidade para {symbol}: {e}")
            return 0
    
    def update_risk_settings(self, new_settings: Dict):
        """Atualiza configurações de risco"""
        self.risk_settings.update(new_settings)
        logger.info(f"Configurações de risco atualizadas: {self.risk_settings}")
    
    def get_portfolio_status(self) -> Dict:
        """Retorna status do portfólio"""
        try:
            account = self.client.get_account()
            
            return {
                'total_balance': float(account['totalWalletBalance']),
                'available_balance': float(account['availableBalance']),
                'positions': self.positions,
                'is_running': self.is_running
            }
            
        except Exception as e:
            logger.error(f"Erro ao obter status do portfólio: {e}")
            return {}

# Exemplo de uso
async def main():
    # Configurar com suas chaves API
    API_KEY = "sua_api_key_aqui"
    SECRET_KEY = "sua_secret_key_aqui"
    
    bot = TradingBot(API_KEY, SECRET_KEY)
    
    # Iniciar trading
    await bot.start_trading()

if __name__ == "__main__":
    asyncio.run(main())
