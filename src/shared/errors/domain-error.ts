export class DomainError extends Error {
  constructor(
    public readonly code: string,
    message: string,
    public readonly httpStatus: number = 400,
    public readonly field?: string,
  ) {
    super(message);
    this.name = 'DomainError';
  }
}
