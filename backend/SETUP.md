# Under Armour Store - Backend Setup

## Pré-requisitos

1. **Node.js 18 ou 20** (Medusa não suporta Node 24 ainda)
2. **PostgreSQL** instalado e rodando
3. **Redis** (opcional, mas recomendado)

## Instalação

### 1. Instalar Node.js 20 (usando nvm)
```bash
nvm install 20
nvm use 20
```

### 2. Criar o projeto Medusa
```bash
npx create-medusa-app@latest underarmour-backend --skip-db --no-browser
cd underarmour-backend
```

### 3. Configurar o banco de dados
Crie um banco PostgreSQL:
```sql
CREATE DATABASE underarmour_store;
```

Edite o `.env`:
```
DATABASE_URL=postgres://postgres:password@localhost:5432/underarmour_store
MEDUSA_ADMIN_ONBOARDING_TYPE=default
STORE_CORS=http://localhost:3000
ADMIN_CORS=http://localhost:7001
```

### 4. Rodar as migrations
```bash
npx medusa migrations run
```

### 5. Criar usuário admin
```bash
npx medusa user --email admin@underarmour.com --password admin123
```

### 6. Seed de dados (opcional)
```bash
npx medusa seed --seed-file=data/seed.json
```

### 7. Iniciar o servidor
```bash
npx medusa develop
```

O backend roda em `http://localhost:9000`
O admin roda em `http://localhost:7001`

## Adicionando Produtos

1. Acesse `http://localhost:7001` (painel admin)
2. Faça login com `admin@underarmour.com` / `admin123`
3. Vá em **Products > Add Product**
4. Preencha: nome, descrição, imagens, variantes (tamanho, cor), preços
5. Publique o produto

## API Endpoints

- `GET /store/products` - Listar produtos
- `GET /store/products?handle=slug` - Produto por handle
- `GET /store/collections` - Listar coleções
- `POST /store/carts` - Criar carrinho
- `POST /store/carts/:id/line-items` - Adicionar item ao carrinho
- `POST /store/carts/:id/complete` - Finalizar pedido
