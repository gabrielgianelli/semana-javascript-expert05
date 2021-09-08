import pino from 'pino';
const logger = pino({
    preetyPrint: {
        ignore: 'pid,hostname'
    }
});

export {
    logger,
}