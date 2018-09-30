import fs from 'fs';

import { flatten } from './array';

export function readRecursively(paths) {
  return flatten(paths.map(path => {
    try {
      const stats = fs.lstatSync(path);

      if (!stats.isDirectory()) {
        return [path];
      }

      try {
        const fileList = fs.readdirSync(path);
        return fileList.map(file => `${path}/${file}`).map(file => {
          try {
            const stats = fs.lstatSync(file);

            if (!stats.isDirectory()) {
              return file;
            }
            return readRecursively([file]);
          } catch (error) {
            console.log('failed to read: ', file, error);
            return [];
          }
        });
      } catch (error) {
        console.log('failed to read: ', path, error);
        return [];
      }
    } catch (error) {
      console.log('failed to read: ', path, error);
      return [];
    }
  }));
}
