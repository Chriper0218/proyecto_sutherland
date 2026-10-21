import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// POST /api/tasks/active-status - Sincronizar estado de tarea en tiempo real para supervisión
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, isTaskActive, taskType } = body;

    if (!userId) {
      return NextResponse.json({ error: 'Falta userId' }, { status: 400 });
    }

    const updated = await prisma.user.update({
      where: { id: userId },
      data: {
        isTaskActive: Boolean(isTaskActive),
        currentTaskType: isTaskActive ? (taskType || null) : null,
        taskStartedAt: isTaskActive ? new Date() : null,
      },
      select: {
        id: true,
        isTaskActive: true,
        currentTaskType: true,
        taskStartedAt: true,
      },
    });

    return NextResponse.json({ success: true, user: updated }, { status: 200 });
  } catch (error) {
    console.error('Error al actualizar estado de tarea:', error);
    return NextResponse.json(
      { error: 'Error del servidor al actualizar estado de tarea' },
      { status: 500 }
    );
  }
}
