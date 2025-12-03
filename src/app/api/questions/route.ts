import questionCreateSchema from '@/schemas/quetion-create.schema';
import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = questionCreateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ status: 'error', error: parsed.error.issues }, { status: 400 });
    }

    const { title, order, balloonColor, contestId } = parsed.data;

    if (!contestId) {
      return NextResponse.json({ status: 'error', error: 'contestId is required' }, { status: 400 });
    }

    const contest = await prisma.contest.findUnique({ where: { id: contestId } });
    if (!contest) {
      return NextResponse.json({ status: 'error', error: 'Competição não encontrada' }, { status: 404 });
    }

    // Se order foi enviado, usa ele; caso contrário, calcula next order dentro de uma transação
    const question = await prisma.$transaction(async (tx) => {
      if (order !== undefined && order !== null) {
        return tx.question.create({
          data: {
            title,
            order: order,
            balloonColor: balloonColor ?? '#ffffff',
            contestId,
          },
          select: { id: true, title: true, order: true, balloonColor: true, contestId: true },
        });
      }

      const max = await tx.question.findFirst({
        where: { contestId },
        orderBy: { order: 'desc' },
        select: { order: true },
      });

      const nextOrder = (max?.order ?? 0) + 1;

      return tx.question.create({
        data: {
          title,
          order: nextOrder,
          balloonColor: balloonColor ?? '#ffffff',
          contestId,
        },
        select: { id: true, title: true, order: true, balloonColor: true, contestId: true },
      });
    });

    return NextResponse.json({ status: 'ok', question }, { status: 201 });
  } catch (err) {
    console.error('Erro ao criar questão:', err);
    return NextResponse.json({ status: 'error', error: String(err) }, { status: 500 });
  }
}
