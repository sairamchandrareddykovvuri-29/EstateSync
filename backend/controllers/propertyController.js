const prisma = require('../config/db');

const getProperties = async (req, res) => {
    try {
        const { city, min_rent, max_rent, status } = req.query;
        let filters = {};

        if (city) filters.city = { contains: city };
        if (status) filters.status = status;
        if (min_rent || max_rent) {
            filters.rent_amount = {};
            if (min_rent) filters.rent_amount.gte = parseFloat(min_rent);
            if (max_rent) filters.rent_amount.lte = parseFloat(max_rent);
        }

        if (req.user.role === 'OWNER') {
            filters.owner_id = req.user.id;
        } else if (req.user.role === 'TENANT') {
            filters.leases = {
                some: { tenant_id: req.user.id, lease_status: 'ACTIVE' }
            };
        }

        const properties = await prisma.property.findMany({
            where: filters,
            include: { 
                owner: { select: { name: true, email: true } },
                leases: {
                    include: { tenant: { select: { name: true, email: true, phone: true } } }
                }
            }
        });

        res.json(properties);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

const addProperty = async (req, res) => {
    try {
        const { title, address, city, rent_amount, status, property_type } = req.body;
        
        const property = await prisma.property.create({
            data: {
                title,
                address,
                city,
                rent_amount: parseFloat(rent_amount),
                status: status || 'AVAILABLE',
                property_type: property_type || 'HOUSE',
                owner_id: req.user.id
            }
        });

        res.status(201).json(property);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

const updateProperty = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, address, city, rent_amount, status, property_type } = req.body;

        const property = await prisma.property.findUnique({ where: { property_id: parseInt(id) } });

        if (!property) return res.status(404).json({ message: 'Property not found' });

        if (property.owner_id !== req.user.id && req.user.role !== 'ADMIN') {
             return res.status(403).json({ message: 'Not authorized' });
        }

        const updatedProperty = await prisma.property.update({
            where: { property_id: parseInt(id) },
            data: {
                title: title || property.title,
                address: address || property.address,
                city: city || property.city,
                rent_amount: rent_amount ? parseFloat(rent_amount) : property.rent_amount,
                status: status || property.status,
                property_type: property_type || property.property_type
            }
        });

        res.json(updatedProperty);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

const deleteProperty = async (req, res) => {
     try {
        const { id } = req.params;
        const property = await prisma.property.findUnique({ where: { property_id: parseInt(id) } });

        if (!property) return res.status(404).json({ message: 'Property not found' });

        if (property.owner_id !== req.user.id && req.user.role !== 'ADMIN') {
             return res.status(403).json({ message: 'Not authorized' });
        }

        await prisma.property.delete({ where: { property_id: parseInt(id) } });
        res.json({ message: 'Property deleted' });
     } catch (error) {
         res.status(500).json({ message: 'Server error', error: error.message });
     }
}

module.exports = { getProperties, addProperty, updateProperty, deleteProperty };
