import { cameraByMap } from '../globals/cameraByMap.js';


export function mapGetBearing(map) { return cameraByMap.get(map)?._cameraBearing ?? 0; }
