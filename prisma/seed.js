const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // Create locations: 1 warehouse + 4 stores
  const wh = await prisma.location.upsert({
    where: { code: 'WH-01' },
    update: {},
    create: { code: 'WH-01', name: 'Gudang Pusat', type: 'warehouse' }
  });

  for (let i = 1; i <= 4; i++) {
    await prisma.location.upsert({
      where: { code: `STORE-0${i}` },
      update: {},
      create: { code: `STORE-0${i}`, name: `Toko ${i}`, type: 'store' }
    });
  }

  // Create 10 example products
  for (let i = 1; i <= 10; i++) {
    const sku = `SKU-${String(i).padStart(3,'0')}`;
    await prisma.product.upsert({
      where: { sku },
      update: {},
      create: { sku, name: `Produk ${i}`, unit: 'pcs' }
    });
  }

  // Initialize stock: put 100 units of each product in warehouse
  const products = await prisma.product.findMany();
  const warehouse = await prisma.location.findUnique({ where: { code: 'WH-01' }});

  for (const p of products) {
    await prisma.stockBalance.upsert({
      where: { productId_locationId: { productId: p.id, locationId: warehouse.id } },
      update: {},
      create: {
        productId: p.id,
        locationId: warehouse.id,
        qtyAvailable: 100,
        qtyPacking: 0
      }
    });
  }

  console.log('Seed data created');
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
