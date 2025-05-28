
import { Controller, Get, Post, Put, Delete, Param, Body } from '@nestjs/common';
import { ApiBearerAuth} from '@nestjs/swagger';
import { PaymentService } from './payment.service';
import { CreatePaymentDto } from './dto/createPayment.dto';
import { UpdatePaymentDto } from './dto/updatePayment.dto';

@ApiBearerAuth('access-token') 
@Controller('payments')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Get()
  findAll() {
    return this.paymentService.findAll();
  }

  @Get(':id')
  findById(@Param('id') id: string) {
    return this.paymentService.findById(id);
  }

  @Post()
  create(@Body() data: CreatePaymentDto) {
    return this.paymentService.create(data);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() data: UpdatePaymentDto) {
    return this.paymentService.update(id, data);
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.paymentService.delete(id);
  }
}
