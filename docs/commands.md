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