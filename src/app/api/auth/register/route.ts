import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { validateAndNormalizeRegistration } from '@/lib/validation/userValidation';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (!body || typeof body !== 'object') {
      return NextResponse.json(
        { error: 'Solicitud de registro inválida.' },
        { status: 400 }
      );
    }

    // 1. Validación, saneamiento y normalización integral del payload
    const validation = validateAndNormalizeRegistration(
      body as Record<string, unknown>,
      process.env.ADMIN_ACCESS_KEY
    );

    if (!validation.success) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    const {
      firstName,
      lastName,
      email: normalizedEmail,
      employeeId: prefixedEmployeeId,
      birthDate: birth,
      password,
      role,
    } = validation.data;

    // 2. Verificar si el email ya existe
    const existingUserByEmail = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existingUserByEmail) {
      return NextResponse.json(
        { error: 'El correo corporativo ya se encuentra registrado.' },
        { status: 409 }
      );
    }

    // 3. Verificar si la cédula con el prefijo del rol (empleado-{cedula} / administrador-{cedula}) ya existe
    const existingUserById = await prisma.user.findUnique({
      where: { employeeId: prefixedEmployeeId },
    });

    if (existingUserById) {
      return NextResponse.json(
        { error: `La cédula o ID (${prefixedEmployeeId}) ya se encuentra registrada para este rol.` },
        { status: 409 }
      );
    }

    // 4. Hashear la contraseña con 10 rondas de salt
    const hashedPassword = await bcrypt.hash(password, 10);

    // 5. Crear el nuevo usuario en Neon DB con campos normalizados en minúsculas
    const newUser = await prisma.user.create({
      data: {
        firstName,
        lastName,
        birthDate: birth,
        employeeId: prefixedEmployeeId,
        email: normalizedEmail,
        password: hashedPassword,
        role,
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        birthDate: true,
        employeeId: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    return NextResponse.json(
      {
        message: 'Usuario creado con éxito',
        user: newUser,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error en POST /api/auth/register:', error);
    return NextResponse.json(
      { error: 'Ocurrió un error interno en el servidor al procesar el registro.' },
      { status: 500 }
    );
  }
}
