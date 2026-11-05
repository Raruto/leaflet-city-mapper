import { cameraByMap } from '../globals/cameraByMap.js';


export function mapGetPitch(map) { return cameraByMap.get(map)?._cameraPitch ?? 0; }
