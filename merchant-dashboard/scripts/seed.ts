// Creates a sample merchant database. Replace with your real DB by setting DB_PATH.
import Database from "better-sqlite3";
import fs from "fs";
fs.mkdirSync("data", { recursive: true });
fs.rmSync("data/merchant.db", { force: true });
const d = new Database("data/merchant.db");
d.exec(`
create table customers(id integer primary key, name text, city text, joined_at text);
create table products(id integer primary key, name text, category text, price real);
create table orders(id integer primary key, customer_id integer, order_date text, status text, channel text, total real);
create table order_items(id integer primary key, order_id integer, product_id integer, quantity integer, unit_price real);
`);
const pick = <T,>(a: T[]) => a[Math.floor(Math.random() * a.length)];
const cities = ["Mumbai", "Delhi", "Bengaluru", "Pune", "Chennai", "Kolkata"];
const prods = [["Cotton Kurti","Apparel",799],["Silk Saree","Apparel",3499],["Steel Bottle","Home",449],["Desk Lamp","Home",1299],["Earbuds","Electronics",1999],["Phone Case","Electronics",299],["Face Serum","Beauty",699],["Tote Bag","Accessories",599]] as const;
const insC = d.prepare("insert into customers values(?,?,?,?)");
for (let i = 1; i <= 120; i++) insC.run(i, `Customer ${i}`, pick(cities), "2025-0" + (1 + (i % 9)) + "-15");
const insP = d.prepare("insert into products values(?,?,?,?)");
prods.forEach((p, i) => insP.run(i + 1, ...p));
const insO = d.prepare("insert into orders values(?,?,?,?,?,?)");
const insI = d.prepare("insert into order_items values(?,?,?,?,?)");
let itemId = 1;
d.transaction(() => {
  for (let o = 1; o <= 1500; o++) {
    const date = new Date(Date.now() - Math.random() * 365 * 864e5).toISOString().slice(0, 10);
    const r = Math.random();
    const status = r < 0.8 ? "delivered" : r < 0.88 ? "shipped" : r < 0.94 ? "cancelled" : "returned";
    let total = 0;
    const lines = 1 + Math.floor(Math.random() * 3);
    const items = [];
    for (let k = 0; k < lines; k++) {
      const pi = Math.floor(Math.random() * prods.length), q = 1 + Math.floor(Math.random() * 3);
      total += prods[pi][2] * q; items.push([pi + 1, q, prods[pi][2]]);
    }
    insO.run(o, 1 + Math.floor(Math.random() * 120), date, status, pick(["web", "app", "marketplace"]), total);
    items.forEach(([p, q, u]) => insI.run(itemId++, o, p, q, u));
  }
})();
console.log("Seeded data/merchant.db");
