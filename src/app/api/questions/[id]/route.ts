import prisma from '@/lib/prisma';
import {NextResponse} from 'next/server';
import log from '@/lib/log';

const APP_NAME = 'questions-id-api';

export async function GET(
    _req: Request,
    {params}: { params: Promise<{ id: string }> }
) {
    log(APP_NAME, 'INFO', 'GET /api/questions/[id] - Iniciando requisição');

    try {
        const {id} = await params;
        if (!id) {
            log(APP_NAME, 'WARNING', 'ID da competição não fornecido');
            return NextResponse.json({status: 'error', error: 'ID da competição obrigatório'}, {status: 400});
        }

        log(APP_NAME, 'INFO', 'Buscando questões da competição', {contestId: id});

        const questions = await prisma.question.findMany({
            where: {contestId: id},
            orderBy: [{order: 'asc'}, {id: 'asc'}],
            select: {
                id: true,
                title: true,
                order: true,
                balloonColor: true,
                contestId: true,
            },
        });

        log(APP_NAME, 'INFO', 'Questões recuperadas com sucesso', {contestId: id, questionCount: questions.length});

        return NextResponse.json({status: 'ok', questions}, {status: 200});
    } catch (err) {
        log(APP_NAME, 'ERROR', 'Erro ao buscar questões', {
            error: err instanceof Error ? err.message : String(err)
        });
        return NextResponse.json({status: 'error', error: String(err)}, {status: 500});
    }
}

export async function DELETE(
    _req: Request,
    {params}: { params: Promise<{ id: string }> }
) {
    log(APP_NAME, 'INFO', 'DELETE /api/questions/[id] - Iniciando requisição');

    try {
        const {id} = await params;
        if (!id) {
            log(APP_NAME, 'WARNING', 'ID da questão não fornecido');
            return NextResponse.json({status: 'error', error: 'ID da questão obrigatório'}, {status: 400});
        }

        log(APP_NAME, 'INFO', 'Verificando se a questão existe', {questionId: id});

        const question = await prisma.question.findUnique({where: {id}});
        if (!question) {
            log(APP_NAME, 'WARNING', 'Questão não encontrada', {questionId: id});
            return NextResponse.json({status: 'error', error: 'Questão não encontrada'}, {status: 404});
        }

        log(APP_NAME, 'INFO', 'Deletando questão', {questionId: id, title: question.title});

        await prisma.question.delete({where: {id}});

        log(APP_NAME, 'INFO', 'Questão deletada com sucesso', {questionId: id});

        return NextResponse.json({status: 'ok', message: 'Questão deletada', id}, {status: 200});
    } catch (err) {
        log(APP_NAME, 'ERROR', 'Erro ao deletar questão', {
            error: err instanceof Error ? err.message : String(err)
        });
        return NextResponse.json({status: 'error', error: String(err)}, {status: 500});
    }
}