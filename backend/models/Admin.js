import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

class Admin {
  static async create(name, email, password) {
    const hashedPassword = await bcrypt.hash(password, 10);
    return prisma.admin.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: 'admin'
      }
    });
  }

  static async findByEmail(email) {
    return prisma.admin.findUnique({
      where: { email }
    });
  }
}

export default Admin;
