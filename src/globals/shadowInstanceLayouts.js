import { positionLayout as sharedPositionLayout } from './positionLayout.js';
import { instanceLayout as sharedInstanceLayout } from './instanceLayout.js';

/**
 * Vertex buffer layouts for instanced shadow meshes.
 *
 * @type {Array<Object>}
 */
export const shadowInstanceLayouts = [sharedPositionLayout, sharedInstanceLayout];
