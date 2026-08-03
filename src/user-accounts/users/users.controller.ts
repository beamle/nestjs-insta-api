import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Post, Query, } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { GetAllUsersDto } from './dto/get-all-users.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {
  }

  @Get()
  findAll(@Query() query: GetAllUsersDto) {
    return this.usersService.findAll(query);
  }

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string): Promise<void> {
    await this.usersService.remove(id);
  }
}
