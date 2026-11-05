export async function fetchTrafficLanes(state, time, signal) {
  const href = /* allocation: required -- Resolve this source URL against the current document before asynchronous loading. */ new URL(state.url, document.baseURI).href;
  if (/\.m?js(?:[?#]|$)/i.test(state.url)) return (await import(href)).default(time, state.layer, signal);
  if (!state.file) {
    const response = await fetch(href, /* allocation: required -- Concurrent lane requests retain independent abort signals. */ { signal });
    if (!response.ok) throw /* allocation: required -- Each HTTP failure retains the status and stack of its own request. */ new Error(`HTTP ${response.status}`);
    state.file = await response.json();
  }
  return state.file;
}
