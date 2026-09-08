export class GetPostByIdQuery {
  constructor(
    public readonly postId: string,
    public readonly currentUserId?: string,
  ) {}
}
