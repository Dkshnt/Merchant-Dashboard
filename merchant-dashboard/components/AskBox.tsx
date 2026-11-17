"use client";
import { useState } from "react";

const examples = ["Which product earned the most last month?", "How many orders were returned this year?", "Which city has the highest average order value?"];

export default function AskBox() {
  const [q, setQ] = useState("");
  const [busy, setBusy] = useState(false);
  const [res, setRes] = useState<{ answer?: string; sql?: string; rows?: any[]; error?: string } | null>(null);

  async function ask(question: string) {
    if (!question.trim()) return;
    setQ(question); setBusy(true); setRes(null);
    const r = await fetch("/api/ask", { method: "POST", body: JSON.stringify({ question }) });
    setRes(await r.json()); setBusy(false);
  }

  return (
    <section className="ask">
      <h2>Ask your orders</h2>
      <div className="row">
        <input value={q} onChange={(e) => setQ(e.target.value)} onKeyDown={(e) => e.key === "Enter" && ask(q)}
          placeholder="e.g. What was my best-selling product in October?" aria-label="Question about your orders" />
        <button onClick={() => ask(q)} disabled={busy}>{busy ? "Working…" : "Ask"}</button>
      </div>
      <div className="chips">{examples.map((e) => <button key={e} className="chip" onClick={() => ask(e)}>{e}</button>)}</div>
      {res?.error && <p className="err">{res.error} Try rephrasing the question.</p>}
      {res?.answer && (
        <div className="answer">
          <p>{res.answer}</p>
          <details><summary>How this was calculated</summary>
            <pre>{res.sql}</pre>
            {res.rows && res.rows.length > 0 && (
              <div className="scroll"><table>
                <thead><tr>{Object.keys(res.rows[0]).map((k) => <th key={k}>{k}</th>)}</tr></thead>
                <tbody>{res.rows.slice(0, 20).map((r, i) => <tr key={i}>{Object.values(r).map((v: any, j) => <td key={j}>{String(v)}</td>)}</tr>)}</tbody>
              </table></div>
            )}
          </details>
        </div>
      )}
    </section>
  );
}
