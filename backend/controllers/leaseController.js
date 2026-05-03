const prisma = require('../config/db');

const getLeases = async (req, res) => {
    try {
        let filters = {};
        if (req.user.role === 'TENANT') {
            filters.tenant_id = req.user.id;
        } else if (req.user.role === 'OWNER') {
            const properties = await prisma.property.findMany({ where: { owner_id: req.user.id }});
            filters.property_id = { in: properties.map(p => p.property_id) };
        }

        const leases = await prisma.leaseAgreement.findMany({
            where: filters,
            include: { property: true, tenant: { select: { name: true, email: true } } }
        });

        res.json(leases);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

const createLease = async (req, res) => {
    try {
        const { property_id, tenant_id, start_date, end_date, monthly_rent } = req.body;
        
        const propIdInt = parseInt(property_id);
        const tenantIdInt = parseInt(tenant_id);

        const property = await prisma.property.findUnique({ where: { property_id: propIdInt } });
        if (!property) return res.status(404).json({ message: 'Property not found' });

        if (property.owner_id !== req.user.id && req.user.role !== 'ADMIN') {
            return res.status(403).json({ message: 'Not authorized' });
        }

        if (property.property_type === 'HOUSE') {
            const activeCount = await prisma.leaseAgreement.count({
                where: { property_id: propIdInt, lease_status: 'ACTIVE' }
            });
            if (activeCount > 0) {
                return res.status(409).json({ message: 'House already has an active lease' });
            }
        }

        const lease = await prisma.$transaction(async (tx) => {
            const newLease = await tx.leaseAgreement.create({
                data: {
                    property_id: propIdInt,
                    tenant_id: tenantIdInt,
                    start_date: new Date(start_date),
                    end_date: new Date(end_date),
                    monthly_rent: parseFloat(monthly_rent),
                    lease_status: 'ACTIVE'
                }
            });

            await tx.property.update({
                where: { property_id: propIdInt },
                data: { status: 'LEASED' }
            });

            await tx.propertyListing.updateMany({
                where: { property_id: propIdInt },
                data: { is_active: false }
            });

            return newLease;
        });

        res.status(201).json(lease);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

const updateLeaseStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { lease_status } = req.body;
        const leaseIdInt = parseInt(id);

        const currentLease = await prisma.leaseAgreement.findUnique({
            where: { lease_id: leaseIdInt },
            include: { property: true }
        });

        if (!currentLease) return res.status(404).json({ message: 'Lease not found' });

        if (currentLease.property.owner_id !== req.user.id && req.user.role !== 'ADMIN') {
            return res.status(403).json({ message: 'Not authorized' });
        }

        const lease = await prisma.$transaction(async (tx) => {
            const updated = await tx.leaseAgreement.update({
                where: { lease_id: leaseIdInt },
                data: { lease_status }
            });

            if (lease_status === 'ENDED') {
                const remainingActive = await tx.leaseAgreement.count({
                    where: { property_id: currentLease.property_id, lease_status: 'ACTIVE' }
                });

                if (remainingActive === 0) {
                    await tx.property.update({
                        where: { property_id: currentLease.property_id },
                        data: { status: 'AVAILABLE' }
                    });

                    await tx.propertyListing.updateMany({
                        where: { property_id: currentLease.property_id },
                        data: { is_active: true }
                    });
                }
            }

            return updated;
        });

        res.json(lease);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

module.exports = { getLeases, createLease, updateLeaseStatus };
