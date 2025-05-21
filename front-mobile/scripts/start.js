const { spawn } = require('child_process');
const chalk = require('chalk');
const ora = require('ora');
const path = require('path');
const fs = require('fs');

// Common errors and their solutions
const ERROR_SOLUTIONS = {
  'Unable to resolve module': {
    regex: /Unable to resolve module `([^`]+)`/,
    solution: (moduleName) => `
${chalk.bold('Solution:')} The module '${moduleName}' cannot be found. Try:
  1. ${chalk.cyan('npm install ' + moduleName)}
  2. Check if the module name is correctly spelled in your import statement
  3. Run ${chalk.cyan('npm install')} to ensure all dependencies are installed
  4. Clear cache with ${chalk.cyan('npm run clear-cache')} and try again
`
  },
  'Metro Bundler error': {
    regex: /Error: Metro Bundler/,
    solution: () => `
${chalk.bold('Solution:')} Metro bundler failed to start or crashed. Try:
  1. Kill any running Metro instances
  2. Clear the cache with ${chalk.cyan('npm run clear-cache')}
  3. Check port 8081 is not in use by another process
  4. Restart your computer if the issue persists
`
  },
  'React Native version mismatch': {
    regex: /React Native version mismatch/,
    solution: () => `
${chalk.bold('Solution:')} React Native version mismatch detected. Try:
  1. Run ${chalk.cyan('npx expo-doctor')} to check versions
  2. Run ${chalk.cyan('npx expo install --fix')} to fix dependency issues
  3. Clear cache with ${chalk.cyan('npm run clear-cache')} and try again
`
  },
  'Invariant Violation': {
    regex: /Invariant Violation/,
    solution: () => `
${chalk.bold('Solution:')} A React Native invariant violation occurred. This often indicates:
  1. A component is rendering incorrectly
  2. There might be a state management issue
  3. Check your recent code changes
  4. Try running ${chalk.cyan('npm run clear-cache')} to clear cache
`
  },
  'Command failed': {
    regex: /Command failed/,
    solution: () => `
${chalk.bold('Solution:')} A command failed during execution. Try:
  1. Check your terminal for specific error messages
  2. Ensure you have the necessary permissions
  3. Run as administrator if needed
  4. Check if all required tools are installed
`
  },
  'SyntaxError': {
    regex: /SyntaxError/,
    solution: () => `
${chalk.bold('Solution:')} A syntax error was found in your code. Check:
  1. The file mentioned in the error message for syntax issues
  2. Missing or extra brackets, commas, or semicolons
  3. Run ${chalk.cyan('npm run lint')} to find syntax errors
`
  },
  'cannot find module': {
    regex: /Cannot find module '([^']+)'/i,
    solution: (moduleName) => `
${chalk.bold('Solution:')} Module not found: '${moduleName}'. Try:
  1. ${chalk.cyan('npm install ' + moduleName)}
  2. Check if the module is in your package.json
  3. Run ${chalk.cyan('npm install')} to ensure all dependencies are installed
`
  },
  'Device connection': {
    regex: /(Device|connection|timeout)/i,
    solution: () => `
${chalk.bold('Solution:')} Device connection issues. Try:
  1. Ensure your device/emulator is running and connected
  2. Restart your device/emulator
  3. Check USB connection or network if using a physical device
  4. Run ${chalk.cyan('adb devices')} (Android) or check Xcode devices (iOS)
`
  },
  'TypeScript error': {
    regex: /TS\d+/,
    solution: () => `
${chalk.bold('Solution:')} TypeScript compilation error. Try:
  1. Check the TypeScript error message for details
  2. Fix type issues in your code
  3. Run ${chalk.cyan('npm run ts:check')} to find all TypeScript errors
`
  },
  'Babel error': {
    regex: /Babel|Transform/i,
    solution: () => `
${chalk.bold('Solution:')} Babel transformation error. Try:
  1. Check if babel.config.js is correct
  2. Ensure all babel plugins are installed
  3. Clear cache with ${chalk.cyan('npm run clear-cache')}
  4. Check if you're using unsupported syntax for your configuration
