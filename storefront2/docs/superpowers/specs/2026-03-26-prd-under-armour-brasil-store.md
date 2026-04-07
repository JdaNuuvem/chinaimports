# PRD — Under Armour Brasil Store

**Versão:** 1.0
**Data:** 2026-03-26
**Projeto:** Reconstrução do tema Shopify Evolution v5.0 em Next.js 16 + Express Backend
**Objetivo:** Loja e-commerce headless de produção completa, white-label, com painel admin estilo Shopify

---

## 1. Visão Geral

Plataforma e-commerce headless composta por:

| Camada | Stack | Porta |
|--------|-------|-------|
| Storefront | Next.js 16 (App Router) + React 19 + Tailwind 4 | 3000 |
| Backend API | Express 4 + Prisma 6 (SQLite → PostgreSQL) | 7900/9000 |
| Painel Admin | Integrado no storefront em `/admin/theme` | 3000 |
| Chrome Extension | Manifest V3 — importador de reviews/produtos | N/A |
| Deploy | Docker Compose + GitHub Actions CI | — |

---

## 2. Inventário Completo do que Existe

### 2.1 Páginas do Storefront (20 rotas + 7 API routes + extras)

| Rota | Status | Descrição |
|------|--------|-----------|
| `/` (home) | OK | Slideshow, FeaturedCollection, Mosaic, BrandShowcase, Offers, TextWithIcons, VideoShowcase |
| `/product/[slug]` | OK | Gallery, ProductInfo, Tabs, Reviews, Recommendations, RecentlyViewed, UrgencyTimer, TrustBadges, StickyAddToCart |
| `/collections` | OK | Lista de todas as coleções |
| `/collections/[handle]` | OK | Produtos filtrados por coleção com paginação |
| `/cart` | OK | Carrinho completo com cupons |
| `/checkout` | OK | Formulário de endereço + frete + pagamento (Luna) |
| `/search` | OK | Busca com resultados em tempo real |
| `/account` | OK | Dashboard do cliente |
| `/account/login` | OK | Login com JWT |
| `/account/register` | OK | Cadastro de cliente |
| `/account/orders` | OK | Lista de pedidos do cliente |
| `/account/orders/[id]` | OK | Detalhe do pedido |
| `/account/addresses` | OK | Gerenciamento de endereços |
| `/account/wishlist` | OK | Lista de desejos (localStorage) |
| `/blog` | OK | Lista de posts |
| `/blog/[slug]` | OK | Post individual |
| `/about` | OK | Página institucional |
| `/contact` | OK | Formulário de contato |
| `/faq` | OK | Accordion de perguntas frequentes |
| `/admin/theme` | OK | Painel admin completo (~2900 linhas) |

#### Arquivos especiais
| Arquivo | Status | Descrição |
|---------|--------|-----------|
| `not-found.tsx` | OK | Página 404 personalizada |
| `sitemap.ts` | OK | Geração dinâmica de sitemap |

#### API Routes (Next.js)
| Rota | Descrição |
|------|-----------|
| `api/health/route.ts` | Health check (status do Medusa, circuit breaker) |
| `api/revalidate/route.ts` | Webhook de revalidação ISR |
| `api/theme-config/route.ts` | GET configuração do tema |
| `api/theme-config/upload/route.ts` | POST upload de configuração |
| `api/contact/route.ts` | Envio de formulário de contato |
| `api/newsletter/route.ts` | Inscrição na newsletter |
| `api/webhooks/luna/route.ts` | Webhook Luna para revalidação ISR |

### 2.2 Componentes (64 componentes)

