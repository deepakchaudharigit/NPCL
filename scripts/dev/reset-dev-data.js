#!/usr/bin/env node

/**
 * Development Data Reset Script
 * 
 * This script resets the development database with fresh sample data.
 * Useful for testing and development when you need clean data.
 */

const { execSync } = require('child_process');
const readline = require('readline');

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
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

function askQuestion(question) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer);
    });
  });
}

async function confirmReset() {
  log(`${colors.yellow}${colors.bright}⚠ WARNING: This will delete ALL data in your development database!${colors.reset}\n`);
  
  log(`This script will:`);
  log(`1. Reset the database schema`);
  log(`2. Clear all existing data`);
  log(`3. Reseed with fresh sample data`);
  log(`4. Regenerate the Prisma client\n`);
  
  const answer = await askQuestion(`${colors.cyan}Are you sure you want to continue? (yes/no): ${colors.reset}`);
  
  return answer.toLowerCase() === 'yes' || answer.toLowerCase() === 'y';
}

function resetDatabase() {
  log(`\n${colors.cyan}Resetting database...${colors.reset}`);
  
  const steps = [
    {
      command: 'npm run db:push -- --force-reset',
      description: 'Database schema reset'
    },
    {
      command: 'npm run db:generate',
      description: 'Prisma client regenerated'
    },
    {
      command: 'npm run db:seed',
      description: 'Database reseeded with sample data'
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

function displayCompletionMessage() {
  log(`\n${colors.green}${colors.bright}🎉 Database Reset Complete!${colors.reset}\n`);
  
  log(`${colors.cyan}Your development database now contains:${colors.reset}`);
  log(`• Fresh user accounts with default passwords`);
  log(`• Sample power units (thermal, hydro, solar, wind, nuclear)`);
  log(`• Mock power readings and efficiency data`);
  log(`• Sample maintenance records`);
  log(`• Clean audit logs`);
  
  log(`\n${colors.cyan}Default login credentials:${colors.reset}`);
  log(`Admin: admin@npcl.com / admin123`);
  log(`Operator: operator@npcl.com / operator123`);
  log(`Viewer: viewer@npcl.com / viewer123`);
  
  log(`\n${colors.cyan}Next steps:${colors.reset}`);
  log(`1. Start the development server: ${colors.blue}npm run dev${colors.reset}`);
  log(`2. Login with any of the default accounts`);
  log(`3. Explore the dashboard with fresh data`);
}

async function main() {
  log(`${colors.cyan}${colors.bright}`);
  log(`╔══════════════════════════════════════════════════════════════╗`);
  log(`║                    NPCL Dashboard                           ║`);
  log(`║               Development Data Reset                        ║`);
  log(`╚══════════════════════════════════════════════════════════════╝`);
  log(`${colors.reset}`);

  // Check if we're in development environment
  const nodeEnv = process.env.NODE_ENV;
  if (nodeEnv === 'production') {
    logError('This script should not be run in production environment!');
    process.exit(1);
  }

  // Confirm the reset
  const confirmed = await confirmReset();
  if (!confirmed) {
    log(`\n${colors.yellow}Reset cancelled.${colors.reset}`);
    process.exit(0);
  }

  // Reset the database
  const success = resetDatabase();
  
  if (success) {
    displayCompletionMessage();
  } else {
    log(`\n${colors.red}${colors.bright}Reset failed. Please check the errors above and try again.${colors.reset}`);
    process.exit(1);
  }
}

// Handle script execution
if (require.main === module) {
  main().catch(error => {
    logError(`Reset failed: ${error.message}`);
    process.exit(1);
  });
}

module.exports = {
  resetDatabase,
  confirmReset
};