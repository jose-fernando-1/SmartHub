# SmartHub – Hub Inteligente de Recursos Educacionais

Aplicação **Fullstack** para gerenciamento de recursos educacionais, com **auxílio de IA (Gemini)** para sugerir descrições e tags automaticamente durante o cadastro de materiais.



## 🧱 Stack utilizada

### Backend
- Python 3.10+
- FastAPI
- Pydantic
- SQLAlchemy
- SQLite
- Gemini API (`google-genai`)
- Flake8 (CI)

### Frontend
- React
- Vite
- TailwindCSS
- JavaScript
- ESLint (CI)

---


## 📋 Pré-requisitos

Certifique-se de ter instalado:

- **Python 3.10+**
- **Node.js 18+**
- **Git**

Para executar no modo dockerizado, também são necessários:

- **Docker Engine 24+**
- **Docker Compose v2** (plugin `docker compose`)



## Como rodar o projeto do zero (ambiente local)

Estas instruções permitem rodar **backend e frontend localmente**.

Passo a passo completo de setup local em:

- [Guia de setup local](docs/setup_local.md)
- [Guia de setup local dockerizado](docs/setup_local_docker.md)


## 📚 Documentação modular

Documentação complementar do projeto (separada por assunto):

- [Notas técnicas do projeto](docs/notes.md)
- [Comandos úteis](docs/commands.md)

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

## Direções Futuras