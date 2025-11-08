const express = require('express');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const router = express.Router();

router.get('/', async (req, res) => {
  const { locationId } = req.query;
  const where = {};
  if (locationId) where.locationId = Number(locationId);

  const rows = await prisma.stockBalance.findMany({
    where,
    include: { product: true, location: true }
  });

  res.json(rows.map(r => ({
    productId: r.productId,
    sku: r.product.sku,
    productName: r.product.name,
    locationId: r.locationId,
    locationName: r.location.name,
    qtyAvailable: r.qtyAvailable,
    qtyPacking: r.qtyPacking,
    lastUpdated: r.lastUpdated
  })));
});

module.exports = router;
