import { describe, test, expect, beforeEach, jest } from '@jest/globals';
// import { resolve } from 'path';
import UploadHandler from '../../src/uploadHandler.js';
import TestUtil from '../_util/testUtil.js';
import { logger } from '../../src/logger.js';
import fs from 'fs';
import { pipeline } from 'stream/promises';

describe('#UploadHandler test suite', () => {
    
    const ioObj = {
        to: (id) => ioObj,
        emit: (event, message) => {}
    }

    beforeEach(() => {
        jest.spyOn(logger, 'info')
            .mockImplementation();
    });

    describe('#registerEvents', () => {
        
        test('should call onFile and onFinish function on Busboy instance', () => {
            const uploadHandler = new UploadHandler({
                io: ioObj,
                socketId: '01'
            });

            jest.spyOn(uploadHandler, uploadHandler.onFile.name)
                .mockResolvedValue();

            const headers = {
                'content-type': 'multipart/form-data; boundary='
            }

            const onFinish = jest.fn();
            const busboyInstance = uploadHandler.registerEvents(headers, onFinish);

            const fileStream = TestUtil.generateReadableStream([ 'chunk', 'of', 'data' ]);
            busboyInstance.emit('file', 'fieldname', fileStream, 'filename.txt');

            busboyInstance.listeners('finish')[0].call();

            expect(uploadHandler.onFile).toHaveBeenCalled();
            expect(onFinish).toHaveBeenCalled();
        });

    });

    describe('#onFile', () => {
        test('given a stream file it should save it on disk', async () => {
            const chunks = ['hey', 'dude'];
            const downloadsFolder = '/tmp';
            const handler = new UploadHandler({
                io: ioObj,
                socketId: '01',
                downloadsFolder
            });

            const onData = jest.fn();
            jest.spyOn(fs, fs.createWriteStream.name)
                .mockImplementation(() => TestUtil.generateWritableStream(onData));

            const onTransform = jest.fn();
            jest.spyOn(handler, handler.handleFileBytes.name)            
                .mockImplementation(() => TestUtil.generateTransformStream(onTransform));
            
            const params = {
                fieldname: 'video',
                file: TestUtil.generateReadableStream(chunks),
                filename: 'mockfile.mov'
            }

            await handler.onFile(...Object.values(params));

            expect(onData.mock.calls.join()).toEqual(chunks.join());
            expect(onTransform.mock.calls.join()).toEqual(chunks.join());

            // const expectedFilename = resolve(handler.downloadsFolder, params.filename);
            const expectedFilename = `${handler.downloadsFolder}/${params.filename}`;
            expect(fs.createWriteStream).toHaveBeenCalledWith(expectedFilename);
        });
    });

    describe('#handleFileBytes', () => {
        test('should call emit function and it is a transform stream', async () => {
            jest.spyOn(ioObj, ioObj.to.name);
            jest.spyOn(ioObj, ioObj.emit.name);

            const handler = new UploadHandler({
                io: ioObj,
                socketId: '01'
            });

            const messages = ['hello'];
            const source = TestUtil.generateReadableStream(messages);
            const onWrite = jest.fn();
            const target = TestUtil.generateWritableStream(onWrite);

            await pipeline(
                source,
                handler.handleFileBytes('filename.txt'),
                target
            );

            expect(ioObj.to).toHaveBeenCalledTimes(messages.length);
            expect(ioObj.emit).toHaveBeenCalledTimes(messages.length);

            // se o handleFileBytes for um transform string nosso pipeline 
            // vai continuar o processo, passando os dados para frente
            // e chamar nossa função no target a cada chunk
            expect(ioObj.to).toHaveBeenCalledTimes(messages.length);
            expect(onWrite.mock.calls.join()).toEqual(messages.join());
        });
    });

});