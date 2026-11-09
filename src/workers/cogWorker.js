import { openCog } from '../cog/openCog.js';
import { workerCogSource } from '../globals/workerCogSource.js';

export async function onCogMessage({ data }) {
  try {
    const key = JSON.stringify(/* alloc */ [data.url, data.asset]);
    // ponytail: one cached COG per worker; use a bounded per-source cache if interleaved archives cause churn.
    if (workerCogSource.key !== key) {
      workerCogSource.key = key;
      workerCogSource.archive = openCog(data.url, data.asset);
    }
    const archive = await workerCogSource.archive;
    const result = data.z === undefined ? await archive.getHeader() : await archive.getZxy(data.z, data.x, data.y);
    const transfers = /* alloc */ [];
    if (result?.data) transfers.push(result.data);
    if (result?.image) transfers.push(result.image);
    self.postMessage(result, transfers);
  } catch (error) {
    self.postMessage(/* alloc */ { error: /* alloc */ { name: error.name, message: error.message } });
  }
}
