import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function DELETE(
  _req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;

  if (!id) {
    return NextResponse.json(
      { status: 'error', error: 'ID obrigatório' },
      { status: 400 }
    );
  }

  try {
    const existing = await prisma.contest.findUnique({ where: { id } });

    if (!existing) {
      return NextResponse.json(
        { status: 'error', error: 'Competição não encontrada' },
        { status: 404 }
      );
    }

    await prisma.contest.delete({ where: { id } });

    return NextResponse.json({ status: 'ok', id }, { status: 200 });
  } catch (err) {
    console.error('Erro ao deletar competição:', err);
    return NextResponse.json(
      { status: 'error', error: String(err) },
      { status: 500 }
    );
  }
}
