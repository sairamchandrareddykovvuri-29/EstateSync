const prisma = require('../config/db');

const getListings = async (req, res) => {
    try {
        const listings = await prisma.propertyListing.findMany({
            where: { is_active: true },
            include: { property: true }
        });
        res.json(listings);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

const toggleListingStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { is_active } = req.body;

        const listing = await prisma.propertyListing.findUnique({
            where: { listing_id: parseInt(id) },
            include: { property: true }
        });

        if (!listing) return res.status(404).json({ message: 'Listing not found' });

        if (req.user.role === 'OWNER' && listing.property.owner_id !== req.user.id) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        const updatedListing = await prisma.propertyListing.update({
            where: { listing_id: parseInt(id) },
            data: { is_active: Boolean(is_active) }
        });

        res.json(updatedListing);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
}

module.exports = { getListings, toggleListingStatus };
