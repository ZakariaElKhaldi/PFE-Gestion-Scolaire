import { config } from '../config';

// Define log levels
type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'startup';

// Define colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  underscore: '\x1b[4m',
  blink: '\x1b[5m',
  reverse: '\x1b[7m',
  hidden: '\x1b[8m',
  
  black: '\x1b[30m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  
  bgBlack: '\x1b[40m',
  bgRed: '\x1b[41m',
  bgGreen: '\x1b[42m',
  bgYellow: '\x1b[43m',
  bgBlue: '\x1b[44m',
  bgMagenta: '\x1b[45m',
  bgCyan: '\x1b[46m',
  bgWhite: '\x1b[47m'
};

// Logger class
class Logger {
  private isDevelopment: boolean;
  
  constructor() {
    this.isDevelopment = config.server.env === 'development';
  }
  
  private formatMessage(level: LogLevel, message: string, meta?: any): string {
    const timestamp = new Date().toISOString();
    let formattedMessage = `[${timestamp}] [${level.toUpperCase()}] ${message}`;
    
    if (meta) {
      if (typeof meta === 'object') {
        try {
          formattedMessage += ` ${JSON.stringify(meta)}`;
        } catch (error) {
          formattedMessage += ` [Object]`;
        }
      } else {
        formattedMessage += ` ${meta}`;
      }
    }
    
    return formattedMessage;
  }
  
  private colorize(level: LogLevel, message: string): string {
    switch (level) {
      case 'debug':
        return `${colors.dim}${message}${colors.reset}`;
      case 'info':
        return `${colors.blue}${message}${colors.reset}`;
      case 'warn':
        return `${colors.yellow}${message}${colors.reset}`;
      case 'error':
        return `${colors.red}${message}${colors.reset}`;
      case 'startup':
        return `${colors.green}${colors.bright}${message}${colors.reset}`;
      default:
        return message;
    }
  }
  
  private log(level: LogLevel, message: string, meta?: any): void {
    const formattedMessage = this.formatMessage(level, message, meta);
    const colorizedMessage = this.colorize(level, formattedMessage);
    
    switch (level) {
      case 'debug':
        if (this.isDevelopment) console.debug(colorizedMessage);
        break;
      case 'info':
        console.info(colorizedMessage);
        break;
      case 'warn':
        console.warn(colorizedMessage);
        break;
      case 'error':
        console.error(colorizedMessage);
        break;
      case 'startup':
        console.log(colorizedMessage);
        break;
    }
  }
  
  public debug(message: string, meta?: any): void {
    this.log('debug', message, meta);
  }
  
  public info(message: string, meta?: any): void {
    this.log('info', message, meta);
  }
  
  public warn(message: string, meta?: any): void {
    this.log('warn', message, meta);
  }
  
  public error(message: string, meta?: any): void {
    this.log('error', message, meta);
  }
  
  public startup(message: string, meta?: any): void {
    this.log('startup', message, meta);
  }
}

// Export a singleton instance
export const logger = new Logger(); 