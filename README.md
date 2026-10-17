# Susu manager

Run: `npm start` (or `node cli.js`) · Tests: `npm test` — requires Node.js 18+, no dependencies

## Assumptions
- Money is stored as integer pesewas; amounts accept at most 2 decimals.
- Member names are unique case-insensitively ("Ama" = "ama").
- Members can only be added before the first contribution or payout (membership locks once week 1 starts).
- Contributions are only accepted for the current open week; past/future weeks are rejected.
- Pot = weekly amount × number of members.
- After every member has received the pot once, the cycle is complete and further contributions/closes are rejected.
- State is in memory only (one group per CLI session).
