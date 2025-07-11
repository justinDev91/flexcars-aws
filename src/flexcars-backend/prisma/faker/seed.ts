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

  // Images de haute qualité pour véhicules de location
  const genericCarImages = [
    'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800&auto=format&fit=crop', // BMW rouge sportive
    'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800&auto=format&fit=crop', // Voiture bleue moderne
    'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=800&auto=format&fit=crop', // SUV moderne
    'https://images.unsplash.com/photo-1609521263047-f8f205293f24?w=800&auto=format&fit=crop', // Voiture compacte
    'https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=800&auto=format&fit=crop', // Voiture citadine
    'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=800&auto=format&fit=crop', // Voiture premium
  ];

  // Fonction pour générer un statut de véhicule avec plus de disponibles
  const getVehicleStatus = () => {
    const random = Math.random();
    if (random < 0.65) return 'AVAILABLE';      // 65% disponibles
    if (random < 0.8) return 'RESERVED';        // 15% réservés
    if (random < 0.9) return 'RENTED';          // 10% loués
    if (random < 0.97) return 'MAINTENANCE';    // 7% en maintenance
    return 'INCIDENT';                          // 3% en incident
  };

  // Véhicules populaires avec marques/modèles spécifiques et images correspondantes
  const popularVehicles = [
    { 
      brand: 'Renault', 
      model: 'Clio', 
      fuelType: 'PETROL' as const,
      imageUrl: 'https://images.unsplash.com/photo-1609521263047-f8f205293f24?w=800&auto=format&fit=crop&q=80' // Renault Clio compacte
    },
    { 
      brand: 'Peugeot', 
      model: '208', 
      fuelType: 'PETROL' as const,
      imageUrl: 'https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=800&auto=format&fit=crop&q=80' // Peugeot 208 citadine
    },
    { 
      brand: 'Citroën', 
      model: 'C3', 
      fuelType: 'DIESEL' as const,
      imageUrl: 'https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=800&auto=format&fit=crop&q=80' // Citroën C3 compacte
    },
    { 
      brand: 'Volkswagen', 
      model: 'Golf', 
      fuelType: 'PETROL' as const,
      imageUrl: 'https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=800&auto=format&fit=crop&q=80' // VW Golf moderne
    },
    { 
      brand: 'BMW', 
      model: 'Série 3', 
      fuelType: 'DIESEL' as const,
      imageUrl: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800&auto=format&fit=crop&q=80' // BMW Série 3 sportive
    },
    { 
      brand: 'Mercedes', 
      model: 'Classe A', 
      fuelType: 'PETROL' as const,
      imageUrl: 'https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=800&auto=format&fit=crop&q=80' // Mercedes élégante
    },
    { 
      brand: 'Audi', 
      model: 'A3', 
      fuelType: 'DIESEL' as const,
      imageUrl: 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=800&auto=format&fit=crop&q=80' // Audi A3 premium
    },
    { 
      brand: 'Tesla', 
      model: 'Model 3', 
      fuelType: 'ELECTRIC' as const,
      imageUrl: 'https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=800&auto=format&fit=crop&q=80&sat=-100&brightness=110' // Tesla Model 3 électrique
    },
    { 
      brand: 'Nissan', 
      model: 'Leaf', 
      fuelType: 'ELECTRIC' as const,
      imageUrl: 'https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=800&auto=format&fit=crop&q=80' // Nissan Leaf électrique
    },
    { 
      brand: 'Toyota', 
      model: 'Prius', 
      fuelType: 'HYBRID' as const,
      imageUrl: 'https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=800&auto=format&fit=crop&q=80' // Toyota Prius hybride
    },
  ];

  const vehicles : Vehicle[] = [];

  // Créer des véhicules populaires (premiers 10)
  for (let i = 0; i < 10; i++) {
    const popularVehicle = popularVehicles[i];
    const vehicle = await prisma.vehicle.create({
      data: {
        companyId: faker.helpers.arrayElement(companies).id,
        brand: popularVehicle.brand,
        model: popularVehicle.model,
        year: faker.number.int({ min: 2020, max: 2024 }), // Véhicules récents
        plateNumber: faker.vehicle.vrm(),
        fuelType: popularVehicle.fuelType,
        currentMileage: faker.number.int({ min: 5000, max: 80000 }),
        gpsEnabled: true, // GPS activé pour les véhicules populaires
        status: i < 7 ? 'AVAILABLE' : getVehicleStatus(), // 7 premiers disponibles
        locationLat: faker.location.latitude({ min: 48.8, max: 48.9 }),
        locationLng: faker.location.longitude({ min: 2.2, max: 2.4 }),
        imageUrl: popularVehicle.imageUrl, // Image spécifique au modèle
      },
    });
    vehicles.push(vehicle);
  }

  // Créer des véhicules aléatoires (20 restants)
  for (let i = 10; i < 30; i++) {
    const vehicle = await prisma.vehicle.create({
      data: {
        companyId: faker.helpers.arrayElement(companies).id,
        brand: faker.vehicle.manufacturer(),
        model: faker.vehicle.model(),
        year: faker.number.int({ min: 2018, max: 2024 }),
        plateNumber: faker.vehicle.vrm(),
        fuelType: faker.helpers.arrayElement(['PETROL', 'DIESEL', 'ELECTRIC', 'HYBRID']),
        currentMileage: faker.number.int({ min: 5000, max: 150000 }),
        gpsEnabled: faker.datatype.boolean({ probability: 0.8 }),
        status: getVehicleStatus(),
        locationLat: faker.location.latitude({ min: 48.8, max: 48.9 }),
        locationLng: faker.location.longitude({ min: 2.2, max: 2.4 }),
        imageUrl: genericCarImages[(i - 10) % genericCarImages.length], // Images génériques de qualité
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

  // Seed CarSitters - Créer des utilisateurs carsitters spécifiques
  const carSitterUsers: User[] = [];
  const carSitterNames = [
    { firstName: 'Jean', lastName: 'Dupont', email: 'jean.dupont@carsitter.fr' },
    { firstName: 'Marie', lastName: 'Martin', email: 'marie.martin@carsitter.fr' },
    { firstName: 'Pierre', lastName: 'Durand', email: 'pierre.durand@carsitter.fr' },
    { firstName: 'Sophie', lastName: 'Leroy', email: 'sophie.leroy@carsitter.fr' },
    { firstName: 'Antoine', lastName: 'Moreau', email: 'antoine.moreau@carsitter.fr' }
  ];

  for (const carSitterData of carSitterNames) {
    const carSitterUser = await prisma.user.create({
      data: {
        email: carSitterData.email,
        password: '$2b$10$K7L/8Y75aIqUlzHrvdCOa.HL/sEP6O1b4rQfgxQ8/Z8yPe7z9C6EO', // password = 'password123'
        firstName: carSitterData.firstName,
        lastName: carSitterData.lastName,
        phoneNumber: `+33 6 ${faker.string.numeric(2)} ${faker.string.numeric(2)} ${faker.string.numeric(2)} ${faker.string.numeric(2)}`,
        birthDate: faker.date.birthdate({ min: 25, max: 60, mode: 'age' }),
        emailConfirmed: true,
        role: 'CARSITTER',
        companyId: faker.helpers.arrayElement(companies).id,
      },
    });
    carSitterUsers.push(carSitterUser);
  }

  // Créer les profils CarSitter
  for (const user of carSitterUsers) {
    await prisma.carSitter.create({
      data: {
        userId: user.id,
        currentLocationLat: faker.location.latitude({ min: 48.8, max: 48.9 }), // Paris area
        currentLocationLng: faker.location.longitude({ min: 2.2, max: 2.4 }), // Paris area
        availability: 'AVAILABLE', // Tous disponibles pour les tests
        lastActiveAt: faker.date.recent(),
      },
    });
  }

  // Seed CarSitters pour les utilisateurs existants avec le rôle CARSITTER
  for (const user of users.filter(u => u.role === 'CARSITTER')) {
    await prisma.carSitter.create({
      data: {
        userId: user.id,
        currentLocationLat: faker.location.latitude({ min: 48.8, max: 48.9 }),
        currentLocationLng: faker.location.longitude({ min: 2.2, max: 2.4 }),
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