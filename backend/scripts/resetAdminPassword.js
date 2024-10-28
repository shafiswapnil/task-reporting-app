import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function resetAdminPassword() {
    try {
        // Define admin details
        const adminEmail = 'shafi@example.com'; // Replace with your admin email
        const newPassword = 'admin123'; // Replace with desired password

        // Hash the password
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Try to find existing admin
        const existingAdmin = await prisma.admin.findUnique({
            where: { email: adminEmail }
        });

        if (existingAdmin) {
            // Update existing admin
            await prisma.admin.update({
                where: { email: adminEmail },
                data: {
                    password: hashedPassword,
                    role: 'admin' // Ensure role is set
                }
            });
            console.log('Admin password updated successfully');
        } else {
            // Create new admin
            await prisma.admin.create({
                data: {
                    email: adminEmail,
                    password: hashedPassword,
                    name: 'Admin User',
                    role: 'admin',
                }
            });
            console.log('New admin created successfully');
        }

        console.log('Admin credentials:');
        console.log('Email:', adminEmail);
        console.log('Password:', newPassword);

    } catch (error) {
        console.error('Error resetting admin password:', error);
    } finally {
        await prisma.$disconnect();
    }
}

resetAdminPassword();

