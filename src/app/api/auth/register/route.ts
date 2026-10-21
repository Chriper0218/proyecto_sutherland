import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      firstName,
      lastName,
      birthDate,
      employeeId,
      email,
      accessKey,
      password,
      confirmPassword,
    } = body;

    // 1. Validar campos requeridos
    if (
      !firstName?.trim() ||
      !lastName?.trim() ||
      !birthDate ||
      !employeeId?.trim() ||
      !email?.trim() ||
      !password ||
      !confirmPassword
    ) {
      return NextResponse.json(
        { error: 'Todos los campos marcados son obligatorios.' },
        { status: 400 }
      );
    }

    // 2. Validar que las contraseñas coincidan
    if (password !== confirmPassword) {
      return NextResponse.json(
        { error: 'Las contraseñas no coinciden.' },
        { status: 400 }
      );
    }

    // 3. Validar longitud mínima de contraseña
    if (password.length < 6) {
      return NextResponse.json(
        { error: 'La contraseña debe tener al menos 6 caracteres.' },
        { status: 400 }
      );
    }

    // 4. Validar mayoría de edad (mínimo 18 años)
    const birth = new Date(birthDate);
    if (isNaN(birth.getTime())) {
      return NextResponse.json(
        { error: 'La fecha de nacimiento no es válida.' },
        { status: 400 }
      );
    }

    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }

    if (age < 18) {
      return NextResponse.json(
        { error: 'Debes ser mayor de 18 años para registrarte en el sistema.' },
        { status: 400 }
      );
    }

    const normalizedEmail = email.trim().toLowerCase();
    const normalizedEmployeeId = employeeId.trim();

    // 5. Verificar si el email ya existe
    const existingUserByEmail = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existingUserByEmail) {
      return NextResponse.json(
        { error: 'El correo corporativo ya se encuentra registrado.' },
        { status: 409 }
      );
    }

    // 6. Verificar si la cédula / employeeId ya existe
    const existingUserById = await prisma.user.findUnique({
      where: { employeeId: normalizedEmployeeId },
    });

    if (existingUserById) {
      return NextResponse.json(
        { error: 'La cédula o ID de empleado ya se encuentra registrada.' },
        { status: 409 }
      );
    }

    // 7. Evaluar rol según la llave de acceso (accessKey)
    // La llave 'SADMIN' otorga rol de ADMINISTRADOR. Cualquier otra llave o vacía asigna rol de EMPLEADO (Agente).
    const isMasterAdmin =
      Boolean(accessKey) &&
      (accessKey.trim().toUpperCase() === 'SADMIN' ||
        (process.env.ADMIN_ACCESS_KEY && accessKey.trim() === process.env.ADMIN_ACCESS_KEY.trim()));

    const role = isMasterAdmin ? 'ADMIN' : 'EMPLOYEE';

    // 8. Hashear la contraseña con 10 rondas de salt
    const hashedPassword = await bcrypt.hash(password, 10);

    // 9. Crear el nuevo usuario en Neon DB
    const newUser = await prisma.user.create({
      data: {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        birthDate: birth,
        employeeId: normalizedEmployeeId,
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
