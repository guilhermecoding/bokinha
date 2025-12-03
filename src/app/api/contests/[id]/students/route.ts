import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id?: string }> }
) {
  const contestId = (await params)?.id;
  if (!contestId) {
    return NextResponse.json({ status: 'error', error: 'ID da competição obrigatório' }, { status: 400 });
  }

  try {
    const students = await prisma.user.findMany({
      where: {
        role: 'STUDENT',
        contestId: contestId,
      },
      select: {
        id: true,
        name: true,
        email: true,
        schoolClass: true,
        age: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ status: 'ok', students });
  } catch (err) {
    console.error('Erro ao buscar estudantes da competição:', err);
    return NextResponse.json({ status: 'error', error: String(err) }, { status: 500 });
  }
}