#### Layout/Globais
- `AnnouncementBar` — barra de avisos no topo
- `Header` — header com logo, navegação, busca, carrinho, conta
- `MegaMenu` — dropdown de categorias
- `MobileMenu` — menu hambúrguer responsivo
- `Footer` — footer com links, redes sociais, pagamento
- `Newsletter` — barra de newsletter
- `BackToTop` — botão voltar ao topo
- `SupportButton` — botão de suporte/WhatsApp
- `CookieConsent` — banner LGPD
- `ThemeStyles` — injeção de CSS dinâmico do tema
- `LocaleSwitcher` — troca de idioma/moeda
- `CartErrorBoundary` — error boundary para o carrinho
- `DegradedBanner` — aviso quando API está em modo degradado
- `Breadcrumb` — navegação de breadcrumb
- `Skeleton` — loading skeleton
- `Toast` — notificações toast
- `Icons` — sistema de ícones

#### Home
- `Slideshow` — banner principal com slides
- `FeaturedCollection` — coleção em destaque
- `Mosaic` — grid de imagens/links
- `BrandShowcase` — vitrine de marcas
- `Offers` — ofertas especiais
- `TextWithIcons` — bloco texto com ícones
- `VideoShowcase` — vitrine de vídeos
- `ImageWithText` — imagem com texto
- `RichText` — texto formatado
- `LogoList` — lista de logos
- `PromotionList` — lista de promoções
- `InfoBar` — barra de informações
- `Video` — player de vídeo
- `DynamicSection` — seção dinâmica renderizada pelo visual editor
- `CollectionList` — lista de coleções

#### Produto
- `ProductGallery` — galeria de imagens com zoom
- `ProductInfo` — preço, variantes, seletores, add to cart
- `ProductTabs` — abas (descrição, specs, reviews)
- `ProductReviews` — listagem e formulário de reviews
- `ProductRecommendations` — produtos recomendados
- `ProductCard` — card de produto (grid/lista)
- `QuickView` — modal de visualização rápida
- `SizeGuide` — guia de tamanhos
- `ShippingCalculator` — calculadora de frete por CEP
- `ShareButtons` — botões de compartilhamento social
- `InstallmentDisplay` — exibição de parcelas
- `ImageUpload` — upload de imagem com drag & drop

#### Carrinho/Checkout
- `MiniCart` — sidebar de carrinho
- `FreeShippingBar` — barra de progresso para frete grátis

#### Conversão/ROAS
- `SocialProof` — popup "X pessoa comprou Y há Z minutos"
- `UrgencyTimer` — countdown de promoção
- `ExitIntent` — popup de saída com cupom VOLTA10
- `StickyAddToCart` — barra fixa de compra no scroll
- `TrustBadges` — selos de segurança/garantia

#### Listagem
- `SortSelect` — seletor de ordenação
- `Pagination` — paginação
- `SearchBar` — barra de busca
- `Wishlist` — ícone/toggle de wishlist
- `RecentlyViewed` — produtos vistos recentemente
- `FaqAccordion` — accordion de FAQ

#### Admin
- `StoreStatus` — indicador de saúde do backend
- `NotificationBadge` — badge de novos pedidos
- `GlobalSearch` — busca global (Ctrl+K)
- `DarkModeToggle` — toggle dark mode
- `ExportData` — exportação CSV
- `ActivityLog` — log de atividades
- `KeyboardShortcuts` — atalhos de teclado (?)
- `EmailPreview` — preview de 3 templates de e-mail

### 2.3 Bibliotecas/Libs (10 arquivos)

| Arquivo | Função |
|---------|--------|
| `medusa-client.ts` | Fetch resiliente com circuit breaker, LRU cache, retry, timeout |
| `medusa.ts` | Types/interfaces (Product, Variant, Collection, Cart, etc.) |
| `circuit-breaker.ts` | State machine: closed → open → half-open |
| `cache/lru-cache.ts` | LRU cache com TTL e stale-while-revalidate |
| `cart-queue.ts` | Fila offline para operações de carrinho |
| `theme-config.ts` | Getter/setter de configuração do tema |
| `wishlist.ts` | Wishlist via localStorage |
| `recently-viewed.ts` | Produtos vistos recentemente via localStorage |
| `blog.ts` | Leitura de posts do blog (JSON estáticos) |
| `utils.ts` | Utilitários (formatMoney, slugify, etc.) |

