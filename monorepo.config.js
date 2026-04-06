module.exports = {
  name: '@uniboard/monorepo',
  workspaces: ['frontend', 'backend'],
  scripts: {
    dev: 'concurrently "npm run dev --workspace=frontend" "npm run dev --workspace=backend"',
    'dev:frontend': 'npm run dev --workspace=frontend',
    'dev:backend': 'npm run dev --workspace=backend',
    build: 'npm run build --workspace=frontend',
    'build:frontend': 'npm run build --workspace=frontend',
    'build:backend': 'echo "Backend does not require build"',
    'start:backend': 'npm start --workspace=backend',
    seed: 'npm run seed --workspace=backend'
  },
  packages: {
    frontend: {
      name: '@uniboard/frontend',
      path: 'frontend',
      main: 'src/main.jsx',
      devCommand: 'npm run dev',
      buildCommand: 'npm run build'
    },
    backend: {
      name: '@uniboard/backend',
      path: 'backend',
      main: 'src/server.js',
      devCommand: 'npm run dev',
      startCommand: 'npm start'
    }
  },
  env: {
    root: '.env',
    frontend: 'frontend/.env',
    backend: 'backend/.env'
  }
}
