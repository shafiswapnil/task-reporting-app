// backend/prisma/seed.js

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  // Define plain text passwords
  const adminPassword = 'Admin@123'; // Change this to a secure password
  const developerPassword = 'Dev@123'; // Change this to a secure password

  // Hash passwords
  const hashedAdminPassword = await bcrypt.hash(adminPassword, 10);
  const hashedDeveloperPassword = await bcrypt.hash(developerPassword, 10);

  // Create Admin
  const admin = await prisma.admin.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      name: 'Admin User',
      email: 'admin@example.com',
      password: hashedAdminPassword,
      phone: '1234567890',
      role: 'admin', // Ensure role is set to 'admin'
    },
  });

  console.log(`Created Admin: ${admin.email}`);

  // Create Developer
  const developer = await prisma.developer.upsert({
    where: { email: 'developer@example.com' },
    update: {},
    create: {
      name: 'Developer User',
      email: 'developer@example.com',
      password: hashedDeveloperPassword,
      phoneNumber: '0987654321',
      fullTime: true,
      team: 'web', // "web" or "app"
      role: 'developer', // Ensure role is set to 'developer'
      projects: ['Project Alpha', 'Project Beta'], // Assign at least one project
      workingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      joinedAt: new Date(),
    },
  });

  console.log(`Created Developer: ${developer.email}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

