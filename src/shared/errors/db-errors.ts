import { DomainError } from './domain-error.js';

interface PostgresError extends Error {
  code?: string;
  constraint?: string;
}

export function mapPostgresErrorToDomainError(
  error: PostgresError,
): DomainError | null {
  if (error.code !== '23505') {
    return null;
  }

  switch (error.constraint) {
    case 'users_username_key':
      return new DomainError(
        'USERNAME_TAKEN',
        'Ese nombre de usuario ya está en uso.',
        409,
        'username',
      );
    case 'users_email_key':
      return new DomainError(
        'EMAIL_TAKEN',
        'Ese email ya está en uso.',
        409,
        'email',
      );
    default:
      return null;
  }
}
