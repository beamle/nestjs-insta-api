export class UpdateCommentCommand {
  constructor(
    public readonly commentId: string,
    public readonly content: string,
  ) {}
}
