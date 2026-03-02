#!/usr/bin/env python3
import argparse
import os
import sqlite3
from pathlib import Path


def read_sqlite_path_from_env_file(env_file: Path) -> str | None:
    if not env_file.exists():
        return None

    for raw_line in env_file.read_text(encoding="utf-8").splitlines():
        line = raw_line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, value = line.split("=", 1)
        if key.strip() == "SQLITE_PATH":
            return value.strip().strip('"').strip("'")
    return None


def resolve_db_path(cli_db: str | None) -> Path:
    if cli_db:
        return Path(cli_db).expanduser().resolve()

    sqlite_path = os.getenv("SQLITE_PATH")
    if not sqlite_path:
        sqlite_path = read_sqlite_path_from_env_file(Path(".env")) or "./data/app.db"

    return Path(sqlite_path).expanduser().resolve()


def get_tables(conn: sqlite3.Connection) -> list[str]:
    rows = conn.execute(
        "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name"
    ).fetchall()
    return [name for (name,) in rows]


def print_table_info(conn: sqlite3.Connection, table: str, limit: int) -> None:
    count = conn.execute(f"SELECT COUNT(*) FROM {table}").fetchone()[0]
    print(f"\n=== Tabela: {table} ===")
    print(f"Total de registros: {count}")

    schema_rows = conn.execute(f"PRAGMA table_info({table})").fetchall()
    columns = [row[1] for row in schema_rows]
    print(f"Colunas: {', '.join(columns) if columns else '(sem colunas)'}")

    if count == 0:
        print("Sem registros para exibir.")
        return

    order_column = "id" if "id" in columns else "rowid"
    rows = conn.execute(
        f"SELECT * FROM {table} ORDER BY {order_column} DESC LIMIT ?", (limit,)
    ).fetchall()
    print(f"Últimos {len(rows)} registros:")
    for row in rows:
        print(f"- {row}")


def main() -> int:
    parser = argparse.ArgumentParser(
        description="Valida dados no SQLite do projeto (tabelas, contagem e últimos registros)."
    )
    parser.add_argument("--db", help="Caminho do arquivo SQLite. Ex.: ./data/app.db")
    parser.add_argument(
        "--table",
        help="Nome da tabela para focar a validação. Ex.: resources. Se omitido, valida todas.",
    )
    parser.add_argument(
        "--limit",
        type=int,
        default=5,
        help="Quantidade de registros mais recentes para exibir por tabela (padrão: 5).",
    )
    args = parser.parse_args()

    db_path = resolve_db_path(args.db)
    print(f"Banco alvo: {db_path}")

    if not db_path.exists():
        print("ERRO: arquivo do banco não encontrado.")
        return 1

    try:
        conn = sqlite3.connect(str(db_path))
        tables = get_tables(conn)

        if not tables:
            print("Nenhuma tabela encontrada no banco.")
            return 0

        print(f"Tabelas encontradas: {', '.join(tables)}")

        if args.table:
            if args.table not in tables:
                print(f"ERRO: tabela '{args.table}' não existe no banco.")
                return 1
            selected_tables = [args.table]
        else:
            selected_tables = tables

        for table in selected_tables:
            print_table_info(conn, table, max(1, args.limit))

        return 0
    except sqlite3.Error as exc:
        print(f"ERRO SQLite: {exc}")
        return 1
    finally:
        try:
            conn.close()
        except Exception:
            pass


if __name__ == "__main__":
    raise SystemExit(main())
