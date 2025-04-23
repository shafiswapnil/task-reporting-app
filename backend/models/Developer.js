import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

/**
 * @swagger
 * components:
 *   schemas:
 *     DeveloperModel:
 *       type: object
 *       required:
 *         - name
 *         - email
 *         - password
 *       properties:
 *         name:
 *           type: string
 *           description: Developer's full name
 *         email:
 *           type: string
 *           format: email
 *           description: Developer's unique email address
 *         password:
 *           type: string
 *           format: password
 *           description: Hashed password
 *         role:
 *           type: string
 *           default: developer
 *           description: User role
 *         tasks:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Task'
 *           description: List of tasks associated with the developer
 */

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
