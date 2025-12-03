import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { getServerSession, Session } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    if (!id) {
      return NextResponse.json({ status: 'error', error: 'ID da questão obrigatório' }, { status: 400 });
    }

    const session: Session | null = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ status: 'error', error: 'Não autenticado' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (!user) {
      return NextResponse.json({ status: 'error', error: 'Usuário não encontrado' }, { status: 404 });
    }

    const question = await prisma.question.findUnique({
      where: { id },
      select: { id: true, contestId: true },
    });
    if (!question) {
      return NextResponse.json({ status: 'error', error: 'Questão não encontrada' }, { status: 404 });
    }

    // somente participantes da mesma competição podem marcar
    if (user.contestId !== question.contestId) {
      return NextResponse.json({ status: 'error', error: 'Usuário não participa desta competição' }, { status: 403 });
    }

    // verifica se já existe registro
    const already = await prisma.solvedQuestion.findFirst({
      where: { userId: user.id, questionId: id },
    });

    if (already) {
      return NextResponse.json({ status: 'ok', solved: true, message: 'Questão já marcada' }, { status: 200 });
    }

    const created = await prisma.solvedQuestion.create({
      data: {
        userId: user.id,
        questionId: id,
        solvedAt: new Date(),
      },
    });

    return NextResponse.json({ status: 'ok', solved: true, id: created.id }, { status: 200 });
  } catch (err) {
    console.error('Erro ao marcar questão como feita:', err);
    return NextResponse.json({ status: 'error', error: String(err) }, { status: 500 });
  }
}