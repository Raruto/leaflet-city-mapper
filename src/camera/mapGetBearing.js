import { cameraBearingByMap } from '../weakmaps/cameraBearingByMap.js';



export function mapGetBearing(map) { return cameraBearingByMap.get(map) ?? 0; }
