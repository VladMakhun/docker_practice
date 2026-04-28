## Student
- Name: Vlad Makhun
- Group: 232.1

## Практичне заняття №5 — JWT Authentication + Guards + RBAC

### Структура репозиторію
├── src/
│   ├── auth/
│   │   ├── dto/
│   │   │   ├── register.dto.ts
│   │   │   └── login.dto.ts
│   │   ├── auth.module.ts
│   │   ├── auth.service.ts
│   │   └── auth.controller.ts
│   ├── users/
│   │   ├── user.entity.ts
│   │   ├── users.module.ts
│   │   └── users.service.ts
│   ├── common/
│   │   ├── enums/
│   │   │   └── role.enum.ts
│   │   ├── guards/
│   │   │   ├── jwt-auth.guard.ts
│   │   │   └── roles.guard.ts
│   │   ├── decorators/
│   │   │   ├── current-user.decorator.ts
│   │   │   └── roles.decorator.ts
│   │   └── pipes/
│   │       └── trim.pipe.ts
│   ├── categories/
│   ├── products/
│   ├── migrations/
│   ├── data-source.ts
│   ├── main.ts
│   └── app.module.ts
├── Dockerfile
├── docker-compose.yml
└── README.md

### Запуск проекту
```bash
cp .env.example .env
docker compose up --build

Method,URL,Auth,Role
POST,/auth/register,-,-
POST,/auth/login,-,-
GET,/api/categories,-,-
POST,/api/categories,JWT,admin
GET,/api/products,-,-
POST,/api/products,JWT,admin
PATCH,/api/products/:id,JWT,admin
DELETE,/api/products/:id,JWT,admin

### Тест реєстрації
```text
<вивід curl POST /auth/register>
```
 
### Тест логіну
```text
<"accessToken":  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjEsImVtYWlsIjoidmxhZEBleGFtcGxlLmNvbSIsInJvbGUiOiJ1c2VyIiwiaWF0IjoxNzc2NzgxOTI3LCJleHAiOjE3NzY3ODU1Mjd9.BJ0U_sVRyflE9-zEtBNyKlRjQExjCOGlJVMviD0xOEA">
```
 
### Тест 401 — запит без токена
```text
<>
```
 
### Тест 403 — запит з роллю user
```text
<try {
>>     $response = Invoke-RestMethod -Uri http://localhost:3000/api/products -Method Post -Headers $headers -ContentType "application/json" -Body '{"name": "Test Role Access", "price": 50}'
>>     Write-Host "Успіх! Статус: 201 Created"
>> } catch {
>>     Write-Host "Помилка! Статус: " $_.Exception.Response.StatusCode.value__
>> }
Помилка! Статус:  403>
```
 
### Тест успішного створення від admin
```text
<вив
