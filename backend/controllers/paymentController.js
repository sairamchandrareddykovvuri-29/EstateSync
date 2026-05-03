const prisma = require('../config/db');

const getPayments = async (req, res) => {
    try {
        let filters = {};

        if (req.user.role === 'TENANT') {
            filters.tenant_id = req.user.id;
        } else if (req.user.role === 'OWNER') {
            filters.lease = {
                property: {
                    owner_id: req.user.id
                }
            };
        }

        const payments = await prisma.payment.findMany({
            where: filters,
            include: { 
                lease: { 
                    include: { 
                        property: true, 
                        tenant: { select: { name: true, email: true } } 
                    } 
                } 
            }
        });

        res.json(payments);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

const recordPayment = async (req, res) => {
    try {
        const { amount, payment_mode } = req.body;

        const activeLease = await prisma.leaseAgreement.findFirst({
            where: { tenant_id: req.user.id, lease_status: 'ACTIVE' }
        });

        if (!activeLease) return res.status(400).json({ message: 'No active lease found' });

        const payment = await prisma.payment.create({
            data: {
                lease_id: activeLease.lease_id,
                tenant_id: req.user.id,
                amount: parseFloat(amount),
                payment_mode: payment_mode || 'UPI',
                status: 'PENDING'
            }
        });

        res.status(201).json(payment);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

const updatePaymentStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const currentPayment = await prisma.payment.findUnique({
            where: { payment_id: parseInt(id) },
            include: { lease: { include: { property: true } } }
        });

        if (!currentPayment) return res.status(404).json({ message: 'Payment not found' });

        if (currentPayment.lease.property.owner_id !== req.user.id && req.user.role !== 'ADMIN') {
            return res.status(403).json({ message: 'Not authorized' });
        }

        const payment = await prisma.payment.update({
            where: { payment_id: parseInt(id) },
            data: { status }
        });

        res.json(payment);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

module.exports = { getPayments, recordPayment, updatePaymentStatus };
