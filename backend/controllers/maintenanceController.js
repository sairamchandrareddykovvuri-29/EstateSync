const prisma = require('../config/db');

const getRequests = async (req, res) => {
    try {
        let filters = {};

        if (req.user.role === 'TENANT') {
            filters.tenant_id = req.user.id;
        } else if (req.user.role === 'OWNER') {
            // Find properties owned by this owner
            const properties = await prisma.property.findMany({ where: { owner_id: req.user.id }});
            const propertyIds = properties.map(p => p.property_id);
            filters.property_id = { in: propertyIds };
        }

        const requests = await prisma.maintenanceRequest.findMany({
            where: filters,
            include: { property: true, tenant: { select: { name: true, email: true } } }
        });

        res.json(requests);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

const raiseRequest = async (req, res) => {
    try {
        const { issue_description } = req.body;

        const activeLease = await prisma.leaseAgreement.findFirst({
            where: { tenant_id: req.user.id, lease_status: 'ACTIVE' }
        });

        if (!activeLease) return res.status(403).json({ message: 'No active lease found' });
        
        const request = await prisma.maintenanceRequest.create({
            data: {
                property_id: activeLease.property_id,
                tenant_id: req.user.id,
                issue_description,
                request_status: 'OPEN'
            }
        });

        res.status(201).json(request);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

const updateRequestStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { request_status } = req.body;

        const request = await prisma.maintenanceRequest.findUnique({
            where: { request_id: parseInt(id) },
            include: { property: true }
        });

        if (!request) return res.status(404).json({ message: 'Request not found' });

        if (req.user.role === 'OWNER' && request.property.owner_id !== req.user.id) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        const updatedRequest = await prisma.maintenanceRequest.update({
            where: { request_id: parseInt(id) },
            data: { request_status }
        });

        res.json(updatedRequest);
    } catch (error) {
         res.status(500).json({ message: 'Server error', error: error.message });
    }
}

module.exports = { getRequests, raiseRequest, updateRequestStatus };
