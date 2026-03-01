# Notas Técnicas do Projeto

## Geral

- Segui boas práticas de desenvolvimento e desenvolvi na branch `development` para no final dar merge na `main` e resolver possíveis conflitos.
- As variáveis de ambiente estão sendo extraídas de arquivos `.env`, seja para preservar o sigilo ou para facilitar alterar configurações.
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

## CI/CD

- Escrevi dois workflows de linter no GitHub Actions, um para rodar o `flake8` no backend e outro para rodar `eslint` no frontend durante cada push ou pull request.
- No arquivo `eslint.yml`, instalo as dependências no runner do GitHub usando `npm ci` (clean install) para garantir instalação de dependências do `package.json` exatamente como estão lá e sem alterar o `package-lock.json`.
- No arquivo `flake8.yml`, separo a instalação das dependências no runner em `pip install -r requirements.txt` e `pip install flake8`, para não incluir o `flake8` no `requirements.txt` e fazer o usuário que vai rodar o projeto instalar um pacote extra.
