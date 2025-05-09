export const EVENT_TYPES = {
  FILE_DELETE: 'FILE_DELETE',
  EMAIL_SEND: 'EMAIL_SEND',
  VERIFICATION_EMAIL_SEND: 'VERIFICATION_EMAIL_SEND',
  PASSWORD_RESET_EMAIL_SEND: 'PASSWORD_RESET_EMAIL_SEND',
  CONVERSATION_CREATE: 'CONVERSATION_CREATE',
  CHAT_LIST_UPDATE: 'CHAT_LIST_UPDATE',
} as const;

export type EventType = typeof EVENT_TYPES[keyof typeof EVENT_TYPES];

export interface FileDeleteEvent {
  Key: string;
}

export interface ChatListUpdateEvent {
  userId: string;
}

export interface EmailSendEvent {
  to: string;
  subject: string;
  text?: string;
  html?: string;
  attachments?: any[]; // or use nodemailer's `Mail.Attachment[]` if you're using nodemailer types
}
export interface ConversationCreateEvent {
  memberOneId: string;
  memberTwoId: string;
}

export interface VerificationEmailEvent {
  to: string;
  code: string;
  subject?: string;
  expiresInMinutes?: number;
  templateId?: string;
  metadata?: {
    username?: string;
    applicationName?: string;
    [key: string]: any;
  };
}

export interface PasswordResetEmailEvent {
  to: string;
  code: string;
  subject?: string;
  expiresInMinutes?: number;
  templateId?: string;
  metadata?: {
    username?: string;
    applicationName?: string;
    resetUrl?: string;
    [key: string]: any;
  };
}

export interface EventPayloadMap {
  [EVENT_TYPES.FILE_DELETE]: FileDeleteEvent;
  [EVENT_TYPES.EMAIL_SEND]: EmailSendEvent;
  [EVENT_TYPES.VERIFICATION_EMAIL_SEND]: VerificationEmailEvent;
  [EVENT_TYPES.PASSWORD_RESET_EMAIL_SEND]: PasswordResetEmailEvent;
  [EVENT_TYPES.CONVERSATION_CREATE]: ConversationCreateEvent;
  [EVENT_TYPES.CHAT_LIST_UPDATE]: ChatListUpdateEvent;
}