### 2.4 Contextos (2)

- `CartContext` — gerenciamento de carrinho com error handling e offline queue
- `LocaleContext` — i18n (pt-BR, en, es) + multi-currency (BRL, USD, EUR)

### 2.5 Backend — API Endpoints (55+ endpoints)

#### Store (público)
- `GET /store/products` — listar produtos (com filtros: handle, collection_id, limit, offset)
- `POST /store/products/search` — busca de produtos
- `GET /store/products/:id/reviews` — reviews de um produto
- `POST /store/products/:id/reviews` — enviar review
- `GET /store/collections` — listar coleções (com filtro: ?handle=)
- `POST /store/carts` — criar carrinho
- `GET /store/carts/:id` — obter carrinho
- `POST /store/carts/:id` — atualizar carrinho (endereço)
- `POST /store/carts/:id/line-items` — adicionar item
- `POST /store/carts/:id/line-items/:itemId` — atualizar quantidade
- `DELETE /store/carts/:id/line-items/:itemId` — remover item
- `GET /store/shipping-options/:cartId` — opções de frete
- `POST /store/carts/:id/shipping-methods` — selecionar frete
- `POST /store/carts/:id/payment-sessions` — criar sessão de pagamento
- `POST /store/carts/:id/complete` — finalizar compra
- `POST /store/carts/:id/apply-coupon` — aplicar cupom
- `POST /store/customers` — registrar cliente
- `POST /store/auth` — login
- `POST /store/auth/logout` — logout
- `GET /store/customers/me` — dados do cliente
- `GET /store/customers/me/orders` — pedidos do cliente
- `GET /store/customers/me/addresses` — endereços
- `POST /store/customers/me/addresses` — criar endereço
- `DELETE /store/customers/me/addresses/:id` — remover endereço
- `POST /store/newsletter` — inscrever na newsletter
- `POST /store/contact` — enviar mensagem de contato

#### Admin
- `GET /admin/products` — listar produtos
- `POST /admin/products` — criar produto
- `PUT /admin/products/:id` — atualizar produto
- `DELETE /admin/products/:id` — remover produto
- `POST /admin/collections` — criar coleção
- `PUT /admin/collections/:id` — atualizar coleção
- `DELETE /admin/collections/:id` — remover coleção
- `GET /admin/orders` — listar pedidos
- `PUT /admin/orders/:id` — atualizar status do pedido
- `GET /admin/customers` — listar clientes
- `PUT /admin/customers/:id/tags` — tags de clientes
- `GET /admin/stats` — dashboard KPIs
- `GET /admin/coupons` — listar cupons
- `POST /admin/coupons` — criar cupom
- `DELETE /admin/coupons/:id` — remover cupom
- `GET /admin/shipping-options` — opções de frete
- `POST /admin/shipping-options` — criar opção
- `DELETE /admin/shipping-options/:id` — remover opção
- `GET /admin/redirects` — URL redirects
- `POST /admin/redirects` — criar redirect
- `DELETE /admin/redirects/:id` — remover redirect
- `GET /admin/abandoned-carts` — carrinhos abandonados
- `POST /admin/scrape-product` — scraping de produto (Shopee/ML)
- `POST /admin/import-product` — importar produto
- `POST /admin/scrape-reviews` — scraping de reviews
- `POST /admin/import-reviews` — importar reviews
- `POST /admin/import-reviews/bulk` — importar reviews em massa
- `DELETE /admin/reviews/:id` — remover review

#### Webhooks
- `POST /webhooks/luna` — Luna Checkout (15 eventos)

#### Health
- `GET /health` — health check

### 2.6 Banco de Dados — Prisma (20 modelos)

Product, ProductOption, ProductOptionValue, Variant, ProductImage, Collection, CollectionProduct, Customer, Session, Address, Cart, CartItem, Order, OrderItem, Review, Coupon, ShippingOption, Redirect, NewsletterSubscriber, ContactMessage

