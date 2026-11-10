import { openCog } from '../cog/openCog.js';
import { workerCogSource } from '../globals/workerCogSource.js';

export async function onCogMessage({ data }) {
  try {
    const key = JSON.stringify(/* alloc */ [data.url, data.asset]);
    if (!workerCogSource.has(key)) {
      workerCogSource.set(key, openCog(data.url, data.asset));
      if (workerCogSource.size > 4) workerCogSource.delete(workerCogSource.keys().next().value);
    }
    const archive = await workerCogSource.get(key);
    const result = data.z === undefined ? await archive.getHeader() : await archive.getZxy(data.z, data.x, data.y);
    const transfers = /* alloc */ [];
    if (result?.data) transfers.push(result.data);
    if (result?.image) transfers.push(result.image);
    self.postMessage(result, transfers);
  } catch (error) {
    self.postMessage(/* alloc */ { error: /* alloc */ { name: error.name, message: error.message } });
  }
}
