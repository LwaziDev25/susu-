// Interactive CLI: node cli.js
const readline = require("node:readline");
const { SusuGroup, SusuError, formatGhs } = require("./susu");

let g = null;
const help = `Commands:
  create <weeklyAmount>          
  add <name>
  pay <name> <week> <amount>     
  close
  report
  help | quit`;

const rl = readline.createInterface({ input: process.stdin, output: process.stdout, prompt: "susu> " });
console.log(help);
rl.prompt();
rl.on("line", (line) => {
  const [cmd, ...a] = line.trim().split(/\s+/);
  try {
    if (!cmd) {}
    else if (cmd === "quit") return rl.close();
    else if (cmd === "help") console.log(help);
    else if (cmd === "create") { g = new SusuGroup(a[0]); console.log(`Group created: ${formatGhs(g.weekly)} GHS/week`); }
    else {
      if (!g) throw new SusuError("Create a group first");
      if (cmd === "add") { g.addMember(a.join(" ")); console.log(`Added ${a.join(" ")}`); }
      else if (cmd === "pay") { g.contribute(a[0], Number(a[1]), a[2]); console.log(`Recorded. ${a[0]} owes ${formatGhs(g.owes(a[0]))}`); }
      else if (cmd === "close") {
        const r = g.closeWeek();
        if (r.paidOut) console.log(`Week ${r.paidOut.week} closed: ${r.paidOut.member} receives ${formatGhs(r.paidOut.amount)}`);
        else console.log("Not closed. " + r.owing.map((o) => `${o.member} owes ${formatGhs(o.amount)}`).join("; "));
      } else if (cmd === "report") console.log(g.report());
      else console.log("Unknown command. Type help.");
    }
  } catch (e) {
    console.log(e instanceof SusuError ? `Error: ${e.message}` : e);
  }
  rl.prompt();
});
