import { Controller, Delete, HttpCode, HttpStatus } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import { deleteAllData } from './all-data/delete-all-data';

@Controller('testing')
export class TestingController {
  constructor(@InjectConnection() private readonly connection: Connection) {
  }

  @Delete('all-data')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteAllData(): Promise<void> {
    await deleteAllData(this.connection);
  }
}
