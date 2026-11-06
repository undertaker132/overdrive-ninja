/* ---------------- BALANCE (version 25) ----------------
   An autopilot survey of every stage (three runs each) showed four spikes where the
   stage was much harder than the ones around it. They get one enemy less on the roof
   at a time and 10% more time between spawns. Story runs are not recorded, so no
   replay changes. */
for (const id of ['5-1', '18-3', '20-1', '20-3']) { const s = STAGES.find(q => q.id === id); if (s) { s.max = Math.max(2, (s.max | 0) - 1); s.rate = +(s.rate * 1.1).toFixed(3); } }
