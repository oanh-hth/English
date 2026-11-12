// Given: a Transform stream that passes bytes through and fails when more than `max` bytes arrive.
// Streams let the server handle a 2 GB video without ever holding it all in memory:
//     await pipeline(req, new SizeGuard(size), fs.createWriteStream(path));
import { Transform } from 'node:stream';
import { HttpError } from './errors';

export class SizeGuard extends Transform {
  private seen = 0;
  constructor(private max: number) {
    super();
  }
  _transform(chunk: Buffer, _encoding: BufferEncoding, callback: (error?: Error | null, data?: Buffer) => void) {
    this.seen += chunk.length;
    if (this.seen > this.max) return callback(new HttpError(413, 'File larger than announced'));
    callback(null, chunk);
  }
}
