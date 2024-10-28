import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

class Developer {
  static async create(data) {
    const hashedPassword = await bcrypt.hash(data.password, 10);
    return prisma.developer.create({
      data: {
        ...data,
        password: hashedPassword,
        role: 'developer',
      }
    });
  }

  static async findByEmail(email) {
    return prisma.developer.findUnique({
      where: { email },
      include: {
        tasks: true
      }
    });
  }

  static async findById(id) {
    return prisma.developer.findUnique({
      where: { id },
      include: {
        tasks: true
      }
    });
  }
}

export default Developer;
