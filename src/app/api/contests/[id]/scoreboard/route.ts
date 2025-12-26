import prisma from '@/lib/prisma';
import {NextResponse} from 'next/server';
import log from '@/lib/log';

const APP_NAME = 'contests-scoreboard-api';

export async function GET(
    _req: Request,
    {params}: { params: Promise<{ id: string }> }
) {
    log(APP_NAME, 'INFO', 'GET /api/contests/[id]/scoreboard - Iniciando requisição');

    try {
        const {id} = await params;
        if (!id) {
            log(APP_NAME, 'WARNING', 'ID da competição não fornecido');
            return NextResponse.json({status: 'error', error: 'ID da competição obrigatório'}, {status: 400});
        }

        log(APP_NAME, 'INFO', 'Buscando competição no banco de dados', {id});

        const contest = await prisma.contest.findUnique({where: {id}, select: {id: true, name: true}});
        if (!contest) {
            log(APP_NAME, 'WARNING', 'Competição não encontrada', {id});
            return NextResponse.json({status: 'error', error: 'Competição não encontrada'}, {status: 404});
        }

        log(APP_NAME, 'INFO', 'Buscando usuários da competição', {id, contestName: contest.name});

        const users = await prisma.user.findMany({
            where: {contestId: id},
            select: {id: true, name: true, email: true, schoolClass: true},
        });

        log(APP_NAME, 'INFO', 'Usuários recuperados', {id, userCount: users.length});

        log(APP_NAME, 'INFO', 'Buscando questões resolvidas', {id});

        const solved = await prisma.solvedQuestion.findMany({
            where: {question: {contestId: id}},
            select: {
                id: true,
                solvedAt: true,
                userId: true,
                questionId: true,
                question: {
                    select: {
                        balloonColor: true,
                        order: true,
                        title: true,
                    },
                },
            },
        });

        log(APP_NAME, 'INFO', 'Questões resolvidas recuperadas', {id, solvedCount: solved.length});

        log(APP_NAME, 'INFO', 'Processando placar', {id});

        const map = new Map<
            string,
            {
                solvedCount: number;
                lastSolvedAt: Date | null;
                solved: {
                    id: string;
                    questionId: string;
                    solvedAt: Date;
                    balloonColor?: string | null;
                    order?: number | null;
                    title?: string | null
                }[];
            }
        >();
        for (const s of solved) {
            const cur = map.get(s.userId) ?? {solvedCount: 0, lastSolvedAt: null, solved: []};
            cur.solvedCount += 1;
            cur.solved.push({
                id: s.id,
                questionId: s.questionId,
                solvedAt: s.solvedAt,
                balloonColor: s.question?.balloonColor ?? null,
                order: s.question?.order ?? null,
                title: s.question?.title ?? null,
            });
            if (!cur.lastSolvedAt || s.solvedAt > cur.lastSolvedAt) cur.lastSolvedAt = s.solvedAt;
            map.set(s.userId, cur);
        }

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
                if (b.solvedCount !== a.solvedCount) return b.solvedCount - a.solvedCount;
                const ta = a.lastSolvedAt ? a.lastSolvedAt.getTime() : Number.POSITIVE_INFINITY;
                const tb = b.lastSolvedAt ? b.lastSolvedAt.getTime() : Number.POSITIVE_INFINITY;
                return ta - tb;
            });

        log(APP_NAME, 'INFO', 'Placar processado com sucesso', {id, participantsCount: scoreboard.length});

        return NextResponse.json({
            status: 'ok',
            contest: {id: contest.id, name: contest.name},
            scoreboard
        }, {status: 200});
    } catch (err) {
        log(APP_NAME, 'ERROR', 'Erro ao buscar placar', {
            error: err instanceof Error ? err.message : String(err)
        });
        return NextResponse.json({status: 'error', error: String(err)}, {status: 500});
    }
}