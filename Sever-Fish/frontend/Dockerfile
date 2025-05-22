# Stage 1: Build the application
FROM node:18-alpine as build

WORKDIR /app

# Копируем только package.json
COPY package.json ./

# Устанавливаем зависимости
RUN npm install

# Копируем остальные файлы приложения
COPY . .

# Собираем приложение
RUN npm run build

# Stage 2: Create production image
FROM nginx:alpine

# Копируем собранное приложение из стадии сборки
COPY --from=build /app/dist /usr/share/nginx/html

# Копируем конфигурацию nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]