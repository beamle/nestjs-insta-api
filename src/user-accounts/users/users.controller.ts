import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Post, Query, UseGuards, } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { GetAllUsersDto } from './dto/get-all-users.dto';
import { BasicAuthGuard } from './guards/basic-auth.guard';
import { CreateUserValidationPipe } from './pipes/create-user-validation.pipe';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {
  }

  @Get()
  findAll(@Query() query: GetAllUsersDto) {
    return this.usersService.findAll(query);
  }

  @Post()
  @UseGuards(BasicAuthGuard)
  create(@Body(new CreateUserValidationPipe()) createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(BasicAuthGuard)
  remove(@Param('id') id: string): Promise<void> {
    return this.usersService.remove(id);
  }
}
