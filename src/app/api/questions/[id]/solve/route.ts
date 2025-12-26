import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { getServerSession, Session } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import log from '@/lib/log';

const APP_NAME = 'questions-solve-api';

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  log(APP_NAME, 'INFO', 'POST /api/questions/[id]/solve - Iniciando requisição');

  try {
    const { id } = await params;
    if (!id) {
      log(APP_NAME, 'WARNING', 'ID da questão não fornecido');
      return NextResponse.json({ status: 'error', error: 'ID da questão obrigatório' }, { status: 400 });
    }

    log(APP_NAME, 'INFO', 'Verificando autenticação do usuário', { questionId: id });

    const session: Session | null = await getServerSession(authOptions);
    if (!session?.user?.email) {
      log(APP_NAME, 'WARNING', 'Usuário não autenticado', { questionId: id });
      return NextResponse.json({ status: 'error', error: 'Não autenticado' }, { status: 401 });
    }

    log(APP_NAME, 'INFO', 'Buscando usuário no banco de dados', { email: session.user.email });

    const user = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (!user) {
      log(APP_NAME, 'WARNING', 'Usuário não encontrado', { email: session.user.email });
      return NextResponse.json({ status: 'error', error: 'Usuário não encontrado' }, { status: 404 });
    }

    log(APP_NAME, 'INFO', 'Buscando questão no banco de dados', { questionId: id, userId: user.id });

    const question = await prisma.question.findUnique({
      where: { id },
      select: { id: true, contestId: true },
    });
    if (!question) {
      log(APP_NAME, 'WARNING', 'Questão não encontrada', { questionId: id });
      return NextResponse.json({ status: 'error', error: 'Questão não encontrada' }, { status: 404 });
    }

    if (user.contestId !== question.contestId) {
      log(APP_NAME, 'WARNING', 'Usuário não participa da competição da questão', {
        userId: user.id,
        userContestId: user.contestId,
        questionContestId: question.contestId
      });
      return NextResponse.json({ status: 'error', error: 'Usuário não participa desta competição' }, { status: 403 });
    }

    log(APP_NAME, 'INFO', 'Verificando se questão já foi marcada como resolvida', { userId: user.id, questionId: id });

    const already = await prisma.solvedQuestion.findFirst({
      where: { userId: user.id, questionId: id },
    });

    if (already) {
      log(APP_NAME, 'INFO', 'Questão já estava marcada como resolvida', { userId: user.id, questionId: id });
      return NextResponse.json({ status: 'ok', solved: true, message: 'Questão já marcada' }, { status: 200 });
    }

    log(APP_NAME, 'INFO', 'Marcando questão como resolvida', { userId: user.id, questionId: id });

    const created = await prisma.solvedQuestion.create({
      data: {
        userId: user.id,
        questionId: id,
        solvedAt: new Date(),
      },
    });

    log(APP_NAME, 'INFO', 'Questão marcada como resolvida com sucesso', {
      userId: user.id,
      questionId: id,
      solvedQuestionId: created.id
    });

    return NextResponse.json({ status: 'ok', solved: true, id: created.id }, { status: 200 });
  } catch (err) {
    log(APP_NAME, 'ERROR', 'Erro ao marcar questão como resolvida', {
      error: err instanceof Error ? err.message : String(err)
    });
    return NextResponse.json({ status: 'error', error: String(err) }, { status: 500 });
  }
}