export function roofVertexShader(material) {
  const roofOpacity = Number(material.roofTexture ?? 0);
  const wallOpacity = Number(material.wallTexture ?? 0);
  return /* wgsl */ `
        output.roofUv = (frame.roofMatrix * world).xz;
        output.roof = select(0.0, select(${wallOpacity.toFixed(8)}, ${roofOpacity.toFixed(8)}, input.normal.y >= 0.5), ((${Boolean(material.roofTexture)} && input.normal.y >= 0.5) ||
          (${Boolean(material.wallTexture)} && abs(input.normal.y) < 0.5)) && !highlighted);
      `;
}
