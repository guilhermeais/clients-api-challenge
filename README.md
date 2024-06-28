# Labs Challenge 🏪

## Descrição 📖
Este projeto foi desenv olvido utilizando NestJS e MongoDB, seguindo a arquitetura hexagonal, conceitos de arquitetura limpa e Domain-Driven Design (DDD). Inclui uma suíte de testes completa com testes unitários, de integração e end-to-end (E2E) utilizando Vitest e Testcontainers. Além disso, há uma suíte de testes de carga em desenvolvimento com K6.

## Requisitos 📋
- Node.js
- npm
- Instância MongoDB (para execução sem Docker)
- Docker (para execução com Docker)

## Instalação e execução do projeto 🚀

### Método Manual
1. Clone o repositório:
    ```bash
    git clone <URL do seu repositório>
    cd <nome do repositório>
    ```
2. Instale as dependências:
    ```bash
    npm install
    ```
3. Configure o arquivo `.env` com as variáveis `PRODUCTS_SERVICE_URL` e `MONGO_URI` conforme o `.env.example`. A variável `MONGO_URI` deve conter a URL da sua instância MongoDB.

4. Execute a aplicação em modo de desenvolvimento:
    ```bash
    npm run start:dev
    ```

### Com Docker
1. Clone o repositório:
    ```bash
    git clone <URL do seu repositório>
    cd <nome do repositório>
    ```
2. Configure o arquivo `.env` com as variáveis `PRODUCTS_SERVICE_URL` conforme o `.env.example`.

3. Execute a aplicação com Docker:
    ```bash
    docker-compose up
    ```

## Executando a Suíte de Testes Automatizados 🧪 

### Testes Unitários
Para rodar os testes unitários:
```bash
npm run test:watch
```

### Testes End-to-End e de integração (E2E)
Para rodar os testes E2E (⚠️ Docker precisa estar em execução):
```bash
npm run test:e2e
```

### Testes com Coverage
Para rodar toda a suíte de testes e gerar o relatório de cobertura de testes (⚠️ Docker precisa estar em execução):
```bash
npm run test:cov
```

## Testes de carga 💪🏻