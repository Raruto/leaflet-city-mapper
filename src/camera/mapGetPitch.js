import { cameraPitchByMap } from '../weakmaps/cameraPitchByMap.js';



export function mapGetPitch(map) { return cameraPitchByMap.get(map) ?? 0; }
