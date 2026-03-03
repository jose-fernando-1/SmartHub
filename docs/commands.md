## 🛠️ Comandos úteis

### Docker Compose
```bash
# subir tudo em segundo plano (rebuildando imagens)
docker compose up -d --build

# subir e acompanhar logs no terminal
docker compose up --build

# parar e remover containers, rede e volumes anônimos
docker compose down -v

# reiniciar somente o backend
docker compose restart backend

# ver status dos serviços
docker compose ps

# acompanhar logs de todos os serviços
docker compose logs -f

# acompanhar logs de um serviço específico
docker compose logs -f backend
docker compose logs -f frontend

# abrir shell dentro dos containers
docker compose exec backend bash
docker compose exec frontend sh

# executar comandos pontuais dentro dos containers
docker compose exec backend python scripts/check_db.py --table resources --limit 10
docker compose exec frontend npm run lint
```

### Execução local (sem Docker)

> Use terminais separados para backend e frontend.

#### Backend (FastAPI)
```bash
cd backend

# criar e ativar ambiente virtual
python -m venv .venv
source .venv/bin/activate

# instalar dependências
pip install -r requirements.txt

# iniciar API local
uvicorn app.main:app --reload
```

#### Frontend (Vite)
```bash
cd frontend

# instalar dependências
npm install

# iniciar app local
npm run dev
```

#### Qualidade e build (local)
```bash
# frontend
cd frontend && npm run lint
cd frontend && npm run build

# backend (com venv ativo)
cd backend && python scripts/check_db.py --table resources --limit 10
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