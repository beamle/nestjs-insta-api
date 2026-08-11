export abstract class DomainEvent {
  abstract readonly type: string;
  readonly occurredAt = new Date();
}
