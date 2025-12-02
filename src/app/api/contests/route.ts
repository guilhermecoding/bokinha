import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';
import createContestSchema from '@/schemas/create-contest.schema';
import { ZodError } from 'zod';
import slugify from '@/schemas/slugify.schema';

export async function GET() {
  try {
    const contests = await prisma.contest.findMany({
      orderBy: { startTime: 'desc' },
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

    return NextResponse.json({ status: 'ok', contests });
  } catch (err) {
    console.error('Erro ao buscar competições:', err);
    return NextResponse.json({ status: 'error', error: String(err) }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // validação com Zod
    const parsed = createContestSchema.parse(body);
    const { name, adminPassword, startTime, endTime } = parsed;

    const start = new Date(startTime);
    const end = new Date(endTime);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return NextResponse.json({ status: 'error', error: 'Datas inválidas' }, { status: 400 });
    }
    if (end <= start) {
      return NextResponse.json({ status: 'error', error: 'Data de fim deve ser posterior à data de início' }, { status: 400 });
    }

    // gera slug e garante unicidade básica
    const baseSlug = slugify(name) || `contest-${Date.now().toString(36)}`;
    let slug = baseSlug;
    const exists = await prisma.contest.findUnique({ where: { slug } });
    if (exists) {
      slug = `${baseSlug}-${Date.now().toString(36)}`;
    }

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

    return NextResponse.json({ status: 'ok', contest }, { status: 201 });
  } catch (err) {
    if (err instanceof ZodError) {
      return NextResponse.json({ status: 'error', error: err.issues }, { status: 400 });
    }
    console.error('Erro ao criar competição:', err);
    return NextResponse.json({ status: 'error', error: String(err) }, { status: 500 });
  }
}