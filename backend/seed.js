const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
    await prisma.maintenanceRequest.deleteMany();
    await prisma.payment.deleteMany();
    await prisma.leaseAgreement.deleteMany();
    await prisma.propertyListing.deleteMany();
    await prisma.property.deleteMany();
    await prisma.user.deleteMany();

    const passwordHash = await bcrypt.hash('password123', 10);

    const admin = await prisma.user.create({
        data: { name: 'Admin User', email: 'admin@estatesync.com', phone: '1112223333', role: 'ADMIN', password: passwordHash }
    });

    const owner = await prisma.user.create({
        data: { name: 'Owner User', email: 'owner@estatesync.com', phone: '4445556666', role: 'OWNER', password: passwordHash }
    });

    const tenant = await prisma.user.create({
        data: { name: 'Tenant User', email: 'tenant@estatesync.com', phone: '7778889999', role: 'TENANT', password: passwordHash }
    });

    const prop1 = await prisma.property.create({
        data: { owner_id: owner.user_id, title: 'Skyline Apartments - Unit 402', address: '123 Main St', city: 'New York', rent_amount: 2500, status: 'LEASED' }
    });
    
    const prop2 = await prisma.property.create({
        data: { owner_id: owner.user_id, title: 'The Grand Plaza', address: '456 Broad St', city: 'New York', rent_amount: 3200, status: 'AVAILABLE' }
    });

    const lease = await prisma.leaseAgreement.create({
        data: { property_id: prop1.property_id, tenant_id: tenant.user_id, start_date: new Date(), end_date: new Date(new Date().setFullYear(new Date().getFullYear() + 1)), monthly_rent: 2500, lease_status: 'ACTIVE' }
    });

    await prisma.payment.create({
        data: { lease_id: lease.lease_id, amount: 2500, payment_date: new Date(), payment_mode: 'Credit Card', status: 'PAID' }
    });

    await prisma.maintenanceRequest.create({
        data: { property_id: prop1.property_id, tenant_id: tenant.user_id, issue_description: 'Emergency Leak - Unit 402: Severe water leakage from the master bathroom ceiling', request_status: 'OPEN' }
    });

    console.log('Database seeded! Logins: admin@estatesync.com, owner@estatesync.com, tenant@estatesync.com. Password for all: password123');
}

main().catch(e => {
    console.error(e);
    process.exit(1);
}).finally(async () => {
    await prisma.$disconnect();
});
