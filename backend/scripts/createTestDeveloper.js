import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function createTestDeveloper() {
    try {
        // Hash a password for the developer
        const hashedPassword = await bcrypt.hash('password123', 10);

        // Create the developer
        const developer = await prisma.developer.create({
            data: {
                name: 'Test Developer',
                email: 'test.dev@example.com',
                password: hashedPassword,
                phoneNumber: '+1234567890',
                fullTime: true,
                team: 'web',
                projects: ['AFS'],
                workingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
                role: 'developer'
            }
        });

        console.log('Developer created successfully:', {
            id: developer.id,
            name: developer.name,
            email: developer.email
        });

    } catch (error) {
        console.error('Error creating developer:', error);
    } finally {
        await prisma.$disconnect();
    }
}

createTestDeveloper();

