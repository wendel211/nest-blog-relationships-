# Guia de Testes - NestJS Blog API

Este documento descreve como testar todos os recursos da API do blog.

## Pré-requisitos

1. PostgreSQL rodando (via Docker ou local)
2. Aplicação iniciada: `npm run start:dev`

## Estrutura de Testes

### 1. Testes de Usuários

#### Criar Usuário
```bash
curl -X POST http://localhost:3000/users \
  -H "Content-Type: application/json" \
  -d '{
    "email": "joao@example.com",
    "name": "João Silva",
    "bio": "Desenvolvedor apaixonado por tecnologia"
  }'
```

**Esperado:** Status 201, retorna usuário com ID gerado

#### Listar Todos os Usuários
```bash
curl http://localhost:3000/users
```

**Esperado:** Array com todos os usuários e suas relações (posts, comments)

#### Buscar Usuário por ID
```bash
curl http://localhost:3000/users/{user-id}
```

#### Atualizar Usuário
```bash
curl -X PATCH http://localhost:3000/users/{user-id} \
  -H "Content-Type: application/json" \
  -d '{
    "name": "João Silva Atualizado",
    "bio": "Senior Developer"
  }'
```

#### Testar Validação - Email Inválido
```bash
curl -X POST http://localhost:3000/users \
  -H "Content-Type: application/json" \
  -d '{
    "email": "email-invalido",
    "name": "Test"
  }'
```

**Esperado:** Status 400, mensagem de erro de validação

#### Testar Regra de Negócio - Email Duplicado
```bash
# Tente criar usuário com email existente
curl -X POST http://localhost:3000/users \
  -H "Content-Type: application/json" \
  -d '{
    "email": "joao@example.com",
    "name": "Outro Usuario"
  }'
```

**Esperado:** Status 409 (Conflict), mensagem "Email already exists"

### 2. Testes de Categorias

#### Criar Categorias
```bash
# Categoria 1
curl -X POST http://localhost:3000/categories \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Web Development",
    "slug": "web-development",
    "description": "Articles about web development"
  }'

# Categoria 2
curl -X POST http://localhost:3000/categories \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Node.js",
    "slug": "nodejs",
    "description": "Node.js related content"
  }'
```

#### Listar Categorias
```bash
curl http://localhost:3000/categories
```

#### Testar Validação - Slug Inválido
```bash
curl -X POST http://localhost:3000/categories \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test",
    "slug": "Invalid Slug With Spaces",
    "description": "Test"
  }'
```

**Esperado:** Status 400, erro de validação (slug deve ser lowercase com hífens)

### 3. Testes de Posts (Relacionamento N:N com Categorias)

#### Criar Post com Múltiplas Categorias (DTO Aninhado)
```bash
curl -X POST http://localhost:3000/posts \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Introdução ao NestJS",
    "slug": "introducao-ao-nestjs",
    "content": "NestJS é um framework progressivo para construir aplicações Node.js eficientes e escaláveis.",
    "excerpt": "Aprenda os conceitos básicos do NestJS",
    "published": true,
    "authorId": "{user-id}",
    "categoryIds": ["{category-id-1}", "{category-id-2}"]
  }'
```

**Esperado:** 
- Status 201
- Post retornado com array de categorias preenchido (relacionamento N:N)
- Campo `publishedAt` preenchido automaticamente

#### Listar Todos os Posts (com Joins)
```bash
curl http://localhost:3000/posts
```

**Esperado:** Posts com author, categories e comments carregados via joins

#### Buscar Post por ID (com Todos os Relacionamentos)
```bash
curl http://localhost:3000/posts/{post-id}
```

**Esperado:** Post completo com:
- Author (relacionamento N:1)
- Categories (relacionamento N:N)
- Comments com seus autores (relacionamento 1:N aninhado)

#### Buscar Apenas Posts Publicados
```bash
curl http://localhost:3000/posts/published
```

**Esperado:** Apenas posts com `published: true` e de autores ativos

#### Incrementar Contador de Visualizações
```bash
curl -X PUT http://localhost:3000/posts/{post-id}/view
```

**Esperado:** Post retornado com `viewCount` incrementado

#### Testar Regra de Negócio - Autor Inativo
```bash
# Primeiro, desative um usuário
curl -X PATCH http://localhost:3000/users/{user-id} \
  -H "Content-Type: application/json" \
  -d '{"isActive": false}'

# Tente criar post com esse autor
curl -X POST http://localhost:3000/posts \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test",
    "slug": "test",
    "content": "Test content",
    "authorId": "{inactive-user-id}",
    "categoryIds": []
  }'
```

**Esperado:** Status 400, mensagem "Author account is not active"

### 4. Testes de Comentários

#### Criar Comentário
```bash
curl -X POST http://localhost:3000/comments \
  -H "Content-Type: application/json" \
  -d '{
    "content": "Excelente artigo! Muito didático.",
    "postId": "{post-id}",
    "authorId": "{user-id}"
  }'
```

