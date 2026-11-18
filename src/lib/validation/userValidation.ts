/**
 * Validación, saneamiento, normalización y formateo para usuarios.
 */

export const CORPORATE_EMAIL_REGEX = /^[a-z0-9._%+-]+@(sutherlandglobal\.com|sutherland\.com)$/i;
export const NAME_REGEX = /^[a-záéíóúüñ]+(?:\s[a-záéíóúüñ]+)*$/i;
export const CEDULA_REGEX = /^[a-z0-9]+$/i;
export const DANGEROUS_CHARS_REGEX = /[<>;"'`$\\{}]/;

export type UserRole = 'ADMIN' | 'EMPLOYEE';

export interface NormalizedRegistrationData {
  firstName: string;
  lastName: string;
  email: string;
  employeeId: string;
  birthDate: Date;
  password: string;
  role: UserRole;
}

export type RegistrationValidationResult =
  | { success: true; data: NormalizedRegistrationData }
  | { success: false; error: string };

/** Recorta extremos y colapsa espacios múltiples internos en uno solo. */
export function normalizeWhitespace(value: string): string {
  return value.trim().replace(/\s+/g, ' ');
}

/** Normaliza una cadena de texto plano para almacenamiento en BD (trim + espacios + minúsculas). */
export function toLowerNormalized(value: string): string {
  return normalizeWhitespace(value).toLowerCase();
}

/**
 * Convierte una cadena almacenada en minúsculas (ej. "christian perez")
 * a formato Title Case para visualización ("Christian Perez").
 */
export function toTitleCase(value?: string | null): string {
  if (!value) return '';
  const cleaned = normalizeWhitespace(value);
  if (!cleaned) return '';
  return cleaned
    .toLowerCase()
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/** Combina nombre y apellido formateados en Title Case para la UI. */
export function formatFullName(firstName?: string | null, lastName?: string | null): string {
  return [toTitleCase(firstName), toTitleCase(lastName)].filter(Boolean).join(' ');
}

/** Valida que el correo tenga longitud válida y pertenezca al dominio corporativo. */
export function isValidCorporateEmail(email: string): boolean {
  const cleaned = email.trim().toLowerCase();
  if (!cleaned || cleaned.length > 120) return false;
  return CORPORATE_EMAIL_REGEX.test(cleaned);
}

/**
 * Normaliza la cédula/ID y antepone el prefijo único según el rol
 * (`empleado-{cedula}` o `administrador-{cedula}`).
 */
export function buildPrefixedEmployeeId(
  rawEmployeeId: string,
  role: UserRole
): { valid: boolean; prefixedId: string; cleanId: string; error?: string } {
  const lowered = rawEmployeeId.trim().toLowerCase();
  let cleanId = lowered;

  if (lowered.startsWith('empleado-')) {
    cleanId = lowered.slice('empleado-'.length);
  } else if (lowered.startsWith('administrador-')) {
    cleanId = lowered.slice('administrador-'.length);
  }

  if (!cleanId || cleanId.length < 4 || cleanId.length > 25 || !CEDULA_REGEX.test(cleanId)) {
    return {
      valid: false,
      prefixedId: '',
      cleanId,
      error: 'La cédula o ID debe tener entre 4 y 25 caracteres alfanuméricos sin espacios ni símbolos.',
    };
  }

  const prefix = role === 'ADMIN' ? 'administrador' : 'empleado';
  return {
    valid: true,
    prefixedId: `${prefix}-${cleanId}`,
    cleanId,
  };
}

function asTrimmedString(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

function validateNameField(
  rawValue: string,
  label: string
): { valid: true; normalized: string } | { valid: false; error: string } {
  const collapsed = normalizeWhitespace(rawValue);
  if (collapsed.length < 2 || collapsed.length > 60) {
    return {
      valid: false,
      error: `El campo ${label} debe tener entre 2 y 60 caracteres.`,
    };
  }
  if (!NAME_REGEX.test(collapsed)) {
    return {
      valid: false,
      error: `El campo ${label} solo puede contener letras y espacios.`,
    };
  }
  return { valid: true, normalized: collapsed.toLowerCase() };
}

/**
 * Valida, sanea y normaliza el payload completo de registro antes de persistir en BD.
 */
export function validateAndNormalizeRegistration(
  input: Record<string, unknown>,
  envAdminKey?: string
): RegistrationValidationResult {
  const rawFirstName = asTrimmedString(input.firstName);
  const rawLastName = asTrimmedString(input.lastName);
  const rawBirthDate = asTrimmedString(input.birthDate);
  const rawEmployeeId = asTrimmedString(input.employeeId);
  const rawEmail = asTrimmedString(input.email);
  const rawAccessKey = asTrimmedString(input.accessKey);
  const password = typeof input.password === 'string' ? input.password : '';
  const confirmPassword = typeof input.confirmPassword === 'string' ? input.confirmPassword : '';

  if (
    !rawFirstName ||
    !rawLastName ||
    !rawBirthDate ||
    !rawEmployeeId ||
    !rawEmail ||
    !password ||
    !confirmPassword
  ) {
    return { success: false, error: 'Todos los campos marcados son obligatorios.' };
  }

  // Protección contra caracteres peligrosos / inyección
  if (
    DANGEROUS_CHARS_REGEX.test(rawFirstName) ||
    DANGEROUS_CHARS_REGEX.test(rawLastName) ||
    DANGEROUS_CHARS_REGEX.test(rawEmployeeId) ||
    DANGEROUS_CHARS_REGEX.test(rawEmail)
  ) {
    return {
      success: false,
      error: 'Los campos contienen caracteres no permitidos.',
    };
  }

  const firstNameResult = validateNameField(rawFirstName, 'nombres');
  if (!firstNameResult.valid) {
    return { success: false, error: firstNameResult.error };
  }

  const lastNameResult = validateNameField(rawLastName, 'apellidos');
  if (!lastNameResult.valid) {
    return { success: false, error: lastNameResult.error };
  }

  const normalizedEmail = rawEmail.toLowerCase();
  if (!isValidCorporateEmail(normalizedEmail)) {
    return { success: false, error: 'Debe ingresar un correo corporativo válido' };
  }

  if (password !== confirmPassword) {
    return { success: false, error: 'Las contraseñas no coinciden.' };
  }

  if (password.length < 6 || password.length > 100) {
    return {
      success: false,
      error: 'La contraseña debe tener entre 6 y 100 caracteres.',
    };
  }

  const birth = new Date(rawBirthDate);
  if (isNaN(birth.getTime())) {
    return { success: false, error: 'La fecha de nacimiento no es válida.' };
  }

  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  if (age < 18) {
    return {
      success: false,
      error: 'Debes ser mayor de 18 años para registrarte en el sistema.',
    };
  }

  const isMasterAdmin =
    Boolean(rawAccessKey) &&
    (rawAccessKey.toUpperCase() === 'SADMIN' ||
      (Boolean(envAdminKey) && rawAccessKey === envAdminKey?.trim()));

  const role: UserRole = isMasterAdmin ? 'ADMIN' : 'EMPLOYEE';

  const idResult = buildPrefixedEmployeeId(rawEmployeeId, role);
  if (!idResult.valid) {
    return { success: false, error: idResult.error || 'Cédula o ID inválido.' };
  }

  return {
    success: true,
    data: {
      firstName: firstNameResult.normalized,
      lastName: lastNameResult.normalized,
      email: normalizedEmail,
      employeeId: idResult.prefixedId,
      birthDate: birth,
      password,
      role,
    },
  };
}