### 2.7 Testes (12 unit + 92 integration = 104+)

#### Unit Tests (Storefront — Vitest)
- `blog.test.ts`
- `cart-queue.test.ts`
- `circuit-breaker.test.ts`
- `format-money.test.ts`
- `locale-context.test.ts`
- `lru-cache.test.ts`
- `medusa-client.test.ts`
- `recently-viewed.test.ts`
- `theme-config.test.ts`
- `translations.test.ts`
- `utils.test.ts`
- `wishlist.test.ts`

#### Integration Tests (Backend — Jest/custom)
- `__tests__/api.test.js` — 92 testes cobrindo todos os endpoints

### 2.8 Infraestrutura

- `docker-compose.yml` — 2 serviços (backend + storefront) + volume persistente
- `Dockerfile` (backend) — Node.js + Prisma
- `Dockerfile` (storefront) — Next.js build
- `.github/workflows/ci.yml` — CI com 3 jobs: backend-test, storefront-test, docker-build
- `.env.local` — variáveis de ambiente

### 2.9 Chrome Extension (Review/Product Importer)

- `manifest.json` — Manifest V3, permissions para Shopee/ML
- `content.js` — Content script para scraping de reviews/produtos
- `popup.html` + `popup.js` — UI da extensão

### 2.10 Internacionalização

- 3 locales: pt-BR, en, es
- 3 moedas: BRL, USD, EUR
- 120+ chaves de tradução por idioma
- LocaleContext com fallback chain

### 2.11 Painel Admin (abas)

1. **Dashboard** — KPIs (receita, pedidos, clientes, ticket médio), gráfico de receita, top produtos
2. **Pedidos** — Lista com filtro, timeline de 9 status, atualização de status
3. **Produtos** — CRUD completo, variantes, imagens, opções
4. **Coleções** — CRUD, associação de produtos
5. **Clientes** — Lista, tags de segmentação
6. **Reviews** — Lista, importador (Shopee/ML), aprovação
7. **Importar Reviews** — Bulk import com fotos
8. **Importar Produtos** — Scraping de Shopee/ML
9. **Editor Visual** — Preview desktop/mobile de Home, Produto, Coleção
10. **Cores** — 7 grupos de cores com preview
11. **Tipografia** — Font picker com 20 fontes
12. **Configurações** — Keys do Luna/Stripe, Analytics, SMTP, WhatsApp
13. **Cupons** — CRUD
14. **Frete** — Opções de envio CRUD
15. **Redirects** — URL redirects CRUD

---

## 3. Gap Analysis — O Que Falta vs E-commerce de Produção

### 3.1 CRÍTICO (Bloqueante para lançamento)

| # | Gap | Descrição | Impacto |
|---|-----|-----------|---------|
| G01 | **Admin auth real** | Admin usa password simples em .env, sem login/session real | Segurança |
| G02 | **HTTPS/SSL** | Sem configuração de SSL para produção | Segurança |
| G03 | **Rate limiting no frontend** | Só existe no backend, forms do frontend não têm throttling | Abuso |
| G04 | **CSRF protection** | Nenhuma proteção CSRF nos forms | Segurança |
| G05 | **Input sanitization** | Falta sanitização de HTML/XSS nos inputs (reviews, contato) | Segurança |
| G06 | **Password reset** | Sem funcionalidade de "esqueci minha senha" | UX crítico |
| G07 | **Email transacional** | Nodemailer está como dependência mas sem implementação ativa | Operações |
| G08 | **Inventory management** | Sem decrementar estoque na venda, sem alertas de estoque baixo | Estoque |
| G09 | **Payment gateway completo** | Luna webhook processa eventos mas falta redirect flow real | Pagamento |
| G10 | **Order confirmation page** | Sem página de "pedido confirmado" após checkout | UX |
| G11 | **Error pages** | `not-found.tsx` existe, mas falta `error.tsx` e `loading.tsx` globais | UX |
| G12 | **Mobile responsiveness** | Grid da PDP usa `gridTemplateColumns: "1fr 1fr"` hardcoded | Mobile |
| G13 | **Admin file split** | `admin/theme/page.tsx` tem ~2900 linhas — manutenção impossível | DX |

