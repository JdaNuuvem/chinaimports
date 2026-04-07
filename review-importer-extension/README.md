# UA Review Importer — Extensão Chrome

Importa avaliações com fotos da Shopee e Mercado Livre para sua loja Under Armour.

## Instalação

1. Abra `chrome://extensions/` no Chrome
2. Ative o **Modo do desenvolvedor** (canto superior direito)
3. Clique em **Carregar sem compactação**
4. Selecione esta pasta (`review-importer-extension/`)

## Como usar

1. Navegue até uma página de produto na **Shopee** ou **Mercado Livre**
2. Role até a seção de avaliações e aguarde carregar
3. Clique no ícone da extensão (UA) na barra do Chrome
4. Configure:
   - **Servidor da loja**: URL do backend (padrão: `http://localhost:9500`)
   - **Produto destino**: ID do produto na sua loja (opcional — se vazio, usa o primeiro produto)
   - **Incluir fotos**: Sim/Não
5. Clique em **🔍 Extrair Avaliações**
6. Revise o preview dos reviews extraídos
7. Clique em **📥 Importar para a Loja**

## APIs do Backend

- `POST /admin/import-reviews` — Importa 1 review
- `POST /admin/import-reviews/bulk` — Importa array de reviews
- `POST /store/products/:id/reviews` — Adiciona review a produto específico

## Campos importados

| Campo | Descrição |
|-------|-----------|
| rating | 1-5 estrelas |
| title | Título (ou primeiros 60 chars do conteúdo) |
| body | Texto completo do review |
| author | Nome do autor |
| images | Array de URLs das fotos |
| source | "shopee" ou "mercadolivre" |
| sourceUrl | URL original do produto |
| originalDate | Data original da avaliação |

## Sites suportados

- ✅ Shopee Brasil (shopee.com.br)
- ✅ Mercado Livre (mercadolivre.com.br)
