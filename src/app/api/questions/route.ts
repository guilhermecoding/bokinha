import questionCreateSchema from '@/schemas/quetion-create.schema';
import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';
import log from '@/lib/log';

const APP_NAME = 'questions-api';

export async function POST(req: Request) {
  log(APP_NAME, 'INFO', 'POST /api/questions - Iniciando requisição');

  try {
    const body = await req.json();
    log(APP_NAME, 'INFO', 'Corpo da requisição recebido');

    const parsed = questionCreateSchema.safeParse(body);

    if (!parsed.success) {
      log(APP_NAME, 'WARNING', 'Erro de validação Zod', { issues: parsed.error.issues });
      return NextResponse.json({ status: 'error', error: parsed.error.issues }, { status: 400 });
    }

    log(APP_NAME, 'INFO', 'Dados validados com sucesso');

    const { title, order, balloonColor, contestId } = parsed.data;

    if (!contestId) {
      log(APP_NAME, 'WARNING', 'ID da competição não fornecido');
      return NextResponse.json({ status: 'error', error: 'contestId is required' }, { status: 400 });
    }

    log(APP_NAME, 'INFO', 'Verificando se a competição existe', { contestId });

    const contest = await prisma.contest.findUnique({ where: { id: contestId } });
    if (!contest) {
      log(APP_NAME, 'WARNING', 'Competição não encontrada', { contestId });
      return NextResponse.json({ status: 'error', error: 'Competição não encontrada' }, { status: 404 });
    }

    log(APP_NAME, 'INFO', 'Criando questão no banco de dados', { contestId, title, order });

    const question = await prisma.$transaction(async (tx) => {
      if (order !== undefined && order !== null) {
        log(APP_NAME, 'INFO', 'Criando questão com ordem definida', { order });
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

      log(APP_NAME, 'INFO', 'Calculando próxima ordem', { contestId });

      const max = await tx.question.findFirst({
        where: { contestId },
        orderBy: { order: 'desc' },
        select: { order: true },
      });

      const nextOrder = (max?.order ?? 0) + 1;

      log(APP_NAME, 'INFO', 'Criando questão com ordem calculada', { nextOrder });

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

    log(APP_NAME, 'INFO', 'Questão criada com sucesso', { id: question.id, order: question.order });

    return NextResponse.json({ status: 'ok', question }, { status: 201 });
  } catch (err) {
    log(APP_NAME, 'ERROR', 'Erro ao criar questão', {
      error: err instanceof Error ? err.message : String(err)
    });
    return NextResponse.json({ status: 'error', error: String(err) }, { status: 500 });
  }
}