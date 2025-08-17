// src/common/dto/paginated-response.dto.ts
import { Expose, Type } from "class-transformer";

export class PaginatedResponseDto<T> {
  @Expose() success: boolean;

  @Expose()
  complaints: T[];

  @Expose() currentPage: number;
  @Expose() totalPages: number;
  @Expose() totalCount: number;
}
