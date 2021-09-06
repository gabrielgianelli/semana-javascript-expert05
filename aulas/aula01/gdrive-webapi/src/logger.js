import pino from 'pino';
const logger = pino({
    preetryPrint: {
        ignore: 'pid,hostname'
    }
});

export {
    logger,
}