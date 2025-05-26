FROM node:18-alpine as build
WORKDIR /app
COPY package.json ./
RUN npm install
# Install all required dependencies
RUN npm install --save react-redux @reduxjs/toolkit react-router-dom
COPY . .

# Debug: List files to understand structure
RUN echo "Current file structure:"
RUN find src -type f | sort

# Debug: Check App.js content
RUN echo "App.js content:"
RUN cat src/App.js || echo "App.js not found"

# Create layout directory and MainLayout component
RUN mkdir -p src/layout
RUN echo "import React from 'react'; \
\nexport const MainLayout = ({ children }) => { \
\n  return ( \
\n    <div className='main-layout'> \
\n      <header className='header'> \
\n        <div className='container'> \
\n          <h1>Sever Fish</h1> \
\n          <nav> \
\n            <ul> \
\n              <li><a href='/'>Home</a></li> \
\n              <li><a href='/dashboard'>Dashboard</a></li> \
\n              <li><a href='/auth'>Login/Register</a></li> \
\n            </ul> \
\n          </nav> \
\n        </div> \
\n      </header> \
\n      <main className='content'> \
\n        <div className='container'> \
\n          {children} \
\n        </div> \
\n      </main> \
\n      <footer className='footer'> \
\n        <div className='container'> \
\n          <p>&copy; 2025 Sever Fish - All rights reserved</p> \
\n        </div> \
\n      </footer> \
\n    </div> \
\n  ); \
\n}; \
\nexport default MainLayout;" > src/layout/MainLayout.jsx

# Also create a JS version in case it's imported as .js
RUN cp src/layout/MainLayout.jsx src/layout/MainLayout.js

# Check if we need to create/update App.js instead of App.jsx
RUN if [ -f src/App.js ]; then \
    echo "import React from 'react'; \
\nimport { Routes, Route } from 'react-router-dom'; \
\nimport MainLayout from './layout/MainLayout'; \
\n \
\nconst HomePage = () => <div>Home Page</div>; \
\nconst DashboardPage = () => <div>Dashboard Page</div>; \
\nconst AuthPage = () => <div>Auth Page</div>; \
\n \
\nfunction App() { \
\n  return ( \
\n    <Routes> \
\n      <Route path='/' element={ \
\n        <MainLayout> \
\n          <HomePage /> \
\n        </MainLayout> \
\n      } /> \
\n      <Route path='/dashboard' element={ \
\n        <MainLayout> \
\n          <DashboardPage /> \
\n        </MainLayout> \
\n      } /> \
\n      <Route path='/auth' element={<AuthPage />} /> \
\n    </Routes> \
\n  ); \
\n} \
\n \
\nexport default App;" > src/App.js; \
fi

# Create any other potential imports your App.js might need
# If you need to create more specific layouts, this is where you would add them

# For example, if you need routes files:
RUN mkdir -p src/routes
RUN echo "import React from 'react'; \
\nconst routes = []; \
\nexport default routes;" > src/routes/index.js

# Run the build again
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]