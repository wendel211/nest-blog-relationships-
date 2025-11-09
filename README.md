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

- **Autenticação JWT**: Sistema completo de autenticação com registro, login e proteção de rotas
- **Usuários**: Gerenciamento de autores do blog
- **Posts**: Artigos com suporte a categorias
- **Comentários**: Sistema de comentários com aprovação
- **Categorias**: Tags para organização de posts

## 🏗️ Arquitetura

O projeto segue a arquitetura modular do NestJS com separação clara de responsabilidades:

```
src/
├── auth/                # Módulo de autenticação (JWT)
│   ├── auth.service.ts
│   ├── auth.controller.ts
│   ├── auth.module.ts
│   ├── strategies/
│   │   └── jwt.strategy.ts
│   ├── guards/
│   │   └── jwt-auth.guard.ts
│   ├── decorators/
│   │   └── current-user.decorator.ts
│   └── dto/
│       ├── login.dto.ts
│       └── register.dto.ts
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
  password: string;        // Hash bcrypt (select: false)
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

# JWT Configuration
JWT_SECRET=your-very-secure-secret-key-change-this-in-production
JWT_EXPIRES_IN=1d
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

### 🔐 Autenticação

- `POST /auth/register` - Registrar novo usuário
- `POST /auth/login` - Login (retorna JWT token)
- `GET /auth/profile` - Obter perfil do usuário autenticado 🔒

> 🔒 = Requer autenticação JWT (Bearer token)

### Usuários

- `POST /users` - Criar usuário
- `GET /users` - Listar todos os usuários
- `GET /users/:id` - Buscar usuário por ID
- `PATCH /users/:id` - Atualizar usuário
- `DELETE /users/:id` - Deletar usuário (soft delete)

### Posts

- `POST /posts` - Criar post 🔒
- `GET /posts` - Listar todos os posts
- `GET /posts/published` - Listar posts publicados
- `GET /posts/:id` - Buscar post por ID
- `PATCH /posts/:id` - Atualizar post 🔒
- `PUT /posts/:id/view` - Incrementar visualizações
- `DELETE /posts/:id` - Deletar post 🔒

### Comentários

- `POST /comments` - Criar comentário 🔒
- `GET /comments` - Listar todos os comentários
- `GET /comments/approved` - Listar comentários aprovados
- `GET /comments/post/:postId` - Buscar comentários de um post
- `GET /comments/:id` - Buscar comentário por ID
- `PATCH /comments/:id` - Atualizar comentário
- `PUT /comments/:id/approve` - Aprovar comentário 🔒
- `DELETE /comments/:id` - Deletar comentário 🔒

### Categorias

- `POST /categories` - Criar categoria
- `GET /categories` - Listar todas as categorias
- `GET /categories/:id` - Buscar categoria por ID
- `PATCH /categories/:id` - Atualizar categoria
- `DELETE /categories/:id` - Deletar categoria

## 💡 Exemplos de Uso

### 🔐 Autenticação

#### 1. Registrar um Novo Usuário

```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "joao@example.com",
    "password": "senha123",
    "name": "João Silva",
    "bio": "Desenvolvedor apaixonado por tecnologia"
  }'
```

**Resposta:**
```json
{
  "user": {
    "id": "uuid-do-usuario",
    "email": "joao@example.com",
    "name": "João Silva",
    "bio": "Desenvolvedor apaixonado por tecnologia",
    "isActive": true,
    "createdAt": "2024-01-01T10:00:00.000Z",
    "updatedAt": "2024-01-01T10:00:00.000Z"
  },
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### 2. Fazer Login

```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "joao@example.com",
    "password": "senha123"
  }'
```

**Resposta:**
```json
{
  "user": {
    "id": "uuid-do-usuario",
    "email": "joao@example.com",
    "name": "João Silva",
    "bio": "Desenvolvedor apaixonado por tecnologia",
    "isActive": true
  },
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### 3. Acessar Perfil do Usuário (Rota Protegida)

```bash
curl -X GET http://localhost:3000/auth/profile \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**Resposta:**
```json
{
  "user": {
    "id": "uuid-do-usuario",
    "email": "joao@example.com",
    "name": "João Silva",
    "bio": "Desenvolvedor apaixonado por tecnologia",
    "isActive": true
  }
}
```

### 📝 CRUD Operations

#### 4. Criar um Usuário (Método Alternativo)

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

#### 5. Criar Categorias

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

### 3. Criar um Post com Categorias (DTO Aninhado + Autenticação)

```bash
# Salve o token JWT em uma variável
TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

curl -X POST http://localhost:3000/posts \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
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

### 4. Criar um Comentário (Requer Autenticação)

```bash
curl -X POST http://localhost:3000/comments \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "content": "Excelente artigo! Muito didático.",
    "postId": "uuid-do-post",
    "authorId": "uuid-do-usuario"
  }'
