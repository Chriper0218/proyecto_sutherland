import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    // Obtener todos los agentes registrados (role = EMPLOYEE)
    const agents = await prisma.user.findMany({
      where: {
        role: 'EMPLOYEE',
      },
      select: {
        id: true,
        employeeId: true,
        firstName: true,
        lastName: true,
        email: true,
        role: true,
        createdAt: true,
        coachingCount: true,
        suspendedUntil: true,
        isTaskActive: true,
        currentTaskType: true,
        taskStartedAt: true,
        shifts: {
          where: {
            endTime: null,
          },
          orderBy: {
            startTime: 'desc',
          },
          take: 1,
          select: {
            id: true,
            startTime: true,
          },
        },
        tasks: {
          where: {
            createdAt: {
              gte: todayStart,
            },
          },
          select: {
            id: true,
            taskType: true,
            durationSeconds: true,
            decision: true,
            createdAt: true,
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
        agentCoachings: {
          select: {
            id: true,
            reason: true,
            ahtAtTime: true,
            createdAt: true,
            admin: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
      orderBy: {
        firstName: 'asc',
      },
    });

    const now = new Date();

    // Procesar información en tiempo real por cada agente
    let totalAgentsOnShift = 0;
    let totalAgentsOnTask = 0;
    let totalAgentsShiftNoTask = 0;
    let totalAgentsOffShift = 0;
    let totalAgentsSuspended = 0;
    let globalDurationSum = 0;
    let globalTasksCount = 0;

    const taskDistribution: Record<string, number> = {
      KYC: 0,
      RISK_REVIEW: 0,
      RECORD_KEEPING: 0,
      WATCHLIST_REVIEW: 0,
    };

    const TARGET_AHT_SECONDS = 600; // 10 minutos
    const WARNING_THRESHOLD_SECONDS = 720; // 12 minutos (+2 minutos)

    const processedAgents = agents.map((agent) => {
      const isSuspended = Boolean(
        agent.suspendedUntil && new Date(agent.suspendedUntil) > now
      );

      const activeShift = agent.shifts.length > 0 ? agent.shifts[0] : null;
      const hasActiveShift = Boolean(activeShift);
      const hasActiveTask = Boolean(agent.isTaskActive);

      if (isSuspended) {
        totalAgentsSuspended++;
      }

      if (hasActiveShift) {
        totalAgentsOnShift++;
        if (hasActiveTask) {
          totalAgentsOnTask++;
        } else {
          totalAgentsShiftNoTask++;
        }
      } else {
        totalAgentsOffShift++;
      }

      // Cálculo de métricas de hoy del agente
      const totalTasksToday = agent.tasks.length;
      let sumDuration = 0;

      agent.tasks.forEach((t) => {
        sumDuration += t.durationSeconds;
        globalDurationSum += t.durationSeconds;
        globalTasksCount++;

        const typeKey = t.taskType as string;
        if (taskDistribution[typeKey] !== undefined) {
          taskDistribution[typeKey]++;
        } else {
          taskDistribution[typeKey] = 1;
        }
      });

      const avgAht = totalTasksToday > 0 ? Math.round(sumDuration / totalTasksToday) : 0;

      // Evaluación del Target (AHT de 10 min):
      // Verde: <= 10 min (600s)
      // Naranja: > 10 min y <= 12 min (601s a 720s)
      // Rojo: > 12 min (> 720s)
      let targetStatus: 'IN_TARGET' | 'WARNING' | 'CRITICAL' | 'NO_DATA' = 'NO_DATA';
      let statusColor: 'green' | 'orange' | 'red' | 'gray' = 'gray';
      let alertMessage: string | null = null;

      if (totalTasksToday > 0) {
        if (avgAht <= TARGET_AHT_SECONDS) {
          targetStatus = 'IN_TARGET';
          statusColor = 'green';
        } else if (avgAht <= WARNING_THRESHOLD_SECONDS) {
          targetStatus = 'WARNING';
          statusColor = 'orange';
          const overSeconds = avgAht - TARGET_AHT_SECONDS;
          alertMessage = `Fuera de target por ${Math.floor(overSeconds / 60)}m ${overSeconds % 60}s (dentro del margen de 2 min)`;
        } else {
          targetStatus = 'CRITICAL';
          statusColor = 'red';
          const overSeconds = avgAht - TARGET_AHT_SECONDS;
          alertMessage = `Crítico: Supera el target por ${Math.floor(overSeconds / 60)}m ${overSeconds % 60}s (+2 min). Afecta la eficiencia operativa y requiere coaching.`;
        }
      }

      // Eficiencia operativa: Si AHT <= 10 min = 100%, sino decrece proporcionalmente
      const efficiency =
        avgAht > 0
          ? Math.min(100, Math.round((TARGET_AHT_SECONDS / avgAht) * 100))
          : totalTasksToday > 0
          ? 100
          : 0;

      // Estado operativo en tiempo real
      let liveStatus: 'ON_TASK' | 'SHIFT_NO_TASK' | 'OFF_SHIFT' | 'SUSPENDED' = 'OFF_SHIFT';
      if (isSuspended) {
        liveStatus = 'SUSPENDED';
      } else if (hasActiveShift && hasActiveTask) {
        liveStatus = 'ON_TASK';
      } else if (hasActiveShift && !hasActiveTask) {
        liveStatus = 'SHIFT_NO_TASK';
      } else {
        liveStatus = 'OFF_SHIFT';
      }

      return {
        id: agent.id,
        employeeId: agent.employeeId,
        firstName: agent.firstName,
        lastName: agent.lastName,
        email: agent.email,
        role: agent.role,
        createdAt: agent.createdAt,
        coachingCount: agent.coachingCount,
        suspendedUntil: agent.suspendedUntil,
        isSuspended,
        liveStatus,
        activeShift,
        hasActiveTask,
        currentTaskType: agent.currentTaskType,
        taskStartedAt: agent.taskStartedAt,
        todayMetrics: {
          totalTasks: totalTasksToday,
          avgAht,
          efficiency,
          targetStatus,
          statusColor,
          alertMessage,
        },
        coachings: agent.agentCoachings,
        recentTasks: agent.tasks.slice(0, 10),
      };
    });

    const companyAvgAht =
      globalTasksCount > 0 ? Math.round(globalDurationSum / globalTasksCount) : 0;
    const companyEfficiency =
      companyAvgAht > 0
        ? Math.min(100, Math.round((TARGET_AHT_SECONDS / companyAvgAht) * 100))
        : 100;

    let companyStatusColor: 'green' | 'orange' | 'red' = 'green';
    if (companyAvgAht > WARNING_THRESHOLD_SECONDS) {
      companyStatusColor = 'red';
    } else if (companyAvgAht > TARGET_AHT_SECONDS) {
      companyStatusColor = 'orange';
    }

    return NextResponse.json(
      {
        summary: {
          totalAgents: agents.length,
          agentsOnShift: totalAgentsOnShift,
          agentsOffShift: totalAgentsOffShift,
          agentsOnTask: totalAgentsOnTask,
          agentsShiftNoTask: totalAgentsShiftNoTask,
          agentsSuspended: totalAgentsSuspended,
          globalTasksCount,
          companyAvgAht,
          companyEfficiency,
          companyStatusColor,
          targetAhtSeconds: TARGET_AHT_SECONDS,
          taskDistribution,
        },
        agents: processedAgents,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error en GET /api/admin/agents:', error);
    return NextResponse.json(
      { error: 'Error al consultar agentes y métricas en el servidor' },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/agents - Eliminar usuario empleado con doble validación del administrador
export async function DELETE(req: NextRequest) {
  try {
    const body = await req.json();
    const agentId = typeof body?.agentId === 'string' ? body.agentId.trim() : '';
    const adminId = typeof body?.adminId === 'string' ? body.adminId.trim() : '';
    const adminBirthDate = typeof body?.adminBirthDate === 'string' ? body.adminBirthDate.trim() : '';
    const adminPassword = typeof body?.adminPassword === 'string' ? body.adminPassword : '';

    if (!agentId || !adminId || !adminBirthDate || !adminPassword) {
      return NextResponse.json(
        { error: 'Debes ingresar tu fecha de nacimiento y tu contraseña actual de administrador.' },
        { status: 400 }
      );
    }

    if (agentId === adminId) {
      return NextResponse.json(
        { error: 'No puedes eliminar tu propia cuenta.' },
        { status: 403 }
      );
    }

    // 1. Verificar administrador autenticado
    const adminUser = await prisma.user.findUnique({
      where: { id: adminId },
      select: {
        id: true,
        role: true,
        birthDate: true,
        password: true,
      },
    });

    if (!adminUser || adminUser.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Acceso denegado: Se requieren permisos de Administrador.' },
        { status: 403 }
      );
    }

    // 2. Validar fecha de nacimiento en formato YYYY-MM-DD (UTC) para evitar desfases horarios
    const storedBirthDate = adminUser.birthDate.toISOString().slice(0, 10);
    if (adminBirthDate !== storedBirthDate) {
      return NextResponse.json(
        { error: 'La fecha de nacimiento no coincide con la registrada para el administrador actual.' },
        { status: 401 }
      );
    }

    // 3. Validar contraseña actual usando bcrypt
    const isPasswordValid = await bcrypt.compare(adminPassword, adminUser.password);
    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'La contraseña del administrador es incorrecta.' },
        { status: 401 }
      );
    }

    // 4. Verificar que el usuario objetivo exista y sea empleado
    const targetUser = await prisma.user.findUnique({
      where: { id: agentId },
      select: {
        id: true,
        role: true,
      },
    });

    if (!targetUser) {
      return NextResponse.json(
        { error: 'El empleado especificado no existe.' },
        { status: 404 }
      );
    }

    if (targetUser.role !== 'EMPLOYEE') {
      return NextResponse.json(
        { error: 'No está permitido eliminar cuentas con rol de Administrador.' },
        { status: 403 }
      );
    }

    // 5. Eliminar dependencias y usuario empleado en una transacción atómica
    await prisma.$transaction([
      prisma.coaching.deleteMany({
        where: { OR: [{ agentId }, { adminId: agentId }] },
      }),
      prisma.ghostMessage.deleteMany({
        where: { OR: [{ agentId }, { senderId: agentId }] },
      }),
      prisma.taskMetric.deleteMany({
        where: { userId: agentId },
      }),
      prisma.shift.deleteMany({
        where: { userId: agentId },
      }),
      prisma.user.delete({
        where: { id: agentId },
      }),
    ]);

    return NextResponse.json(
      {
        message: 'Empleado eliminado correctamente del sistema.',
        deletedAgentId: agentId,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error en DELETE /api/admin/agents:', error);
    return NextResponse.json(
      { error: 'Error del servidor al intentar eliminar el empleado.' },
      { status: 500 }
    );
  }
}
