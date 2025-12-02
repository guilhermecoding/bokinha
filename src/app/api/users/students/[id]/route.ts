import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> } 
) {
  try {
    // MUDANÇA CRITICA: Você DEVE dar await no params antes de usar
    const { id } = await params; 

    if (!id) {
      return NextResponse.json({ error: 'ID inválido' }, { status: 400 });
    }

    console.log('Deletando estudante:', id);

    await prisma.user.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erro ao deletar:', error);
    return NextResponse.json({ error: 'Erro ao deletar estudante' }, { status: 500 });
  }
}
