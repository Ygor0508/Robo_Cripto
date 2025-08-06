import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import os
from dotenv import load_dotenv

load_dotenv('.env.local')

def test_email():
    smtp_host = os.getenv('SMTP_HOST')
    smtp_port = int(os.getenv('SMTP_PORT', 587))
    smtp_user = os.getenv('SMTP_USER')
    smtp_pass = os.getenv('SMTP_PASS')
    
    if not all([smtp_host, smtp_user, smtp_pass]):
        print("❌ Configure as variáveis SMTP no .env.local")
        return
    
    try:
        # Criar mensagem
        msg = MIMEMultipart()
        msg['From'] = smtp_user
        msg['To'] = smtp_user  # Enviar para você mesmo
        msg['Subject'] = "🤖 Teste Trading Bot - Email"
        
        body = "Email configurado com sucesso! O bot pode enviar notificações."
        msg.attach(MIMEText(body, 'plain'))
        
        # Enviar
        server = smtplib.SMTP(smtp_host, smtp_port)
        server.starttls()
        server.login(smtp_user, smtp_pass)
        server.send_message(msg)
        server.quit()
        
        print("✅ Email enviado com sucesso!")
        
    except Exception as e:
        print(f"❌ Erro ao enviar email: {e}")

if __name__ == "__main__":
    test_email()