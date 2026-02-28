# SmartHub – Hub Inteligente de Recursos Educacionais

Aplicação **Fullstack** para gerenciamento de recursos educacionais, com **auxílio de IA (Gemini)** para sugerir descrições e tags automaticamente durante o cadastro de materiais.

---

## 🧱 Stack utilizada

### Backend
- Python 3.10+
- FastAPI
- Pydantic
- SQLAlchemy
- SQLite
- Gemini API (`google-genai`)
- flake8 (CI) ainda não implementado

### Frontend
- React
- Vite
- TailwindCSS
- JavaScript

---

## 🚀 Como rodar o projeto do zero (ambiente local)

Estas instruções permitem rodar **backend e frontend localmente**, sem Docker até o momento.

---

## 📋 Pré-requisitos

Certifique-se de ter instalado:

- **Python 3.10+**
- **Node.js 18+** (ou 20+)
- **npm**
- **Git**

---

## 📁 Clonando o repositório

```bash
git clone https://github.com/jose-fernando-1/SmartHub.git
cd SmartHub
```

---

## ⚙️ Backend (FastAPI)

Arquivos de referência:
- [backend/requirements.txt](backend/requirements.txt)
- [backend/.env.example](backend/.env.example)
- [backend/app/main.py](backend/app/main.py)

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

Valor padrão(restrito somente a esse):
- `http://localhost:5173`

Se rodar frontend em outra porta, ajuste `CORS_ORIGINS` no `.env`.

---

## 🧪 Endpoints principais

- `GET /health`
- `GET /resources`
- `POST /resources`
- `GET /resources/{resource_id}`
- `PUT /resources/{resource_id}`
- `DELETE /resources/{resource_id}`
- `POST /ai/generate`

Rotas implementadas em:
- [backend/app/routers/health.py](backend/app/routers/health.py)
- [backend/app/routers/resources.py](backend/app/routers/resources.py)
- [backend/app/routers/ai.py](backend/app/routers/ai.py)

---

## 🛠️ Comandos úteis

### Backend
```bash
uvicorn app.main:app --reload
```

### Frontend
```bash
npm run dev
npm run build
npm run preview
npm run lint
```

---

### SQLite (verificar dados do banco)

> Assumindo que o ambiente virtual já está ativado.

```bash
cd backend
python scripts/check_db.py
```

Exemplos:
```bash
python scripts/check_db.py --table resources --limit 10
python scripts/check_db.py --db ./data/app.db
```

Flags disponíveis:
- `--limit`: define quantos registros mais recentes mostrar.
- `--db`: informa manualmente o caminho do arquivo SQLite (sobrescreve `.env`).

## 📌 Estrutura resumida

- Backend API: [backend/app/main.py](backend/app/main.py)
- Configurações: [backend/app/core/config.py](backend/app/core/config.py)
- Serviço de IA: [backend/app/services/ai_gemini.py](backend/app/services/ai_gemini.py)
- Frontend entrypoint: [frontend/src/main.jsx](frontend/src/main.jsx)
- Frontend app: [frontend/src/App.jsx](frontend/src/App.jsx)