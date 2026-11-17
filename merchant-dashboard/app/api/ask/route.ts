import Anthropic from "@anthropic-ai/sdk";
import { NextResponse } from "next/server";
import { SCHEMA, safeSelect } from "@/lib/db";

const client = new Anthropic();
const model = process.env.ANTHROPIC_MODEL || "claude-sonnet-5-5";
const text = (r: Anthropic.Message) => r.content.map((b) => (b.type === "text" ? b.text : "")).join("");

export async function POST(req: Request) {
  try {
    const { question } = await req.json();
    const today = new Date().toISOString().slice(0, 10);

    const sqlRes = await client.messages.create({
      model, max_tokens: 500,
      system: `You write SQLite queries for a merchant's order database. Today is ${today}.
Schema:${SCHEMA}
Reply with ONE read-only SELECT statement and nothing else, no markdown. Exclude cancelled orders from revenue unless asked. Limit rows to 50.`,
      messages: [{ role: "user", content: question }],
    });
    const sql = text(sqlRes).replace(/```sql|```/g, "").trim();
    const rows = safeSelect(sql);

    const ans = await client.messages.create({
      model, max_tokens: 400,
      system: "Answer the merchant's question in 1-3 plain sentences using only the query results. Use ₹ for money. If the results are empty, say so.",
      messages: [{ role: "user", content: `Question: ${question}\nSQL: ${sql}\nResults: ${JSON.stringify(rows)}` }],
    });
    return NextResponse.json({ answer: text(ans), sql, rows });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "Something went wrong" }, { status: 400 });
  }
}
