import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';
import log from '@/lib/log';

const APP_NAME = 'users-students-id-api';

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  log(APP_NAME, 'INFO', 'DELETE /api/users/students/[id] - Iniciando requisição');

  try {
    const { id } = await params;

    if (!id) {
      log(APP_NAME, 'WARNING', 'ID do estudante não fornecido');
      return NextResponse.json({ error: 'ID inválido' }, { status: 400 });
    }

    log(APP_NAME, 'INFO', 'Verificando se estudante existe', { studentId: id });

    const student = await prisma.user.findUnique({ where: { id } });
    if (!student) {
      log(APP_NAME, 'WARNING', 'Estudante não encontrado', { studentId: id });
      return NextResponse.json({ error: 'Estudante não encontrado' }, { status: 404 });
    }

    log(APP_NAME, 'INFO', 'Deletando estudante', { studentId: id, email: student.email });

    await prisma.user.delete({
      where: { id },
    });

    log(APP_NAME, 'INFO', 'Estudante deletado com sucesso', { studentId: id });

    return NextResponse.json({ success: true });
  } catch (error) {
    log(APP_NAME, 'ERROR', 'Erro ao deletar estudante', {
      error: error instanceof Error ? error.message : String(error)
    });
    return NextResponse.json({ error: 'Erro ao deletar estudante' }, { status: 500 });
  }
}