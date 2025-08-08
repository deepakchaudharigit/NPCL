#!/usr/bin/env node

/**
 * Development Environment Setup Script
 * 
 * This script helps set up the development environment for NPCL Dashboard
 * by checking prerequisites, setting up the database, and running initial setup tasks.
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function logStep(step, message) {
  log(`\n${colors.cyan}[${step}]${colors.reset} ${colors.bright}${message}${colors.reset}`);
}

function logSuccess(message) {
  log(`${colors.green}✓${colors.reset} ${message}`);
}

function logError(message) {
  log(`${colors.red}✗${colors.reset} ${message}`);
}

function logWarning(message) {
  log(`${colors.yellow}⚠${colors.reset} ${message}`);
}

function runCommand(command, description) {
  try {
    log(`Running: ${colors.blue}${command}${colors.reset}`);
    execSync(command, { stdio: 'inherit' });
    logSuccess(description);
    return true;
  } catch (error) {
    logError(`Failed: ${description}`);
    return false;
  }
}

function checkPrerequisites() {
  logStep('1', 'Checking Prerequisites');
  
  const checks = [
    {
      command: 'node --version',
      name: 'Node.js',
      minVersion: '18.0.0'
    },
    {
      command: 'npm --version',
      name: 'npm'
    },
    {
      command: 'psql --version',
      name: 'PostgreSQL',
      optional: true
    }
  ];

  let allPassed = true;

  checks.forEach(check => {
    try {
      const output = execSync(check.command, { encoding: 'utf8' });
      logSuccess(`${check.name}: ${output.trim()}`);
    } catch (error) {
      if (check.optional) {
        logWarning(`${check.name}: Not found (optional)`);
      } else {
        logError(`${check.name}: Not found or not working`);
        allPassed = false;
      }
    }
  });

  return allPassed;
}

function setupEnvironment() {
  logStep('2', 'Setting up Environment Variables');
  
  const envPath = path.join(process.cwd(), '.env');
  const envExamplePath = path.join(process.cwd(), '.env.example');
  
  if (!fs.existsSync(envPath)) {
    if (fs.existsSync(envExamplePath)) {
      fs.copyFileSync(envExamplePath, envPath);
      logSuccess('Created .env file from .env.example');
      logWarning('Please update .env file with your actual configuration');
    } else {
      logError('.env.example file not found');
      return false;
    }
  } else {
    logSuccess('.env file already exists');
  }
  
  return true;
}

function installDependencies() {
  logStep('3', 'Installing Dependencies');
  
  return runCommand('npm install', 'Dependencies installed');
}

function setupDatabase() {
  logStep('4', 'Setting up Database');
  
  const steps = [
    {
      command: 'npm run db:generate',
      description: 'Prisma client generated'
    },
    {
      command: 'npm run db:push',
      description: 'Database schema pushed'
    },
    {
      command: 'npm run db:seed',
      description: 'Database seeded with sample data'
    }
  ];

  let allPassed = true;
  
  steps.forEach(step => {
    if (!runCommand(step.command, step.description)) {
      allPassed = false;
    }
  });

  return allPassed;
}

function runTests() {
  logStep('5', 'Running Tests');
  
  return runCommand('npm run test:ci', 'Tests completed');
}

function displayCompletionMessage() {
  log(`\n${colors.green}${colors.bright}🎉 Development Environment Setup Complete!${colors.reset}\n`);
  
  log(`${colors.cyan}Next steps:${colors.reset}`);
  log(`1. Update your .env file with actual database credentials`);
  log(`2. Start the development server: ${colors.blue}npm run dev${colors.reset}`);
  log(`3. Open your browser to: ${colors.blue}http://localhost:3000${colors.reset}`);
  
  log(`\n${colors.cyan}Default login credentials:${colors.reset}`);
  log(`Admin: admin@npcl.com / admin123`);
  log(`Operator: operator@npcl.com / operator123`);
  log(`Viewer: viewer@npcl.com / viewer123`);
  
  log(`\n${colors.cyan}Useful commands:${colors.reset}`);
  log(`${colors.blue}npm run dev${colors.reset}        - Start development server`);
  log(`${colors.blue}npm run test:watch${colors.reset} - Run tests in watch mode`);
  log(`${colors.blue}npm run db:studio${colors.reset}  - Open Prisma Studio`);
  log(`${colors.blue}npm run lint${colors.reset}       - Run linting`);
}

async function main() {
  log(`${colors.magenta}${colors.bright}`);
  log(`╔══════════════════════════════════════════════════════════════╗`);
  log(`║                    NPCL Dashboard Setup                     ║`);
  log(`║              Development Environment Setup                  ║`);
  log(`╚══════════════════════════════════════════════════════════════╝`);
  log(`${colors.reset}`);

  const steps = [
    checkPrerequisites,
    setupEnvironment,
    installDependencies,
    setupDatabase,
    runTests
  ];

  let allStepsCompleted = true;

  for (const step of steps) {
    if (!step()) {
      allStepsCompleted = false;
      break;
    }
  }

  if (allStepsCompleted) {
    displayCompletionMessage();
  } else {
    log(`\n${colors.red}${colors.bright}Setup failed. Please check the errors above and try again.${colors.reset}`);
    process.exit(1);
  }
}

// Handle script execution
if (require.main === module) {
  main().catch(error => {
    logError(`Setup failed: ${error.message}`);
    process.exit(1);
  });
}

module.exports = {
  checkPrerequisites,
  setupEnvironment,
  installDependencies,
  setupDatabase,
  runTests
};