```

### 5. Aprovar um Comentário (Requer Autenticação)

```bash
curl -X PUT http://localhost:3000/comments/{comment-id}/approve \
  -H "Authorization: Bearer $TOKEN"
```

### 6. Buscar Post com Todos os Relacionamentos (Join)

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

### 1. Autenticação JWT (JSON Web Tokens)

#### Configuração do JWT Module

```typescript
JwtModule.register({
  secret: process.env.JWT_SECRET || 'your-secret-key-change-this',
  signOptions: {
    expiresIn: '1d', // Token expira em 1 dia
  },
})
```

#### JWT Strategy com Passport

```typescript
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'your-secret-key-change-this',
    });
  }

  async validate(payload: JwtPayload): Promise<User> {
    const user = await this.usersRepository.findOne({
      where: { id: payload.sub, isActive: true },
    });

    if (!user) {
      throw new UnauthorizedException('User not found or inactive');
    }

    return user; // Anexado automaticamente ao request.user
  }
}
```

**Explicação:**
- `ExtractJwt.fromAuthHeaderAsBearerToken()` - Extrai token do header Authorization
- `validate()` - Método chamado automaticamente após validação do token
- Retorna objeto do usuário que é anexado à requisição

#### Hash de Senhas com bcrypt

```typescript
// Registrar usuário
const salt = await bcrypt.genSalt(10);
const hashedPassword = await bcrypt.hash(password, salt);

// Login - validar senha
const isPasswordValid = await bcrypt.compare(password, hashedPassword);
```

**Explicação:**
- `genSalt(10)` - Gera salt com 10 rounds (balanceio entre segurança e performance)
- `hash()` - Cria hash irreversível da senha
- `compare()` - Compara senha em texto plano com hash

#### Protegendo Rotas com Guards

```typescript
@Controller('posts')
export class PostsController {
  // Rota pública
  @Get()
  findAll() {
    return this.postsService.findAll();
  }

  // Rota protegida - requer JWT
  @Post()
  @UseGuards(JwtAuthGuard)
  create(@Body() createPostDto: CreatePostDto, @CurrentUser() user: User) {
    return this.postsService.create(createPostDto);
  }
}
```

**Explicação:**
- `@UseGuards(JwtAuthGuard)` - Protege a rota com autenticação JWT
- `@CurrentUser()` - Decorator customizado para obter usuário autenticado
- Retorna 401 Unauthorized se token inválido ou ausente

#### Custom Decorator para Usuário Atual

```typescript
export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): User => {
    const request = ctx.switchToHttp().getRequest();
    return request.user; // Injetado pelo JwtStrategy
  },
);
```

**Uso:**
```typescript
@Get('profile')
@UseGuards(JwtAuthGuard)
getProfile(@CurrentUser() user: User) {
  return { user };
}
```

#### Validação de DTOs com class-validator

```typescript
export class RegisterDto {
  @IsEmail({}, { message: 'Please provide a valid email address' })
  @IsNotEmpty()
  email: string;

  @IsString()
  @MinLength(6, { message: 'Password must be at least 6 characters long' })
  @MaxLength(100, { message: 'Password must not exceed 100 characters' })
  password: string;
}
```

**Explicação:**
- Validação automática antes de chegar ao controller
- Mensagens de erro customizadas
- ValidationPipe global ativa no main.ts

#### Campo Password com select: false

```typescript
@Entity('users')
export class User {
  @Column({ select: false })
  password: string; // Não retornado em queries por padrão
}

// Para obter password em query específica:
const user = await this.usersRepository
  .createQueryBuilder('user')
  .addSelect('user.password') // Explicitamente incluir
  .where('user.email = :email', { email })
  .getOne();
```

**Explicação:**
- `select: false` - Previne exposição acidental de senhas
- Requer seleção explícita quando necessário (ex: login)

### 2. Relacionamentos TypeORM

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

### 3. DTOs Aninhados

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

### 4. Joins e Query Builder

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

### 5. Validações Avançadas

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

### 6. Regras de Negócio

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

### 7. Cascade Operations

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
  password VARCHAR(255),
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

- [x] Implementar autenticação JWT ✅
- [ ] Adicionar paginação nos endpoints de listagem
- [ ] Implementar migrations ao invés de synchronize
- [ ] Adicionar testes unitários e E2E
- [ ] Implementar cache com Redis
- [ ] Adicionar upload de imagens para posts
- [ ] Implementar busca full-text
- [ ] Adicionar rate limiting
- [ ] Documentação com Swagger/OpenAPI

## 📄 Licença

MIT