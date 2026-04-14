export class SeedValidationError extends Error {
  constructor(
    public readonly slug: string,
    public readonly field: string,
    message: string,
  ) {
    super(message);
    this.name = 'SeedValidationError';
    // Maintain proper prototype chain in transpiled ES5+
    Object.setPrototypeOf(this, SeedValidationError.prototype);
  }
}
