import Database from "better-sqlite3";
import path from "path";

const file = path.resolve(process.env.DB_PATH || "./data/merchant.db");

// Read-only connection: the AI can never modify merchant data.
export function db() {
  return new Database(file, { readonly: true, fileMustExist: true });
}

export const SCHEMA = `
customers(id, name, city, joined_at)
products(id, name, category, price)
orders(id, customer_id, order_date, status, channel, total)   -- status: delivered|shipped|cancelled|returned; channel: web|app|marketplace
order_items(id, order_id, product_id, quantity, unit_price)
`;

export function safeSelect(sql: string) {
  const s = sql.trim().replace(/;+\s*$/, "");
  if (!/^(select|with)\b/i.test(s) || s.includes(";") || /\b(insert|update|delete|drop|alter|attach|pragma|create)\b/i.test(s))
    throw new Error("Only a single read-only SELECT is allowed.");
  const conn = db();
  try {
    return conn.prepare(s).all().slice(0, 200);
  } finally {
    conn.close();
  }
}
