import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { EventPayloadMap, EventType } from 'src/interfaces/event';

@Injectable()
export class EventService {
  constructor(private eventEmitter: EventEmitter2) {}

  // Type-safe emit method
  emit<T extends EventType>(event: T, payload: EventPayloadMap[T]): boolean {
    return this.eventEmitter.emit(event, payload);
  }
}
