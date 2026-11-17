import { db } from "@/lib/db";
import AskBox from "@/components/AskBox";

export const dynamic = "force-dynamic";
const inr = (n: number) => "₹" + Math.round(n).toLocaleString("en-IN");

export default function Page() {
  const c = db();
  const k: any = c.prepare(`select count(*) n, coalesce(sum(total),0) rev, coalesce(avg(total),0) aov,
    sum(status='returned')*1.0/count(*) ret from orders where status!='cancelled'`).get();
  const monthly = c.prepare(`select substr(order_date,1,7) m, sum(total) rev from orders where status!='cancelled'
    group by m order by m desc limit 12`).all().reverse() as { m: string; rev: number }[];
  const top = c.prepare(`select p.name, sum(i.quantity) units, sum(i.quantity*i.unit_price) rev from order_items i
    join products p on p.id=i.product_id join orders o on o.id=i.order_id where o.status!='cancelled'
    group by p.id order by rev desc limit 5`).all() as any[];
  const recent = c.prepare(`select o.id, o.order_date, cu.name, o.channel, o.status, o.total from orders o
    join customers cu on cu.id=o.customer_id order by o.order_date desc, o.id desc limit 8`).all() as any[];
  c.close();
  const max = Math.max(...monthly.map((x) => x.rev), 1);

  return (
    <main>
      <header><h1>Orders</h1><p>{k.n.toLocaleString("en-IN")} orders · {inr(k.rev)} revenue</p></header>
      <AskBox />
      <div className="kpis">
        <div><b>{inr(k.rev)}</b><span>Revenue</span></div>
        <div><b>{inr(k.aov)}</b><span>Average order</span></div>
        <div><b>{(k.ret * 100).toFixed(1)}%</b><span>Return rate</span></div>
      </div>
      <section>
        <h2>Revenue by month</h2>
        <div className="bars" role="img" aria-label="Monthly revenue bar chart">
          {monthly.map((x) => (
            <div key={x.m} className="bar"><i style={{ height: `${(x.rev / max) * 100}%` }} title={inr(x.rev)} /><span>{x.m.slice(5)}</span></div>
          ))}
        </div>
      </section>
      <div className="two">
        <section><h2>Top products</h2><table><tbody>
          {top.map((t) => <tr key={t.name}><td>{t.name}</td><td>{t.units} sold</td><td className="r">{inr(t.rev)}</td></tr>)}
        </tbody></table></section>
        <section><h2>Latest orders</h2><table><tbody>
          {recent.map((o) => <tr key={o.id}><td>#{o.id}</td><td>{o.name}</td><td>{o.status}</td><td className="r">{inr(o.total)}</td></tr>)}
        </tbody></table></section>
      </div>
    </main>
  );
}
