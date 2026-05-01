## Student
- Name: Vlad Makhun
- Group: 232.1

## Практичне заняття №7 — Redis + Pagination + Filtering

### Структура репозиторію
├── src/
│   ├── products/
│   │   ├── dto/
│   │   │   └── product-query.dto.ts # Валідація параметрів пошуку
│   ├── seeds/
│   │   └── seed.ts                  # Скрипт заповнення бази даними
│   ├── common/
│   │   ├── interceptors/            # Трансформація та логування відповідей
│   │   └── filters/                 # Обробка помилок та traceId
├── Dockerfile
├── docker-compose.yml
└── README.md

### Запуск проекту
```bash
cp .env.example .env
docker compose up --build
docker compose run --rm app npm run seed

API: GET /api/products
Ендпоінт підтримує складну фільтрацію, сортування та пагінацію. Всі параметри валідуються через class-validator.

Параметр,Тип,Default,Опис
page,number,1,Номер сторінки
pageSize,number,10,Елементів на сторінку (max 100)
sort,string,createdAt,Поле сортування
order,asc/desc,desc,Напрямок (ASC або DESC)
categoryId,number,-,Фільтр за категорією
minPrice,number,-,Мінімальна ціна
maxPrice,number,-,Максимальна ціна
search,string,-,Пошук за назвою (ILIKE)

Swagger UI
Доступний за адресою: http://localhost:3000/api/docs

Тест пагінації (5 елементів на сторінці)
Запит: GET /api/products?page=1&pageSize=5

{
  "data": {
    "items": [
      { "id": 33, "name": "Hoodie NestJS v3", "price": "75", "categoryId": 3 },
      { "id": 32, "name": "T-Shirt Dev v3", "price": "45", "categoryId": 3 },
      { "id": 31, "name": "Laptop Sleeve v3", "price": "69", "categoryId": 2 },
      { "id": 30, "name": "MagSafe Charger v3", "price": "59", "categoryId": 2 },
      { "id": 29, "name": "USB-C Cable v3", "price": "39", "categoryId": 2 }
    ],
    "meta": {
      "total": 33,
      "page": 1,
      "pageSize": 5,
      "totalPages": 7
    }
  },
  "statusCode": 200,
  "timestamp": "2026-05-01T12:13:10.091Z"
}

Тест фільтрації (Категорія + Ціна)
Запит: GET /api/products?categoryId=1&minPrice=500
Результат: Повертає лише товари з категорії Electronics (ID: 1), ціна яких вища за 500 (наприклад, iPhone, MacBook).

Тест пошуку
Запит: GET /api/products?search=mac
Результат: Повертає всі товари, що містять "mac" у назві (наприклад, MacBook Pro, MacBook Pro v2).

Тест кешування (Redis)
Перевірка наявності ключів у Redis після запиту:

docker exec -it redis_cache redis-cli KEYS "products:*"
# Вивід:
1) "products:{\"page\":1,\"pageSize\":5}"

Тест інвалідації кешу
До створення продукту: KEYS "products:*" повертає список активних кешів.

Дія: Виконуємо POST /api/products (створення нового товару).

Після створення: KEYS "products:*" повертає (empty array). Кеш успішно очищено для забезпечення актуальності даних.

Формат помилки (Validation)
Якщо pageSize перевищує 100:

{
  "error": {
    "code": 400,
    "message": "Validation failed",
    "details": ["pageSize must not be greater than 100"]
  },
  "timestamp": "2026-05-01T12:20:00.000Z"
}