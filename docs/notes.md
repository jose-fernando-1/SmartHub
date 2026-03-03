# Notas Técnicas do Projeto

## Geral

- Segui boas práticas de desenvolvimento e desenvolvi numa branch de `development` para no final dar merge na `main` e resolver possíveis conflitos.
- Apliquei regras de proteção de branch, implementei verificações de dependências e de segurança periódicas (semanais) por meio do dependabot, com verificação de pull request manual para alterações geradas pelo agente de IA do Github.
- As variáveis de ambiente estão sendo extraídas de arquivos `.env`, seja para preservar o sigilo ou para facilitar alterar configurações. Arquivos sensíveis ou desnecessários publicar estão explícitos no .gitignore.
- Os logs são estruturados e são armazenados no banco de dados para possibilitar análise. Existem logs para registrar as interações com a API do Gemini e para registrar operações com recursos (criar/editar/remover).

## API de IA

- Tentei forçar, por meio de prompts, o Gemini retornar dados no formato que eu precisava e não funcionou.
- Vi na documentação da API que é possível forçar um modelo de resposta usando Pydantic.
- Forcei usando Pydantic, apesar de seguir as instruções do PDF e contextualizar o prompt fazendo o Gemini se passar por um agente pedagógico.

## Pydantic

- É usado para validar dados de duas formas: uso direto (definindo modelos e constraints) e via schemas.
- Em `ai.py`, define modelos de entrada e saída da rota de IA (`AIRequest`/`AIResponse`) e os valida com `Field`.
- Em `ai_gemini.py`, são aplicadas constraints ao modelo `AISuggestion`, e ele é usado tanto para enviar o prompt para o Gemini quanto para forçar o Gemini a retornar dados no formato do schema JSON gerado por ele.
- Via schemas, em `resource.py`, os modelos de recurso centralizam validações de cadastro e edição de recursos.
- Logs são validados antes de serem salvos no banco de dados.

## CI/CD

- Escrevi dois workflows de linter no GitHub Actions, um para rodar o `flake8` no backend e outro para rodar `eslint` no frontend durante cada push ou pull request.
- No arquivo `eslint.yml`, instalo as dependências no runner do GitHub usando `npm ci` (clean install) para garantir instalação de dependências do `package.json` exatamente como estão lá e sem alterar o `package-lock.json`.
- No arquivo `flake8.yml`, separo a instalação das dependências no runner em `pip install -r requirements.txt` e `pip install flake8`, para não incluir o `flake8` no `requirements.txt` e fazer o usuário que vai rodar o projeto instalar um pacote extra.
- Automatizei a execução do ambiente usando containeres docker, de forma a resumir a execução do ambiente a 1 comando na raiz do projeto (docker compose up).
- Escrevi um Dockerfile básico (arquivo de configuração do Docker) para o backend e um para o frontend. Simplesmente instala dependências usando o gerenciador de pacotes (pip/npm) e executa o script de inicialização.
- Os containeres são orquestrados por um arquivo de configuração do docker compose. Ele cria dois serviços(backend/frontend), mapeia a porta da rede interna do docker para o pc, implementa um healthcheck simples para cada serviço e estabelece dependência de inicialização entre os serviços. 

## Backend
- API REST construída com **FastAPI**, com validação de entrada/saída usando **Pydantic** e tipagem moderna do Python.
- CRUD completo de recursos implementado em `routers/resources.py`:
	- `GET /resources` com paginação (`page` e `page_size`).
	- `POST /resources` para cadastro.
	- `GET /resources/{id}` para consulta por ID.
	- `PUT /resources/{id}` para edição.
	- `DELETE /resources/{id}` para exclusão.
- Modelo de recurso cobre os campos exigidos no desafio: **Título, Descrição, Tipo (Video/PDF/Link), URL e Tags**.
- Integração com IA implementada em `POST /ai/generate`:
	- Frontend envia `title` e `type` junto com o prompt.
	- Backend chama o serviço Gemini e retorna `description` + `tags` (3 itens).
	- Resposta estruturada forçada com `response_json_schema` e validação via BaseModel `AISuggestion`.
- Segurança de credenciais: `GEMINI_API_KEY` vem de variável de ambiente (arquivo `.env`), sem chave hardcoded no código.
- Fallback para mock (`USE_MOCK_AI=true`) mantém o fluxo funcional mesmo sem API key, conforme regra opcional do desafio.
- Banco de dados via **SQLAlchemy + SQLite** (configurável por env), com criação automática das tabelas no startup.
- Observabilidade:
	- Endpoint de health check em `GET /health` validando disponibilidade do banco.
	- Logs estruturados de IA persistidos em `ai_interaction_logs` (latência, tokens, status, erro).
	- Logs de auditoria de recursos persistidos em `resource_audit_logs` para create/update/delete.

## Frontend
- SPA construída com **React + Vite**, com arquitetura por componentes e hooks customizados.
- Tela principal unifica formulário e listagem, permitindo operar no fluxo completo sem troca de página.
- Funcionalidade Smart Assist implementada no formulário:
	- Botão **Gerar com IA** chama `POST /ai/generate` com título e tipo.
	- Campos de descrição e tags são preenchidos automaticamente com o retorno.
- Feedback visual durante processamento:
	- Estado de loading para IA (`Gerando...`).
	- Estado de loading para persistência (`Salvando...`).
	- Estado de loading para busca por ID (`Buscando...`).
	- Estado de loading para listagem de recursos.
- Tratamento de erro robusto para IA e CRUD:
	- Timeout com `AbortController` na chamada de IA.
	- Mensagens amigáveis para timeout, falhas de API e validações de formulário.
- Listagem de recursos com paginação client-driven (controle de página, tamanho de página e total de itens).
- Ações de edição e remoção integradas à listagem, mantendo sincronização automática do estado após operações.

## Documentação

- O projeto foi documentado de forma modular para facilitar avaliação técnica e onboarding:
	- `README.md`: visão geral, stack, endpoints e links para guias.
	- `docs/setup_local.md`: execução local (backend + frontend), `.env` e URLs úteis.
	- `docs/setup_local_docker.md`: execução dockerizada com `docker compose`, healthcheck e troubleshooting básico.
	- `docs/commands.md`: comandos operacionais e de desenvolvimento para dia a dia.
	- `docs/notes.md`: decisões técnicas e justificativas de implementação.
- A documentação cobre os itens de entrega pedidos no desafio: instruções de execução, integração IA, segurança de variáveis, observabilidade e CI.
- CI documentada e implementada em GitHub Actions:
	- `flake8.yml` para backend.
	- `eslint.yml` para frontend.
- A abordagem adotada permite demonstrar rastreabilidade entre requisito e implementação (funcional, técnico e bônus de DevOps/observabilidade).