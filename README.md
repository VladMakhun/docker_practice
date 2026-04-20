## Student
- Name: Vlad Makhun
- Group: 232.1

## Практичне заняття №4 — DTO + class-validator + Pipes

### Структура репозиторію
```text
.
├── src/
│   ├── categories/
│   │   ├── dto/
│   │   │   ├── create-category.dto.ts
│   │   │   └── update-category.dto.ts
│   │   ├── category.entity.ts
│   │   ├── categories.module.ts
│   │   ├── categories.service.ts
│   │   └── categories.controller.ts
│   ├── products/
│   │   ├── dto/
│   │   │   ├── create-product.dto.ts
│   │   │   └── update-product.dto.ts
│   │   ├── product.entity.ts
│   │   ├── products.module.ts
│   │   ├── products.service.ts
│   │   └── products.controller.ts
│   ├── common/
│   │   └── pipes/
│   │       └── trim.pipe.ts
│   ├── migrations/
│   ├── data-source.ts
│   ├── main.ts
│   └── app.module.ts
├── Dockerfile
├── docker-compose.yml
└── README.md

Запуск проекту

cp .env.example .env
docker compose up --build

Тест валідації — порожнє ім'я категорії
# Команда:
Invoke-RestMethod -Uri http://localhost:3000/api/categories -Method Post -Body '{"name": ""}' -ContentType "application/json"

# Вивід:
{"message":["name must be longer than or equal to 2 characters"],"error":"Bad Request","statusCode":400}

Тест валідації — від'ємна ціна продукту
# Команда:
Invoke-RestMethod -Uri http://localhost:3000/api/products -Method Post -Body '{"name": "Test", "price": -5}' -ContentType "application/json"

# Вивід:
{"message":["price must be a positive number"],"error":"Bad Request","statusCode":400}

Тест валідації — зайве поле
# Команда:
Invoke-RestMethod -Uri http://localhost:3000/api/categories -Method Post -Body '{"name": "Test", "isAdmin": true}' -ContentType "application/json"

# Вивід:
{"message":["property isAdmin should not exist"],"error":"Bad Request","statusCode":400}

Тест TrimPipe
# Команда:
$json = @{ name = "  Trimmed  " } | ConvertTo-Json
Invoke-RestMethod -Uri http://localhost:3000/api/categories -Method Post -Body $json -ContentType "application/json"

# Вивід (після GET-запиту):
{"id": 1, "name": "Trimmed", ...}

Тест валідне створення продукту
# Команда:
$json = @{ name = "iPhone 15"; price = 999; stock = 10; categoryId = 1 } | ConvertTo-Json
Invoke-RestMethod -Uri http://localhost:3000/api/products -Method Post -Body $json -ContentType "application/json"

# Вивід:
{"id": 1, "name": "iPhone 15", "price": 999, ...}

