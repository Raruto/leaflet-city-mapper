const n=({properties:e})=>{const t=document.createElement("div");return t.style.whiteSpace="pre-line",t.textContent=[e.name,e.departure&&`Departure ${e.departure} ${e.timetable.timeZone}`,e.description].filter(Boolean).join(`
`),t};export{n as tooltip};
//# sourceMappingURL=tooltip.js.map
