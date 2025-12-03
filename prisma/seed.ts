import { PrismaClient, Role } from '../generated/prisma/client'; // Seu caminho atual
import bcrypt from 'bcryptjs';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import dotenv from 'dotenv'; // Importante para ler o .env no script

// Carrega as variáveis de ambiente (pois o script roda isolado)
dotenv.config();

const connectionString = `${process.env.DATABASE_URL}`;

// 1. Configura o Adapter
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);

// 2. Passa o adapter como ARGUMENTO
const prisma = new PrismaClient({ adapter });

async function main() {
  // Criar hash da senha
  const passwordHash = await bcrypt.hash('admin123', 10);

  // Criar ADMIN
  // ATENÇÃO: O Role deve ser maiúsculo 'ADMIN' se seu enum for ADMIN
  await prisma.user.upsert({
    where: { email: 'admin@bokinha.com' },
    update: {},
    create: {
      name: 'Professor Admin',
      email: 'admin@bokinha.com',
      password: passwordHash,
      role: Role.ADMIN
    }
  });

  // Criar Maratona
  await prisma.contest.upsert({
    where: { slug: 'maratona-2025' },
    update: {},
    create: {
      name: 'Maratona Bokinha 2025',
      slug: 'maratona-2025',
      adminPassword: 'senha-da-mesa',
      startTime: new Date(),
      endTime: new Date(new Date().setDate(new Date().getDate() + 1)),
    }
  });

  console.log('✅ Banco populado!');
}

main()
  .then(async () => await prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });