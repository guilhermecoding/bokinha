import prisma from '@/lib/prisma';
import {NextResponse} from 'next/server';
import createContestSchema from '@/schemas/create-contest.schema';
import {ZodError} from 'zod';
import slugify from '@/schemas/slugify.schema';
import log from '@/lib/log';

const APP_NAME = 'contests-api';

export async function GET() {
    log(APP_NAME, 'INFO', 'GET /api/contests - Iniciando requisição');

    try {
        log(APP_NAME, 'INFO', 'Buscando competições no banco de dados');

        const contests = await prisma.contest.findMany({
            orderBy: {startTime: 'desc'},
            select: {
                id: true,
                name: true,
                slug: true,
                startTime: true,
                endTime: true,
                createdAt: true,
                updatedAt: true
            },
        });

        log(APP_NAME, 'INFO', 'Competições recuperadas com sucesso', {count: contests.length});

        return NextResponse.json({status: 'ok', contests});
    } catch (err) {
        log(APP_NAME, 'ERROR', 'Erro ao buscar competições', {
            error: err instanceof Error ? err.message : String(err)
        });
        return NextResponse.json({status: 'error', error: String(err)}, {status: 500});
    }
}

export async function POST(req: Request) {
    log(APP_NAME, 'INFO', 'POST /api/contests - Iniciando requisição');

    try {
        const body = await req.json();
        log(APP_NAME, 'INFO', 'Corpo da requisição recebido');

        // validação com Zod
        const parsed = createContestSchema.parse(body);
        const {name, adminPassword, startTime, endTime} = parsed;

        log(APP_NAME, 'INFO', 'Dados validados com sucesso', {name});

        const start = new Date(startTime);
        const end = new Date(endTime);

        if (isNaN(start.getTime()) || isNaN(end.getTime())) {
            log(APP_NAME, 'WARNING', 'Datas inválidas fornecidas');
            return NextResponse.json({status: 'error', error: 'Datas inválidas'}, {status: 400});
        }

        if (end <= start) {
            log(APP_NAME, 'WARNING', 'Data de fim anterior ou igual à data de início');
            return NextResponse.json({
                status: 'error',
                error: 'Data de fim deve ser posterior à data de início'
            }, {status: 400});
        }

        // gera slug e garante unicidade básica
        const baseSlug = slugify(name) || `contest-${Date.now().toString(36)}`;
        let slug = baseSlug;

        log(APP_NAME, 'INFO', 'Verificando unicidade do slug', {slug});

        const exists = await prisma.contest.findUnique({where: {slug}});
        if (exists) {
            slug = `${baseSlug}-${Date.now().toString(36)}`;
            log(APP_NAME, 'INFO', 'Slug já existe, gerando novo slug', {oldSlug: baseSlug, newSlug: slug});
        }

        log(APP_NAME, 'INFO', 'Criando competição no banco de dados', {name, slug});

        const contest = await prisma.contest.create({
            data: {
                name,
                adminPassword,
                slug,
                startTime: start,
                endTime: end,
            },
            select: {
                id: true,
                name: true,
                slug: true,
                startTime: true,
                endTime: true,
                createdAt: true,
                updatedAt: true,
            },
        });

        log(APP_NAME, 'INFO', 'Competição criada com sucesso', {id: contest.id, slug: contest.slug});

        return NextResponse.json({status: 'ok', contest}, {status: 201});
    } catch (err) {
        if (err instanceof ZodError) {
            log(APP_NAME, 'WARNING', 'Erro de validação Zod', {issues: err.issues});
            return NextResponse.json({status: 'error', error: err.issues}, {status: 400});
        }

        log(APP_NAME, 'ERROR', 'Erro ao criar competição', {
            error: err instanceof Error ? err.message : String(err)
        });
        return NextResponse.json({status: 'error', error: String(err)}, {status: 500});
    }
}