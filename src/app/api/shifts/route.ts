import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/shifts?userId=... - Obtener turno activo del usuario
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'Falta el parámetro userId' }, { status: 400 });
    }

    // Buscar turno activo (sin endTime)
    const activeShift = await prisma.shift.findFirst({
      where: {
        userId,
        endTime: null,
      },
      orderBy: {
        startTime: 'desc',
      },
    });

    // Contar turnos de hoy
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const todayShiftsCount = await prisma.shift.count({
      where: {
        userId,
        startTime: {
          gte: todayStart,
        },
      },
    });

    return NextResponse.json(
      {
        activeShift,
        todayShiftsCount,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error al obtener turno activo:', error);
    return NextResponse.json(
      { error: 'Error al consultar el turno en el servidor' },
      { status: 500 }
    );
  }
}

// POST /api/shifts - Iniciar o Finalizar turno
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, userId, shiftId } = body;

    if (action === 'START') {
      if (!userId) {
        return NextResponse.json({ error: 'Se requiere userId para iniciar turno' }, { status: 400 });
      }

      // Validar si ya tiene un turno abierto
      const existingShift = await prisma.shift.findFirst({
        where: {
          userId,
          endTime: null,
        },
        orderBy: {
          startTime: 'desc',
        },
      });

      if (existingShift) {
        return NextResponse.json(
          {
            message: 'Ya tienes un turno activo en curso',
            shift: existingShift,
          },
          { status: 200 }
        );
      }

      // Crear nuevo turno en Prisma
      const newShift = await prisma.shift.create({
        data: {
          userId,
          startTime: new Date(),
        },
      });

      return NextResponse.json(
        {
          message: 'Turno iniciado correctamente',
          shift: newShift,
        },
        { status: 201 }
      );
    }

    if (action === 'END') {
      if (!shiftId) {
        return NextResponse.json({ error: 'Se requiere shiftId para finalizar el turno' }, { status: 400 });
      }

      // Actualizar turno con endTime
      const updatedShift = await prisma.shift.update({
        where: {
          id: shiftId,
        },
        data: {
          endTime: new Date(),
        },
      });

      return NextResponse.json(
        {
          message: 'Turno finalizado correctamente',
          shift: updatedShift,
        },
        { status: 200 }
      );
    }

    return NextResponse.json({ error: 'Acción no válida. Usa START o END' }, { status: 400 });
  } catch (error) {
    console.error('Error en /api/shifts:', error);
    return NextResponse.json(
      { error: 'Error al procesar la solicitud de turno' },
      { status: 500 }
    );
  }
}
