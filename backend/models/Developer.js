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
      },
    });
  }

  static async findByEmail(email) {
    return prisma.developer.findUnique({
      where: { email },
    });
  }

  static async findById(id) {
    return prisma.developer.findUnique({
      where: { id },
    });
  }

  static async update(id, data) {
    return prisma.developer.update({
      where: { id },
      data,
    });
  }

  static async delete(id) {
    return prisma.developer.delete({
      where: { id },
    });
  }
}

export default Developer;

