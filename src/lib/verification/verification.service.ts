import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Injectable, Inject } from '@nestjs/common';
import { Cache } from 'cache-manager';


@Injectable()
export class VerificationService {
  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

  private generateCode(length: number = 6): string {
    return Math.floor(Math.random() * Math.pow(10, length))
      .toString()
      .padStart(length, '0');
  }

  private createCacheKey(identifier): string {
    return `verification:${identifier}`;
  }

  async generateVerificationCode(identifier: string,): Promise<string> {
    const code = this.generateCode();
    const cacheKey = this.createCacheKey(identifier);
    
    // Store the code in Redis with TTL
    await this.cacheManager.set(cacheKey, code, 600);
    
    return code;
  }

  async verifyCode(identifier: string, code: string): Promise<boolean> {
    const cacheKey = this.createCacheKey(identifier);
    const storedCode = await this.cacheManager.get<string>(cacheKey);
    
    if (!storedCode || storedCode !== code) {
      return false;
    }
    
    // Delete the code from cache after successful verification
    await this.cacheManager.del(cacheKey);
    
    return true;
  }
}
