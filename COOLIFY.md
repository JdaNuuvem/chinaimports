# Deploy no Coolify

Guia para subir a stack (backend + storefront + postgres) no Coolify.

## Arquitetura

```
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│   Postgres   │  │   Backend    │  │  Storefront  │
│  (managed)   │←─│   Express    │←─│   Next.js    │
│              │  │  + Prisma    │  │  standalone  │
└──────────────┘  └──────────────┘  └──────────────┘
                       :9000              :3000
```

3 serviços, 1 deploy. Backend roda auto-migrate na primeira partida.

---

## 1. Criar o projeto no Coolify

1. Abra Coolify → **Projects → New Project**
2. Nome: `imports-china-brasil` (ou o que preferir)
3. **Add a new resource → Public/Private Git repository**
4. Cole a URL do repositório e selecione a branch (ex: `main`)

## 2. Configurar Postgres

**Add new resource → Database → PostgreSQL**:
- **Version**: 16
- **Name**: `ua-postgres`
- Coolify gera as credenciais. Copie o **Internal URL** (será usado como `DATABASE_URL`).

Anote o `DATABASE_URL` interno (algo como):
```
postgresql://postgres:senhaaleatoria@ua-postgres:5432/postgres
```

## 3. Deploy do Backend

**Add new resource → Application → Dockerfile**:

| Campo | Valor |
|---|---|
| Build Pack | `Dockerfile` |
| Base Directory | `/underarmour-store/backend` |
| Dockerfile Location | `Dockerfile` |
| Port | `9000` |
| Health Check Path | `/health` |

### Build args
| Nome | Valor |
|---|---|
| `DATABASE_URL` | `postgresql://postgres:SENHA@ua-postgres:5432/postgres` |

### Environment Variables (runtime)
```env
PORT=9000
NODE_ENV=production
DATABASE_URL=postgresql://postgres:SENHA@ua-postgres:5432/postgres
JWT_SECRET=GERAR_COM_openssl_rand_-hex_32
ADMIN_SECRET=senha-forte-do-admin
THEME_ADMIN_PASSWORD=mesma-senha-acima
ALLOWED_ORIGINS=https://yourstore.com,https://admin.yourstore.com
STORE_URL=https://yourstore.com
AUTO_MIGRATE=true
```

> 💡 Outras chaves (SMTP, Stripe, Sentinel, GA, Meta Pixel) **não** precisam ir aqui — configure via admin UI após o deploy.

### Persistent Storage
- **Source**: `/app/public/uploads`
- **Destination**: nome do volume (ex: `ua-uploads`)
- **Read/Write**: rw

Sem isso você perde imagens enviadas a cada redeploy.

### Domain
- Aponte o subdomínio `api.yourstore.com` para esse serviço

---

## 4. Deploy do Storefront

**Add new resource → Application → Dockerfile**:

| Campo | Valor |
|---|---|
| Build Pack | `Dockerfile` |
| Base Directory | `/underarmour-store/storefront2` |
| Dockerfile Location | `Dockerfile` |
| Port | `3000` |
| Health Check Path | `/api/health` |

### Build args
| Nome | Valor |
|---|---|
| `NEXT_PUBLIC_MEDUSA_BACKEND_URL` | `https://api.yourstore.com` |

⚠️ **Crítico**: tem que ser passado como build arg, não só env. O `NEXT_PUBLIC_*` é baked no bundle no momento do build.

### Environment Variables (runtime)
```env
NODE_ENV=production
PORT=3000
NEXT_PUBLIC_MEDUSA_BACKEND_URL=https://api.yourstore.com
NEXT_PUBLIC_SITE_URL=https://yourstore.com
THEME_ADMIN_PASSWORD=mesma-senha-do-backend
REVALIDATION_SECRET=GERAR_COM_openssl_rand_-hex_32
```

### Domain
- Aponte `yourstore.com` (e/ou `www.yourstore.com`) para esse serviço

---

## 5. Primeiro acesso

1. Após o deploy, o backend roda **automaticamente**:
   - `prepare-schema.js` → ajusta provider Prisma para postgres
   - `prisma db push` → cria todas as tabelas
   - `seed.js` → seed inicial (idempotente, só roda se DB vazio)
   - `server.js` → server up

2. Acesse `https://api.yourstore.com/health` — deve retornar `{"status":"ok"}`

