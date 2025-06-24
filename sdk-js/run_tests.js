#!/usr/bin/env node
/**
 * Test runner script for PoD Protocol JavaScript SDK
 */

const { spawn } = require('child_process');
const path = require('path');

function runCommand(command, args, options = {}) {
  return new Promise((resolve, reject) => {
    console.log(`Running: ${command} ${args.join(' ')}`);
    
    const process = spawn(command, args, {
      stdio: 'inherit',
      cwd: options.cwd || __dirname,
      ...options
    });

    process.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Command failed with exit code ${code}`));
      }
    });

    process.on('error', (error) => {
      reject(error);
    });
  });
}

async function main() {
  const args = process.argv.slice(2);
  
  // Parse arguments
  const testType = args.find(arg => ['unit', 'integration', 'e2e', 'all'].includes(arg)) || 'all';
  const coverage = args.includes('--coverage');
  const watch = args.includes('--watch');
  const verbose = args.includes('--verbose');
  const fast = args.includes('--fast');

  // Base Jest command
  let jestArgs = [];
  
  // Add test type patterns
  if (testType === 'unit') {
    jestArgs.push('--testPathPattern=(?!integration|e2e)');
  } else if (testType === 'integration') {
    jestArgs.push('--testPathPattern=integration');
  } else if (testType === 'e2e') {
    jestArgs.push('--testPathPattern=e2e');
  }
  
  // Add options
  if (coverage) {
    jestArgs.push('--coverage');
  }
  
  if (watch) {
    jestArgs.push('--watch');
  }
  
  if (verbose) {
    jestArgs.push('--verbose');
  }
  
  if (fast) {
    jestArgs.push('--testTimeout=5000');
  }

  try {
    await runCommand('npx', ['jest', ...jestArgs]);
    console.log('\n✅ Tests completed successfully!');
  } catch (error) {
    console.error('\n❌ Tests failed:', error.message);
    process.exit(1);
  }
}

// Handle CLI execution
if (require.main === module) {
  main().catch(error => {
    console.error('Error running tests:', error);
    process.exit(1);
  });
}