### 3.2 ALTO (Necessário para produção profissional)

| # | Gap | Descrição |
|---|-----|-----------|
| G14 | **SEO structured data** | Falta JSON-LD (Product, BreadcrumbList, Organization, FAQ) |
| G15 | **~~Sitemap.xml~~** | ~~Sem geração automática de sitemap~~ **EXISTE** (`sitemap.ts`) — verificar completude |
| G16 | **robots.txt** | Sem robots.txt |
| G17 | **Canonical URLs** | Falta tag canonical nas páginas |
| G18 | **Image optimization** | Imagens usam `<img>` em vez de `next/image` em vários componentes |
| G19 | **Product filtering** | Coleções não têm filtros (preço, tamanho, cor) |
| G20 | **Sort by price/name** | SortSelect existe mas precisa verificar se conecta ao backend |
| G21 | **Stock badge** | Sem indicador visual de "últimas unidades" ou "esgotado" |
| G22 | **Variant images** | Galeria não troca ao selecionar variante/cor |
| G23 | **Address autocomplete (CEP)** | Sem integração com ViaCEP para preencher endereço |
| G24 | **Order tracking** | Sem página de rastreamento de pedido |
| G25 | **Shipping calculation real** | Frete é mock, sem integração Correios/Melhor Envio |
| G26 | **Tax calculation** | Sem cálculo de impostos |
| G27 | **Multi-variant create** | Admin não permite criar variantes de forma matricial (cor × tamanho) |
| G28 | **Bulk product operations** | Sem operações em massa (ativar/desativar/deletar múltiplos) |
| G29 | **Order PDF/invoice** | Sem geração de nota fiscal ou recibo |
| G30 | **Analytics real** | Dashboard mostra dados mock, falta GA4/Pixel integration real |
| G31 | **Webhook retry** | Luna webhook não tem retry/dead-letter queue |
| G32 | **API authentication admin** | Endpoints admin não exigem autenticação |
| G33 | **Database backup** | Sem estratégia de backup do SQLite |
| G34 | **Logging structured** | Pino está como dep mas sem uso consistente |

### 3.3 MÉDIO (Melhoria significativa)

| # | Gap | Descrição |
|---|-----|-----------|
| G35 | **PWA/Service Worker** | Sem suporte offline ou install prompt |
| G36 | **Web Vitals monitoring** | Sem tracking de Core Web Vitals |
| G37 | **A/B testing** | Sem infra para testes A/B |
| G38 | **Customer segmentation** | Tags existem mas sem automação de segmentos |
| G39 | **Abandoned cart recovery** | Carrinhos abandonados listados mas sem email de recuperação |
| G40 | **Gift cards** | Modelo `isGiftcard` existe mas sem implementação |
| G41 | **Digital products** | Campo `productType` existe mas sem fluxo de entrega digital |
| G42 | **Product comparisons** | Sem funcionalidade de comparar produtos |
| G43 | **Related by tag** | Recomendações são genéricas, não baseadas em tags/coleção |
| G44 | **Social login** | Sem login via Google/Facebook |
| G45 | **Two-factor auth** | Sem 2FA para admin ou cliente |
| G46 | **CDN/Image service** | Sem CDN para imagens (usando URLs diretas) |
| G47 | **Webhook signature validation** | Luna webhook não valida signature |
| G48 | **E2E tests** | Nenhum teste E2E (Playwright) |
| G49 | **Performance budget** | Sem lighthouse CI ou bundle analysis |
| G50 | **Accessibility (a11y)** | Sem audit de acessibilidade, faltam ARIA labels em muitos componentes |

