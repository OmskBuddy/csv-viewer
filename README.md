# CSV Viewer

Высокопроизводительное приложение для просмотра и поиска в CSV файлах (поддержка 10^5 - 10^6 строк).

## Технологии

- **Backend**: Node.js + Express
- **Frontend**: Vue.js 3 + PrimeVue + Tailwind CSS
- **Обработка CSV**: csv-parser, fast-csv

## Быстрый старт

1. Установка зависимостей:
```bash
npm run install:all
```

2. Запуск в режиме разработки:
```bash
npm run dev
```

3. Запуск в production:
```bash
npm run build
npm start
```

Приложение будет доступно по адресу: http://localhost:5173 (frontend) и http://localhost:3000 (backend API)

## Возможности

- Загрузка CSV файлов любого размера (до 10^6 строк)
- Быстрый поиск по данным
- Пагинированный просмотр
- Эффективная обработка больших файлов через стриминг

