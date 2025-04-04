
export const EVENT_TYPES = {
    FILE_DELETE: 'FILE_DELETE',
  } as const;
  
  export type EventType = typeof EVENT_TYPES[keyof typeof EVENT_TYPES];
  
  export interface FileDeleteEvent {
    Key: string;
  }
  
  export interface EventPayloadMap {
    [EVENT_TYPES.FILE_DELETE]: FileDeleteEvent;
  }