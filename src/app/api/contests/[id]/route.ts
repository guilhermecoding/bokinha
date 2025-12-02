import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';
import updateContestSchema from '@/schemas/update-contest.schema';
import z from 'zod';
import slugify from '@/schemas/slugify.schema';
import { Prisma } from '../../../../../generated/prisma/client';

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  if (!id) {
    return NextResponse.json(
      { status: 'error', error: 'ID obrigatório' },
      { status: 400 }
    );
  }

  try {
    const existing = await prisma.contest.findUnique({ where: { id } });

    if (!existing) {
      return NextResponse.json(
        { status: 'error', error: 'Competição não encontrada' },
        { status: 404 }
      );
    }

    await prisma.contest.delete({ where: { id } });

    return NextResponse.json({ status: 'ok', id }, { status: 200 });
  } catch (err) {
    console.error('Erro ao deletar competição:', err);
    return NextResponse.json(
      { status: 'error', error: String(err) },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    if (!id) {
      return NextResponse.json({ status: 'error', error: 'ID obrigatório' }, { status: 400 });
    }

    const body = await req.json();
    const parsed = updateContestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ status: 'error', error: parsed.error.issues }, { status: 400 });
    }

    const { name, adminPassword, startTime, endTime } = parsed.data;

    const start = new Date(startTime);
    const end = new Date(endTime);
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return NextResponse.json({ status: 'error', error: 'Datas inválidas' }, { status: 400 });
    }
    if (end <= start) {
      return NextResponse.json({ status: 'error', error: 'Data de fim deve ser posterior à data de início' }, { status: 400 });
    }

    // gera slug e garante unicidade se nome mudou
    const baseSlug = slugify(name) || `contest-${Date.now().toString(36)}`;
    let slug = baseSlug;
    const existingSlug = await prisma.contest.findFirst({
      where: { slug, NOT: { id } },
    });
    if (existingSlug) {
      slug = `${baseSlug}-${Date.now().toString(36)}`;
    }

    const updated = await prisma.contest.update({
      where: { id },
      data: {
        name,
        slug,
        adminPassword,
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

    return NextResponse.json({ status: 'ok', contest: updated }, { status: 200 });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ status: 'error', error: err.issues }, { status: 400 });
    }
    console.error('Erro ao atualizar competição:', err);
    return NextResponse.json({ status: 'error', error: String(err) }, { status: 500 });
  }
}

// Tipagem do resultado com contagem
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
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    if (!id) {
      return NextResponse.json({ status: 'error', error: 'ID obrigatório' }, { status: 400 });
    }

    const contest = (await prisma.contest.findUnique({
      where: { id },
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
          select: { questions: true },
        },
      },
    })) as ContestWithCounts | null;

    if (!contest) {
      return NextResponse.json({ status: 'error', error: 'Competição não encontrada' }, { status: 404 });
    }

    return NextResponse.json({ status: 'ok', contest }, { status: 200 });
  } catch (err) {
    console.error('Erro ao buscar competição:', err);
    return NextResponse.json({ status: 'error', error: String(err) }, { status: 500 });
  }
}
