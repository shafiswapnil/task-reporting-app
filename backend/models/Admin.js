import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

/**
 * @swagger
 * components:
 *   schemas:
 *     AdminModel:
 *       type: object
 *       required:
 *         - name
 *         - email
 *         - password
 *       properties:
 *         name:
 *           type: string
 *           description: Admin's full name
 *         email:
 *           type: string
 *           format: email
 *           description: Admin's unique email address
 *         password:
 *           type: string
 *           format: password
 *           description: Hashed password
 *         role:
 *           type: string
 *           default: admin
 *           description: User role, always set to 'admin'
 *         phone:
 *           type: string
 *           description: Admin's phone number
 */

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
