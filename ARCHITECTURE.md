# Arquitetura e Conceitos - NestJS Blog

## 📚 Índice de Conceitos

1. [Arquitetura em Camadas](#arquitetura-em-camadas)
2. [Relacionamentos TypeORM](#relacionamentos-typeorm)
3. [DTOs e Validações](#dtos-e-validações)
4. [Joins e Query Builder](#joins-e-query-builder)
5. [Cascades](#cascades)
6. [Regras de Negócio](#regras-de-negócio)

---

## Arquitetura em Camadas

### Estrutura de Módulos

Cada recurso (Users, Posts, Comments, Categories) segue a mesma estrutura:

```
resource/
├── resource.entity.ts      # Entidade TypeORM (modelo do banco)
├── resource.module.ts      # Módulo NestJS (agrupa tudo)
├── resource.service.ts     # Lógica de negócio
├── resource.controller.ts  # Endpoints HTTP
└── dto/
    ├── create-resource.dto.ts  # DTO para criação
    └── update-resource.dto.ts  # DTO para atualização
```

### Fluxo de uma Requisição

```
Cliente (HTTP Request)
    ↓
Controller (valida e roteia)
    ↓
Service (aplica regras de negócio)
    ↓
Repository (acessa banco de dados)
    ↓
TypeORM (executa SQL)
    ↓
PostgreSQL
```

---

## Relacionamentos TypeORM

### 1. Relacionamento 1:N (One-to-Many / Many-to-One)

**Exemplo: User → Posts**

Um usuário pode ter vários posts, mas cada post pertence a apenas um usuário.

```typescript
// User Entity (lado "One")
@Entity()
export class User {
  @OneToMany(() => Post, (post) => post.author, { cascade: true })
  posts: Post[];
}

// Post Entity (lado "Many")
@Entity()
export class Post {
  @ManyToOne(() => User, (user) => user.posts, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'authorId' })
  author: User;
  
  @Column()
  authorId: string;
}
```

**Conceitos importantes:**

- `@OneToMany` no lado "pai" (User)
- `@ManyToOne` no lado "filho" (Post)
- `@JoinColumn` cria a coluna de foreign key
- `authorId` é a coluna física no banco
- `cascade: true` permite salvar posts ao salvar user
- `onDelete: 'CASCADE'` deleta posts ao deletar user

**No banco de dados:**

```sql
-- Tabela posts
CREATE TABLE posts (
  id UUID PRIMARY KEY,
  title VARCHAR,
  author_id UUID REFERENCES users(id) ON DELETE CASCADE
  -- outros campos...
);
```

### 2. Relacionamento N:N (Many-to-Many)

**Exemplo: Posts ↔ Categories**

Um post pode ter várias categorias, e uma categoria pode estar em vários posts.

```typescript
// Post Entity (lado proprietário)
@Entity()
export class Post {
  @ManyToMany(() => Category, (category) => category.posts, { cascade: true })
  @JoinTable({
    name: 'post_categories',
    joinColumn: { name: 'postId', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'categoryId', referencedColumnName: 'id' },
  })
  categories: Category[];
}

// Category Entity (lado inverso)
@Entity()
export class Category {
  @ManyToMany(() => Post, (post) => post.categories)
  posts: Post[];
}
```

**Conceitos importantes:**

- `@ManyToMany` em ambos os lados
- `@JoinTable` apenas em um lado (define tabela de junção)
- Tabela intermediária `post_categories` é criada automaticamente
- `cascade: true` permite salvar categorias ao salvar post

**No banco de dados:**

```sql
-- Tabela de junção (criada automaticamente)
CREATE TABLE post_categories (
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  category_id UUID REFERENCES categories(id) ON DELETE CASCADE,
  PRIMARY KEY (post_id, category_id)
);
```

---

## DTOs e Validações

### O que são DTOs?

DTOs (Data Transfer Objects) são objetos que definem como os dados serão enviados pela rede.

### Validações com class-validator

```typescript
import { IsEmail, IsNotEmpty, MinLength, MaxLength } from 'class-validator';

export class CreateUserDto {
  // Valida formato de email
  @IsEmail({}, { message: 'Email inválido' })
  @IsNotEmpty()
  email: string;

  // Valida tamanho da string
  @MinLength(2, { message: 'Nome muito curto' })
  @MaxLength(50, { message: 'Nome muito longo' })
  name: string;
}
```

### DTOs Aninhados

DTOs podem conter referências a outras entidades:

```typescript
export class CreatePostDto {
  title: string;
  content: string;
  authorId: string;  // Referência ao User
  
  @IsArray()
  @IsUUID('4', { each: true })
  categoryIds?: string[];  // Array de IDs (DTO aninhado)
}
```

**Como processar no Service:**

```typescript
async create(createPostDto: CreatePostDto): Promise<Post> {
  // Buscar categorias pelos IDs
  const categories = await this.categoriesService.findByIds(
    createPostDto.categoryIds
  );
  
  // Criar post com as categorias associadas
  const post = this.postsRepository.create({
    ...createPostDto,
    categories,  // Relacionamento N:N
  });
  
  return this.postsRepository.save(post);
}
```

### ValidationPipe Global

Configurado em `main.ts`:

```typescript
app.useGlobalPipes(
  new ValidationPipe({
    whitelist: true,              // Remove propriedades não decoradas
    forbidNonWhitelisted: true,   // Erro se propriedade extra enviada
    transform: true,              // Transforma para instância DTO
    transformOptions: {
      enableImplicitConversion: true, // Converte tipos automaticamente
    },
  }),
);
```

---

## Joins e Query Builder

### Por que usar Joins?

Sem joins, você faria múltiplas queries:

```typescript
// ❌ Ruim: N+1 queries
const posts = await this.postsRepository.find();
for (const post of posts) {
  post.author = await this.usersRepository.findOne(post.authorId);
  post.categories = await this.categoriesRepository.find(...);
}
```

Com joins, você faz apenas 1 query:

```typescript
// ✅ Bom: 1 query com joins
const posts = await this.postsRepository
  .createQueryBuilder('post')
  .leftJoinAndSelect('post.author', 'author')
  .leftJoinAndSelect('post.categories', 'category')
  .leftJoinAndSelect('post.comments', 'comment')
  .getMany();
```

### Tipos de Joins

- `leftJoinAndSelect`: Carrega a relação (mais comum)
- `leftJoin`: Apenas junta, sem carregar
- `innerJoinAndSelect`: Apenas registros com relação

### Exemplo Completo com Filtros

```typescript
async findPublished(): Promise<Post[]> {
  return this.postsRepository
    .createQueryBuilder('post')
    .leftJoinAndSelect('post.author', 'author')
    .leftJoinAndSelect('post.categories', 'category')
    .where('post.published = :published', { published: true })
    .andWhere('author.isActive = :isActive', { isActive: true })
    .orderBy('post.publishedAt', 'DESC')
    .getMany();
}
```

**SQL gerado:**

```sql
SELECT 
  post.*, 
  author.*, 
  category.*
FROM posts post
LEFT JOIN users author ON author.id = post.author_id
LEFT JOIN post_categories pc ON pc.post_id = post.id
LEFT JOIN categories category ON category.id = pc.category_id
WHERE post.published = true 
  AND author.is_active = true
ORDER BY post.published_at DESC;
```

---

## Cascades

### O que são Cascades?

Cascades propagam operações de uma entidade para suas relações.

### Tipos de Cascade

```typescript
{
  cascade: true,           // Todos os tipos
  cascade: ['insert'],     // Apenas insert
  cascade: ['update'],     // Apenas update
  cascade: ['remove'],     // Apenas remove
}
```

### Cascade Save

```typescript
// User entity
@OneToMany(() => Post, post => post.author, { cascade: true })
posts: Post[];

// Uso no service
const user = new User();
user.name = "João";
user.posts = [post1, post2];

await this.usersRepository.save(user);
// ✅ Salva user E posts automaticamente
```

### Cascade Delete (onDelete)

Configurado na foreign key:

```typescript
@ManyToOne(() => User, user => user.posts, { onDelete: 'CASCADE' })
@JoinColumn({ name: 'authorId' })
author: User;
```

Opções:

- `CASCADE`: Deleta registros relacionados
- `SET NULL`: Define FK como NULL
- `RESTRICT`: Impede deleção se houver relações
- `NO ACTION`: Padrão do banco

### Eager vs Lazy Loading

```typescript
// Eager: sempre carrega a relação
@OneToMany(() => Post, post => post.author, { eager: true })
posts: Post[];

// Lazy: só carrega se solicitado
@OneToMany(() => Post, post => post.author, { eager: false })
posts: Post[];
```

**Recomendação:** Use `eager: false` e carregue com joins quando necessário.

---

## Regras de Negócio

### 1. Validação de Unicidade

```typescript
async create(createUserDto: CreateUserDto): Promise<User> {
  // Regra: Email deve ser único
  const existing = await this.usersRepository.findOne({
    where: { email: createUserDto.email },
  });

  if (existing) {
    throw new ConflictException('Email already exists');
  }

  return this.usersRepository.save(
    this.usersRepository.create(createUserDto)
  );
}
```

### 2. Validação de Estado

```typescript
async create(createCommentDto: CreateCommentDto): Promise<Comment> {
  // Regra: Apenas posts publicados podem receber comentários
  const post = await this.postsService.findOne(createCommentDto.postId);
  
  if (!post.published) {
    throw new BadRequestException('Cannot comment on unpublished posts');
  }

  // Regra: Autor deve estar ativo
  const author = await this.usersService.findOne(createCommentDto.authorId);
  
  if (!author.isActive) {
    throw new BadRequestException('Author account is not active');
  }

  return this.commentsRepository.save(...);
}
```

### 3. Soft Delete

Ao invés de deletar, desativa:

```typescript
async remove(id: string): Promise<void> {
  const user = await this.findOne(id);
  
  // Soft delete - preserva dados
  user.isActive = false;
  await this.usersRepository.save(user);
  
  // Ao invés de:
  // await this.usersRepository.remove(user);
}
```

### 4. Campos Automáticos

```typescript
async create(createPostDto: CreatePostDto): Promise<Post> {
  const post = this.postsRepository.create({
    ...createPostDto,
    // Regra: Se publicado, definir data de publicação
    publishedAt: createPostDto.published ? new Date() : null,
    viewCount: 0, // Inicializar contador
  });

  return this.postsRepository.save(post);
}
```

### 5. Validações em Cadeia

```typescript
async update(id: string, updatePostDto: UpdatePostDto): Promise<Post> {
  const post = await this.findOne(id);

  // Validar slug único se estiver mudando
  if (updatePostDto.slug && updatePostDto.slug !== post.slug) {
    const existing = await this.postsRepository.findOne({
      where: { slug: updatePostDto.slug },
    });
    
    if (existing) {
      throw new ConflictException('Slug already exists');
    }
  }

  // Validar categorias se fornecidas
  if (updatePostDto.categoryIds) {
    const categories = await this.categoriesService.findByIds(
      updatePostDto.categoryIds
    );
    
    if (categories.length !== updatePostDto.categoryIds.length) {
      throw new BadRequestException('Invalid category IDs');
    }
    
    post.categories = categories;
  }

  Object.assign(post, updatePostDto);
  return this.postsRepository.save(post);
}
```

---

## Exceções HTTP

### Tipos Comuns

```typescript
// 400 - Bad Request
throw new BadRequestException('Invalid data');

// 404 - Not Found
throw new NotFoundException('User not found');

// 409 - Conflict
throw new ConflictException('Email already exists');

// 403 - Forbidden
throw new ForbiddenException('Access denied');

// 401 - Unauthorized
throw new UnauthorizedException('Invalid credentials');
```

### Tratamento Automático

NestJS converte exceções em respostas HTTP:

```typescript
throw new NotFoundException('User not found');

// Resposta HTTP:
{
  "statusCode": 404,
  "message": "User not found",
  "error": "Not Found"
}
```

---

## Boas Práticas Implementadas

### 1. Separação de Responsabilidades

- **Controller**: Recebe requisições, valida entrada
- **Service**: Lógica de negócio, regras
- **Repository**: Acesso a dados
- **DTO**: Validação e transformação

### 2. Injeção de Dependências

```typescript
@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(Post)
    private readonly postsRepository: Repository<Post>,
    private readonly usersService: UsersService,
    private readonly categoriesService: CategoriesService,
  ) {}
}
```

### 3. Async/Await

```typescript
// ✅ Sempre use async/await
async findOne(id: string): Promise<Post> {
  return await this.postsRepository.findOne({ where: { id } });
}

// ❌ Evite callbacks
findOne(id: string, callback: Function) {
  this.postsRepository.findOne(...).then(callback);
}
```

### 4. TypeScript Strict

- Tipagem forte em todos os lugares
- Interfaces para objetos complexos
- Enums para valores fixos

### 5. Documentação no Código

```typescript
/**
 * Create a new post with categories
 * 
 * Business Rules:
 * - Author must exist and be active
 * - Slug must be unique
 * - Published posts must have publishedAt date
 */
async create(createPostDto: CreatePostDto): Promise<Post> {
  // ...
}
```

---

## Próximos Passos

Para evoluir este projeto:

1. **Autenticação JWT**: Proteger endpoints
2. **Autorização**: Controle de acesso (RBAC)
3. **Paginação**: Limitar resultados de listagem
4. **Migrations**: Versionamento do schema do banco
5. **Testes**: Unitários e E2E
6. **Cache**: Redis para otimizar consultas
7. **Upload de Arquivos**: Imagens para posts
8. **Swagger**: Documentação automática da API
9. **Rate Limiting**: Proteção contra abuso
10. **Logging**: Monitoramento e debugging

---

## Recursos de Aprendizado

- [Documentação NestJS](https://docs.nestjs.com/)
- [TypeORM Documentation](https://typeorm.io/)
- [class-validator](https://github.com/typestack/class-validator)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
