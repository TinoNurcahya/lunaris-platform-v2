/**
 * Lunarys V2 -- Centralized Application Logger Service
 * Safe for both Client and Server environments.
 */

type LogLevel = 'info' | 'warn' | 'error';

interface LogPayload {
  message: string;
  context?: string;
  data?: Record<string, unknown>;
  error?: Error | unknown;
}

class LoggerService {
  private isDevelopment = process.env.NODE_ENV !== 'production';

  private formatMessage(level: LogLevel, payload: LogPayload): string {
    const timestamp = new Date().toISOString();
    const ctx = payload.context ? `[${payload.context}]` : '[App]';
    return `${timestamp} ${level.toUpperCase()} ${ctx} ${payload.message}`;
  }

  public info(message: string, context?: string, data?: Record<string, unknown>) {
    const formatted = this.formatMessage('info', { message, context, data });
    if (this.isDevelopment) {
      console.log(formatted, data || '');
    }
  }

  public warn(message: string, context?: string, data?: Record<string, unknown>) {
    const formatted = this.formatMessage('warn', { message, context, data });
    console.warn(formatted, data || '');
  }

  public error(message: string, error?: Error | unknown, context?: string, data?: Record<string, unknown>) {
    const formatted = this.formatMessage('error', { message, context, error, data });
    console.error(formatted, error || '', data || '');
  }
}

export const logger = new LoggerService();