3. Acesse `https://yourstore.com/admin/theme` → login com `THEME_ADMIN_PASSWORD`

4. Configure as integrações:
   - **Configurações**: SMTP, Luna Checkout, Stripe (se for usar)
   - **Sentinel Tracking**: API Key + gerar webhook
   - **Integrações** (visão geral): status de cada integração

---

## 6. Testes pós-deploy

### Backend
```bash
curl https://api.yourstore.com/health
# {"status":"ok","db":"connected","products":N,"orders":N,"uptime":N}

curl https://api.yourstore.com/store/products?limit=1
# {"products":[...],"count":N}

curl https://api.yourstore.com/store/public-config
# {"SENTINEL_API_KEY":"..."} ou {} se nada configurado
```

### Storefront
```bash
curl -I https://yourstore.com
# HTTP/2 200

curl https://yourstore.com/api/health
# {"status":"healthy","medusa":{"reachable":true,"latency_ms":N}}

curl -I https://yourstore.com/sitemap.xml
# HTTP/2 200
```

---

## 7. Variáveis sensíveis — geração

```bash
# JWT_SECRET (backend)
openssl rand -hex 32

# REVALIDATION_SECRET (storefront)
openssl rand -hex 32

# Admin password (backend + storefront, devem bater)
# Use seu gerenciador de senhas, mín 16 chars
```

---

## 8. CORS — domínios permitidos

No backend env `ALLOWED_ORIGINS` (vírgula-separado):
```
ALLOWED_ORIGINS=https://yourstore.com,https://www.yourstore.com,https://admin.yourstore.com
```

Em dev local, `localhost:3000` e `localhost:3001` já são permitidos por default.

---

## 9. Auto-migração

O backend roda `ensureDbSchema()` no startup. Detecta drift de schema e roda `prisma db push` automaticamente.

Para desabilitar (em produção restrita):
```env
AUTO_MIGRATE=false
```

Aí você precisa rodar manualmente sempre que mexer no schema:
```bash
docker exec -it <backend-container> npx prisma db push
```

---

## 10. Troubleshooting

### "Cannot find module 'prisma' / 'setting'"
- O `postinstall` não rodou. Force `npm install` no container.

### "Connection refused" / backend não acha DB
- Verifique o `DATABASE_URL` interno do Coolify (não use external URL para conexões dentro da rede Coolify)
- Postgres precisa estar `healthy` antes do backend subir (`depends_on` no compose)

### "404 /store/public-config"
- O backend antigo não tem o endpoint. Force redeploy.

### Imagens uploaded somem após deploy
- Falta o **Persistent Storage** no volume `/app/public/uploads`

### CORS error no browser
- Adicione o domínio do storefront em `ALLOWED_ORIGINS`

### Storefront mostra "Erro ao carregar"
- Verifique `NEXT_PUBLIC_MEDUSA_BACKEND_URL` (precisa ser **public**, não interno do Coolify)
- Confira que o backend está com SSL válido (HTTPS), senão o browser bloqueia mixed content

### Build falha em `prisma generate`
- Falta `DATABASE_URL` no build arg. O `postinstall` precisa dele para detectar o provider correto

---

## 11. Backups

- **Postgres**: configure backups automáticos no Coolify (Database → Settings → Backup)
- **Uploads**: snapshot periódico do volume persistente
- **Settings UI**: estão no DB Postgres → backup do Postgres já cobre

---

## 12. Custos estimados

| Recurso | RAM | Disk | Notas |
|---|---|---|---|
| Postgres 16 | 256MB | 5GB | Cresce com pedidos/produtos |
| Backend Node | 512MB | 100MB | + uploads volume |
| Storefront Next | 384MB | 200MB | Standalone build |
| **Total** | **~1.2GB** | **5-15GB** | VPS de 2GB cobre confortavelmente |

---

## 13. Próximos passos pós-deploy

1. ✅ Configurar Sentinel + gerar webhook
2. ✅ Configurar SMTP no admin (envio de e-mails)
3. ✅ Setup Luna Checkout (se for usar)
4. ✅ Adicionar cron-job.org chamando `/admin/cleanup` e `/admin/abandoned-carts/send-recovery`
5. ✅ Pixel/GA/Meta API → admin → Configurações → salvar (sem precisar editar .env)
