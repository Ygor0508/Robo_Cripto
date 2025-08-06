import requests
import os
from dotenv import load_dotenv

load_dotenv('.env.local')

def test_telegram():
    bot_token = os.getenv('TELEGRAM_BOT_TOKEN')
    chat_id = os.getenv('TELEGRAM_CHAT_ID')
    
    if not bot_token or not chat_id:
        print("❌ Configure TELEGRAM_BOT_TOKEN e TELEGRAM_CHAT_ID no .env.local")
        return
    
    url = f"https://api.telegram.org/bot{bot_token}/sendMessage"
    data = {
        "chat_id": chat_id,
        "text": "🤖 Teste do Trading Bot - Telegram configurado com sucesso!"
    }
    
    response = requests.post(url, data=data)
    if response.status_code == 200:
        print("✅ Mensagem enviada com sucesso!")
    else:
        print(f"❌ Erro: {response.text}")

if __name__ == "__main__":
    test_telegram()