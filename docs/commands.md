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