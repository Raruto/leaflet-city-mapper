export function showWebGPUWarning(map) {
  const container = map.getContainer();
  if (container.querySelector('.leaflet-webgpu-warning')) return;
  const warning = document.createElement('div');
  warning.className = 'leaflet-webgpu-warning';
  warning.setAttribute('role', 'alert');
  warning.style.cssText = 'position:absolute;z-index:1000;top:50%;left:50%;transform:translate(-50%,-50%);max-width:calc(100% - 32px);box-sizing:border-box;padding:12px 16px;border:1px solid #c98b24;border-radius:6px;background:#fff8e6;box-shadow:0 3px 12px #0005;color:#30251d;font:14px/1.5 sans-serif;text-align:center;pointer-events:auto';
  warning.append('WebGPU is not available in this browser or device. ');
  const link = document.createElement('a');
  link.href = 'https://developer.mozilla.org/en-US/docs/Web/API/WebGPU_API#browser_compatibility';
  link.target = '_blank';
  link.rel = 'noopener noreferrer';
  link.textContent = 'Learn more';
  warning.append(link);
  container.append(warning);
}
