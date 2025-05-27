import { Controller, Get, Param } from '@nestjs/common';
import { Public } from 'src/decorators/Public';
import { TokensService } from './tokens.service';

@Controller('tokens')
export class TokensController {
  constructor(private readonly tokensService: TokensService) {}

  @Get(':token')
  @Public()
  findOne(@Param('token') token: string) {
    return this.tokensService.findOne(token);
  }
}
