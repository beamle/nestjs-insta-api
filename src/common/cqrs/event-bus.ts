import { Injectable } from '@nestjs/common';
import { DomainEvent } from './domain-event';
import { EventHandler } from './event-handler';

@Injectable()
export class EventBus {
  private handlers = new Map<string, EventHandler[]>();

  subscribe(handler: EventHandler, eventType: string): void {
    if (!this.handlers.has(eventType)) {
      this.handlers.set(eventType, []);
    }
    this.handlers.get(eventType)!.push(handler);
  }

  async publish(event: DomainEvent): Promise<void> {
    const handlers = this.handlers.get(event.type) || [];
    await Promise.all(handlers.map((h) => h.handle(event)));
  }
}
