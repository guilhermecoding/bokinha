import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { getServerSession, Session } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function GET(
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

    // somente participantes da mesma competição podem consultar
    if (user.contestId !== question.contestId) {
      return NextResponse.json({ status: 'error', error: 'Usuário não participa desta competição' }, { status: 403 });
    }

    const already = await prisma.solvedQuestion.findFirst({
      where: { userId: user.id, questionId: id },
    });

    return NextResponse.json({ status: 'ok', done: Boolean(already) }, { status: 200 });
  } catch (err) {
    console.error('Erro ao verificar se questão foi resolvida:', err);
    return NextResponse.json({ status: 'error', error: String(err) }, { status: 500 });
  }
}