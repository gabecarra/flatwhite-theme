/**
 * Flatwhite theme preview — TypeScript
 */

type Result<T, E = Error> =
  | { ok: true; value: T }
  | { ok: false; error: E };

function ok<T>(value: T): Result<T> {
  return { ok: true, value };
}

function err<T, E = Error>(error: E): Result<T, E> {
  return { ok: false, error };
}

interface Validator<T> {
  validate(input: unknown): Result<T>;
  optional(): Validator<T | undefined>;
}

type Schema<T> = {
  [K in keyof T]: Validator<T[K]>;
};

class StringValidator implements Validator<string> {
  private minLen: number;
  private maxLen: number;
  private pattern: RegExp | null;

  constructor({ min = 0, max = Infinity, pattern = null } = {}) {
    this.minLen = min;
    this.maxLen = max;
    this.pattern = pattern;
  }

  validate(input: unknown): Result<string> {
    if (typeof input !== "string") {
      return err(new Error(`expected string, got ${typeof input}`));
    }
    if (input.length < this.minLen) {
      return err(new Error(`too short (min ${this.minLen})`));
    }
    if (input.length > this.maxLen) {
      return err(new Error(`too long (max ${this.maxLen})`));
    }
    if (this.pattern && !this.pattern.test(input)) {
      return err(new Error(`does not match ${this.pattern}`));
    }
    return ok(input);
  }

  optional(): Validator<string | undefined> {
    return new OptionalValidator(this);
  }
}

class OptionalValidator<T> implements Validator<T | undefined> {
  constructor(private inner: Validator<T>) {}

  validate(input: unknown): Result<T | undefined> {
    if (input === undefined || input === null) return ok(undefined);
    return this.inner.validate(input);
  }

  optional(): Validator<T | undefined> {
    return this;
  }
}

function object<T extends Record<string, unknown>>(
  schema: Schema<T>,
): Validator<T> {
  return {
    validate(input: unknown): Result<T> {
      if (typeof input !== "object" || input === null || Array.isArray(input)) {
        return err(new Error("expected object"));
      }
      const result = {} as T;
      for (const key of Object.keys(schema) as (keyof T)[]) {
        const field = (input as Record<string, unknown>)[key as string];
        const validated = schema[key].validate(field);
        if (!validated.ok) {
          return err(new Error(`field "${String(key)}": ${validated.error.message}`));
        }
        result[key] = validated.value;
      }
      return ok(result);
    },
    optional() {
      return new OptionalValidator(this);
    },
  };
}

// --- usage ---

const userSchema = object({
  name: new StringValidator({ min: 1, max: 64 }),
  email: new StringValidator({ pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ }),
  bio: new StringValidator({ max: 256 }).optional(),
});

const inputs: unknown[] = [
  { name: "Alice", email: "alice@example.com" },
  { name: "", email: "not-an-email", bio: "hello" },
  null,
];

for (const input of inputs) {
  const result = userSchema.validate(input);
  if (result.ok) {
    console.log("valid:", result.value);
  } else {
    console.error("invalid:", result.error.message);
  }
}
