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

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    if (!id) {
      return NextResponse.json({ status: 'error', error: 'ID da questão obrigatório' }, { status: 400 });
    }

    const question = await prisma.question.findUnique({ where: { id } });
    if (!question) {
      return NextResponse.json({ status: 'error', error: 'Questão não encontrada' }, { status: 404 });
    }

    await prisma.question.delete({ where: { id } });

    return NextResponse.json({ status: 'ok', message: 'Questão deletada', id }, { status: 200 });
  } catch (err) {
    console.error('Erro ao deletar questão:', err);
    return NextResponse.json({ status: 'error', error: String(err) }, { status: 500 });
  }
}