import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

// GET /api/admin/ghost-messages?agentId=... - Obtener mensajes fantasma no leídos para el agente
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const agentId = searchParams.get('agentId');

    if (!agentId) {
      return NextResponse.json({ error: 'Falta el parámetro agentId' }, { status: 400 });
    }

    const messages = await prisma.ghostMessage.findMany({
      where: {
        agentId,
        read: false,
      },
      include: {
        sender: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    return NextResponse.json({ messages }, { status: 200 });
  } catch (error) {
    console.error('Error al obtener mensajes fantasma:', error);
    return NextResponse.json(
      { error: 'Error al consultar mensajes fantasma' },
      { status: 500 }
    );
  }
}

// POST /api/admin/ghost-messages - Enviar mensaje fantasma desde el administrador al agente
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { agentId, adminId, message } = body;

    if (!agentId || !adminId || !message?.trim()) {
      return NextResponse.json(
        { error: 'Se requiere agentId, adminId y el contenido del mensaje' },
        { status: 400 }
      );
    }

    const trimmedMsg = message.trim();
    if (trimmedMsg.length > 280) {
      return NextResponse.json(
        { error: 'El mensaje fantasma debe ser corto (máximo 280 caracteres)' },
        { status: 400 }
      );
    }

    const newMessage = await prisma.ghostMessage.create({
      data: {
        agentId,
        senderId: adminId,
        message: trimmedMsg,
      },
      include: {
        sender: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
        agent: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    return NextResponse.json(
      {
        message: 'Mensaje fantasma enviado exitosamente al agente',
        ghostMessage: newMessage,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error al enviar mensaje fantasma:', error);
    return NextResponse.json(
      { error: 'Error del servidor al enviar mensaje fantasma' },
      { status: 500 }
    );
  }
}

// PATCH /api/admin/ghost-messages - Marcar mensaje fantasma como leído (cuando el agente hace clic en Entendido)
export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { messageId } = body;

    if (!messageId) {
      return NextResponse.json({ error: 'Falta messageId' }, { status: 400 });
    }

    const updated = await prisma.ghostMessage.update({
      where: { id: messageId },
      data: { read: true },
    });

    return NextResponse.json({ success: true, message: updated }, { status: 200 });
  } catch (error) {
    console.error('Error al marcar mensaje fantasma como leído:', error);
    return NextResponse.json(
      { error: 'Error al actualizar mensaje fantasma' },
      { status: 500 }
    );
  }
}