`
  }
};

// Environment validation and checks
function validateEnvironment() {
  // Check for node version
  const nodeVersion = process.version;
  const requiredNodeVersion = 'v14.0.0';
  
  if (nodeVersion.localeCompare(requiredNodeVersion, undefined, { numeric: true, sensitivity: 'base' }) < 0) {
    console.log(chalk.yellow(`⚠️  Warning: Your Node.js version (${nodeVersion}) is older than the recommended version (${requiredNodeVersion})`));
    console.log(chalk.cyan('   Consider upgrading Node.js for better compatibility.'));
  }

  // Check if required files exist
  const requiredFiles = [
    { path: 'package.json', message: 'package.json is missing!' },
    { path: 'app.json', message: 'app.json is missing!' },
    { path: 'babel.config.js', message: 'babel.config.js is missing!' }
  ];

  requiredFiles.forEach(file => {
    const filePath = path.join(process.cwd(), file.path);
    if (!fs.existsSync(filePath)) {
      console.log(chalk.red(`❌ ${file.message}`));
      process.exit(1);
    }
  });

  // Check for common misconfigurations
  try {
    const packageJson = require(path.join(process.cwd(), 'package.json'));
    const appJson = require(path.join(process.cwd(), 'app.json'));

    // Check for newArchEnabled
    if (!appJson.expo || !appJson.expo.newArchEnabled) {
      console.log(chalk.yellow('⚠️  Warning: newArchEnabled is not set to true in app.json'));
      console.log(chalk.cyan('   This is recommended for Expo SDK 52+ projects.'));
    }

    // Check for missing essential dependencies
    const essentialDeps = ['react', 'react-native', 'expo'];
    for (const dep of essentialDeps) {
      if (!packageJson.dependencies[dep]) {
        console.log(chalk.red(`❌ Missing essential dependency: ${dep}`));
        process.exit(1);
      }
    }
  } catch (err) {
    console.log(chalk.red('❌ Error validating project files:'), err.message);
  }
}

// Function to parse errors and provide solutions
function parseErrorAndSuggestSolution(errorText) {
  for (const [errorType, config] of Object.entries(ERROR_SOLUTIONS)) {
    const match = errorText.match(config.regex);
    if (match) {
      const param = match[1]; // This will be undefined if there's no capture group
      return config.solution(param);
    }
  }
  
  return null;
}

// Main function to start the app
function startApp() {
  console.log(chalk.blue('╔═════════════════════════════════════════════════════════╗'));
  console.log(chalk.blue('║                 SCHOOL MANAGEMENT APP                   ║'));
  console.log(chalk.blue('╚═════════════════════════════════════════════════════════╝'));
  
  // Validate environment before starting
  validateEnvironment();
  
  // Get arguments
  const args = process.argv.slice(2);
  const platform = args.find(arg => arg === '--android' || arg === '--ios' || arg === '--web');
  
  // Prepare command arguments
  const expoArgs = ['start'];
  if (platform) {
    expoArgs.push(platform);
  }
  
  // Add any additional flags
  args.forEach(arg => {
    if (arg !== platform && arg.startsWith('--')) {
      expoArgs.push(arg);
    }
  });
  
  // Show startup message
  const platformName = platform ? platform.replace('--', '') : 'default';
  const spinner = ora(`Starting Expo for ${chalk.green(platformName)} platform...`).start();
  
  // Execute Expo command
  const child = spawn('npx', ['expo', ...expoArgs], { 
    stdio: 'pipe',
    shell: true
  });
  
  let errorBuffer = '';
  let outputBuffer = '';
  let startupCompleted = false;
  
  // Handle stdout data
  child.stdout.on('data', (data) => {
    const output = data.toString();
    outputBuffer += output;
    
    // Always display the output to show QR code and other important info
    process.stdout.write(output);
    
    // Just mark startup as completed when we see these messages
    if (output.includes('Starting Metro Bundler') || output.includes('Starting project')) {
      spinner.succeed(`Expo started for ${chalk.green(platformName)} platform`);
      startupCompleted = true;
    }
  });
  
  // Handle stderr data
  child.stderr.on('data', (data) => {
    const errorOutput = data.toString();
    errorBuffer += errorOutput;
    
    // Display error in red
    process.stderr.write(chalk.red(errorOutput));
    
    // Try to parse the error and suggest solutions
    const solution = parseErrorAndSuggestSolution(errorOutput);
    if (solution) {
      console.log(solution);
    }
  });
  
  // Handle process exit
  child.on('close', (code) => {
    if (code !== 0) {
      spinner.fail(`Expo process exited with code ${code}`);
      
      // Try to find a solution for the full error buffer
      const solution = parseErrorAndSuggestSolution(errorBuffer);
      if (solution) {
        console.log(solution);
      } else {
        console.log(chalk.yellow(`
${chalk.bold('No specific solution found. Try these general troubleshooting steps:')}
  1. Run ${chalk.cyan('npm run clear-cache')} to clear cache
  2. Check your code for recent changes that might cause the error
  3. Run ${chalk.cyan('npm run doctor')} to check for version mismatches
  4. Ensure all dependencies are installed with ${chalk.cyan('npm install')}
  5. Check the error message above for more details
`));
      }
      
      // Additional diagnostics
      console.log(chalk.cyan('\nWould you like to run diagnostics? [y/N]'));
      process.stdin.once('data', (data) => {
        const answer = data.toString().trim().toLowerCase();
        if (answer === 'y') {
          console.log(chalk.blue('\nRunning diagnostics...'));
          const diagnostics = spawn('npx', ['expo-doctor'], { stdio: 'inherit', shell: true });
          diagnostics.on('close', () => {
            process.exit(code);
          });
        } else {
          process.exit(code);
        }
      });
    } else if (!startupCompleted) {
      spinner.succeed(`Expo process completed successfully`);
      process.exit(0);
    }
  });
  
  // Handle signals
  process.on('SIGINT', () => {
    console.log(chalk.yellow('\nReceived SIGINT signal. Shutting down...'));
    child.kill('SIGINT');
    process.exit(0);
  });
}

// Start the application
startApp(); 