import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { APP_FILTER, APP_GUARD } from '@nestjs/core';
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
import { SentryModule } from '@sentry/nestjs/setup';
import { SentryGlobalFilter } from '@sentry/nestjs/setup';

const isDev = process.env.NODE_ENV !== 'production';

const getMailerConfig = () => {
  if (isDev) {
    return {
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
        options: { strict: true },
      },
    };
  } else {
    const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASSWORD, SMTP_FROM_EMAIL } =
      process.env;
    if (
      !SMTP_HOST ||
      !SMTP_PORT ||
      !SMTP_USER ||
      !SMTP_PASSWORD ||
      !SMTP_FROM_EMAIL
    ) {
      console.warn(
        'Missing SMTP environment variables for production mailer setup.',
      );
    }
    return {
      transport: {
        host: SMTP_HOST,
        port: Number(SMTP_PORT),
        ignoreTLS: false,
        secure: false,
        from: process.env.SMTP_FROM_EMAIL,
        auth: {
          user: SMTP_USER,
          pass: SMTP_PASSWORD,
        },
      },
      defaults: {
        from: `Justin Katasi <${SMTP_FROM_EMAIL || 'noreply@flexcars.com'}>`,
      },
      template: {
        dir: process.cwd() + '/src/templates',
        adapter: new HandlebarsAdapter(),
        options: { strict: true },
      },
    };
  }
};

@Module({
  imports: [
    SentryModule.forRoot(),
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
    MailerModule.forRoot(getMailerConfig()),
    TokensModule,
  ],
  controllers: [AppController, TokensController],
  providers: [
    {
      provide: APP_FILTER,
      useClass: SentryGlobalFilter,
    },
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
