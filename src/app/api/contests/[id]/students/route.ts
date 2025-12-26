import prisma from '@/lib/prisma';
import {NextResponse} from 'next/server';
import log from '@/lib/log';

const APP_NAME = 'contests-students-api';

export async function GET(
    _req: Request,
    {params}: { params: Promise<{ id?: string }> }
) {
    log(APP_NAME, 'INFO', 'GET /api/contests/[id]/students - Iniciando requisição');

    const contestId = (await params)?.id;
    if (!contestId) {
        log(APP_NAME, 'WARNING', 'ID da competição não fornecido');
        return NextResponse.json({status: 'error', error: 'ID da competição obrigatório'}, {status: 400});
    }

    log(APP_NAME, 'INFO', 'Buscando estudantes da competição', {contestId});

    try {
        const students = await prisma.user.findMany({
            where: {
                role: 'STUDENT',
                contestId: contestId,
            },
            select: {
                id: true,
                name: true,
                email: true,
                schoolClass: true,
                age: true,
                createdAt: true,
                updatedAt: true,
            },
            orderBy: {createdAt: 'desc'},
        });

        log(APP_NAME, 'INFO', 'Estudantes recuperados com sucesso', {contestId, studentCount: students.length});

        return NextResponse.json({status: 'ok', students});
    } catch (err) {
        log(APP_NAME, 'ERROR', 'Erro ao buscar estudantes da competição', {
            contestId,
            error: err instanceof Error ? err.message : String(err)
        });
        return NextResponse.json({status: 'error', error: String(err)}, {status: 500});
    }
}