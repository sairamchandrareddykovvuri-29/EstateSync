const fs = require('fs');
const csv = require('csv-parser');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const bcrypt = require('bcryptjs');

const parseCSV = (filePath) => {
    return new Promise((resolve, reject) => {
        const results = [];
        fs.createReadStream(filePath)
            .pipe(csv())
            .on('data', (data) => results.push(data))
            .on('end', () => resolve(results))
            .on('error', (err) => reject(err));
    });
};

async function main() {
    console.log('Reading CSVs...');
    const users = await parseCSV('../01_users.csv');
    const properties = await parseCSV('../02_properties.csv');
    const listings = await parseCSV('../03_property_listings.csv');
    const leases = await parseCSV('../04_lease_agreements.csv');
    const payments = await parseCSV('../05_payments.csv');
    const maintenance = await parseCSV('../06_maintenance_requests.csv');

    console.log('Clearing database...');
    await prisma.payment.deleteMany();
    await prisma.maintenanceRequest.deleteMany();
    await prisma.leaseAgreement.deleteMany();
    await prisma.propertyListing.deleteMany();
    await prisma.property.deleteMany();
    await prisma.user.deleteMany();

    console.log('Inserting Users...');
    const defaultPassword = await bcrypt.hash('password123', 10);
    for (const u of users) {
        if (!u.user_id) continue;
        await prisma.user.create({
            data: {
                user_id: parseInt(u.user_id),
                name: u.name,
                email: u.email,
                phone: u.phone,
                role: u.role,
                password: defaultPassword,
                created_at: new Date(u.created_at)
            }
        });
    }

    console.log('Inserting Properties...');
    for (const p of properties) {
        if (!p.property_id) continue;
        await prisma.property.create({
            data: {
                property_id: parseInt(p.property_id),
                owner_id: parseInt(p.owner_id),
                title: p.title,
                address: p.address,
                city: p.city,
                rent_amount: parseFloat(p.rent_amount),
                status: p.status
            }
        });
    }

    console.log('Inserting Listings...');
    for (const l of listings) {
        if (!l.listing_id) continue;
        await prisma.propertyListing.create({
            data: {
                listing_id: parseInt(l.listing_id),
                property_id: parseInt(l.property_id),
                listing_date: new Date(l.listing_date),
                description: l.description,
                is_active: l.is_active === '1'
            }
        });
    }

    console.log('Inserting Leases...');
    for (const l of leases) {
        if (!l.lease_id) continue;
        await prisma.leaseAgreement.create({
            data: {
                lease_id: parseInt(l.lease_id),
                property_id: parseInt(l.property_id),
                tenant_id: parseInt(l.tenant_id),
                start_date: new Date(l.start_date),
                end_date: new Date(l.end_date),
                monthly_rent: parseFloat(l.monthly_rent),
                lease_status: l.lease_status
            }
        });
    }

    console.log('Inserting Payments...');
    for (const p of payments) {
        if (!p.payment_id) continue;
        await prisma.payment.create({
            data: {
                payment_id: parseInt(p.payment_id),
                lease_id: parseInt(p.lease_id),
                amount: parseFloat(p.amount),
                payment_date: new Date(p.payment_date),
                payment_mode: p.payment_mode,
                status: p.status
            }
        });
    }

    console.log('Inserting Maintenance Requests...');
    for (const m of maintenance) {
        if (!m.request_id) continue;
        await prisma.maintenanceRequest.create({
            data: {
                request_id: parseInt(m.request_id),
                property_id: parseInt(m.property_id),
                tenant_id: parseInt(m.tenant_id),
                issue_description: m.issue_description,
                request_date: new Date(m.request_date),
                request_status: m.request_status
            }
        });
    }

    console.log('Successfully imported all CSV data into MySQL via Prisma!');
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
