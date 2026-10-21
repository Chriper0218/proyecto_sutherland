import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

// POST /api/admin/coachings - Registrar coaching por demoras / AHT crítico
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { agentId, adminId, reason } = body;

    if (!agentId || !reason?.trim()) {
      return NextResponse.json(
        { error: 'Se requiere agentId y la razón de las demoras' },
        { status: 400 }
      );
    }

    // Verificar existencia del agente
    const agent = await prisma.user.findUnique({
      where: { id: agentId },
      include: {
        tasks: {
          take: 10,
          orderBy: { createdAt: 'desc' },
          select: { durationSeconds: true },
        },
      },
    });

    if (!agent) {
      return NextResponse.json({ error: 'El agente especificado no existe' }, { status: 404 });
    }

    // Calcular AHT promedio del agente al momento del coaching
    const recentDurations = agent.tasks.map((t) => t.durationSeconds);
    const ahtAtTime =
      recentDurations.length > 0
        ? Math.round(recentDurations.reduce((a, b) => a + b, 0) / recentDurations.length)
        : null;

    // Crear registro de coaching
    const newCoaching = await prisma.coaching.create({
      data: {
        agentId,
        adminId: adminId || agentId,
        reason: reason.trim(),
        ahtAtTime,
      },
      include: {
        admin: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    // Incrementar contador de coachings
    const nextCoachingCount = agent.coachingCount + 1;
    let suspendedUntil: Date | null = agent.suspendedUntil;
    let newlySuspended = false;

    // Si alcanza o supera 3 coachings, bloquear por 1 día completo (24 horas)
    if (nextCoachingCount >= 3) {
      suspendedUntil = new Date(Date.now() + 24 * 60 * 60 * 1000);
      newlySuspended = true;

      // Si tiene turno o tarea activa, cerrarla para completar la suspensión
      const activeShift = await prisma.shift.findFirst({
        where: { userId: agentId, endTime: null },
      });
      if (activeShift) {
        await prisma.shift.update({
          where: { id: activeShift.id },
          data: { endTime: new Date() },
        });
      }
    }

    const updatedAgent = await prisma.user.update({
      where: { id: agentId },
      data: {
        coachingCount: nextCoachingCount,
        suspendedUntil,
        isTaskActive: newlySuspended ? false : undefined,
        currentTaskType: newlySuspended ? null : undefined,
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        coachingCount: true,
        suspendedUntil: true,
      },
    });

    return NextResponse.json(
      {
        message: newlySuspended
          ? '¡Coaching registrado! El agente ha alcanzado 3 coachings y ha sido SUSPENDIDO por 1 día completo.'
          : `Coaching registrado exitosamente. (Coaching ${nextCoachingCount} de 3 máx).`,
        coaching: newCoaching,
        agent: updatedAgent,
        newlySuspended,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error en POST /api/admin/coachings:', error);
    return NextResponse.json(
      { error: 'Error del servidor al registrar coaching' },
      { status: 500 }
    );
  }
}
