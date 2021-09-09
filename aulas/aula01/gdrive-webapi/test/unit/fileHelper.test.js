import { describe, test, expect, jest } from '@jest/globals';
import fs from 'fs';
import FileHelper from '../../src/fileHelper';

describe('#FileHelper', () => {

    describe('#getFilesStatus', () => {
        test('it should return files statuses in correct format', async () => {
            
            const statMock = {
                dev: 117406261,
                mode: 33206,   
                nlink: 1,      
                uid: 0,        
                gid: 0,
                rdev: 0,
                blksize: 4096,
                ino: 211106232533029570,
                size: 117354,
                blocks: 232,
                atimeMs: 1631118641706.6277,
                mtimeMs: 1535068563279.9636,
                ctimeMs: 1538714588249.0671,
                birthtimeMs: 1631118641435.5266,
                atime: '2021-09-08T16:30:41.707Z',
                mtime: '2018-08-23T23:56:03.280Z',
                ctime: '2018-10-05T04:43:08.249Z',
                birthtime: '2021-09-08T16:30:41.436Z'
            }

            const mockUser = 'gabrielgianelli';
            process.env.USER = mockUser;
            const filename = 'file.png';

            jest.spyOn(fs.promises, fs.promises.readdir.name)
                .mockResolvedValue([filename]);

            jest.spyOn(fs.promises, fs.promises.stat.name)
                .mockResolvedValue(statMock);                

            const result = await FileHelper.getFilesStatus('/tmp');
            const expectedResult = [
                {
                    size: '117 kB',
                    lastModified: statMock.birthtime,
                    owner: mockUser,
                    file: filename
                }
            ];

            expect(fs.promises.stat).toHaveBeenCalledWith(`/tmp/${filename}`);
            expect(result).toMatchObject(expectedResult);
        });
    });
});