import prisma from '@/lib/prisma';
import {NextResponse} from 'next/server';
import bcrypt from 'bcryptjs';
import {Prisma} from '../../../../../generated/prisma/client';
import studentSchema from '@/schemas/student.schema';
import log from '@/lib/log';

const APP_NAME = 'users-students-api';

export async function POST(req: Request) {
    log(APP_NAME, 'INFO', 'POST /api/users/students - Iniciando requisição');

    try {
        const body = await req.json();
        log(APP_NAME, 'INFO', 'Corpo da requisição recebido');

        const parsed = studentSchema.safeParse(body);

        if (!parsed.success) {
            log(APP_NAME, 'WARNING', 'Erro de validação Zod', {issues: parsed.error.issues});
            return NextResponse.json({status: 'error', error: parsed.error.issues}, {status: 400});
        }

        log(APP_NAME, 'INFO', 'Dados validados com sucesso');

        const {name, email, password, schoolClass, age, contestId} = parsed.data;

        log(APP_NAME, 'INFO', 'Verificando se email já existe', {email});

        const existing = await prisma.user.findUnique({where: {email}});
        if (existing) {
            log(APP_NAME, 'WARNING', 'Email já cadastrado', {email});
            return NextResponse.json({status: 'error', error: 'Email já cadastrado'}, {status: 409});
        }

        log(APP_NAME, 'INFO', 'Gerando hash da senha');

        const hashed = await bcrypt.hash(password, 10);

        log(APP_NAME, 'INFO', 'Criando estudante no banco de dados', {email, name, contestId});

        const user = await prisma.user.create({
            data: {
                name,
                email,
                password: hashed,
                role: 'STUDENT',
                schoolClass,
                age,
                contestId: contestId ?? null,
            },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                schoolClass: true,
                age: true,
                contestId: true,
                createdAt: true,
            },
        });

        log(APP_NAME, 'INFO', 'Estudante criado com sucesso', {userId: user.id, email: user.email});

        return NextResponse.json({status: 'ok', user}, {status: 201});

    } catch (err: unknown) {
        if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
            const meta = err.meta as { target?: unknown } | undefined;
            if (meta && Array.isArray(meta.target) && (meta.target as string[]).includes('email')) {
                log(APP_NAME, 'WARNING', 'Erro de unique constraint - Email já cadastrado', {code: err.code});
                return NextResponse.json({status: 'error', error: 'Email já cadastrado'}, {status: 409});
            }
        }
        log(APP_NAME, 'ERROR', 'Erro ao criar estudante', {
            error: err instanceof Error ? err.message : String(err)
        });
        return NextResponse.json({status: 'error', error: String(err)}, {status: 500});
    }
}

export async function GET() {
    log(APP_NAME, 'INFO', 'GET /api/users/students - Iniciando requisição');

    try {
        log(APP_NAME, 'INFO', 'Buscando estudantes no banco de dados');

        const students = await prisma.user.findMany({
            where: {role: 'STUDENT'},
            select: {
                id: true,
                name: true,
                email: true,
                schoolClass: true,
                age: true,
                contestId: true,
                createdAt: true,
                updatedAt: true,
            },
            orderBy: {createdAt: 'desc'},
        });

        log(APP_NAME, 'INFO', 'Estudantes recuperados com sucesso', {studentCount: students.length});

        return NextResponse.json({status: 'ok', students});
    } catch (err) {
        log(APP_NAME, 'ERROR', 'Erro ao buscar estudantes', {
            error: err instanceof Error ? err.message : String(err)
        });
        return NextResponse.json({status: 'error', error: String(err)}, {status: 500});
    }
}