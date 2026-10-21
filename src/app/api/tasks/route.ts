import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { TaskType } from '@prisma/client';

// POST /api/tasks - Registrar una métrica de tarea (AHT)
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      userId,
      shiftId,
      taskType,
      startTime,
      endTime,
      durationSeconds,
      decision,
      country,
      corridor,
      noteSummary,
      metadata,
    } = body;

    if (!userId || !startTime || !endTime) {
      return NextResponse.json(
        { error: 'Faltan campos obligatorios (userId, startTime, endTime)' },
        { status: 400 }
      );
    }

    // Calcular duración si no viene calculada
    const start = new Date(startTime);
    const end = new Date(endTime);
    const calculatedDuration =
      typeof durationSeconds === 'number'
        ? Math.max(0, Math.round(durationSeconds))
        : Math.max(0, Math.round((end.getTime() - start.getTime()) / 1000));

    // Validar taskType válido del enum
    const validTaskType: TaskType = Object.values(TaskType).includes(taskType)
      ? taskType
      : TaskType.KYC;

    // Verificar si el shiftId existe y pertenece al usuario si viene provisto
    let validShiftId: string | null = null;
    if (shiftId) {
      const shiftExists = await prisma.shift.findUnique({
        where: { id: shiftId },
      });
      if (shiftExists) {
        validShiftId = shiftId;
      }
    }

    // Crear registro en TaskMetric
    const metric = await prisma.taskMetric.create({
      data: {
        userId,
        shiftId: validShiftId,
        taskType: validTaskType,
        startTime: start,
        endTime: end,
        durationSeconds: calculatedDuration,
        decision: decision ? String(decision) : null,
        country: country ? String(country) : null,
        corridor: corridor ? String(corridor) : null,
        noteSummary: noteSummary ? String(noteSummary) : null,
        metadata: metadata ? (typeof metadata === 'string' ? metadata : JSON.stringify(metadata)) : null,
      },
    });

    return NextResponse.json(
      {
        message: 'Métrica de tarea guardada con éxito',
        metric,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error al registrar TaskMetric:', error);
    return NextResponse.json(
      { error: 'Error del servidor al registrar métrica de tarea' },
      { status: 500 }
    );
  }
}

// GET /api/tasks?userId=... - Obtener métricas y AHT promedio del usuario
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'Falta el parámetro userId' }, { status: 400 });
    }

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const [todayTasks, recentTasks] = await Promise.all([
      // Tareas de hoy para promedio AHT
      prisma.taskMetric.findMany({
        where: {
          userId,
          createdAt: {
            gte: todayStart,
          },
        },
        select: {
          id: true,
          taskType: true,
          durationSeconds: true,
          createdAt: true,
        },
      }),
      // Últimas 5 tareas
      prisma.taskMetric.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: {
          id: true,
          taskType: true,
          durationSeconds: true,
          createdAt: true,
        },
      }),
    ]);

    const totalNotesToday = todayTasks.length;
    const avgAhtToday =
      totalNotesToday > 0
        ? Math.round(
            todayTasks.reduce((acc, curr) => acc + curr.durationSeconds, 0) / totalNotesToday
          )
        : 0;

    return NextResponse.json(
      {
        totalNotesToday,
        avgAhtToday,
        recentTasks,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error al consultar métricas de tareas:', error);
    return NextResponse.json(
      { error: 'Error al consultar métricas' },
      { status: 500 }
    );
  }
}
