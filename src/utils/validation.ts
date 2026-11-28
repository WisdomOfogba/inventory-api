const MAX_NAME_LENGTH = 100;
const MAX_PRICE = 99999999.99;
const MAX_INTEGER = 2147483647;

export function parseProductId(idText: string): number | null {
  if (!/^\d+$/.test(idText)) {
    return null;
  }

  const id = Number(idText);

  if (id < 1 || id > MAX_INTEGER) {
    return null;
  }

  return id;
}

export function getProductValidationError(body: any): string | null {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return 'Request body must be a JSON object with name, price and quantity.';
  }

  const { name, price, quantity } = body;

  if (name === undefined || name === null) {
    return 'name is required.';
  }
  if (typeof name !== 'string' || name.trim() === '') {
    return 'name must be a non-empty string.';
  }
  if (name.trim().length > MAX_NAME_LENGTH) {
    return `name must be at most ${MAX_NAME_LENGTH} characters long.`;
  }

  if (price === undefined || price === null) {
    return 'price is required.';
  }
  if (typeof price !== 'number' || !Number.isFinite(price)) {
    return 'price must be a valid number, for example 450000 or 199.99.';
  }
  if (price < 0) {
    return 'price cannot be negative.';
  }
  if (price > MAX_PRICE) {
    return `price cannot be greater than ${MAX_PRICE}.`;
  }

  if (quantity === undefined || quantity === null) {
    return 'quantity is required.';
  }
  if (typeof quantity !== 'number' || !Number.isInteger(quantity)) {
    return 'quantity must be a whole number, for example 10.';
  }
  if (quantity < 0) {
    return 'quantity cannot be negative.';
  }
  if (quantity > MAX_INTEGER) {
    return `quantity cannot be greater than ${MAX_INTEGER}.`;
  }

  return null;
}
