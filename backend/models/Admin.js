import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

class Admin {
  static async create(name, email, phone, password) {
    const hashedPassword = await bcrypt.hash(password, 10);
    return prisma.admin.create({
      data: {
        name,
        email,
        phone,
        password: hashedPassword,
      },
    });
  }

  static async findByEmail(email) {
    return prisma.admin.findUnique({
      where: { email },
    });
  }

  static async findById(id) {
    return prisma.admin.findUnique({
      where: { id },
    });
  }

  static async authenticate(email, password) {
    const admin = await this.findByEmail(email);
    if (!admin) {
      return null;
    }
    const isValid = await bcrypt.compare(password, admin.password);
    if (!isValid) {
      return null;
    }
    return admin;
  }

  static generateToken(admin) {
    return jwt.sign(
      { id: admin.id, email: admin.email },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );
  }

  static async update(id, data) {
    return prisma.admin.update({
      where: { id },
      data,
    });
  }

  static async delete(id) {
    return prisma.admin.delete({
      where: { id },
    });
  }
}

export default Admin;

