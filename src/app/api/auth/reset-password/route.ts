import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import {
  DANGEROUS_CHARS_REGEX,
  normalizeWhitespace,
} from '@/lib/validation/userValidation';

const GENERIC_AUTH_ERROR =
  'Los datos ingresados no coinciden con ningún registro activo. Verifica tu correo, primer apellido y fecha de nacimiento.';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      action,
      email,
      identifier,
      lastName,
      birthDate,
      newPassword,
      confirmPassword,
    } = body ?? {};

    const mode = action === 'RESET' ? 'RESET' : 'VERIFY';

    const rawInput =
      typeof email === 'string' && email.trim()
        ? email
        : typeof identifier === 'string'
          ? identifier
          : '';
    const rawIdentifier = normalizeWhitespace(rawInput).toLowerCase();
    const normalizedLastName = normalizeWhitespace(
      typeof lastName === 'string' ? lastName : ''
    ).toLowerCase();
    const normalizedBirthDate =
      typeof birthDate === 'string' ? birthDate.trim() : '';

    if (!rawIdentifier || !normalizedLastName || !normalizedBirthDate) {
      return NextResponse.json(
        {
          error:
            'Correo electrónico (o ID), primer apellido y fecha de nacimiento son obligatorios.',
        },
        { status: 400 }
      );
    }

    if (
      DANGEROUS_CHARS_REGEX.test(rawIdentifier) ||
      DANGEROUS_CHARS_REGEX.test(normalizedLastName) ||
      DANGEROUS_CHARS_REGEX.test(normalizedBirthDate)
    ) {
      return NextResponse.json(
        { error: 'Los campos contienen caracteres no permitidos.' },
        { status: 400 }
      );
    }

    if (!/^\d{4}-\d{2}-\d{2}$/.test(normalizedBirthDate)) {
      return NextResponse.json(
        { error: 'Formato de fecha de nacimiento inválido.' },
        { status: 400 }
      );
    }

    const user = rawIdentifier.includes('@')
      ? await prisma.user.findUnique({
          where: { email: rawIdentifier },
        })
      : await prisma.user.findFirst({
          where: {
            OR: [
              { employeeId: rawIdentifier },
              { employeeId: `empleado-${rawIdentifier}` },
              { employeeId: `administrador-${rawIdentifier}` },
            ],
          },
        });

    if (!user) {
      return NextResponse.json({ error: GENERIC_AUTH_ERROR }, { status: 401 });
    }

    const storedLastName = normalizeWhitespace(user.lastName).toLowerCase();
    const storedFirstSurname = storedLastName.split(' ')[0];
    const isLastNameMatch =
      normalizedLastName === storedLastName ||
      normalizedLastName === storedFirstSurname;

    const storedBirthDate = user.birthDate.toISOString().slice(0, 10);
    const isBirthDateMatch = normalizedBirthDate === storedBirthDate;

    if (!isLastNameMatch || !isBirthDateMatch) {
      return NextResponse.json({ error: GENERIC_AUTH_ERROR }, { status: 401 });
    }

    if (mode === 'VERIFY') {
      return NextResponse.json(
        {
          verified: true,
          message:
            'Identidad verificada correctamente. Ingresa tu nueva contraseña.',
        },
        { status: 200 }
      );
    }

    if (
      typeof newPassword !== 'string' ||
      newPassword.length < 6 ||
      newPassword.length > 100
    ) {
      return NextResponse.json(
        { error: 'La nueva contraseña debe tener entre 6 y 100 caracteres.' },
        { status: 400 }
      );
    }

    if (typeof confirmPassword === 'string' && newPassword !== confirmPassword) {
      return NextResponse.json(
        { error: 'Las contraseñas no coinciden.' },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword },
    });

    return NextResponse.json(
      {
        success: true,
        message:
          'Contraseña actualizada exitosamente. Ya puedes iniciar sesión.',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error en POST /api/auth/reset-password:', error);
    return NextResponse.json(
      {
        error:
          'Ocurrió un error en el servidor al procesar la recuperación de contraseña.',
      },
      { status: 500 }
    );
  }
}
