// Susu (rotating savings group) core logic.
// Money is stored as integer pesewas (1 GHS = 100 pesewas) to avoid rounding errors.
class SusuError extends Error {}

function parseGhs(input) {
  const s = String(input ?? "").trim();
  if (!/^\d+(\.\d{1,2})?$/.test(s)) throw new SusuError(`Invalid amount "${s}" (use e.g. 50 or 50.00)`);
  const [whole, frac = ""] = s.split(".");
  const p = Number(whole) * 100 + Number(frac.padEnd(2, "0"));
  if (!Number.isSafeInteger(p)) throw new SusuError("Amount too large");
  if (p <= 0) throw new SusuError("Amount must be greater than zero");
  return p;
}

function formatGhs(p) {
  return `${Math.floor(p / 100)}.${String(p % 100).padStart(2, "0")}`;
}

class SusuGroup {
  constructor(weeklyAmount) {
    this.weekly = parseGhs(weeklyAmount);
    this.members = [];
    this.week = 1;
    this.paid = new Map();
    this.payouts = [];
    this.started = false;
  }

  get finished() { return this.members.length > 0 && this.payouts.length === this.members.length; }

  addMember(name) {
    const n = String(name ?? "").trim();
    if (!n) throw new SusuError("Member name is required");
    if (this.started) throw new SusuError("Cannot add members after week 1 has started");
    if (this.members.some((m) => m.toLowerCase() === n.toLowerCase())) throw new SusuError(`Duplicate member "${n}"`);
    this.members.push(n);
    this.paid.set(n, 0);
  }

  resolve(name) {
    const m = this.members.find((x) => x.toLowerCase() === String(name ?? "").trim().toLowerCase());
    if (!m) throw new SusuError(`Unknown member "${name}"`);
    return m;
  }

  owes(member) { return this.weekly - this.paid.get(this.resolve(member)); }

  contribute(name, week, amount) {
    if (this.finished) throw new SusuError("The cycle is complete; no more contributions");
    const m = this.resolve(name);
    if (week !== this.week) throw new SusuError(`Contributions are only accepted for the current week (${this.week})`);
    const p = parseGhs(amount);
    const owed = this.owes(m);
    if (p > owed) throw new SusuError(`${m} only owes ${formatGhs(owed)} for week ${week}`);
    this.paid.set(m, this.weekly - owed + p);
    this.started = true;
  }

  closeWeek() {
    if (this.members.length === 0) throw new SusuError("Group has no members");
    if (this.finished) throw new SusuError("The cycle is complete");
    const owing = this.members.filter((m) => this.owes(m) > 0).map((m) => ({ member: m, amount: this.owes(m) }));
    if (owing.length) return { paidOut: null, owing };
    const payout = { week: this.week, member: this.members[this.payouts.length], amount: this.weekly * this.members.length };
    this.payouts.push(payout);
    this.started = true;
    this.week++;
    for (const m of this.members) this.paid.set(m, 0);
    return { paidOut: payout, owing: [] };
  }

  report() {
    const lines = [`Week: ${this.finished ? "cycle complete" : this.week}  (weekly ${formatGhs(this.weekly)} GHS)`];
    if (!this.finished) {
      const full = this.members.filter((m) => this.owes(m) === 0);
      lines.push(`Paid in full: ${full.join(", ") || "none"}`);
      const owe = this.members.filter((m) => this.owes(m) > 0);
      lines.push("Owing:", ...(owe.length ? owe.map((m) => `  ${m} owes ${formatGhs(this.owes(m))}`) : ["  nobody"]));
      if (this.members.length) lines.push(`Next recipient: ${this.members[this.payouts.length]}`);
    }
    lines.push("Payout history:", ...(this.payouts.length ? this.payouts.map((p) => `  Week ${p.week}: ${p.member} received ${formatGhs(p.amount)}`) : ["  none"]));
    return lines.join("\n");
  }
}

module.exports = { SusuGroup, SusuError, parseGhs, formatGhs };
