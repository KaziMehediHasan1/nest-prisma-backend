export const EVENT_TYPES = {
    FILE_DELETE: 'FILE_DELETE',
    EMAIL_SEND: 'EMAIL_SEND',
  } as const;
  
  export type EventType = typeof EVENT_TYPES[keyof typeof EVENT_TYPES];
  
  export interface FileDeleteEvent {
    Key: string;
  }
  
  export interface EmailSendEvent {
    to: string;
    subject: string;
    text?: string;
    html?: string;
    attachments?: any[]; // or use nodemailer's `Mail.Attachment[]` if you're using nodemailer types
  }
  
  export interface EventPayloadMap {
    [EVENT_TYPES.FILE_DELETE]: FileDeleteEvent;
    [EVENT_TYPES.EMAIL_SEND]: EmailSendEvent;
  }
  