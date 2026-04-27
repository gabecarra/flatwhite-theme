/**
 * Flatwhite theme preview — JavaScript
 */

const MAX_POOL_SIZE = 10;
const DEFAULT_TIMEOUT = 5_000;

class EventEmitter {
  #listeners = new Map();

  on(event, listener) {
    if (!this.#listeners.has(event)) {
      this.#listeners.set(event, []);
    }
    this.#listeners.get(event).push(listener);
    return this;
  }

  off(event, listener) {
    const bucket = this.#listeners.get(event);
    if (!bucket) return this;
    this.#listeners.set(
      event,
      bucket.filter((l) => l !== listener),
    );
    return this;
  }

  emit(event, ...args) {
    const bucket = this.#listeners.get(event) ?? [];
    for (const listener of bucket) {
      listener(...args);
    }
  }
}

class ConnectionPool extends EventEmitter {
  #pool = [];
  #waiting = [];
  constructor(
    factory,
    { maxSize = MAX_POOL_SIZE, timeout = DEFAULT_TIMEOUT } = {},
  ) {
    super();
    this.factory = factory;
    this.maxSize = maxSize;
    this.timeout = timeout;
    this.size = 0;
  }

  async acquire() {
    if (this.#pool.length > 0) {
      return this.#pool.pop();
    }
    if (this.size < this.maxSize) {
      this.size++;
      const conn = await this.factory();
      this.emit("created", conn);
      return conn;
    }
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        const idx = this.#waiting.indexOf(resolve);
        if (idx !== -1) this.#waiting.splice(idx, 1);
        reject(new Error(`Pool timeout after ${this.timeout}ms`));
      }, this.timeout);

      this.#waiting.push((conn) => {
        clearTimeout(timer);
        resolve(conn);
      });
    });
  }

  release(conn) {
    if (this.#waiting.length > 0) {
      const next = this.#waiting.shift();
      next(conn);
    } else {
      this.#pool.push(conn);
      this.emit("released", conn);
    }
  }

  get stats() {
    return {
      idle: this.#pool.length,
      waiting: this.#waiting.length,
      total: this.size,
    };
  }
}

async function withConnection(pool, fn) {
  const conn = await pool.acquire();
  try {
    return await fn(conn);
  } finally {
    pool.release(conn);
  }
}

// --- demo ---

let idCounter = 0;

const pool = new ConnectionPool(
  async () => ({ id: ++idCounter, query: async (sql) => `result(${sql})` }),
  { maxSize: 3 },
);

pool.on("created", (c) => console.log(`connection ${c.id} created`));
pool.on("released", (c) => console.log(`connection ${c.id} back in pool`));

const queries = ["SELECT 1", "SELECT 2", "SELECT 3", "SELECT 4", "SELECT 5"];

const results = await Promise.all(
  queries.map((sql) => withConnection(pool, (conn) => conn.query(sql))),
);

console.log("results:", results);
console.log("pool stats:", pool.stats);
