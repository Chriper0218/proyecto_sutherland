import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password } = body;

    // 1. Validar que vengan los campos
    if (!email?.trim() || !password) {
      return NextResponse.json(
        { error: 'Por favor ingresa tu correo y contraseña.' },
        { status: 400 }
      );
    }

    const normalizedEmail = email.trim().toLowerCase();

    // 2. Buscar al usuario por correo
    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Credenciales incorrectas.' },
        { status: 401 }
      );
    }

    // 3. Comparar contraseñas usando bcrypt
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'Credenciales incorrectas.' },
        { status: 401 }
      );
    }

    // 4. Retornar información segura del usuario
    return NextResponse.json(
      {
        message: 'Inicio de sesión exitoso.',
        user: {
          id: user.id,
          employeeId: user.employeeId,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          role: user.role,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error en POST /api/auth/login:', error);
    return NextResponse.json(
      { error: 'Ocurrió un error en el servidor al intentar iniciar sesión.' },
      { status: 500 }
    );
  }
}
