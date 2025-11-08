const express = require('express');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const router = express.Router();

router.get('/', async (req, res) => {
  const locations = await prisma.location.findMany();
  res.json(locations);
});

module.exports = router;
