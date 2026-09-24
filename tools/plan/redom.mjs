// BEZ PLANA: prvo sve što je na redu za ponavljanje, pa nova pitanja redom baze — bez ikakve kvote.
export function planDanas(api) {
  const { ready } = api.queueSplit();
  const nova = api.S ? ctxNova(api) : [];
  return { ids: ready.concat(nova), ocena: 'nema' };
}
function ctxNova(api) { const out = []; for (const q of api.Q) if (!api.S.q[q.id] || !api.S.q[q.id].a) out.push(q.id); return out; }
