export class BlockNotFoundError extends Error {
  constructor(public readonly slug: string) {
    super(`Block not found: "${slug}"`);
    this.name = 'BlockNotFoundError';
    Object.setPrototypeOf(this, BlockNotFoundError.prototype);
  }
}
