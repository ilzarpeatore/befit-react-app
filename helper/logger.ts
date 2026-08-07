type LogLevel = 'debug' | 'info' | 'warn' | 'error';

const isDev = __DEV__ ?? false;

function log(level: LogLevel, ...args: unknown[]) {
  if (!isDev && level !== 'error') return;

  switch (level) {
    case 'error':
      console.error(...args);
      break;
    case 'warn':
      console.warn(...args);
      break;
    case 'info':
    case 'debug':
    default:
      // eslint-disable-next-line no-console
      console.log(...args);
      break;
  }
}

export const logger = {
  debug: (...args: unknown[]) => log('debug', ...args),
  info: (...args: unknown[]) => log('info', ...args),
  warn: (...args: unknown[]) => log('warn', ...args),
  error: (...args: unknown[]) => log('error', ...args),
};

export default logger;
