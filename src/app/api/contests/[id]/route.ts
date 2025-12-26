import prisma from '@/lib/prisma';
import {NextResponse} from 'next/server';
import updateContestSchema from '@/schemas/update-contest.schema';
import z from 'zod';
import slugify from '@/schemas/slugify.schema';
import {Prisma} from '../../../../../generated/prisma/client';
import log from '@/lib/log';
import bcrypt from 'bcryptjs';

const APP_NAME = 'contests-id-api';

export async function DELETE(
    req: Request,
    {params}: { params: Promise<{ id: string }> }
) {
    log(APP_NAME, 'INFO', 'DELETE /api/contests/[id] - Iniciando requisição');

    const {id} = await params;

    if (!id) {
        log(APP_NAME, 'WARNING', 'ID não fornecido');
        return NextResponse.json(
            {status: 'error', error: 'ID obrigatório'},
            {status: 400}
        );
    }

    log(APP_NAME, 'INFO', 'Buscando competição para deletar', {id});

    try {
        const existing = await prisma.contest.findUnique({where: {id}});

        if (!existing) {
            log(APP_NAME, 'WARNING', 'Competição não encontrada', {id});
            return NextResponse.json(
                {status: 'error', error: 'Competição não encontrada'},
                {status: 404}
            );
        }

        log(APP_NAME, 'INFO', 'Deletando competição', {id, name: existing.name});

        await prisma.contest.delete({where: {id}});

        log(APP_NAME, 'INFO', 'Competição deletada com sucesso', {id});

        return NextResponse.json({status: 'ok', id}, {status: 200});
    } catch (err) {
        log(APP_NAME, 'ERROR', 'Erro ao deletar competição', {
            id,
            error: err instanceof Error ? err.message : String(err)
        });
        return NextResponse.json(
            {status: 'error', error: String(err)},
            {status: 500}
        );
    }
}

export async function PATCH(
    req: Request,
    {params}: { params: Promise<{ id: string }> }
) {
    log(APP_NAME, 'INFO', 'PATCH /api/contests/[id] - Iniciando requisição');

    try {
        const {id} = await params;
        if (!id) {
            log(APP_NAME, 'WARNING', 'ID não fornecido');
            return NextResponse.json({status: 'error', error: 'ID obrigatório'}, {status: 400});
        }

        log(APP_NAME, 'INFO', 'Recebendo corpo da requisição', {id});

        const body = await req.json();
        const parsed = updateContestSchema.safeParse(body);

        if (!parsed.success) {
            log(APP_NAME, 'WARNING', 'Erro de validação Zod', {id, issues: parsed.error.issues});
            return NextResponse.json({status: 'error', error: parsed.error.issues}, {status: 400});
        }

        log(APP_NAME, 'INFO', 'Dados validados com sucesso', {id});

        const {name, adminPassword, startTime, endTime} = parsed.data;

        const start = new Date(startTime);
        const end = new Date(endTime);
        if (isNaN(start.getTime()) || isNaN(end.getTime())) {
            log(APP_NAME, 'WARNING', 'Datas inválidas fornecidas', {id});
            return NextResponse.json({status: 'error', error: 'Datas inválidas'}, {status: 400});
        }
        if (end <= start) {
            log(APP_NAME, 'WARNING', 'Data de fim anterior ou igual à data de início', {id});
            return NextResponse.json({
                status: 'error',
                error: 'Data de fim deve ser posterior à data de início'
            }, {status: 400});
        }

        log(APP_NAME, 'INFO', 'Gerando slug', {id, name});

        const baseSlug = slugify(name) || `contest-${Date.now().toString(36)}`;
        let slug = baseSlug;
        const existingSlug = await prisma.contest.findFirst({
            where: {slug, NOT: {id}},
        });
        if (existingSlug) {
            slug = `${baseSlug}-${Date.now().toString(36)}`;
            log(APP_NAME, 'INFO', 'Slug já existe, gerando novo slug', {id, oldSlug: baseSlug, newSlug: slug});
        }

        log(APP_NAME, 'INFO', 'Atualizando competição no banco de dados', {id, slug});

        const adminPasswordHashed = await bcrypt.hash(adminPassword, 10);

        const updated = await prisma.contest.update({
            where: {id},
            data: {
                name,
                slug,
                adminPassword: adminPasswordHashed,
                startTime: start,
                endTime: end,
            },
            select: {
                id: true,
                name: true,
                slug: true,
                adminPassword: true,
                startTime: true,
                endTime: true,
                updatedAt: true,
            },
        });

        log(APP_NAME, 'INFO', 'Competição atualizada com sucesso', {id, slug: updated.slug});

        return NextResponse.json({status: 'ok', contest: updated}, {status: 200});
    } catch (err) {
        if (err instanceof z.ZodError) {
            log(APP_NAME, 'WARNING', 'Erro de validação Zod', {issues: err.issues});
            return NextResponse.json({status: 'error', error: err.issues}, {status: 400});
        }
        log(APP_NAME, 'ERROR', 'Erro ao atualizar competição', {
            error: err instanceof Error ? err.message : String(err)
        });
        return NextResponse.json({status: 'error', error: String(err)}, {status: 500});
    }
}

type ContestWithCounts = Prisma.ContestGetPayload<{
    select: {
        id: true;
        name: true;
        slug: true;
        adminPassword: true;
        startTime: true;
        endTime: true;
        createdAt: true;
        updatedAt: true;
        _count: { select: { questions: true } };
    };
}>;

export async function GET(
    _req: Request,
    {params}: { params: Promise<{ id: string }> }
) {
    log(APP_NAME, 'INFO', 'GET /api/contests/[id] - Iniciando requisição');

    try {
        const {id} = await params;
        if (!id) {
            log(APP_NAME, 'WARNING', 'ID não fornecido');
            return NextResponse.json({status: 'error', error: 'ID obrigatório'}, {status: 400});
        }

        log(APP_NAME, 'INFO', 'Buscando competição no banco de dados', {id});

        const contest = (await prisma.contest.findUnique({
            where: {id},
            select: {
                id: true,
                name: true,
                slug: true,
                adminPassword: true,
                startTime: true,
                endTime: true,
                createdAt: true,
                updatedAt: true,
                _count: {
                    select: {questions: true},
                },
            },
        })) as ContestWithCounts | null;

        if (!contest) {
            log(APP_NAME, 'WARNING', 'Competição não encontrada', {id});
            return NextResponse.json({status: 'error', error: 'Competição não encontrada'}, {status: 404});
        }

        log(APP_NAME, 'INFO', 'Competição recuperada com sucesso', {
            id,
            slug: contest.slug,
            questionCount: contest._count.questions
        });

        return NextResponse.json({status: 'ok', contest}, {status: 200});
    } catch (err) {
        log(APP_NAME, 'ERROR', 'Erro ao buscar competição', {
            error: err instanceof Error ? err.message : String(err)
        });
        return NextResponse.json({status: 'error', error: String(err)}, {status: 500});
    }
}