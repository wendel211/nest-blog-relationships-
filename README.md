# NestJS Blog - Relacionamentos e Regras de Negócio

Projeto completo em NestJS demonstrando relacionamentos TypeORM (1:N e N:N), DTOs aninhados, joins, cascades e validações avançadas.

## 📋 Índice

1. [Visão Geral](#visão-geral)
2. [Arquitetura](#arquitetura)
3. [Entidades e Relacionamentos](#entidades-e-relacionamentos)
4. [Instalação](#instalação)
5. [Configuração do Banco de Dados](#configuração-do-banco-de-dados)
6. [Executando o Projeto](#executando-o-projeto)
7. [Endpoints da API](#endpoints-da-api)
8. [Exemplos de Uso](#exemplos-de-uso)
9. [Conceitos Demonstrados](#conceitos-demonstrados)

## 🎯 Visão Geral

Este projeto implementa um sistema de blog completo com:

- **Usuários**: Gerenciamento de autores do blog
- **Posts**: Artigos com suporte a categorias
- **Comentários**: Sistema de comentários com aprovação
- **Categorias**: Tags para organização de posts

## 🏗️ Arquitetura

O projeto segue a arquitetura modular do NestJS com separação clara de responsabilidades:

```
src/
├── users/              # Módulo de usuários
│   ├── user.entity.ts
│   ├── users.service.ts
│   ├── users.controller.ts
│   ├── users.module.ts
│   └── dto/
├── posts/              # Módulo de posts
│   ├── post.entity.ts
│   ├── posts.service.ts
│   ├── posts.controller.ts
│   ├── posts.module.ts
│   └── dto/
├── comments/           # Módulo de comentários
│   ├── comment.entity.ts
│   ├── comments.service.ts
│   ├── comments.controller.ts
│   ├── comments.module.ts
│   └── dto/
├── categories/         # Módulo de categorias
│   ├── category.entity.ts
│   ├── categories.service.ts
│   ├── categories.controller.ts
│   ├── categories.module.ts
│   └── dto/
├── app.module.ts
└── main.ts
```

## 🔗 Entidades e Relacionamentos

### User (Usuário)

```typescript
@Entity('users')
export class User {
  id: string;              // UUID
  email: string;           // Único
  name: string;
  bio: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  
  // Relacionamentos
  posts: Post[];           // 1:N com Posts
  comments: Comment[];     // 1:N com Comments
}
```

**Relacionamento 1:N com Posts**: Um usuário pode ter múltiplos posts
**Relacionamento 1:N com Comments**: Um usuário pode ter múltiplos comentários

### Post (Artigo)

```typescript
@Entity('posts')
export class Post {
  id: string;              // UUID
  title: string;
  slug: string;            // Único
  content: string;
  excerpt: string;
  published: boolean;
  viewCount: number;
  publishedAt: Date;
  createdAt: Date;
  updatedAt: Date;
  authorId: string;
  
  // Relacionamentos
  author: User;            // N:1 com User
  comments: Comment[];     // 1:N com Comments
  categories: Category[];  // N:N com Categories
}
```

**Relacionamento N:1 com User**: Vários posts pertencem a um autor
**Relacionamento 1:N com Comments**: Um post pode ter vários comentários
**Relacionamento N:N com Categories**: Posts podem ter múltiplas categorias

### Comment (Comentário)

```typescript
@Entity('comments')
export class Comment {
  id: string;              // UUID
  content: string;
  isApproved: boolean;
  createdAt: Date;
  updatedAt: Date;
  authorId: string;
  postId: string;
  
  // Relacionamentos
  author: User;            // N:1 com User
  post: Post;              // N:1 com Post
}
```

**Relacionamento N:1 com User**: Vários comentários pertencem a um autor
**Relacionamento N:1 com Post**: Vários comentários pertencem a um post

### Category (Categoria)

```typescript
@Entity('categories')
export class Category {
  id: string;              // UUID
  name: string;            // Único
  slug: string;            // Único
  description: string;
  createdAt: Date;
  updatedAt: Date;
  
  // Relacionamentos
  posts: Post[];           // N:N com Posts
}
```

**Relacionamento N:N com Posts**: Categorias podem estar em múltiplos posts

### Diagrama de Relacionamentos

```
┌─────────┐      1:N      ┌──────┐      1:N      ┌──────────┐
│  User   │──────────────▶│ Post │──────────────▶│ Comment  │
└─────────┘               └──────┘               └──────────┘
     │                        │                        │
     │                        │ N:N                    │
     │                        │                        │
     │                        ▼                        │
     │                   ┌──────────┐                 │
     │                   │ Category │                 │
     │                   └──────────┘                 │
     │                                                 │
     └─────────────────────1:N────────────────────────┘
```

## 📦 Instalação

```bash
# Clone o repositório
git clone <repository-url>
cd nest-blog-relationships-

# Instale as dependências
npm install
```

## 🗄️ Configuração do Banco de Dados

### Opção 1: PostgreSQL Local

1. Instale o PostgreSQL
2. Crie um banco de dados:

```sql
CREATE DATABASE blog_db;
```

3. Configure as variáveis de ambiente (crie um arquivo `.env`):

```env
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_DATABASE=blog_db
```

### Opção 2: PostgreSQL com Docker

```bash
docker run --name postgres-blog \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=blog_db \
  -p 5432:5432 \
  -d postgres:15
```

## 🚀 Executando o Projeto

```bash
# Desenvolvimento
npm run start:dev

# Produção
npm run build
npm run start:prod
```

A aplicação estará rodando em `http://localhost:3000`

## 📡 Endpoints da API

**Nota:** Todos os endpoints de listagem suportam paginação através dos parâmetros de query `page` e `limit`.

### Parâmetros de Paginação

Todos os endpoints de listagem (`GET`) aceitam os seguintes parâmetros opcionais:

- `page` - Número da página (padrão: 1, mínimo: 1)
- `limit` - Quantidade de itens por página (padrão: 10, mínimo: 1, máximo: 100)

**Exemplo de uso:**
```bash
curl "http://localhost:3000/users?page=1&limit=20"
```

**Formato de resposta paginada:**
```json
{
  "data": [...],
  "meta": {
    "total": 100,
    "page": 1,
    "limit": 10,
    "totalPages": 10,
    "hasNextPage": true,
    "hasPreviousPage": false
  }
}
```

### Usuários

- `POST /users` - Criar usuário
- `GET /users?page=1&limit=10` - Listar todos os usuários (paginado)
- `GET /users/:id` - Buscar usuário por ID
- `PATCH /users/:id` - Atualizar usuário
- `DELETE /users/:id` - Deletar usuário (soft delete)

### Posts

- `POST /posts` - Criar post
- `GET /posts?page=1&limit=10` - Listar todos os posts (paginado)
- `GET /posts/published?page=1&limit=10` - Listar posts publicados (paginado)
- `GET /posts/:id` - Buscar post por ID
- `PATCH /posts/:id` - Atualizar post
- `PUT /posts/:id/view` - Incrementar visualizações
- `DELETE /posts/:id` - Deletar post

### Comentários

- `POST /comments` - Criar comentário
- `GET /comments?page=1&limit=10` - Listar todos os comentários (paginado)
- `GET /comments/approved?page=1&limit=10` - Listar comentários aprovados (paginado)
- `GET /comments/post/:postId?page=1&limit=10` - Buscar comentários de um post (paginado)
- `GET /comments/:id` - Buscar comentário por ID
- `PATCH /comments/:id` - Atualizar comentário
- `PUT /comments/:id/approve` - Aprovar comentário
- `DELETE /comments/:id` - Deletar comentário

### Categorias

- `POST /categories` - Criar categoria
- `GET /categories?page=1&limit=10` - Listar todas as categorias (paginado)
- `GET /categories/:id` - Buscar categoria por ID
- `PATCH /categories/:id` - Atualizar categoria
- `DELETE /categories/:id` - Deletar categoria

## 💡 Exemplos de Uso

### 1. Criar um Usuário

```bash
curl -X POST http://localhost:3000/users \
  -H "Content-Type: application/json" \
  -d '{
    "email": "joao@example.com",
    "name": "João Silva",
    "bio": "Desenvolvedor apaixonado por tecnologia"
  }'
```

**Resposta:**
```json
{
  "id": "uuid-do-usuario",
  "email": "joao@example.com",
  "name": "João Silva",
  "bio": "Desenvolvedor apaixonado por tecnologia",
  "isActive": true,
  "createdAt": "2024-01-01T10:00:00.000Z",
  "updatedAt": "2024-01-01T10:00:00.000Z",
  "posts": [],
  "comments": []
}
```

### 2. Listar Usuários com Paginação

```bash
# Listar primeira página com 10 usuários
curl "http://localhost:3000/users?page=1&limit=10"

# Listar segunda página com 20 usuários
curl "http://localhost:3000/users?page=2&limit=20"
```

**Resposta (com paginação):**
```json
{
  "data": [
    {
      "id": "uuid-1",
      "email": "joao@example.com",
      "name": "João Silva",
      "posts": [],
      "comments": []
    }
  ],
  "meta": {
    "total": 100,
    "page": 1,
    "limit": 10,
    "totalPages": 10,
    "hasNextPage": true,
    "hasPreviousPage": false
  }
}
```

### 3. Criar Categorias

```bash
curl -X POST http://localhost:3000/categories \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Web Development",
    "slug": "web-development",
    "description": "Articles about web development"
  }'

curl -X POST http://localhost:3000/categories \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Node.js",
    "slug": "nodejs",
    "description": "Node.js related content"
  }'
```

### 4. Criar um Post com Categorias (DTO Aninhado)

```bash
curl -X POST http://localhost:3000/posts \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Introdução ao NestJS",
    "slug": "introducao-ao-nestjs",
    "content": "NestJS é um framework progressivo para construir aplicações Node.js eficientes e escaláveis...",
    "excerpt": "Aprenda os conceitos básicos do NestJS",
    "published": true,
    "authorId": "uuid-do-usuario",
    "categoryIds": ["uuid-categoria-1", "uuid-categoria-2"]
  }'
```

### 5. Listar Posts Publicados com Paginação

```bash
# Buscar primeira página de posts publicados
curl "http://localhost:3000/posts/published?page=1&limit=5"
```

**Resposta:**
```json
{
  "data": [
    {
      "id": "uuid-do-post",
      "title": "Introdução ao NestJS",
      "published": true,
      "author": {
        "id": "uuid-autor",
        "name": "João Silva"
      },
      "categories": [...]
    }
  ],
  "meta": {
    "total": 25,
    "page": 1,
    "limit": 5,
    "totalPages": 5,
    "hasNextPage": true,
    "hasPreviousPage": false
  }
}
```

### 6. Criar um Comentário

```bash
curl -X POST http://localhost:3000/comments \
  -H "Content-Type: application/json" \
  -d '{
    "content": "Excelente artigo! Muito didático.",
    "postId": "uuid-do-post",
    "authorId": "uuid-do-usuario"
  }'
```

### 7. Aprovar um Comentário

```bash
curl -X PUT http://localhost:3000/comments/{comment-id}/approve
```

### 8. Buscar Post com Todos os Relacionamentos (Join)

```bash
curl http://localhost:3000/posts/{post-id}
```

**Resposta (exemplo com joins):**
```json
{
  "id": "uuid-do-post",
  "title": "Introdução ao NestJS",
  "slug": "introducao-ao-nestjs",
  "content": "...",
  "published": true,
  "viewCount": 42,
  "author": {
    "id": "uuid-do-usuario",
    "name": "João Silva",
    "email": "joao@example.com"
  },
  "categories": [
    {
      "id": "uuid-categoria-1",
      "name": "Web Development",
      "slug": "web-development"
    },
    {
      "id": "uuid-categoria-2",
      "name": "Node.js",
      "slug": "nodejs"
    }
  ],
  "comments": [
    {
      "id": "uuid-comentario",
      "content": "Excelente artigo!",
      "isApproved": true,
      "author": {
        "id": "uuid-do-usuario",
        "name": "Maria Santos"
      }
    }
  ]
}
```

## 🎓 Conceitos Demonstrados

### 1. Relacionamentos TypeORM

#### Relacionamento 1:N (One-to-Many)

**Exemplo: User → Posts**

```typescript
// No lado "One" (User)
@OneToMany(() => Post, (post) => post.author, { cascade: true })
posts: Post[];

// No lado "Many" (Post)
@ManyToOne(() => User, (user) => user.posts, { onDelete: 'CASCADE' })
@JoinColumn({ name: 'authorId' })
author: User;
```

**Explicação:**
- `cascade: true` - Ao salvar/atualizar user, posts relacionados também são salvos
- `onDelete: 'CASCADE'` - Ao deletar user, posts relacionados também são deletados
- `@JoinColumn` - Cria coluna `authorId` na tabela posts

#### Relacionamento N:N (Many-to-Many)

**Exemplo: Post ↔ Categories**

```typescript
// No lado proprietário (Post)
@ManyToMany(() => Category, (category) => category.posts, { cascade: true })
@JoinTable({
  name: 'post_categories',
  joinColumn: { name: 'postId', referencedColumnName: 'id' },
  inverseJoinColumn: { name: 'categoryId', referencedColumnName: 'id' },
})
categories: Category[];

// No lado inverso (Category)
@ManyToMany(() => Post, (post) => post.categories)
posts: Post[];
```

**Explicação:**
- `@JoinTable` - Cria tabela intermediária `post_categories`
- Apenas um lado deve ter `@JoinTable`
- `cascade: true` - Permite salvar categorias junto com o post

### 2. DTOs Aninhados

**CreatePostDto com categoryIds:**

```typescript
export class CreatePostDto {
  title: string;
  slug: string;
  content: string;
  authorId: string;
  
  @IsArray()
  @IsUUID('4', { each: true })
  categoryIds?: string[]; // DTO aninhado - array de IDs
}
```

**No serviço:**

```typescript
async create(createPostDto: CreatePostDto): Promise<Post> {
  // Busca categorias pelos IDs
  const categories = await this.categoriesService.findByIds(
    createPostDto.categoryIds
  );
  
  // Cria post com categorias associadas
  const post = this.postsRepository.create({
    ...createPostDto,
    categories, // Relacionamento N:N
  });
  
  return this.postsRepository.save(post);
}
```

### 3. Joins e Query Builder

**Buscar posts com todos os relacionamentos:**

```typescript
async findAll(): Promise<Post[]> {
  return this.postsRepository
    .createQueryBuilder('post')
    .leftJoinAndSelect('post.author', 'author')      // Join com User
    .leftJoinAndSelect('post.categories', 'category') // Join com Categories
    .leftJoinAndSelect('post.comments', 'comment')    // Join com Comments
    .orderBy('post.createdAt', 'DESC')
    .getMany();
}
```

**Joins com filtros:**

```typescript
async findPublished(): Promise<Post[]> {
  return this.postsRepository
    .createQueryBuilder('post')
    .leftJoinAndSelect('post.author', 'author')
    .where('post.published = :published', { published: true })
    .andWhere('author.isActive = :isActive', { isActive: true })
    .getMany();
}
```

### 4. Validações Avançadas

**class-validator decorators:**

```typescript
export class CreateUserDto {
  @IsEmail({}, { message: 'Please provide a valid email address' })
  @IsNotEmpty()
  email: string;

  @IsString()
  @MinLength(2, { message: 'Name must be at least 2 characters long' })
  @MaxLength(50, { message: 'Name must not exceed 50 characters' })
  name: string;
}

export class CreateCategoryDto {
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
    message: 'Slug must be lowercase with hyphens only'
  })
  slug: string;
}
```

**ValidationPipe global (main.ts):**

```typescript
app.useGlobalPipes(
  new ValidationPipe({
    whitelist: true,              // Remove propriedades não decoradas
    forbidNonWhitelisted: true,   // Lança erro se propriedade extra for enviada
    transform: true,              // Transforma para instância DTO
    transformOptions: {
      enableImplicitConversion: true, // Converte tipos automaticamente
    },
  }),
);
```

### 5. Regras de Negócio

**Exemplo 1: Email único**
```typescript
async create(createUserDto: CreateUserDto): Promise<User> {
  const existingUser = await this.usersRepository.findOne({
    where: { email: createUserDto.email },
  });

  if (existingUser) {
    throw new ConflictException('Email already exists');
  }
  // ...
}
```

**Exemplo 2: Autor deve estar ativo**
```typescript
async create(createPostDto: CreatePostDto): Promise<Post> {
  const author = await this.usersService.findOne(createPostDto.authorId);
  
  if (!author.isActive) {
    throw new BadRequestException('Author account is not active');
  }
  // ...
}
```

**Exemplo 3: Comentários apenas em posts publicados**
```typescript
async create(createCommentDto: CreateCommentDto): Promise<Comment> {
  const post = await this.postsService.findOne(createCommentDto.postId);
  
  if (!post.published) {
    throw new BadRequestException('Cannot comment on unpublished posts');
  }
  // ...
}
```

**Exemplo 4: Soft delete**
```typescript
async remove(id: string): Promise<void> {
  const user = await this.findOne(id);
  user.isActive = false; // Soft delete - não remove do banco
  await this.usersRepository.save(user);
}
```

### 6. Cascade Operations

**Save cascade:**
```typescript
const user = new User();
user.posts = [post1, post2]; // Com cascade: true
await userRepository.save(user); // Salva user e posts automaticamente
```

**Remove cascade:**
```typescript
await userRepository.remove(user); // Remove user e posts (onDelete: CASCADE)
```

## 🔍 Estrutura das Tabelas no Banco

### users
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY,
  email VARCHAR(100) UNIQUE,
  name VARCHAR(50),
  bio TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

### posts
```sql
CREATE TABLE posts (
  id UUID PRIMARY KEY,
  title VARCHAR(200),
  slug VARCHAR(250) UNIQUE,
  content TEXT,
  excerpt TEXT,
  published BOOLEAN DEFAULT false,
  view_count INTEGER DEFAULT 0,
  published_at TIMESTAMP,
  created_at TIMESTAMP,
  updated_at TIMESTAMP,
  author_id UUID REFERENCES users(id) ON DELETE CASCADE
);
```

### comments
```sql
CREATE TABLE comments (
  id UUID PRIMARY KEY,
  content TEXT,
  is_approved BOOLEAN DEFAULT true,
  created_at TIMESTAMP,
  updated_at TIMESTAMP,
  author_id UUID REFERENCES users(id) ON DELETE CASCADE,
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE
);
```

### categories
```sql
CREATE TABLE categories (
  id UUID PRIMARY KEY,
  name VARCHAR(50) UNIQUE,
  slug VARCHAR(50) UNIQUE,
  description TEXT,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

### post_categories (tabela de junção N:N)
```sql
CREATE TABLE post_categories (
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  category_id UUID REFERENCES categories(id) ON DELETE CASCADE,
  PRIMARY KEY (post_id, category_id)
);
```

## 📝 Boas Práticas Implementadas

1. **Separação de responsabilidades**: Controllers, Services, Entities, DTOs
2. **Validação em camadas**: DTOs com class-validator + business rules nos services
3. **Tratamento de erros**: Exceções customizadas (NotFoundException, ConflictException, etc.)
4. **Código documentado**: Comentários explicativos em entidades e relacionamentos
5. **TypeScript strict**: Tipagem forte em todo o projeto
6. **RESTful API**: Endpoints seguindo convenções REST
7. **Relacionamentos bem definidos**: Uso correto de @JoinColumn, @JoinTable, cascade, eager
8. **Query optimization**: Uso de QueryBuilder para queries complexas
9. **Soft delete**: Preservação de dados através de flag isActive

## 🎯 Próximos Passos (Sugestões)

- [ ] Implementar autenticação JWT
- [x] Adicionar paginação nos endpoints de listagem
- [ ] Implementar migrations ao invés de synchronize
- [ ] Adicionar testes unitários e E2E
- [ ] Implementar cache com Redis
- [ ] Adicionar upload de imagens para posts
- [ ] Implementar busca full-text
- [ ] Adicionar rate limiting
- [ ] Documentação com Swagger/OpenAPI

## 📄 Licença

MIT