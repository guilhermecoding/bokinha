import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // consulta simples para testar conexão; funciona em Postgres e MySQL
    const result = await prisma.$queryRaw`SELECT 1 as result`;
    return NextResponse.json({ ok: true, result });
  } catch (err) {
    console.error('Prisma test error:', err);
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 });
  }
}