import { DomainEvent } from './domain-event';

export abstract class EventHandler<E extends DomainEvent = DomainEvent> {
  abstract handle(event: E): Promise<void>;
}
