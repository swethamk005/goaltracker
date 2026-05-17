require('dotenv').config();
const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
  const password = await bcrypt.hash('password123', 10)

  // Create Admin
  const admin = await prisma.user.upsert({
    where: { email: 'admin@goalverse.com' },
    update: {},
    create: {
      email: 'admin@goalverse.com',
      name: 'Admin User',
      password,
      role: 'ADMIN',
    },
  })

  // Create Manager
  const manager = await prisma.user.upsert({
    where: { email: 'manager@goalverse.com' },
    update: {},
    create: {
      email: 'manager@goalverse.com',
      name: 'Manager User',
      password,
      role: 'MANAGER',
    },
  })

  // Create Employee
  const employee = await prisma.user.upsert({
    where: { email: 'employee@goalverse.com' },
    update: {},
    create: {
      email: 'employee@goalverse.com',
      name: 'Employee User',
      password,
      role: 'EMPLOYEE',
      managerId: manager.id,
    },
  })

  console.log({ admin, manager, employee })
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
