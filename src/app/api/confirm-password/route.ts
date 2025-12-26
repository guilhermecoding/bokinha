import {NextResponse} from 'next/server';
import {getServerSession, Session} from 'next-auth';
import {authOptions} from '@/app/api/auth/[...nextauth]/route';
import prisma from '@/lib/prisma';
import {compare} from 'bcryptjs';
import log from '@/lib/log';

const APP_NAME = 'confirm-password-api';

export async function POST(req: Request) {
    log(APP_NAME, 'INFO', 'POST /api/confirm-password - Iniciando requisição');

    const session: Session | null = await getServerSession(authOptions);

    if (!session || !session.user?.email) {
        log(APP_NAME, 'ERROR', 'Usuário não autenticado');
        return NextResponse.json({error: 'Not authenticated'}, {status: 401});
    }

    log(APP_NAME, 'INFO', 'Usuário autenticado', {userId: session.user.id});

    const {password} = await req.json();

    if (!password) {
        log(APP_NAME, 'ERROR', 'Senha não fornecida');
        return NextResponse.json({error: 'Password required'}, {status: 400});
    }

    log(APP_NAME, 'INFO', 'Buscando usuário no banco de dados...', {email: session.user.email});

    const user = await prisma.user.findUnique({
        where: {email: session.user.email},
    });

    if (!user) {
        log(APP_NAME, 'ERROR', 'Usuário não encontrado', {userId: session.user.id});
        return NextResponse.json({error: 'User not found'}, {status: 404});
    }

    log(APP_NAME, 'INFO', 'Buscando competição ao qual o usuário está ativo', {userId: session.user.id});

    const contest = await prisma.contest.findUnique({
        where: {slug: session.user.contestSlug}
    });

    if (!contest) {
        log(APP_NAME, 'ERROR', 'Competição não encontrada', {userId: session.user.id});
        return NextResponse.json({error: 'Contest not found'}, {status: 404});
    }

    log(APP_NAME, 'INFO', 'Validando senha', {userId: session.user.id});

    const isValid = await compare(password, contest.adminPassword);

    if (!isValid) {
        log(APP_NAME, 'ERROR', 'Senha inválida', {userId: session.user.id});
        return NextResponse.json({valid: false}, {status: 401});
    }

    log(APP_NAME, 'INFO', 'Senha confirmada com sucesso', {userId: session.user.id});

    return NextResponse.json({valid: true});
}