### 3.4 BAIXO (Nice to have)

| # | Gap | Descrição |
|---|-----|-----------|
| G51 | **Multi-store** | Tema é para uma marca específica, sem multi-tenant |
| G52 | **Product bundles** | Sem kits/combos |
| G53 | **Subscriptions** | Sem modelo de assinatura recorrente |
| G54 | **Loyalty/Points** | Sem programa de fidelidade |
| G55 | **Live chat** | SupportButton é só WhatsApp link |
| G56 | **Product Q&A** | Sem seção de perguntas sobre produto |
| G57 | **Custom checkout fields** | Checkout fixo, sem campos personalizáveis |
| G58 | **Multi-language blog** | Blog só em PT-BR, sem tradução |
| G59 | **Notifications push** | Sem push notifications |
| G60 | **Import/Export CSV** | ExportData existe, mas falta import de CSV |

---

## 4. Arquitetura Atual

```
┌─────────────────────────────────────────────────┐
│                   Browser                        │
│  ┌─────────────┐  ┌──────────┐  ┌────────────┐ │
│  │ Storefront  │  │ Admin    │  │ Chrome Ext │ │
│  │ (Next.js)   │  │ Panel    │  │ (Manifest  │ │
│  │ SSG + ISR   │  │ (React)  │  │  V3)       │ │
│  └──────┬──────┘  └────┬─────┘  └─────┬──────┘ │
└─────────┼──────────────┼───────────────┼────────┘
          │              │               │
     ┌────▼──────────────▼───────────────▼────┐
     │          Express 4 Backend              │
     │  ┌────────────┐  ┌─────────────────┐   │
     │  │ /store/*   │  │ /admin/*        │   │
     │  │ (público)  │  │ (sem auth!)     │   │
     │  └─────┬──────┘  └────────┬────────┘   │
     │        │                  │             │
     │  ┌─────▼──────────────────▼─────────┐  │
     │  │  Prisma 6 ORM (20 modelos)       │  │
     │  └─────────────┬───────────────────┘   │
     │                │                        │
     │  ┌─────────────▼───────────────────┐   │
     │  │  SQLite (dev) → PostgreSQL (prod)│  │
     │  └──────────────────────────────────┘  │
     │                                         │
     │  ┌──────────────────────────────────┐  │
     │  │  /webhooks/luna (15 eventos)     │  │
     │  └──────────────────────────────────┘  │
     └─────────────────────────────────────────┘
          │
     ┌────▼──────────────────┐
     │  Luna Checkout (ext)  │
     └───────────────────────┘

  Resiliência (Storefront):
  ┌──────────────────────────────────┐
  │  Circuit Breaker → LRU Cache    │
  │  → Stale Cache → Fallback JSON  │
  └──────────────────────────────────┘
```

---

## 5. Stack Tecnológico Completo

### Frontend
| Tecnologia | Versão | Uso |
|-----------|--------|-----|
| Next.js | 16.2.1 | Framework SSR/SSG |
| React | 19.2.4 | UI library |
| Tailwind CSS | 4 | Styling |
| Font Awesome | 6.0 | Ícones |
| TypeScript | 5 | Type safety |

### Backend
| Tecnologia | Versão | Uso |
|-----------|--------|-----|
| Express | 4.22.1 | HTTP server |
| Prisma | 6.19.2 | ORM |
| SQLite | — | Database (dev) |
| bcryptjs | 3.0.3 | Password hashing |
| jsonwebtoken | 9.0.3 | JWT auth |
| Zod | 4.3.6 | Input validation |
| Helmet | 8.1.0 | Security headers |
| express-rate-limit | 8.3.1 | Rate limiting |
| Pino | 10.3.1 | Logging |
| Nodemailer | 8.0.4 | Email (não ativo) |
| Stripe | 21.0.0 | Pagamento (não ativo) |

