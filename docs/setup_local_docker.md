## 📁 Clonando o repositório

```bash
git clone https://github.com/jose-fernando-1/SmartHub.git
cd SmartHub
```

---

## 📋 Pré-requisitos (modo dockerizado)

Certifique-se de ter instalado:

- **Docker Engine 24+**
- **Docker Compose v2** (plugin `docker compose`)
- **Git**

Validação rápida:

```bash
docker --version
docker compose version
```

---

## ⚙️ Configuração de variáveis de ambiente

Antes de subir os containers, copie os arquivos de exemplo:

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

### Backend (`backend/.env`)

```env
GEMINI_API_KEY=
USE_MOCK_AI=true
CORS_ORIGINS=http://localhost:5173
SQLITE_PATH=./data/app.db
```

> Se `USE_MOCK_AI=true`, o backend responde com sugestões mockadas e não chama a API Gemini.
>
> Para usar IA real, defina `USE_MOCK_AI=false` e preencha `GEMINI_API_KEY`.

### Frontend (`frontend/.env`)

```env
VITE_API_BASE_URL=http://localhost:8000
```

---

## 🚀 Subindo o projeto com Docker

Na raiz do projeto (na primeira execução):

```bash
docker compose up --build -d
```

Isso irá subir:

- `smarthub-backend-dev` em `http://localhost:8000`
- `smarthub-frontend-dev` em `http://localhost:5173`

Para rodar novamente depois de já ter feito build:
```bash
docker compose up -d
```

---

## ✅ Verificando se está tudo funcionando

Ver status dos containers:

```bash
docker compose ps
```

Ver logs em tempo real:

```bash
docker compose logs -f backend frontend
```

Testar healthcheck do backend:

```bash
curl http://localhost:8000/health
```

Abrir no navegador:

- Frontend: `http://localhost:5173`
- Swagger: `http://localhost:8000/docs`
- Redoc: `http://localhost:8000/redoc`

---

## 🛠️ Comandos úteis

Parar e remover os containers:

```bash
docker compose down
```

Parar e remover containers + rede + volumes:

```bash
docker compose down -v
```

Rebuild completo após mudanças de dependência:

```bash
docker compose up --build -d
```

