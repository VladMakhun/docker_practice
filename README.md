## Student
- Name: Vlad Makhun
- Group: <232.1>

## Практичне заняття №3 — CRUD REST API для MiniShop

---

## Опис проекту
Це REST API для міні-магазину, розроблений з використанням **NestJS**, **PostgreSQL** та **Redis**.

Реалізовано:
- CRUD для категорій (Categories)
- CRUD для продуктів (Products)
- Зв'язок між продуктами та категоріями (ManyToOne)
- Кешування через Redis
- Docker-оточення

---

## Структура репозиторію

├── src/
│ ├── categories/
│ │ ├── category.entity.ts
│ │ ├── categories.module.ts
│ │ ├── categories.service.ts
│ │ └── categories.controller.ts
│ ├── products/
│ │ ├── product.entity.ts
│ │ ├── products.module.ts
│ │ ├── products.service.ts
│ │ └── products.controller.ts
│ ├── migrations/
│ │ ├── 1700000001-CreateTables.ts
│ │ └── 1775204479172-AddIsActiveToProducts.ts
│ ├── data-source.ts
│ └── app.module.ts
├── Dockerfile
├── docker-compose.yml
└── README.md


---

## Запуск проекту

```bash
cp .env.example .env
docker compose up --build

Після запуску:

API доступний на: http://localhost:3000
Categories: http://localhost:3000/api/categories
Products: http://localhost:3000/api/products

API Endpoints
Categories
| Method | URL                 | Опис               |
| ------ | ------------------- | ------------------ |
| GET    | /api/categories     | Список категорій   |
| GET    | /api/categories/:id | Одна категорія     |
| POST   | /api/categories     | Створити категорію |
| PATCH  | /api/categories/:id | Оновити категорію  |
| DELETE | /api/categories/:id | Видалити категорію |

Products
| Method | URL               | Опис             |
| ------ | ----------------- | ---------------- |
| GET    | /api/products     | Список продуктів |
| GET    | /api/products/:id | Один продукт     |
| POST   | /api/products     | Створити продукт |
| PATCH  | /api/products/:id | Оновити продукт  |
| DELETE | /api/products/:id | Видалити продукт |


### Перевірка міграцій
```text
<вивід docker compose exec postgres psql -U nestuser -d nestdb -c "\dt">
```
 
### Тест створення категорії
```text
curl -X POST http://localhost:3000/api/categories \
-H "Content-Type: application/json" \
-d '{"name":"Electronics","description":"Gadgets and devices"}'```
 
### Тест створення продукту
```text
curl -X POST http://localhost:3000/api/products \
-H "Content-Type: application/json" \
-d '{"name":"iPhone 15","price":999.99,"stock":50,"categoryId":1}'```
 
### Тест отримання продуктів
```text
curl http://localhost:3000/api/products```
 
### Тест 404
```text
curl http://localhost:3000/api/products/999```