### Testes
| Tecnologia | Uso |
|-----------|-----|
| Vitest | Unit tests (storefront) |
| Testing Library | Component tests |
| jsdom | DOM simulation |

### Infra
| Tecnologia | Uso |
|-----------|-----|
| Docker Compose | Orquestração local/produção |
| GitHub Actions | CI pipeline |

---

## 6. Dados e Modelos

### 6.1 Fluxo de Dados Principal

```
Produto criado no Admin → POST /admin/products → Prisma → SQLite
                                                        ↓
Storefront SSG/ISR → GET /store/products → Express → Prisma → Response
                                                        ↓
                                              Circuit Breaker → LRU Cache
                                                        ↓
                                              Fallback JSON (build time)
```

### 6.2 Fluxo de Checkout

```
Add to Cart → POST /store/carts/:id/line-items
Apply Coupon → POST /store/carts/:id/apply-coupon
Set Address → POST /store/carts/:id (shipping_address)
Select Ship → POST /store/carts/:id/shipping-methods
Init Payment → POST /store/carts/:id/payment-sessions
                    ↓
              Redirect to Luna Checkout
                    ↓
              Luna webhook → POST /webhooks/luna
                    ↓
              Order created → status updated
```

### 6.3 Fluxo de Autenticação

```
Register → POST /store/customers → bcrypt hash → Session created → JWT returned
Login → POST /store/auth → bcrypt compare → Session created → JWT returned
Protected → Authorization: Bearer <token> → middleware authenticate → req.customer
```

---

## 7. Requisitos Não-Funcionais

### 7.1 Performance
- **TTFB** < 200ms (SSG pages)
- **LCP** < 2.5s
- **FID** < 100ms
- **CLS** < 0.1
- **ISR revalidation**: 120s (produtos), 300s (coleções)
- **API timeout**: 5s com 1 retry

### 7.2 Resiliência
- Circuit breaker (5 falhas → open, 30s half-open)
- LRU cache (100 items, 5min TTL, stale serve)
- Fallback JSON gerado no build
- Offline cart queue

### 7.3 Segurança (Estado Atual + Gaps)
- [x] Helmet (security headers)
- [x] Rate limiting (backend)
- [x] bcrypt password hashing
- [x] JWT session management
- [x] CORS configurado
- [ ] CSRF protection
- [ ] Admin endpoint authentication
- [ ] Input sanitization (XSS)
- [ ] Webhook signature validation
- [ ] SSL/HTTPS config

### 7.4 SEO (Estado Atual + Gaps)
- [x] SSG + ISR para todas as páginas de produto/coleção
- [x] `generateMetadata` com title, description, openGraph
- [x] Handles semânticos nos URLs
- [ ] JSON-LD structured data
- [ ] Sitemap.xml
- [ ] robots.txt
- [ ] Canonical URLs
- [ ] Hreflang para multi-idioma

---

## 8. Roadmap de Implementação Sugerido

### Fase 1 — Segurança e Estabilidade (P0)
1. Admin authentication real (login page, JWT sessions)
2. Auth middleware nos endpoints `/admin/*`
3. Input sanitization (DOMPurify ou similar)
4. CSRF tokens nos forms
5. Error pages (`not-found.tsx`, `error.tsx`, `loading.tsx`)
6. Mobile responsiveness (media queries no PDP grid)
7. Refatorar `admin/theme/page.tsx` em módulos menores

### Fase 2 — Checkout e Pagamento (P0)
1. Luna Checkout redirect flow completo
2. Página de confirmação de pedido
3. Webhook signature validation
4. Inventory decrement on sale
5. Password reset flow (email + token)
6. Email transacional (order confirmation, shipping)

### Fase 3 — SEO e Performance (P1)
1. JSON-LD structured data (Product, BreadcrumbList, FAQ)
2. Sitemap.xml automático
3. robots.txt
4. Canonical URLs + hreflang
5. Migrar para `next/image` em todos os componentes
6. Core Web Vitals monitoring

