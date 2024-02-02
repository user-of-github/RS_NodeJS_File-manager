import crypto from 'crypto';


export class CompressService {
  static hash(data) {
    return crypto.createHash('md5').update(name).digest('hex');
  }
}
