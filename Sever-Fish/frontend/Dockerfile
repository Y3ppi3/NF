FROM node:18-alpine

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm install

COPY . .
ENV REACT_APP_API_URL=http://localhost:8000

# Build the app
RUN npm run build

# Install serve to run the application
RUN npm install -g serve

# Expose the port the app will run on
EXPOSE 3000

# Command to run the application
CMD ["serve", "-s", "build", "-l", "3000"]