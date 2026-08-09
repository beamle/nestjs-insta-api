import { Controller, Delete, HttpCode, HttpStatus } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import { deleteAllData } from './all-data/delete-all-data';
import { RateLimitService } from '../user-accounts/auth/guards/rate-limit.service';

@Controller('testing')
export class TestingController {
  constructor(
    @InjectConnection() private readonly connection: Connection,
    private readonly rateLimitService: RateLimitService,
  ) {
  }

  @Delete('all-data')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteAllData(): Promise<void> {
    await deleteAllData(this.connection);
    this.rateLimitService.clear();
  }
}
