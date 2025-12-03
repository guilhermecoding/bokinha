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

    const contest = await prisma.contest.findUnique({ where: { id }, select: { id: true, name: true } });
    if (!contest) {
      return NextResponse.json({ status: 'error', error: 'Competição não encontrada' }, { status: 404 });
    }

    // busca todos os usuários da competição
    const users = await prisma.user.findMany({
      where: { contestId: id },
      select: { id: true, name: true, email: true, schoolClass: true },
    });

    // busca todos os registros de acerto das questões dessa competição
    const solved = await prisma.solvedQuestion.findMany({
      where: { question: { contestId: id } },
      select: { id: true, solvedAt: true, userId: true, questionId: true },
    });

    // agrupa por usuário
    const map = new Map<string, { solvedCount: number; lastSolvedAt: Date | null; solved: { id: string; questionId: string; solvedAt: Date }[] }>();
    for (const s of solved) {
      const cur = map.get(s.userId) ?? { solvedCount: 0, lastSolvedAt: null, solved: [] };
      cur.solvedCount += 1;
      cur.solved.push({ id: s.id, questionId: s.questionId, solvedAt: s.solvedAt });
      if (!cur.lastSolvedAt || s.solvedAt > cur.lastSolvedAt) cur.lastSolvedAt = s.solvedAt;
      map.set(s.userId, cur);
    }

    // monta placar incluindo usuários com 0 acertos
    const scoreboard = users
      .map((u) => {
        const entry = map.get(u.id);
        return {
          user: u,
          solvedCount: entry?.solvedCount ?? 0,
          lastSolvedAt: entry?.lastSolvedAt ?? null,
          solvedQuestions: entry?.solved ?? [],
        };
      })
      .sort((a, b) => {
        // maior número de acertos vem primeiro
        if (b.solvedCount !== a.solvedCount) return b.solvedCount - a.solvedCount;
        // empate: quem terminou mais cedo (menor lastSolvedAt) vem primeiro
        const ta = a.lastSolvedAt ? a.lastSolvedAt.getTime() : Number.POSITIVE_INFINITY;
        const tb = b.lastSolvedAt ? b.lastSolvedAt.getTime() : Number.POSITIVE_INFINITY;
        return ta - tb;
      });

    return NextResponse.json({ status: 'ok', contest: { id: contest.id, name: contest.name }, scoreboard }, { status: 200 });
  } catch (err) {
    console.error('Erro ao buscar placar:', err);
    return NextResponse.json({ status: 'error', error: String(err) }, { status: 500 });
  }
}