const { spawn } = require('child_process');
const chalk = require('chalk');

console.log(chalk.blue('╔═════════════════════════════════════════════════════════╗'));
console.log(chalk.blue('║                 STARTING EXPO WITH QR CODE              ║'));
console.log(chalk.blue('╚═════════════════════════════════════════════════════════╝'));

console.log(chalk.yellow('A QR code should appear below that you can scan with Expo Go\n'));

// Get arguments
const args = process.argv.slice(2);

// Prepare command arguments
const expoArgs = ['start'];
args.forEach(arg => {
  if (arg.startsWith('--')) {
    expoArgs.push(arg);
  }
});

// This will run Expo directly with inherited stdio to show all output including QR code
const child = spawn('npx', ['expo', ...expoArgs], { 
  stdio: 'inherit',
  shell: true
});

// Handle process exit
child.on('close', (code) => {
  if (code !== 0) {
    console.log(chalk.red(`\nExpo process exited with code ${code}`));
  }
});

// Handle signals
process.on('SIGINT', () => {
  child.kill('SIGINT');
  process.exit(0);
}); 