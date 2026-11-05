export async function fetchTrafficLanes(state, time, signal) {
  const href = /* alloc */ new URL(state.url, document.baseURI).href;
  if (/\.m?js(?:[?#]|$)/i.test(state.url)) return (await import(href)).default(time, state.layer, signal);
  if (!state.file) {
    const response = await fetch(href, /* alloc */ { signal });
    if (!response.ok) throw /* alloc */ new Error(`HTTP ${response.status}`);
    state.file = await response.json();
  }
  return state.file;
}