**Esperado:**
- Status 201
- Comentário retornado com `isApproved: false` (requer aprovação)
- Relacionamentos com author e post preenchidos

#### Listar Comentários Aprovados
```bash
curl http://localhost:3000/comments/approved
```

**Esperado:** Apenas comentários com `isApproved: true`

#### Buscar Comentários por Post
```bash
curl http://localhost:3000/comments/post/{post-id}
```

**Esperado:** Comentários aprovados do post específico

#### Aprovar Comentário
```bash
curl -X PUT http://localhost:3000/comments/{comment-id}/approve
```

**Esperado:** Comentário com `isApproved: true`

#### Testar Regra de Negócio - Comentar em Post Não Publicado
```bash
# Criar post não publicado
curl -X POST http://localhost:3000/posts \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Draft Post",
    "slug": "draft-post",
    "content": "Draft content",
    "published": false,
    "authorId": "{user-id}",
    "categoryIds": []
  }'

# Tentar comentar
curl -X POST http://localhost:3000/comments \
  -H "Content-Type: application/json" \
  -d '{
    "content": "Comment on draft",
    "postId": "{draft-post-id}",
    "authorId": "{user-id}"
  }'
```

**Esperado:** Status 400, mensagem "Cannot comment on unpublished posts"

## Testes de Relacionamentos e Cascades

### Teste de Cascade Delete

1. Crie um usuário, post e comentário
2. Delete o post:
```bash
curl -X DELETE http://localhost:3000/posts/{post-id}
```

3. Verifique que os comentários foram deletados automaticamente (cascade)

### Teste de Soft Delete

1. Delete um usuário:
```bash
curl -X DELETE http://localhost:3000/users/{user-id}
```

2. Busque o usuário:
```bash
curl http://localhost:3000/users/{user-id}
```

**Esperado:** Usuário ainda existe mas com `isActive: false`

## Verificação do Banco de Dados

### Ver Tabelas Criadas
```bash
docker exec blog-postgres psql -U postgres -d blog_db -c "\dt"
```

**Esperado:**
- users
- posts
- comments
- categories
- post_categories (tabela de junção N:N)

### Verificar Estrutura da Tabela de Junção
```bash
docker exec blog-postgres psql -U postgres -d blog_db -c "\d post_categories"
```

**Esperado:**
- Chave primária composta (postId, categoryId)
- Foreign keys para posts e categories
- ON DELETE CASCADE configurado

### Ver Dados
```bash
docker exec blog-postgres psql -U postgres -d blog_db -c "SELECT * FROM users;"
docker exec blog-postgres psql -U postgres -d blog_db -c "SELECT * FROM posts;"
docker exec blog-postgres psql -U postgres -d blog_db -c "SELECT * FROM post_categories;"
```

## Testes de Performance

### Query com Múltiplos Joins
```bash
curl http://localhost:3000/posts/{post-id}
```

Verifique no log da aplicação:
- Quantidade de queries executadas
- Se os joins estão otimizados (deve ser 1 query com LEFT JOIN)

## Checklist de Validações Testadas

- [x] Email válido (@IsEmail)
- [x] Campos obrigatórios (@IsNotEmpty)
- [x] Tamanho de strings (@MinLength, @MaxLength)
- [x] Formato de slug (@Matches)
- [x] UUIDs válidos (@IsUUID)
- [x] Arrays de UUIDs (@IsUUID com each: true)
- [x] Whitelist (propriedades extras são removidas)
- [x] ForbidNonWhitelisted (erro se propriedade extra for enviada)

## Checklist de Regras de Negócio Testadas

- [x] Email único
- [x] Slug único
- [x] Autor ativo para criar posts
- [x] Post publicado para receber comentários
- [x] Comentários requerem aprovação
- [x] Soft delete de usuários
- [x] Cascade delete de posts → comentários
- [x] publishedAt automático ao publicar

## Checklist de Relacionamentos Testados

- [x] 1:N - User → Posts
- [x] 1:N - User → Comments
- [x] 1:N - Post → Comments
- [x] N:1 - Posts → User
- [x] N:1 - Comments → User
- [x] N:1 - Comments → Post
- [x] N:N - Posts ↔ Categories
- [x] Joins funcionando corretamente
- [x] Cascade save funcionando
- [x] Cascade delete funcionando
- [x] DTO aninhado com categoryIds

## Resultados Esperados

Todos os testes devem passar, demonstrando:

1. ✅ Relacionamentos 1:N funcionando
2. ✅ Relacionamentos N:N funcionando
3. ✅ DTOs aninhados funcionando
4. ✅ Validações avançadas funcionando
5. ✅ Regras de negócio implementadas
6. ✅ Cascades configurados corretamente
7. ✅ Joins otimizados com QueryBuilder
8. ✅ Tabelas criadas corretamente pelo TypeORM
