const test = require("node:test");
const assert = require("node:assert");
const { SusuGroup, parseGhs, formatGhs } = require("../susu");
const make = () => { const g = new SusuGroup("50.00"); ["Ama", "Kofi", "Esi"].forEach((m) => g.addMember(m)); return g; };

test("example scenario", () => {
  const g = make();
  g.contribute("Ama", 1, "50"); g.contribute("Kofi", 1, "50"); g.contribute("Esi", 1, "30");
  const r1 = g.closeWeek();
  assert.strictEqual(r1.paidOut, null);
  assert.deepStrictEqual(r1.owing, [{ member: "Esi", amount: 2000 }]);
  g.contribute("Esi", 1, "20");
  assert.deepStrictEqual(g.closeWeek().paidOut, { week: 1, member: "Ama", amount: 15000 });
  assert.strictEqual(g.week, 2);
  assert.match(g.report(), /Next recipient: Kofi/);
});
test("rejects bad input", () => {
  const g = make();
  assert.throws(() => g.addMember("ama"), /Duplicate/);
  assert.throws(() => g.contribute("Yaw", 1, "10"), /Unknown/);
  assert.throws(() => g.contribute("Ama", 1, "0"));
  assert.throws(() => g.contribute("Ama", 1, "-5"));
  assert.throws(() => g.contribute("Ama", 1, "50.01"), /owes/);
  g.contribute("Ama", 1, "10");
  assert.throws(() => g.addMember("Yaw"), /after week 1/);
});
test("exact money", () => {
  const g = new SusuGroup("0.30"); g.addMember("A");
  g.contribute("A", 1, "0.10"); g.contribute("A", 1, "0.20");
  assert.strictEqual(g.owes("A"), 0);
  assert.strictEqual(formatGhs(15000), "150.00");
  assert.throws(() => parseGhs("1.005"));
});
