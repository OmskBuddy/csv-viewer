import { existsSync } from 'fs';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const rootNodeModules = join(__dirname, 'node_modules');
const backendNodeModules = join(__dirname, 'backend', 'node_modules');
const frontendNodeModules = join(__dirname, 'frontend', 'node_modules');

function checkAndInstall() {
  const needsInstall = !existsSync(rootNodeModules) || 
                       !existsSync(backendNodeModules) || 
                       !existsSync(frontendNodeModules);

  if (needsInstall) {
    console.log('Установка зависимостей...\n');
    
    if (!existsSync(rootNodeModules)) {
      console.log('Установка зависимостей корневого проекта...');
      execSync('npm install', { stdio: 'inherit', cwd: __dirname });
    }
    
    if (!existsSync(backendNodeModules)) {
      console.log('Установка зависимостей backend...');
      execSync('npm install', { stdio: 'inherit', cwd: join(__dirname, 'backend') });
    }
    
    if (!existsSync(frontendNodeModules)) {
      console.log('Установка зависимостей frontend...');
      execSync('npm install', { stdio: 'inherit', cwd: join(__dirname, 'frontend') });
    }
    
    console.log('\nВсе зависимости установлены!\n');
  } else {
    console.log('Все зависимости уже установлены.\n');
  }
}

function runDev() {
  console.log('Запуск приложения в режиме разработки...\n');
  try {
    execSync('npm run dev', { stdio: 'inherit', cwd: __dirname });
  } catch (error) {
    if (error.status !== null) {
      process.exit(error.status);
    }
  }
}

checkAndInstall();
runDev();

