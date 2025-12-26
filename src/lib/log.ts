const HOSTNAME = process.env.HOSTNAME || 'localhost';

/**
 * Retona logs de acordo com o estado ou efeito colateral da ação.
 * @param APP_NAME
 * @param severity
 * @param message
 * @param data
 */
export default function log(APP_NAME: string, severity: 'INFO' | 'WARNING' | 'ERROR', message: string, data?: Record<string, unknown>) {
    const timestamp = new Date().toISOString();
    const logEntry = {
        timestamp,
        hostname: HOSTNAME,
        app: APP_NAME,
        severity,
        message,
        ...data
    };

    if (severity === 'ERROR') {
        console.error(JSON.stringify(logEntry));
    } else if (severity === 'WARNING') {
        console.warn(JSON.stringify(logEntry));
    } else {
        console.log(JSON.stringify(logEntry));
    }
}