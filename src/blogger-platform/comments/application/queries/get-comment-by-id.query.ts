export class GetCommentByIdQuery {
  constructor(
    public readonly commentId: string,
    public readonly currentUserId?: string,
  ) {}
}
