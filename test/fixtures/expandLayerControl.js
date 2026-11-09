export async function expandLayerControl(page) {
  await page.locator('.leaflet-control-layers').hover();
  await page.waitForFunction(() => !layers._preventClick);
}
