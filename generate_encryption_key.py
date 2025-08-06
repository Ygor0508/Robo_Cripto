import secrets
import string

def generate_encryption_key():
    """Gera uma chave de criptografia segura de 32 caracteres"""
    alphabet = string.ascii_letters + string.digits
    key = ''.join(secrets.choice(alphabet) for _ in range(32))
    return key

if __name__ == "__main__":
    key = generate_encryption_key()
    print(f"Sua chave de criptografia: {key}")
    print(f"Adicione no .env.local: ENCRYPTION_KEY={key}")