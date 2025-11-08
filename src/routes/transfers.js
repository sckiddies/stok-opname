const express = require('express');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const router = express.Router();

// Create transfer request
router.post('/', async (req, res) => {
  const { fromId, toId, lines, notes } = req.body;
  if (!fromId || !toId || !Array.isArray(lines)) return res.status(400).json({ error: 'invalid' });

  const transfer = await prisma.transfer.create({
    data: {
      fromId,
      toId,
      notes,
      lines: { create: lines.map(l => ({ productId: l.productId, qty: l.qty })) }
    },
    include: { lines: true }
  });

  res.json(transfer);
});

// Ship transfer: move from qtyAvailable -> qtyPacking in from location
router.post('/:id/ship', async (req, res) => {
  const id = Number(req.params.id);
  const t = await prisma.transfer.findUnique({ where: { id }, include: { lines: true }});
  if (!t) return res.status(404).json({ error: 'not found' });

  await prisma.$transaction(async (tx) => {
    for (const line of t.lines) {
      await tx.stockBalance.upsert({
        where: { productId_locationId: { productId: line.productId, locationId: t.fromId } },
        update: { qtyAvailable: { decrement: line.qty }, qtyPacking: { increment: line.qty }, lastUpdated: new Date() },
        create: { productId: line.productId, locationId: t.fromId, qtyAvailable: 0 - line.qty, qtyPacking: line.qty }
      });
      await tx.stockMovement.create({
        data: { productId: line.productId, locationId: t.fromId, change: -line.qty, reason: 'transfer_out', refId: id }
      });
    }
    await tx.transfer.update({ where: { id }, data: { status: 'shipped', shippedAt: new Date() }});
  });

  res.json({ ok: true });
});

// Receive transfer: decrease qtyPacking in from, increase qtyAvailable in to
router.post('/:id/receive', async (req, res) => {
  const id = Number(req.params.id);
  const t = await prisma.transfer.findUnique({ where: { id }, include: { lines: true }});
  if (!t) return res.status(404).json({ error: 'not found' });

  await prisma.$transaction(async (tx) => {
    for (const line of t.lines) {
      await tx.stockBalance.updateMany({
        where: { productId: line.productId, locationId: t.fromId },
        data: { qtyPacking: { decrement: line.qty }, lastUpdated: new Date() }
      });

      await tx.stockBalance.upsert({
        where: { productId_locationId: { productId: line.productId, locationId: t.toId } },
        update: { qtyAvailable: { increment: line.qty }, lastUpdated: new Date() },
        create: { productId: line.productId, locationId: t.toId, qtyAvailable: line.qty, qtyPacking: 0 }
      });

      await tx.stockMovement.create({
        data: { productId: line.productId, locationId: t.toId, change: line.qty, reason: 'transfer_in', refId: id }
      });
    }
    await tx.transfer.update({ where: { id }, data: { status: 'received', receivedAt: new Date() }});
  });

  res.json({ ok: true });
});

module.exports = router;
