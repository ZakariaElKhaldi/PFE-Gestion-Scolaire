const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const chalk = require('chalk');
const ora = require('ora');

// Function to clear cache
function clearCache() {
  console.log(chalk.blue('╔═════════════════════════════════════════════════════════╗'));
  console.log(chalk.blue('║                   CLEARING CACHE                        ║'));
  console.log(chalk.blue('╚═════════════════════════════════════════════════════════╝'));

  const spinner = ora('Clearing React Native and Expo caches...').start();

  try {
    // Delete node_modules/.cache if it exists
    const cacheDir = path.join(process.cwd(), 'node_modules', '.cache');
    if (fs.existsSync(cacheDir)) {
      fs.rmSync(cacheDir, { recursive: true, force: true });
    }

    // Clear watchman cache
    try {
      spinner.text = 'Clearing Watchman cache...';
      execSync('watchman watch-del-all', { stdio: 'ignore' });
    } catch (e) {
      // Watchman might not be installed, so just ignore this error
    }

    // Clear Metro bundler cache
    spinner.text = 'Clearing Metro bundler cache...';
    
    // For macOS/Linux systems
    try {
      execSync('rm -rf $TMPDIR/metro-*', { stdio: 'ignore' });
    } catch (e) {
      // Might fail on Windows, so we'll use a Windows-specific approach below
    }

    // For Windows systems
    try {
      const tmpDir = process.env.TEMP || process.env.TMP || path.join(process.env.LOCALAPPDATA, 'Temp');
      if (tmpDir) {
        const metroFiles = fs.readdirSync(tmpDir).filter(file => file.startsWith('metro-'));
        
        for (const file of metroFiles) {
          fs.rmSync(path.join(tmpDir, file), { recursive: true, force: true });
        }
      }
    } catch (e) {
      // Ignore errors here
    }

    // Clear .expo directory if it exists
    const expoDir = path.join(process.cwd(), '.expo');
    if (fs.existsSync(expoDir)) {
      spinner.text = 'Clearing .expo directory...';
      fs.rmSync(expoDir, { recursive: true, force: true });
    }

    // Clear build directories if they exist
    for (const dir of ['ios/build', 'android/build', 'android/app/build']) {
      const buildDir = path.join(process.cwd(), dir);
      if (fs.existsSync(buildDir)) {
        spinner.text = `Clearing ${dir} directory...`;
        fs.rmSync(buildDir, { recursive: true, force: true });
      }
    }

    // Run Expo's own cache clearing command
    spinner.text = 'Running Expo clear command...';
    execSync('npx expo start --clear', { stdio: 'ignore', timeout: 10000 });

    spinner.succeed('All caches cleared successfully!');
    
    console.log(chalk.green('\n✅ Cache clearing completed. Your project is now ready for a fresh start!'));
    console.log(chalk.yellow('\nNext steps:'));
    console.log(`  1. Run ${chalk.cyan('npm install')} to ensure all dependencies are correctly installed`);
    console.log(`  2. Start your app with ${chalk.cyan('npm start')}`);
    console.log(`  3. If issues persist, try ${chalk.cyan('npm run doctor')} to diagnose problems\n`);
    
  } catch (error) {
    spinner.fail('Error clearing cache');
    console.error(chalk.red('Error details:'), error.message);
    
    console.log(chalk.yellow('\nManual steps to clear cache:'));
    console.log(`  1. Delete the ${chalk.cyan('node_modules')} folder: ${chalk.cyan('rm -rf node_modules')}`);
    console.log(`  2. Delete the cache: ${chalk.cyan('npm cache clean --force')}`);
    console.log(`  3. Reinstall dependencies: ${chalk.cyan('npm install')}`);
    console.log(`  4. Restart your development environment\n`);
    
    process.exit(1);
  }
}

clearCache(); 