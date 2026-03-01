## 📁 Clonando o repositório

```bash
git clone https://github.com/jose-fernando-1/SmartHub.git
cd SmartHub
```

---

## ⚙️ Backend (FastAPI)

### 1) Entrar na pasta do backend
```bash
cd backend
```

### 2) Criar e ativar ambiente virtual

**Linux/macOS**
```bash
python3 -m venv .venv
source .venv/bin/activate
```

**Windows (PowerShell)**
```powershell
python -m venv .venv
.venv\Scripts\Activate.ps1
```
### 3) Instalar dependências
```bash
pip install -r requirements.txt
```

### 4) Configurar variáveis de ambiente
Copie o exemplo e ajuste se necessário:
```bash
cp .env.example .env
```

Exemplo de `.env`:
```env
GEMINI_API_KEY=
USE_MOCK_AI=true
CORS_ORIGINS=http://localhost:5173
SQLITE_PATH=./data/app.db
```

> Se `USE_MOCK_AI=true`, o backend responde com sugestões mockadas e não chama a API Gemini.

>Insira sua chave de API do Gemini (verifique se tem acesso ao modelo gemini-2.5-flash-lite). Atribua false a USE_MOCK_AI, caso não queira usar essa funcionalidade.

### 5) Subir o servidor
```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Backend disponível em:
- API: `http://localhost:8000`
- Docs Swagger: `http://localhost:8000/docs`
- Docs Redoc: `http://localhost:8000/redoc`
- Healthcheck: `http://localhost:8000/health`

---

## 💻 Frontend (React + Vite)

### 1) Em outro terminal, entrar na pasta frontend
```bash
cd frontend
```
### 2) Criar .env do frontend
```bash
cp .env.example .env
```
### 2) Instalar dependências
```bash
npm install
```

### 3) Rodar em modo desenvolvimento
```bash
npm run dev
```

Frontend disponível em:
- `http://localhost:5173`

---

## 🔌 Integração Front + Back

O backend já está com CORS habilitado via [backend/app/main.py](backend/app/main.py), lendo `CORS_ORIGINS` de [backend/app/core/config.py](backend/app/core/config.py).

Allow origins padrão (restrito somente a esse):
- `http://localhost:5173`

Se rodar frontend em outra porta, ajuste `CORS_ORIGINS` no `.env`.
