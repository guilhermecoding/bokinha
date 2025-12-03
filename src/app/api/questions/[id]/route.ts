import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';




export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    if (!id) {
      return NextResponse.json({ status: 'error', error: 'ID da competição obrigatório' }, { status: 400 });
    }

    const questions = await prisma.question.findMany({
      where: { contestId: id },
      orderBy: [{ order: 'asc' }, { id: 'asc' }],
      select: {
        id: true,
        title: true,
        order: true,
        balloonColor: true,
        contestId: true,
      },
    });

    return NextResponse.json({ status: 'ok', questions }, { status: 200 });
  } catch (err) {
    console.error('Erro ao buscar questões:', err);
    return NextResponse.json({ status: 'error', error: String(err) }, { status: 500 });
  }
}