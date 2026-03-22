import { PrismaClient, ItemType, OrderStatus, ClubUserRole } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // 1. Create User
  const passwordHash = await bcrypt.hash('admin123', 10);
  
  const user = await prisma.user.upsert({
    where: { email: 'admin@test.com' },
    update: { password: passwordHash },
    create: {
      email: 'admin@test.com',
      password: passwordHash,
    },
  });

  console.log(`Upserted User: ${user.email}`);

  // 2. Create Club
  const demoClubId = '11111111-1111-1111-1111-111111111111';
  const club = await prisma.club.upsert({
    where: { id: demoClubId },
    update: {
      name: 'Demonstration Club',
      slug: 'demo-club',
      primaryColor: '#1d4ed8', // tailwind blue-700
      secondaryColor: '#ffffff',
      iban: 'NL01RABO0123456789',
    },
    create: {
      id: demoClubId,
      name: 'Demonstration Club',
      slug: 'demo-club',
      primaryColor: '#1d4ed8',
      secondaryColor: '#ffffff',
      iban: 'NL01RABO0123456789',
    },
  });

  console.log(`Upserted Club: ${club.name}`);

  // 3. Link User and Club
  await prisma.clubUser.upsert({
    where: {
      userId_clubId: {
        userId: user.id,
        clubId: club.id,
      },
    },
    update: { role: ClubUserRole.ADMIN },
    create: {
      userId: user.id,
      clubId: club.id,
      role: ClubUserRole.ADMIN,
    },
  });

  console.log(`Linked User ${user.email} to Club ${club.name} as ADMIN`);

  // 4. Create Products
  const productsData = [
    { name: 'Club Shirt', defaultPrice: 25.0, sizes: ['S', 'M', 'L', 'XL'], sku: 'SHIRT-001' },
    { name: 'Club Shorts', defaultPrice: 15.0, sizes: ['S', 'M', 'L', 'XL'], sku: 'SHORT-001' },
    { name: 'Training Jacket', defaultPrice: 45.0, sizes: ['M', 'L', 'XL'], sku: 'JACKET-001' },
  ];

  const products = [];
  for (const p of productsData) {
    let product = await prisma.product.findFirst({
      where: { clubId: club.id, name: p.name },
    });
    
    if (!product) {
      product = await prisma.product.create({
        data: {
          ...p,
          clubId: club.id,
        },
      });
    } else {
      product = await prisma.product.update({
        where: { id: product.id },
        data: { ...p },
      });
    }
    products.push(product);
  }

  console.log(`Upserted ${products.length} Products`);

  // 5. Create Form
  let form = await prisma.form.findFirst({
    where: { clubId: club.id, name: 'Standard Clothing Package' },
  });

  if (!form) {
    form = await prisma.form.create({
      data: {
        name: 'Standard Clothing Package',
        clubId: club.id,
        targetGroups: ['Youth', 'Seniors'],
        isActive: true,
        items: {
          create: [
            {
              productId: products[0].id,
              type: ItemType.BASIC,
              includedInBasicCount: 1,
              isRequired: true,
            },
            {
              productId: products[1].id,
              type: ItemType.BASIC,
              includedInBasicCount: 1,
              isRequired: true,
            },
            {
              productId: products[2].id,
              type: ItemType.EXTRA,
              customPrice: 40.0,
              isRequired: false,
            },
          ],
        },
      },
      include: { items: true },
    });
    console.log(`Created Form: ${form.name}`);
  } else {
    console.log(`Form ${form.name} already exists`);
  }

  // 6. Create FittingDay
  let fittingDay = await prisma.fittingDay.findFirst({
    where: { clubId: club.id, location: 'Clubhouse Demo Club' },
  });

  if (!fittingDay) {
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);
    
    fittingDay = await prisma.fittingDay.create({
      data: {
        date: nextWeek,
        startTime: '18:00',
        endTime: '21:00',
        location: 'Clubhouse Demo Club',
        targetGroups: ['Seniors'],
        clubId: club.id,
      },
    });
    console.log(`Created FittingDay for ${nextWeek.toDateString()}`);
  } else {
    console.log(`FittingDay already exists`);
  }

  // 7. Create Members
  const membersData = [
    { firstName: 'John', lastName: 'Doe', email: 'john@example.com', group: 'Seniors 1', hasPaid: true },
    { firstName: 'Jane', lastName: 'Smith', email: 'jane@example.com', group: 'Seniors 2', hasPaid: true },
    { firstName: 'Mike', lastName: 'Johnson', email: 'mike@example.com', group: 'Youth U19', hasPaid: false },
  ];

  const members = [];
  for (const m of membersData) {
    let member = await prisma.member.findFirst({
      where: { clubId: club.id, email: m.email },
    });
    
    if (!member) {
      member = await prisma.member.create({
        data: {
          ...m,
          clubId: club.id,
          fittingDayId: fittingDay.id,
        },
      });
      console.log(`Created Member: ${member.firstName} ${member.lastName}`);
    } else {
      console.log(`Member ${member.email} already exists`);
    }
    members.push(member);
  }

  // 8. Create Orders
  let order = await prisma.order.findFirst({
    where: { memberId: members[0].id },
  });

  if (!order) {
    order = await prisma.order.create({
      data: {
        memberId: members[0].id,
        status: OrderStatus.CONFIRMED,
        totalPrice: 65.0, // 25 + 40
        fittingDayId: fittingDay.id,
        items: {
          create: [
            {
              productId: products[0].id, // Shirt
              size: 'L',
              quantity: 1,
              price: 25.0,
            },
            {
              productId: products[2].id, // Jacket
              size: 'L',
              quantity: 1,
              price: 40.0,
            },
          ],
        },
      },
    });
    console.log(`Created Order for member ${members[0].email} with total ${order.totalPrice}`);
  } else {
    console.log(`Order for member ${members[0].email} already exists`);
  }

  console.log('\n--- Seeding finished successfully ---');
  console.log('You can now log in with:');
  console.log('Email:    admin@test.com');
  console.log('Password: admin123');
  console.log('-------------------------------------\n');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
