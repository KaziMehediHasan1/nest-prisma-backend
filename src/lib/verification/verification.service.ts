import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Injectable, Inject, Logger } from '@nestjs/common';
import { Cache } from 'cache-manager';
import { EVENT_TYPES, PasswordResetEmailEvent, VerificationEmailEvent } from 'src/interfaces/event';
import { EventService } from '../event/event.service';
import { ApiResponse } from 'src/interfaces/response';
import { VerifyCodeOnlyDto } from 'src/main/auth/dto/verifyCode.dto';

@Injectable()
export class VerificationService {
  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private readonly eventEmitter: EventService,
  ) {}

  private generateCode(length: number = 6): string {
    return Math.floor(Math.random() * Math.pow(10, length))
      .toString()
      .padStart(length, '0');
  }

  private createCacheKey(identifier): string {
    return `verification:${identifier}`;
  }

  async generateVerificationCode(
    identifier: string, 
    expiresInMinutes: number = 5
  ): Promise<string> {
    try {
      const cacheKey = this.createCacheKey(identifier);
      
      const existingCode = await this.cacheManager.get(cacheKey);
      
      if (existingCode) {
        await this.cacheManager.del(cacheKey);
      }
      
      const code = this.generateCode();
      
      try {
        // Convert minutes to milliseconds for the cache TTL
        await this.cacheManager.set(
          cacheKey, 
          code, 
          1000 * 60 * expiresInMinutes
        );
      } catch (error) {
        console.log(error);
        throw error;
      }
      
      return code;
    } catch (error) {
      Logger.error(
        `Failed to generate verification code for ${identifier}`,
        error,
      );
      
      throw new Error(`Unable to generate verification code: ${error.message}`);
    }
  }

  async verifyCode(identifier: string, code: string): Promise<boolean> {
    const cacheKey = this.createCacheKey(identifier);
    const storedCode = await this.cacheManager.get<string>(cacheKey);    

    if (!storedCode || storedCode !== code) {
      return false;
    }

    await this.cacheManager.del(cacheKey);

    return true;
  }

  async sendVerificationEmail(
    email: string,
    expiresInMinutes: number = 5,
    metadata: Record<string, any> = {},
  ): Promise<string> {
    // Generate verification code and store in cache
    const code = await this.generateVerificationCode(email);

    // Set TTL in cache (converting minutes to seconds)

    // Prepare verification email payload
    const verificationPayload: VerificationEmailEvent = {
      to: email,
      code,
      expiresInMinutes,
      subject: metadata.subject || 'Verification Code',
      metadata,
    };

    // Emit event to send the verification email
    this.eventEmitter.emit(
      EVENT_TYPES.VERIFICATION_EMAIL_SEND,
      verificationPayload,
    );

    return code;
  }

  async sendPasswordResetEmail(
    email: string,
    expiresInMinutes: number = 30,
    metadata: Record<string, any> = {},
  ): Promise<string> {
    // Generate verification code and store in cache
    const code = await this.generateVerificationCode(email, expiresInMinutes);
    
    // Prepare password reset email payload
    const passwordResetPayload: PasswordResetEmailEvent = {
      to: email,
      code,
      expiresInMinutes,
      subject: metadata.subject || 'Password Reset Code',
      metadata: {
        ...metadata,
        type: 'password_reset'
      },
    };
    
    // Emit event to send the password reset email
    this.eventEmitter.emit(
      EVENT_TYPES.PASSWORD_RESET_EMAIL_SEND,
      passwordResetPayload,
    );
    
    return code;
  }

  async isCodeValid({
    code,
    email: identifier
  }:VerifyCodeOnlyDto): Promise<ApiResponse<any>> {
    const cacheKey = this.createCacheKey(identifier);
    const storedCode = await this.cacheManager.get<string>(cacheKey);
  
    return {
      statusCode: 200,
      success: true,
      message: 'Verification code is valid',
      data: {
        isValid: storedCode === code,
        email: identifier
      }
    }
  }
}
