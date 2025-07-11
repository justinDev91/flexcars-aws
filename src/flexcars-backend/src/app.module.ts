import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthGuard } from './auth/auth.guard';
import { AuthModule } from './auth/auth.module';
import { PrismaService } from './prisma.service';
import { TokensController } from './tokens/tokens.controller';
import { TokensModule } from './tokens/tokens.module';
import { TokensService } from './tokens/tokens.service';
import { EventsGateway } from './events/events.gateway';
import { UsersModule } from './users/users.module';
import { CompaniesModule } from './company/company.module';
import { VehiclesModule } from './vehicle/vehicle.module';
import { MaintenancesModule } from './maintenance/maintenance.module';
import { ReservationModule } from './reservation/reservation.module';
import { RentalContractsModule } from './rentalcontract/rental-contract.module';
import { InvoicesModule } from './invoice/invoice.module';
import { DocumentModule } from './document/document.module';
import { PaymentModule } from './payment/payment.module';
import { RentalServiceModule } from './rentalservice/rentalservice.module';
import { ReservationServiceModule } from './reservationservice/reservationservice.module';
import { PricingRuleModule } from './pricingrule/pricing.rule.module';
import { IncidentModule } from './incident/incident.module';
import { CarSitterModule } from './carsitter/cars-sitter.module';
import { NotificationModule } from './notification/notification.module';
import { VehicleRecommendationModule } from './vehiclerecommendation/vehicle-recommendation.module';
import { MaintenanceAlertModule } from './Maintenancealert/maintenance-alert.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ServeStaticModule.forRoot({
      rootPath: join(process.cwd(), 'uploads'),
      serveRoot: '/uploads',
    }),
    AuthModule,
    UsersModule,
    CompaniesModule,
    VehiclesModule,
    MaintenancesModule,
    MaintenanceAlertModule,
    ReservationModule,
    RentalContractsModule,
    InvoicesModule,
    DocumentModule,
    PaymentModule,
    RentalServiceModule,
    ReservationServiceModule,
    PricingRuleModule,
    IncidentModule,
    CarSitterModule,
    NotificationModule,
    VehicleRecommendationModule,
    MailerModule.forRoot({
      transport: {
        host: 'localhost',
        port: 1025,
        ignoreTLS: true,
        secure: false,
      },
      defaults: {
        from: '"Justin Katasi" <justinkatasi.dev@gmail.com>',
      },
      template: {
        dir: process.cwd() + '/src/templates',
        adapter: new HandlebarsAdapter(),
        options: {
          strict: true,
        },
      },
    }),
    TokensModule,
  ],
  controllers: [AppController, TokensController],
  providers: [
    AppService,
    PrismaService,
    TokensService,
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
    EventsGateway,
  ],
})
export class AppModule {}
