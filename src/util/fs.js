import fs from 'fs';
import util from 'util';

import { flatten } from './array';

const readdir = util.promisify(fs.readdir);
const lstat = util.promisify(fs.lstat);

export async function asyncReadRecursively(paths) {
  return Promise.all(paths.map(path => {
    return new Promise(async (resolve, reject) => {
      try {
        const stats = fs.lstatSync(path);

        if (!stats.isDirectory()) {
          resolve([path]);
        }

        try {
          const fileList = await readdir(path);
          Promise.all(fileList.map(file => `${path}/${file}`).map(async file => {
            try {
              const stats = await lstat(file);

              if (!stats.isDirectory()) {
                return file;
              }
              return asyncReadRecursively([file]);
            } catch (error) {
              reject(`Failed to read: ${file}, ${error}`);
            }
          })).then(files => resolve(files));
        } catch (error) {
          reject(`Failed to read: ${path}, ${error}`);
        }
      } catch (error) {
        reject(`Failed to read: ${path}, ${error}`);
      }
    });
  })).then(files => flatten(files));
}
