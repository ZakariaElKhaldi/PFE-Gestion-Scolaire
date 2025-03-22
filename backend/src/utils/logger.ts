import { config } from '../config';

// Log levels
enum LogLevel {
  ERROR = 0,
  WARN = 1,
  INFO = 2,
  DEBUG = 3,
}

// Current log level from environment or default to INFO
const currentLogLevel = process.env.NODE_ENV === 'development' 
  ? LogLevel.DEBUG 
  : LogLevel.INFO;

// Format the current time for logs
const getTimestamp = () => {
  return new Date().toISOString();
};

// Color codes for console output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  gray: '\x1b[90m',
};

/**
 * Logger utility for consistent logging throughout the application
 */
export const logger = {
  error: (message: string, metadata?: any) => {
    if (currentLogLevel >= LogLevel.ERROR) {
      console.error(
        `${colors.red}[ERROR]${colors.reset} ${getTimestamp()} - ${message}`,
        metadata ? `\n${JSON.stringify(metadata, null, 2)}` : ''
      );
    }
  },
  
  warn: (message: string, metadata?: any) => {
    if (currentLogLevel >= LogLevel.WARN) {
      console.warn(
        `${colors.yellow}[WARN]${colors.reset} ${getTimestamp()} - ${message}`,
        metadata ? `\n${JSON.stringify(metadata, null, 2)}` : ''
      );
    }
  },
  
  info: (message: string, metadata?: any) => {
    if (currentLogLevel >= LogLevel.INFO) {
      console.info(
        `${colors.green}[INFO]${colors.reset} ${getTimestamp()} - ${message}`,
        metadata ? `\n${JSON.stringify(metadata, null, 2)}` : ''
      );
    }
  },
  
  debug: (message: string, metadata?: any) => {
    if (currentLogLevel >= LogLevel.DEBUG) {
      console.debug(
        `${colors.cyan}[DEBUG]${colors.reset} ${getTimestamp()} - ${message}`,
        metadata ? `\n${JSON.stringify(metadata, null, 2)}` : ''
      );
    }
  },
  
  // For database operations specifically
  db: (message: string, metadata?: any) => {
    if (currentLogLevel >= LogLevel.DEBUG) {
      console.debug(
        `${colors.magenta}[DATABASE]${colors.reset} ${getTimestamp()} - ${message}`,
        metadata ? `\n${JSON.stringify(metadata, null, 2)}` : ''
      );
    }
  },
  
  // For startup-related logs
  startup: (message: string, metadata?: any) => {
    console.log(
      `${colors.blue}[STARTUP]${colors.reset} ${getTimestamp()} - ${message}`,
      metadata ? `\n${JSON.stringify(metadata, null, 2)}` : ''
    );
  }
}; 