### Fase 4 — UX Avançado (P1)
1. Filtros de coleção (preço, tamanho, cor)
2. Variant image switching
3. ViaCEP auto-complete
4. Stock badges ("últimas unidades", "esgotado")
5. Order tracking page
6. Abandoned cart recovery emails

### Fase 5 — Analytics e Otimização (P2)
1. GA4 + Facebook Pixel integration real
2. Bulk product operations
3. Order PDF/invoice
4. Customer segmentation automation
5. E2E tests com Playwright
6. Performance budget + Lighthouse CI

### Fase 6 — Features Avançadas (P3)
1. Gift cards
2. Digital products delivery
3. PWA / Service Worker
4. Social login (Google/Facebook)
5. Product Q&A
6. A/B testing infra

---

## 9. Métricas de Sucesso

| Métrica | Target |
|---------|--------|
| Lighthouse Performance | > 90 |
| Lighthouse SEO | > 95 |
| Lighthouse Accessibility | > 90 |
| TTFB (SSG pages) | < 200ms |
| Unit test coverage | > 80% |
| E2E test coverage | Critical flows |
| Uptime | 99.9% |
| Admin operations/day | Suportar 1000+ |
| Concurrent users | 500+ |

---

## 10. Decisões Arquiteturais Registradas

| ADR | Decisão | Motivo |
|-----|---------|--------|
| ADR-001 | Express 4 (não 5) | Express 5.2.1 tinha bug com route params |
| ADR-002 | Prisma 6 (não 7) | Prisma 7 exigia adapter/accelerateUrl incompatível |
| ADR-003 | SQLite dev → PostgreSQL prod | Simplicidade no dev, robustez em prod |
| ADR-004 | Luna Checkout (não Stripe) | Preferência do owner para mercado BR |
| ADR-005 | Admin embutido no storefront | Simplicidade de deploy, single app |
| ADR-006 | Fallback JSON no build | Resiliência quando backend está offline |
| ADR-007 | Circuit breaker pattern | Evitar cascade failure quando API cai |
| ADR-008 | LocalStorage para wishlist/recently | Sem necessidade de auth para features de UX |
| ADR-009 | Blog estático (JSON) | Simplicidade, sem necessidade de CMS |
| ADR-010 | Theme config via JSON | Facilidade de edição no visual editor |

---

## Apêndice A — Variáveis de Ambiente

```env
# Storefront
NEXT_PUBLIC_MEDUSA_BACKEND_URL=http://localhost:7800
NEXT_PUBLIC_SITE_URL=http://localhost:3000
THEME_ADMIN_PASSWORD=admin123
REVALIDATION_SECRET=ua-revalidate-secret-2026

# Backend
PORT=9000
DATABASE_URL=file:./prisma/dev.db
JWT_SECRET=ua-store-jwt-secret-2026
STORE_URL=http://localhost:3000
```

## Apêndice B — Estrutura de Diretórios

```
underarmour-store/
├── .github/workflows/ci.yml
├── docker-compose.yml
├── backend/
│   ├── server.js              (55+ endpoints, ~1350 linhas)
│   ├── seed.js                (dados iniciais)
│   ├── package.json
│   ├── Dockerfile
│   ├── prisma/
│   │   └── schema.prisma      (20 modelos)
│   └── __tests__/
│       └── api.test.js        (92 integration tests)
├── storefront2/
│   ├── src/
│   │   ├── app/               (20 páginas)
│   │   ├── components/        (64 componentes)
│   │   ├── context/           (2 providers)
│   │   ├── lib/               (10 módulos)
│   │   ├── data/              (config, locales, blog, fallback)
│   │   ├── styles/            (CSS global)
│   │   └── __tests__/         (12 unit tests)
│   ├── package.json
│   ├── Dockerfile
│   └── .env.local
└── review-importer-extension/
    ├── manifest.json
    ├── content.js
    ├── popup.html
    └── popup.js
```
