import { L } from '../globals/L.js';
import { updateSky } from './updateSky.js';
import { updateSun } from './updateSun.js';
import { useLiveTime } from './useLiveTime.js';
import { useSelectedTime } from './useSelectedTime.js';

/**
 * Create the time-control UI, celestial discs and bound update handlers.
 *
 * @param {L.Map} map Map associated with the control.
 *
 * @returns {Object} Sunlight and control state.
 */
export function createSun(map) {
  const disc = 'position:absolute;width:18px;height:18px;border-radius:50%;transform:translate(-50%,-50%);pointer-events:none;';
  const sunDisc = L.DomUtil.create('div', 'sunlight-sun');
  const moonDisc = L.DomUtil.create('div', 'sunlight-moon');
  sunDisc.style.cssText = disc + 'background:#fff3bd;box-shadow:0 0 18px 7px #ffd27699;';
  moonDisc.style.cssText = disc + 'background:#dce5f2;box-shadow:0 0 10px 2px #cbdcff55;';
  sunDisc.setAttribute('role', 'img'); sunDisc.setAttribute('aria-label', 'Sun');
  moonDisc.setAttribute('role', 'img'); moonDisc.setAttribute('aria-label', 'Moon');
  const container = L.DomUtil.create('div', 'sunlight-control');
  container.style.cssText = 'color:#222;width:min(200px,calc(100vw - 60px));font:12px/1.4 sans-serif;';
  const date = document.createElement('input');
  date.type = 'date';
  date.style.cssText = 'width:100%;box-sizing:border-box;';
  date.setAttribute('aria-label', 'Solar date (UTC)');
  const slider = document.createElement('input');
  slider.type = 'range';
  slider.style.cssText = 'width:100%;box-sizing:border-box;margin:10px 0 4px;cursor:pointer;';
  slider.min = '0'; slider.max = '1439'; slider.step = '1';
  slider.setAttribute('aria-label', 'Time of day (UTC)');
  const output = document.createElement('output');
  output.style.cssText = 'font-weight:bold;font-variant-numeric:tabular-nums;';
  output.setAttribute('aria-live', 'off');
  const now = document.createElement('button');
  now.type = 'button'; now.textContent = 'Now';
  const timeRow = document.createElement('div');
  timeRow.className = 'sunlight-time';
  timeRow.style.cssText = 'display:flex;justify-content:space-between;align-items:center;';
  timeRow.append(output, now);
  const status = document.createElement('div');
  status.className = 'sunlight-status';
  status.style.marginTop = '5px';
  status.setAttribute('role', 'status');
  const note = document.createElement('small');
  note.style.color = '#555';
  container.append(date, slider, timeRow, status, note);
  const state = /* alloc */ {
    control: null, map, originalSky: '', container, sunDisc, moonDisc, date, slider, output, status,
    projection: /* alloc */ { left: 0, top: 0 },
  };
  state.update = updateSun.bind(null, state);
  state.updateSky = updateSky.bind(null, state);
  now.onclick = useLiveTime.bind(null, state);
  date.onchange = slider.oninput = useSelectedTime.bind(null, state);
  L.DomEvent.disableClickPropagation(container);
  L.DomEvent.disableScrollPropagation(container);
  return state;
}
