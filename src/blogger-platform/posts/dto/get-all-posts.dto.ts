export class GetAllPostsDto {
  sortBy: string = 'createdAt';
  sortDirection: 'asc' | 'desc' = 'desc';
  pageNumber: number = 1;
  pageSize: number = 10;
}
