## Student
- Name: Vlad Makhun
- Group: <232.1>

## MiniShop API — Фінальний проєкт

REST API інтернет-магазину на NestJS + PostgreSQL + Redis.

### Технології
- NestJS + TypeScript
- PostgreSQL + TypeORM (міграції, QueryBuilder)
- Redis (кешування з інвалідацією)
- JWT автентифікація + RBAC авторизація
- class-validator + class-transformer
- Swagger / OpenAPI

### Запуск
```bash
cp .env.example .env
docker compose up --build
docker compose run --rm app npm run seed

### Swagger UI
http://localhost:3000/api/docs

API Endpoints 

Method,URL,Auth,Опис
POST,/auth/register,-,Реєстрація
POST,/auth/login,-,Логін → JWT

Categories
Method,URL,Auth,Опис
GET,/api/categories,-,Список
GET,/api/categories/:id,-,Одна
POST,/api/categories,admin,Створити
PATCH,/api/categories/:id,admin,Оновити
DELETE,/api/categories/:id,admin,Видалити


Products
Method,URL,Auth,Опис
GET,/api/products,-,Список + pagination + filter
GET,/api/products/:id,-,Один
POST,/api/products,admin,Створити
PATCH,/api/products/:id,admin,Оновити
DELETE,/api/products/:id,admin,Видалити

Orders
Method,URL,Auth,Опис
POST,/api/orders,user,Створити замовлення
GET,/api/orders,user,Мої / Всі (admin)
GET,/api/orders/:id,user,Одне (ownership)
PATCH,/api/orders/:id/status,admin,Змінити статус
DELETE,/api/orders/:id,admin,Видалити

### Тест створення замовлення

{
  "id": 1,
  "totalPrice": 1250,
  "status": "pending",
  "user": {
    "id": 2,
    "email": "alice@test.com",
    "name": "Alice"
  },
  "items": [
    {
      "id": 1,
      "quantity": 2,
      "price": 500
    },
    {
      "id": 2,
      "quantity": 1,
      "price": 250
    }
  ],
  "createdAt": "2026-05-18T14:30:00.000Z"
}

### Тест ownership (403)

{
  "statusCode": 403,
  "message": "You can only view your own orders",
  "error": "Forbidden"
}

### Тест зміни статусу

{
  "id": 1,
  "totalPrice": 1250,
  "status": "confirmed",
  "createdAt": "2026-05-18T14:30:00.000Z"
}

### Тест insufficient stock

{
  "statusCode": 400,
  "message": "Недостатньо товару \"Смартфон\" на складі: доступно 5, запитувано 99999",
  "error": "Bad Request"
}







