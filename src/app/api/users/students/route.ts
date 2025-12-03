import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { Prisma } from '../../../../../generated/prisma/client';
import studentSchema from '@/schemas/student.schema';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = studentSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ status: 'error', error: parsed.error.issues }, { status: 400 });
    }

    const { name, email, password, schoolClass, age, contestId } = parsed.data;

    // verifica se já existe usuário com o email
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ status: 'error', error: 'Email já cadastrado' }, { status: 409 });
    }

    const hashed = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashed,
        role: 'STUDENT',
        schoolClass,
        age,
        contestId: contestId ?? null,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        schoolClass: true,
        age: true,
        contestId: true,
        createdAt: true,
      },
    });

    return NextResponse.json({ status: 'ok', user }, { status: 201 });

  } catch (err: unknown) {
    console.error('Erro ao criar estudante:', err);
    // tratamento simples para erro de unique constraint caso prisma jogue erro diferente
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
      const meta = err.meta as { target?: unknown } | undefined;
      if (meta && Array.isArray(meta.target) && (meta.target as string[]).includes('email')) {
        return NextResponse.json({ status: 'error', error: 'Email já cadastrado' }, { status: 409 });
      }
    }
    return NextResponse.json({ status: 'error', error: String(err) }, { status: 500 });
  }
}

// Novo método GET para listar alunos
export async function GET() {
  try {
    const students = await prisma.user.findMany({
      where: { role: 'STUDENT' },
      select: {
        id: true,
        name: true,
        email: true,
        schoolClass: true,
        age: true,
        contestId: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ status: 'ok', students });
  } catch (err) {
    console.error('Erro ao buscar estudantes:', err);
    return NextResponse.json({ status: 'error', error: String(err) }, { status: 500 });
  }
}