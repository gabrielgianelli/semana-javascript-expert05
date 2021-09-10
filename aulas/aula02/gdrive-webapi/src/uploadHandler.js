import Busboy from 'busboy';
import fs from 'fs';
import { pipeline } from 'stream/promises';
import { logger } from './logger.js';

export default class UploadHandler {
    
    constructor ({ io, socketId, downloadsFolder }) {
        this.io = io;
        this.socketId = socketId;
        this.downloadsFolder = downloadsFolder;
        this.ON_UPLOAD_EVENT = 'file-ipload';
    }

    handleFileBytes(filename) {
        async function* handleData(source) {
            let processedAlready = 0;

            for await(const chunk of source) {
                yield chunk;
                processedAlready += chunk.length;

                this.io.to(this.socketId).emit(this.ON_UPLOAD_EVENT, {processedAlready, filename});
                logger.info(`File [${filename}] got ${processedAlready} bytes to ${this.socketId}`);
            }
        }

        return handleData.bind(this);
    }

    async onFile(fieldname, file, filename) {
        const saveTo = `${this.downloadsFolder}/${filename}`;

        await pipeline(
            // 1º passo, pegar uma readable stream!
            file,
            // 2º passo, filtrar, converter, transformar dados!
            this.handleFileBytes.apply(this, [ filename ]),
            // 3º passo, é a saída do processo, uma wirtable stream!
            fs.createWriteStream(saveTo)
        );

        logger.info(`File [${filename}] finished`);
    }

    registerEvents(headers, onFinish) {
        const busboy = new Busboy({ headers });

        busboy.on('file', this.onFile.bind(this));
        busboy.on('finish', onFinish);

        return busboy;
    }
    
}