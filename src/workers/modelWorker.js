import { prepareModel } from '../models/prepareModel.js';

export async function onModelMessage({ data }) {
  try {
    const result = await prepareModel(data.url);
    self.postMessage(/* alloc */ { description: result.description, images: result.images }, result.transfers);
  } catch (error) {
    self.postMessage(/* alloc */ { error: /* alloc */ { name: error.name, message: error.message } });
  }
}
