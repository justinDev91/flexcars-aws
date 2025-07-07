import { Company, Invoice, PrismaClient, RentalService, Reservation, User, Vehicle, VehicleMaintenance } from '@prisma/client';
import { faker } from '@faker-js/faker';

const prisma = new PrismaClient();

async function main() {
  // Seed Companies
  const companies : Company[] = [];
  for (let i = 0; i < 30; i++) {
    const company = await prisma.company.create({
      data: {
        name: faker.company.name(),
        type: faker.helpers.arrayElement(['DEALERSHIP', 'RENTAL_AGENCY', 'BUSINESS']),
        address: faker.location.streetAddress(),
        vatNumber: faker.finance.accountNumber(),
        logoUrl: faker.image.url(),
      },
    });
    companies.push(company);
  }

  // Seed Users
  const users : User[]= [];
  for (let i = 0; i < 20; i++) {
    const user = await prisma.user.create({
      data: {
        email: faker.internet.email(),
        password: faker.internet.password(),
        firstName: faker.person.firstName(),
        lastName: faker.person.lastName(),
        phoneNumber: faker.phone.number(),
        birthDate: faker.date.birthdate(),
        avatar: faker.image.avatar(),
        emailConfirmed: faker.datatype.boolean(),
        emailConfirmToken: faker.string.uuid(),
        emailConfirmExpires: faker.date.future(),
        passwordResetToken: faker.string.uuid(),
        passwordResetExpires: faker.date.future(),
        passwordLastReset: faker.date.recent(),
        failedLoginAttempts: faker.number.int({ min: 0, max: 5 }),
        lockUntil: faker.date.future(),
        provider: faker.helpers.arrayElement(['google', 'facebook', 'local']),
        providerId: faker.string.uuid(),
        role: faker.helpers.arrayElement(['USER', 'ADMIN', 'MANAGER', 'CUSTOMER', 'CARSITTER']),
        companyId: faker.helpers.arrayElement(companies).id,
      },
    });
    users.push(user);
  }

  // Seed Vehicles
  const carImages = [
    'https://images.pexels.com/photos/358070/pexels-photo-358070.jpeg',
    'https://images.pexels.com/photos/210019/pexels-photo-210019.jpeg',
    'https://images.pexels.com/photos/1402787/pexels-photo-1402787.jpeg',
    'https://images.pexels.com/photos/1707828/pexels-photo-1707828.jpeg',
    'https://images.pexels.com/photos/112460/pexels-photo-112460.jpeg',
    'https://images.pexels.com/photos/164634/pexels-photo-164634.jpeg',
    'https://images.pexels.com/photos/170811/pexels-photo-170811.jpeg',
    'https://images.pexels.com/photos/358070/pexels-photo-358070.jpeg?auto=compress&w=800',
    'https://images.pexels.com/photos/210019/pexels-photo-210019.jpeg?auto=compress&w=800',
    'https://images.pexels.com/photos/1402787/pexels-photo-1402787.jpeg?auto=compress&w=800',
    'https://images.pexels.com/photos/1707828/pexels-photo-1707828.jpeg?auto=compress&w=800',
    'https://images.pexels.com/photos/112460/pexels-photo-112460.jpeg?auto=compress&w=800',
    'https://images.pexels.com/photos/164634/pexels-photo-164634.jpeg?auto=compress&w=800',
    'https://images.pexels.com/photos/170811/pexels-photo-170811.jpeg?auto=compress&w=800',
    'https://images.pexels.com/photos/358070/pexels-photo-358070.jpeg?auto=compress&w=1200',
    'https://images.pexels.com/photos/210019/pexels-photo-210019.jpeg?auto=compress&w=1200',
    'https://images.pexels.com/photos/1402787/pexels-photo-1402787.jpeg?auto=compress&w=1200',
    'https://images.pexels.com/photos/1707828/pexels-photo-1707828.jpeg?auto=compress&w=1200',
    'https://images.pexels.com/photos/112460/pexels-photo-112460.jpeg?auto=compress&w=1200',
    'https://images.pexels.com/photos/164634/pexels-photo-164634.jpeg?auto=compress&w=1200'
  ];
  const vehicles : Vehicle[] = [];
  for (let i = 0; i < 20; i++) {
    const vehicle = await prisma.vehicle.create({
      data: {
        companyId: faker.helpers.arrayElement(companies).id,
        brand: faker.vehicle.manufacturer(),
        model: faker.vehicle.model(),
        year: faker.date.past().getFullYear(),
        plateNumber: faker.vehicle.vrm(),
        fuelType: faker.helpers.arrayElement(['PETROL', 'DIESEL', 'ELECTRIC', 'HYBRID']),
        currentMileage: faker.number.int({ min: 1000, max: 200000 }),
        gpsEnabled: faker.datatype.boolean(),
        status: faker.helpers.arrayElement(['AVAILABLE', 'RESERVED', 'RENTED', 'MAINTENANCE', 'INCIDENT']),
        locationLat: faker.location.latitude(),
        locationLng: faker.location.longitude(),
        imageUrl: carImages[i],
      },
    });
    vehicles.push(vehicle);
  }

   // Seed PricingRules
  for (const vehicle of vehicles) {
    await prisma.pricingRule.create({
      data: {
        vehicleId: vehicle.id,
        durationType: faker.helpers.arrayElement(['HOURLY', 'DAILY', 'WEEKLY']),
        basePrice: faker.number.float({ min: 10, max: 100 }),
        dynamicMultiplier: faker.number.float({ min: 1, max: 2 }),
        type: faker.helpers.arrayElement(['RENTAL', 'ACCIDENT', 'LATER_PENALTY']),
        season: faker.date.month(),
      },
    });
  }

  // Seed VehicleMaintenance
  const maintenances : VehicleMaintenance[] = [];
  for (let i = 0; i < 5; i++) {
    const maintenance = await prisma.vehicleMaintenance.create({
      data: {
        vehicleId: faker.helpers.arrayElement(vehicles).id,
        type: faker.helpers.arrayElement(['OIL_CHANGE', 'INSPECTION', 'REPAIR']),
        scheduledDate: faker.date.future(),
        mileageTrigger: faker.number.int({ min: 10000, max: 200000 }),
        recurring: faker.datatype.boolean(),
        completedDate: faker.date.future(),
        status: faker.helpers.arrayElement(['PENDING', 'DONE', 'OVERDUE']),
        notes: faker.lorem.sentence(),
      },
    });
    maintenances.push(maintenance);
  }

  // Seed MaintenanceAlert
  for (let i = 0; i < 5; i++) {
    await prisma.maintenanceAlert.create({
      data: {
        vehicleId: faker.helpers.arrayElement(vehicles).id,
        maintenanceId: faker.helpers.arrayElement(maintenances).id,
        alertDate: faker.date.recent(),
        alertType: faker.helpers.arrayElement(['UPCOMING', 'OVERDUE', 'MILEAGE']),
        message: faker.lorem.sentence(),
        resolved: faker.datatype.boolean(),
      },
    });
  }

  // Seed RentalServices
  const services : RentalService[] = [];
  for (let i = 0; i < 5; i++) {
    const service = await prisma.rentalService.create({
      data: {
        name: faker.commerce.productName(),
        pricePerDay: faker.number.float({ min: 5, max: 100 }),
      },
    });
    services.push(service);
  }

  // Seed Reservations
  const reservations : Reservation[] = [];
  for (let i = 0; i < 10; i++) {
    const reservation = await prisma.reservation.create({
      data: {
        vehicleId: faker.helpers.arrayElement(vehicles).id,
        customerId: faker.helpers.arrayElement(users).id,
        startDatetime: faker.date.soon(),
        endDatetime: faker.date.future(),
        pickupLocation: faker.helpers.arrayElement(['SAINT_DENIS', 'ISSY_LES_MOULINEAUX']),
        dropoffLocation: faker.helpers.arrayElement(['SAINT_DENIS', 'ISSY_LES_MOULINEAUX']),
        carSittingOption: faker.datatype.boolean(),
        status: faker.helpers.arrayElement(['PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED']),
        totalPrice: faker.number.float({ min: 50, max: 500 }),
      },
    });
    reservations.push(reservation);
  }

  // Seed RentalContracts
  for (const reservation of reservations) {
    const customer = faker.helpers.arrayElement(users);
    const agent = faker.helpers.arrayElement(users);
    await prisma.rentalContract.create({
      data: {
        reservationId: reservation.id,
        pdfUrl: faker.internet.url(),
        signedByCustomerId: customer.id,
        signedByAgentId: agent.id,
        signedAt: faker.date.recent(),
      },
    });
  }

  // Seed Documents
  for (const user of users) {
    await prisma.document.create({
      data: {
        userId: user.id,
        type: faker.helpers.arrayElement(['ID_CARD', 'DRIVER_LICENSE', 'PROOF_OF_ADDRESS']),
        fileUrl: faker.internet.url(),
        verified: faker.datatype.boolean(),
      },
    });
  }

  // Seed Invoices
  const invoices : Invoice [] = [];
  for (const reservation of reservations) {
    const invoice = await prisma.invoice.create({
      data: {
        reservationId: reservation.id,
        invoiceNumber: faker.string.uuid(),
        amount: faker.number.float({ min: 100, max: 1000 }),
        dueDate: faker.date.future(),
        paidAt: faker.date.recent(),
        status: faker.helpers.arrayElement(['PAID', 'UNPAID', 'OVERDUE']),
        penaltyAmount: faker.number.float({ min: 0, max: 100 }),
      },
    });
    invoices.push(invoice);
  }

  // Seed Payments
  for (const invoice of invoices) {
    await prisma.payment.create({
      data: {
        invoiceId: invoice.id,
        method: faker.helpers.arrayElement(['STRIPE', 'PAYPAL', 'BANK_TRANSFER']),
        transactionId: faker.string.uuid(),
        paidAt: faker.date.recent(),
        status: faker.helpers.arrayElement(['SUCCESS', 'FAILED', 'PENDING']),
      },
    });
  }

  // Seed ReservationServices
  for (const reservation of reservations) {
    await prisma.reservationService.create({
      data: {
        reservationId: reservation.id,
        serviceId: faker.helpers.arrayElement(services).id,
      },
    });
  }

  // Seed Incidents
  for (let i = 0; i < 5; i++) {
    await prisma.incident.create({
      data: {
        vehicleId: faker.helpers.arrayElement(vehicles).id,
        reportedById: faker.helpers.arrayElement(users).id,
        description: faker.lorem.sentence(),
        reservationId: faker.helpers.arrayElement(reservations).id,
        location: faker.location.city(),
        severity: faker.helpers.arrayElement(['LOW', 'MEDIUM', 'HIGH']),
        photosUrl: faker.image.url(),
        status: faker.helpers.arrayElement(['OPEN', 'RESOLVED', 'IN_REVIEW']),
        reportedAt: faker.date.recent(),
        resolvedAt: faker.date.future(),
      },
    });
  }

  // Seed CarSitters
  for (const user of users.filter(u => u.role === 'CARSITTER')) {
    await prisma.carSitter.create({
      data: {
        userId: user.id,
        assignedVehicleId: faker.helpers.arrayElement(vehicles).id,
        currentLocationLat: faker.location.latitude(),
        currentLocationLng: faker.location.longitude(),
        availability: faker.helpers.arrayElement(['AVAILABLE', 'BUSY']),
        lastActiveAt: faker.date.recent(),
      },
    });
  }

  // Seed Notifications
  for (let i = 0; i < 20; i++) {
    await prisma.notification.create({
      data: {
        userId: faker.helpers.arrayElement(users).id,
        type: faker.helpers.arrayElement(['EMAIL', 'SMS', 'PUSH']),
        title: faker.lorem.sentence(),
        message: faker.lorem.paragraph(),
        sentAt: faker.date.recent(),
        isRead: faker.datatype.boolean(),
      },
    });
  }

  console.log('✅ All data seeded successfully');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
});