(() => {
  var __defProp = Object.defineProperty;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __esm = (fn, res, err) => function __init() {
    if (err) throw err[0];
    try {
      return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
    } catch (e) {
      throw err = [e], e;
    }
  };
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };

  // src/globals/L.js
  var L;
  var init_L = __esm({
    "src/globals/L.js"() {
      L = globalThis.L;
    }
  });

  // src/globals/radians.js
  var radians;
  var init_radians = __esm({
    "src/globals/radians.js"() {
      radians = Math.PI / 180;
    }
  });

  // src/globals/degrees.js
  var degrees;
  var init_degrees = __esm({
    "src/globals/degrees.js"() {
      degrees = 180 / Math.PI;
    }
  });

  // src/weakmaps/cameraPitchByMap.js
  var cameraPitchByMap;
  var init_cameraPitchByMap = __esm({
    "src/weakmaps/cameraPitchByMap.js"() {
      cameraPitchByMap = /* @__PURE__ */ new WeakMap();
    }
  });

  // src/camera/mapGetPitch.js
  function mapGetPitch(map) {
    return cameraPitchByMap.get(map) ?? 0;
  }
  var init_mapGetPitch = __esm({
    "src/camera/mapGetPitch.js"() {
      init_cameraPitchByMap();
    }
  });

  // src/weakmaps/cameraBearingByMap.js
  var cameraBearingByMap;
  var init_cameraBearingByMap = __esm({
    "src/weakmaps/cameraBearingByMap.js"() {
      cameraBearingByMap = /* @__PURE__ */ new WeakMap();
    }
  });

  // src/camera/mapGetBearing.js
  function mapGetBearing(map) {
    return cameraBearingByMap.get(map) ?? 0;
  }
  var init_mapGetBearing = __esm({
    "src/camera/mapGetBearing.js"() {
      init_cameraBearingByMap();
    }
  });

  // src/globals/cameraEmptyOptions.js
  var cameraEmptyOptions;
  var init_cameraEmptyOptions = __esm({
    "src/globals/cameraEmptyOptions.js"() {
      cameraEmptyOptions = Object.freeze({});
    }
  });

  // src/weakmaps/pitchSkyByMap.js
  var pitchSkyByMap;
  var init_pitchSkyByMap = __esm({
    "src/weakmaps/pitchSkyByMap.js"() {
      pitchSkyByMap = /* @__PURE__ */ new WeakMap();
    }
  });

  // src/camera/updateSky.js
  function updateSky() {
    const height = this.getSize().y, pitch = mapGetPitch(this) * radians;
    const far = height * this.options.pitchMaxDistance, distance = height * 1.5;
    const top = height / 2 - far * Math.abs(Math.cos(pitch)) * distance / (distance + Math.sin(pitch) * far);
    if (top > 0 && !pitchSkyByMap.get(this)) {
      pitchSkyByMap.set(this, L.DomUtil.create("div", "leaflet-pitch-sky", this.getContainer()));
      pitchSkyByMap.get(this).setAttribute("aria-hidden", "true");
      pitchSkyByMap.get(this).style.cssText = "position:absolute;inset:0 0 auto;height:0;z-index:0;pointer-events:none;background:var(--leaflet-sky-background,linear-gradient(#9ec5e8,#dfe9f0))";
    }
    if (pitchSkyByMap.get(this)) {
      pitchSkyByMap.get(this).style.inset = pitch > Math.PI / 2 ? "auto 0 0" : "0 0 auto";
      pitchSkyByMap.get(this).style.height = `${Math.max(0, Math.ceil(top))}px`;
      pitchSkyByMap.get(this).style.display = top > 0 ? "" : "none";
    }
  }
  var init_updateSky = __esm({
    "src/camera/updateSky.js"() {
      init_pitchSkyByMap();
      init_L();
      init_radians();
      init_mapGetPitch();
    }
  });

  // src/camera/mapSetPitchAndBearing.js
  function mapSetPitchAndBearing(map, pitch, bearing) {
    if (!Number.isFinite(pitch) || !Number.isFinite(bearing)) throw (
      /* alloc */
      new TypeError("Camera angles must be finite numbers")
    );
    if (!Number.isFinite(map.options.maxPitch) || map.options.maxPitch < 0 || map.options.maxPitch > 180) {
      throw (
        /* alloc */
        new TypeError("maxPitch must be between 0 and 180 degrees")
      );
    }
    const previousPitch = mapGetPitch(map), previousBearing = mapGetBearing(map);
    cameraPitchByMap.set(map, Math.max(0, Math.min(map.options.maxPitch, pitch)));
    cameraBearingByMap.set(map, (bearing % 360 + 360) % 360);
    if (map._loaded) {
      updateSky.call(map);
      if (previousBearing !== mapGetBearing(map)) map.fire(
        "rotate",
        /* alloc */
        { bearing: mapGetBearing(map) }
      );
      if (previousPitch !== mapGetPitch(map)) map.fire(
        "pitch",
        /* alloc */
        { pitch: mapGetPitch(map) }
      );
    }
    return map;
  }
  var init_mapSetPitchAndBearing = __esm({
    "src/camera/mapSetPitchAndBearing.js"() {
      init_cameraBearingByMap();
      init_cameraPitchByMap();
      init_mapGetPitch();
      init_mapGetBearing();
      init_updateSky();
    }
  });

  // src/weakmaps/cameraAnimationByMap.js
  var cameraAnimationByMap;
  var init_cameraAnimationByMap = __esm({
    "src/weakmaps/cameraAnimationByMap.js"() {
      cameraAnimationByMap = /* @__PURE__ */ new WeakMap();
    }
  });

  // src/weakmaps/cameraFrameByMap.js
  var cameraFrameByMap;
  var init_cameraFrameByMap = __esm({
    "src/weakmaps/cameraFrameByMap.js"() {
      cameraFrameByMap = /* @__PURE__ */ new WeakMap();
    }
  });

  // src/globals/cameraAnimations.js
  var cameraAnimations;
  var init_cameraAnimations = __esm({
    "src/globals/cameraAnimations.js"() {
      cameraAnimations = /* @__PURE__ */ new Map();
    }
  });

  // src/globals/cameraAnimationFrame.js
  var cameraAnimationFrame;
  var init_cameraAnimationFrame = __esm({
    "src/globals/cameraAnimationFrame.js"() {
      cameraAnimationFrame = { value: null };
    }
  });

  // src/animations/cancelCameraAnimation.js
  function cancelCameraAnimation(map) {
    cameraAnimations.delete(map);
    cameraAnimationByMap.set(map, null);
    cameraFrameByMap.set(map, null);
    if (!cameraAnimations.size && cameraAnimationFrame.value !== null) {
      cancelAnimationFrame(cameraAnimationFrame.value);
      cameraAnimationFrame.value = null;
    }
  }
  var init_cancelCameraAnimation = __esm({
    "src/animations/cancelCameraAnimation.js"() {
      init_cameraAnimationByMap();
      init_cameraFrameByMap();
      init_cameraAnimations();
      init_cameraAnimationFrame();
    }
  });

  // src/weakmaps/cameraTouchStateByMap.js
  var cameraTouchStateByMap;
  var init_cameraTouchStateByMap = __esm({
    "src/weakmaps/cameraTouchStateByMap.js"() {
      cameraTouchStateByMap = /* @__PURE__ */ new WeakMap();
    }
  });

  // src/weakmaps/cameraHandlersByMap.js
  var cameraHandlersByMap;
  var init_cameraHandlersByMap = __esm({
    "src/weakmaps/cameraHandlersByMap.js"() {
      cameraHandlersByMap = /* @__PURE__ */ new WeakMap();
    }
  });

  // src/weakmaps/rotateControlByMap.js
  var rotateControlByMap;
  var init_rotateControlByMap = __esm({
    "src/weakmaps/rotateControlByMap.js"() {
      rotateControlByMap = /* @__PURE__ */ new WeakMap();
    }
  });

  // src/weakmaps/touchPitchByMap.js
  var touchPitchByMap;
  var init_touchPitchByMap = __esm({
    "src/weakmaps/touchPitchByMap.js"() {
      touchPitchByMap = /* @__PURE__ */ new WeakMap();
    }
  });

  // src/weakmaps/touchRotateByMap.js
  var touchRotateByMap;
  var init_touchRotateByMap = __esm({
    "src/weakmaps/touchRotateByMap.js"() {
      touchRotateByMap = /* @__PURE__ */ new WeakMap();
    }
  });

  // src/globals/Compass.js
  var Compass;
  var init_Compass = __esm({
    "src/globals/Compass.js"() {
      Compass = { value: void 0 };
    }
  });

  // src/globals/ContainerResize.js
  var ContainerResize;
  var init_ContainerResize = __esm({
    "src/globals/ContainerResize.js"() {
      ContainerResize = { value: void 0 };
    }
  });

  // src/globals/PitchDrag.js
  var PitchDrag;
  var init_PitchDrag = __esm({
    "src/globals/PitchDrag.js"() {
      PitchDrag = { value: void 0 };
    }
  });

  // src/globals/ShiftRotate.js
  var ShiftRotate;
  var init_ShiftRotate = __esm({
    "src/globals/ShiftRotate.js"() {
      ShiftRotate = { value: void 0 };
    }
  });

  // src/globals/TouchMode.js
  var TouchMode;
  var init_TouchMode = __esm({
    "src/globals/TouchMode.js"() {
      TouchMode = { value: void 0 };
    }
  });

  // src/weakmaps/touchByContainer.js
  var touchByContainer;
  var init_touchByContainer = __esm({
    "src/weakmaps/touchByContainer.js"() {
      touchByContainer = /* @__PURE__ */ new WeakMap();
    }
  });

  // src/globals/cameraTouchStates.js
  var cameraTouchStates;
  var init_cameraTouchStates = __esm({
    "src/globals/cameraTouchStates.js"() {
      cameraTouchStates = /* @__PURE__ */ new Set();
    }
  });

  // src/globals/cameraListenerOptions.js
  var cameraListenerOptions;
  var init_cameraListenerOptions = __esm({
    "src/globals/cameraListenerOptions.js"() {
      cameraListenerOptions = Object.freeze({
        capture: true,
        passive: false
      });
    }
  });

  // src/controls/notifyCameraTouchChange.js
  function notifyCameraTouchChange() {
    this._map.fire("cameratouchchange");
  }
  var init_notifyCameraTouchChange = __esm({
    "src/controls/notifyCameraTouchChange.js"() {
    }
  });

  // src/globals/cameraDragSensitivity.js
  var cameraDragSensitivity;
  var init_cameraDragSensitivity = __esm({
    "src/globals/cameraDragSensitivity.js"() {
      cameraDragSensitivity = Object.freeze([0.8, 0.5]);
    }
  });

  // src/globals/cameraBearingSensitivity.js
  var cameraBearingSensitivity;
  var init_cameraBearingSensitivity = __esm({
    "src/globals/cameraBearingSensitivity.js"() {
      cameraBearingSensitivity = Object.freeze([0.8, 0]);
    }
  });

  // src/globals/cameraFocusOptions.js
  var cameraFocusOptions;
  var init_cameraFocusOptions = __esm({
    "src/globals/cameraFocusOptions.js"() {
      cameraFocusOptions = Object.freeze({
        preventScroll: true
      });
    }
  });

  // src/globals/cameraAnimatedOptions.js
  var cameraAnimatedOptions;
  var init_cameraAnimatedOptions = __esm({
    "src/globals/cameraAnimatedOptions.js"() {
      cameraAnimatedOptions = Object.freeze({
        animate: true
      });
    }
  });

  // src/animations/runCameraAnimations.js
  function runCameraAnimations(now) {
    cameraAnimationFrame.value = null;
    const pending = (
      /* alloc */
      [...cameraAnimations]
    );
    cameraAnimations.clear();
    let failure;
    let map, animation, progress, eased;
    for ([map, animation] of pending) {
      cameraFrameByMap.set(map, null);
      if (cameraAnimationByMap.get(map) !== animation) continue;
      progress = animation.duration ? Math.min(1, (now - animation.start) / (animation.duration * 1e3)) : 1;
      eased = 1 - (1 - progress) ** 3;
      try {
        mapSetPitchAndBearing(map, animation.fromPitch + (Math.max(0, Math.min(map.options.maxPitch, animation.pitch)) - animation.fromPitch) * eased, animation.fromBearing + animation.delta * eased);
        if (progress < 1 && cameraAnimationByMap.get(map) === animation) scheduleCameraAnimation(map, animation);
        else if (cameraAnimationByMap.get(map) === animation) cameraAnimationByMap.set(map, null);
      } catch (error) {
        failure ||= error;
      }
    }
    if (failure) throw failure;
  }
  var init_runCameraAnimations = __esm({
    "src/animations/runCameraAnimations.js"() {
      init_cameraAnimationByMap();
      init_cameraFrameByMap();
      init_cameraAnimationFrame();
      init_cameraAnimations();
      init_mapSetPitchAndBearing();
      init_scheduleCameraAnimation();
    }
  });

  // src/animations/scheduleCameraAnimation.js
  function scheduleCameraAnimation(map, animation) {
    cameraAnimations.set(map, animation);
    if (cameraAnimationFrame.value === null) cameraAnimationFrame.value = requestAnimationFrame(runCameraAnimations);
    cameraFrameByMap.set(map, cameraAnimationFrame.value);
  }
  var init_scheduleCameraAnimation = __esm({
    "src/animations/scheduleCameraAnimation.js"() {
      init_cameraFrameByMap();
      init_cameraAnimations();
      init_cameraAnimationFrame();
      init_runCameraAnimations();
    }
  });

  // src/animations/mapAnimateCamera.js
  function mapAnimateCamera(map, pitch, bearing, options = cameraEmptyOptions) {
    cancelCameraAnimation(map);
    if (!Number.isFinite(pitch) || !Number.isFinite(bearing)) throw (
      /* alloc */
      new TypeError("Camera angles must be finite numbers")
    );
    if (!options.animate || matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return mapSetPitchAndBearing(map, pitch, bearing);
    }
    const duration = options.duration ?? 0.3;
    if (!Number.isFinite(duration) || duration < 0) throw (
      /* alloc */
      new TypeError("Camera duration must be nonnegative")
    );
    const start2 = performance.now(), fromPitch = mapGetPitch(map), fromBearing = mapGetBearing(map);
    const delta = ((bearing - fromBearing) % 360 + 540) % 360 - 180;
    const animation = (
      /* alloc */
      { duration, start: start2, fromPitch, fromBearing, pitch, delta }
    );
    cameraAnimationByMap.set(map, animation);
    scheduleCameraAnimation(map, animation);
    return map;
  }
  var init_mapAnimateCamera = __esm({
    "src/animations/mapAnimateCamera.js"() {
      init_cameraAnimationByMap();
      init_cameraEmptyOptions();
      init_mapSetPitchAndBearing();
      init_mapGetPitch();
      init_mapGetBearing();
      init_cancelCameraAnimation();
      init_scheduleCameraAnimation();
    }
  });

  // src/camera/mapResetNorthPitch.js
  function mapResetNorthPitch(map, options = cameraAnimatedOptions) {
    return mapAnimateCamera(map, 0, 0, options);
  }
  var init_mapResetNorthPitch = __esm({
    "src/camera/mapResetNorthPitch.js"() {
      init_cameraAnimatedOptions();
      init_mapAnimateCamera();
    }
  });

  // src/camera/mapSetBearing.js
  function mapSetBearing(map, bearing, options) {
    return mapAnimateCamera(map, mapGetPitch(map), bearing, options);
  }
  var init_mapSetBearing = __esm({
    "src/camera/mapSetBearing.js"() {
      init_mapAnimateCamera();
      init_mapGetPitch();
    }
  });

  // src/camera/mapResetNorth.js
  function mapResetNorth(map, options = cameraAnimatedOptions) {
    return mapSetBearing(map, 0, options);
  }
  var init_mapResetNorth = __esm({
    "src/camera/mapResetNorth.js"() {
      init_cameraAnimatedOptions();
      init_mapSetBearing();
    }
  });

  // src/controls/rotateButtonClick.js
  function rotateButtonClick(event) {
    const control = this._rotateControl, map = control._map;
    event.preventDefault();
    if (control.options.visualizePitch) mapResetNorthPitch(map);
    else mapResetNorth(map);
    if (event.detail) map.getContainer().focus(cameraFocusOptions);
  }
  var init_rotateButtonClick = __esm({
    "src/controls/rotateButtonClick.js"() {
      init_cameraFocusOptions();
      init_mapResetNorthPitch();
      init_mapResetNorth();
    }
  });

  // src/camera/mapSetPitch.js
  function mapSetPitch(map, pitch, options) {
    return mapAnimateCamera(map, pitch, mapGetBearing(map), options);
  }
  var init_mapSetPitch = __esm({
    "src/camera/mapSetPitch.js"() {
      init_mapAnimateCamera();
      init_mapGetBearing();
    }
  });

  // src/controls/rotateButtonKeydown.js
  function rotateButtonKeydown(event) {
    const control = this._rotateControl, map = control._map, step2 = event.shiftKey ? 15 : 5;
    if (event.key === "ArrowLeft") mapSetBearing(map, mapGetBearing(map) - step2);
    else if (event.key === "ArrowRight") mapSetBearing(map, mapGetBearing(map) + step2);
    else if (event.key === "ArrowUp" && control.options.visualizePitch) mapSetPitch(map, mapGetPitch(map) + step2);
    else if (event.key === "ArrowDown" && control.options.visualizePitch) mapSetPitch(map, mapGetPitch(map) - step2);
    else if (event.key === "Home" || event.key === " ") this.click();
    else return;
    event.preventDefault();
    event.stopPropagation();
  }
  var init_rotateButtonKeydown = __esm({
    "src/controls/rotateButtonKeydown.js"() {
      init_mapSetBearing();
      init_mapGetBearing();
      init_mapSetPitch();
      init_mapGetPitch();
    }
  });

  // src/controls/refreshRotateControl.js
  function refreshRotateControl() {
    const map = this._map, pitch = this.options.visualizePitch ? mapGetPitch(map) : 0;
    this._arrow.style.transform = `scale(${1 / Math.sqrt(Math.max(0.01, Math.abs(Math.cos(pitch * radians))))}) rotateX(${pitch}deg) rotate(${mapGetBearing(map)}deg)`;
    this._button.setAttribute("aria-description", `Bearing ${Math.round(mapGetBearing(map))} degrees, pitch ${Math.round(mapGetPitch(map))} degrees. Arrow keys adjust the camera; Home resets it.`);
    this._container.style.display = this.options.closeOnZeroBearing && !mapGetBearing(map) && !pitch && !this._container.contains(document.activeElement) ? "none" : "";
  }
  var init_refreshRotateControl = __esm({
    "src/controls/refreshRotateControl.js"() {
      init_radians();
      init_mapGetPitch();
      init_mapGetBearing();
    }
  });

  // src/weakmaps/dragStates.js
  var dragStates;
  var init_dragStates = __esm({
    "src/weakmaps/dragStates.js"() {
      dragStates = { value: /* @__PURE__ */ new WeakMap() };
    }
  });

  // src/globals/cameraDrags.js
  var cameraDrags;
  var init_cameraDrags = __esm({
    "src/globals/cameraDrags.js"() {
      cameraDrags = { value: /* @__PURE__ */ new Set() };
    }
  });

  // src/controls/isEditableTarget.js
  function editable(target) {
    return target.closest?.('input,textarea,select,[contenteditable="true"]');
  }
  var init_isEditableTarget = __esm({
    "src/controls/isEditableTarget.js"() {
    }
  });

  // src/controls/cameraDragDown.js
  function cameraDragDown(event) {
    const state = dragStates.value.get(this);
    if (state.drag || !state.accept(event) || editable(event.target)) return;
    event.preventDefault();
    event.stopPropagation();
    state.moved = false;
    const rect = state.map.getContainer().getBoundingClientRect();
    state.drag = /* alloc */
    {
      id: event.pointerId,
      x: event.clientX,
      y: event.clientY,
      cursor: state.element.style.cursor,
      cx: rect.left + rect.width / 2,
      cy: rect.top + rect.height / 2,
      dragging: state.map.dragging?.enabled()
    };
    state.map.dragging?.disable();
    state.element.focus?.(cameraFocusOptions);
    state.element.setPointerCapture(event.pointerId);
    state.element.style.cursor = "grabbing";
  }
  var init_cameraDragDown = __esm({
    "src/controls/cameraDragDown.js"() {
      init_dragStates();
      init_cameraFocusOptions();
      init_isEditableTarget();
    }
  });

  // src/animations/mapStopPitchBearingAnimation.js
  function mapStopPitchBearingAnimation(map) {
    cancelCameraAnimation(map);
    return map;
  }
  var init_mapStopPitchBearingAnimation = __esm({
    "src/animations/mapStopPitchBearingAnimation.js"() {
      init_cancelCameraAnimation();
    }
  });

  // src/controls/cameraDragMove.js
  function cameraDragMove(event) {
    const state = dragStates.value.get(this);
    if (!state.drag || state.drag.id !== event.pointerId) return;
    const x = event.clientX - state.drag.x, y = event.clientY - state.drag.y;
    if (Math.hypot(x, y) < 3 && !state.moved) return;
    mapStopPitchBearingAnimation(state.map);
    state.moved = true;
    event.preventDefault();
    let bearing = x * state.sensitivity[0];
    if (state.orbit) {
      if (Math.abs(state.drag.cy - state.drag.y) > 100) {
        const angle = Math.atan2(event.clientY - state.drag.cy, event.clientX - state.drag.cx) - Math.atan2(event.clientY - state.drag.cy, state.drag.x - state.drag.cx);
        bearing = Math.atan2(Math.sin(angle), Math.cos(angle)) * degrees;
      } else bearing *= event.clientY < state.drag.cy ? 1 : -1;
    }
    mapSetPitchAndBearing(state.map, mapGetPitch(state.map) - y * state.sensitivity[1], mapGetBearing(state.map) + bearing);
    state.drag.x = event.clientX;
    state.drag.y = event.clientY;
  }
  var init_cameraDragMove = __esm({
    "src/controls/cameraDragMove.js"() {
      init_degrees();
      init_dragStates();
      init_mapStopPitchBearingAnimation();
      init_mapSetPitchAndBearing();
      init_mapGetPitch();
      init_mapGetBearing();
    }
  });

  // src/controls/finishCameraDrag.js
  function finishCameraDrag(state, event) {
    if (!state?.drag) return;
    if (event?.pointerId !== void 0 && event.pointerId !== state.drag.id) return;
    const finished = state.drag;
    state.drag = null;
    if (state.element.hasPointerCapture?.(finished.id)) state.element.releasePointerCapture(finished.id);
    if (finished.dragging && state.map.getContainer()._leaflet_id) state.map.dragging.enable();
    state.element.style.cursor = finished.cursor;
  }
  var init_finishCameraDrag = __esm({
    "src/controls/finishCameraDrag.js"() {
    }
  });

  // src/controls/cameraDragEnd.js
  function cameraDragEnd(event) {
    finishCameraDrag(dragStates.value.get(this), event);
  }
  var init_cameraDragEnd = __esm({
    "src/controls/cameraDragEnd.js"() {
      init_dragStates();
      init_finishCameraDrag();
    }
  });

  // src/controls/cameraDragClick.js
  function cameraDragClick(event) {
    const state = dragStates.value.get(this);
    if (!state.moved) return;
    event.preventDefault();
    event.stopPropagation();
    state.moved = false;
  }
  var init_cameraDragClick = __esm({
    "src/controls/cameraDragClick.js"() {
      init_dragStates();
    }
  });

  // src/controls/cameraDragContextMenu.js
  function cameraDragContextMenu(event) {
    const state = dragStates.value.get(this);
    if (!state.drag && !state.moved) return;
    event.preventDefault();
    event.stopPropagation();
  }
  var init_cameraDragContextMenu = __esm({
    "src/controls/cameraDragContextMenu.js"() {
      init_dragStates();
    }
  });

  // src/controls/endAllCameraDrags.js
  function endAllCameraDrags() {
    let state;
    for (state of cameraDrags.value) finishCameraDrag(state);
  }
  var init_endAllCameraDrags = __esm({
    "src/controls/endAllCameraDrags.js"() {
      init_cameraDrags();
      init_finishCameraDrag();
    }
  });

  // src/controls/dragCamera.js
  function dragCamera(map, element, accept, sensitivity = cameraDragSensitivity, orbit = false) {
    const state = (
      /* alloc */
      { map, element, accept, sensitivity, orbit, drag: null, moved: false }
    );
    dragStates.value.set(element, state);
    cameraDrags.value.add(state);
    element.addEventListener("pointerdown", cameraDragDown, true);
    element.addEventListener("pointermove", cameraDragMove);
    element.addEventListener("pointerup", cameraDragEnd);
    element.addEventListener("pointercancel", cameraDragEnd);
    element.addEventListener("lostpointercapture", cameraDragEnd);
    element.addEventListener("click", cameraDragClick, true);
    element.addEventListener("contextmenu", cameraDragContextMenu);
    window.addEventListener("blur", endAllCameraDrags);
    return state;
  }
  var init_dragCamera = __esm({
    "src/controls/dragCamera.js"() {
      init_cameraDragSensitivity();
      init_dragStates();
      init_cameraDrags();
      init_cameraDragDown();
      init_cameraDragMove();
      init_cameraDragEnd();
      init_cameraDragClick();
      init_cameraDragContextMenu();
      init_endAllCameraDrags();
    }
  });

  // src/controls/acceptRotateDrag.js
  function acceptRotateDrag(event) {
    return event.button === 0;
  }
  var init_acceptRotateDrag = __esm({
    "src/controls/acceptRotateDrag.js"() {
    }
  });

  // src/controls/refreshRotateFocus.js
  function refreshRotateFocus() {
    refreshRotateControl.call(this._rotateControl);
  }
  var init_refreshRotateFocus = __esm({
    "src/controls/refreshRotateFocus.js"() {
      init_refreshRotateControl();
    }
  });

  // src/controls/rotateOnAdd.js
  function rotateOnAdd(map) {
    const container = L.DomUtil.create("div", "leaflet-control-rotate leaflet-bar");
    const button = L.DomUtil.create("a", "leaflet-control-rotate-toggle", container);
    this._map = map;
    this._container = container;
    this._button = button;
    button._rotateControl = this;
    button.href = "#";
    button.draggable = false;
    button.setAttribute("role", "button");
    button.title = this.options.visualizePitch ? "Reset bearing and pitch" : "Reset bearing to north";
    button.setAttribute("aria-label", button.title);
    button.style.cssText = "cursor:grab;touch-action:none";
    const arrow = L.DomUtil.create("span", "leaflet-control-rotate-arrow", button);
    this._arrow = arrow;
    arrow.setAttribute("aria-hidden", "true");
    arrow.style.cssText = "display:block;width:100%;height:100%;pointer-events:none;background: no-repeat center / 29px 29px";
    arrow.style.backgroundImage = 'url("data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 viewBox=%270 0 29 29%27%3E%3Cpath fill=%27%23333%27 d=%27M10.5 14 14.5 6 18.5 14Z%27/%3E%3Cpath fill=%27%23ccc%27 d=%27M10.5 16 14.5 24 18.5 16Z%27/%3E%3C/svg%3E")';
    button.onclick = rotateButtonClick;
    button.onkeydown = rotateButtonKeydown;
    this._refresh = refreshRotateControl;
    map.on("rotate pitch", this._refresh, this);
    this._refresh();
    this._dragState = dragCamera(
      map,
      button,
      acceptRotateDrag,
      this.options.visualizePitch ? cameraDragSensitivity : cameraBearingSensitivity
    );
    button.addEventListener("focusout", refreshRotateFocus);
    L.DomEvent.on(button, "dblclick contextmenu", L.DomEvent.stop);
    L.DomEvent.disableClickPropagation(container);
    L.DomEvent.disableScrollPropagation(container);
    return container;
  }
  var init_rotateOnAdd = __esm({
    "src/controls/rotateOnAdd.js"() {
      init_L();
      init_cameraDragSensitivity();
      init_cameraBearingSensitivity();
      init_rotateButtonClick();
      init_rotateButtonKeydown();
      init_refreshRotateControl();
      init_dragCamera();
      init_acceptRotateDrag();
      init_refreshRotateFocus();
    }
  });

  // src/controls/removeCameraDrag.js
  function removeCameraDrag(state) {
    finishCameraDrag(state);
    const { element } = state;
    element.removeEventListener("pointerdown", cameraDragDown, true);
    element.removeEventListener("pointermove", cameraDragMove);
    element.removeEventListener("pointerup", cameraDragEnd);
    element.removeEventListener("pointercancel", cameraDragEnd);
    element.removeEventListener("lostpointercapture", cameraDragEnd);
    element.removeEventListener("click", cameraDragClick, true);
    element.removeEventListener("contextmenu", cameraDragContextMenu);
    dragStates.value.delete(element);
    cameraDrags.value.delete(state);
    if (!cameraDrags.value.size) window.removeEventListener("blur", endAllCameraDrags);
  }
  var init_removeCameraDrag = __esm({
    "src/controls/removeCameraDrag.js"() {
      init_dragStates();
      init_cameraDrags();
      init_finishCameraDrag();
      init_cameraDragDown();
      init_cameraDragMove();
      init_cameraDragEnd();
      init_cameraDragClick();
      init_cameraDragContextMenu();
      init_endAllCameraDrags();
    }
  });

  // src/controls/pitchDragRemoveHooks.js
  function pitchDragRemoveHooks() {
    removeCameraDrag(this._dragState);
  }
  var init_pitchDragRemoveHooks = __esm({
    "src/controls/pitchDragRemoveHooks.js"() {
      init_removeCameraDrag();
    }
  });

  // src/controls/rotateOnRemove.js
  function rotateOnRemove(map) {
    map.off("rotate pitch", this._refresh, this);
    pitchDragRemoveHooks.call(this);
  }
  var init_rotateOnRemove = __esm({
    "src/controls/rotateOnRemove.js"() {
      init_pitchDragRemoveHooks();
    }
  });

  // src/controls/rotateControl.js
  function rotateControl(options) {
    return (
      /* alloc */
      new L.Control.Rotate(options)
    );
  }
  var init_rotateControl = __esm({
    "src/controls/rotateControl.js"() {
      init_L();
    }
  });

  // src/controls/shiftRotateWheel.js
  function shiftRotateWheel(event) {
    const handler = this._cameraShiftRotate;
    if (!event.shiftKey || editable(event.target) || event.target.closest(".leaflet-control")) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    mapSetBearing(handler._map, mapGetBearing(handler._map) + Math.sign(event.deltaY) * 5);
  }
  var init_shiftRotateWheel = __esm({
    "src/controls/shiftRotateWheel.js"() {
      init_mapSetBearing();
      init_mapGetBearing();
      init_isEditableTarget();
    }
  });

  // src/controls/shiftRotateAddHooks.js
  function shiftRotateAddHooks() {
    const container = this._map.getContainer();
    container._cameraShiftRotate = this;
    this._wheel = shiftRotateWheel;
    container.addEventListener("wheel", this._wheel, cameraListenerOptions);
  }
  var init_shiftRotateAddHooks = __esm({
    "src/controls/shiftRotateAddHooks.js"() {
      init_cameraListenerOptions();
      init_shiftRotateWheel();
    }
  });

  // src/controls/shiftRotateRemoveHooks.js
  function shiftRotateRemoveHooks() {
    const container = this._map.getContainer();
    container.removeEventListener("wheel", this._wheel, true);
    delete container._cameraShiftRotate;
  }
  var init_shiftRotateRemoveHooks = __esm({
    "src/controls/shiftRotateRemoveHooks.js"() {
    }
  });

  // src/controls/acceptPitchDrag.js
  function acceptPitchDrag(event) {
    return !event.target.closest(".leaflet-control,.leaflet-marker-icon,.leaflet-popup") && (event.button === 2 || event.button === 0 && event.ctrlKey);
  }
  var init_acceptPitchDrag = __esm({
    "src/controls/acceptPitchDrag.js"() {
    }
  });

  // src/controls/pitchDragAddHooks.js
  function pitchDragAddHooks() {
    this._dragState = dragCamera(this._map, this._map.getContainer(), acceptPitchDrag, cameraDragSensitivity, true);
  }
  var init_pitchDragAddHooks = __esm({
    "src/controls/pitchDragAddHooks.js"() {
      init_cameraDragSensitivity();
      init_dragCamera();
      init_acceptPitchDrag();
    }
  });

  // src/controls/compassOrientation.js
  function compassOrientation(event) {
    const handler = this.handler;
    const bearing = Number.isFinite(event.webkitCompassHeading) ? -event.webkitCompassHeading : event.alpha;
    const orientation = event.absolute ? 0 : screen.orientation?.angle ?? window.orientation ?? 0;
    if (Number.isFinite(bearing)) mapSetBearing(handler._map, bearing - orientation);
  }
  var init_compassOrientation = __esm({
    "src/controls/compassOrientation.js"() {
      init_mapSetBearing();
    }
  });

  // src/controls/failCompassPermission.js
  function failCompassPermission(handler, error) {
    handler.disable();
    handler._map.fire(
      "error",
      /* alloc */
      { error }
    );
  }
  var init_failCompassPermission = __esm({
    "src/controls/failCompassPermission.js"() {
    }
  });

  // src/controls/finishCompassPermission.js
  function finishCompassPermission([handlerResult, permissionResult]) {
    const { handler, generation } = handlerResult.value;
    if (!handler.enabled() || handler._generation !== generation) return;
    if (!window.DeviceOrientationEvent || permissionResult.status !== "fulfilled" || permissionResult.value !== "granted") {
      return failCompassPermission(handler, permissionResult.status === "rejected" ? permissionResult.reason : (
        /* alloc */
        new Error("Device compass permission unavailable or denied")
      ));
    }
    try {
      window.addEventListener("deviceorientation", handler._orientation);
      window.addEventListener("deviceorientationabsolute", handler._orientation);
    } catch (error) {
      failCompassPermission(handler, error);
    }
  }
  var init_finishCompassPermission = __esm({
    "src/controls/finishCompassPermission.js"() {
      init_failCompassPermission();
    }
  });

  // src/controls/compassAddHooks.js
  function compassAddHooks() {
    this._compassGeneration = this._generation = (this._generation || 0) + 1;
    this._orientation = /* alloc */
    { handler: this, handleEvent: compassOrientation };
    const permission = window.DeviceOrientationEvent?.requestPermission;
    let request;
    try {
      request = permission ? permission.call(window.DeviceOrientationEvent) : "granted";
    } catch (error) {
      request = Promise.reject(error);
    }
    Promise.allSettled(
      /* alloc */
      [
        Promise.resolve(
          /* alloc */
          { handler: this, generation: this._generation }
        ),
        request
      ]
    ).then(finishCompassPermission);
  }
  var init_compassAddHooks = __esm({
    "src/controls/compassAddHooks.js"() {
      init_compassOrientation();
      init_finishCompassPermission();
    }
  });

  // src/controls/compassRemoveHooks.js
  function compassRemoveHooks() {
    this._generation++;
    window.removeEventListener("deviceorientation", this._orientation);
    window.removeEventListener("deviceorientationabsolute", this._orientation);
  }
  var init_compassRemoveHooks = __esm({
    "src/controls/compassRemoveHooks.js"() {
    }
  });

  // src/controls/resizeMap.js
  function resizeMap(entries) {
    entries[0]?.target._containerResizeMap.invalidateSize();
  }
  var init_resizeMap = __esm({
    "src/controls/resizeMap.js"() {
    }
  });

  // src/controls/containerResizeAddHooks.js
  function containerResizeAddHooks() {
    const container = this._map.getContainer();
    container._containerResizeMap = this._map;
    this._observer = /* alloc */
    new ResizeObserver(resizeMap);
    this._observer.observe(container);
  }
  var init_containerResizeAddHooks = __esm({
    "src/controls/containerResizeAddHooks.js"() {
      init_resizeMap();
    }
  });

  // src/controls/containerResizeRemoveHooks.js
  function containerResizeRemoveHooks() {
    const container = this._map.getContainer();
    this._observer.disconnect();
    delete container._containerResizeMap;
  }
  var init_containerResizeRemoveHooks = __esm({
    "src/controls/containerResizeRemoveHooks.js"() {
    }
  });

  // src/controls/startCameraTouch.js
  function startCameraTouch(event) {
    const state = touchByContainer.get(this), { map, container } = state;
    if (state.touch || event.touches.length !== 2 || event.target.closest(".leaflet-control")) return;
    if (!touchRotateByMap.get(map).enabled() && !touchPitchByMap.get(map).enabled()) return;
    const [a, b] = event.touches;
    if (Math.hypot(b.clientX - a.clientX, b.clientY - a.clientY) < 1) return;
    mapStopPitchBearingAnimation(map);
    const rect = container.getBoundingClientRect();
    const middle = (
      /* alloc */
      new L.Point(
        (a.clientX + b.clientX) / 2 - rect.left,
        (a.clientY + b.clientY) / 2 - rect.top
      )
    );
    state.touch = /* alloc */
    {
      angle: Math.atan2(b.clientY - a.clientY, b.clientX - a.clientX),
      distance: Math.hypot(b.clientX - a.clientX, b.clientY - a.clientY),
      middle,
      anchor: map.containerPointToLatLng(middle),
      zoom: map.getZoom(),
      bearing: mapGetBearing(map),
      pitch: mapGetPitch(map),
      zooming: map.touchZoom?.enabled(),
      dragging: map.dragging?.enabled(),
      currentMiddle: (
        /* alloc */
        new L.Point(middle.x, middle.y)
      )
    };
    map.dragging?.disable();
    event.preventDefault();
    event.stopImmediatePropagation();
    if (state.nativeZoom !== void 0) state.touch.zooming = state.nativeZoom;
    state.touch.snap = map.options.zoomSnap;
    map.options.zoomSnap = 0;
  }
  var init_startCameraTouch = __esm({
    "src/controls/startCameraTouch.js"() {
      init_touchPitchByMap();
      init_touchRotateByMap();
      init_L();
      init_touchByContainer();
      init_mapStopPitchBearingAnimation();
      init_mapGetBearing();
      init_mapGetPitch();
    }
  });

  // src/controls/moveCameraTouch.js
  function moveCameraTouch(event) {
    const state = touchByContainer.get(this), { map, container, touch } = state;
    if (!touch || event.touches.length !== 2) return;
    const [a, b] = event.touches;
    const angle = Math.atan2(b.clientY - a.clientY, b.clientX - a.clientX);
    const rect = container.getBoundingClientRect(), middle = touch.currentMiddle;
    middle.x = (a.clientX + b.clientX) / 2 - rect.left;
    middle.y = (a.clientY + b.clientY) / 2 - rect.top;
    const delta = Math.atan2(Math.sin(angle - touch.angle), Math.cos(angle - touch.angle)) * degrees;
    mapSetPitchAndBearing(map, touchPitchByMap.get(map).enabled() ? touch.pitch - (middle.y - touch.middle.y) * 0.25 : touch.pitch, touchRotateByMap.get(map).enabled() ? touch.bearing + delta : touch.bearing);
    const distance = Math.hypot(b.clientX - a.clientX, b.clientY - a.clientY);
    if (distance < 1) return;
    const zoom = touch.zooming ? Math.max(map.getMinZoom(), Math.min(
      map.getMaxZoom(),
      touch.zoom + Math.log2(distance / touch.distance)
    )) : touch.zoom;
    map.setView(
      map.getCenter(),
      zoom,
      /* alloc */
      { animate: false }
    );
    if (map.options.touchZoom !== "center") {
      const projected = map.project(touch.anchor).subtract(map.project(map.containerPointToLatLng(middle)));
      map.setView(
        map.unproject(map.project(map.getCenter()).add(projected)),
        map.getZoom(),
        /* alloc */
        { animate: false }
      );
    }
    event.preventDefault();
    event.stopImmediatePropagation();
  }
  var init_moveCameraTouch = __esm({
    "src/controls/moveCameraTouch.js"() {
      init_touchPitchByMap();
      init_touchRotateByMap();
      init_degrees();
      init_touchByContainer();
      init_mapSetPitchAndBearing();
    }
  });

  // src/controls/endCameraTouch.js
  function endCameraTouch(state, event) {
    if (!state.touch) return;
    if (event?.touches?.length >= 2) return;
    const { map, container, touch } = state;
    if (touch.dragging && container._leaflet_id) map.dragging.enable();
    map.options.zoomSnap = touch.snap;
    if (touch.zooming && touch.snap && container._leaflet_id) {
      map.setZoom(
        Math.round(map.getZoom() / touch.snap) * touch.snap,
        /* alloc */
        { animate: false }
      );
    }
    state.touch = null;
  }
  var init_endCameraTouch = __esm({
    "src/controls/endCameraTouch.js"() {
    }
  });

  // src/controls/endCameraTouchEvent.js
  function endCameraTouchEvent(event) {
    endCameraTouch(touchByContainer.get(this), event);
  }
  var init_endCameraTouchEvent = __esm({
    "src/controls/endCameraTouchEvent.js"() {
      init_touchByContainer();
      init_endCameraTouch();
    }
  });

  // src/controls/changeCameraTouch.js
  function changeCameraTouch() {
    const state = cameraTouchStateByMap.get(this), { map, container } = state;
    const active = touchRotateByMap.get(map).enabled() || touchPitchByMap.get(map).enabled();
    if (active && state.nativeZoom === void 0) {
      state.nativeZoom = map.touchZoom?.enabled();
      map.touchZoom?.disable();
    } else if (!active && state.nativeZoom !== void 0) {
      endCameraTouch(state);
      if (state.nativeZoom && container._leaflet_id) map.touchZoom.enable();
      state.nativeZoom = void 0;
    }
  }
  var init_changeCameraTouch = __esm({
    "src/controls/changeCameraTouch.js"() {
      init_cameraTouchStateByMap();
      init_touchPitchByMap();
      init_touchRotateByMap();
      init_endCameraTouch();
    }
  });

  // src/controls/endAllCameraTouches.js
  function endAllCameraTouches() {
    let state;
    for (state of cameraTouchStates) endCameraTouch(state);
  }
  var init_endAllCameraTouches = __esm({
    "src/controls/endAllCameraTouches.js"() {
      init_cameraTouchStates();
      init_endCameraTouch();
    }
  });

  // src/controls/cleanupCameraTouch.js
  function cleanupCameraTouch() {
    const state = cameraTouchStateByMap.get(this);
    if (!state) return;
    const { container, map } = state;
    endCameraTouch(state);
    container.removeEventListener("touchstart", startCameraTouch, true);
    container.removeEventListener("touchmove", moveCameraTouch, true);
    container.removeEventListener("touchend", endCameraTouchEvent, true);
    container.removeEventListener("touchcancel", endCameraTouchEvent, true);
    cameraTouchStates.delete(state);
    if (!cameraTouchStates.size) window.removeEventListener("blur", endAllCameraTouches);
    map.off("cameratouchchange", changeCameraTouch, map);
    rotateControlByMap.get(map)?.remove();
    touchByContainer.delete(container);
    cameraTouchStateByMap.delete(map);
  }
  var init_cleanupCameraTouch = __esm({
    "src/controls/cleanupCameraTouch.js"() {
      init_cameraTouchStateByMap();
      init_rotateControlByMap();
      init_cameraTouchStates();
      init_touchByContainer();
      init_endCameraTouch();
      init_startCameraTouch();
      init_moveCameraTouch();
      init_endCameraTouchEvent();
      init_endAllCameraTouches();
      init_changeCameraTouch();
    }
  });

  // src/controls/addCameraHandler.js
  function addCameraHandler(map, name, Type) {
    let handlers = cameraHandlersByMap.get(map);
    if (!handlers) cameraHandlersByMap.set(map, handlers = /* alloc */
    /* @__PURE__ */ new Map());
    const handler = (
      /* alloc */
      new Type(map)
    );
    handlers.set(name, handler);
    map._handlers.push(handler);
    if (map.options[name]) handler.enable();
  }
  var init_addCameraHandler = __esm({
    "src/controls/addCameraHandler.js"() {
      init_cameraHandlersByMap();
    }
  });

  // src/core/extendLeafletClass.js
  function extendLeafletClass(parent) {
    return L.version.startsWith("2.") ? parent : parent.extend(
      /* alloc */
      {}
    );
  }
  var init_extendLeafletClass = __esm({
    "src/core/extendLeafletClass.js"() {
      init_L();
    }
  });

  // src/controls/cameraControls.js
  var cameraControls_exports = {};
  __export(cameraControls_exports, {
    cameraControls: () => cameraControls
  });
  function cameraControls(map) {
    addCameraHandler(map, "trackContainerMutation", ContainerResize.value);
    if (!map.options.rotate) return;
    addCameraHandler(map, "shiftKeyRotate", ShiftRotate.value);
    addCameraHandler(map, "pitchDrag", PitchDrag.value);
    addCameraHandler(map, "compassBearing", Compass.value);
    addCameraHandler(map, "touchRotate", TouchMode.value);
    addCameraHandler(map, "touchPitch", TouchMode.value);
    touchRotateByMap.set(map, cameraHandlersByMap.get(map).get("touchRotate"));
    touchPitchByMap.set(map, cameraHandlersByMap.get(map).get("touchPitch"));
    const container = map.getContainer();
    const state = (
      /* alloc */
      { map, container, touch: null, nativeZoom: void 0 }
    );
    cameraTouchStateByMap.set(map, state);
    touchByContainer.set(container, state);
    cameraTouchStates.add(state);
    container.addEventListener("touchstart", startCameraTouch, cameraListenerOptions);
    container.addEventListener("touchmove", moveCameraTouch, cameraListenerOptions);
    container.addEventListener("touchend", endCameraTouchEvent, true);
    container.addEventListener("touchcancel", endCameraTouchEvent, true);
    window.addEventListener("blur", endAllCameraTouches);
    map.on("cameratouchchange", changeCameraTouch, map);
    changeCameraTouch.call(map);
    if (map.options.rotateControl) {
      rotateControlByMap.set(
        map,
        /* alloc */
        new L.Control.Rotate(typeof map.options.rotateControl === "object" ? map.options.rotateControl : cameraEmptyOptions)
      );
      rotateControlByMap.get(map).addTo(map);
    }
    map.once("unload", cleanupCameraTouch, map);
  }
  var CompassHandler, ContainerResizeHandler, PitchDragHandler, ShiftRotateHandler, TouchModeHandler, RotateControl;
  var init_cameraControls = __esm({
    "src/controls/cameraControls.js"() {
      init_cameraTouchStateByMap();
      init_cameraHandlersByMap();
      init_rotateControlByMap();
      init_touchPitchByMap();
      init_touchRotateByMap();
      init_L();
      init_Compass();
      init_ContainerResize();
      init_PitchDrag();
      init_ShiftRotate();
      init_TouchMode();
      init_touchByContainer();
      init_cameraTouchStates();
      init_cameraListenerOptions();
      init_cameraEmptyOptions();
      init_notifyCameraTouchChange();
      init_rotateOnAdd();
      init_rotateOnRemove();
      init_rotateControl();
      init_shiftRotateAddHooks();
      init_shiftRotateRemoveHooks();
      init_pitchDragAddHooks();
      init_pitchDragRemoveHooks();
      init_compassAddHooks();
      init_compassRemoveHooks();
      init_containerResizeAddHooks();
      init_containerResizeRemoveHooks();
      init_startCameraTouch();
      init_moveCameraTouch();
      init_endCameraTouchEvent();
      init_changeCameraTouch();
      init_cleanupCameraTouch();
      init_endAllCameraTouches();
      init_addCameraHandler();
      init_extendLeafletClass();
      CompassHandler = class extends extendLeafletClass(L.Handler) {
      };
      Object.assign(CompassHandler.prototype, { addHooks: compassAddHooks, removeHooks: compassRemoveHooks });
      Compass.value = CompassHandler;
      ContainerResizeHandler = class extends extendLeafletClass(L.Handler) {
      };
      Object.assign(ContainerResizeHandler.prototype, {
        addHooks: containerResizeAddHooks,
        removeHooks: containerResizeRemoveHooks
      });
      ContainerResize.value = ContainerResizeHandler;
      PitchDragHandler = class extends extendLeafletClass(L.Handler) {
      };
      Object.assign(PitchDragHandler.prototype, { addHooks: pitchDragAddHooks, removeHooks: pitchDragRemoveHooks });
      PitchDrag.value = PitchDragHandler;
      ShiftRotateHandler = class extends extendLeafletClass(L.Handler) {
      };
      Object.assign(ShiftRotateHandler.prototype, {
        addHooks: shiftRotateAddHooks,
        removeHooks: shiftRotateRemoveHooks
      });
      ShiftRotate.value = ShiftRotateHandler;
      TouchModeHandler = class extends extendLeafletClass(L.Handler) {
      };
      Object.assign(TouchModeHandler.prototype, {
        addHooks: notifyCameraTouchChange,
        removeHooks: notifyCameraTouchChange
      });
      TouchMode.value = TouchModeHandler;
      RotateControl = class extends extendLeafletClass(L.Control) {
        static defaultOptions = { position: "topleft", closeOnZeroBearing: true, visualizePitch: true };
      };
      Object.assign(RotateControl.prototype, { onAdd: rotateOnAdd, onRemove: rotateOnRemove });
      if (L.version.startsWith("1.")) {
        RotateControl.prototype.options = Object.assign(Object.create(L.Control.prototype.options), RotateControl.defaultOptions);
      }
      L.Control.Rotate = RotateControl;
      if (L.control) L.control.rotate = rotateControl;
    }
  });

  // src/index.js
  init_L();

  // src/globals/layerProto.js
  var layerProto = { value: void 0 };

  // src/globals/removeLayer.js
  var removeLayer = { value: void 0 };

  // src/camera/mapCamera.js
  init_L();

  // src/globals/mapMethods.js
  var mapMethods = { value: void 0 };

  // src/globals/markerMethods.js
  var markerMethods = { value: void 0 };

  // src/globals/popupEvents.js
  var popupEvents = { value: void 0 };

  // src/globals/tooltipEvents.js
  var tooltipEvents = { value: void 0 };

  // src/globals/popupPosition.js
  var popupPosition = { value: void 0 };

  // src/globals/popupPan.js
  var popupPan = { value: void 0 };

  // src/globals/tooltipPosition.js
  var tooltipPosition = { value: void 0 };

  // src/globals/tiledBounds.js
  var tiledBounds = { value: void 0 };

  // src/globals/gridEvents.js
  var gridEvents = { value: void 0 };

  // src/weakmaps/nativeGPUByLayer.js
  var nativeGPUByLayer = /* @__PURE__ */ new WeakMap();

  // src/weakmaps/readyByLayer.js
  var readyByLayer = /* @__PURE__ */ new WeakMap();

  // src/weakmaps/nativeGPUBackByMap.js
  var nativeGPUBackByMap = /* @__PURE__ */ new WeakMap();

  // src/weakmaps/nativeGPUOrderByMap.js
  var nativeGPUOrderByMap = /* @__PURE__ */ new WeakMap();

  // src/native/nativeLayer.js
  init_L();

  // src/weakmaps/sharedByLayer.js
  var sharedByLayer = /* @__PURE__ */ new WeakMap();

  // src/weakmaps/imageStates.js
  var imageStates = /* @__PURE__ */ new WeakMap();

  // src/textures/nativeImageRefresh.js
  function nativeImageRefresh(event) {
    const states = imageStates.get(event.currentTarget);
    if (!states) return;
    let state;
    for (state of states) refreshNativeLayer(state);
  }

  // src/textures/nativeImageError.js
  function nativeImageError(event) {
    const states = imageStates.get(event.currentTarget);
    if (!states) return;
    let state;
    for (state of states) {
      state.source.fire(
        "error",
        /* alloc */
        {
          error: (
            /* alloc */
            new Error("Unable to load native layer image")
          )
        }
      );
    }
  }

  // src/textures/removeImageState.js
  function removeImageState(image, state) {
    const states = imageStates.get(image);
    if (!states) return;
    states.delete(state);
    if (!states.size) imageStates.delete(image);
  }

  // src/textures/addImageState.js
  function addImageState(image, state) {
    let states = imageStates.get(image);
    if (!states) imageStates.set(image, states = /* alloc */
    /* @__PURE__ */ new Set());
    states.add(state);
  }

  // src/weakmaps/frameByLayer.js
  var frameByLayer = /* @__PURE__ */ new WeakMap();

  // src/globals/pendingUpdates.js
  var pendingUpdates = /* @__PURE__ */ new Set();

  // src/weakmaps/layersByLayer.js
  var layersByLayer = /* @__PURE__ */ new WeakMap();

  // src/weakmaps/rendererByLayer.js
  var rendererByLayer = /* @__PURE__ */ new WeakMap();

  // src/weakmaps/sceneByLayer.js
  var sceneByLayer = /* @__PURE__ */ new WeakMap();

  // src/weakmaps/shadowMeshesByLayer.js
  var shadowMeshesByLayer = /* @__PURE__ */ new WeakMap();

  // src/weakmaps/wantedRasterTilesByLayer.js
  var wantedRasterTilesByLayer = /* @__PURE__ */ new WeakMap();

  // src/weakmaps/sunlightByMap.js
  var sunlightByMap = /* @__PURE__ */ new WeakMap();

  // src/globals/frameCommands.js
  var frameCommands = [null];

  // src/weakmaps/nativeRenderByLayer.js
  var nativeRenderByLayer = /* @__PURE__ */ new WeakMap();

  // src/weakmaps/zoomTransitionsByLayer.js
  var zoomTransitionsByLayer = /* @__PURE__ */ new WeakMap();

  // src/weakmaps/zoomViewByLayer.js
  var zoomViewByLayer = /* @__PURE__ */ new WeakMap();

  // src/globals/meshStack.js
  var meshStack = {
    subtree: true
  };

  // src/weakmaps/cameraViewByMap.js
  var cameraViewByMap = /* @__PURE__ */ new WeakMap();

  // src/camera/mapUpdateCameraOverlays.js
  init_L();
  function mapUpdateCameraOverlays(map) {
    let layer;
    for (layer of Object.values(map._layers)) {
      if (layer instanceof L.Marker) layer.update();
      else if (layer instanceof L.Popup || layer instanceof L.Tooltip) layer._updatePosition();
    }
  }

  // src/animations/updateZoomCamera.js
  function updateZoomCamera(layer, now) {
    const map = layer._map;
    const view = zoomViewByLayer.get(layer);
    let proxy, animation;
    for (animation of zoomTransitionsByLayer.get(layer).keys()) {
      if (animation.effect.target === map._proxy) {
        proxy = animation;
        break;
      }
    }
    const progress = proxy?.effect.getComputedTiming().progress ?? Math.min(1, (now - view.start) / 250);
    const targetScale = map.getZoomScale(view.targetZoom, view.zoom), scale = 1 + (targetScale - 1) * progress;
    const from = map.project(view.from, view.zoom), to = map.project(view.to, view.zoom);
    cameraViewByMap.set(
      map,
      /* alloc */
      {
        zoom: map.getScaleZoom(scale, view.zoom),
        center: map.unproject(from.add(to.subtract(from).multiplyBy(targetScale * progress / scale)), view.zoom)
      }
    );
    mapUpdateCameraOverlays(map);
  }

  // src/animations/synchronizeZoomView.js
  function synchronizeZoomView(layer, now) {
    const map = layer._map;
    let animation, time, start2;
    if (map._animatingZoom) {
      if (!zoomTransitionsByLayer.get(layer)) zoomTransitionsByLayer.set(
        layer,
        /* alloc */
        /* @__PURE__ */ new Map()
      );
      for (animation of map.getContainer().getAnimations(meshStack)) {
        if (!(animation instanceof CSSTransition) || animation.transitionProperty !== "transform" || !animation.effect.target.classList.contains("leaflet-zoom-animated") || zoomTransitionsByLayer.get(layer).has(animation)) {
          continue;
        }
        time = animation.currentTime || 0;
        animation.pause();
        zoomTransitionsByLayer.get(layer).set(
          animation,
          /* alloc */
          { start: now, time }
        );
      }
      for ([animation, { start: start2, time }] of zoomTransitionsByLayer.get(layer)) {
        animation.currentTime = Math.min(animation.effect.getComputedTiming().endTime, time + now - start2);
      }
      if (zoomViewByLayer.get(layer)) updateZoomCamera(layer, now);
    }
  }

  // src/weakmaps/sizeByLayer.js
  var sizeByLayer = /* @__PURE__ */ new WeakMap();

  // src/globals/depthTexture.js
  var depthTexture = {
    size: [null, null],
    format: "depth24plus",
    sampleCount: 4,
    usage: null
  };

  // src/globals/colorTexture.js
  var colorTexture = {
    size: [null, null],
    format: null,
    sampleCount: 4,
    usage: null
  };

  // src/textures/destroyTextureAfterSubmission.js
  async function destroyAfterSubmission(layer, texture, submitted) {
    try {
      await submitted;
    } catch (error) {
      layer.fire(
        "error",
        /* alloc */
        { error }
      );
    }
    texture.destroy();
  }

  // src/textures/destroyTexture.js
  function destroyTexture(layer, texture) {
    destroyAfterSubmission(layer, texture, rendererByLayer.get(layer).device.queue.onSubmittedWorkDone());
  }

  // src/rendering/resizeRenderer.js
  function resizeRenderer(layer, size) {
    const renderer = rendererByLayer.get(layer);
    if (!sizeByLayer.get(layer) || !sizeByLayer.get(layer).equals(size)) {
      renderer.width = size.x;
      renderer.height = size.y;
      renderer.canvas.width = Math.round(size.x * renderer.dpr);
      renderer.canvas.height = Math.round(size.y * renderer.dpr);
      renderer.canvas.style.width = `${size.x}px`;
      renderer.canvas.style.height = `${size.y}px`;
      if (renderer.depthTexture) destroyTexture(layer, renderer.depthTexture);
      renderer.colorTexture?.destroy();
      renderer.colorTexture = renderer.device.createTexture((colorTexture.size[0] = renderer.canvas.width, colorTexture.size[1] = renderer.canvas.height, colorTexture.format = renderer.format, colorTexture.usage = GPUTextureUsage.RENDER_ATTACHMENT, colorTexture));
      renderer.depthTexture = renderer.device.createTexture((depthTexture.size[0] = renderer.canvas.width, depthTexture.size[1] = renderer.canvas.height, depthTexture.usage = GPUTextureUsage.RENDER_ATTACHMENT, depthTexture));
      sizeByLayer.set(layer, size);
    }
  }

  // src/weakmaps/cameraByLayer.js
  var cameraByLayer = /* @__PURE__ */ new WeakMap();

  // src/weakmaps/sceneOriginByLayer.js
  var sceneOriginByLayer = /* @__PURE__ */ new WeakMap();

  // src/camera/updateMapCamera.js
  init_radians();

  // src/globals/cameraFov.js
  init_degrees();
  var cameraFov = 2 * Math.atan(1 / 3) * degrees;

  // src/globals/earthCirc.js
  var earthCirc = 2 * Math.PI * 6378137;

  // src/weakmaps/terrain3DByMap.js
  var terrain3DByMap = /* @__PURE__ */ new WeakMap();

  // src/weakmaps/streamTerrainByMap.js
  var streamTerrainByMap = /* @__PURE__ */ new WeakMap();

  // src/weakmaps/bridgesByLayer.js
  var bridgesByLayer = /* @__PURE__ */ new WeakMap();

  // src/weakmaps/terrainReadyByLayer.js
  var terrainReadyByLayer = /* @__PURE__ */ new WeakMap();

  // src/weakmaps/terrainTilesByLayer.js
  var terrainTilesByLayer = /* @__PURE__ */ new WeakMap();

  // src/weakmaps/terrainZoomByLayer.js
  var terrainZoomByLayer = /* @__PURE__ */ new WeakMap();

  // src/terrain/getElevation.js
  init_L();

  // src/geometry/bridgeElevation.js
  function bridgeElevation(point, bridges) {
    const bucket = bridges?.get(`${Math.floor(point.x / 64)}/${Math.floor(point.y / 64)}`);
    if (!bucket) return null;
    let bridge, a, b, c, d, u, v;
    for (bridge of bucket) {
      if (point.x < bridge.min[0] || point.x > bridge.max[0] || point.y < bridge.min[1] || point.y > bridge.max[1]) {
        continue;
      }
      for ([a, b, c] of bridge.triangles) {
        d = (b[1] - c[1]) * (a[0] - c[0]) + (c[0] - b[0]) * (a[1] - c[1]);
        u = ((b[1] - c[1]) * (point.x - c[0]) + (c[0] - b[0]) * (point.y - c[1])) / d;
        v = ((c[1] - a[1]) * (point.x - c[0]) + (a[0] - c[0]) * (point.y - c[1])) / d;
        if (u >= 0 && v >= 0 && u + v <= 1) {
          return u * a[2] + v * b[2] + (1 - u - v) * c[2];
        }
      }
    }
    return null;
  }

  // src/terrain/sampleTerrainTile.js
  function sample(tiles, px, py) {
    const tileX = Math.floor(px / 256), tileY = Math.floor(py / 256);
    const tile = tiles.get(`${tileX}/${tileY}`);
    if (!tile) return null;
    const elevation = tile[(py - tileY * 256) * 256 + px - tileX * 256];
    return Number.isFinite(elevation) && elevation > -1e3 ? elevation : null;
  }

  // src/terrain/terrainElevation.js
  function terrainElevation(point, tiles) {
    const x = point.x - 0.5, y = point.y - 0.5;
    const x0 = Math.floor(x), y0 = Math.floor(y);
    const fx = x - x0, fy = y - y0;
    const a = sample(tiles, x0, y0), b = sample(tiles, x0 + 1, y0);
    const c = sample(tiles, x0, y0 + 1), d = sample(tiles, x0 + 1, y0 + 1);
    if (!Number.isFinite(a) || !Number.isFinite(b) || !Number.isFinite(c) || !Number.isFinite(d)) {
      return Number.isFinite(a) ? a : Number.isFinite(b) ? b : Number.isFinite(c) ? c : Number.isFinite(d) ? d : null;
    }
    return (a * (1 - fx) + b * fx) * (1 - fy) + (c * (1 - fx) + d * fx) * fy;
  }

  // src/terrain/getElevation.js
  function getElevation(layer, location2) {
    if (!layer._map || !terrainReadyByLayer.get(layer)) return null;
    const point = location2 instanceof L.Point ? location2 : layer._map.project(location2, terrainZoomByLayer.get(layer));
    return bridgeElevation(point, bridgesByLayer.get(layer)) ?? terrainElevation(point, terrainTilesByLayer.get(layer));
  }

  // src/native/nativeTerrainElevation.js
  function nativeTerrainElevation(state, point, x, y, z) {
    let layer, native, request, elevation;
    const key = `${x}:${y}:${z}`;
    for (layer of Object.values(state.map._layers)) {
      native = nativeGPUByLayer.get(layer);
      if (native?.disposed || native?.terrainStream !== state) continue;
      request = native.terrainRequests?.get(key);
      if (!request?.tiles || layer._tiles[key] !== request.tile) continue;
      elevation = terrainElevation(point, request.tiles);
      if (Number.isFinite(elevation)) return elevation;
    }
    return null;
  }

  // src/native/gridTerrainElevation.js
  function gridTerrainElevation(state, location2) {
    let z = Math.max(0, Math.min(24, Math.round(state.map.getZoom())));
    const tiles = (
      /* alloc */
      /* @__PURE__ */ new Map()
    );
    let point, limit, x, y, index, dx, dy, tx, ty, entry, elevation;
    for (; z >= 0; z--) {
      point = state.map.project(location2, z), limit = 2 ** z;
      x = Math.floor(point.x / 256), y = Math.floor(point.y / 256);
      elevation = nativeTerrainElevation(state, point, x, y, z);
      if (Number.isFinite(elevation)) return elevation;
      tiles.clear();
      for (index = 0; index < 9; index++) {
        dx = index % 3 - 1;
        dy = Math.floor(index / 3) - 1;
        tx = ((x + dx) % limit + limit) % limit;
        ty = Math.max(0, Math.min(limit - 1, y + dy));
        entry = state.terrainCache.get(`${z}/${tx}/${ty}`);
        if (entry?.data) tiles.set(`${x + dx}/${y + dy}`, entry.data);
      }
      elevation = terrainElevation(point, tiles);
      if (Number.isFinite(elevation)) return elevation;
    }
    return null;
  }

  // src/terrain/mapElevationOf.js
  function mapElevationOf(map, location2) {
    const terrain = terrain3DByMap.get(map);
    if (terrain) return getElevation(terrain, location2);
    const stream = streamTerrainByMap.get(map);
    return stream && gridTerrainElevation(stream, location2);
  }

  // src/weakmaps/walkByMap.js
  var walkByMap = /* @__PURE__ */ new WeakMap();

  // src/camera/updateMapCamera.js
  init_mapGetPitch();
  init_mapGetBearing();

  // src/globals/halfRadians.js
  var halfRadians = Math.PI / 360;

  // src/camera/updateSceneCamera.js
  function updateCamera(camera) {
    camera.x ||= /* alloc */
    [0, 0, 0];
    camera.y ||= /* alloc */
    [0, 0, 0];
    camera.z ||= /* alloc */
    [0, 0, 0];
    camera.viewTransform ||= /* alloc */
    new DOMMatrix();
    camera.projectionTransform ||= /* alloc */
    new DOMMatrix();
    camera.projectionViewTransform ||= /* alloc */
    new DOMMatrix();
    const { position, target, up, x, y, z, viewMatrix, projectionMatrix, projectionViewMatrix } = camera;
    let value;
    z[0] = position[0] - target[0], z[1] = position[1] - target[1], z[2] = position[2] - target[2];
    const zLength = Math.hypot(z[0], z[1], z[2]) || 1;
    z[0] /= zLength, z[1] /= zLength, z[2] /= zLength;
    x[0] = up[1] * z[2] - up[2] * z[1];
    x[1] = up[2] * z[0] - up[0] * z[2];
    x[2] = up[0] * z[1] - up[1] * z[0];
    const xLength = Math.hypot(x[0], x[1], x[2]) || 1;
    x[0] /= xLength, x[1] /= xLength, x[2] /= xLength;
    y[0] = z[1] * x[2] - z[2] * x[1];
    y[1] = z[2] * x[0] - z[0] * x[2];
    y[2] = z[0] * x[1] - z[1] * x[0];
    const viewTransform = camera.viewTransform;
    viewTransform.m11 = x[0], viewTransform.m12 = x[1], viewTransform.m13 = x[2], viewTransform.m14 = 0;
    viewTransform.m21 = y[0], viewTransform.m22 = y[1], viewTransform.m23 = y[2], viewTransform.m24 = 0;
    viewTransform.m31 = z[0], viewTransform.m32 = z[1], viewTransform.m33 = z[2], viewTransform.m34 = 0;
    viewTransform.m41 = position[0], viewTransform.m42 = position[1], viewTransform.m43 = position[2], viewTransform.m44 = 1;
    viewTransform.invertSelf();
    viewMatrix[0] = viewTransform.m11, viewMatrix[1] = viewTransform.m12, viewMatrix[2] = viewTransform.m13, viewMatrix[3] = viewTransform.m14;
    viewMatrix[4] = viewTransform.m21, viewMatrix[5] = viewTransform.m22, viewMatrix[6] = viewTransform.m23, viewMatrix[7] = viewTransform.m24;
    viewMatrix[8] = viewTransform.m31, viewMatrix[9] = viewTransform.m32, viewMatrix[10] = viewTransform.m33, viewMatrix[11] = viewTransform.m34;
    viewMatrix[12] = viewTransform.m41, viewMatrix[13] = viewTransform.m42, viewMatrix[14] = viewTransform.m43, viewMatrix[15] = viewTransform.m44;
    for (value of viewMatrix) {
      if (!Number.isFinite(value)) throw (
        /* alloc */
        new Error("Singular 3D transform")
      );
    }
    const f = 1 / Math.tan(camera.fov * halfRadians), n = camera.near, r = camera.far;
    projectionMatrix[0] = f / camera.aspect, projectionMatrix[1] = 0, projectionMatrix[2] = 0, projectionMatrix[3] = 0;
    projectionMatrix[4] = 0, projectionMatrix[5] = f, projectionMatrix[6] = 0, projectionMatrix[7] = 0;
    projectionMatrix[8] = 0, projectionMatrix[9] = 0, projectionMatrix[10] = r / (n - r), projectionMatrix[11] = -1;
    projectionMatrix[12] = 0, projectionMatrix[13] = 0, projectionMatrix[14] = r * n / (n - r), projectionMatrix[15] = 0;
    const projectionTransform = camera.projectionTransform;
    projectionTransform.m11 = projectionMatrix[0], projectionTransform.m12 = projectionMatrix[1], projectionTransform.m13 = projectionMatrix[2], projectionTransform.m14 = projectionMatrix[3];
    projectionTransform.m21 = projectionMatrix[4], projectionTransform.m22 = projectionMatrix[5], projectionTransform.m23 = projectionMatrix[6], projectionTransform.m24 = projectionMatrix[7];
    projectionTransform.m31 = projectionMatrix[8], projectionTransform.m32 = projectionMatrix[9], projectionTransform.m33 = projectionMatrix[10], projectionTransform.m34 = projectionMatrix[11];
    projectionTransform.m41 = projectionMatrix[12], projectionTransform.m42 = projectionMatrix[13], projectionTransform.m43 = projectionMatrix[14], projectionTransform.m44 = projectionMatrix[15];
    const combined = camera.projectionViewTransform;
    combined.m11 = projectionTransform.m11, combined.m12 = projectionTransform.m12, combined.m13 = projectionTransform.m13, combined.m14 = projectionTransform.m14;
    combined.m21 = projectionTransform.m21, combined.m22 = projectionTransform.m22, combined.m23 = projectionTransform.m23, combined.m24 = projectionTransform.m24;
    combined.m31 = projectionTransform.m31, combined.m32 = projectionTransform.m32, combined.m33 = projectionTransform.m33, combined.m34 = projectionTransform.m34;
    combined.m41 = projectionTransform.m41, combined.m42 = projectionTransform.m42, combined.m43 = projectionTransform.m43, combined.m44 = projectionTransform.m44;
    combined.multiplySelf(viewTransform);
    projectionViewMatrix[0] = combined.m11, projectionViewMatrix[1] = combined.m12, projectionViewMatrix[2] = combined.m13, projectionViewMatrix[3] = combined.m14;
    projectionViewMatrix[4] = combined.m21, projectionViewMatrix[5] = combined.m22, projectionViewMatrix[6] = combined.m23, projectionViewMatrix[7] = combined.m24;
    projectionViewMatrix[8] = combined.m31, projectionViewMatrix[9] = combined.m32, projectionViewMatrix[10] = combined.m33, projectionViewMatrix[11] = combined.m34;
    projectionViewMatrix[12] = combined.m41, projectionViewMatrix[13] = combined.m42, projectionViewMatrix[14] = combined.m43, projectionViewMatrix[15] = combined.m44;
  }

  // src/projections/transformZoomAnimationPoint.js
  function animationPoint(map, point, inverse = false) {
    const view = cameraViewByMap.get(map);
    if (!view) return point;
    const half = map.getSize().divideBy(2), scale = map.getZoomScale(view.zoom);
    const shift = map.project(map.getCenter(), view.zoom).subtract(map.project(view.center, view.zoom));
    return inverse ? point.subtract(half).subtract(shift).divideBy(scale).add(half) : point.subtract(half).multiplyBy(scale).add(shift).add(half);
  }

  // src/camera/updateMapCamera.js
  function updateMapCamera(layer, size) {
    const map = layer._map;
    const zoom = cameraViewByMap.get(map)?.zoom ?? map.getZoom();
    const pixelsPerMeter = map.options.crs.scale(zoom) / (earthCirc * Math.cos(sceneOriginByLayer.get(layer).lat * radians));
    const origin = animationPoint(map, mapMethods.value.layerPointToContainerPoint.call(
      map,
      map.project(sceneOriginByLayer.get(layer)).subtract(map.getPixelOrigin())
    ));
    const distance = size.y * 1.5 / pixelsPerMeter;
    const targetX = (size.x / 2 - origin.x) / pixelsPerMeter;
    const walker = walkByMap.get(map)?.control?._walk;
    const targetY = (mapElevationOf(map, map.getCenter()) ?? 0) + (walker?.saved ? walker.state.height : 0);
    const targetZ = (size.y / 2 - origin.y) / pixelsPerMeter;
    const pitch = mapGetPitch(map) * radians;
    const bearing = mapGetBearing(map) * radians;
    const sinPitch = Math.sin(pitch), cosPitch = Math.cos(pitch);
    const sinBearing = Math.sin(bearing), cosBearing = Math.cos(bearing);
    const camera = cameraByLayer.get(layer);
    camera.fov = cameraFov;
    camera.aspect = size.x / size.y;
    camera.near = Math.max(0.1, distance / 1e4);
    camera.far = Math.max(1e4, distance * 10);
    camera.position[0] = targetX + sinBearing * sinPitch * distance;
    camera.position[1] = targetY + cosPitch * distance;
    camera.position[2] = targetZ + cosBearing * sinPitch * distance;
    camera.up[0] = -sinBearing * cosPitch;
    camera.up[1] = sinPitch;
    camera.up[2] = -cosBearing * cosPitch;
    camera.target[0] = targetX;
    camera.target[1] = targetY;
    camera.target[2] = targetZ;
    updateCamera(camera);
  }

  // src/weakmaps/visibleMeshesByLayer.js
  var visibleMeshesByLayer = /* @__PURE__ */ new WeakMap();

  // src/transforms/worldMatrixChanged.js
  function worldMatrixChanged(node, changed) {
    let i, value;
    if (node.matrix) {
      const state = node._matrixState ||= /* alloc */
      new Float64Array(16);
      for (i = 0; i < 16; i++) {
        if (state[i] !== node.matrix[i]) changed = true;
        state[i] = node.matrix[i];
      }
    } else {
      const state = node._transformState ||= /* alloc */
      new Float64Array(9);
      for (i = 0; i < 9; i++) {
        value = i < 3 ? node.position[i] : i < 6 ? node.rotation[i - 3] : node.scale[i - 6];
        if (state[i] !== value) changed = true;
        state[i] = value;
      }
    }
    return changed;
  }

  // src/transforms/composeLocalTransform.js
  init_degrees();
  function composeLocalTransform(node) {
    const matrix = node._localTransform ||= /* alloc */
    new DOMMatrix();
    matrix.m11 = 1, matrix.m12 = 0, matrix.m13 = 0, matrix.m14 = 0;
    matrix.m21 = 0, matrix.m22 = 1, matrix.m23 = 0, matrix.m24 = 0;
    matrix.m31 = 0, matrix.m32 = 0, matrix.m33 = 1, matrix.m34 = 0;
    matrix.m41 = 0, matrix.m42 = 0, matrix.m43 = 0, matrix.m44 = 1;
    matrix.translateSelf(node.position[0], node.position[1], node.position[2]);
    matrix.rotateAxisAngleSelf(0, 1, 0, node.rotation[1] * degrees);
    matrix.rotateAxisAngleSelf(1, 0, 0, node.rotation[0] * degrees);
    matrix.rotateAxisAngleSelf(0, 0, 1, node.rotation[2] * degrees);
    matrix.scaleSelf(node.scale[0], node.scale[1], node.scale[2]);
    return matrix;
  }

  // src/transforms/updateWorldMatrix.js
  function updateWorldMatrix(node) {
    const parent = node.parent;
    const parentVersion = parent?._worldMatrixVersion || 0;
    const matrixMode = Boolean(node.matrix);
    let changed = node._worldParent !== parent || node._parentWorldVersion !== parentVersion || node._worldMatrixMode !== matrixMode;
    let child;
    changed = worldMatrixChanged(node, changed);
    if (!changed) {
      for (child of node.children) updateWorldMatrix(child);
      return;
    }
    let local3, world;
    if (node.matrix) local3 = node.matrix;
    else local3 = composeLocalTransform(node);
    world = node._worldTransform ||= /* alloc */
    new DOMMatrix();
    if (local3 instanceof DOMMatrix) {
      world.m11 = local3.m11, world.m12 = local3.m12, world.m13 = local3.m13, world.m14 = local3.m14;
      world.m21 = local3.m21, world.m22 = local3.m22, world.m23 = local3.m23, world.m24 = local3.m24;
      world.m31 = local3.m31, world.m32 = local3.m32, world.m33 = local3.m33, world.m34 = local3.m34;
      world.m41 = local3.m41, world.m42 = local3.m42, world.m43 = local3.m43, world.m44 = local3.m44;
    } else {
      world.m11 = local3[0], world.m12 = local3[1], world.m13 = local3[2], world.m14 = local3[3];
      world.m21 = local3[4], world.m22 = local3[5], world.m23 = local3[6], world.m24 = local3[7];
      world.m31 = local3[8], world.m32 = local3[9], world.m33 = local3[10], world.m34 = local3[11];
      world.m41 = local3[12], world.m42 = local3[13], world.m43 = local3[14], world.m44 = local3[15];
    }
    if (parent) world.preMultiplySelf(parent._worldTransform);
    node.worldMatrix[0] = world.m11, node.worldMatrix[1] = world.m12, node.worldMatrix[2] = world.m13, node.worldMatrix[3] = world.m14;
    node.worldMatrix[4] = world.m21, node.worldMatrix[5] = world.m22, node.worldMatrix[6] = world.m23, node.worldMatrix[7] = world.m24;
    node.worldMatrix[8] = world.m31, node.worldMatrix[9] = world.m32, node.worldMatrix[10] = world.m33, node.worldMatrix[11] = world.m34;
    node.worldMatrix[12] = world.m41, node.worldMatrix[13] = world.m42, node.worldMatrix[14] = world.m43, node.worldMatrix[15] = world.m44;
    node._worldParent = parent;
    node._parentWorldVersion = parentVersion;
    node._worldMatrixMode = matrixMode;
    node._worldMatrixVersion = (node._worldMatrixVersion || 0) + 1;
    for (child of node.children) updateWorldMatrix(child);
  }

  // src/geometry/computeBounds.js
  function computeBounds(geometry) {
    const min = (
      /* alloc */
      [Infinity, Infinity, Infinity]
    );
    const max = (
      /* alloc */
      [-Infinity, -Infinity, -Infinity]
    );
    const data = geometry.attributes.position.data;
    let i, x, y, z;
    for (i = 0; i < data.length; i += 3) {
      x = data[i], y = data[i + 1], z = data[i + 2];
      min[0] = Math.min(min[0], x), max[0] = Math.max(max[0], x);
      min[1] = Math.min(min[1], y), max[1] = Math.max(max[1], y);
      min[2] = Math.min(min[2], z), max[2] = Math.max(max[2], z);
    }
    const instances = geometry.attributes.instanceOffset;
    if (instances) {
      let axis, offset, low, high;
      for (axis = 0; axis < 3; axis++) {
        low = Infinity;
        high = -Infinity;
        for (offset = axis; offset < instances.data.length; offset += instances.size) {
          low = Math.min(low, instances.data[offset]);
          high = Math.max(high, instances.data[offset]);
        }
        min[axis] = Math.fround(min[axis] + low);
        max[axis] = Math.fround(max[axis] + high);
      }
    }
    const center = (
      /* alloc */
      [
        (min[0] + max[0]) / 2,
        (min[1] + max[1]) / 2,
        (min[2] + max[2]) / 2
      ]
    );
    let radiusSquared = 0;
    for (i = 0; !instances && i < data.length; i += 3) {
      x = data[i] - center[0], y = data[i + 1] - center[1], z = data[i + 2] - center[2];
      radiusSquared = Math.max(radiusSquared, x * x + y * y + z * z);
    }
    let radius = instances ? Math.hypot(max[0] - min[0], max[1] - min[1], max[2] - min[2]) / 2 : Math.sqrt(radiusSquared);
    if (!instances && (radiusSquared === Infinity || radiusSquared < Number.MIN_VALUE / Number.EPSILON)) {
      radius = 0;
      for (i = 0; i < data.length; i += 3) {
        radius = Math.max(radius, Math.hypot(
          data[i] - center[0],
          data[i + 1] - center[1],
          data[i + 2] - center[2]
        ));
      }
    }
    geometry.bounds = /* alloc */
    { min, max, center, radius };
  }

  // src/rendering/nativeStrokeExpansion.js
  function nativeStrokeExpansion(mesh) {
    const strokeScale = mesh.program?.uniforms?.strokeScale?.value ?? 1;
    return Math.max(0, strokeScale - 1) * (mesh.geometry.nativeStrokeRadius || 0);
  }

  // src/rendering/collectVisibleMesh.js
  function collectVisibleMesh(mesh, projection, frustum, frustumLengths, candidates) {
    if (!mesh.geometry.bounds) computeBounds(mesh.geometry);
    const bounds = mesh.geometry.bounds;
    const world = mesh.worldMatrix;
    let sphere = mesh._cullingSphere;
    if (!sphere || sphere.bounds !== bounds || sphere.matrix !== world || sphere.version !== mesh._worldMatrixVersion || mesh._worldMatrixVersion === void 0) {
      sphere ||= mesh._cullingSphere = /* alloc */
      {};
      const center = bounds.center;
      sphere.x = world[0] * center[0] + world[4] * center[1] + world[8] * center[2] + world[12];
      sphere.y = world[1] * center[0] + world[5] * center[1] + world[9] * center[2] + world[13];
      sphere.z = world[2] * center[0] + world[6] * center[1] + world[10] * center[2] + world[14];
      sphere.scale = Math.max(
        Math.hypot(world[0], world[1], world[2]),
        Math.hypot(world[4], world[5], world[6]),
        Math.hypot(world[8], world[9], world[10])
      );
      sphere.radius = bounds.radius * sphere.scale;
      sphere.bounds = bounds;
      sphere.matrix = world;
      sphere.version = mesh._worldMatrixVersion;
    }
    const { x, y, z } = sphere;
    const radius = sphere.radius + nativeStrokeExpansion(mesh) * sphere.scale;
    const clipZ = projection[2] * x + projection[6] * y + projection[10] * z + projection[14];
    const clipW = projection[3] * x + projection[7] * y + projection[11] * z + projection[15];
    mesh._sortDepth = clipZ / clipW;
    mesh._visibleInFrame = frustum[0][0] * x + frustum[0][1] * y + frustum[0][2] * z + frustum[0][3] >= -radius * frustumLengths[0] && frustum[1][0] * x + frustum[1][1] * y + frustum[1][2] * z + frustum[1][3] >= -radius * frustumLengths[1] && frustum[2][0] * x + frustum[2][1] * y + frustum[2][2] * z + frustum[2][3] >= -radius * frustumLengths[2] && frustum[3][0] * x + frustum[3][1] * y + frustum[3][2] * z + frustum[3][3] >= -radius * frustumLengths[3] && frustum[4][0] * x + frustum[4][1] * y + frustum[4][2] * z + frustum[4][3] >= -radius * frustumLengths[4] && frustum[5][0] * x + frustum[5][1] * y + frustum[5][2] * z + frustum[5][3] >= -radius * frustumLengths[5];
    if (mesh._visibleInFrame) candidates.push(mesh);
  }

  // src/rendering/collectMeshes.js
  function collectMeshes(mesh, sunlight, projection, frustum, frustumLengths, candidates, shadowMeshes) {
    if (!mesh.visible) return;
    if (mesh.geometry) {
      if (sunlight?.altitude >= 3 && !mesh.tile && mesh._appearance !== 0 && !mesh.program.nightLight && mesh.program.depthTest !== false) shadowMeshes.push(mesh);
      collectVisibleMesh(mesh, projection, frustum, frustumLengths, candidates);
    }
    let child;
    for (child of mesh.children) {
      collectMeshes(child, sunlight, projection, frustum, frustumLengths, candidates, shadowMeshes);
    }
  }

  // src/rendering/collectFrameMeshes.js
  function collectFrameMeshes(layer, sunlight, sceneChanged) {
    const camera = cameraByLayer.get(layer);
    const projection = camera.projectionViewMatrix;
    const renderer = rendererByLayer.get(layer);
    const frustum = renderer.frustum ||= /* alloc */
    [
      /* alloc */
      new Float64Array(4),
      /* alloc */
      new Float64Array(4),
      /* alloc */
      new Float64Array(4),
      /* alloc */
      new Float64Array(4),
      /* alloc */
      new Float64Array(4),
      /* alloc */
      new Float64Array(4)
    ];
    const frustumLengths = renderer.frustumLengths ||= /* alloc */
    new Float64Array(6);
    let i, axis, plane, j, offset;
    for (i = 0; i < 6; i++) {
      axis = Math.floor(i / 2);
      plane = frustum[i];
      for (j = 0; j < 4; j++) {
        offset = j * 4;
        plane[j] = i === 4 ? projection[offset + 2] : i % 2 ? projection[offset + 3] - projection[offset + axis] : projection[offset + 3] + projection[offset + axis];
      }
      frustumLengths[i] = Math.hypot(plane[0], plane[1], plane[2]);
    }
    let candidates = visibleMeshesByLayer.get(layer);
    if (!candidates) visibleMeshesByLayer.set(layer, candidates = /* alloc */
    []);
    candidates.length = 0;
    let shadowMeshes = shadowMeshesByLayer.get(layer);
    if (!shadowMeshes) shadowMeshesByLayer.set(layer, shadowMeshes = /* alloc */
    []);
    shadowMeshes.length = 0;
    if (sceneChanged) updateWorldMatrix(sceneByLayer.get(layer));
    collectMeshes(sceneByLayer.get(layer), sunlight, projection, frustum, frustumLengths, candidates, shadowMeshes);
  }

  // src/weakmaps/kindByLayer.js
  var kindByLayer = /* @__PURE__ */ new WeakMap();

  // src/weakmaps/rasterTilesByLayer.js
  var rasterTilesByLayer = /* @__PURE__ */ new WeakMap();

  // src/weakmaps/roofRasterByLayer.js
  var roofRasterByLayer = /* @__PURE__ */ new WeakMap();

  // src/weakmaps/roofRastersByLayer.js
  var roofRastersByLayer = /* @__PURE__ */ new WeakMap();

  // src/weakmaps/loadingTilesByLayer.js
  var loadingTilesByLayer = /* @__PURE__ */ new WeakMap();

  // src/weakmaps/rasterVersionByLayer.js
  var rasterVersionByLayer = /* @__PURE__ */ new WeakMap();

  // src/textures/updateRoofAtlas.js
  init_L();

  // src/globals/roofSignatures.js
  var roofSignatures = [];

  // src/textures/rebuildRoofAtlas.js
  init_radians();

  // src/globals/roofTiles.js
  var roofTiles = [];

  // src/globals/TILE_SIZE.js
  var TILE_SIZE = 256;

  // src/globals/roofMin.js
  var roofMin = {
    x: 0,
    y: 0
  };

  // src/globals/roofSize.js
  var roofSize = {
    x: 1,
    y: 1
  };

  // src/globals/roofShader.js
  var roofShader = {
    code: (
      /* wgsl */
      `
      @group(0) @binding(0) var source: texture_2d<f32>;
      @group(0) @binding(1) var sourceSampler: sampler;
      @group(0) @binding(2) var<uniform> opacity: f32;
      struct Varyings { @builtin(position) position: vec4f, @location(0) uv: vec2f };
      @vertex fn vertexMain(@builtin(vertex_index) index: u32) -> Varyings {
        let uv = vec2f(f32(index & 1u), f32(index >> 1u));
        return Varyings(vec4f(uv.x * 2.0 - 1.0, 1.0 - uv.y * 2.0, 0.0, 1.0), uv);
      }
      @fragment fn fragmentMain(input: Varyings) -> @location(0) vec4f {
        let color = textureSample(source, sourceSampler, input.uv);
        return vec4f(color.rgb, color.a * opacity);
      }
    `
    )
  };

  // src/globals/roofPipeline.js
  var roofPipeline = {
    layout: "auto",
    vertex: {
      module: null,
      entryPoint: "vertexMain"
    },
    fragment: {
      module: null,
      entryPoint: "fragmentMain",
      targets: [{
        format: "rgba8unorm",
        blend: {
          color: {
            srcFactor: "src-alpha",
            dstFactor: "one-minus-src-alpha",
            operation: "add"
          },
          alpha: {
            srcFactor: "one",
            dstFactor: "one-minus-src-alpha",
            operation: "add"
          }
        }
      }]
    },
    primitive: {
      topology: "triangle-strip"
    }
  };

  // src/globals/roofBlitSampler.js
  var roofBlitSampler = {
    magFilter: "linear",
    minFilter: "linear"
  };

  // src/textures/ensureRoofBlit.js
  function ensureRoofBlit(renderer) {
    const device = renderer.device;
    if (!renderer.roofBlit) {
      const module = device.createShaderModule(roofShader);
      renderer.roofBlit = /* alloc */
      {
        pipeline: device.createRenderPipeline((roofPipeline.vertex.module = module, roofPipeline.fragment.module = module, roofPipeline)),
        sampler: device.createSampler(roofBlitSampler)
      };
      roofPipeline.vertex.module = null;
      roofPipeline.fragment.module = null;
    }
  }

  // src/globals/roofBuffer.js
  var roofBuffer = {
    size: null,
    usage: null
  };

  // src/globals/roofPass.js
  var roofPass = {
    colorAttachments: [{
      view: null,
      clearValue: {
        r: 0,
        g: 0,
        b: 0,
        a: 0
      },
      loadOp: "clear",
      storeOp: "store"
    }]
  };

  // src/globals/roofImage.js
  var roofImage = {
    source: null
  };

  // src/globals/roofTarget.js
  var roofTarget = {
    texture: null
  };

  // src/globals/roofCopySize.js
  var roofCopySize = [null, null];

  // src/textures/uploadRoofTile.js
  function uploadRoofTile(device, tile) {
    const source = tile.texture;
    if (source.uploaded !== source.image) {
      device.queue.copyExternalImageToTexture((roofImage.source = tile.image, roofImage), (roofTarget.texture = source.texture, roofTarget), (roofCopySize[0] = source.texture.width, roofCopySize[1] = source.texture.height, roofCopySize));
      roofImage.source = null;
      roofTarget.texture = null;
      source.uploaded = source.image;
    }
  }

  // src/globals/roofBindGroup.js
  var roofBindGroup = {
    layout: null,
    entries: [{
      binding: 0,
      resource: null
    }, {
      binding: 1,
      resource: null
    }, {
      binding: 2,
      resource: {
        buffer: null,
        offset: null,
        size: 4
      }
    }]
  };

  // src/globals/roofCommands.js
  var roofCommands = [null];

  // src/globals/roofOpacities.js
  var roofOpacities = { value: new Float32Array(64) };

  // src/textures/compareRoofTiles.js
  function compareRoofTiles(a, b) {
    return (a.layer.options.zIndex || 0) - (b.layer.options.zIndex || 0) || a.tile.coords.z - b.tile.coords.z;
  }

  // src/textures/composeRoofAtlas.js
  function composeRoofAtlas(layer, tiles, zoom, min, size, width, height) {
    const renderer = rendererByLayer.get(layer), device = renderer.device, map = layer._map;
    const opacityLength = Math.max(1, tiles.length) * 64;
    if (roofOpacities.value.length < opacityLength) {
      roofOpacities.value = /* alloc */
      new Float32Array(opacityLength);
    }
    const opacities = roofOpacities.value;
    const opacityBuffer = device.createBuffer((roofBuffer.size = opacities.byteLength, roofBuffer.usage = GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST, roofBuffer));
    const encoder = device.createCommandEncoder();
    const atlasPass = encoder.beginRenderPass((roofPass.colorAttachments[0].view = roofRasterByLayer.get(layer).texture.texture.createView(), roofPass));
    roofPass.colorAttachments[0].view = null;
    atlasPass.setPipeline(renderer.roofBlit.pipeline);
    tiles.sort(compareRoofTiles);
    let i, tile, rasterLayer, coords, source, tileSize, x, y;
    for ([i, { tile, layer: rasterLayer }] of tiles.entries()) {
      ({ coords } = tile);
      source = tile.texture;
      uploadRoofTile(device, tile);
      opacities[i * 64] = rasterLayer.options.opacity;
      tileSize = TILE_SIZE * map.getZoomScale(zoom, coords.z);
      x = (coords.x * tileSize - min.x) * width / size.x;
      y = (coords.y * tileSize - min.y) * height / size.y;
      atlasPass.setViewport(
        x,
        y,
        Math.min(tileSize * width / size.x, width - x),
        Math.min(tileSize * height / size.y, height - y),
        0,
        1
      );
      atlasPass.setBindGroup(0, device.createBindGroup((roofBindGroup.layout = renderer.roofBlit.pipeline.getBindGroupLayout(0), roofBindGroup.entries[0].resource = source.texture.createView(), roofBindGroup.entries[1].resource = renderer.roofBlit.sampler, roofBindGroup.entries[2].resource.buffer = opacityBuffer, roofBindGroup.entries[2].resource.offset = i * 256, roofBindGroup)));
      roofBindGroup.layout = null;
      roofBindGroup.entries[0].resource = null;
      roofBindGroup.entries[1].resource = null;
      roofBindGroup.entries[2].resource.buffer = null;
      atlasPass.draw(4);
    }
    atlasPass.end();
    device.queue.writeBuffer(opacityBuffer, 0, opacities);
    device.queue.submit((roofCommands[0] = encoder.finish(), roofCommands));
    roofCommands[0] = null;
    opacityBuffer.destroy();
  }

  // src/textures/collectRoofTiles.js
  function collectRoofTiles(rasters, tiles) {
    let zoom = -Infinity, layer, tile;
    for (layer of rasters) {
      for (tile of rasterTilesByLayer.get(layer).values()) {
        if (tile.done && !tile.request.signal.aborted && tile.image) {
          tile._roofEntry ||= /* alloc */
          { tile, layer };
          tiles.push(tile._roofEntry);
          zoom = Math.max(zoom, tile.coords.z);
        }
      }
    }
    return zoom;
  }

  // src/globals/roofTexture.js
  var roofTexture = {
    size: [null, null],
    format: "rgba8unorm",
    usage: null
  };

  // src/globals/roofSampler.js
  var roofSampler = {
    addressModeU: "clamp-to-edge",
    addressModeV: "clamp-to-edge"
  };

  // src/textures/resizeRoofTexture.js
  function resizeRoofTexture(layer, roof, width, height) {
    const renderer = rendererByLayer.get(layer);
    const descriptor = roofTexture;
    descriptor.size[0] = width;
    descriptor.size[1] = height;
    descriptor.usage = GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_DST | GPUTextureUsage.RENDER_ATTACHMENT;
    if (roof.texture && (roof.texture.width !== width || roof.texture.height !== height)) {
      destroyTexture(layer, roof.texture.texture);
      roof.texture.texture = renderer.device.createTexture(descriptor);
      roof.texture.width = width;
      roof.texture.height = height;
    }
    roof.texture ||= /* alloc */
    {
      device: renderer.device,
      texture: renderer.device.createTexture(descriptor),
      sampler: renderer.device.createSampler(roofSampler),
      samplerOptions: (
        /* alloc */
        { addressModeU: "clamp-to-edge", addressModeV: "clamp-to-edge" }
      ),
      image: null,
      width,
      height,
      format: "rgba8unorm",
      srgb: false,
      flipY: false,
      uploaded: null
    };
  }

  // src/textures/rebuildRoofAtlas.js
  function rebuildRoofAtlas(layer, rasters, signature, now) {
    const map = layer._map, renderer = rendererByLayer.get(layer);
    const tiles = roofTiles;
    tiles.length = 0;
    let zoom = collectRoofTiles(rasters, tiles);
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    let coords, tileSize;
    if (!tiles.length) zoom = map.getZoom();
    for ({ tile: { coords } } of tiles) {
      tileSize = TILE_SIZE * map.getZoomScale(zoom, coords.z);
      minX = Math.min(minX, coords.x * tileSize);
      minY = Math.min(minY, coords.y * tileSize);
      maxX = Math.max(maxX, (coords.x + 1) * tileSize);
      maxY = Math.max(maxY, (coords.y + 1) * tileSize);
    }
    const origin = map.project(sceneOriginByLayer.get(layer), zoom);
    const min = roofMin, size = roofSize;
    min.x = tiles.length ? minX : origin.x;
    min.y = tiles.length ? minY : origin.y;
    size.x = tiles.length ? maxX - minX : 1;
    size.y = tiles.length ? maxY - minY : 1;
    const scale = Math.min(1, 4096 / Math.max(size.x, size.y));
    const width = Math.max(1, Math.ceil(size.x * scale)), height = Math.max(1, Math.ceil(size.y * scale));
    const pixels = map.options.crs.scale(zoom) / (earthCirc * Math.cos(sceneOriginByLayer.get(layer).lat * radians));
    const roof = (
      /* alloc */
      {
        matrix: (
          /* alloc */
          [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]
        ),
        texture: roofRasterByLayer.get(layer)?.texture
      }
    );
    roofRasterByLayer.set(layer, roof);
    roof.signature = signature;
    roof.updatedAt = now;
    roof.matrix[0] = pixels / size.x;
    roof.matrix[10] = pixels / size.y;
    roof.matrix[12] = (origin.x - min.x) / size.x;
    roof.matrix[14] = (origin.y - min.y) / size.y;
    resizeRoofTexture(layer, roof, width, height);
    ensureRoofBlit(renderer);
    try {
      composeRoofAtlas(layer, tiles, zoom, min, size, width, height);
    } finally {
      tiles.length = 0;
    }
  }

  // src/textures/updateRoofAtlas.js
  function updateRoofAtlas(layer, rasters, now) {
    const signatures = roofSignatures;
    signatures.length = 0;
    let loading2 = false, rasterLayer;
    for (rasterLayer of rasters) {
      signatures.push(`${L.Util.stamp(rasterLayer)}:${rasterVersionByLayer.get(rasterLayer) || 0}:${rasterLayer.options.opacity}:${rasterLayer.options.zIndex}`);
      loading2 ||= Boolean(loadingTilesByLayer.get(rasterLayer));
    }
    const signature = signatures.join("|");
    signatures.length = 0;
    if (!roofRasterByLayer.get(layer) || roofRasterByLayer.get(layer).signature !== signature && (!loading2 || now - roofRasterByLayer.get(layer).updatedAt >= 50)) {
      rebuildRoofAtlas(layer, rasters, signature, now);
    }
  }

  // src/textures/updateRoofRaster.js
  function updateRoofRaster(layer, now) {
    const map = layer._map;
    let rasters = roofRastersByLayer.get(layer);
    if (!rasters) roofRastersByLayer.set(layer, rasters = /* alloc */
    []);
    rasters.length = 0;
    let hasRoofTexture = false;
    let sceneLayer, rasterLayer;
    for (sceneLayer of layersByLayer.get(layer)) {
      if (sceneLayer.options.roofTexture || sceneLayer.options.wallTexture) {
        hasRoofTexture = true;
        break;
      }
    }
    if (hasRoofTexture) {
      for (rasterLayer of Object.values(map._layers)) {
        if (kindByLayer.get(rasterLayer) === "raster" && rasterTilesByLayer.get(rasterLayer) && rasterLayer.options.opacity > 0) rasters.push(rasterLayer);
      }
      updateRoofAtlas(layer, rasters, now);
    } else if (roofRasterByLayer.get(layer)) {
      destroyTexture(layer, roofRasterByLayer.get(layer).texture.texture);
      roofRasterByLayer.set(layer, null);
    }
    return rasters;
  }

  // src/rendering/compareMeshDepth.js
  function compareMeshDepth(a, b) {
    return a.program.transparent ? (a.renderOrder || 0) - (b.renderOrder || 0) || b._sortDepth - a._sortDepth || a.id - b.id : (a._sortDepth ?? 0) - (b._sortDepth ?? 0) || a.id - b.id;
  }

  // src/rendering/compareMeshes.js
  function compareMeshes(a, b) {
    return Number(Boolean(b.ground)) - Number(Boolean(a.ground)) || (a.ground && b.ground ? (a.renderOrder || 0) - (b.renderOrder || 0) || a.tile.coords.z - b.tile.coords.z : 0) || Number(a.program.transparent) - Number(b.program.transparent) || compareMeshDepth(a, b);
  }

  // src/weakmaps/headerByLayer.js
  var headerByLayer = /* @__PURE__ */ new WeakMap();

  // src/weakmaps/tileZoomByLayer.js
  var tileZoomByLayer = /* @__PURE__ */ new WeakMap();

  // src/geometry/roofFootprint.js
  init_radians();
  function roofFootprint(mesh, layer, rasterLayer) {
    const map = layer._map, bounds = mesh.geometry.bounds, world = mesh.worldMatrix;
    const zoom = tileZoomByLayer.get(rasterLayer);
    const origin = map.project(sceneOriginByLayer.get(layer), zoom);
    const scale = map.options.crs.scale(zoom) / (earthCirc * Math.cos(sceneOriginByLayer.get(layer).lat * radians));
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    let i, x, y, z, px, py, nw, se;
    for (i = 0; i < 8; i++) {
      x = i & 1 ? bounds.max[0] : bounds.min[0], y = i & 2 ? bounds.max[1] : bounds.min[1];
      z = i & 4 ? bounds.max[2] : bounds.min[2];
      px = origin.x + (world[0] * x + world[4] * y + world[8] * z + world[12]) * scale;
      py = origin.y + (world[2] * x + world[6] * y + world[10] * z + world[14]) * scale;
      minX = Math.min(minX, px);
      minY = Math.min(minY, py);
      maxX = Math.max(maxX, px);
      maxY = Math.max(maxY, py);
    }
    if (headerByLayer.get(rasterLayer).maxLat !== void 0 && headerByLayer.get(rasterLayer).minLon !== void 0 && headerByLayer.get(rasterLayer).minLat !== void 0 && headerByLayer.get(rasterLayer).maxLon !== void 0) {
      nw = map.project(
        /* alloc */
        [headerByLayer.get(rasterLayer).maxLat, headerByLayer.get(rasterLayer).minLon],
        zoom
      );
      se = map.project(
        /* alloc */
        [headerByLayer.get(rasterLayer).minLat, headerByLayer.get(rasterLayer).maxLon],
        zoom
      );
      minX = Math.max(minX, nw.x);
      minY = Math.max(minY, nw.y);
      maxX = Math.min(maxX, se.x);
      maxY = Math.min(maxY, se.y);
      if (minX >= maxX || minY >= maxY) return null;
    }
    return (
      /* alloc */
      [minX, minY, maxX, maxY]
    );
  }

  // src/geometry/subtractRoofTile.js
  function subtractRoofTile(remaining, tile, zoom) {
    const size = 256 * 2 ** (zoom - tile.coords.z);
    const left = tile.coords.x * size, top = tile.coords.y * size;
    const pieces = (
      /* alloc */
      []
    );
    let x0, y0, x1, y1, l, t, r, b;
    for ([x0, y0, x1, y1] of remaining) {
      l = Math.max(x0, left), t = Math.max(y0, top);
      r = Math.min(x1, left + size), b = Math.min(y1, top + size);
      if (l >= r || t >= b) {
        pieces.push(
          /* alloc */
          [x0, y0, x1, y1]
        );
        continue;
      }
      if (y0 < t) pieces.push(
        /* alloc */
        [x0, y0, x1, t]
      );
      if (b < y1) pieces.push(
        /* alloc */
        [x0, b, x1, y1]
      );
      if (x0 < l) pieces.push(
        /* alloc */
        [x0, t, l, b]
      );
      if (r < x1) pieces.push(
        /* alloc */
        [r, t, x1, b]
      );
    }
    return pieces;
  }

  // src/geometry/roofCoverage.js
  function roofCoverage(mesh, layer, rasters) {
    let intersectsArchive = false, pending = false;
    let rasterLayer, footprint, remaining, tile;
    for (rasterLayer of rasters) {
      if (!headerByLayer.get(rasterLayer)) {
        pending = true;
        continue;
      }
      footprint = roofFootprint(mesh, layer, rasterLayer);
      if (!footprint) continue;
      intersectsArchive = true;
      remaining = /* alloc */
      [footprint];
      for (tile of rasterTilesByLayer.get(rasterLayer).values()) {
        if (!tile.done && !tile.error) continue;
        remaining = subtractRoofTile(remaining, tile, tileZoomByLayer.get(rasterLayer));
        if (!remaining.length) return true;
      }
    }
    return !intersectsArchive && !pending;
  }

  // src/rendering/revealRoofMesh.js
  function revealRoofMesh(layer, mesh, rasters, now) {
    let raster, loading2;
    if (mesh.program.uniforms.roofTexture && !rasters.length) mesh._roofRevealed = true;
    if (mesh.program.uniforms.roofTexture && !mesh._roofRevealed && rasters.length) {
      if (walkByMap.get(layer._map)?.control?._walk?.saved) {
        mesh._roofRevealed = true;
        mesh.fadeStart = now - (mesh.fadeDuration || 0);
      }
      if (mesh._roofCoverageSignature !== roofRasterByLayer.get(layer)?.signature) {
        mesh._roofCoverageSignature = roofRasterByLayer.get(layer)?.signature;
        mesh._roofCovered = roofCoverage(mesh, layer, rasters);
      }
      loading2 = false;
      for (raster of rasters) {
        if (!headerByLayer.get(raster) || loadingTilesByLayer.get(raster) > 0) {
          loading2 = true;
          break;
        }
      }
      if (!mesh._roofRevealed && !mesh._roofCovered && loading2) {
        mesh._appearance = 0;
        return false;
      }
      mesh._roofRevealed = true;
    }
    return true;
  }

  // src/rendering/prepareFrameMeshes.js
  function prepareFrameMeshes(layer, rasters, now, meshes) {
    const candidates = visibleMeshesByLayer.get(layer), shadowMeshes = shadowMeshesByLayer.get(layer), renderer = rendererByLayer.get(layer);
    let appearing = false;
    let mesh, progress;
    for (mesh of candidates) {
      if (!revealRoofMesh(layer, mesh, rasters, now)) continue;
      if (mesh.fadeDuration) {
        mesh.fadeStart ??= mesh.tile?.loadedAt ?? now;
        progress = Math.min(1, (now - mesh.fadeStart) / mesh.fadeDuration);
        mesh._appearance = progress * progress * (3 - 2 * progress);
        appearing ||= progress < 1;
      }
      meshes.push(mesh);
    }
    candidates.length = 0;
    meshes.sort(compareMeshes);
    let minGroundZoom = Infinity, maxGroundZoom = -Infinity;
    for (mesh of meshes) {
      if (!mesh.ground) continue;
      minGroundZoom = Math.min(minGroundZoom, mesh.tile.coords.z);
      maxGroundZoom = Math.max(maxGroundZoom, mesh.tile.coords.z);
    }
    renderer.groundOverlap = minGroundZoom !== maxGroundZoom;
    let shadowCount = 0;
    for (mesh of shadowMeshes) {
      if (mesh.visible && mesh._appearance !== 0) shadowMeshes[shadowCount++] = mesh;
    }
    shadowMeshes.length = shadowCount;
    return appearing;
  }

  // src/globals/frameBuffer.js
  var frameBuffer = {
    size: null,
    usage: null
  };

  // src/rendering/prepareFrameBuffer.js
  function prepareFrameBuffer(layer, meshes, shadowMeshes) {
    const renderer = rendererByLayer.get(layer);
    if (!renderer.uniformBuffer || renderer.uniformBuffer.size < (meshes.length * 2 + shadowMeshes.length + 1) * 256) {
      if (renderer.uniformBuffer) destroyTexture(layer, renderer.uniformBuffer);
      renderer.uniformBuffer = renderer.device.createBuffer((frameBuffer.size = Math.max(64, meshes.length * 4 + shadowMeshes.length * 2) * 256, frameBuffer.usage = GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST, frameBuffer));
      renderer.uniformData = /* alloc */
      new Float32Array(renderer.uniformBuffer.size / 4);
    }
  }

  // src/weakmaps/rootByLayer.js
  var rootByLayer = /* @__PURE__ */ new WeakMap();

  // src/globals/sunBindGroup.js
  var sunBindGroup = {
    layout: null,
    entries: [{
      binding: 0,
      resource: {
        buffer: null
      }
    }, {
      binding: 1,
      resource: null
    }, {
      binding: 2,
      resource: null
    }, {
      binding: 3,
      resource: {
        buffer: null
      }
    }]
  };

  // src/shadows/bindSunlight.js
  function bindSunlight(layer) {
    const sun = rendererByLayer.get(layer).sunlight;
    sun.bindGroup = rendererByLayer.get(layer).device.createBindGroup((sunBindGroup.layout = sun.layout, sunBindGroup.entries[0].resource.buffer = sun.buffer, sunBindGroup.entries[1].resource = sun.texture.createView(), sunBindGroup.entries[2].resource = sun.sampler, sunBindGroup.entries[3].resource.buffer = sun.lights, sunBindGroup));
    sunBindGroup.layout = null;
    sunBindGroup.entries[0].resource.buffer = null;
    sunBindGroup.entries[1].resource = null;
    sunBindGroup.entries[2].resource = null;
    sunBindGroup.entries[3].resource.buffer = null;
  }

  // src/lighting/writeLightCell.js
  function writeLightCell(values, i, key, offsets, data) {
    let j, o;
    for (j = 0, o = offsets[key] * 4; j < 8; j++) data[o + j] = values[i + j];
    offsets[key] += 2;
  }

  // src/lighting/visitLightCells.js
  function visitLightCells(values, i, minX, minZ, cellSize, columns, offsets, data) {
    const radius = values[i + 3], x = values[i] - minX, z = values[i + 2] - minZ;
    let y, c, key;
    for (y = Math.floor((z - radius) / cellSize); y <= Math.floor((z + radius) / cellSize); y++) {
      for (c = Math.floor((x - radius) / cellSize); c <= Math.floor((x + radius) / cellSize); c++) {
        key = y * columns + c;
        if (data) {
          writeLightCell(values, i, key, offsets, data);
        } else offsets[key]++;
      }
    }
  }

  // src/lighting/visitLightGridCells.js
  function visitCells(packed, minX, minZ, cellSize, columns, offsets, data) {
    let values, i;
    for (values of packed) for (i = 0; i < values.length; i += 8) {
      visitLightCells(values, i, minX, minZ, cellSize, columns, offsets, data);
    }
  }

  // src/lighting/lightGrid.js
  function lightGrid(packed, maxBytes) {
    let count = 0;
    let values, i, value, key;
    for (values of packed) count += values.length / 8;
    const cellSize = 32;
    let data;
    if (count) {
      let minX = Infinity, minZ = Infinity, maxX = -Infinity, maxZ = -Infinity;
      for (values of packed) for (i = 0; i < values.length; i += 8) {
        minX = Math.min(minX, values[i] - values[i + 3]);
        maxX = Math.max(maxX, values[i] + values[i + 3]);
        minZ = Math.min(minZ, values[i + 2] - values[i + 3]);
        maxZ = Math.max(maxZ, values[i + 2] + values[i + 3]);
      }
      const columns = Math.ceil((maxX - minX) / cellSize) + 1, rows = Math.ceil((maxZ - minZ) / cellSize) + 1;
      const counts = (
        /* alloc */
        new Uint32Array(columns * rows)
      ), next = (
        /* alloc */
        new Uint32Array(columns * rows)
      );
      visitCells(packed, minX, minZ, cellSize, columns, counts);
      let entries = 0;
      for (value of counts) entries += value;
      const length = (2 + columns * rows + entries * 2) * 4;
      if (length * 4 > maxBytes) {
        throw (
          /* alloc */
          new Error("Streetlight grid exceeds GPU storage limit")
        );
      }
      data = /* alloc */
      new Float32Array(length);
      data[0] = minX;
      data[1] = minZ;
      data[2] = cellSize;
      data[3] = columns;
      data[4] = rows;
      data[5] = count;
      let offset = 2 + columns * rows;
      for (key = 0; key < counts.length; key++) if (counts[key]) {
        data[(2 + key) * 4] = next[key] = offset;
        data[(2 + key) * 4 + 1] = counts[key];
        offset += counts[key] * 2;
      }
      visitCells(packed, minX, minZ, cellSize, columns, next, data);
    } else data = /* alloc */
    new Float32Array(8);
    return (
      /* alloc */
      { data, count }
    );
  }

  // src/globals/lightScale.js
  var lightScale = 0.03 / (4 * Math.PI);

  // src/lighting/worldLights.js
  function worldLights(lights, m) {
    const values = (
      /* alloc */
      new Float32Array(lights.length * 8)
    );
    let i, x, y, z, radius, color, flux, w;
    for (i = 0; i < lights.length; i++) {
      ({
        position: [x, y, z],
        radius,
        color,
        flux
      } = lights[i]);
      w = m[3] * x + m[7] * y + m[11] * z + m[15];
      values[i * 8] = (m[0] * x + m[4] * y + m[8] * z + m[12]) / w;
      values[i * 8 + 1] = (m[1] * x + m[5] * y + m[9] * z + m[13]) / w;
      values[i * 8 + 2] = (m[2] * x + m[6] * y + m[10] * z + m[14]) / w;
      values[i * 8 + 3] = radius;
      values[i * 8 + 4] = color[0];
      values[i * 8 + 5] = color[1];
      values[i * 8 + 6] = color[2];
      values[i * 8 + 7] = flux * lightScale;
    }
    return values;
  }

  // src/lighting/cacheLightGrid.js
  function cacheLightGrid(meshes, previous, maxBytes) {
    let unchanged = previous?.meshes.length === meshes.length;
    let i, mesh, matrix, lights, cache, sameMatrix, j;
    for (i = 0; i < meshes.length; i++) {
      mesh = meshes[i], matrix = mesh.worldMatrix, lights = mesh.extras.lights;
      cache = mesh._worldLights;
      sameMatrix = Boolean(cache);
      for (j = 0; j < matrix.length && sameMatrix; j++) sameMatrix = matrix[j] === cache.matrix[j];
      if (!sameMatrix || cache.lights !== lights) {
        cache = mesh._worldLights = /* alloc */
        {
          lights,
          matrix: (
            /* alloc */
            [...matrix]
          ),
          data: worldLights(lights, matrix)
        };
      }
      unchanged &&= previous.meshes[i].mesh === mesh && previous.meshes[i].cache === cache;
    }
    if (unchanged) return previous;
    const packed = (
      /* alloc */
      new Array(meshes.length)
    );
    const snapshots = (
      /* alloc */
      new Array(meshes.length)
    );
    for (i = 0; i < meshes.length; i++) {
      mesh = meshes[i];
      cache = mesh._worldLights;
      packed[i] = cache.data;
      snapshots[i] = /* alloc */
      { mesh, cache };
    }
    return (
      /* alloc */
      { ...lightGrid(packed, maxBytes), meshes: snapshots }
    );
  }

  // src/globals/geometryEmpty.js
  var geometryEmpty = [];

  // src/lighting/collectLightMeshes.js
  function collectLightMeshes(node, fixed, moving) {
    if (!node.visible) return;
    if (node.extras?.lights) (node.extras.dynamicLights ? moving : fixed).push(node);
    let child;
    for (child of node.children || geometryEmpty) collectLightMeshes(child, fixed, moving);
  }

  // src/lighting/updatePointLights.js
  function updatePointLights(layer) {
    const { device, sunlight: sun } = rendererByLayer.get(layer);
    const fixed = (
      /* alloc */
      []
    );
    const moving = (
      /* alloc */
      []
    );
    let sceneLayer;
    for (sceneLayer of layersByLayer.get(layer)) {
      if (!sceneLayer.options.nightLight || !rootByLayer.get(sceneLayer).visible) continue;
      collectLightMeshes(rootByLayer.get(sceneLayer), fixed, moving);
    }
    const maxBytes = device.limits.maxStorageBufferBindingSize;
    const staticGrid = cacheLightGrid(fixed, sun.staticLightGrid, maxBytes);
    const dynamicGrid = cacheLightGrid(moving, sun.dynamicLightGrid, maxBytes);
    if (staticGrid === sun.staticLightGrid && dynamicGrid === sun.dynamicLightGrid) return;
    const size = staticGrid.data.byteLength + dynamicGrid.data.byteLength;
    if (size > maxBytes) throw (
      /* alloc */
      new Error("Streetlight grid exceeds GPU storage limit")
    );
    let uploadStatic = staticGrid !== sun.staticLightGrid;
    if (sun.lights.size < size) {
      destroyTexture(layer, sun.lights);
      sun.lights = device.createBuffer(
        /* alloc */
        { size, usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST }
      );
      bindSunlight(layer);
      uploadStatic = true;
    }
    staticGrid.data[6] = staticGrid.data.length / 4;
    if (uploadStatic) device.queue.writeBuffer(sun.lights, 0, staticGrid.data);
    device.queue.writeBuffer(sun.lights, staticGrid.data.byteLength, dynamicGrid.data);
    sun.lightCount = staticGrid.count + dynamicGrid.count;
    sun.staticLightGrid = staticGrid;
    sun.dynamicLightGrid = dynamicGrid;
  }

  // src/rendering/prepareFrameUniforms.js
  function prepareFrameUniforms(layer, meshes, shadowMeshes, sunlight) {
    const renderer = rendererByLayer.get(layer), camera = cameraByLayer.get(layer);
    const view = camera.viewMatrix, direction = sunlight?.direction;
    const x = direction ? direction[0] : -300;
    const y = direction ? direction[1] : 500;
    const z = direction ? direction[2] : 300;
    const lightX = view[0] * x + view[4] * y + view[8] * z;
    const lightY = view[1] * x + view[5] * y + view[9] * z;
    const lightZ = view[2] * x + view[6] * y + view[10] * z;
    const lightLength = Math.hypot(lightX, lightY, lightZ) || 1;
    const skyLength = Math.hypot(view[4], view[5], view[6]) || 1;
    prepareFrameBuffer(layer, meshes, shadowMeshes);
    const frameData = renderer.uniformData;
    frameData.set(camera.viewMatrix, 0);
    frameData.set(camera.projectionMatrix, 16);
    if (roofRasterByLayer.get(layer)?.matrix) frameData.set(roofRasterByLayer.get(layer).matrix, 32);
    else {
      frameData.fill(0, 32, 48);
      frameData[32] = frameData[37] = frameData[42] = frameData[47] = 1;
    }
    frameData[48] = lightX / lightLength;
    frameData[49] = lightY / lightLength;
    frameData[50] = lightZ / lightLength;
    frameData[51] = sunlight && sunlight.altitude <= 0 ? 0 : 1;
    frameData[52] = view[4] / skyLength;
    frameData[53] = view[5] / skyLength;
    frameData[54] = view[6] / skyLength;
    const night = sunlight ? Math.max(0, Math.min(1, (3 - sunlight.altitude) / 9)) : 0;
    frameData[55] = night * night * (3 - 2 * night);
    const tint = sunlight?.tint;
    frameData[56] = tint ? tint[0] : 1;
    frameData[57] = tint ? tint[1] : 1;
    frameData[58] = tint ? tint[2] : 1;
    frameData[59] = 0;
    if (night > 0) updatePointLights(layer);
    renderer.uniformSlot = 1;
  }

  // src/globals/scenePass.js
  var scenePass = {
    colorAttachments: [{
      view: null,
      resolveTarget: null,
      clearValue: {
        r: 0,
        g: 0,
        b: 0,
        a: 0
      },
      loadOp: "clear",
      storeOp: "store"
    }],
    depthStencilAttachment: {
      view: null,
      depthClearValue: 1,
      depthLoadOp: "clear",
      depthStoreOp: "store"
    }
  };

  // src/globals/meshOffsets.js
  var meshOffsets = [null];

  // src/globals/meshPipeline.js
  var meshPipeline = {
    layout: null,
    vertex: {
      module: null,
      entryPoint: "vertexMain",
      buffers: null
    },
    fragment: {
      module: null,
      entryPoint: "fragmentMain",
      targets: [{
        format: null,
        blend: null,
        writeMask: null
      }]
    },
    primitive: {
      topology: "triangle-list",
      cullMode: null,
      frontFace: null
    },
    multisample: { count: 4 },
    depthStencil: {
      format: "depth24plus",
      depthWriteEnabled: null,
      depthCompare: null
    }
  };

  // src/globals/alphaBlend.js
  var alphaBlend = {
    color: {
      srcFactor: "src-alpha",
      dstFactor: "one-minus-src-alpha",
      operation: "add"
    },
    alpha: {
      srcFactor: "one",
      dstFactor: "one-minus-src-alpha",
      operation: "add"
    }
  };

  // src/rendering/drawPipeline.js
  function drawPipeline(renderer, mesh, cullMode, frontFace) {
    const { program } = mesh;
    const depthCompare = program.depthTest === false || mesh.ground && renderer.groundOverlap ? "always" : "less-equal";
    const pipelineKey = `${cullMode}:${frontFace}:${depthCompare}`;
    let pipeline = program.pipelineCache.get(pipelineKey);
    if (!pipeline) {
      pipeline = renderer.device.createRenderPipeline((meshPipeline.layout = program.pipelineLayout, meshPipeline.vertex.module = program.vertex, meshPipeline.vertex.buffers = program.vertexBuffers, meshPipeline.fragment.module = program.fragment, meshPipeline.fragment.targets[0].format = renderer.format, meshPipeline.fragment.targets[0].blend = program.transparent ? alphaBlend : void 0, meshPipeline.fragment.targets[0].writeMask = GPUColorWrite.ALL, meshPipeline.primitive.cullMode = cullMode, meshPipeline.primitive.frontFace = frontFace, meshPipeline.depthStencil.depthWriteEnabled = program.depthWrite, meshPipeline.depthStencil.depthCompare = depthCompare, meshPipeline));
      meshPipeline.layout = null;
      meshPipeline.vertex.module = null;
      meshPipeline.vertex.buffers = null;
      meshPipeline.fragment.module = null;
      program.pipelineCache.set(pipelineKey, pipeline);
    }
    return pipeline;
  }

  // src/materials/prepareMeshCutout.js
  function prepareMeshCutout(renderer, mesh, base) {
    const data = renderer.uniformData;
    const cutout = (mesh._nativeSource || mesh._rasterSource)?.options.cutout;
    if (cutout && (!Number.isFinite(cutout.x) || !Number.isFinite(cutout.y) || !Number.isFinite(cutout.radius) || cutout.radius < 0)) {
      throw (
        /* alloc */
        new Error("cutout requires finite x, y and a non-negative radius in CSS pixels")
      );
    }
    data[base + 36] = (cutout?.x ?? 0) * renderer.dpr;
    data[base + 37] = (cutout?.y ?? 0) * renderer.dpr;
    data[base + 38] = (cutout?.radius ?? 0) * renderer.dpr;
    data[base + 39] = cutout?.outside ? 1 : 0;
  }

  // src/rendering/prepareMeshUniforms.js
  function prepareMeshUniforms(renderer, mesh) {
    const uniforms = mesh.program.uniforms;
    const offset = renderer.uniformSlot++ * 256;
    const data = renderer.uniformData, base = offset / 4;
    data.set(mesh.worldMatrix, base);
    data.set(uniforms.baseColor.value, base + 16);
    data[base + 19] = 1;
    data[base + 20] = uniforms.metallic.value;
    data[base + 21] = uniforms.roughness.value;
    data[base + 22] = uniforms.opacity.value * (mesh.ground ? mesh._appearance ?? 1 : 1);
    data[base + 23] = uniforms.alphaCutoff.value;
    data.set(uniforms.emissive.value, base + 24);
    data[base + 27] = uniforms.occlusionStrength.value;
    data[base + 28] = mesh.terrain?.[0] ?? 0;
    data[base + 29] = mesh.terrain?.[1] ?? 0;
    data[base + 30] = mesh.terrain?.[2] ?? 0;
    data[base + 31] = mesh.terrain?.[3] ?? 0;
    data[base + 32] = mesh.highlight?.[0] ?? 0;
    data[base + 33] = mesh.highlight?.[1] ?? 0;
    data[base + 34] = mesh.program.nightSparkle ? data[55] : 0;
    data[base + 35] = mesh.ground ? 1 : mesh._appearance ?? 1;
    prepareMeshCutout(renderer, mesh, base);
    data[base + 40] = uniforms.strokeScale?.value ?? 1;
    data[base + 41] = data[base + 42] = data[base + 43] = 0;
    return offset;
  }

  // src/globals/meshImage.js
  var meshImage = {
    source: null,
    flipY: null
  };

  // src/globals/meshTarget.js
  var meshTarget = {
    texture: null
  };

  // src/globals/meshCopySize.js
  var meshCopySize = [null, null];

  // src/textures/uploadMeshTexture.js
  function uploadMeshTexture(device, texture) {
    if (texture.uploaded === texture.image) return;
    device.queue.copyExternalImageToTexture(
      (meshImage.source = texture.image, meshImage.flipY = Boolean(texture.flipY), meshImage),
      (meshTarget.texture = texture.texture, meshTarget),
      (meshCopySize[0] = texture.image.width, meshCopySize[1] = texture.image.height, meshCopySize)
    );
    meshImage.source = null;
    meshTarget.texture = null;
    texture.uploaded = texture.image;
  }

  // src/globals/meshBindGroup.js
  var meshBindGroup = {
    layout: null,
    entries: null
  };

  // src/globals/drawEntries.js
  var drawEntries = [];

  // src/globals/drawMeshEntry.js
  var drawMeshEntry = {
    binding: 0,
    resource: {
      buffer: null,
      size: 176
    }
  };

  // src/globals/drawFrameEntry.js
  var drawFrameEntry = {
    binding: 1,
    resource: {
      buffer: null,
      size: 240
    }
  };

  // src/globals/drawTerrainEntry.js
  var drawTerrainEntry = {
    binding: 2,
    resource: null
  };

  // src/globals/drawTextureEntries.js
  var drawTextureEntries = [
    {
      binding: null,
      resource: null
    },
    {
      binding: null,
      resource: null
    },
    {
      binding: null,
      resource: null
    },
    {
      binding: null,
      resource: null
    },
    {
      binding: null,
      resource: null
    }
  ];

  // src/globals/drawSamplerEntries.js
  var drawSamplerEntries = [
    {
      binding: null,
      resource: null
    },
    {
      binding: null,
      resource: null
    },
    {
      binding: null,
      resource: null
    },
    {
      binding: null,
      resource: null
    },
    {
      binding: null,
      resource: null
    }
  ];

  // src/textures/bindMeshTextures.js
  function bindMeshTextures(renderer, mesh, textures) {
    const { program } = mesh;
    const entries = drawEntries;
    entries.length = 0;
    drawMeshEntry.resource.buffer = renderer.uniformBuffer;
    drawFrameEntry.resource.buffer = renderer.uniformBuffer;
    entries.push(drawMeshEntry, drawFrameEntry);
    if (program.terrain) {
      drawTerrainEntry.resource = program.terrain.texture.createView();
      entries.push(drawTerrainEntry);
    }
    mesh.boundBuffer = renderer.uniformBuffer;
    const boundTextures = mesh.boundTextures ||= /* alloc */
    [];
    boundTextures.length = textures.length;
    let i, binding, texture;
    for (i = 0; i < textures.length; i++) {
      binding = program.bindings[i], texture = textures[i];
      drawTextureEntries[i].binding = binding.texture;
      drawTextureEntries[i].resource = texture.texture.createView();
      drawSamplerEntries[i].binding = binding.sampler;
      drawSamplerEntries[i].resource = texture.sampler;
      entries.push(drawTextureEntries[i], drawSamplerEntries[i]);
      boundTextures[i] ||= /* alloc */
      [];
      boundTextures[i][0] = texture.texture;
      boundTextures[i][1] = texture.sampler;
    }
    mesh.bindGroup = renderer.device.createBindGroup((meshBindGroup.layout = program.bindGroupLayout, meshBindGroup.entries = entries, meshBindGroup));
    meshBindGroup.layout = null;
    meshBindGroup.entries = null;
    drawMeshEntry.resource.buffer = null;
    drawFrameEntry.resource.buffer = null;
    drawTerrainEntry.resource = null;
    for (i = 0; i < textures.length; i++) {
      drawTextureEntries[i].resource = null;
      drawSamplerEntries[i].resource = null;
    }
    entries.length = 0;
  }

  // src/textures/prepareMeshTextures.js
  function prepareMeshTextures(renderer, mesh) {
    const { program } = mesh;
    const { device } = renderer;
    const textures = mesh._textures ||= /* alloc */
    [];
    textures.length = 0;
    let binding, texture, i;
    for (binding of program.bindings) {
      texture = program.uniforms[binding.name]?.value;
      if (!texture) throw (
        /* alloc */
        new Error(`Missing Layer3D texture: ${binding.name}`)
      );
      uploadMeshTexture(device, texture);
      textures.push(texture);
    }
    let bindingsChanged = !mesh.bindGroup || mesh.boundBuffer !== renderer.uniformBuffer || textures.length !== mesh.boundTextures.length;
    for (i = 0; !bindingsChanged && i < textures.length; i++) {
      if (textures[i].texture !== mesh.boundTextures[i][0] || textures[i].sampler !== mesh.boundTextures[i][1]) bindingsChanged = true;
    }
    if (bindingsChanged) bindMeshTextures(renderer, mesh, textures);
  }

  // src/rendering/drawGeometry.js
  function drawGeometry(layer, mesh, pass, cullMode, frontFace) {
    const { geometry } = mesh, { attributes, drawRange } = geometry;
    const renderer = rendererByLayer.get(layer);
    const { device } = renderer;
    const pipeline = drawPipeline(renderer, mesh, cullMode, frontFace);
    const offset = prepareMeshUniforms(renderer, mesh);
    prepareMeshTextures(renderer, mesh);
    pass.setPipeline(pipeline);
    pass.setBindGroup(0, mesh.bindGroup, (meshOffsets[0] = offset, meshOffsets));
    pass.setVertexBuffer(0, attributes.position.buffer);
    pass.setVertexBuffer(1, attributes.normal.buffer);
    if (attributes.color) pass.setVertexBuffer(2, attributes.color.buffer);
    if (attributes.uv) pass.setVertexBuffer(3, attributes.uv.buffer);
    const instances = attributes.instanceOffset;
    if (instances) pass.setVertexBuffer(4, instances.buffer);
    let name, attribute;
    for (name in attributes) {
      attribute = attributes[name];
      if (!attribute.needsUpdate) continue;
      device.queue.writeBuffer(attribute.buffer, 0, attribute.data);
      attribute.needsUpdate = false;
      if (name === "position" || name === "instanceOffset") geometry.bounds = null;
    }
    const index = attributes.index;
    if (index) {
      pass.setIndexBuffer(index.buffer, index.indexFormat);
      pass.drawIndexed(drawRange.count, instances?.count ?? 1, drawRange.start, 0, 0);
    } else {
      pass.draw(drawRange.count, instances?.count ?? 1, drawRange.start, 0);
    }
  }

  // src/rendering/drawSceneMeshes.js
  function drawSceneMeshes(layer, encoder, meshes) {
    const renderer = rendererByLayer.get(layer);
    const pass = encoder.beginRenderPass((scenePass.colorAttachments[0].view = renderer.colorTexture.createView(), scenePass.colorAttachments[0].resolveTarget = renderer.context.getCurrentTexture().createView(), scenePass.depthStencilAttachment.view = renderer.depthTexture.createView(), scenePass));
    scenePass.colorAttachments[0].view = null;
    scenePass.colorAttachments[0].resolveTarget = null;
    scenePass.depthStencilAttachment.view = null;
    pass.setViewport(0, 0, renderer.canvas.width, renderer.canvas.height, 0, 1);
    pass.setBindGroup(1, renderer.sunlight.bindGroup);
    let mesh, world, uniforms, determinant, frontFace, program;
    for (mesh of meshes) {
      world = mesh.worldMatrix;
      if (mesh.texture) {
        mesh.program.uniforms.baseTexture.value = mesh.texture;
        mesh.program.uniforms.opacity.value = mesh.opacity;
      }
      uniforms = mesh.program.uniforms;
      if (uniforms.roofTexture) uniforms.roofTexture.value = roofRasterByLayer.get(layer)?.texture || renderer.roofFallbackTexture;
      if (!mesh._frontFace || mesh._frontFaceWorldVersion !== mesh._worldMatrixVersion || mesh._worldMatrixVersion === void 0) {
        determinant = world[0] * (world[5] * world[10] - world[6] * world[9]) - world[4] * (world[1] * world[10] - world[2] * world[9]) + world[8] * (world[1] * world[6] - world[2] * world[5]);
        if (!Number.isFinite(determinant) || determinant === 0) {
          throw (
            /* alloc */
            new Error("Singular 3D transform")
          );
        }
        mesh._frontFace = determinant < 0 ? "cw" : "ccw";
        mesh._frontFaceWorldVersion = mesh._worldMatrixVersion;
      }
      frontFace = mesh._frontFace;
      program = mesh.program;
      if (program.transparent && program._layerMaterial.doubleSided && !mesh._nativeSource) {
        drawGeometry(layer, mesh, pass, "front", frontFace);
        drawGeometry(layer, mesh, pass, "back", frontFace);
      } else {
        drawGeometry(layer, mesh, pass, program.cullMode, frontFace);
      }
    }
    pass.end();
  }

  // src/globals/disabledShadow.js
  var disabledShadow = new Float32Array([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0]);

  // src/globals/shadowValues.js
  var shadowValues = new Float32Array(20);

  // src/shadows/shadowMeshMatches.js
  function shadowMeshMatches(cache, mesh) {
    const previous = cache.meshes.get(mesh), range = mesh.geometry.drawRange;
    if (!(previous && previous.world === mesh._worldMatrixVersion && previous.geometry === mesh.geometry && previous.start === range.start && previous.count === range.count && previous.appearance === (mesh._appearance ?? 1))) return false;
    let attribute;
    for (attribute of Object.values(mesh.geometry.attributes)) {
      if (attribute.needsUpdate) return false;
    }
    return true;
  }

  // src/shadows/shadowCacheMatches.js
  function shadowCacheMatches(sun, meshes, sunlight) {
    const cache = sun.cache;
    let unchanged = sun.enabled && cache?.meshes.size === meshes.length;
    let i, mesh;
    if (unchanged) {
      for (i = 0; i < sunlight.direction.length; i++) {
        if (sunlight.direction[i] !== cache.direction[i]) {
          unchanged = false;
          break;
        }
      }
    }
    if (unchanged) {
      for (mesh of meshes) {
        if (!shadowMeshMatches(cache, mesh)) {
          unchanged = false;
          break;
        }
      }
    }
    return unchanged;
  }

  // src/globals/shadowBounds.js
  var shadowBounds = {
    min: [0, 0, 0],
    max: [0, 0, 0]
  };

  // src/globals/shadowCamera.js
  var shadowCamera = {
    position: [0, 0, 0],
    target: [0, 0, 0],
    up: [0, 0, -1],
    x: [0, 0, 0],
    y: [0, 0, 0],
    z: [0, 0, 0],
    fov: 45,
    aspect: 1,
    near: 1,
    far: 500,
    viewMatrix: [],
    projectionMatrix: [],
    projectionViewMatrix: []
  };

  // src/globals/shadowLow.js
  var shadowLow = [0, 0, 0];

  // src/globals/shadowHigh.js
  var shadowHigh = [0, 0, 0];

  // src/geometry/meshShadowBounds.js
  function meshShadowBounds(mesh, bounds, matrix) {
    let cached = mesh._shadowBounds;
    if (!cached || cached.version !== mesh._worldMatrixVersion || cached.bounds !== bounds) {
      cached ||= mesh._shadowBounds = /* alloc */
      {
        min: (
          /* alloc */
          [Infinity, Infinity, Infinity]
        ),
        max: (
          /* alloc */
          [-Infinity, -Infinity, -Infinity]
        )
      };
      cached.version = mesh._worldMatrixVersion;
      cached.bounds = bounds;
      cached.min.fill(Infinity);
      cached.max.fill(-Infinity);
      let i, x, y, z, w, axis, value;
      for (i = 0; i < 8; i++) {
        x = i & 1 ? bounds.max[0] : bounds.min[0], y = i & 2 ? bounds.max[1] : bounds.min[1];
        z = i & 4 ? bounds.max[2] : bounds.min[2];
        w = matrix[3] * x + matrix[7] * y + matrix[11] * z + matrix[15];
        for (axis = 0; axis < 3; axis++) {
          value = (matrix[axis] * x + matrix[axis + 4] * y + matrix[axis + 8] * z + matrix[axis + 12]) / w;
          cached.min[axis] = Math.min(cached.min[axis], value);
          cached.max[axis] = Math.max(cached.max[axis], value);
        }
      }
    }
    return cached;
  }

  // src/geometry/shadowBounds.js
  function shadowBounds2(meshes, output = (
    /* alloc */
    {
      min: (
        /* alloc */
        [Infinity, Infinity, Infinity]
      ),
      max: (
        /* alloc */
        [-Infinity, -Infinity, -Infinity]
      )
    }
  )) {
    const { min, max } = output;
    min.fill(Infinity);
    max.fill(-Infinity);
    let mesh, bounds, matrix, cached, axis;
    for (mesh of meshes) {
      if (!mesh.geometry.bounds || mesh.geometry.attributes.position.needsUpdate) computeBounds(mesh.geometry);
      bounds = mesh.geometry.bounds, matrix = mesh.worldMatrix;
      cached = meshShadowBounds(mesh, bounds, matrix);
      for (axis = 0; axis < 3; axis++) {
        min[axis] = Math.min(min[axis], cached.min[axis]);
        max[axis] = Math.max(max[axis], cached.max[axis]);
      }
    }
    min[1] = Math.min(0, min[1]);
    return output;
  }

  // src/shadows/shadowMatrix.js
  function shadowMatrix(meshes, sunlight) {
    const { min, max } = shadowBounds2(meshes, shadowBounds);
    const camera = shadowCamera;
    camera.viewTransform ||= /* alloc */
    new DOMMatrix();
    camera.projectionTransform ||= /* alloc */
    new DOMMatrix();
    camera.projectionViewTransform ||= /* alloc */
    new DOMMatrix();
    const low = shadowLow, high = shadowHigh;
    let i, axis, x, y, z, value;
    const radius = Math.max(100, Math.hypot(max[0] - min[0], max[1] - min[1], max[2] - min[2]));
    for (i = 0; i < 3; i++) {
      camera.target[i] = (min[i] + max[i]) / 2;
      camera.position[i] = camera.target[i] + sunlight.direction[i] * radius * 2;
    }
    camera.far = radius * 5;
    updateCamera(camera);
    const view = camera.viewMatrix;
    low.fill(Infinity);
    high.fill(-Infinity);
    for (i = 0; i < 8; i++) {
      x = i & 1 ? max[0] : min[0];
      y = i & 2 ? max[1] : min[1];
      z = i & 4 ? max[2] : min[2];
      for (axis = 0; axis < 3; axis++) {
        value = view[axis] * x + view[axis + 4] * y + view[axis + 8] * z + view[axis + 12];
        low[axis] = Math.min(low[axis], value - 20);
        high[axis] = Math.max(high[axis], value + 20);
      }
    }
    const scaleX = 2 / (high[0] - low[0]), scaleY = 2 / (high[1] - low[1]);
    const scaleZ = -1 / (high[2] - low[2]);
    const matrix = (
      /* alloc */
      new Float32Array(16)
    );
    for (i = 0; i < 16; i += 4) {
      matrix[i] = view[i] * scaleX;
      matrix[i + 1] = view[i + 1] * scaleY;
      matrix[i + 2] = view[i + 2] * scaleZ;
      matrix[i + 3] = view[i + 3];
    }
    matrix[12] -= (high[0] + low[0]) / (high[0] - low[0]);
    matrix[13] -= (high[1] + low[1]) / (high[1] - low[1]);
    matrix[14] += high[2] / (high[2] - low[2]);
    return matrix;
  }

  // src/globals/shadowMeshLayout.js
  var shadowMeshLayout = {
    entries: [{
      binding: 0,
      visibility: null,
      buffer: {
        type: "uniform",
        hasDynamicOffset: true
      }
    }]
  };

  // src/globals/shadowDepthLayout.js
  var shadowDepthLayout = {
    entries: [{
      binding: 0,
      visibility: null,
      buffer: {
        type: "uniform"
      }
    }]
  };

  // src/globals/depthBindGroup.js
  var depthBindGroup = {
    layout: null,
    entries: [{
      binding: 0,
      resource: {
        buffer: null
      }
    }]
  };

  // src/globals/shadowShader.js
  var shadowShader = {
    code: null
  };

  // src/globals/shadowPipeline.js
  var shadowPipeline = {
    layout: null,
    vertex: {
      module: null,
      entryPoint: "main",
      buffers: null
    },
    fragment: {
      module: null,
      entryPoint: "fragmentMain",
      targets: []
    },
    primitive: {
      topology: "triangle-list",
      cullMode: "none"
    },
    depthStencil: {
      format: "depth32float",
      depthWriteEnabled: true,
      depthCompare: "less",
      depthBias: 2,
      depthBiasSlopeScale: 2
    }
  };

  // src/globals/shadowPipelineLayout.js
  var shadowPipelineLayout = {
    bindGroupLayouts: [null, null]
  };

  // src/globals/positionLayout.js
  var positionLayout = Object.freeze({
    arrayStride: 12,
    attributes: Object.freeze([Object.freeze({
      shaderLocation: 0,
      offset: 0,
      format: "float32x3"
    })])
  });

  // src/globals/instanceLayout.js
  var instanceLayout = Object.freeze({
    arrayStride: 16,
    stepMode: "instance",
    attributes: Object.freeze([Object.freeze({
      shaderLocation: 4,
      offset: 0,
      format: "float32x4"
    })])
  });

  // src/globals/shadowInstanceLayouts.js
  var shadowInstanceLayouts = [positionLayout, instanceLayout];

  // src/globals/shadowLayouts.js
  var shadowLayouts = [positionLayout];

  // src/shadows/ensureShadowPipeline.js
  function ensureShadowPipeline(device, sun, instanced = false) {
    const key = instanced ? "instancePipeline" : "pipeline";
    if (!sun[key]) {
      if (!sun.meshLayout) {
        sun.meshLayout = device.createBindGroupLayout((shadowMeshLayout.entries[0].visibility = GPUShaderStage.VERTEX | GPUShaderStage.FRAGMENT, shadowMeshLayout));
        sun.depthLayout = device.createBindGroupLayout((shadowDepthLayout.entries[0].visibility = GPUShaderStage.VERTEX, shadowDepthLayout));
        sun.depthBindGroup = device.createBindGroup((depthBindGroup.layout = sun.depthLayout, depthBindGroup.entries[0].resource.buffer = sun.buffer, depthBindGroup));
        depthBindGroup.layout = null;
        depthBindGroup.entries[0].resource.buffer = null;
      }
      const shader = device.createShaderModule((shadowShader.code = /* wgsl */
      `
      struct Mesh { world: mat4x4<f32>, padding: array<vec4<f32>, 4>, highlight: vec4<f32> };
      @group(0) @binding(0) var<uniform> mesh: Mesh;
      @group(1) @binding(0) var<uniform> matrix: mat4x4<f32>;
      @vertex fn main(@location(0) position: vec3<f32>${instanced ? ", @location(4) offset: vec4<f32>" : ""}) -> @builtin(position) vec4<f32> {
        return matrix * mesh.world * vec4<f32>(position${instanced ? " + offset.xyz" : ""}, 1.0);
      }
      @fragment fn fragmentMain(@builtin(position) position: vec4<f32>) {
        let noise = fract(52.9829189 * fract(dot(floor(position.xy), vec2<f32>(0.06711056, 0.00583715))));
        if (mesh.highlight.w < 1.0 && noise >= mesh.highlight.w) { discard; }
      }
    `, shadowShader));
      shadowShader.code = null;
      const buffers = instanced ? shadowInstanceLayouts : shadowLayouts;
      sun[key] = device.createRenderPipeline((shadowPipeline.layout = device.createPipelineLayout((shadowPipelineLayout.bindGroupLayouts[0] = sun.meshLayout, shadowPipelineLayout.bindGroupLayouts[1] = sun.depthLayout, shadowPipelineLayout)), shadowPipeline.vertex.module = shader, shadowPipeline.vertex.buffers = buffers, shadowPipeline.fragment.module = shader, shadowPipeline));
      shadowPipelineLayout.bindGroupLayouts[0] = null;
      shadowPipelineLayout.bindGroupLayouts[1] = null;
      shadowPipeline.layout = null;
      shadowPipeline.vertex.module = null;
      shadowPipeline.vertex.buffers = null;
      shadowPipeline.fragment.module = null;
    }
  }

  // src/globals/shadowPass.js
  var shadowPass = {
    colorAttachments: [],
    depthStencilAttachment: {
      view: null,
      depthClearValue: 1,
      depthLoadOp: "clear",
      depthStoreOp: "store"
    }
  };

  // src/globals/shadowBindGroup.js
  var shadowBindGroup = {
    layout: null,
    entries: [{
      binding: 0,
      resource: {
        buffer: null,
        size: 144
      }
    }]
  };

  // src/globals/shadowOffsets.js
  var shadowOffsets = [null];

  // src/shadows/drawShadowMeshes.js
  function drawShadowMeshes(layer, encoder, meshes) {
    const renderer = rendererByLayer.get(layer), device = renderer.device, sun = renderer.sunlight;
    const pass = encoder.beginRenderPass((shadowPass.depthStencilAttachment.view = sun.texture.createView(), shadowPass));
    shadowPass.depthStencilAttachment.view = null;
    let pipeline = sun.pipeline;
    pass.setPipeline(pipeline);
    pass.setBindGroup(1, sun.depthBindGroup);
    let mesh, attributes, instances, nextPipeline, offset, attribute, index, range;
    for (mesh of meshes) {
      attributes = mesh.geometry.attributes;
      instances = attributes.instanceOffset;
      nextPipeline = instances ? sun.instancePipeline : sun.pipeline;
      if (nextPipeline !== pipeline) {
        pipeline = nextPipeline;
        pass.setPipeline(pipeline);
      }
      offset = renderer.uniformSlot++ * 256;
      renderer.uniformData.set(mesh.worldMatrix, offset / 4);
      renderer.uniformData[offset / 4 + 35] = mesh._appearance ?? 1;
      if (mesh._shadowBuffer !== renderer.uniformBuffer) {
        mesh._shadowBuffer = renderer.uniformBuffer;
        mesh._shadowBindGroup = device.createBindGroup((shadowBindGroup.layout = sun.meshLayout, shadowBindGroup.entries[0].resource.buffer = renderer.uniformBuffer, shadowBindGroup));
        shadowBindGroup.layout = null;
        shadowBindGroup.entries[0].resource.buffer = null;
      }
      for (attribute of Object.values(attributes)) {
        if (attribute.needsUpdate) {
          device.queue.writeBuffer(attribute.buffer, 0, attribute.data);
          attribute.needsUpdate = false;
        }
      }
      pass.setBindGroup(0, mesh._shadowBindGroup, (shadowOffsets[0] = offset, shadowOffsets));
      pass.setVertexBuffer(0, attributes.position.buffer);
      if (instances) pass.setVertexBuffer(1, instances.buffer);
      index = attributes.index, range = mesh.geometry.drawRange;
      if (index) {
        pass.setIndexBuffer(index.buffer, index.indexFormat);
        pass.drawIndexed(range.count, instances?.count ?? 1, range.start, 0, 0);
      } else pass.draw(range.count, instances?.count ?? 1, range.start, 0);
    }
    pass.end();
  }

  // src/globals/shadowTexture.js
  var shadowTexture = {
    size: [null, null],
    format: "depth32float",
    usage: null
  };

  // src/shadows/resizeSunlight.js
  function resizeSunlight(layer, size) {
    const device = rendererByLayer.get(layer).device, sun = rendererByLayer.get(layer).sunlight;
    if (sun.size === size) return;
    if (sun.texture) destroyTexture(layer, sun.texture);
    sun.size = size;
    sun.texture = device.createTexture((shadowTexture.size[0] = size, shadowTexture.size[1] = size, shadowTexture.usage = GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_SRC, shadowTexture));
    bindSunlight(layer);
  }

  // src/shadows/renderSunlight.js
  function renderSunlight(layer, encoder, meshes, sunlight) {
    const renderer = rendererByLayer.get(layer), device = renderer.device, sun = renderer.sunlight;
    if (!meshes.length || !sunlight || sunlight.altitude < 3) {
      if (!sun.enabled) return;
      device.queue.writeBuffer(sun.buffer, 0, disabledShadow);
      sun.enabled = false;
      sun.cache = null;
      return;
    }
    if (shadowCacheMatches(sun, meshes, sunlight)) return;
    const values = shadowValues;
    sun.enabled = true;
    resizeSunlight(layer, Math.min(2048, device.limits.maxTextureDimension2D));
    values.set(shadowMatrix(meshes, sunlight));
    values[16] = 1;
    device.queue.writeBuffer(sun.buffer, 0, values);
    ensureShadowPipeline(device, sun);
    let mesh;
    for (mesh of meshes) {
      if (mesh.geometry.attributes.instanceOffset) {
        ensureShadowPipeline(device, sun, true);
        break;
      }
    }
    drawShadowMeshes(layer, encoder, meshes);
    const snapshots = (
      /* alloc */
      /* @__PURE__ */ new Map()
    );
    let mesh2;
    for (mesh2 of meshes) {
      snapshots.set(
        mesh2,
        /* alloc */
        {
          world: mesh2._worldMatrixVersion,
          geometry: mesh2.geometry,
          start: mesh2.geometry.drawRange.start,
          count: mesh2.geometry.drawRange.count,
          appearance: mesh2._appearance ?? 1
        }
      );
    }
    sun.cache = /* alloc */
    { direction: (
      /* alloc */
      [...sunlight.direction]
    ), meshes: snapshots };
  }

  // src/scene/cancelUpdate.js
  function cancelUpdate(layer) {
    const frame = frameByLayer.get(layer);
    pendingUpdates.delete(layer);
    frameByLayer.set(layer, null);
    if (!pendingUpdates.size && frame != null) {
      cancelAnimationFrame(frame);
    }
  }

  // src/weakmaps/pruneAfterByLayer.js
  var pruneAfterByLayer = /* @__PURE__ */ new WeakMap();

  // src/weakmaps/pruneVersionByLayer.js
  var pruneVersionByLayer = /* @__PURE__ */ new WeakMap();

  // src/weakmaps/pruneWantedByLayer.js
  var pruneWantedByLayer = /* @__PURE__ */ new WeakMap();

  // src/weakmaps/terrain3DByLayer.js
  var terrain3DByLayer = /* @__PURE__ */ new WeakMap();

  // src/weakmaps/terrainRequestByLayer.js
  var terrainRequestByLayer = /* @__PURE__ */ new WeakMap();

  // src/scene/setParent.js
  function setParent(node, parent) {
    if (node.parent) node.parent.children.splice(node.parent.children.indexOf(node), 1);
    node.parent = parent;
    if (parent) parent.children.push(node);
  }

  // src/raster/removeRasterTile.js
  function removeRasterTile(layer, tile) {
    terrainRequestByLayer.get(layer)?.abort();
    const mesh = rasterTilesByLayer.get(layer).get(tile);
    if (!mesh) return;
    setParent(mesh, null);
    update(layer);
    if (mesh.texture !== tile.texture) destroyTexture(layer, mesh.texture.texture);
    rasterTilesByLayer.get(layer).delete(tile);
  }

  // src/raster/releaseRasterTile.js
  function releaseRasterTile(layer, tile) {
    const key = `${tile.coords.z}/${tile.coords.x}/${tile.coords.y}`;
    if (rasterTilesByLayer.get(layer).get(key) !== tile) return;
    rasterTilesByLayer.get(layer).delete(key);
    rasterVersionByLayer.set(layer, (rasterVersionByLayer.get(layer) || 0) + 1);
    tile.request.abort();
    if (terrain3DByLayer.get(layer)) removeRasterTile(terrain3DByLayer.get(layer), tile);
    if (tile.mesh) setParent(tile.mesh, null);
    if (tile.texture) destroyTexture(layer, tile.texture.texture);
    tile.image?.close();
    layer.fire(
      "tileunload",
      /* alloc */
      { tile, coords: tile.coords }
    );
    update(layer);
  }

  // src/raster/pruneRasterTiles.js
  function pruneRasterTiles(layer) {
    const wanted = wantedRasterTilesByLayer.get(layer);
    const now = performance.now();
    if (pruneVersionByLayer.get(layer) === rasterVersionByLayer.get(layer) && pruneWantedByLayer.get(layer) === wanted && now < pruneAfterByLayer.get(layer)) return Number.isFinite(pruneAfterByLayer.get(layer));
    pruneVersionByLayer.set(layer, rasterVersionByLayer.get(layer));
    pruneWantedByLayer.set(layer, wanted);
    pruneAfterByLayer.set(layer, Infinity);
    const pending = (
      /* alloc */
      []
    );
    let key, tile, parts2, overlaps, coords, zoom;
    for (key of wanted) {
      tile = rasterTilesByLayer.get(layer).get(key);
      if (tile?.done && now - tile.loadedAt < 250) {
        pruneAfterByLayer.set(layer, Math.min(pruneAfterByLayer.get(layer), tile.loadedAt + 250));
      }
      if (!tile?.done || now - tile.loadedAt < 250) {
        parts2 = key.split("/");
        pending.push(
          /* alloc */
          { z: Number(parts2[0]), x: Number(parts2[1]), y: Number(parts2[2]) }
        );
      }
    }
    for ([key, tile] of rasterTilesByLayer.get(layer)) {
      if (wanted.has(key)) continue;
      overlaps = false;
      for (coords of pending) {
        zoom = Math.min(coords.z, tile.coords.z);
        if (Math.floor(coords.x / 2 ** (coords.z - zoom)) === Math.floor(tile.coords.x / 2 ** (tile.coords.z - zoom)) && Math.floor(coords.y / 2 ** (coords.z - zoom)) === Math.floor(tile.coords.y / 2 ** (tile.coords.z - zoom))) {
          overlaps = true;
          break;
        }
      }
      if (!overlaps) releaseRasterTile(layer, tile);
    }
    return Number.isFinite(pruneAfterByLayer.get(layer));
  }

  // src/native/synchronizeNativeLayer.js
  init_L();

  // src/native/isCurrentNativeLayer.js
  function current(state) {
    return nativeGPUByLayer.get(state.source) === state && state.map.hasLayer(state.source);
  }

  // src/native/prepareGridTerrainRequests.js
  function prepareGridTerrainRequests(state) {
    const stream = streamTerrainByMap.get(state.map);
    if (state.terrainStream !== stream) {
      state.terrainStream = stream;
      state.terrainRequests = stream ? (
        /* alloc */
        /* @__PURE__ */ new Map()
      ) : null;
    }
    if (state.terrainRequests) {
      let key;
      for (key of state.terrainRequests.keys()) {
        if (!state.source._tiles[key]) state.terrainRequests.delete(key);
      }
    }
    return stream;
  }

  // src/native/syncGridTile.js
  init_L();

  // src/globals/coreWhite.js
  var coreWhite = Object.freeze([1, 1, 1]);

  // src/weakmaps/cameraZIndexOffsetByLayer.js
  var cameraZIndexOffsetByLayer = /* @__PURE__ */ new WeakMap();

  // src/native/styleNativeMesh.js
  init_L();
  function styleNativeMesh(state, mesh, color, opacity) {
    const { source, marker, paneOrder, order } = state;
    mesh.program.uniforms.baseColor.value = color;
    mesh.program.uniforms.opacity.value = opacity;
    if (source instanceof L.GridLayer) mesh.opacity = opacity;
    const zIndex = marker ? source._zIndex + (cameraZIndexOffsetByLayer.get(source) || 0) : source.options.zIndex;
    mesh.renderOrder = paneOrder * 1e6 + (zIndex || 0) * 1e3 + order;
    mesh._nativeSource = source;
    mesh._nativeUsed = true;
  }

  // src/globals/coreQuadIndices.js
  var coreQuadIndices = Object.freeze([0, 2, 1, 1, 2, 3]);

  // src/globals/coreQuadUV.js
  var coreQuadUV = Object.freeze([0, 0, 1, 0, 0, 1, 1, 1]);

  // src/globals/coreSampler.js
  var coreSampler = Object.freeze({
    minFilter: "linear",
    magFilter: "linear"
  });

  // src/rendering/disposeMesh.js
  function disposeMesh(layer, mesh) {
    if (!mesh) {
      return;
    }
    setParent(mesh, null);
    update(layer);
    let attribute;
    for (attribute of Object.values(mesh.geometry.attributes)) {
      attribute.buffer.destroy();
    }
  }

  // src/textures/uploadCanvasTexture.js
  async function uploadCanvasTexture(state, key, texture, image, device, width, height) {
    let bitmap, source = image;
    try {
      if (image instanceof HTMLImageElement) {
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const context = canvas.getContext("2d");
        if (!context) throw (
          /* alloc */
          new Error("Unable to rasterize SVG image")
        );
        context.drawImage(image, 0, 0, width, height);
        source = canvas;
      }
      bitmap = await createImageBitmap(source);
      if (!current(state) || state.textures.get(key) !== texture) return;
      device.queue.copyExternalImageToTexture(
        /* alloc */
        { source: bitmap },
        /* alloc */
        { texture: texture.texture },
        /* alloc */
        [width, height]
      );
      texture.uploaded = image;
      texture.pending = false;
      refreshNativeLayer(state);
    } catch (error) {
      state.failed = true;
      state.source.fire(
        "error",
        /* alloc */
        { error }
      );
    } finally {
      bitmap?.close();
    }
  }

  // src/textures/uploadNativeImage.js
  function uploadNativeImage(state, key, texture, image, device, width, height) {
    try {
      device.queue.copyExternalImageToTexture(
        /* alloc */
        { source: image },
        /* alloc */
        { texture: texture.texture },
        /* alloc */
        [width, height]
      );
    } catch (error) {
      texture.texture.destroy();
      state.textures.delete(key);
      throw error;
    }
    texture.uploaded = image;
  }

  // src/textures/nativeTextureFor.js
  function textureFor(state, key, image) {
    if (!(image instanceof HTMLImageElement) && !(image instanceof HTMLCanvasElement)) {
      throw (
        /* alloc */
        new Error("WebGPU native raster layers require image or canvas tiles")
      );
    }
    const { backend: layer, textures, meshes } = state;
    let texture = textures.get(key);
    const url = image.currentSrc || image.src;
    if (!texture || texture.image !== image || texture.url !== url) {
      if (texture) {
        disposeMesh(layer, meshes.get(key));
        meshes.delete(key);
        destroyTexture(layer, texture.texture);
        textures.delete(key);
      }
      const width = image.naturalWidth || image.width, height = image.naturalHeight || image.height;
      if (!width || !height) return;
      const { device } = rendererByLayer.get(layer);
      texture = /* alloc */
      {
        device,
        image,
        url,
        format: "rgba8unorm",
        uploaded: null,
        texture: device.createTexture(
          /* alloc */
          {
            size: (
              /* alloc */
              [width, height]
            ),
            format: "rgba8unorm",
            usage: GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_DST | GPUTextureUsage.RENDER_ATTACHMENT
          }
        ),
        sampler: device.createSampler(coreSampler)
      };
      textures.set(key, texture);
      if (image instanceof HTMLCanvasElement || url.startsWith("data:image/svg+xml")) {
        texture.pending = true;
        uploadCanvasTexture(state, key, texture, image, device, width, height);
      } else {
        uploadNativeImage(state, key, texture, image, device, width, height);
      }
    }
    texture.used = true;
    return texture.uploaded === image ? texture : void 0;
  }

  // src/native/putNativeMesh.js
  init_L();

  // src/native/createNativeMesh.js
  init_L();

  // src/globals/defaultMaterial.js
  var defaultMaterial = Object.freeze({});

  // src/globals/meshBuffer.js
  var meshBuffer = {
    size: null,
    usage: null
  };

  // src/globals/nextId.js
  var nextId = { value: 0 };

  // src/scene/createSceneNode.js
  function emptyNode() {
    return (
      /* alloc */
      {
        position: (
          /* alloc */
          [0, 0, 0]
        ),
        rotation: (
          /* alloc */
          [0, 0, 0]
        ),
        scale: (
          /* alloc */
          [1, 1, 1]
        ),
        worldMatrix: (
          /* alloc */
          [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]
        ),
        children: (
          /* alloc */
          []
        ),
        highlightRange: (
          /* alloc */
          [0, 0]
        ),
        visible: true
      }
    );
  }

  // src/globals/vertexShader.js
  var vertexShader = {
    code: null
  };

  // src/globals/fragmentShader.js
  var fragmentShader = {
    code: null
  };

  // src/globals/pipelineLayout.js
  var pipelineLayout = {
    bindGroupLayouts: [null, null]
  };

  // src/globals/elevationWGSL.js
  var elevationWGSL = (
    /* wgsl */
    `
  fn demSample(pixel: vec2<i32>) -> f32 {
    if (any(pixel < vec2<i32>(0)) || any(pixel >= vec2<i32>(textureDimensions(dem)))) { return -1e9; }
    return textureLoad(dem, pixel, 0).r;
  }
  fn elevation(pixel: vec2<f32>, base: f32) -> f32 {
    let p = pixel - vec2<f32>(0.5);
    let f = fract(p);
    let i = vec2<i32>(floor(p));
    let v00 = demSample(i);
    let v10 = demSample(i + vec2<i32>(1, 0));
    let v01 = demSample(i + vec2<i32>(0, 1));
    let v11 = demSample(i + vec2<i32>(1, 1));
    if (v00 > -1000.0 && v10 > -1000.0 && v01 > -1000.0 && v11 > -1000.0) {
      return mix(mix(v00, v10, f.x), mix(v01, v11, f.x), f.y);
    }
    if (v00 > -1000.0) { return v00; }
    if (v10 > -1000.0) { return v10; }
    if (v01 > -1000.0) { return v01; }
    if (v11 > -1000.0) { return v11; }
    return base;
  }
`
  );

  // src/globals/normalLayout.js
  var normalLayout = Object.freeze({
    arrayStride: 12,
    attributes: Object.freeze([Object.freeze({
      shaderLocation: 1,
      offset: 0,
      format: "float32x3"
    })])
  });

  // src/globals/colorLayout.js
  var colorLayout = Object.freeze({
    arrayStride: 12,
    attributes: Object.freeze([Object.freeze({
      shaderLocation: 2,
      offset: 0,
      format: "float32x3"
    })])
  });

  // src/globals/uVLayout.js
  var uVLayout = Object.freeze({
    arrayStride: 8,
    attributes: Object.freeze([Object.freeze({
      shaderLocation: 3,
      offset: 0,
      format: "float32x2"
    })])
  });

  // src/globals/programLayout.js
  var programLayout = {
    entries: null
  };

  // src/globals/programEntries.js
  var programEntries = [];

  // src/globals/meshLayoutEntry.js
  var meshLayoutEntry = {
    binding: 0,
    visibility: null,
    buffer: {
      type: "uniform",
      hasDynamicOffset: true
    }
  };

  // src/globals/frameLayoutEntry.js
  var frameLayoutEntry = {
    binding: 1,
    visibility: null,
    buffer: {
      type: "uniform"
    }
  };

  // src/globals/terrainLayoutEntry.js
  var terrainLayoutEntry = {
    binding: 2,
    visibility: null,
    texture: {
      sampleType: "unfilterable-float",
      viewDimension: "2d"
    }
  };

  // src/globals/textureLayoutEntries.js
  var textureLayoutEntries = [
    {
      binding: null,
      visibility: null,
      texture: {
        sampleType: "float",
        viewDimension: "2d"
      }
    },
    {
      binding: null,
      visibility: null,
      texture: {
        sampleType: "float",
        viewDimension: "2d"
      }
    },
    {
      binding: null,
      visibility: null,
      texture: {
        sampleType: "float",
        viewDimension: "2d"
      }
    },
    {
      binding: null,
      visibility: null,
      texture: {
        sampleType: "float",
        viewDimension: "2d"
      }
    },
    {
      binding: null,
      visibility: null,
      texture: {
        sampleType: "float",
        viewDimension: "2d"
      }
    }
  ];

  // src/globals/samplerLayoutEntries.js
  var samplerLayoutEntries = [
    {
      binding: null,
      visibility: null,
      sampler: {
        type: "filtering"
      }
    },
    {
      binding: null,
      visibility: null,
      sampler: {
        type: "filtering"
      }
    },
    {
      binding: null,
      visibility: null,
      sampler: {
        type: "filtering"
      }
    },
    {
      binding: null,
      visibility: null,
      sampler: {
        type: "filtering"
      }
    },
    {
      binding: null,
      visibility: null,
      sampler: {
        type: "filtering"
      }
    }
  ];

  // src/materials/createProgramLayout.js
  function createProgramLayout(device, shaders) {
    const bindGroupEntries = programEntries;
    bindGroupEntries.length = 0;
    meshLayoutEntry.visibility = GPUShaderStage.VERTEX | GPUShaderStage.FRAGMENT;
    frameLayoutEntry.visibility = GPUShaderStage.VERTEX | GPUShaderStage.FRAGMENT;
    bindGroupEntries.push(meshLayoutEntry, frameLayoutEntry);
    if (shaders.hasTerrain) {
      terrainLayoutEntry.visibility = GPUShaderStage.VERTEX;
      bindGroupEntries.push(terrainLayoutEntry);
    }
    let texture, entry, index = 0;
    for (texture of shaders.bindings) {
      entry = textureLayoutEntries[index];
      entry.binding = texture.texture;
      entry.visibility = GPUShaderStage.FRAGMENT;
      bindGroupEntries.push(entry);
      entry = samplerLayoutEntries[index++];
      entry.binding = texture.sampler;
      entry.visibility = GPUShaderStage.FRAGMENT;
      bindGroupEntries.push(entry);
    }
    const layout = device.createBindGroupLayout((programLayout.entries = bindGroupEntries, programLayout));
    programLayout.entries = null;
    return layout;
  }

  // src/materials/createProgramUniforms.js
  function createProgramUniforms(material) {
    const uniforms = (
      /* alloc */
      {
        baseColor: (
          /* alloc */
          { value: material.color || /* alloc */
          [1, 1, 1] }
        ),
        metallic: (
          /* alloc */
          { value: material.metallic ?? 0 }
        ),
        roughness: (
          /* alloc */
          { value: material.roughness ?? 0.85 }
        ),
        opacity: (
          /* alloc */
          { value: material.opacity ?? 1 }
        ),
        alphaCutoff: (
          /* alloc */
          { value: material.alphaCutoff ?? 0.5 }
        ),
        occlusionStrength: (
          /* alloc */
          { value: material.occlusionStrength ?? 1 }
        ),
        emissive: (
          /* alloc */
          { value: material.emissive || /* alloc */
          [0, 0, 0] }
        )
      }
    );
    if (material.baseTexture) uniforms.baseTexture = /* alloc */
    { value: material.baseTexture };
    if (material.metalTexture) uniforms.metalTexture = /* alloc */
    { value: material.metalTexture };
    if (material.emissiveTexture) uniforms.emissiveTexture = /* alloc */
    { value: material.emissiveTexture };
    if (material.occlusionTexture) uniforms.occlusionTexture = /* alloc */
    { value: material.occlusionTexture };
    if (material.roofTexture || material.wallTexture) uniforms.roofTexture = /* alloc */
    { value: null };
    if (material.nativeStroke) uniforms.strokeScale = /* alloc */
    { value: 1 };
    return uniforms;
  }

  // src/textures/textureBinding.js
  function textureBinding(bindings, name, enabled) {
    if (!enabled) return "";
    const current2 = 3 + bindings.length * 2;
    bindings.push(
      /* alloc */
      { name, texture: current2, sampler: current2 + 1 }
    );
    return (
      /* wgsl */
      `@group(0) @binding(${current2}) var ${name}: texture_2d<f32>;
      @group(0) @binding(${current2 + 1}) var ${name}Sampler: sampler;`
    );
  }

  // src/materials/validateRoofMaterial.js
  function validateRoofMaterial(material) {
    let name, value;
    for (
      name of
      /* alloc */
      ["roofTexture", "wallTexture"]
    ) {
      value = material[name];
      if (value !== void 0 && typeof value !== "boolean" && (!Number.isFinite(value) || value < 0 || value > 1)) {
        throw (
          /* alloc */
          new Error(`${name} must be a boolean or a finite number between 0 and 1`)
        );
      }
    }
  }

  // src/shaders/roofVertexShader.js
  function roofVertexShader(material) {
    const roofOpacity = Number(material.roofTexture ?? 0);
    const wallOpacity = Number(material.wallTexture ?? 0);
    return (
      /* wgsl */
      `
        output.roofUv = (frame.roofMatrix * world).xz;
        output.roof = select(0.0, select(${wallOpacity.toFixed(8)}, ${roofOpacity.toFixed(8)}, input.normal.y >= 0.5), ((${Boolean(material.roofTexture)} && input.normal.y >= 0.5) ||
          (${Boolean(material.wallTexture)} && abs(input.normal.y) < 0.5)) && !highlighted);
      `
    );
  }

  // src/shaders/nativeStrokeShader.js
  function nativeStrokeShader(material) {
    return (
      /* alloc */
      {
        position: material.nativeStroke ? "position = input.normal + (input.position - input.normal) * u.nativeStroke.x;" : "",
        normal: material.nativeStroke ? "let sourceNormal = vec3<f32>(0.0, 1.0, 0.0);" : "let sourceNormal = input.normal;"
      }
    );
  }

  // src/shaders/materialVertexShader.js
  function materialVertexShader(material, sparkle, elevationWGSL2, hasTerrain, textured, hasRoof) {
    const instanceOffset = material.instanced ? " + input.instanceOffset.xyz" : "";
    const stroke = nativeStrokeShader(material);
    return (
      /* wgsl */
      `
    struct Mesh {
      worldMatrix: mat4x4<f32>,
      baseColor: vec4<f32>,
      material: vec4<f32>,
      emissive: vec4<f32>,
      terrain: vec4<f32>,
      highlight: vec4<f32>,
      cutout: vec4<f32>,
      nativeStroke: vec4<f32>,
    };
    struct Frame {
      viewMatrix: mat4x4<f32>,
      projectionMatrix: mat4x4<f32>,
      roofMatrix: mat4x4<f32>,
      lightDirection: vec4<f32>,
      skyDirection: vec4<f32>,
      atmosphereTint: vec4<f32>,
    };
    struct Solar {
      matrix: mat4x4<f32>,
      params: vec4<f32>
    };
    struct VertexInput {
      @location(0) position: vec3<f32>,
      @location(1) normal: vec3<f32>,
      ${material.instanced ? "@location(4) instanceOffset: vec4<f32>," : ""}
      ${material.vertexColors ? "@location(2) color: vec3<f32>," : ""}
      ${textured ? "@location(3) uv: vec2<f32>," : ""}
    };
    struct VertexOutput {
      @builtin(position) position: vec4<f32>,
      @location(0) color: vec3<f32>,
      @location(1) normal: vec3<f32>,
      @location(2) viewPosition: vec3<f32>,
      @location(6) shadowPosition: vec4<f32>,
      @location(7) worldPosition: vec3<f32>,
      ${sparkle ? "@location(8) localPosition: vec3<f32>," : ""}
      ${textured ? "@location(3) uv: vec2<f32>," : ""}
      ${hasRoof ? "@location(4) roofUv: vec2<f32>, @location(5) roof: f32," : ""}
    };
    @group(0) @binding(0) var<uniform> u: Mesh;
    @group(0) @binding(1) var<uniform> frame: Frame;
    @group(1) @binding(0) var<uniform> solar: Solar;
    ${hasTerrain ? (
        /* wgsl */
        `@group(0) @binding(2) var dem: texture_2d<f32>;${elevationWGSL2}`
      ) : ""}
    @vertex fn vertexMain(input: VertexInput, @builtin(vertex_index) vertexIndex: u32) -> VertexOutput {
      var output: VertexOutput;
      var position = input.position${instanceOffset};
      ${stroke.position}
      ${hasTerrain ? "position.y = elevation(u.terrain.xy + input.uv * u.terrain.z, u.terrain.w) - u.terrain.w;" : ""}
      let featureVertex = f32(vertexIndex)${material.instanced ? " + input.instanceOffset.w" : ""};
      let highlighted = featureVertex >= u.highlight.x && featureVertex < u.highlight.y;
      output.color = ${material.vertexColors ? "select(input.color, vec3<f32>(72.0 / 255.0, 217.0 / 255.0, 1.0), highlighted)" : "u.baseColor.rgb"};
      // Inverse-transpose from cofactors; the camera view matrix is orthonormal.
      let m = mat3x3<f32>(u.worldMatrix[0].xyz, u.worldMatrix[1].xyz, u.worldMatrix[2].xyz);
      ${stroke.normal}
      let normal = (cross(m[1], m[2]) * sourceNormal.x + cross(m[2], m[0]) * sourceNormal.y + cross(m[0], m[1]) * sourceNormal.z) / determinant(m);
      output.normal = (frame.viewMatrix * vec4<f32>(normal, 0.0)).xyz;
      let world = u.worldMatrix * vec4<f32>(position, 1.0);
      output.shadowPosition = solar.matrix * world;
      output.worldPosition = world.xyz / world.w;
      ${sparkle ? `output.localPosition = input.position${instanceOffset};` : ""}
      let viewPosition = frame.viewMatrix * world;
      output.viewPosition = viewPosition.xyz;
      ${textured ? "output.uv = input.uv;" : ""}
      ${hasRoof ? roofVertexShader(material) : ""}
      output.position = frame.projectionMatrix * viewPosition;
      return output;
    }
  `
    );
  }

  // src/shaders/materialBaseShader.js
  function materialBaseShader(material, hasBase, hasRoof) {
    return (
      /* wgsl */
      `
      var normal = normalize(input.normal) * select(-1.0, 1.0, frontFacing);
      let texel = ${hasBase ? "textureSample(baseTexture, baseTextureSampler, input.uv)" : "vec4<f32>(1.0)"};
      let alpha = u.material.z * texel.a;
      ${material.alphaMode === "MASK" ? "if (alpha < u.material.w) { discard; }" : ""}
      ${material.alphaMode === "BLEND" ? "if (alpha < 0.01) { discard; }" : ""}
      var base = ${material.vertexColors ? "toLinear(min(input.color, vec3<f32>(1.0)))" : "input.color"} *
        ${material.baseTexture?.srgb ? "texel.rgb" : "toLinear(texel.rgb)"};
      ${hasRoof ? (
        /* wgsl */
        `
        if (input.roof > 0.0 && all(input.roofUv >= vec2<f32>(0.0)) &&
          all(input.roofUv <= vec2<f32>(1.0))) {
          let roof = textureSampleLevel(roofTexture, roofTextureSampler, input.roofUv, 0.0);
          base = mix(base, toLinear(roof.rgb), roof.a * input.roof);
        }
      `
      ) : ""}`
    );
  }

  // src/shaders/materialSurfaceShader.js
  function materialSurfaceShader(material, sparkle, hasBase, hasMetal, hasEmissive, hasOcclusion, hasRoof) {
    return material.unlit ? (
      /* wgsl */
      `
        let rasterTexel = ${hasBase ? "textureSample(baseTexture, baseTextureSampler, input.uv)" : "vec4<f32>(input.color, 1.0)"};
        return vec4<f32>(toSRGB(toLinear(rasterTexel.rgb) * (frame.atmosphereTint.rgb * (0.55 + 0.45 * sunlight) + artificial)), ${material.alphaMode === "BLEND" ? "u.material.z * rasterTexel.a" : "1.0"});
      `
    ) : (
      /* wgsl */
      `${materialBaseShader(material, hasBase, hasRoof)}
      let mr = ${hasMetal ? "textureSample(metalTexture, metalTextureSampler, input.uv)" : "vec4<f32>(1.0)"};
      let metal = clamp(u.material.x * mr.b, 0.0, 1.0);
      let rough = clamp(u.material.y * mr.g, 0.08, 1.0);
      let view = normalize(-input.viewPosition);
      let halfVector = normalize(view + frame.lightDirection.xyz);
      let nl = max(dot(normal, frame.lightDirection.xyz), 0.0) * frame.lightDirection.w * sunlight;
      let nv = max(dot(normal, view), 0.001);
      let nh = max(dot(normal, halfVector), 0.0);
      let vh = max(dot(view, halfVector), 0.0);
      let a2 = pow(rough, 4.0);
      let d = a2 / max(PI * pow(nh * nh * (a2 - 1.0) + 1.0, 2.0), 0.0001);
      let gv = nl * sqrt(nv * nv * (1.0 - a2) + a2);
      let gl = nv * sqrt(nl * nl * (1.0 - a2) + a2);
      let visibility = 0.5 / max(gv + gl, 0.0001);
      let f0 = mix(vec3<f32>(0.04), base, metal);
      let fresnel = f0 + (1.0 - f0) * pow(1.0 - vh, 5.0);
      let specular = d * visibility * fresnel;
      let diffuse = (1.0 - metal) * base / PI;
      let sky = dot(normal, frame.skyDirection.xyz) * 0.5 + 0.5;
      let ambient = mix(toLinear(vec3<f32>(0.455, 0.412, 0.322)), vec3<f32>(1.0), sky) * (2.0 / PI);
      let ao = ${hasOcclusion ? "mix(1.0, textureSample(occlusionTexture, occlusionTextureSampler, input.uv).r, u.emissive.w)" : "1.0"};
      ${sparkle ? (
        /* wgsl */
        `
        let lattice = (fract(input.localPosition / 2.5) - 0.5) * 2.5;
        let pointGlow = (1.0 - smoothstep(0.16, 0.42, length(lattice))) * u.highlight.z;
      `
      ) : ""}
      // Vertex colour components above 1 are self-lit (e.g. vehicle lamps): dim by day, bright at night.
      let glow = ${sparkle ? "vec3<f32>(3.0, 2.6, 1.8) * pointGlow +" : ""}${material.vertexColors ? " max(input.color - vec3<f32>(1.0), vec3<f32>(0.0)) * (0.3 + 5.0 * frame.skyDirection.w) +" : ""} u.emissive.rgb * ${hasEmissive ? material.emissiveTexture.srgb ? "textureSample(emissiveTexture, emissiveTextureSampler, input.uv).rgb" : "toLinear(textureSample(emissiveTexture, emissiveTextureSampler, input.uv).rgb)" : "vec3<f32>(1.0)"};
      var color = ambient * base * (1.0 - metal) * ao +
        (diffuse + specular) * nl * toLinear(vec3<f32>(1.0, 0.937, 0.835)) * 3.0 + glow;
      ${material.vertexColors ? "color = base * (ambient + toLinear(vec3<f32>(1.0, 0.937, 0.835)) * (3.0 / PI) * nl) + glow;" : ""}
      color = (color - glow) * frame.atmosphereTint.rgb + base * artificial * (1.0 - metal * 0.5) + glow;
      appearance(input.position.xy);
      return vec4<f32>(toSRGB(color), ${material.alphaMode === "BLEND" ? "alpha" : "1.0"});
      `
    );
  }

  // src/shaders/materialShaders.js
  function materialShaders(material = defaultMaterial, sparkle = false, elevationWGSL2 = "") {
    const hasBase = Boolean(material.baseTexture);
    const hasMetal = Boolean(material.metalTexture);
    const hasEmissive = Boolean(material.emissiveTexture);
    const hasOcclusion = Boolean(material.occlusionTexture);
    const hasRoof = Boolean(material.roofTexture || material.wallTexture);
    validateRoofMaterial(material);
    const hasTerrain = Boolean(material.terrain);
    const textured = hasBase || hasMetal || hasEmissive || hasOcclusion || material.nightLight;
    const vertex = materialVertexShader(material, sparkle, elevationWGSL2, hasTerrain, textured, hasRoof);
    const bindings = (
      /* alloc */
      []
    );
    const baseBinding = textureBinding(bindings, "baseTexture", hasBase);
    const metalBinding = textureBinding(bindings, "metalTexture", hasMetal);
    const emissiveBinding = textureBinding(bindings, "emissiveTexture", hasEmissive);
    const occlusionBinding = textureBinding(bindings, "occlusionTexture", hasOcclusion);
    const roofBinding = textureBinding(bindings, "roofTexture", hasRoof);
    const fragment = (
      /* wgsl */
      `
    struct Mesh {
      worldMatrix: mat4x4<f32>,
      baseColor: vec4<f32>,
      material: vec4<f32>,
      emissive: vec4<f32>,
      terrain: vec4<f32>,
      highlight: vec4<f32>,
      cutout: vec4<f32>,
      nativeStroke: vec4<f32>,
    };
    struct Frame {
      viewMatrix: mat4x4<f32>,
      projectionMatrix: mat4x4<f32>,
      roofMatrix: mat4x4<f32>,
      lightDirection: vec4<f32>,
      skyDirection: vec4<f32>,
      atmosphereTint: vec4<f32>,
    };
    struct Solar {
      matrix: mat4x4<f32>,
      params: vec4<f32>,
    };
    @group(0) @binding(0) var<uniform> u: Mesh;
    @group(0) @binding(1) var<uniform> frame: Frame;
    @group(1) @binding(0) var<uniform> solar: Solar;
    @group(1) @binding(1) var shadowTexture: texture_depth_2d;
    @group(1) @binding(2) var shadowSampler: sampler_comparison;
    @group(1) @binding(3) var<storage, read> lightGrid: array<vec4<f32>>;
    ${baseBinding}${metalBinding}${emissiveBinding}${occlusionBinding}${roofBinding}
    struct FragmentInput {
      @builtin(position) position: vec4<f32>,
      @location(0) color: vec3<f32>,
      @location(1) normal: vec3<f32>,
      @location(2) viewPosition: vec3<f32>,
      @location(6) shadowPosition: vec4<f32>,
      @location(7) worldPosition: vec3<f32>,
      ${sparkle ? "@location(8) localPosition: vec3<f32>," : ""}
      ${textured ? "@location(3) uv: vec2<f32>," : ""}
      ${hasRoof ? "@location(4) roofUv: vec2<f32>, @location(5) roof: f32," : ""}
    };
    const PI: f32 = 3.14159265;
    fn toLinear(c: vec3<f32>) -> vec3<f32> {
      return select(c / 12.92, pow((c + vec3<f32>(0.055)) / 1.055, vec3<f32>(2.4)), c >= vec3<f32>(0.04045));
    }
    fn toSRGB(c: vec3<f32>) -> vec3<f32> {
      return select(c * 12.92, 1.055 * pow(max(c, vec3<f32>(0.0)), vec3<f32>(1.0 / 2.4)) - vec3<f32>(0.055), c >= vec3<f32>(0.0031308));
    }
    fn sunVisibility(position: vec4<f32>) -> f32 {
      let p = position.xyz / position.w;
      let uv = vec2<f32>(p.x * 0.5 + 0.5, 0.5 - p.y * 0.5);
      if (solar.params.x < 0.5 || any(uv < vec2<f32>(0.0)) || any(uv > vec2<f32>(1.0)) || p.z < 0.0 || p.z > 1.0) {
        return 1.0;
      }
      return textureSampleCompareLevel(shadowTexture, shadowSampler, uv, p.z - 0.0003);
    }
    fn gridLighting(position: vec3<f32>, normal: vec3<f32>, offset: u32) -> vec3<f32> {
      let grid = lightGrid[offset];
      if (grid.w < 1.0) { return vec3<f32>(0.0); }
      let cell = vec2<i32>(floor((position.xz - grid.xy) / grid.z));
      if (any(cell < vec2<i32>(0)) || cell.x >= i32(grid.w) || cell.y >= i32(lightGrid[offset + 1u].x)) {
        return vec3<f32>(0.0);
      }
      let header = lightGrid[offset + 2u + u32(cell.y) * u32(grid.w) + u32(cell.x)];
      var light = vec3<f32>(0.0);
      for (var i = 0u; i < u32(header.y); i++) {
        let source = lightGrid[offset + u32(header.x) + i * 2u];
        let colour = lightGrid[offset + u32(header.x) + i * 2u + 1u];
        let delta = source.xyz - position;
        let distance2 = max(dot(delta, delta), 1.0);
        let falloff = max(0.0, 1.0 - distance2 / (source.w * source.w));
        let lambert = max(0.0, dot(normal, delta / sqrt(distance2)));
        light += toLinear(colour.rgb) * colour.w * lambert * falloff * falloff / distance2;
      }
      return light;
    }
    fn localLighting(position: vec3<f32>, normal: vec3<f32>) -> vec3<f32> {
      if (frame.skyDirection.w <= 0.0) { return vec3<f32>(0.0); }
      var light = gridLighting(position, normal, 0u);
      let moving = u32(lightGrid[1].z);
      if (moving > 0u) { light += gridLighting(position, normal, moving); }
      return light * frame.skyDirection.w;
    }
    fn appearance(position: vec2<f32>) {
      // Screen-door dissolve keeps opaque depth writes and avoids sorting whole buildings as glass.
      let noise = fract(52.9829189 * fract(dot(floor(position), vec2<f32>(0.06711056, 0.00583715))));
      if (u.highlight.w < 1.0 && noise >= u.highlight.w) { discard; }
    }
    @fragment fn fragmentMain(input: FragmentInput, @builtin(front_facing) frontFacing: bool) -> @location(0) vec4<f32> {
      let cutoutDistance = distance(input.position.xy, u.cutout.xy);
      if (select((cutoutDistance < u.cutout.z), (cutoutDistance >= u.cutout.z), u.cutout.w > 0.0)) { discard; }
      ${material.nightLight ? (
        /* wgsl */
        `
        if (input.uv.x <= 2.0) {
        let radial = max(0.0, 1.0 - dot(input.uv, input.uv));
        let alpha = radial * radial * frame.skyDirection.w * 0.65;
        if (alpha < 0.005) { discard; }
        appearance(input.position.xy);
        return vec4<f32>(input.color, alpha);
        }
      `
      ) : ""}
      let sunlight = sunVisibility(input.shadowPosition);
      let worldNormal = normalize(transpose(mat3x3<f32>(frame.viewMatrix[0].xyz, frame.viewMatrix[1].xyz, frame.viewMatrix[2].xyz)) * normalize(input.normal)) * select(-1.0, 1.0, frontFacing);
      let artificial = localLighting(input.worldPosition, worldNormal);
      ${materialSurfaceShader(material, sparkle, hasBase, hasMetal, hasEmissive, hasOcclusion, hasRoof)}
    }
  `
    );
    return (
      /* alloc */
      { vertex, fragment, bindings, textured, hasTerrain }
    );
  }

  // src/gpu/reportShaderCompilation.js
  async function reportCompilation(layer, pending) {
    let info, message;
    try {
      const infos = await Promise.all(pending);
      let errors = "", errorCount = 0;
      for (info of infos) {
        for (message of info.messages) if (message.type === "error") errors += `${errorCount++ ? "\n" : ""}${message.message}`;
      }
      if (errorCount) {
        layer.fire(
          "error",
          /* alloc */
          {
            error: (
              /* alloc */
              new Error(`Unable to compile Layer3D WGSL: ${errors}`)
            )
          }
        );
      }
    } catch (error) {
      layer.fire(
        "error",
        /* alloc */
        { error }
      );
    }
  }

  // src/materials/createProgram.js
  function createProgram(layer, material = defaultMaterial) {
    const renderer = rendererByLayer.get(layer), { device } = renderer;
    const shaders = materialShaders(
      material,
      !!layer.options.nightSparkle,
      material.terrain ? elevationWGSL : ""
    );
    const vertex = device.createShaderModule((vertexShader.code = shaders.vertex, vertexShader));
    vertexShader.code = null;
    const fragment = device.createShaderModule((fragmentShader.code = shaders.fragment, fragmentShader));
    fragmentShader.code = null;
    reportCompilation(
      layer,
      /* alloc */
      [
        vertex.getCompilationInfo(),
        fragment.getCompilationInfo()
      ]
    );
    const vertexBuffers = (
      /* alloc */
      [
        positionLayout,
        normalLayout,
        material.vertexColors ? colorLayout : null,
        shaders.textured ? uVLayout : null
      ]
    );
    if (material.instanced) vertexBuffers.push(instanceLayout);
    const bindGroupLayout = createProgramLayout(device, shaders);
    const pipelineLayout2 = device.createPipelineLayout((pipelineLayout.bindGroupLayouts[0] = bindGroupLayout, pipelineLayout.bindGroupLayouts[1] = renderer.sunlight.layout, pipelineLayout));
    pipelineLayout.bindGroupLayouts[0] = null;
    pipelineLayout.bindGroupLayouts[1] = null;
    const uniforms = createProgramUniforms(material);
    return (
      /* alloc */
      {
        device,
        vertex,
        fragment,
        bindings: shaders.bindings,
        vertexBuffers,
        bindGroupLayout,
        pipelineLayout: pipelineLayout2,
        pipelineCache: (
          /* alloc */
          /* @__PURE__ */ new Map()
        ),
        cullMode: material.doubleSided ? "none" : "back",
        transparent: material.alphaMode === "BLEND",
        depthWrite: material.depthWrite ?? material.alphaMode !== "BLEND",
        depthTest: material.depthTest !== false,
        terrain: material.terrain,
        nightLight: Boolean(material.nightLight),
        nightSparkle: !!layer.options.nightSparkle,
        uniforms,
        _layerMaterial: material
      }
    );
  }

  // src/rendering/createMesh.js
  function createMesh(layer, data, material = defaultMaterial, usage = 0, program) {
    const { device } = rendererByLayer.get(layer), attributes = (
      /* alloc */
      {}
    );
    let name, values, array, size, buffer;
    for ([name, values] of Object.entries(data)) {
      array = /* alloc */
      new Float32Array(values);
      size = name === "uv" ? 2 : 3;
      buffer = device.createBuffer((meshBuffer.size = Math.max(4, array.byteLength), meshBuffer.usage = GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST | usage, meshBuffer));
      device.queue.writeBuffer(buffer, 0, array);
      attributes[name] = /* alloc */
      { size, data: array, count: array.length / size, buffer };
    }
    const mesh = (
      /* alloc */
      {
        ...emptyNode(),
        device,
        geometry: (
          /* alloc */
          { device, attributes, drawRange: (
            /* alloc */
            { start: 0, count: attributes.position.count }
          ) }
        ),
        program: program || createProgram(
          layer,
          /* alloc */
          { vertexColors: true, doubleSided: true, ...material }
        ),
        id: nextId.value++,
        renderOrder: 0,
        extras: (
          /* alloc */
          {}
        )
      }
    );
    setParent(mesh, rootByLayer.get(layer));
    update(layer);
    return mesh;
  }

  // src/weakmaps/nativeProgramsByRenderer.js
  var nativeProgramsByRenderer = /* @__PURE__ */ new WeakMap();

  // src/native/nativeProgram.js
  function nativeProgram(layer, material) {
    const renderer = rendererByLayer.get(layer);
    let programs = nativeProgramsByRenderer.get(renderer);
    if (!programs) {
      programs = /* alloc */
      /* @__PURE__ */ new Map();
      nativeProgramsByRenderer.set(renderer, programs);
    }
    const key = `${Boolean(material.baseTexture)}:${Boolean(material.nativeStroke)}:${Boolean(material.depthWrite)}`;
    let template = programs.get(key);
    if (!template) {
      template = createProgram(
        layer,
        /* alloc */
        { doubleSided: true, ...material }
      );
      programs.set(key, template);
    }
    return (
      /* alloc */
      { ...template, uniforms: createProgramUniforms(material), _layerMaterial: material }
    );
  }

  // src/native/createNativeMesh.js
  function createNativeMesh(state, key, position, color, opacity, texture, uv, terrain, nativeStroke) {
    const { backend: layer, source, meshes } = state;
    const normal = nativeStroke ? state.strokeAnchors : (
      /* alloc */
      []
    );
    let index, mesh = meshes.get(key);
    if (!nativeStroke) {
      for (index = 0; index < position.length; index++) normal.push(index % 3 === 1 ? 1 : 0);
    }
    const data = (
      /* alloc */
      { position, normal }
    );
    if (uv) data.uv = uv;
    const material = (
      /* alloc */
      {
        vertexColors: false,
        color,
        opacity,
        unlit: true,
        alphaMode: "BLEND",
        depthWrite: terrain,
        nativeStroke
      }
    );
    if (texture) material.baseTexture = texture;
    if (mesh) disposeMesh(layer, mesh);
    mesh = createMesh(layer, data, material, 0, source instanceof L.GridLayer ? (terrain ? state.terrainRasterProgram : state.rasterProgram) || nativeProgram(layer, material) : nativeProgram(layer, material));
    if (source instanceof L.GridLayer) {
      if (terrain) state.terrainRasterProgram ||= mesh.program;
      else state.rasterProgram ||= mesh.program;
      mesh.texture = texture;
    }
    meshes.set(key, mesh);
    return mesh;
  }

  // src/native/updateNativeStrokeRadius.js
  function updateNativeStrokeRadius(mesh) {
    const attributes = mesh.geometry.attributes, positions = attributes.position.data, anchors = attributes.normal.data;
    let i, radius = 0;
    for (i = 0; i < positions.length; i += 3) {
      radius = Math.max(radius, Math.hypot(
        positions[i] - anchors[i],
        positions[i + 1] - anchors[i + 1],
        positions[i + 2] - anchors[i + 2]
      ));
    }
    mesh.geometry.nativeStrokeRadius = radius;
  }

  // src/native/putNativeMesh.js
  function putNativeMesh(state, key, position, color, opacity, texture, uv, terrain = false) {
    const { source, meshes } = state;
    if (!position.length) return;
    const nativeStroke = key === "stroke" && Boolean(state.strokeCoordinates) && source.options.interactive === false;
    let mesh = meshes.get(key);
    if (!mesh || mesh.geometry.attributes.position.data.length !== position.length || source instanceof L.GridLayer && mesh.program.depthWrite !== terrain || mesh.program.uniforms.baseTexture?.value !== texture || Boolean(mesh.program._layerMaterial.nativeStroke) !== nativeStroke) {
      mesh = createNativeMesh(state, key, position, color, opacity, texture, uv, terrain, nativeStroke);
    } else {
      const attribute = mesh.geometry.attributes.position;
      attribute.data.set(position);
      attribute.needsUpdate = true;
      mesh.geometry.bounds = null;
      if (nativeStroke) {
        mesh.geometry.attributes.normal.data.set(state.strokeAnchors);
        mesh.geometry.attributes.normal.needsUpdate = true;
      }
    }
    if (nativeStroke) updateNativeStrokeRadius(mesh);
    if (mesh.program.uniforms.strokeScale) mesh.program.uniforms.strokeScale.value = 1;
    styleNativeMesh(state, mesh, color, opacity);
    return mesh;
  }

  // src/native/quadNativeMesh.js
  function quadNativeMesh(state, key, image, corners, opacity) {
    const texture = textureFor(state, key, image);
    if (!texture) return;
    const indices = coreQuadIndices;
    const position = (
      /* alloc */
      []
    );
    const uv = (
      /* alloc */
      []
    );
    let index;
    for (index of indices) {
      position.push(...corners[index]);
      uv.push(coreQuadUV[index * 2], coreQuadUV[index * 2 + 1]);
    }
    return putNativeMesh(state, key, position, coreWhite, opacity, texture, uv);
  }

  // src/weakmaps/locationByLayer.js
  var locationByLayer = /* @__PURE__ */ new WeakMap();

  // src/projections/localPosition.js
  init_radians();
  function localPosition(state, latlng) {
    const { map, backend: layer } = state, crs = map.options.crs;
    const origin = crs.project(locationByLayer.get(layer)), point = crs.project(latlng);
    const metres = Math.cos(locationByLayer.get(layer).lat * radians);
    return (
      /* alloc */
      [(point.x - origin.x) * metres, 0, -(point.y - origin.y) * metres]
    );
  }

  // src/geometry/boundsQuad.js
  function boundsQuad(state, bounds) {
    const positions = (
      /* alloc */
      []
    );
    let i, corner;
    for (i = 0; i < 4; i++) {
      corner = i === 0 ? bounds.getNorthWest() : i === 1 ? bounds.getNorthEast() : i === 2 ? bounds.getSouthWest() : bounds.getSouthEast();
      positions.push(localPosition(state, corner));
    }
    return positions;
  }

  // src/native/syncGridTile.js
  function syncGridTile(state, key, tile, opacity) {
    const retained = state.textures.get(key), mesh = state.meshes.get(key);
    if (mesh && !mesh._terrainRequest && retained?.image === tile.el && retained.url === (tile.el.currentSrc || tile.el.src)) {
      retained.used = true;
      styleNativeMesh(state, mesh, coreWhite, opacity);
      return mesh;
    }
    const [nw, se] = state.source._tileCoordsToNwSe(tile.coords);
    return quadNativeMesh(
      state,
      key,
      tile.el,
      boundsQuad(
        state,
        /* alloc */
        new L.LatLngBounds(nw, se)
      ),
      opacity
    );
  }

  // src/native/getGridTerrainTile.js
  async function getGridTerrainTile(state, z, x, y) {
    const limit = 2 ** z;
    x = (x % limit + limit) % limit;
    y = Math.max(0, Math.min(limit - 1, y));
    const key = `${z}/${x}/${y}`;
    let entry = state.terrainCache.get(key);
    if (!entry) {
      entry = /* alloc */
      { promise: state.layer.options.getTile(z, x, y, state.terrainController.signal) };
      state.terrainCache.set(key, entry);
    } else {
      state.terrainCache.delete(key);
      state.terrainCache.set(key, entry);
    }
    try {
      if (!entry.data) entry.data = await entry.promise;
      if (!(entry.data instanceof Float32Array) || entry.data.length !== 65536) {
        throw (
          /* alloc */
          new Error(`Invalid elevation tile ${key}: expected 256x256 Float32Array`)
        );
      }
      if (!entry.range) {
        let minimum = Infinity, maximum = -Infinity, elevation;
        for (elevation of entry.data) {
          if (!Number.isFinite(elevation) || elevation <= -1e3) continue;
          minimum = Math.min(minimum, elevation);
          maximum = Math.max(maximum, elevation);
        }
        entry.range = /* alloc */
        [minimum, maximum];
      }
    } catch (error) {
      if (state.terrainCache.get(key) === entry) state.terrainCache.delete(key);
      throw error;
    }
    while (state.terrainCache.size > 256) state.terrainCache.delete(state.terrainCache.keys().next().value);
    return entry.data;
  }

  // src/native/loadGridTerrain.js
  async function loadGridTerrain(state, key, tile, request) {
    const { x, y, z } = tile.coords, stream = request.stream;
    const jobs = (
      /* alloc */
      []
    ), tiles = (
      /* alloc */
      /* @__PURE__ */ new Map()
    );
    let dx, dy, i = 0;
    try {
      for (dy = -1; dy <= 1; dy++) for (dx = -1; dx <= 1; dx++) {
        jobs.push(getGridTerrainTile(stream, z, x + dx, y + dy));
      }
      const values = await Promise.all(jobs);
      if (state.disposed || stream.terrainController.signal.aborted || state.source._tiles[key] !== tile || state.terrainRequests.get(key) !== request) return;
      for (dy = -1; dy <= 1; dy++) for (dx = -1; dx <= 1; dx++) tiles.set(`${x + dx}/${y + dy}`, values[i++]);
      request.tiles = tiles;
      refreshNativeLayer(state);
      state.map.fire("terrainchange");
      state.source._update();
    } catch (error) {
      if (!state.disposed && !stream.terrainController.signal.aborted && state.source._tiles[key] === tile) {
        request.error = error;
        stream.layer.fire(
          "error",
          /* alloc */
          { error, coords: tile.coords }
        );
      }
    }
  }

  // src/native/terrainGridMesh.js
  function terrainGridMesh(state, key, tile, request, opacity) {
    const texture = textureFor(state, key, tile.el);
    if (!texture) return;
    const { x, y, z } = tile.coords, divisions = 32;
    const northwest = localPosition(state, state.map.unproject(
      /* alloc */
      [x * 256, y * 256],
      z
    ));
    const southeast = localPosition(state, state.map.unproject(
      /* alloc */
      [(x + 1) * 256, (y + 1) * 256],
      z
    ));
    const vertices = (
      /* alloc */
      []
    ), position = (
      /* alloc */
      []
    ), uv = (
      /* alloc */
      []
    );
    const base = rootByLayer.get(state.backend).position[1];
    let row, col, u, v, elevation, a, b, c, d, index;
    for (row = 0; row <= divisions; row++) for (col = 0; col <= divisions; col++) {
      u = col / divisions;
      v = row / divisions;
      elevation = terrainElevation(
        /* alloc */
        { x: (x + u) * 256, y: (y + v) * 256 },
        request.tiles
      );
      if (!Number.isFinite(elevation)) throw (
        /* alloc */
        new Error(`Missing elevation sample in ${z}/${x}/${y}`)
      );
      vertices.push(
        /* alloc */
        [
          northwest[0] + (southeast[0] - northwest[0]) * u,
          elevation - base,
          northwest[2] + (southeast[2] - northwest[2]) * v,
          u,
          v
        ]
      );
    }
    for (row = 0; row < divisions; row++) for (col = 0; col < divisions; col++) {
      a = row * (divisions + 1) + col;
      b = a + 1;
      c = a + divisions + 1;
      d = c + 1;
      for (
        index of
        /* alloc */
        [a, c, b, b, c, d]
      ) {
        position.push(vertices[index][0], vertices[index][1], vertices[index][2]);
        uv.push(vertices[index][3], vertices[index][4]);
      }
    }
    const mesh = putNativeMesh(state, key, position, coreWhite, opacity, texture, uv, true);
    mesh._terrainRequest = request;
    return mesh;
  }

  // src/native/syncTerrainGridTile.js
  function syncTerrainGridTile(state, key, tile, opacity) {
    const retained = state.textures.get(key), mesh = state.meshes.get(key);
    let request = state.terrainRequests.get(key);
    if (!request || request.tile !== tile) {
      request = /* alloc */
      { tile, stream: state.terrainStream };
      state.terrainRequests.set(key, request);
      loadGridTerrain(state, key, tile, request);
    }
    if (!request.tiles) {
      if (mesh && retained?.image === tile.el) {
        retained.used = true;
        styleNativeMesh(state, mesh, coreWhite, opacity);
      }
      return null;
    }
    if (mesh && mesh._terrainRequest === request && retained?.image === tile.el && retained.url === (tile.el.currentSrc || tile.el.src)) {
      retained.used = true;
      styleNativeMesh(state, mesh, coreWhite, opacity);
      return mesh;
    }
    return terrainGridMesh(state, key, tile, request, opacity);
  }

  // src/native/retainGridTerrain.js
  function retainGridTerrain(state) {
    let key, mesh, retained;
    for ([key, mesh] of state.meshes) {
      if (state.source._tiles[key] || !mesh._terrainRequest) continue;
      retained = state.textures.get(key);
      if (!retained) continue;
      retained.used = true;
      mesh._nativeUsed = true;
    }
  }

  // src/native/syncGridLayer.js
  function syncGridLayer(state) {
    const { source } = state;
    const stream = prepareGridTerrainRequests(state);
    let key, tile, opacity, mesh, pending = false;
    for (key in source._tiles) {
      if (!Object.hasOwn(source._tiles, key)) continue;
      tile = source._tiles[key];
      if (!tile.loaded || tile.el instanceof HTMLImageElement && !tile.el.naturalWidth) {
        pending = Boolean(stream);
        continue;
      }
      opacity = (source.options.opacity ?? 1) * (tile._gpuOpacity ?? 1);
      mesh = state.terrainRequests ? syncTerrainGridTile(state, key, tile, opacity) : syncGridTile(state, key, tile, opacity);
      if (state.terrainRequests && !state.terrainRequests.get(key).tiles) pending = true;
      if (mesh) mesh.renderOrder += tile.coords.z / 100;
    }
    if (stream && (pending || !Object.keys(source._tiles).length)) {
      retainGridTerrain(state);
    }
  }

  // src/native/syncImageOverlay.js
  function syncImageOverlay(state) {
    const { source } = state;
    if (source._image?.complete && source._image.naturalWidth) {
      quadNativeMesh(state, "image", source._image, boundsQuad(state, source.getBounds()), source.options.opacity ?? 1);
    }
  }

  // src/globals/coreMatrixKeys.js
  var coreMatrixKeys = Object.freeze([
    "m11",
    "m12",
    "m13",
    "m14",
    "m21",
    "m22",
    "m23",
    "m24",
    "m31",
    "m32",
    "m33",
    "m34",
    "m41",
    "m42",
    "m43",
    "m44"
  ]);

  // src/projections/markerCameraIconPoint.js
  init_L();
  init_radians();
  init_mapGetBearing();
  function markerCameraIconPoint(marker, x, y) {
    let rotation = marker.options.rotation + (marker.options.rotateWithView ? mapGetBearing(marker._map) * radians : 0);
    if (marker.options.keepUpright && Math.cos(rotation) < 0) rotation += Math.PI;
    const scale = marker.options.scale;
    return (
      /* alloc */
      new L.Point(
        (x * Math.cos(rotation) - y * Math.sin(rotation)) * scale,
        (x * Math.sin(rotation) + y * Math.cos(rotation)) * scale
      )
    );
  }

  // src/transforms/transformNativePoint.js
  function transformNativePoint(target, matrix, x, y, z, w) {
    target.x = matrix.m11 * x + matrix.m21 * y + matrix.m31 * z + matrix.m41 * w;
    target.y = matrix.m12 * x + matrix.m22 * y + matrix.m32 * z + matrix.m42 * w;
    target.z = matrix.m13 * x + matrix.m23 * y + matrix.m33 * z + matrix.m43 * w;
    target.w = matrix.m14 * x + matrix.m24 * y + matrix.m34 * z + matrix.m44 * w;
    return target;
  }

  // src/geometry/markerImageBounds.js
  function markerImageBounds(state, key, image) {
    const options = state.source.options.icon.options;
    const dimensions = options[key === "shadow" ? "shadowSize" : "iconSize"];
    const bounds = state.markerImageBounds ||= /* alloc */
    [0, 0, 0, 0];
    bounds[0] = dimensions ? dimensions.x ?? dimensions[0] : image.naturalWidth;
    bounds[1] = dimensions ? dimensions.y ?? dimensions[1] : image.naturalHeight;
    const anchor = key === "shadow" && options.shadowAnchor || options.iconAnchor;
    bounds[2] = anchor ? anchor.x ?? anchor[0] : Math.floor(bounds[0] / 2);
    bounds[3] = anchor ? anchor.y ?? anchor[1] : Math.floor(bounds[1] / 2);
    return bounds;
  }

  // src/geometry/markerQuadCorners.js
  function markerQuadCorners(state, key, image) {
    const { source, map, backend: layer } = state;
    const position = localPosition(state, source.getLatLng());
    if (streamTerrainByMap.get(map)) {
      const root2 = rootByLayer.get(layer), elevation = mapElevationOf(map, source.getLatLng());
      if (Number.isFinite(elevation)) position[1] = (elevation - root2.position[1]) / root2.scale[1];
    }
    const size = map.getSize();
    const matrices = state.markerMatrices ||= /* alloc */
    {
      root: (
        /* alloc */
        new DOMMatrix()
      ),
      camera: (
        /* alloc */
        new DOMMatrix()
      ),
      point: (
        /* alloc */
        { x: 0, y: 0, z: 0, w: 1 }
      )
    };
    const root = matrices.root, camera = matrices.camera, point = matrices.point;
    const worldMatrix = rootByLayer.get(layer).worldMatrix, projection = cameraByLayer.get(layer).projectionViewMatrix;
    let i, keyName;
    for (i = 0; i < 16; i++) {
      keyName = coreMatrixKeys[i];
      root[keyName] = worldMatrix[i];
      camera[keyName] = projection[i];
    }
    transformNativePoint(point, root, position[0], position[1], position[2], 1);
    transformNativePoint(point, camera, point.x, point.y, point.z, point.w);
    const clipX = point.x, clipY = point.y, clipZ = point.z, clipW = point.w;
    camera.invertSelf();
    root.invertSelf();
    const [width, height, anchorX, anchorY] = markerImageBounds(state, key, image);
    const centerX = (clipX / clipW + 1) * size.x / 2, centerY = (1 - clipY / clipW) * size.y / 2;
    const left = centerX - anchorX;
    const top = centerY - anchorY;
    const corners = (
      /* alloc */
      []
    );
    let pointX, pointY, offset, x, y;
    for (i = 0; i < 4; i++) {
      pointX = left + (i % 2 ? width : 0);
      pointY = top + (i < 2 ? 0 : height);
      offset = markerCameraIconPoint(source, pointX - centerX, pointY - centerY);
      x = centerX + offset.x, y = centerY + offset.y;
      transformNativePoint(point, camera, x / size.x * 2 - 1, 1 - y / size.y * 2, clipZ / clipW, 1);
      transformNativePoint(point, root, point.x / point.w, point.y / point.w, point.z / point.w, 1);
      corners.push(
        /* alloc */
        [point.x, point.y, point.z]
      );
    }
    return corners;
  }

  // src/native/syncMarker.js
  function syncMarker(state) {
    const { source } = state;
    let i, key, image, mesh;
    for (i = 0; i < 2; i++) {
      key = i ? "icon" : "shadow";
      image = i ? source._icon : source._shadow;
      if (!(image instanceof HTMLImageElement) || !image.complete || !image.naturalWidth) continue;
      mesh = quadNativeMesh(state, key, image, markerQuadCorners(state, key, image), source.options.opacity ?? 1);
      if (key === "shadow" && mesh) mesh.renderOrder -= 100 * 1e6;
    }
  }

  // src/colors/toSRGB.js
  function toSRGB(value) {
    return value <= 31308e-7 ? value * 12.92 : 1.055 * value ** (1 / 2.4) - 0.055;
  }

  // src/colors/hslChannel.js
  function channel(n, h, l, a) {
    const k = (n + h * 12) % 12;
    return l - a * Math.max(-1, Math.min(k - 3, 9 - k, 1));
  }

  // src/colors/parseColor.js
  function parseColor(value) {
    if (value && typeof value === "object" && "h" in value) {
      const a = value.s * Math.min(value.l, 1 - value.l);
      return (
        /* alloc */
        {
          r: toSRGB(channel(0, value.h, value.l, a)),
          g: toSRGB(channel(8, value.h, value.l, a)),
          b: toSRGB(channel(4, value.h, value.l, a))
        }
      );
    }
    if (value && typeof value === "object" && "r" in value) {
      return value;
    }
    if (typeof value === "number") {
      return (
        /* alloc */
        {
          r: (value >> 16 & 255) / 255,
          g: (value >> 8 & 255) / 255,
          b: (value & 255) / 255
        }
      );
    }
    if (typeof value !== "string" || !CSS.supports("color", value)) {
      throw (
        /* alloc */
        new Error("Invalid 3D color")
      );
    }
    const context = document.createElement("canvas").getContext("2d");
    context.fillStyle = value;
    context.fillRect(0, 0, 1, 1);
    const [r, g, b] = context.getImageData(0, 0, 1, 1).data;
    return (
      /* alloc */
      {
        r: r / 255,
        g: g / 255,
        b: b / 255
      }
    );
  }

  // src/native/syncNativeStrokeZoom.js
  function syncNativeStrokeZoom(state) {
    const { source, meshes, strokeCoordinates, strokeAnchors } = state;
    const mesh = meshes.get("stroke");
    let i, r, g, b, fill;
    if (mesh) {
      const factor = 2 ** (state.strokeZoom - state.map.getZoom()) * Number(source.options.weight) / state.strokeWeight;
      const attribute = mesh.geometry.attributes.position;
      if (mesh.program.uniforms.strokeScale) {
        mesh.program.uniforms.strokeScale.value = factor;
      } else {
        for (i = 0; i < strokeCoordinates.length; i++) {
          attribute.data[i] = strokeAnchors[i] + (strokeCoordinates[i] - strokeAnchors[i]) * factor;
        }
        attribute.needsUpdate = true;
        mesh.geometry.bounds = null;
      }
      ({ r, g, b } = parseColor(source.options.color));
      styleNativeMesh(
        state,
        mesh,
        /* alloc */
        [r, g, b],
        source.options.opacity ?? 1
      );
    }
    fill = meshes.get("fill");
    if (fill) {
      ({ r, g, b } = parseColor(source.options.fillColor || source.options.color));
      styleNativeMesh(
        state,
        fill,
        /* alloc */
        [r, g, b],
        source.options.fillOpacity ?? 1
      );
    }
  }

  // src/globals/geometryPixelStates.js
  var geometryPixelStates = [];

  // src/geometry/nativeGeometry.js
  init_L();

  // src/geometry/visitNativeCoordinates.js
  init_L();

  // src/geometry/segment.js
  init_L();

  // src/geometry/appendNativeTriangle.js
  function triangle(point, target, a, b, c, anchorA, anchorB, anchorC) {
    return target.push(...point(a, anchorA), ...point(b, anchorB), ...point(c, anchorC));
  }

  // src/globals/tau.js
  var tau = 2 * Math.PI;

  // src/geometry/diskAt.js
  init_L();
  function diskAt(center, radius, radiusY, count, index) {
    return (
      /* alloc */
      new L.Point(
        center.x + radius * Math.cos(index * tau / count),
        center.y + radiusY * Math.sin(index * tau / count)
      )
    );
  }

  // src/geometry/disk.js
  function disk(point, center, radius, target, radiusY = radius) {
    if (!(radius > 0) || !(radiusY > 0)) return;
    const count = Math.max(12, Math.min(128, Math.ceil(Math.PI * Math.sqrt(radius))));
    let i;
    for (i = 0; i < count; i++) {
      triangle(point, target, center, diskAt(center, radius, radiusY, count, i), diskAt(center, radius, radiusY, count, i + 1), center, center, center);
    }
  }

  // src/geometry/segment.js
  function segment(context, a, b, startCap, endCap) {
    const { options, width, stroke, point } = context;
    const radius = width / 2;
    const anchorA = a, anchorB = b;
    const length = a.distanceTo(b);
    if (!length) return;
    const direction = b.subtract(a).divideBy(length);
    const normal = (
      /* alloc */
      new L.Point(-direction.y * radius, direction.x * radius)
    );
    if (options.lineCap === "square") {
      if (startCap) a = a.subtract(direction.multiplyBy(radius));
      if (endCap) b = b.add(direction.multiplyBy(radius));
    }
    triangle(point, stroke, a.add(normal), a.subtract(normal), b.add(normal), anchorA, anchorA, anchorB);
    triangle(point, stroke, b.add(normal), a.subtract(normal), b.subtract(normal), anchorB, anchorA, anchorB);
    if (options.lineCap === "round") {
      if (startCap) disk(point, a, radius, stroke);
      if (endCap) disk(point, b, radius, stroke);
    }
  }

  // src/geometry/lineJoin.js
  init_L();
  function lineJoin(context, points, i, b, length) {
    const { options, width, point, stroke } = context;
    const a = points[i], radius = width / 2;
    if (options.lineJoin === "round") {
      disk(point, a, radius, stroke);
      return;
    }
    const previous = a.subtract(points[(i + points.length - 1) % points.length]);
    const previousLength = Math.hypot(previous.x, previous.y);
    if (!previousLength || !length) return;
    const incoming = previous.divideBy(previousLength), outgoing = b.subtract(a).divideBy(length);
    const side = incoming.x * outgoing.y - incoming.y * outgoing.x > 0 ? -1 : 1;
    const n1 = (
      /* alloc */
      new L.Point(-incoming.y * side, incoming.x * side)
    );
    const n2 = (
      /* alloc */
      new L.Point(-outgoing.y * side, outgoing.x * side)
    );
    const from = a.add(n1.multiplyBy(radius)), to = a.add(n2.multiplyBy(radius));
    const denominator = 1 + n1.x * n2.x + n1.y * n2.y;
    const miter = denominator > 0 ? n1.add(n2).multiplyBy(radius / denominator) : null;
    triangle(point, stroke, from, a, to, a, a, a);
    if (options.lineJoin === "miter" && miter && Math.hypot(miter.x, miter.y) <= radius * 4) {
      triangle(point, stroke, from, a.add(miter), to, a, a, a);
    }
  }

  // src/geometry/dashedSegment.js
  function dashedSegment(context, a, b, length, distance, period) {
    const dash = context.dash;
    let offset = 0, phase = (distance % period + period) % period, index = 0, end, delta, skipped = 0;
    while (index < dash.length - 1 && phase >= dash[index]) phase -= dash[index++];
    let remaining = Math.max(0, dash[index] - phase);
    while (offset < length) {
      end = Math.min(length, offset + remaining);
      if (end > offset && index % 2 === 0) {
        delta = b.subtract(a).divideBy(length);
        segment(context, a.add(delta.multiplyBy(offset)), a.add(delta.multiplyBy(end)), true, true);
      }
      if (end <= offset) {
        if (++skipped >= dash.length) throw (
          /* alloc */
          new Error("Leaflet dashArray is too small for these coordinates")
        );
      } else skipped = 0;
      offset = end;
      index = (index + 1) % dash.length;
      remaining = dash[index];
    }
  }

  // src/geometry/line.js
  function line(context, points, closed) {
    const { options, width, dash } = context;
    if (!options.stroke || width <= 0 || points.length < 2) return;
    let distance = Number(options.dashOffset) || 0;
    let period = 0, value, i, a, b, length;
    for (value of dash) period += value;
    for (i = 0; i < points.length - (closed ? 0 : 1); i++) {
      a = points[i], b = points[(i + 1) % points.length], length = a.distanceTo(b);
      if (!dash.length) {
        segment(context, a, b, !closed && i === 0, !closed && i === points.length - 2);
        if (closed || i > 0) lineJoin(context, points, i, b, length);
      } else {
        dashedSegment(context, a, b, length, distance, period);
      }
      distance += length;
    }
  }

  // src/triangulation/minimumX.js
  function minimumX(ring) {
    let minimum = Infinity;
    let point;
    for (point of ring) minimum = Math.min(minimum, point.x);
    return minimum;
  }

  // src/triangulation/mergeHoles.js
  function mergeHoles(source, target, start2, width) {
    const middle = Math.min(start2 + width, source.length), end = Math.min(start2 + width * 2, source.length);
    let left = start2, right = middle, output;
    for (output = start2; output < end; output++) {
      if (left < middle && (right >= end || source[left].x <= source[right].x)) {
        target[output] = source[left++];
      } else {
        target[output] = source[right++];
      }
    }
  }

  // src/triangulation/sortHoles.js
  function sortHoles(holes) {
    if (holes.length < 2) return holes;
    const buffer = (
      /* alloc */
      new Array(holes.length)
    );
    const entries = (
      /* alloc */
      []
    );
    let ring, width, start2, previous, i;
    for (ring of holes) entries.push(
      /* alloc */
      { ring, x: minimumX(ring) }
    );
    let source = entries, target = buffer;
    for (width = 1; width < entries.length; width *= 2) {
      for (start2 = 0; start2 < entries.length; start2 += width * 2) {
        mergeHoles(source, target, start2, width);
      }
      previous = source;
      source = target;
      target = previous;
    }
    for (i = 0; i < holes.length; i++) holes[i] = source[i].ring;
    return holes;
  }

  // src/triangulation/cross.js
  function cross(a, b, c) {
    return (b.x - a.x) * (c.y - a.y) - (b.y - a.y) * (c.x - a.x);
  }

  // src/triangulation/equal.js
  function equal(a, b) {
    return a.x === b.x && a.y === b.y;
  }

  // src/triangulation/clean.js
  function clean(ring) {
    let changed = true;
    let i, a, b, c;
    while (changed && ring.length > 3) {
      changed = false;
      for (i = 0; i < ring.length; i++) {
        a = ring[(i + ring.length - 1) % ring.length], b = ring[i], c = ring[(i + 1) % ring.length];
        if (equal(a, b) || Math.abs(cross(a, b, c)) < 1e-10) {
          ring.splice(i, 1);
          changed = true;
          break;
        }
      }
    }
    if (ring.length < 3) throw (
      /* alloc */
      new Error("Degenerate polygon ring")
    );
    return ring;
  }

  // src/triangulation/isClockWise.js
  function isClockWise(points) {
    let area2 = 0;
    let i, a, b;
    for (i = 0; i < points.length; i++) {
      a = points[i], b = points[(i + 1) % points.length];
      area2 += a.x * b.y - b.x * a.y;
    }
    return area2 < 0;
  }

  // src/triangulation/polygonRings.js
  function polygonRings(paths, vertices) {
    const rings = (
      /* alloc */
      []
    );
    let offset = 0, index, path, ring;
    for (index = 0; index < paths.length; index++) {
      path = paths[index];
      ring = clean(vertices.slice(offset, offset += path.length));
      if (isClockWise(ring) !== Boolean(index)) ring.reverse();
      rings.push(ring);
    }
    return rings;
  }

  // src/triangulation/inside.js
  function inside(point, ring) {
    let result = false;
    let i, j, a, b;
    for (i = 0, j = ring.length - 1; i < ring.length; j = i++) {
      a = ring[i], b = ring[j];
      if (a.y > point.y !== b.y > point.y && point.x < (b.x - a.x) * (point.y - a.y) / (b.y - a.y) + a.x) result = !result;
    }
    return result;
  }

  // src/triangulation/insideHole.js
  function insideHole(point, rings) {
    let i;
    for (i = 1; i < rings.length; i++) if (inside(point, rings[i])) return true;
    return false;
  }

  // src/triangulation/on.js
  function on(p, q, r) {
    return Math.min(p.x, q.x) <= r.x && r.x <= Math.max(p.x, q.x) && Math.min(p.y, q.y) <= r.y && r.y <= Math.max(p.y, q.y);
  }

  // src/triangulation/intersects.js
  function intersects(a, b, c, d) {
    if (equal(a, c) || equal(a, d) || equal(b, c) || equal(b, d)) return false;
    const abC = cross(a, b, c), abD = cross(a, b, d), cdA = cross(c, d, a), cdB = cross(c, d, b);
    return abC * abD < 0 && cdA * cdB < 0 || abC === 0 && on(a, b, c) || abD === 0 && on(a, b, d) || cdA === 0 && on(c, d, a) || cdB === 0 && on(c, d, b);
  }

  // src/triangulation/crossesRing.js
  function crossesRing(a, b, ring) {
    let i;
    for (i = 0; i < ring.length; i++) {
      if (intersects(a, b, ring[i], ring[(i + 1) % ring.length])) return true;
    }
    return false;
  }

  // src/triangulation/crossesBoundary.js
  function crossesBoundary(a, b, polygon2, rings) {
    if (crossesRing(a, b, polygon2)) return true;
    let i;
    for (i = 1; i < rings.length; i++) if (crossesRing(a, b, rings[i])) return true;
    return false;
  }

  // src/triangulation/connectHole.js
  function connectHole(polygon2, hole, rings, mid) {
    let h2 = -1, p2 = -1, distance = Infinity, h, p, a, b, d;
    for (h = 0; h < hole.length; h++) for (p = 0; p < polygon2.length; p++) {
      a = hole[h], b = polygon2[p], d = (a.x - b.x) ** 2 + (a.y - b.y) ** 2;
      if (d >= distance) continue;
      mid.x = (a.x + b.x) / 2;
      mid.y = (a.y + b.y) / 2;
      if (!inside(mid, rings[0]) || insideHole(mid, rings)) continue;
      if (crossesBoundary(a, b, polygon2, rings)) continue;
      h2 = h;
      p2 = p;
      distance = d;
    }
    if (h2 < 0) throw (
      /* alloc */
      new Error("Unable to connect polygon hole")
    );
    return (
      /* alloc */
      [
        ...polygon2.slice(0, p2 + 1),
        ...hole.slice(h2),
        ...hole.slice(0, h2 + 1),
        polygon2[p2],
        ...polygon2.slice(p2 + 1)
      ]
    );
  }

  // src/triangulation/containsVertex.js
  function containsVertex(polygon2, a, b, c) {
    let p;
    for (p of polygon2) {
      if (!equal(p, a) && !equal(p, b) && !equal(p, c) && cross(a, b, p) >= 0 && cross(b, c, p) >= 0 && cross(c, a, p) >= 0) return true;
    }
    return false;
  }

  // src/triangulation/clipEars.js
  function clipEars(polygon2) {
    const result = (
      /* alloc */
      []
    );
    let clipped, i, a, b, c, p;
    while (polygon2.length > 3) {
      clipped = false;
      for (i = 0; i < polygon2.length; i++) {
        a = polygon2[(i + polygon2.length - 1) % polygon2.length], b = polygon2[i], c = polygon2[(i + 1) % polygon2.length];
        if (cross(a, b, c) <= 1e-10) continue;
        if (containsVertex(polygon2, a, b, c)) continue;
        result.push(
          /* alloc */
          [a.index, b.index, c.index]
        );
        polygon2.splice(i, 1);
        clipped = true;
        break;
      }
      if (!clipped) throw (
        /* alloc */
        new Error("Unable to triangulate polygon: invalid or self-intersecting rings")
      );
    }
    if (cross(...polygon2) > 1e-10) {
      const triangle3 = (
        /* alloc */
        []
      );
      for (p of polygon2) triangle3.push(p.index);
      result.push(triangle3);
    }
    return result;
  }

  // src/triangulation/area.js
  function area(ring) {
    let sum = 0;
    let i, p, q;
    for (i = 0; i < ring.length; i++) {
      p = ring[i], q = ring[(i + 1) % ring.length];
      sum += p.x * q.y - q.x * p.y;
    }
    return Math.abs(sum) / 2;
  }

  // src/triangulation/validateArea.js
  function validateArea(rings, vertices, result) {
    let holeArea = 0, actual = 0, i, triangle3;
    for (i = 1; i < rings.length; i++) holeArea += area(rings[i]);
    const expected = area(rings[0]) - holeArea;
    for (triangle3 of result) actual += cross(vertices[triangle3[0]], vertices[triangle3[1]], vertices[triangle3[2]]) / 2;
    if (expected <= 0 || Math.abs(actual - expected) > Math.max(1e-7, expected * 1e-8)) throw (
      /* alloc */
      new Error("Polygon triangulation area mismatch")
    );
  }

  // src/triangulation/triangulate.js
  function triangulate(contour, holes = geometryEmpty) {
    const paths = (
      /* alloc */
      [contour, ...holes]
    );
    const points = paths.flat();
    let p, index, hole;
    for (p of points) {
      if (!Number.isFinite(p.x) || !Number.isFinite(p.y)) throw (
        /* alloc */
        new Error("Invalid polygon coordinates")
      );
    }
    const vertices = (
      /* alloc */
      []
    );
    for (index = 0; index < points.length; index++) {
      p = points[index];
      vertices.push(
        /* alloc */
        { x: p.x - contour[0].x, y: p.y - contour[0].y, index }
      );
    }
    const rings = polygonRings(paths, vertices);
    let polygon2 = rings[0].slice();
    const holesToConnect = sortHoles(rings.slice(1));
    const mid = holesToConnect.length ? (
      /* alloc */
      { x: 0, y: 0 }
    ) : null;
    for (hole of holesToConnect) {
      polygon2 = connectHole(polygon2, hole, rings, mid);
    }
    const result = clipEars(polygon2);
    validateArea(rings, vertices, result);
    return result;
  }

  // src/geometry/fillNativePolygon.js
  function fillNativePolygon(context, projected) {
    const { options, fill, point } = context;
    if (options.triangulated) {
      if (projected.length !== 1 || projected[0].length !== 3) {
        throw (
          /* alloc */
          new Error("triangulated polygons require three vertices per polygon and no holes")
        );
      }
      triangle(point, fill, projected[0][0], projected[0][1], projected[0][2]);
      return;
    }
    const valid = (
      /* alloc */
      []
    );
    let ring, indices;
    for (ring of projected) if (ring.length >= 3) valid.push(ring);
    const vertices = valid.flat();
    for (indices of triangulate(valid[0], valid.slice(1))) {
      triangle(point, fill, vertices[indices[0]], vertices[indices[1]], vertices[indices[2]]);
    }
  }

  // src/geometry/polygon.js
  function polygon(context, rings, closed) {
    const { options, map } = context;
    const projected = (
      /* alloc */
      []
    );
    let ring, path, latlng;
    for (ring of rings) {
      path = /* alloc */
      [];
      for (latlng of ring) path.push(map.project(latlng));
      projected.push(path);
    }
    if (closed && options.fill && projected[0]?.length >= 3) {
      fillNativePolygon(context, projected);
    }
    for (ring of projected) line(context, ring, closed);
  }

  // src/geometry/visitNativeCoordinates.js
  function visit(context, coordinates, closed) {
    if (!coordinates.length) return;
    let child;
    if (coordinates[0] instanceof L.LatLng) polygon(
      context,
      /* alloc */
      [coordinates],
      closed
    );
    else if (closed && coordinates[0][0] instanceof L.LatLng) polygon(context, coordinates, closed);
    else for (child of coordinates) visit(context, child, closed);
  }

  // src/geometry/dashValues.js
  function dashValues(options) {
    const values = Array.isArray(options.dashArray) ? options.dashArray : String(options.dashArray || "").trim().split(/[ ,]+/);
    const dash = (
      /* alloc */
      []
    );
    let value, allZero = true;
    for (value of values) dash.push(Number(value));
    for (value of dash) {
      if (!Number.isFinite(value) || value < 0) throw (
        /* alloc */
        new Error("Invalid Leaflet dashArray")
      );
      if (value !== 0) allZero = false;
    }
    if (allZero) dash.length = 0;
    if (dash.length % 2) dash.push(...dash);
    return dash;
  }

  // src/geometry/circleGeometry.js
  init_L();

  // src/geometry/circleAt.js
  init_L();
  function circleAt(center, radius, radiusY, count, index, offset = 0) {
    const angle = index * tau / count;
    return (
      /* alloc */
      new L.Point(
        center.x + Math.max(0, radius + offset) * Math.cos(angle),
        center.y + Math.max(0, radiusY + offset) * Math.sin(angle)
      )
    );
  }

  // src/core/projectNativePath.js
  init_L();

  // src/weakmaps/pathProjectionByMap.js
  var pathProjectionByMap = /* @__PURE__ */ new WeakMap();

  // src/core/projectNativePath.js
  function projectNativePath(source) {
    if (!L.version.startsWith("2.")) return source._project();
    const map = source._map, renderer = source._renderer;
    let projection = pathProjectionByMap.get(map);
    if (!projection) {
      projection = Object.create(L.Renderer.prototype);
      projection._map = map;
      pathProjectionByMap.set(map, projection);
    }
    projection._pathZoom = map.getZoom();
    projection._pathOrigin = map.getPixelOrigin();
    source._renderer = projection;
    try {
      source._project();
    } finally {
      if (renderer) source._renderer = renderer;
      else delete source._renderer;
    }
  }

  // src/geometry/circleGeometry.js
  function circleGeometry(source, context) {
    const { map, point, fill, stroke, options, dash, width } = context;
    const center = map.project(source.getLatLng());
    let radius = source.getRadius(), radiusY = radius, index, i;
    if (source instanceof L.Circle) {
      projectNativePath(source);
      const projected = source._point.add(map.getPixelOrigin());
      center.x = projected.x;
      center.y = projected.y;
      radius = source._pxRadius ?? source._radius;
      radiusY = source._pxRadiusY ?? source._radiusY ?? radius;
    }
    if (options.fill) disk(point, center, radius, fill, radiusY);
    const count = Math.max(12, Math.min(128, Math.ceil(Math.PI * Math.sqrt(Math.max(radius, radiusY)))));
    if (dash.length) {
      const points = (
        /* alloc */
        []
      );
      for (index = 0; index < count; index++) points.push(circleAt(center, radius, radiusY, count, index));
      line(context, points, true);
    } else if (options.stroke && width > 0) {
      for (i = 0; i < count; i++) {
        triangle(
          point,
          stroke,
          circleAt(center, radius, radiusY, count, i, width / 2),
          circleAt(center, radius, radiusY, count, i, -width / 2),
          circleAt(center, radius, radiusY, count, i + 1, width / 2)
        );
        triangle(
          point,
          stroke,
          circleAt(center, radius, radiusY, count, i + 1, width / 2),
          circleAt(center, radius, radiusY, count, i, -width / 2),
          circleAt(center, radius, radiusY, count, i + 1, -width / 2)
        );
      }
    }
  }

  // src/geometry/nativeGeometry.js
  function nativeGeometry(source, map, point) {
    const fill = (
      /* alloc */
      []
    );
    const stroke = (
      /* alloc */
      []
    );
    const options = source.options;
    const width = Number(options.weight) || 0;
    const dash = dashValues(options);
    const context = (
      /* alloc */
      { fill, stroke, options, width, dash, point, map }
    );
    if (source instanceof L.CircleMarker) {
      circleGeometry(source, context);
    } else {
      const closed = source instanceof L.Polygon;
      visit(context, source.getLatLngs(), closed);
    }
    return (
      /* alloc */
      { fill, stroke }
    );
  }

  // src/projections/localPixel.js
  function localPixel(state, point) {
    if (state.pixelProjection) {
      const { transformation, scale, origin, metres } = state.pixelProjection;
      const projected = transformation.untransform(point, scale);
      return (
        /* alloc */
        [(projected.x - origin.x) * metres, 0, -(projected.y - origin.y) * metres]
      );
    }
    return localPosition(state, state.map.unproject(point));
  }

  // src/projections/localPixelForGeometry.js
  function localPixelForGeometry(point, anchor) {
    const state = geometryPixelStates[geometryPixelStates.length - 1];
    if (anchor && state.strokeAnchors) state.strokeAnchors.push(...localPixel(state, anchor));
    return localPixel(state, point);
  }

  // src/native/nativeVectorGeometry.js
  init_radians();
  init_L();
  function nativeVectorGeometry(state) {
    const { source } = state;
    state.strokeCoordinates = null;
    state.strokeAnchors = source instanceof L.Polyline && !source.options.dashArray ? (
      /* alloc */
      []
    ) : null;
    const crs = state.map.options.crs, origin = locationByLayer.get(state.backend);
    state.pixelProjection = /* alloc */
    {
      transformation: crs.transformation,
      scale: crs.scale(state.map.getZoom()),
      origin: crs.project(origin),
      metres: Math.cos(origin.lat * radians)
    };
    geometryPixelStates.push(state);
    try {
      return nativeGeometry(source, state.map, localPixelForGeometry);
    } finally {
      geometryPixelStates.pop();
    }
  }

  // src/native/syncNativeStrokeAnchors.js
  function syncNativeStrokeAnchors(state, stroke) {
    const { source } = state;
    if (state.strokeAnchors?.length === stroke.length && stroke.length) {
      if (source.options.interactive === false) state.strokeCoordinates = stroke;
      else {
        state.strokeCoordinates = /* alloc */
        new Float64Array(stroke);
        state.strokeAnchors = /* alloc */
        new Float64Array(state.strokeAnchors);
      }
      state.strokeZoom = state.map.getZoom();
      state.strokeWeight = Number(source.options.weight);
    } else state.strokeAnchors = null;
  }

  // src/native/syncVectorLayer.js
  function syncVectorLayer(state) {
    const { source } = state;
    if (state.zoomOnly) {
      syncNativeStrokeZoom(state);
      state.zoomOnly = false;
      return;
    }
    const { fill, stroke } = nativeVectorGeometry(state);
    syncNativeStrokeAnchors(state, stroke);
    let i, key, positions, color, opacity, r, g, b, attributes;
    for (i = 0; i < 2; i++) {
      key = i ? "stroke" : "fill";
      positions = i ? stroke : fill;
      color = i ? source.options.color : source.options.fillColor || source.options.color;
      opacity = i ? source.options.opacity : source.options.fillOpacity;
      if (!positions.length) continue;
      ({ r, g, b } = parseColor(color));
      putNativeMesh(
        state,
        key,
        positions,
        /* alloc */
        [r, g, b],
        opacity ?? 1
      );
      if (key === "stroke" && source.options.interactive === false && state.strokeCoordinates) {
        attributes = state.meshes.get(key).geometry.attributes;
        state.strokeCoordinates = attributes.position.data;
        state.strokeAnchors = attributes.normal.data;
      }
    }
  }

  // src/native/pruneNativeResources.js
  function pruneNativeResources(state) {
    const { meshes, textures, backend: layer } = state;
    let mesh, texture, key;
    for ([key, mesh] of meshes) {
      if (mesh._nativeUsed) continue;
      disposeMesh(layer, mesh);
      meshes.delete(key);
      texture = textures.get(key);
      if (texture) destroyTexture(layer, texture.texture);
      textures.delete(key);
    }
    for ([key, texture] of textures) {
      if (texture.used) continue;
      destroyTexture(layer, texture.texture);
      textures.delete(key);
    }
  }

  // src/native/synchronizeNativeLayer.js
  function synchronizeNativeLayer(state) {
    const { source, meshes, textures } = state;
    if (!current(state) || !rendererByLayer.get(state.backend) || state.failed) return;
    if (!state.dirty && (!state.marker || !state.viewDirty)) return;
    state.dirty = false;
    state.viewDirty = false;
    let mesh, texture;
    for (mesh of meshes.values()) mesh._nativeUsed = false;
    for (texture of textures.values()) texture.used = false;
    if (source instanceof L.GridLayer) syncGridLayer(state);
    else if (source instanceof L.ImageOverlay) syncImageOverlay(state);
    else if (state.marker) syncMarker(state);
    else syncVectorLayer(state);
    pruneNativeResources(state);
  }

  // src/native/beforeNativeRender.js
  function beforeNativeRender(state) {
    try {
      synchronizeNativeLayer(state);
      const uniform = state.meshes.get("stroke")?.program.uniforms.strokeScale;
      if (uniform) {
        const zoom = cameraViewByMap.get(state.map)?.zoom ?? state.map.getZoom();
        uniform.value = 2 ** (state.strokeZoom - zoom) * Number(state.source.options.weight) / state.strokeWeight;
      }
    } catch (error) {
      state.failed = true;
      state.source.fire(
        "error",
        /* alloc */
        { error }
      );
    }
  }

  // src/rendering/render.js
  function render(layer) {
    cancelUpdate(layer);
    if (sharedByLayer.get(layer) !== layer || !rendererByLayer.get(layer)) return;
    const map = layer._map;
    const now = performance.now();
    const size = map.getSize();
    if (!size.x || !size.y) return;
    synchronizeZoomView(layer, now);
    resizeRenderer(layer, size);
    updateMapCamera(layer, size);
    updateWorldMatrix(sceneByLayer.get(layer));
    let sceneChanged = false;
    let sceneLayer, native;
    for (sceneLayer of layersByLayer.get(layer)) {
      native = nativeRenderByLayer.get(sceneLayer);
      if (!native) continue;
      beforeNativeRender(native);
      sceneChanged = true;
    }
    const sunlight = sunlightByMap.get(map);
    collectFrameMeshes(layer, sunlight, sceneChanged);
    const shadowMeshes = shadowMeshesByLayer.get(layer);
    const renderer = rendererByLayer.get(layer);
    const rasters = updateRoofRaster(layer, now);
    const meshes = renderer.frameMeshes ||= /* alloc */
    [];
    meshes.length = 0;
    let appearing = prepareFrameMeshes(layer, rasters, now, meshes);
    const encoder = renderer.device.createCommandEncoder();
    prepareFrameUniforms(layer, meshes, shadowMeshes, sunlight);
    renderSunlight(layer, encoder, shadowMeshes, sunlight);
    drawSceneMeshes(layer, encoder, meshes);
    renderer.device.queue.writeBuffer(renderer.uniformBuffer, 0, renderer.uniformData, 0, renderer.uniformSlot * 64);
    renderer.device.queue.submit((frameCommands[0] = encoder.finish(), frameCommands));
    frameCommands[0] = null;
    for (sceneLayer of layersByLayer.get(layer)) {
      if (wantedRasterTilesByLayer.get(sceneLayer)) appearing = pruneRasterTiles(sceneLayer) || appearing;
    }
    if (map._animatingZoom || appearing) update(layer);
  }

  // src/scene/renderPendingUpdates.js
  function renderPendingUpdates() {
    const updates = (
      /* alloc */
      [...pendingUpdates]
    );
    pendingUpdates.clear();
    let failure;
    let layer;
    for (layer of updates) {
      frameByLayer.set(layer, null);
      if (sharedByLayer.get(layer) !== layer || !rendererByLayer.get(layer)) continue;
      try {
        render(layer);
      } catch (error) {
        failure ||= error;
      }
    }
    if (failure) throw failure;
  }

  // src/scene/scheduleSceneUpdate.js
  function update(layer) {
    const shared = sharedByLayer.get(layer);
    if (!shared) return layer;
    if (shared !== layer) {
      update(shared);
      return layer;
    }
    if (frameByLayer.get(layer) != null) return layer;
    const first = pendingUpdates.values().next().value;
    pendingUpdates.add(layer);
    frameByLayer.set(layer, first ? frameByLayer.get(first) : requestAnimationFrame(renderPendingUpdates));
    return layer;
  }

  // src/native/hideTargets.js
  init_L();
  function hideTargets(state) {
    const { source } = state;
    const htmlIcon = source instanceof L.Marker && source.options.icon instanceof L.DivIcon;
    const icon = htmlIcon ? null : source._icon, shadow = htmlIcon ? null : source._shadow;
    let i, element;
    for (element of state.hidden) {
      if (element === icon || element === shadow) continue;
      element.classList.remove("leaflet-webgpu-target");
      state.hidden.delete(element);
    }
    for (i = 0; i < 2; i++) {
      element = i ? shadow : icon;
      if (!element || state.hidden.has(element)) continue;
      element.classList.add("leaflet-webgpu-target");
      state.hidden.add(element);
    }
  }

  // src/native/refreshNativeLayer.js
  function refreshNativeLayer(state = this) {
    state.zoomOnly = false;
    state.dirty = true;
    state.viewDirty = true;
    state.failed = false;
    hideTargets(state);
    const source = state.source;
    let i, image;
    for (image of state.images) {
      if (image === source._icon || image === source._shadow || image === source._image) continue;
      image.removeEventListener("load", nativeImageRefresh);
      image.removeEventListener("error", nativeImageError);
      removeImageState(image, state);
      state.images.delete(image);
    }
    for (i = 0; i < 3; i++) {
      image = i === 0 ? source._icon : i === 1 ? source._shadow : source._image;
      if (!(image instanceof HTMLImageElement) || state.images.has(image)) continue;
      state.images.add(image);
      addImageState(image, state);
      image.addEventListener("load", nativeImageRefresh);
      image.addEventListener("error", nativeImageError);
    }
    if (sharedByLayer.get(state.backend)) update(state.backend);
  }

  // src/native/canScaleNativeStyle.js
  init_L();

  // src/globals/nativeScalableStyleKeys.js
  var nativeScalableStyleKeys = /* @__PURE__ */ new Set(["color", "opacity", "weight", "fillColor", "fillOpacity"]);

  // src/native/canScaleNativeStyle.js
  function canScaleNativeStyle(name, state, args) {
    const { source } = state;
    if (name !== "setStyle" || source.options.interactive !== false || state.dirty && !state.zoomOnly) return false;
    const stroke = state.strokeCoordinates && state.meshes.get("stroke")?.program.uniforms.strokeScale;
    const fill = source instanceof L.Polygon && !source.options.stroke && state.meshes.has("fill");
    if (!stroke && !fill) return false;
    let key;
    if (args[0]) {
      for (key of Object.keys(args[0])) {
        if (!nativeScalableStyleKeys.has(key)) return false;
      }
    }
    return true;
  }

  // src/native/orderNativeGridLayer.js
  init_L();
  function orderNativeGridLayer(state, name) {
    const { source } = state;
    if (!(source instanceof L.GridLayer) || name !== "bringToFront" && name !== "bringToBack") return;
    let extreme = name === "bringToFront" ? -Infinity : Infinity, layer, zIndex;
    for (layer of Object.values(state.map._layers)) {
      if (layer === source || !(layer instanceof L.GridLayer) || layer.getPane() !== source.getPane()) continue;
      zIndex = layer.options.zIndex || 0;
      extreme = name === "bringToFront" ? Math.max(extreme, zIndex) : Math.min(extreme, zIndex);
    }
    const edge = name === "bringToFront" ? extreme + 1 : extreme - 1;
    if (Number.isFinite(edge)) source.setZIndex(edge);
  }

  // src/native/nativeLayerMethod.js
  function nativeLayerMethod(name, source, args) {
    const state = nativeGPUByLayer.get(source), original = state.methods.get(name).original;
    const scalable = canScaleNativeStyle(name, state, args);
    const result = original.apply(source, args);
    orderNativeGridLayer(state, name);
    if (name === "bringToFront") {
      state.order = nativeGPUOrderByMap.get(state.map) + 1;
      nativeGPUOrderByMap.set(state.map, state.order);
    }
    if (name === "bringToBack") {
      state.order = nativeGPUBackByMap.get(state.map) - 1;
      nativeGPUBackByMap.set(state.map, state.order);
    }
    refreshNativeLayer(state);
    if (scalable && (!source.options.stroke || Number(source.options.weight) > 0)) state.zoomOnly = true;
    return result;
  }

  // src/native/nativeSetLatLng.js
  function nativeSetLatLng(...args) {
    return nativeLayerMethod("setLatLng", this, args);
  }

  // src/native/nativeSetLatLngs.js
  function nativeSetLatLngs(...args) {
    return nativeLayerMethod("setLatLngs", this, args);
  }

  // src/native/nativeAddLatLng.js
  function nativeAddLatLng(...args) {
    return nativeLayerMethod("addLatLng", this, args);
  }

  // src/native/nativeSetRadius.js
  function nativeSetRadius(...args) {
    return nativeLayerMethod("setRadius", this, args);
  }

  // src/native/nativeSetStyle.js
  function nativeSetStyle(...args) {
    return nativeLayerMethod("setStyle", this, args);
  }

  // src/native/nativeRedraw.js
  function nativeRedraw(...args) {
    return nativeLayerMethod("redraw", this, args);
  }

  // src/native/nativeSetIcon.js
  function nativeSetIcon(...args) {
    return nativeLayerMethod("setIcon", this, args);
  }

  // src/native/nativeSetUrl.js
  function nativeSetUrl(...args) {
    return nativeLayerMethod("setUrl", this, args);
  }

  // src/native/nativeSetBounds.js
  function nativeSetBounds(...args) {
    return nativeLayerMethod("setBounds", this, args);
  }

  // src/native/nativeSetOpacity.js
  function nativeSetOpacity(...args) {
    return nativeLayerMethod("setOpacity", this, args);
  }

  // src/native/nativeSetZIndex.js
  function nativeSetZIndex(...args) {
    return nativeLayerMethod("setZIndex", this, args);
  }

  // src/native/nativeSetZIndexOffset.js
  function nativeSetZIndexOffset(...args) {
    return nativeLayerMethod("setZIndexOffset", this, args);
  }

  // src/native/nativeBringToFront.js
  function nativeBringToFront(...args) {
    return nativeLayerMethod("bringToFront", this, args);
  }

  // src/native/nativeBringToBack.js
  function nativeBringToBack(...args) {
    return nativeLayerMethod("bringToBack", this, args);
  }

  // src/globals/nativeMethodHandlers.js
  var nativeMethodHandlers = {
    setLatLng: nativeSetLatLng,
    setLatLngs: nativeSetLatLngs,
    addLatLng: nativeAddLatLng,
    setRadius: nativeSetRadius,
    setStyle: nativeSetStyle,
    redraw: nativeRedraw,
    setIcon: nativeSetIcon,
    setUrl: nativeSetUrl,
    setBounds: nativeSetBounds,
    setOpacity: nativeSetOpacity,
    setZIndex: nativeSetZIndex,
    setZIndexOffset: nativeSetZIndexOffset,
    bringToFront: nativeBringToFront,
    bringToBack: nativeBringToBack
  };

  // src/scene/createLayer.js
  init_L();

  // src/globals/sceneEmptyOptions.js
  var sceneEmptyOptions = Object.freeze({});

  // src/scene/createLayer.js
  function createLayer(options = sceneEmptyOptions) {
    return (
      /* alloc */
      new L.Layer(options)
    );
  }

  // src/native/nativeEvents.js
  init_L();

  // src/weakmaps/nativeEventMaps.js
  var nativeEventMaps = /* @__PURE__ */ new WeakMap();

  // src/weakmaps/raycasterByLayer.js
  var raycasterByLayer = /* @__PURE__ */ new WeakMap();

  // src/weakmaps/trafficByLayer.js
  var trafficByLayer = /* @__PURE__ */ new WeakMap();

  // src/collision/mergeHits.js
  function mergeHits(source, target, start2, width) {
    const middle = Math.min(start2 + width, source.length), end = Math.min(start2 + width * 2, source.length);
    let left = start2, right = middle, output;
    for (output = start2; output < end; output++) {
      if (left < middle && (right >= end || !(source[right].distance < source[left].distance))) {
        target[output] = source[left++];
      } else {
        target[output] = source[right++];
      }
    }
  }

  // src/collision/sortHits.js
  function sortHits(hits) {
    if (hits.length < 2) return hits;
    const buffer = (
      /* alloc */
      new Array(hits.length)
    );
    let source = hits, target = buffer;
    let width, start2, previous, i;
    for (width = 1; width < hits.length; width *= 2) {
      for (start2 = 0; start2 < hits.length; start2 += width * 2) {
        mergeHits(source, target, start2, width);
      }
      previous = source;
      source = target;
      target = previous;
    }
    if (source !== hits) for (i = 0; i < hits.length; i++) hits[i] = source[i];
    return hits;
  }

  // src/collision/localRay.js
  function localRay(ray, mesh, origin, direction) {
    const inverse = (
      /* alloc */
      new DOMMatrix(mesh.worldMatrix).invertSelf()
    );
    const inverseValues = inverse.toFloat64Array();
    let value, x, y, z, w;
    for (value of inverseValues) {
      if (!Number.isFinite(value)) throw (
        /* alloc */
        new Error("Singular 3D transform")
      );
    }
    x = ray.origin[0], y = ray.origin[1], z = ray.origin[2];
    w = inverseValues[3] * x + inverseValues[7] * y + inverseValues[11] * z + inverseValues[15];
    origin[0] = (inverseValues[0] * x + inverseValues[4] * y + inverseValues[8] * z + inverseValues[12]) / w;
    origin[1] = (inverseValues[1] * x + inverseValues[5] * y + inverseValues[9] * z + inverseValues[13]) / w;
    origin[2] = (inverseValues[2] * x + inverseValues[6] * y + inverseValues[10] * z + inverseValues[14]) / w;
    x = ray.direction[0], y = ray.direction[1], z = ray.direction[2];
    direction[0] = inverseValues[0] * x + inverseValues[4] * y + inverseValues[8] * z;
    direction[1] = inverseValues[1] * x + inverseValues[5] * y + inverseValues[9] * z;
    direction[2] = inverseValues[2] * x + inverseValues[6] * y + inverseValues[10] * z;
    const directionLength = Math.hypot(...direction) || 1;
    direction[0] /= directionLength;
    direction[1] /= directionLength;
    direction[2] /= directionLength;
  }

  // src/collision/rayBounds.js
  function rayBounds(mesh, origin, direction) {
    if (!mesh.geometry.bounds) computeBounds(mesh.geometry);
    let near = 0, far = Infinity, i, a, b;
    for (i = 0; i < 3; i++) {
      if (Math.abs(direction[i]) < 1e-12) {
        if (origin[i] < mesh.geometry.bounds.min[i] || origin[i] > mesh.geometry.bounds.max[i]) {
          far = -Infinity;
          break;
        }
      } else {
        a = (mesh.geometry.bounds.min[i] - origin[i]) / direction[i], b = (mesh.geometry.bounds.max[i] - origin[i]) / direction[i];
        near = Math.max(near, Math.min(a, b));
        far = Math.min(far, Math.max(a, b));
      }
    }
    return !(far < near);
  }

  // src/collision/vertexCount.js
  function vertexCount(position, index) {
    return index?.count ?? index?.data.length ?? position.count ?? position.data.length / (position.size ?? 3);
  }

  // src/collision/readTriangle.js
  function readTriangle(mesh, i, a, b, c) {
    const { position, index, instanceOffset } = mesh.geometry.attributes;
    const size = position.size ?? 3;
    const vertices = vertexCount(position, index);
    const vertex = instanceOffset ? i % vertices : i;
    const offset = instanceOffset ? Math.floor(i / vertices) * instanceOffset.size : 0;
    const x = instanceOffset?.data[offset] ?? 0;
    const y = instanceOffset?.data[offset + 1] ?? 0;
    const z = instanceOffset?.data[offset + 2] ?? 0;
    const ai = (index ? index.data[vertex] : vertex) * size;
    const bi = (index ? index.data[vertex + 1] : vertex + 1) * size;
    const ci = (index ? index.data[vertex + 2] : vertex + 2) * size;
    a[0] = position.data[ai];
    a[1] = position.data[ai + 1];
    a[2] = position.data[ai + 2];
    b[0] = position.data[bi];
    b[1] = position.data[bi + 1];
    b[2] = position.data[bi + 2];
    c[0] = position.data[ci];
    c[1] = position.data[ci + 1];
    c[2] = position.data[ci + 2];
    if (instanceOffset) {
      a[0] = Math.fround(a[0] + x);
      a[1] = Math.fround(a[1] + y);
      a[2] = Math.fround(a[2] + z);
      b[0] = Math.fround(b[0] + x);
      b[1] = Math.fround(b[1] + y);
      b[2] = Math.fround(b[2] + z);
      c[0] = Math.fround(c[0] + x);
      c[1] = Math.fround(c[1] + y);
      c[2] = Math.fround(c[2] + z);
    }
  }

  // src/collision/hiddenLightHit.js
  function hiddenLightHit(mesh, i, u, v, night) {
    if (!mesh.program.nightLight) return false;
    const { index, uv: { data: uv } } = mesh.geometry.attributes;
    const idA = index ? index.data[i] : i, idB = index ? index.data[i + 1] : i + 1, idC = index ? index.data[i + 2] : i + 2;
    const x = uv[idA * 2] * (1 - u - v) + uv[idB * 2] * u + uv[idC * 2] * v;
    const y = uv[idA * 2 + 1] * (1 - u - v) + uv[idB * 2 + 1] * u + uv[idC * 2 + 1] * v;
    return x <= 2 && (!night || x * x + y * y > 0.9);
  }

  // src/collision/triangleDistance.js
  function triangleDistance(mesh, i, a, b, c, origin, direction, night) {
    const ex = b[0] - a[0], ey = b[1] - a[1], ez = b[2] - a[2];
    const fx = c[0] - a[0], fy = c[1] - a[1], fz = c[2] - a[2];
    const px = direction[1] * fz - direction[2] * fy;
    const py = direction[2] * fx - direction[0] * fz;
    const pz = direction[0] * fy - direction[1] * fx;
    const det = ex * px + ey * py + ez * pz;
    if (mesh.program.cullMode === "none" || mesh.program.cullFace === null ? Math.abs(det) < 1e-9 : det < 1e-9) return Infinity;
    const tx = origin[0] - a[0], ty = origin[1] - a[1], tz = origin[2] - a[2];
    const u = (tx * px + ty * py + tz * pz) / det;
    if (u < 0 || u > 1) return Infinity;
    const qx = ty * ez - tz * ey, qy = tz * ex - tx * ez, qz = tx * ey - ty * ex;
    const v = (direction[0] * qx + direction[1] * qy + direction[2] * qz) / det;
    if (v < 0 || u + v > 1) return Infinity;
    if (hiddenLightHit(mesh, i, u, v, night)) return Infinity;
    return (fx * qx + fy * qy + fz * qz) / det;
  }

  // src/collision/worldHit.js
  function worldHit(ray, mesh, origin, direction, closest, faceIndex) {
    const x = direction[0] * closest + origin[0];
    const y = direction[1] * closest + origin[1];
    const z = direction[2] * closest + origin[2];
    const matrix = mesh.worldMatrix;
    const w = matrix[3] * x + matrix[7] * y + matrix[11] * z + matrix[15];
    const worldPoint = (
      /* alloc */
      [
        (matrix[0] * x + matrix[4] * y + matrix[8] * z + matrix[12]) / w,
        (matrix[1] * x + matrix[5] * y + matrix[9] * z + matrix[13]) / w,
        (matrix[2] * x + matrix[6] * y + matrix[10] * z + matrix[14]) / w
      ]
    );
    return (
      /* alloc */
      {
        faceIndex,
        object: mesh,
        point: worldPoint,
        distance: Math.hypot(worldPoint[0] - ray.origin[0], worldPoint[1] - ray.origin[1], worldPoint[2] - ray.origin[2])
      }
    );
  }

  // src/collision/intersectMeshes.js
  function intersectMeshes(ray, meshes, night = 0) {
    const hits = (
      /* alloc */
      []
    );
    const a = (
      /* alloc */
      [0, 0, 0]
    ), b = (
      /* alloc */
      [0, 0, 0]
    ), c = (
      /* alloc */
      [0, 0, 0]
    );
    const origin = (
      /* alloc */
      [0, 0, 0]
    ), direction = (
      /* alloc */
      [0, 0, 0]
    );
    let mesh, position, index, instanceOffset, vertices, closest, faceIndex, i, distance;
    for (mesh of meshes) {
      localRay(ray, mesh, origin, direction);
      if (!rayBounds(mesh, origin, direction)) continue;
      ({ position, index, instanceOffset } = mesh.geometry.attributes);
      vertices = index?.count || position.count;
      closest = Infinity, faceIndex = void 0;
      for (i = 0; i < vertices * (instanceOffset?.count ?? 1); i += 3) {
        readTriangle(mesh, i, a, b, c);
        distance = triangleDistance(mesh, i, a, b, c, origin, direction, night);
        if (distance > 0 && distance < closest) {
          closest = distance;
          faceIndex = i / 3;
        }
      }
      if (faceIndex === void 0) continue;
      hits.push(worldHit(ray, mesh, origin, direction, closest, faceIndex));
    }
    return sortHits(hits);
  }

  // src/scene/traverse.js
  function traverse(node, callback, context) {
    if (callback(node, context)) return;
    let child;
    for (child of node.children) traverse(child, callback, context);
  }

  // src/picking/collectVisibleMesh.js
  function collectVisibleMesh2(mesh, meshes) {
    if (!mesh.visible) return true;
    if (mesh.geometry && mesh._appearance !== 0) meshes.push(mesh);
  }

  // src/geometry/interpolateRoute.js
  function along(points, lengths, s, target) {
    let i = 1, end = lengths.length - 1;
    let middle;
    while (i < end) {
      middle = i + Math.floor((end - i) / 2);
      if (lengths[middle] < s) i = middle + 1;
      else end = middle;
    }
    const a = points[i - 1], b = points[i], d = lengths[i] - lengths[i - 1] || 1;
    const t = (s - lengths[i - 1]) / d;
    target ||= /* alloc */
    {};
    target.x = a[0] + (b[0] - a[0]) * t;
    target.y = (a[2] ?? 0) + ((b[2] ?? 0) - (a[2] ?? 0)) * t;
    target.z = a[1] + (b[1] - a[1]) * t;
    target.dx = (b[0] - a[0]) / d;
    target.dz = (b[1] - a[1]) / d;
    return target;
  }

  // src/traffic/locateTraffic.js
  function locateTraffic(state, trip, target) {
    const { points, lengths, length } = trip.lane;
    let distance = trip.distance + state.elapsed * trip.speed;
    distance -= length * Math.floor(distance / length);
    const position = along(points, lengths, distance, target);
    position.x -= position.dz * state.side;
    position.z += position.dx * state.side;
    return position;
  }

  // src/traffic/placeTraffic.js
  function placeTraffic(state) {
    if (!state.mesh || !state.stale) return;
    state.stale = false;
    const { position, normal } = state.mesh.geometry.attributes;
    const target = state.position ||= /* alloc */
    {};
    let i, trip, cx, y, cz, dx, dz, k, o, lx, lz, nx, nz;
    for (i = 0; i < state.trips.length; i++) {
      trip = state.trips[i];
      ({ x: cx, y, z: cz, dx, dz } = locateTraffic(state, trip, target));
      for (k = 0, o = i * state.stride; k < state.stride; k += 3, o += 3) {
        lx = state.template.position[k], lz = state.template.position[k + 2], nx = state.template.normal[k], nz = state.template.normal[k + 2];
        position.data[o] = cx - lx * dz - lz * dx;
        position.data[o + 1] = y + state.template.position[k + 1];
        position.data[o + 2] = cz + lx * dx - lz * dz;
        normal.data[o] = -nx * dz - nz * dx;
        normal.data[o + 1] = state.template.normal[k + 1];
        normal.data[o + 2] = nx * dx - nz * dz;
      }
    }
  }

  // src/picking/validateCameraInverse.js
  function validateCameraInverse(matrix) {
    let column, row;
    for (column = 1; column <= 4; column++) {
      for (row = 1; row <= 4; row++) {
        if (!Number.isFinite(matrix[`m${column}${row}`])) throw (
          /* alloc */
          new Error("Singular 3D transform")
        );
      }
    }
  }

  // src/picking/raycast.js
  function raycast(layer, event, objects = rootByLayer.get(layer).children, recursive = true) {
    if (!rendererByLayer.get(layer)) {
      return (
        /* alloc */
        []
      );
    }
    const traffic = trafficByLayer.get(layer);
    if (traffic) placeTraffic(traffic);
    const rect = layer._map.getContainer().getBoundingClientRect();
    updateWorldMatrix(sceneByLayer.get(layer));
    updateCamera(cameraByLayer.get(layer));
    const inverseCamera = raycasterByLayer.get(layer).inverse;
    const matrix = cameraByLayer.get(layer).projectionViewMatrix;
    inverseCamera.m11 = matrix[0], inverseCamera.m12 = matrix[1], inverseCamera.m13 = matrix[2], inverseCamera.m14 = matrix[3];
    inverseCamera.m21 = matrix[4], inverseCamera.m22 = matrix[5], inverseCamera.m23 = matrix[6], inverseCamera.m24 = matrix[7];
    inverseCamera.m31 = matrix[8], inverseCamera.m32 = matrix[9], inverseCamera.m33 = matrix[10], inverseCamera.m34 = matrix[11];
    inverseCamera.m41 = matrix[12], inverseCamera.m42 = matrix[13], inverseCamera.m43 = matrix[14], inverseCamera.m44 = matrix[15];
    inverseCamera.invertSelf();
    const x = (event.clientX - rect.left) / rect.width * 2 - 1;
    const y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    const endX = inverseCamera.m11 * x + inverseCamera.m21 * y + inverseCamera.m41;
    const endY = inverseCamera.m12 * x + inverseCamera.m22 * y + inverseCamera.m42;
    const endZ = inverseCamera.m13 * x + inverseCamera.m23 * y + inverseCamera.m43;
    const endW = inverseCamera.m14 * x + inverseCamera.m24 * y + inverseCamera.m44;
    let object;
    validateCameraInverse(inverseCamera);
    raycasterByLayer.get(layer).origin[0] = cameraByLayer.get(layer).position[0];
    raycasterByLayer.get(layer).origin[1] = cameraByLayer.get(layer).position[1];
    raycasterByLayer.get(layer).origin[2] = cameraByLayer.get(layer).position[2];
    raycasterByLayer.get(layer).direction[0] = endX / endW - raycasterByLayer.get(layer).origin[0];
    raycasterByLayer.get(layer).direction[1] = endY / endW - raycasterByLayer.get(layer).origin[1];
    raycasterByLayer.get(layer).direction[2] = endZ / endW - raycasterByLayer.get(layer).origin[2];
    const direction = raycasterByLayer.get(layer).direction;
    const rayLength = Math.hypot(direction[0], direction[1], direction[2]) || 1;
    raycasterByLayer.get(layer).direction[0] /= rayLength;
    raycasterByLayer.get(layer).direction[1] /= rayLength;
    raycasterByLayer.get(layer).direction[2] /= rayLength;
    const meshes = raycasterByLayer.get(layer).meshes;
    meshes.length = 0;
    for (object of objects) {
      if (recursive) traverse(object, collectVisibleMesh2, meshes);
      else if (object.geometry && object.visible && object._appearance !== 0) meshes.push(object);
    }
    return intersectMeshes(raycasterByLayer.get(layer), meshes, rendererByLayer.get(layer).uniformData?.[55]);
  }

  // src/native/restoreNativeEvents.js
  function restoreNativeEvents() {
    const { map, descriptor, handle } = this;
    if (map._fireDOMEvent !== handle) return;
    if (descriptor) Object.defineProperty(map, "_fireDOMEvent", descriptor);
    else delete map._fireDOMEvent;
  }

  // src/weakmaps/renderers.js
  var renderers = /* @__PURE__ */ new WeakMap();

  // src/globals/coreEventTypes.js
  var coreEventTypes = /* @__PURE__ */ new Set([
    "click",
    "preclick",
    "dblclick",
    "contextmenu",
    "mousedown",
    "mouseup",
    "mousemove",
    "mouseover",
    "mouseout",
    "pointerdown",
    "pointerup",
    "pointermove",
    "pointerover",
    "pointerout"
  ]);

  // src/native/nativeEventSource.js
  init_L();

  // src/native/compareNativeHits.js
  function compareNativeHits(a, b) {
    return b.object.renderOrder - a.object.renderOrder || a.distance - b.distance;
  }

  // src/native/nativeEventSource.js
  function nativeEventSource(context, event, type) {
    const hits = (
      /* alloc */
      []
    );
    let candidate, source, layer;
    if (type !== context.out) {
      for (candidate of context.states) {
        ({ source, backend: layer } = candidate);
        if (source instanceof L.Marker || source.options.interactive === false || !(source instanceof L.Path) && !source.options.interactive) continue;
        hits.push(...raycast(layer, event, candidate.meshes.values(), false));
      }
    }
    hits.sort(compareNativeHits);
    return hits[0]?.object._nativeSource || null;
  }

  // src/native/updateNativeHover.js
  function updateNativeHover(map, context, event, source) {
    if (context.hovered === source) return;
    if (context.hovered) context.fireDOMEvent.call(
      map,
      event,
      context.out,
      /* alloc */
      [context.hovered]
    );
    context.hovered = source;
    if (source) context.fireDOMEvent.call(
      map,
      event,
      context.over,
      /* alloc */
      [source]
    );
    map.getContainer().style.cursor = source ? "pointer" : "";
  }

  // src/native/bypassNativeEvent.js
  function bypassNativeEvent(map, context, event, type) {
    const target = event.target;
    const dom = target instanceof Element && target.closest(".leaflet-marker-icon,.leaflet-popup,.leaflet-tooltip,.leaflet-control");
    if (dom && context.hovered && (type === context.move || type === context.out)) {
      updateNativeHover(map, context, event, null);
    }
    return dom || type === context.move && (map.dragging?.moving() || map._animatingZoom);
  }

  // src/native/handleNativeMapEvent.js
  function handleNativeMapEvent(event, type = event.type, targets) {
    const map = this, context = nativeEventMaps.get(map), fireDOMEvent = context.fireDOMEvent;
    const owner = renderers.get(map);
    if (!rendererByLayer.get(owner) || targets || !coreEventTypes.has(type)) {
      return fireDOMEvent.call(this, event, type, targets);
    }
    if (bypassNativeEvent(map, context, event, type)) {
      return fireDOMEvent.call(this, event, type, targets);
    }
    let source = nativeEventSource(context, event, type);
    if ((type === "click" || type === "preclick") && source && map._draggableMoved(source)) source = null;
    if (type === context.move || type === context.out) {
      updateNativeHover(map, context, event, source);
    }
    return fireDOMEvent.call(this, event, type, source ? (
      /* alloc */
      [source]
    ) : void 0);
  }

  // src/native/nativeEvents.js
  function nativeEvents(state) {
    const { map } = state;
    let context = nativeEventMaps.get(map);
    if (!context) {
      context = /* alloc */
      {
        map,
        states: (
          /* alloc */
          /* @__PURE__ */ new Set()
        ),
        hovered: null
      };
      const pointer = L.version.startsWith("2");
      context.move = pointer ? "pointermove" : "mousemove";
      context.out = pointer ? "pointerout" : "mouseout";
      context.over = pointer ? "pointerover" : "mouseover";
      context.descriptor = Object.getOwnPropertyDescriptor(map, "_fireDOMEvent");
      context.fireDOMEvent = map._fireDOMEvent;
      context.handle = handleNativeMapEvent;
      context.restore = restoreNativeEvents;
      nativeEventMaps.set(map, context);
      map._fireDOMEvent = handleNativeMapEvent;
    }
    context.states.add(state);
    state._nativeEventContext = context;
  }

  // src/native/refreshNativeEvent.js
  init_L();
  function refreshNativeEvent(event) {
    if (event?.type === "zoomend" && this.source instanceof L.Polyline && (!this.source.options.stroke || !(Number(this.source.options.weight) > 0))) return;
    if (event?.type === "zoomend" && this.strokeCoordinates && (!this.dirty || this.zoomOnly)) {
      this.zoomOnly = true;
      this.dirty = true;
      update(this.backend);
      return;
    }
    if (event?.type === "terrainchange" && this.marker) this.source.update();
    refreshNativeLayer(this);
  }

  // src/native/updateNativeLayerView.js
  function updateNativeLayerView() {
    this.viewDirty = true;
    if (sharedByLayer.get(this.backend)) update(this.backend);
  }

  // src/native/removeNativeEvents.js
  function removeNativeEvents(state) {
    const context = state._nativeEventContext;
    if (!context) return;
    const { map } = context;
    context.states.delete(state);
    if (context.hovered === state.source) {
      context.hovered = null;
      map.getContainer().style.cursor = "";
    }
    state._nativeEventContext = null;
    if (context.states.size) return;
    context.restore();
    nativeEventMaps.delete(map);
  }

  // src/native/disposeNativeLayer.js
  function disposeNativeLayer() {
    const state = this;
    if (state.disposed) return;
    state.disposed = true;
    const { source, map, backend: layer, meshes, textures, images } = state;
    const events = "load tileload tileunload move drag";
    source.off(events, refreshNativeEvent, state);
    map.off("zoomend terrainchange", refreshNativeEvent, state);
    if (state.marker) map.off("move zoom rotate pitch resize viewreset", updateNativeLayerView, state);
    removeNativeEvents(state);
    let name, methods, mesh, texture, image;
    for ([name, methods] of state.methods) {
      if (methods.own) Object.defineProperty(source, name, methods.own);
      else delete source[name];
    }
    for (mesh of meshes.values()) disposeMesh(layer, mesh);
    meshes.clear();
    for (texture of textures.values()) destroyTexture(layer, texture.texture);
    textures.clear();
    for (image of images) {
      image.removeEventListener("load", nativeImageRefresh);
      image.removeEventListener("error", nativeImageError);
      removeImageState(image, state);
    }
    nativeRenderByLayer.delete(layer);
    layer.remove();
  }

  // src/native/resolveNativeReady.js
  function resolveNativeReady() {
    this.ready.resolve();
  }

  // src/native/rejectNativeReady.js
  function rejectNativeReady({ error }) {
    this.ready.reject(error);
  }

  // src/native/forwardNativeError.js
  function forwardNativeError({ error }) {
    this.source.fire(
      "error",
      /* alloc */
      { error }
    );
  }

  // src/native/nativeLayer.js
  async function nativeLayer(state) {
    const { source, map } = state;
    const layer = state.backend = createLayer(
      /* alloc */
      {
        source: (
          /* alloc */
          { type: "vector" }
        )
      }
    );
    state.meshes = /* alloc */
    /* @__PURE__ */ new Map();
    state.textures = /* alloc */
    /* @__PURE__ */ new Map();
    state.methods = /* alloc */
    /* @__PURE__ */ new Map();
    state.images = /* alloc */
    /* @__PURE__ */ new Set();
    if (!nativeGPUOrderByMap.get(map)) nativeGPUOrderByMap.set(map, 0);
    if (!nativeGPUBackByMap.get(map)) nativeGPUBackByMap.set(map, 0);
    state.dirty = true;
    state.viewDirty = true;
    state.failed = false;
    state.order = nativeGPUOrderByMap.get(map) + 1;
    nativeGPUOrderByMap.set(map, state.order);
    state.marker = source instanceof L.Marker;
    state.paneOrder = Number(getComputedStyle(source.getPane()).zIndex) || 0;
    state.disposed = false;
    const currentEvents = "load tileload tileunload move drag";
    source.on(currentEvents, refreshNativeEvent, state);
    map.on("zoomend terrainchange", refreshNativeEvent, state);
    if (state.marker) map.on("move zoom rotate pitch resize viewreset", updateNativeLayerView, state);
    nativeEvents(state);
    let name, own, original;
    for (name in nativeMethodHandlers) {
      if (typeof source[name] !== "function") continue;
      own = Object.getOwnPropertyDescriptor(source, name), original = source[name];
      state.methods.set(
        name,
        /* alloc */
        { own, original }
      );
      source[name] = nativeMethodHandlers[name];
    }
    const ready = state.ready = Promise.withResolvers();
    layer.once("ready", resolveNativeReady, state);
    layer.once("error", rejectNativeReady, state);
    layer.on("error", forwardNativeError, state);
    refreshNativeLayer(state);
    layer.addTo(map);
    try {
      await ready.promise;
    } catch (error) {
      disposeNativeLayer.call(state);
      throw error;
    }
    if (!current(state)) return source;
    nativeRenderByLayer.set(layer, state);
    try {
      synchronizeNativeLayer(state);
    } catch (error) {
      disposeNativeLayer.call(state);
      throw error;
    }
    update(state.backend);
    return source;
  }

  // src/native/removeTargets.js
  function removeTargets(state) {
    if (nativeGPUByLayer.get(state.source) === state) nativeGPUByLayer.set(state.source, null);
    if (state.backend) disposeNativeLayer.call(state);
    let element;
    for (element of state.hidden) {
      element.classList.remove("leaflet-webgpu-target");
    }
  }

  // src/native/readyNativeGPU.js
  function readyNativeGPU(state) {
    if (nativeGPUByLayer.get(state.source) !== state) return state.source;
    return nativeLayer(state);
  }

  // src/scene/reportLayerError.js
  function reportError(source, error) {
    source.fire(
      "error",
      /* alloc */
      { error }
    );
  }

  // src/native/initNativeGPU.js
  function initNativeGPU(source, map) {
    if (nativeGPUByLayer.get(source)) return;
    if (!document.getElementById("leaflet-webgpu-targets")) {
      const style = document.createElement("style");
      style.id = "leaflet-webgpu-targets";
      style.textContent = ".leaflet-webgpu-target{opacity:0!important}";
      document.head.append(style);
    }
    const state = (
      /* alloc */
      {
        source,
        map,
        hidden: (
          /* alloc */
          /* @__PURE__ */ new Set()
        )
      }
    );
    nativeGPUByLayer.set(source, state);
    hideTargets(state);
    source.once("remove", removeTargets.bind(null, state));
    readyByLayer.set(source, Promise.resolve().then(readyNativeGPU.bind(null, state)));
    readyByLayer.get(source).catch(reportError.bind(null, source));
  }

  // src/globals/cameraAngles.js
  var cameraAngles = [1, 0, 1, 0];

  // src/projections/toPoint.js
  init_L();
  function pointOf(point) {
    return (
      /* alloc */
      new L.Point(
        Array.isArray(point) ? point[0] : point.x,
        Array.isArray(point) ? point[1] : point.y
      )
    );
  }

  // src/projections/cameraAngles.js
  init_radians();
  init_mapGetBearing();
  init_mapGetPitch();
  function angles(map, target) {
    const bearing = mapGetBearing(map) * radians, pitch = mapGetPitch(map) * radians;
    target ||= /* alloc */
    [];
    target[0] = Math.cos(bearing);
    target[1] = Math.sin(bearing);
    target[2] = Math.cos(pitch);
    target[3] = Math.sin(pitch);
    return target;
  }

  // src/projections/projectCameraPoint.js
  function project(map, point, inverse = false, limit = false, height = 0) {
    const size = map.getSize(), halfX = size.x / 2, halfY = size.y / 2, distance = size.y * 1.5;
    const result = pointOf(point);
    if (!distance) return result;
    const [cos, sin, tilt, rise] = angles(map, cameraAngles);
    const x = result.x - halfX, y = result.y - halfY;
    if (inverse) {
      const far = size.y * map.options.pitchMaxDistance;
      const denominator = tilt * distance + rise * y;
      let v2 = denominator * tilt > 0 ? (y * (distance - tilt * height) + distance * rise * height) / denominator : -far;
      if (limit) v2 = Math.max(-far, Math.min(far, v2));
      const u2 = x * (distance - rise * v2 - tilt * height) / distance;
      result.x = cos * u2 + sin * v2 + halfX;
      result.y = -sin * u2 + cos * v2 + halfY;
      return result;
    }
    const u = cos * x - sin * y, v = sin * x + cos * y;
    const scale = distance / (distance - rise * v - tilt * height);
    result.x = u * scale + halfX;
    result.y = (tilt * v - rise * height) * scale + halfY;
    return result;
  }

  // src/camera/mapLayerPointToContainerPoint.js
  function mapLayerPointToContainerPoint(point) {
    return project(this, animationPoint(this, mapMethods.value.layerPointToContainerPoint.call(this, point)));
  }

  // src/camera/mapContainerPointToLayerPoint.js
  function mapContainerPointToLayerPoint(point) {
    return mapMethods.value.containerPointToLayerPoint.call(this, animationPoint(this, project(this, point, true), true));
  }

  // src/camera/mapGetCenterLayerPoint.js
  function mapGetCenterLayerPoint() {
    return mapMethods.value.containerPointToLayerPoint.call(this, this.getSize().divideBy(2));
  }

  // src/camera/mapPanBy.js
  function mapPanBy(offset, options) {
    const half = this.getSize().divideBy(2);
    const ground = half.subtract(project(this, half.subtract(pointOf(offset)), true));
    return mapMethods.value.panBy.call(this, ground, options);
  }

  // src/camera/mapSetZoomAround.js
  init_L();
  init_mapGetPitch();
  init_mapGetBearing();
  function mapSetZoomAround(latlng, zoom, options) {
    if (!mapGetPitch(this) && !mapGetBearing(this)) return mapMethods.value.setZoomAround.call(this, latlng, zoom, options);
    zoom = this._limitZoom(zoom);
    const scale = this.getZoomScale(zoom), half = this.getSize().divideBy(2);
    const screen2 = latlng instanceof L.Point ? latlng : this.latLngToContainerPoint(latlng);
    const center = this.containerPointToLayerPoint(half), anchor = this.containerPointToLayerPoint(screen2);
    const next = center.add(anchor.subtract(center).multiplyBy(1 - 1 / scale));
    return this.setView(
      this.layerPointToLatLng(next),
      zoom,
      /* alloc */
      { zoom: options }
    );
  }

  // src/globals/cameraZeroPadding.js
  var cameraZeroPadding = Object.freeze([0, 0]);

  // src/camera/mapPanInside.js
  init_mapGetPitch();
  init_mapGetBearing();
  function mapPanInside(latlng, options = (
    /* alloc */
    {}
  )) {
    if (!mapGetPitch(this) && !mapGetBearing(this)) return mapMethods.value.panInside.call(this, latlng, options);
    const min = pointOf(options.paddingTopLeft || options.padding || cameraZeroPadding);
    const max = this.getSize().subtract(pointOf(options.paddingBottomRight || options.padding || cameraZeroPadding));
    const screen2 = this.latLngToContainerPoint(latlng);
    const safe = min;
    safe.x = Math.max(min.x, Math.min(max.x, screen2.x));
    safe.y = Math.max(min.y, Math.min(max.y, screen2.y));
    if (safe.equals(screen2)) return this;
    const delta = this.latLngToLayerPoint(latlng).subtract(this.containerPointToLayerPoint(safe));
    return this.panTo(this.unproject(this.project(this.getCenter()).add(delta)), options);
  }

  // src/camera/mapLimitCenter.js
  init_L();
  init_mapGetPitch();
  init_mapGetBearing();

  // src/projections/groundBounds.js
  init_L();
  function groundBounds(map, padding = cameraZeroPadding, height = 0) {
    const min = pointOf(padding).divideBy(2), max = map.getSize().subtract(min);
    const bounds = (
      /* alloc */
      new L.Bounds()
    );
    const minX = min.x, minY = min.y;
    let i;
    for (i = 0; i < 4; i++) {
      min.x = i % 2 ? max.x : minX;
      min.y = i < 2 ? minY : max.y;
      bounds.extend(project(map, min, true, true, height));
    }
    return bounds;
  }

  // src/camera/mapLimitCenter.js
  function mapLimitCenter(center, zoom, bounds) {
    if (!bounds || !this._loaded || !mapGetPitch(this) && !mapGetBearing(this)) {
      return mapMethods.value._limitCenter.call(this, center, zoom, bounds);
    }
    const half = this.getSize().divideBy(2), footprint = groundBounds(this), point = this.project(center, zoom);
    const view = (
      /* alloc */
      new L.Bounds(point.add(footprint.min.subtract(half)), point.add(footprint.max.subtract(half)))
    );
    const offset = this._getBoundsOffset(view, bounds, zoom);
    return Math.abs(offset.x) <= 1 && Math.abs(offset.y) <= 1 ? center : this.unproject(point.add(offset), zoom);
  }

  // src/camera/mapLimitOffset.js
  init_mapGetPitch();
  init_mapGetBearing();
  function mapLimitOffset(offset, bounds) {
    if (!bounds || !mapGetPitch(this) && !mapGetBearing(this)) return mapMethods.value._limitOffset.call(this, offset, bounds);
    const half = this.getSize().divideBy(2), ground = half.subtract(project(this, half.subtract(offset), true));
    const center = this.project(this.getCenter());
    const limited = this.project(this._limitCenter(this.unproject(center.add(ground)), this.getZoom(), bounds));
    return half.subtract(project(this, half.subtract(limited.subtract(center))));
  }

  // src/camera/mapGetBoundsCenterZoom.js
  init_mapGetPitch();
  init_mapGetBearing();

  // src/camera/fitCameraBounds.js
  init_L();
  init_cameraEmptyOptions();

  // src/projections/verticalGroundY.js
  function verticalGroundY(y, tilt, distance, rise, far) {
    return tilt * distance + rise * y > 0 ? Math.max(-far, Math.min(far, y * distance / (tilt * distance + rise * y))) : -far;
  }

  // src/camera/fitCameraBounds.js
  function fitCameraBounds(map, bounds, options = cameraEmptyOptions) {
    bounds = bounds.getBounds ? bounds.getBounds() : bounds instanceof L.LatLngBounds ? bounds : (
      /* alloc */
      new L.LatLngBounds(bounds)
    );
    const zoom = map.getZoom() ?? 0, half = map.getSize().divideBy(2), distance = map.getSize().y * 1.5;
    const min = pointOf(options.paddingTopLeft || options.padding || cameraZeroPadding).subtract(half);
    const max = half.subtract(pointOf(options.paddingBottomRight || options.padding || cameraZeroPadding));
    const [cos, sin, tilt, rise] = angles(map, cameraAngles);
    if (tilt < 0) {
      const y2 = min.y;
      min.y = -max.y;
      max.y = -y2;
    }
    const far = map.getSize().y * map.options.pitchMaxDistance;
    const top = verticalGroundY(min.y, Math.abs(tilt), distance, rise, far);
    const bottom = verticalGroundY(max.y, Math.abs(tilt), distance, rise, far);
    const origin = map.project(bounds.getNorthWest(), zoom).add(map.project(bounds.getSouthEast(), zoom)).divideBy(2);
    let low = Infinity, high = -Infinity;
    const leftSlope = min.x * rise / distance, rightSlope = max.x * rise / distance;
    const slope = rightSlope - leftSlope;
    let left = Infinity, right = -Infinity;
    const corners = (
      /* alloc */
      [bounds.getNorthWest(), bounds.getNorthEast(), bounds.getSouthWest(), bounds.getSouthEast()]
    );
    let i, latlng, p, x, y;
    for (i = 0; i < 4; i++) {
      latlng = corners[i];
      p = map.project(latlng, zoom).subtract(origin);
      x = cos * p.x - sin * p.y;
      y = sin * p.x + cos * p.y;
      low = Math.min(low, y);
      high = Math.max(high, y);
      left = Math.min(left, x + leftSlope * y);
      right = Math.max(right, x + rightSlope * y);
    }
    const scale = Math.min(
      (bottom - top) / (high - low),
      (max.x - min.x - slope * top) / (right - left - slope * low)
    );
    let target = map.getScaleZoom(scale, zoom);
    const snap = map.options.zoomSnap;
    if (snap) target = Math.floor(Math.round(target / (snap / 100)) / 100) * snap;
    target = Math.max(map.getMinZoom(), Math.min(map.getMaxZoom(), options.maxZoom ?? Infinity, target));
    if (!Number.isFinite(target)) return (
      /* alloc */
      { center: bounds.getCenter(), zoom: target }
    );
    const actual = map.getZoomScale(target, zoom);
    const vMin = high * actual - bottom, vMax = low * actual - top;
    const v = Math.max(vMin, slope ? (actual * (right - left) - max.x + min.x) / slope : vMin);
    const centerY = (Math.min(vMax, v) + vMax) / 2;
    const centerX = (actual * (left + right) - min.x - max.x - (leftSlope + rightSlope) * centerY) / 2;
    origin.x += (cos * centerX + sin * centerY) / actual;
    origin.y += (-sin * centerX + cos * centerY) / actual;
    return (
      /* alloc */
      { center: map.unproject(origin, zoom), zoom: target }
    );
  }

  // src/camera/mapGetBoundsCenterZoom.js
  function mapGetBoundsCenterZoom(bounds, options) {
    return mapGetPitch(this) || mapGetBearing(this) ? fitCameraBounds(this, bounds, options) : mapMethods.value._getBoundsCenterZoom.call(this, bounds, options);
  }

  // src/camera/mapGetBoundsZoom.js
  init_L();
  init_mapGetPitch();
  init_mapGetBearing();
  function mapGetBoundsZoom(bounds, inside2, padding) {
    if (!mapGetPitch(this) && !mapGetBearing(this)) return mapMethods.value.getBoundsZoom.call(this, bounds, inside2, padding);
    if (!inside2) return fitCameraBounds(
      this,
      bounds,
      /* alloc */
      {
        padding: pointOf(padding || cameraZeroPadding).divideBy(2)
      }
    ).zoom;
    bounds = bounds instanceof L.LatLngBounds ? bounds : (
      /* alloc */
      new L.LatLngBounds(bounds)
    );
    const footprint = groundBounds(this, padding).getSize(), size = this.project(bounds.getSouthEast()).subtract(this.project(bounds.getNorthWest()));
    const zoom = this.getScaleZoom(Math.max(footprint.x / size.x, footprint.y / size.y));
    const snap = this.options.zoomSnap;
    return Math.max(this.getMinZoom(), Math.min(this.getMaxZoom(), snap ? Math.ceil(zoom / snap) * snap : zoom));
  }

  // src/camera/mapTryAnimatedPan.js
  function mapTryAnimatedPan(center, options) {
    const offset = this._getCenterOffset(center)._trunc();
    if (options?.animate !== true && !this.getSize().contains(offset)) return false;
    (mapMethods.value._panBy || mapMethods.value.panBy).call(this, offset, options);
    return true;
  }

  // src/camera/mapGetBounds.js
  init_L();
  init_mapGetPitch();
  init_mapGetBearing();
  function mapGetBounds() {
    if (!mapGetPitch(this) && !mapGetBearing(this)) return mapMethods.value.getBounds.call(this);
    const footprint = groundBounds(this), bounds = (
      /* alloc */
      new L.LatLngBounds()
    );
    let i, point, raw;
    for (i = 0; i < 2; i++) {
      point = i ? footprint.max : footprint.min;
      raw = mapMethods.value.containerPointToLayerPoint.call(this, animationPoint(this, point, true));
      bounds.extend(this.layerPointToLatLng(raw));
    }
    return bounds;
  }

  // src/weakmaps/cameraMaps.js
  var cameraMaps = /* @__PURE__ */ new WeakSet();

  // src/weakmaps/cameraReadyByMap.js
  var cameraReadyByMap = /* @__PURE__ */ new WeakMap();

  // src/camera/initializeCameraMap.js
  init_mapSetPitchAndBearing();
  init_updateSky();

  // src/camera/constrainCameraToBounds.js
  function constrainCameraToBounds() {
    if (this.options.maxBounds) this._panInsideMaxBounds();
  }

  // src/weakmaps/cameraDraggableByMap.js
  var cameraDraggableByMap = /* @__PURE__ */ new WeakMap();

  // src/camera/cleanupCameraMap.js
  init_pitchSkyByMap();
  init_cancelCameraAnimation();

  // src/controls/adjustCameraDrag.js
  init_mapGetPitch();
  init_mapGetBearing();
  function adjustCameraDrag() {
    const map = this;
    const draggable = cameraDraggableByMap.get(map);
    if (!mapGetPitch(map) && !mapGetBearing(map)) return;
    const half = map.getSize().divideBy(2), delta = draggable._newPos.subtract(draggable._startPos);
    const ground = half.subtract(project(map, half.subtract(delta), true));
    draggable._newPos = draggable._startPos.add(ground);
  }

  // src/camera/cleanupCameraMap.js
  function cleanupCameraMap() {
    cancelCameraAnimation(this);
    pitchSkyByMap.get(this)?.remove();
    if (cameraDraggableByMap.get(this)) {
      cameraDraggableByMap.get(this).off("predrag", adjustCameraDrag, this);
      cameraDraggableByMap.delete(this);
    }
  }

  // src/camera/cameraMapReady.js
  function cameraMapReady() {
    const draggable = this.dragging?._draggable;
    if (!draggable) return;
    cameraDraggableByMap.set(this, draggable);
    draggable.on("predrag", adjustCameraDrag, this);
  }

  // src/controls/loadCameraControls.js
  async function loadCameraControls(map) {
    try {
      const { cameraControls: cameraControls2 } = await Promise.resolve().then(() => (init_cameraControls(), cameraControls_exports));
      if (map._container?._leaflet_id) cameraControls2(map);
    } catch (error) {
      map.fire(
        "error",
        /* alloc */
        { error }
      );
      throw error;
    }
  }

  // src/utils/noOperation.js
  function noOperation() {
  }

  // src/camera/initializeCameraMap.js
  function initializeCameraMap() {
    cameraMaps.add(this);
    if (!document.getElementById("leaflet-camera-zoom-style")) {
      const style = document.createElement("style");
      style.id = "leaflet-camera-zoom-style";
      style.textContent = ".leaflet-camera-zoom .leaflet-marker-icon,.leaflet-camera-zoom .leaflet-marker-shadow,.leaflet-camera-zoom .leaflet-popup,.leaflet-camera-zoom .leaflet-tooltip{transition:none!important}";
      document.head.append(style);
    }
    mapSetPitchAndBearing(this, this.options.pitch, this.options.bearing);
    this.on("load resize pitch", updateSky);
    this.on("rotate pitch", constrainCameraToBounds, this);
    this.once("unload", cleanupCameraMap, this);
    this.whenReady(cameraMapReady, this);
    if (this.options.rotate || this.options.trackContainerMutation) {
      cameraReadyByMap.set(this, loadCameraControls(this));
      cameraReadyByMap.get(this).catch(noOperation);
    }
  }

  // src/core/markerSetIcon.js
  init_L();
  function markerSetIcon(icon) {
    if (!(icon instanceof L.DivIcon)) icon.options.crossOrigin ||= true;
    const result = markerMethods.value.setIcon.call(this, icon);
    if (this._map && !(icon instanceof L.DivIcon)) initNativeGPU(this, this._map);
    return result;
  }

  // src/core/markerGetEvents.js
  function markerGetEvents() {
    const events = markerMethods.value.getEvents.call(this);
    events.rotate = events.pitch = events.move = this.update;
    return events;
  }

  // src/projections/displayContainerPoint.js
  init_radians();
  function displayPoint(map, point, location2) {
    const shared = renderers.get(map), origin = shared && sceneOriginByLayer.get(shared);
    if (!streamTerrainByMap.get(map) || !origin) {
      return map.layerPointToContainerPoint(point).subtract(map._getMapPanePos());
    }
    const elevation = mapElevationOf(map, location2 || map.layerPointToLatLng(point)) ?? 0;
    const center = mapElevationOf(map, map.getCenter()) ?? 0;
    const zoom = cameraViewByMap.get(map)?.zoom ?? map.getZoom();
    const height = (elevation - center) * map.options.crs.scale(zoom) / (earthCirc * Math.cos(origin.lat * radians));
    const raw = animationPoint(map, mapMethods.value.layerPointToContainerPoint.call(map, point));
    return project(map, raw, false, false, height).subtract(map._getMapPanePos());
  }

  // src/core/markerSetPos.js
  function markerSetPos(point) {
    markerMethods.value._setPos.call(this, displayPoint(this._map, point, this.getLatLng()));
    let i, element, key, direction, options, anchor;
    for (i = 0; i < 2; i++) {
      element = i ? this._shadow : this._icon;
      key = i ? "shadowAnchor" : "iconAnchor";
      if (!element) continue;
      direction = markerCameraIconPoint(this, 1, 0), options = this.options.icon.options;
      anchor = options[key] || options.iconAnchor;
      element.style.transformOrigin = anchor ? `${anchor.x ?? anchor[0]}px ${anchor.y ?? anchor[1]}px` : "center";
      element.style.transform += ` rotate(${Math.atan2(direction.y, direction.x)}rad) scale(${this.options.scale})`;
    }
  }

  // src/native/refreshNativeLayerContract.js
  function refreshNativeLayerContract(layer = this) {
    const native = nativeGPUByLayer.get(layer);
    if (native?.backend && !native.disposed) refreshNativeLayer(native);
  }

  // src/core/markerUpdateZIndex.js
  function markerUpdateZIndex(offset) {
    markerMethods.value._updateZIndex.call(this, offset);
    const changed = cameraZIndexOffsetByLayer.get(this) !== offset;
    cameraZIndexOffsetByLayer.set(this, offset);
    if (changed) refreshNativeLayerContract(this);
  }

  // src/weakmaps/dragByHandler.js
  var dragByHandler = /* @__PURE__ */ new WeakMap();

  // src/core/cameraMarkerOnDrag.js
  init_L();
  function cameraMarkerOnDrag(event) {
    const map = this._marker._map;
    const screen2 = L.DomUtil.getPosition(this._marker._icon).add(map._getMapPanePos());
    const point = map.containerPointToLayerPoint(screen2);
    L.DomUtil.setPosition(this._marker._icon, point);
    dragByHandler.get(this)._cameraOriginalOnDrag.call(this, event);
    this._marker._setPos(point);
  }

  // src/core/adjustCameraMarkerPan.js
  init_L();
  init_mapGetPitch();
  init_mapGetBearing();

  // src/globals/pendingMarkerPan.js
  var pendingMarkerPan = /* @__PURE__ */ new Map();

  // src/globals/markerPanFrame.js
  var markerPanFrame = { value: null };

  // src/animations/runMarkerPanFrame.js
  function runMarkerPanFrame() {
    markerPanFrame.value = null;
    const pending = (
      /* alloc */
      [...pendingMarkerPan]
    );
    pendingMarkerPan.clear();
    let drag, event;
    for ([drag, event] of pending) {
      drag._panRequest = null;
      drag._adjustPan(event);
    }
  }

  // src/animations/scheduleMarkerPan.js
  function scheduleMarkerPan(drag, event) {
    pendingMarkerPan.set(drag, event);
    if (markerPanFrame.value === null) markerPanFrame.value = requestAnimationFrame(runMarkerPanFrame);
    drag._panRequest = markerPanFrame.value;
  }

  // src/core/adjustCameraMarkerPan.js
  function adjustCameraMarkerPan(event) {
    const marker = this._marker, map = marker._map;
    if (!mapGetPitch(map) && !mapGetBearing(map)) return dragByHandler.get(this)._cameraOriginalAdjustPan.call(this, event);
    const screen2 = L.DomUtil.getPosition(marker._icon).add(map._getMapPanePos());
    const size = map.getSize(), padding = pointOf(marker.options.autoPanPadding);
    const speed2 = marker.options.autoPanSpeed;
    const movement = screen2;
    movement.x = (Math.max(0, screen2.x - size.x + padding.x) - Math.max(0, padding.x - screen2.x)) / Math.max(1, padding.x) * speed2;
    movement.y = (Math.max(0, screen2.y - size.y + padding.y) - Math.max(0, padding.y - screen2.y)) / Math.max(1, padding.y) * speed2;
    if (!movement.x && !movement.y) return;
    const pane = map._getMapPanePos();
    map.panBy(
      movement,
      /* alloc */
      { animate: false }
    );
    const shift = pane.subtract(map._getMapPanePos());
    this._draggable._newPos._add(shift);
    this._draggable._startPos._add(shift);
    L.DomUtil.setPosition(marker._icon, this._draggable._newPos);
    this._onDrag(event);
    scheduleMarkerPan(this, event);
  }

  // src/core/cameraMarkerDrag.js
  function cameraMarkerDrag() {
    if (!this.dragging || dragByHandler.has(this.dragging)) return;
    const drag = this.dragging, original = drag._onDrag, adjustPan = drag._adjustPan;
    dragByHandler.set(
      drag,
      /* alloc */
      {
        _cameraOriginalOnDrag: original,
        _cameraOriginalAdjustPan: adjustPan
      }
    );
    drag._onDrag = cameraMarkerOnDrag;
    drag._adjustPan = adjustCameraMarkerPan;
    const enabled = drag.enabled();
    if (enabled) {
      drag._draggable.off("drag", original, drag);
      drag._draggable.on("drag", drag._onDrag, drag);
    }
  }

  // src/core/markerInitInteraction.js
  function markerInitInteraction() {
    const result = markerMethods.value._initInteraction.call(this);
    cameraMarkerDrag.call(this);
    return result;
  }

  // src/core/popupGetEvents.js
  function popupGetEvents() {
    const events = popupEvents.value.call(this);
    events.rotate = events.pitch = events.move = events.terrainchange = this._updatePosition;
    return events;
  }

  // src/core/tooltipGetEvents.js
  function tooltipGetEvents() {
    const events = tooltipEvents.value.call(this);
    events.rotate = events.pitch = events.move = events.terrainchange = this._updatePosition;
    return events;
  }

  // src/core/popupAdjustPan.js
  init_mapGetPitch();
  init_mapGetBearing();
  function popupAdjustPan() {
    const map = this._map;
    if (!mapGetPitch(map) && !mapGetBearing(map)) return popupPan.value.call(this);
    if (!this.options.autoPan) return;
    if (map._panAnim) map._panAnim.stop();
    if (this._autopanning) {
      this._autopanning = false;
      return;
    }
    const rect = this._container.getBoundingClientRect(), container = map.getContainer().getBoundingClientRect();
    const min = pointOf(this.options.autoPanPaddingTopLeft || this.options.autoPanPadding);
    const max = map.getSize().subtract(pointOf(this.options.autoPanPaddingBottomRight || this.options.autoPanPadding));
    const left = rect.left - container.left, top = rect.top - container.top;
    const right = rect.right - container.left, bottom = rect.bottom - container.top;
    const dx = Math.min(0, left - min.x) || Math.max(0, right - max.x);
    const dy = Math.min(0, top - min.y) || Math.max(0, bottom - max.y);
    if (!dx && !dy) return;
    if (this.options.keepInView) this._autopanning = true;
    const screen2 = map.latLngToContainerPoint(this._latlng);
    screen2.x -= dx;
    screen2.y -= dy;
    const delta = map.latLngToLayerPoint(this._latlng).subtract(map.containerPointToLayerPoint(screen2));
    map.fire("autopanstart");
    map.panTo(map.unproject(map.project(map.getCenter()).add(delta)));
  }

  // src/core/popupUpdatePosition.js
  init_L();
  function popupUpdatePosition() {
    popupPosition.value.call(this);
    if (!this._map) return;
    const point = this._map.latLngToLayerPoint(this._latlng), delta = displayPoint(this._map, point, this._latlng).subtract(point);
    if (this._zoomAnimated) {
      L.DomUtil.setPosition(this._container, L.DomUtil.getPosition(this._container).add(delta));
    } else {
      this._container.style.left = `${this._containerLeft + delta.x}px`;
      this._container.style.bottom = `${this._containerBottom - delta.y}px`;
    }
  }

  // src/core/tooltipSetPosition.js
  init_L();
  function tooltipSetPosition(point) {
    tooltipPosition.value.call(this, point);
    const delta = displayPoint(this._map, point, this._latlng).subtract(point);
    L.DomUtil.setPosition(this._container, L.DomUtil.getPosition(this._container).add(delta));
  }

  // src/core/gridlayerGetEvents.js
  init_L();
  function gridlayerGetEvents() {
    const events = gridEvents.value.call(this);
    events.rotate = events.pitch = L.Util.throttle(this._onMoveEnd, this.options.updateInterval, this);
    return events;
  }

  // src/core/gridlayerGetTiledPixelBounds.js
  init_L();
  init_mapGetBearing();
  init_mapGetPitch();

  // src/core/extendTerrainPixelBounds.js
  init_radians();
  function extendTerrainPixelBounds(layer, result, stream, origin) {
    const map = layer._map;
    let minimum = Infinity, maximum = -Infinity, key, entry;
    for ([key, entry] of stream.terrainCache) {
      if (!key.startsWith(`${layer._tileZoom}/`) || !entry.range) continue;
      minimum = Math.min(minimum, entry.range[0]);
      maximum = Math.max(maximum, entry.range[1]);
    }
    if (!Number.isFinite(minimum) || !Number.isFinite(maximum)) return result;
    const zoom = cameraViewByMap.get(map)?.zoom ?? map.getZoom();
    const scale = map.options.crs.scale(zoom) / (earthCirc * Math.cos(origin.lat * radians));
    const target = mapElevationOf(map, map.getCenter()) ?? 0;
    let i, j, footprint, point, raw;
    for (i = 0; i < 2; i++) {
      footprint = groundBounds(map, void 0, ((i ? maximum : minimum) - target) * scale);
      for (j = 0; j < 2; j++) {
        point = j ? footprint.max : footprint.min;
        raw = mapMethods.value.containerPointToLayerPoint.call(map, animationPoint(map, point, true));
        result.extend(map.project(map.layerPointToLatLng(raw), layer._tileZoom));
      }
    }
    return result;
  }

  // src/core/gridlayerGetTiledPixelBounds.js
  function gridlayerGetTiledPixelBounds(center) {
    const map = this._map, stream = streamTerrainByMap.get(map);
    if (!stream && !mapGetBearing(map) && !mapGetPitch(map)) return tiledBounds.value.call(this, center);
    const bounds = map.getBounds();
    const result = (
      /* alloc */
      new L.Bounds(
        map.project(bounds.getNorthWest(), this._tileZoom),
        map.project(bounds.getSouthEast(), this._tileZoom)
      )
    );
    const shared = renderers.get(map), origin = shared && sceneOriginByLayer.get(shared);
    if (!stream || !origin) return result;
    return extendTerrainPixelBounds(this, result, stream, origin);
  }

  // src/camera/mapCamera.js
  mapMethods.value = Object.defineProperties({}, Object.getOwnPropertyDescriptors(L.Map.prototype));
  L.Map.mergeOptions({
    rotate: true,
    bearing: 0,
    pitch: 0,
    maxPitch: 85,
    pitchMaxDistance: 3,
    rotateControl: true,
    shiftKeyRotate: true,
    pitchDrag: true,
    touchRotate: false,
    touchPitch: false,
    compassBearing: false
  });
  Object.assign(L.Map.prototype, {
    layerPointToContainerPoint: mapLayerPointToContainerPoint,
    containerPointToLayerPoint: mapContainerPointToLayerPoint,
    _getCenterLayerPoint: mapGetCenterLayerPoint,
    panBy: mapPanBy,
    setZoomAround: mapSetZoomAround,
    panInside: mapPanInside,
    _limitCenter: mapLimitCenter,
    _limitOffset: mapLimitOffset,
    _getBoundsCenterZoom: mapGetBoundsCenterZoom,
    getBoundsZoom: mapGetBoundsZoom,
    _tryAnimatedPan: mapTryAnimatedPan,
    getBounds: mapGetBounds
  });
  L.Map.addInitHook(initializeCameraMap);
  markerMethods.value = Object.defineProperties({}, Object.getOwnPropertyDescriptors(L.Marker.prototype));
  L.Marker.mergeOptions({ rotation: 0, rotateWithView: false, keepUpright: false, scale: 1 });
  Object.assign(L.Marker.prototype, {
    setIcon: markerSetIcon,
    getEvents: markerGetEvents,
    _setPos: markerSetPos,
    _updateZIndex: markerUpdateZIndex,
    _initInteraction: markerInitInteraction
  });
  popupEvents.value = L.Popup.prototype.getEvents;
  Object.assign(L.Popup.prototype, {
    getEvents: popupGetEvents
  });
  tooltipEvents.value = L.Tooltip.prototype.getEvents;
  Object.assign(L.Tooltip.prototype, {
    getEvents: tooltipGetEvents
  });
  popupPosition.value = L.Popup.prototype._updatePosition;
  popupPan.value = L.Popup.prototype._adjustPan;
  Object.assign(L.Popup.prototype, {
    _adjustPan: popupAdjustPan,
    _updatePosition: popupUpdatePosition
  });
  tooltipPosition.value = L.Tooltip.prototype._setPosition;
  Object.assign(L.Tooltip.prototype, {
    _setPosition: tooltipSetPosition
  });
  tiledBounds.value = L.GridLayer.prototype._getTiledPixelBounds;
  gridEvents.value = L.GridLayer.prototype.getEvents;
  Object.assign(L.GridLayer.prototype, {
    getEvents: gridlayerGetEvents,
    _getTiledPixelBounds: gridlayerGetTiledPixelBounds
  });

  // src/sunlight/initSunlight.js
  init_L();

  // src/weakmaps/timeControlByMap.js
  var timeControlByMap = /* @__PURE__ */ new WeakMap();

  // src/weakmaps/sunlightByControl.js
  var sunlightByControl = /* @__PURE__ */ new WeakMap();

  // src/weakmaps/sunByMap.js
  var sunByMap = /* @__PURE__ */ new WeakMap();

  // src/sunlight/createSun.js
  init_L();

  // src/sunlight/updateSky.js
  init_pitchSkyByMap();
  init_radians();
  init_mapGetPitch();
  init_mapGetBearing();

  // src/projections/projectCelestialBody.js
  function projectCelestialBody(dir, size, pitch, bearing, target) {
    const [x, y, z] = dir;
    const forward = -x * Math.sin(bearing) * Math.sin(pitch) - y * Math.cos(pitch) - z * Math.cos(bearing) * Math.sin(pitch);
    if (forward > 0) {
      target ||= /* alloc */
      {};
      target.left = size.x / 2 + size.y * 1.5 * (x * Math.cos(bearing) - z * Math.sin(bearing)) / forward;
      target.top = size.y / 2 - size.y * 1.5 * (-x * Math.sin(bearing) * Math.cos(pitch) + y * Math.sin(pitch) - z * Math.cos(bearing) * Math.cos(pitch)) / forward;
      return target;
    }
    return null;
  }

  // src/sunlight/updateCelestialDisc.js
  function updateCelestialDisc(disc, body, sky, size, pitch, bearing, projection) {
    disc.hidden = true;
    if (!sky || !body || body.altitude <= 0) return;
    if (disc.parentNode !== sky) sky.append(disc);
    const point = projectCelestialBody(body.direction, size, pitch, bearing, projection);
    if (!point) return;
    const { left, top } = point;
    disc.hidden = left < 0 || left > size.x || top < 0 || top > sky.clientHeight || sky.style.display === "none";
    disc.style.left = `${left}px`;
    disc.style.top = `${top}px`;
  }

  // src/sunlight/updateSky.js
  function updateSky2({ map, originalSky, sunDisc, moonDisc, projection }) {
    const sun = sunlightByMap.get(map), sky = pitchSkyByMap.get(map);
    if (sun) map.getContainer().style.setProperty("--leaflet-sky-background", sun.background);
    else if (originalSky) map.getContainer().style.setProperty("--leaflet-sky-background", originalSky);
    else map.getContainer().style.removeProperty("--leaflet-sky-background");
    const size = map.getSize(), pitch = mapGetPitch(map) * radians, bearing = mapGetBearing(map) * radians;
    updateCelestialDisc(sunDisc, sun, sky, size, pitch, bearing, projection);
    updateCelestialDisc(moonDisc, sun?.moon, sky, size, pitch, bearing, projection);
  }

  // src/globals/atmosphereStops.js
  var atmosphereStops = [
    [
      -18,
      [3, 7, 20],
      [17, 28, 54],
      [0.025, 0.04, 0.09]
    ],
    [
      -6,
      [37, 53, 84],
      [182, 106, 86],
      [0.12, 0.1, 0.14]
    ],
    [
      0,
      [101, 131, 171],
      [246, 170, 115],
      [0.38, 0.24, 0.18]
    ],
    [
      10,
      [74, 147, 208],
      [197, 221, 237],
      [0.8, 0.75, 0.68]
    ],
    [
      25,
      [53, 144, 213],
      [223, 238, 250],
      [1, 1, 1]
    ]
  ];

  // src/globals/atmosphereColor.js
  var atmosphereColor = [0, 0, 0];

  // src/colors/mixColor.js
  function mix(a, b, t, values) {
    values ||= /* alloc */
    [];
    values.length = a.length;
    let i;
    for (i = 0; i < a.length; i++) values[i] = a[i] + (b[i] - a[i]) * t;
    return values;
  }

  // src/colors/formatRGB.js
  function rgb(values) {
    let rounded = "", i;
    for (i = 0; i < values.length; i++) {
      if (i) rounded += ", ";
      rounded += Math.round(values[i]);
    }
    return `rgb(${rounded})`;
  }

  // src/sunlight/atmosphere.js
  function atmosphere(altitude) {
    if (!Number.isFinite(altitude)) {
      throw (
        /* alloc */
        new Error("Invalid solar altitude")
      );
    }
    const stops = atmosphereStops;
    let upper = -1;
    let i;
    for (i = 0; i < stops.length; i++) {
      if (stops[i][0] >= altitude) {
        upper = i;
        break;
      }
    }
    const b = stops[upper < 0 ? stops.length - 1 : upper], a = stops[Math.max(0, upper - 1)];
    const t = a === b || upper < 0 ? 1 : (altitude - a[0]) / (b[0] - a[0]);
    return (
      /* alloc */
      {
        background: `linear-gradient(${rgb(mix(a[1], b[1], t, atmosphereColor))}, ${rgb(mix(a[2], b[2], t, atmosphereColor))})`,
        tint: mix(a[3], b[3], t)
      }
    );
  }

  // src/astronomy/solarTime.js
  function solarTime(date, lat, lng) {
    const time = date instanceof Date ? Date.prototype.getTime.call(date) : typeof date === "string" ? Date.parse(date) : (
      /* alloc */
      new Date(date).getTime()
    );
    if (!Number.isFinite(time) || !Number.isFinite(lat) || Math.abs(lat) > 90 || !Number.isFinite(lng) || Math.abs(lng) > 180) {
      throw (
        /* alloc */
        new Error("Invalid solar date or location")
      );
    }
    return time;
  }

  // src/astronomy/horizontalPosition.js
  init_radians();
  function horizontalPosition(d, lat, lng, ascension, declination) {
    const hourAngle = (280.16 + 360.9856235 * d + lng) * radians - ascension;
    const latitude = lat * radians;
    const altitude = Math.asin(Math.sin(latitude) * Math.sin(declination) + Math.cos(latitude) * Math.cos(declination) * Math.cos(hourAngle));
    const southAzimuth = Math.atan2(
      Math.sin(hourAngle),
      Math.cos(hourAngle) * Math.sin(latitude) - Math.tan(declination) * Math.cos(latitude)
    );
    const azimuth = (southAzimuth / radians + 180 + 360) % 360;
    return (
      /* alloc */
      {
        altitude: altitude / radians,
        azimuth,
        direction: (
          /* alloc */
          [
            Math.sin(azimuth * radians) * Math.cos(altitude),
            Math.sin(altitude),
            -Math.cos(azimuth * radians) * Math.cos(altitude)
          ]
        )
      }
    );
  }

  // src/astronomy/moonPosition.js
  init_radians();

  // src/globals/sinObliquity.js
  init_radians();
  var sinObliquity = Math.sin(23.4397 * radians);

  // src/globals/cosObliquity.js
  init_radians();
  var cosObliquity = Math.cos(23.4397 * radians);

  // src/astronomy/moonPosition.js
  function moonPosition(date, lat, lng) {
    const d = solarTime(date, lat, lng) / 864e5 - 10957.5;
    const anomaly = (134.963 + 13.064993 * d) * radians;
    const longitude = (218.316 + 13.176396 * d + 6.289 * Math.sin(anomaly)) * radians;
    const latitude = 5.128 * Math.sin((93.272 + 13.22935 * d) * radians) * radians;
    const x = Math.cos(latitude) * Math.cos(longitude);
    const y = Math.cos(latitude) * Math.sin(longitude) * cosObliquity - Math.sin(latitude) * sinObliquity;
    const z = Math.cos(latitude) * Math.sin(longitude) * sinObliquity + Math.sin(latitude) * cosObliquity;
    return horizontalPosition(d, lat, lng, Math.atan2(y, x), Math.asin(z));
  }

  // src/astronomy/solarPosition.js
  init_radians();
  function solarPosition(date, lat, lng) {
    const time = solarTime(date, lat, lng);
    const d = time / 864e5 - 10957.5;
    const mean = (357.5291 + 0.98560028 * d) * radians;
    const longitude = mean + (1.9148 * Math.sin(mean) + 0.02 * Math.sin(2 * mean) + 3e-4 * Math.sin(3 * mean) + 102.9372 + 180) * radians;
    const declination = Math.asin(Math.sin(longitude) * sinObliquity);
    const ascension = Math.atan2(Math.sin(longitude) * cosObliquity, Math.cos(longitude));
    return horizontalPosition(d, lat, lng, ascension, declination);
  }

  // src/sunlight/requestSunlightRender.js
  function render2(map) {
    const renderer = renderers.get(map);
    if (renderer) update(renderer);
  }

  // src/sunlight/updateSun.js
  function updateSun(state) {
    const { control, map, date, slider, output, status } = state;
    try {
      if (control.live) control.time = /* alloc */
      /* @__PURE__ */ new Date();
      const time = control.time.toISOString();
      date.value = time.slice(0, 10);
      slider.value = String(control.time.getUTCHours() * 60 + control.time.getUTCMinutes());
      output.textContent = `${time.slice(11, 16)} UTC${control.live ? " \xB7 now" : ""}`;
      const center = map.getCenter();
      const sun = solarPosition(control.time, center.lat, center.lng);
      sunlightByMap.set(map, sun);
      Object.assign(sun, atmosphere(sun.altitude));
      sun.moon = moonPosition(control.time, center.lat, center.lng);
      status.textContent = sun.altitude <= 0 ? "Night \xB7 no direct sunlight" : sun.altitude < 3 ? "Low sun \xB7 shadows paused" : `Sun altitude ${sun.altitude.toFixed(1)}\xB0`;
      map.fire(
        "simulationtimechange",
        /* alloc */
        {
          time: (
            /* alloc */
            new Date(control.time)
          ),
          live: control.live
        }
      );
      updateSky2(state);
      render2(map);
    } catch (error) {
      sunlightByMap.delete(map);
      updateSky2(state);
      render2(map);
      status.textContent = `Error: ${error.message}`;
      console.error("Solar simulation", error);
    }
  }

  // src/sunlight/useLiveTime.js
  function useLiveTime(state) {
    state.control.live = true;
    updateSun(state);
  }

  // src/sunlight/useSelectedTime.js
  function useSelectedTime(state) {
    const { control, map, date, slider, status } = state;
    control.live = false;
    if (!date.value || !date.validity.valid) {
      control.time = /* alloc */
      /* @__PURE__ */ new Date(NaN);
      map.fire(
        "simulationtimechange",
        /* alloc */
        { time: null, live: false }
      );
      sunlightByMap.delete(map);
      updateSky2(state);
      render2(map);
      status.textContent = "Error: choose a valid solar date";
      return;
    }
    control.time = /* alloc */
    /* @__PURE__ */ new Date(`${date.value}T00:00:00Z`);
    control.time.setUTCMinutes(Number(slider.value));
    updateSun(state);
  }

  // src/sunlight/createSun.js
  function createSun(map) {
    const disc = "position:absolute;width:18px;height:18px;border-radius:50%;transform:translate(-50%,-50%);pointer-events:none;";
    const sunDisc = L.DomUtil.create("div", "sunlight-sun");
    const moonDisc = L.DomUtil.create("div", "sunlight-moon");
    sunDisc.style.cssText = disc + "background:#fff3bd;box-shadow:0 0 18px 7px #ffd27699;";
    moonDisc.style.cssText = disc + "background:#dce5f2;box-shadow:0 0 10px 2px #cbdcff55;";
    sunDisc.setAttribute("role", "img");
    sunDisc.setAttribute("aria-label", "Sun");
    moonDisc.setAttribute("role", "img");
    moonDisc.setAttribute("aria-label", "Moon");
    const container = L.DomUtil.create("div", "sunlight-control");
    container.style.cssText = "color:#222;width:min(200px,calc(100vw - 60px));font:12px/1.4 sans-serif;";
    const date = document.createElement("input");
    date.type = "date";
    date.style.cssText = "width:100%;box-sizing:border-box;";
    date.setAttribute("aria-label", "Solar date (UTC)");
    const slider = document.createElement("input");
    slider.type = "range";
    slider.style.cssText = "width:100%;box-sizing:border-box;margin:10px 0 4px;cursor:pointer;";
    slider.min = "0";
    slider.max = "1439";
    slider.step = "1";
    slider.setAttribute("aria-label", "Time of day (UTC)");
    const output = document.createElement("output");
    output.style.cssText = "font-weight:bold;font-variant-numeric:tabular-nums;";
    output.setAttribute("aria-live", "off");
    const now = document.createElement("button");
    now.type = "button";
    now.textContent = "Now";
    const timeRow = document.createElement("div");
    timeRow.className = "sunlight-time";
    timeRow.style.cssText = "display:flex;justify-content:space-between;align-items:center;";
    timeRow.append(output, now);
    const status = document.createElement("div");
    status.className = "sunlight-status";
    status.style.marginTop = "5px";
    status.setAttribute("role", "status");
    const note = document.createElement("small");
    note.style.color = "#555";
    container.append(date, slider, timeRow, status, note);
    const state = (
      /* alloc */
      {
        control: null,
        map,
        originalSky: "",
        container,
        sunDisc,
        moonDisc,
        date,
        slider,
        output,
        status,
        projection: (
          /* alloc */
          { left: 0, top: 0 }
        )
      }
    );
    state.update = updateSun.bind(null, state);
    state.updateSky = updateSky2.bind(null, state);
    now.onclick = useLiveTime.bind(null, state);
    date.onchange = slider.oninput = useSelectedTime.bind(null, state);
    L.DomEvent.disableClickPropagation(container);
    L.DomEvent.disableScrollPropagation(container);
    return state;
  }

  // src/sunlight/tickSun.js
  function tickSun(state) {
    if (state.control.live) updateSun(state);
  }

  // src/sunlight/onAddSun.js
  function onAddSun(control, map) {
    let state = sunByMap.get(map);
    if (state?.control && state.control !== control) {
      control._map = null;
      if (control.layer._map === map) map.removeLayer(control.layer);
      throw (
        /* alloc */
        new Error("Only one Time control can be active per map")
      );
    }
    if (!state) {
      state = createSun(map);
      sunByMap.set(map, state);
    }
    state.control = control;
    state.originalSky = map.getContainer().style.getPropertyValue("--leaflet-sky-background");
    timeControlByMap.set(map, control);
    sunlightByControl.set(control, state);
    state.update();
    state.timer = setInterval(tickSun, 6e4, state);
    map.on("moveend", state.update);
    map.on("move rotate pitch resize", state.updateSky);
    return state.container;
  }

  // src/layer-controls/placeEntry.js
  init_L();

  // src/layer-controls/placeEntryElement.js
  init_L();
  function placeEntryElement(input, layer, element) {
    const label = input.closest("label");
    if (element.classList.contains("layer-count")) {
      if (!input.hasAttribute("aria-label")) input.setAttribute("aria-label", label.textContent.trim());
      element.id = `leaflet-layer-count-${L.Util.stamp(layer)}`;
      input.setAttribute("aria-describedby", element.id);
      label.append(element);
    } else if (element.classList.contains("traffic-status")) {
      let group = label.nextElementSibling;
      if (!group?.classList.contains("traffic-status-group")) {
        group = L.DomUtil.create("div", "traffic-status-group");
        group.style.cssText = "display:flex;flex-wrap:wrap;gap:4px 8px;max-width:200px;margin:2px 0 6px 20px;";
        group.setAttribute("role", "group");
        group.setAttribute("aria-label", "Traffic counts");
        label.after(group);
      }
      group.append(element);
    } else label.after(element);
  }

  // src/layer-controls/layerControlInputId.js
  init_L();

  // src/globals/layerControlAddItem.js
  init_L();
  var layerControlAddItem = L?.LayersControl?.prototype._addItem;

  // src/layer-controls/layerControlInputId.js
  if (layerControlAddItem && !L.Control.Layers) L.LayersControl.prototype._addItem = addLayerControlInputId;
  function addLayerControlInputId(entry) {
    const label = layerControlAddItem.call(this, entry);
    label.querySelector(".leaflet-control-layers-selector").layerId = L.Util.stamp(entry.layer);
    return label;
  }

  // src/layer-controls/placeEntry.js
  function placeEntry(map, layer, element) {
    let input, entry;
    for (input of map.getContainer().querySelectorAll(".leaflet-control-layers-selector")) {
      entry = map._layers[input.layerId];
      if (input.layerId === L.Util.stamp(layer) || entry instanceof L.LayerGroup && entry.hasLayer(layer)) {
        placeEntryElement(input, layer, element);
        return true;
      }
    }
    return false;
  }

  // src/layer-controls/placeUnderEntry.js
  function placeUnderEntry(state) {
    const nested = placeEntry(state.map, state.layer, state.element);
    const onPlace = state.onPlace;
    onPlace?.(nested);
    return nested;
  }

  // src/globals/pendingPlacements.js
  var pendingPlacements = [];

  // src/layer-controls/runPlacements.js
  function runPlacements() {
    const state = pendingPlacements.shift();
    if (state?.map.hasLayer(state.layer)) placeUnderEntry(state);
  }

  // src/layer-controls/replaceEntry.js
  function replaceEntry() {
    pendingPlacements.push(this);
    queueMicrotask(runPlacements);
  }

  // src/layer-controls/removeEntry.js
  function removeEntry() {
    this.map.off("layeradd layerremove", replaceEntry, this);
    const group = this.element.parentElement;
    this.element.remove();
    if (group?.classList.contains("traffic-status-group") && !group.childElementCount) group.remove();
  }

  // src/layer-controls/underEntry.js
  function underEntry(layer, element, onPlace) {
    const state = (
      /* alloc */
      { map: layer._map, layer, element, onPlace }
    );
    state.map.on("layeradd layerremove", replaceEntry, state);
    layer.once("remove", removeEntry, state);
    return placeUnderEntry(state);
  }

  // src/weakmaps/controlByLayer.js
  var controlByLayer = /* @__PURE__ */ new WeakMap();

  // src/sunlight/initializeTimeControl.js
  init_L();

  // src/sunlight/addTimeLayer.js
  function addTimeLayer(map) {
    return controlByLayer.get(this).addTo(map);
  }

  // src/sunlight/removeTimeLayer.js
  init_L();
  function removeTimeLayer() {
    return L.Control.prototype.remove.call(controlByLayer.get(this));
  }

  // src/sunlight/initializeTimeControl.js
  function initialize(options) {
    L.Util.setOptions(this, options);
    this.live = true;
    this.layer = /* alloc */
    new L.Layer();
    controlByLayer.set(this.layer, this);
    kindByLayer.set(this.layer, "time");
  }

  // src/sunlight/onAddTimeControl.js
  function onAdd(map) {
    return onAddSun(this, map);
  }

  // src/sunlight/addTimeControlToMap.js
  init_L();

  // src/sunlight/styleTimeControl.js
  function styleTimeControl(container, nested) {
    container.classList.toggle("leaflet-control", !nested);
    container.classList.toggle("leaflet-bar", !nested);
    container.style.background = nested ? "" : "#fff";
    container.style.padding = nested ? "2px 0 6px 20px" : "8px";
    container.style.margin = nested ? "0" : "";
  }

  // src/sunlight/addTimeControlToMap.js
  function addTo(map) {
    L.Control.prototype.addTo.call(this, map);
    const container = this.getContainer();
    if (this.layer._map === map) underEntry(this.layer, container, styleTimeControl.bind(null, container));
    else styleTimeControl(container, false);
    return this;
  }

  // src/sunlight/removeTimeControl.js
  init_L();
  function remove() {
    if (this._map?.hasLayer(this.layer)) {
      this._map.removeLayer(this.layer);
      return this;
    }
    return L.Control.prototype.remove.call(this);
  }

  // src/sunlight/removeSun.js
  function removeSun(state) {
    const { map, timer, sunDisc, moonDisc } = state;
    const shared = sunByMap.get(map);
    clearInterval(timer);
    timeControlByMap.delete(map);
    map.fire(
      "simulationtimechange",
      /* alloc */
      { time: null, live: false }
    );
    map.off("moveend", state.update);
    map.off("move rotate pitch resize", state.updateSky);
    sunlightByMap.delete(map);
    updateSky2(state);
    sunDisc.remove();
    moonDisc.remove();
    render2(map);
    if (shared === state) shared.control = null;
  }

  // src/sunlight/onRemoveSun.js
  function onRemoveSun() {
    const sunlight = sunlightByControl.get(this);
    if (!sunlight) return;
    removeSun(sunlight);
    sunlightByControl.delete(this);
  }

  // src/sunlight/initSunlight.js
  init_extendLeafletClass();
  var TimeControl = class extends extendLeafletClass(L.Control) {
    static initHooks = true;
    static defaultOptions = { position: "bottomright" };
    /**
     * Initialize the time control and its hooks explicitly when using Leaflet 2.
     *
     * @param {Object} options Time control options.
     */
    constructor(options) {
      super(options);
      if (L.version.startsWith("2.")) {
        initialize.call(this, options);
        this.callInitHooks();
      }
    }
  };
  Object.assign(TimeControl.prototype, { onAdd, onRemove: onRemoveSun, addTo, remove });
  if (L.version.startsWith("1.")) {
    TimeControl.prototype.options = Object.assign(Object.create(L.Control.prototype.options), TimeControl.defaultOptions);
    TimeControl.prototype.initialize = initialize;
  }
  L.Control.Time = TimeControl;

  // src/walk/initWalk.js
  init_L();

  // src/walk/initializeWalkControl.js
  init_L();

  // src/weakmaps/typeByLayer.js
  var typeByLayer = /* @__PURE__ */ new WeakMap();

  // src/weakmaps/walkerByLayer.js
  var walkerByLayer = /* @__PURE__ */ new WeakMap();

  // src/walk/createWalk.js
  init_L();

  // src/weakmaps/addedByLayer.js
  var addedByLayer = /* @__PURE__ */ new WeakMap();

  // src/weakmaps/areasByLayer.js
  var areasByLayer = /* @__PURE__ */ new WeakMap();

  // src/weakmaps/countStatusByLayer.js
  var countStatusByLayer = /* @__PURE__ */ new WeakMap();

  // src/weakmaps/directoriesByLayer.js
  var directoriesByLayer = /* @__PURE__ */ new WeakMap();

  // src/weakmaps/geojsonByLayer.js
  var geojsonByLayer = /* @__PURE__ */ new WeakMap();

  // src/weakmaps/inflightByLayer.js
  var inflightByLayer = /* @__PURE__ */ new WeakMap();

  // src/weakmaps/modelUrlByLayer.js
  var modelUrlByLayer = /* @__PURE__ */ new WeakMap();

  // src/weakmaps/state3dByLayer.js
  var state3dByLayer = /* @__PURE__ */ new WeakMap();

  // src/weakmaps/urlByLayer.js
  var urlByLayer = /* @__PURE__ */ new WeakMap();

  // src/scene/init3D.js
  init_L();

  // src/weakmaps/groupByLayer.js
  var groupByLayer = /* @__PURE__ */ new WeakMap();

  // src/weakmaps/archiveHeaderByLayer.js
  var archiveHeaderByLayer = /* @__PURE__ */ new WeakMap();

  // src/weakmaps/sceneLayers.js
  var sceneLayers = /* @__PURE__ */ new WeakSet();

  // src/globals/headerOffsets.js
  var headerOffsets = [
    "rootDirectoryOffset",
    "rootDirectoryLength",
    "jsonMetadataOffset",
    "jsonMetadataLength",
    "leafDirectoryOffset",
    "leafDirectoryLength",
    "tileDataOffset",
    "tileDataLength",
    "numAddressedTiles",
    "numTileEntries",
    "numTileContents"
  ];

  // src/globals/headerFlags.js
  var headerFlags = ["clustered", "internalCompression", "tileCompression", "tileType", "minZoom", "maxZoom"];

  // src/globals/headerBounds.js
  var headerBounds = ["minLon", "minLat", "maxLon", "maxLat"];

  // src/archives/decodeHeader.js
  function decodeHeader(data) {
    const view = data.byteLength >= 127 ? (
      /* alloc */
      new DataView(data)
    ) : null;
    if (!view || view.getUint32(0, true) !== 1767132496 || view.getUint32(4, true) !== 57894252) {
      throw (
        /* alloc */
        new Error("Expected a PMTiles v3 archive")
      );
    }
    const header = (
      /* alloc */
      {}
    );
    let i;
    for (i = 0; i < headerOffsets.length; i++) header[headerOffsets[i]] = Number(view.getBigUint64(8 + i * 8, true));
    for (i = 0; i < headerFlags.length; i++) header[headerFlags[i]] = view.getUint8(96 + i);
    for (i = 0; i < headerBounds.length; i++) header[headerBounds[i]] = view.getInt32(102 + i * 4, true) / 1e7;
    header.centerZoom = view.getUint8(118);
    header.centerLon = view.getInt32(119, true) / 1e7;
    header.centerLat = view.getInt32(123, true) / 1e7;
    return header;
  }

  // src/weakmaps/etagByLayer.js
  var etagByLayer = /* @__PURE__ */ new WeakMap();

  // src/archives/readArchiveRange.js
  async function read(layer, offset, length, signal) {
    signal?.throwIfAborted();
    if (!Number.isSafeInteger(offset) || !Number.isSafeInteger(length) || offset < 0 || length <= 0 || !Number.isSafeInteger(offset + length)) {
      throw (
        /* alloc */
        new Error("Invalid PMTiles byte range")
      );
    }
    const response = await fetch(
      urlByLayer.get(layer),
      /* alloc */
      {
        headers: (
          /* alloc */
          { Range: `bytes=${offset}-${offset + length - 1}` }
        ),
        signal
      }
    );
    if (!response.ok) {
      throw (
        /* alloc */
        new Error(`Unable to read PMTiles: HTTP ${response.status}`)
      );
    }
    const etag = response.headers.get("ETag");
    if (etagByLayer.get(layer) && etag !== etagByLayer.get(layer)) {
      throw (
        /* alloc */
        new Error("PMTiles archive changed; recreate the layer")
      );
    }
    if (etag) etagByLayer.set(layer, etag);
    let data = await response.arrayBuffer();
    if (response.status === 200) {
      data = data.slice(offset, offset + length);
    } else if (response.status !== 206 || !response.headers.get("Content-Range")?.startsWith(`bytes ${offset}-${offset + length - 1}/`)) {
      throw (
        /* alloc */
        new Error("Invalid PMTiles range response")
      );
    }
    if (data.byteLength !== length) {
      throw (
        /* alloc */
        new Error("Truncated PMTiles range")
      );
    }
    return data;
  }

  // src/archives/getHeader.js
  function getHeader(layer) {
    if (!sceneLayers.has(layer)) return layer.getHeader();
    if (layer.options.archive && layer.options.archive !== layer) return getHeader(layer.options.archive);
    let header = archiveHeaderByLayer.get(layer);
    if (!header) {
      header = read(layer, 0, 127).then(decodeHeader);
      archiveHeaderByLayer.set(layer, header);
    }
    return header;
  }

  // src/weakmaps/rendererReadyByLayer.js
  var rendererReadyByLayer = /* @__PURE__ */ new WeakMap();

  // src/weakmaps/terrainBaseYByLayer.js
  var terrainBaseYByLayer = /* @__PURE__ */ new WeakMap();

  // src/scene/attachSharedScene.js
  init_radians();

  // src/sources/updateSourceStatus.js
  function updateStatus(layer, enabled = true) {
    const progress = (
      /* alloc */
      { enabled, loaded: 0, skipped: 0, pending: 0, errors: (
        /* alloc */
        []
      ) }
    );
    let area2;
    for (area2 of areasByLayer.get(layer).values()) {
      if (area2.error) progress.errors.push(area2.error);
      else if (!area2.done) progress.pending++;
      progress.loaded += area2.buildings ?? 0;
      progress.skipped += area2.skipped ?? 0;
    }
    layer.fire("progress", progress);
  }

  // src/sources/attachAreaMesh.js
  function attachAreaMesh(context) {
    const { backend: layer, area: area2 } = context;
    if (!context.positions.length) {
      area2.mesh = null, area2.buildings = 0, area2.skipped = context.skipped, area2.done = true;
      return;
    }
    const device = rendererByLayer.get(layer).device;
    const data = context.preparedGeometry;
    const attributes = (
      /* alloc */
      {
        position: (
          /* alloc */
          { size: 3, data: data.positions }
        ),
        normal: (
          /* alloc */
          { size: 3, data: data.normals }
        ),
        color: (
          /* alloc */
          { size: 3, data: data.colors }
        )
      }
    );
    if (data.instanceOffsets) attributes.instanceOffset = /* alloc */
    { size: 4, data: data.instanceOffsets };
    if (layer.options.nightLight) attributes.uv = /* alloc */
    {
      size: 2,
      data: data.uvs
    };
    let name, attribute;
    for (name in attributes) {
      attribute = attributes[name];
      attribute.count = attribute.data.length / attribute.size;
      attribute.buffer = device.createBuffer(
        /* alloc */
        {
          size: Math.max(4, attribute.data.byteLength),
          usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST
        }
      );
      device.queue.writeBuffer(attribute.buffer, 0, attribute.data);
    }
    const meshGeometry = (
      /* alloc */
      {
        device,
        bounds: data.bounds,
        attributes,
        drawRange: (
          /* alloc */
          { start: 0, count: attributes.position.count }
        )
      }
    );
    area2.mesh = /* alloc */
    {
      ...emptyNode(),
      device,
      geometry: meshGeometry,
      program: createProgram(
        layer,
        /* alloc */
        {
          instanced: Boolean(data.instanceOffsets),
          vertexColors: true,
          roofTexture: layer.options.roofTexture,
          wallTexture: layer.options.wallTexture,
          nightLight: Boolean(layer.options.nightLight),
          alphaMode: layer.options.nightLight ? "BLEND" : void 0,
          doubleSided: Boolean(layer.options.nightLight)
        }
      ),
      id: nextId.value++,
      renderOrder: 0,
      fadeDuration: 250,
      extras: (
        /* alloc */
        { featureFaces: context.featureFaces, lights: context.lights }
      )
    };
    area2.buildings = context.featureFaces.length;
    area2.skipped = context.skipped;
    area2.done = true;
    setParent(area2.mesh, rootByLayer.get(layer));
    update(layer);
  }

  // src/globals/archiveDecoder.js
  var archiveDecoder = new TextDecoder();

  // src/archives/tileId.js
  function tileId(z, x, y) {
    if (!Number.isInteger(z) || !Number.isInteger(x) || !Number.isInteger(y) || z < 0 || z > 26 || x < 0 || y < 0 || x >= 2 ** z || y >= 2 ** z) {
      throw (
        /* alloc */
        new Error("Invalid PMTiles tile coordinates")
      );
    }
    let id = (4 ** z - 1) / 3;
    const n = 2 ** z;
    let s, rx, ry, swap;
    for (s = n / 2; s >= 1; s /= 2) {
      rx = x & s ? 1 : 0, ry = y & s ? 1 : 0;
      id += s * s * (3 * rx ^ ry);
      if (!ry) {
        if (rx) {
          x = n - 1 - x;
          y = n - 1 - y;
        }
        swap = x;
        x = y;
        y = swap;
      }
    }
    return id;
  }

  // src/globals/directoryReader.js
  var directoryReader = {
    bytes: null,
    cursor: 0
  };

  // src/archives/readVarint.js
  function varint(reader) {
    const { bytes } = reader;
    let value = 0;
    let factor, byte;
    for (factor = 1; factor <= 2 ** 49; factor *= 128) {
      if (reader.cursor >= bytes.length) {
        throw (
          /* alloc */
          new Error("Truncated PMTiles directory")
        );
      }
      byte = bytes[reader.cursor++];
      value += (byte & 127) * factor;
      if (!Number.isSafeInteger(value)) {
        throw (
          /* alloc */
          new Error("Invalid PMTiles directory integer")
        );
      }
      if (byte < 128) return value;
    }
    throw (
      /* alloc */
      new Error("Invalid PMTiles directory integer")
    );
  }

  // src/archives/decodeDirectory.js
  function decodeDirectory(data) {
    const reader = directoryReader;
    const bytes = (
      /* alloc */
      new Uint8Array(data)
    );
    reader.bytes = bytes;
    reader.cursor = 0;
    try {
      const count = varint(reader);
      if (count > (bytes.length - reader.cursor) / 4) {
        throw (
          /* alloc */
          new Error("Invalid PMTiles directory count")
        );
      }
      const entries = (
        /* alloc */
        new Array(count)
      );
      let tileId2 = 0;
      let i, entry, value;
      for (i = 0; i < count; i++) {
        tileId2 += varint(reader);
        if (!Number.isSafeInteger(tileId2) || i && tileId2 <= entries[i - 1].tileId) {
          throw (
            /* alloc */
            new Error("Invalid PMTiles directory tile IDs")
          );
        }
        entries[i] = /* alloc */
        { tileId: tileId2, runLength: 0, length: 0, offset: 0 };
      }
      for (entry of entries) entry.runLength = varint(reader);
      for (entry of entries) {
        entry.length = varint(reader);
        if (!entry.length) {
          throw (
            /* alloc */
            new Error("Invalid PMTiles directory length")
          );
        }
      }
      for (i = 0; i < entries.length; i++) {
        entry = entries[i];
        value = varint(reader);
        if (!value && !i) {
          throw (
            /* alloc */
            new Error("Invalid PMTiles directory offset")
          );
        }
        entry.offset = value ? value - 1 : entries[i - 1].offset + entries[i - 1].length;
      }
      if (reader.cursor !== bytes.length) {
        throw (
          /* alloc */
          new Error("Trailing PMTiles directory data")
        );
      }
      return entries;
    } finally {
      reader.bytes = null;
      reader.cursor = 0;
    }
  }

  // src/archives/decompress.js
  async function decompress(data, compression) {
    if (compression === 1) return data;
    if (compression !== 2) {
      throw (
        /* alloc */
        new Error(`Unsupported PMTiles compression: ${compression}`)
      );
    }
    const blob = (
      /* alloc */
      new Blob(
        /* alloc */
        [data]
      )
    );
    const stream = (
      /* alloc */
      new DecompressionStream("gzip")
    );
    return (
      /* alloc */
      new Response(blob.stream().pipeThrough(stream)).arrayBuffer()
    );
  }

  // src/archives/loadDirectory.js
  async function loadDirectory(layer, offset, length, compression) {
    return decodeDirectory(await decompress(await read(layer, offset, length), compression));
  }

  // src/archives/getDirectoryEntries.js
  async function getDirectoryEntries(layer, offset, length, compression) {
    const directories = directoriesByLayer.get(layer);
    const key = `${offset}:${length}`;
    if (!directories.has(key)) {
      if (directories.size >= 32) directories.delete(directories.keys().next().value);
      directories.set(key, loadDirectory(layer, offset, length, compression));
    }
    const pending = directories.get(key);
    try {
      return await pending;
    } catch (error) {
      if (directories.get(key) === pending) directories.delete(key);
      throw error;
    }
  }

  // src/archives/findDirectoryEntry.js
  function findDirectoryEntry(entries, id) {
    let low = 0, high = entries.length - 1, mid;
    while (low <= high) {
      mid = low + high >> 1;
      if (entries[mid].tileId <= id) low = mid + 1;
      else high = mid - 1;
    }
    return entries[high];
  }

  // src/archives/getTileData.js
  async function getTileData(layer, header, entry, id, signal) {
    if (id - entry.tileId >= entry.runLength) return;
    if (entry.offset + entry.length > header.tileDataLength) {
      throw (
        /* alloc */
        new Error("PMTiles tile outside data section")
      );
    }
    const data = await decompress(
      await read(layer, header.tileDataOffset + entry.offset, entry.length, signal),
      header.tileCompression
    );
    signal?.throwIfAborted();
    return (
      /* alloc */
      { data }
    );
  }

  // src/archives/findTile.js
  async function findTile(layer, header, id, signal) {
    let offset = header.rootDirectoryOffset, length = header.rootDirectoryLength;
    let firstOffset = -1, secondOffset = -1, thirdOffset = -1;
    let depth, entries, entry, tile;
    for (depth = 0; depth < 4; depth++) {
      if (offset === firstOffset || offset === secondOffset || offset === thirdOffset) {
        throw (
          /* alloc */
          new Error("Cyclic PMTiles directory")
        );
      }
      if (depth === 0) firstOffset = offset;
      else if (depth === 1) secondOffset = offset;
      else if (depth === 2) thirdOffset = offset;
      entries = await getDirectoryEntries(layer, offset, length, header.internalCompression);
      signal?.throwIfAborted();
      entry = findDirectoryEntry(entries, id);
      if (!entry) return;
      if (entry.runLength) {
        tile = await getTileData(layer, header, entry, id, signal);
        return tile;
      }
      if (entry.offset + entry.length > header.leafDirectoryLength) {
        throw (
          /* alloc */
          new Error("PMTiles directory outside leaf section")
        );
      }
      offset = header.leafDirectoryOffset + entry.offset;
      length = entry.length;
    }
    throw (
      /* alloc */
      new Error("PMTiles directory depth exceeds four levels")
    );
  }

  // src/archives/getZxy.js
  async function getZxy(layer, z, x, y, signal) {
    if (!sceneLayers.has(layer)) return layer.getZxy(z, x, y, signal);
    if (layer.options.archive && layer.options.archive !== layer) {
      return getZxy(layer.options.archive, z, x, y, signal);
    }
    const id = tileId(z, x, y);
    signal?.throwIfAborted();
    const header = await getHeader(layer);
    signal?.throwIfAborted();
    if (z < header.minZoom || z > header.maxZoom) return;
    return findTile(layer, header, id, signal);
  }

  // src/archives/loadSource.js
  async function loadSource(layer, area2) {
    if (geojsonByLayer.get(layer)) {
      const { data, url } = layer.options;
      if (data !== void 0 && url) {
        throw (
          /* alloc */
          new Error("GeoJSON source requires either data or url")
        );
      }
      if (data !== void 0) return data;
      if (!url) {
        throw (
          /* alloc */
          new Error("GeoJSON source requires either data or url")
        );
      }
      const sourceUrl = (
        /* alloc */
        new URL(url, document.baseURI)
      );
      const response = await fetch(
        sourceUrl,
        /* alloc */
        { signal: area2.request.signal }
      );
      if (!response.ok) {
        throw (
          /* alloc */
          new Error(`Unable to load GeoJSON: HTTP ${response.status}`)
        );
      }
      return response.json();
    }
    const result = await getZxy(layer, area2.coords.z, area2.coords.x, area2.coords.y, area2.request.signal);
    return result ? JSON.parse(archiveDecoder.decode(result.data)) : (
      /* alloc */
      {
        type: "FeatureCollection",
        features: (
          /* alloc */
          []
        )
      }
    );
  }

  // src/sources/sourceAreaContext.js
  init_radians();
  function sourceAreaContext(layer, area2, map) {
    const crs = map.options.crs, origin = crs.project(locationByLayer.get(layer));
    return (
      /* alloc */
      {
        backend: layer,
        area: area2,
        map,
        crs,
        origin,
        metres: Math.cos(locationByLayer.get(layer).lat * radians),
        jobs: (
          /* alloc */
          []
        ),
        featureFaces: (
          /* alloc */
          []
        ),
        skipped: 0
      }
    );
  }

  // src/globals/geometryWorkerUrl.js
  var geometryWorkerUrl = void 0 ? new URL("../workers/geometryWorker.js", null.url).href : new URL("leaflet-city-mapper-worker.js", document.currentScript?.src || document.baseURI).href;

  // src/workers/settleGeometryWorker.js
  function settleGeometryWorker(task, event) {
    if (event.type === "abort") task.reject(task.signal.reason);
    else if (event.type === "error") task.reject(
      /* alloc */
      new Error(`Geometry worker failed: ${event.message}`)
    );
    else if (event.type === "messageerror") task.reject(
      /* alloc */
      new Error("Unable to receive geometry worker buffers")
    );
    else if (event.data?.error) {
      const error = (
        /* alloc */
        new Error(event.data.error.message)
      );
      error.name = event.data.error.name;
      task.reject(error);
    } else task.resolve(event.data);
  }

  // src/workers/startGeometryWorker.js
  function startGeometryWorker(task, resolve, reject) {
    task.resolve = resolve;
    task.reject = reject;
    task.onEvent = settleGeometryWorker.bind(null, task);
    task.worker.addEventListener("message", task.onEvent);
    task.worker.addEventListener("error", task.onEvent);
    task.worker.addEventListener("messageerror", task.onEvent);
    task.signal.addEventListener(
      "abort",
      task.onEvent,
      /* alloc */
      { once: true }
    );
    if (task.signal.aborted) {
      reject(task.signal.reason);
      return;
    }
    task.worker.postMessage(task.input);
  }

  // src/weakmaps/geometryWorkersByMap.js
  var geometryWorkersByMap = /* @__PURE__ */ new WeakMap();

  // src/workers/closeGeometryWorkers.js
  function closeGeometryWorkers(pool) {
    pool.closed = true;
    let entry;
    for (entry of pool.entries) {
      entry.closed = true;
      entry.worker.terminate();
      if (entry.task) entry.task.reject(
        /* alloc */
        new DOMException("Map removed", "AbortError")
      );
    }
    pool.entries.clear();
    pool.idle.length = 0;
  }

  // src/workers/createGeometryWorker.js
  function createGeometryWorker(url, pool) {
    if (typeof Worker === "undefined") throw (
      /* alloc */
      new Error("Web Workers are required to prepare source geometry")
    );
    let workerUrl = url, blobUrl, worker;
    if (globalThis.location) {
      const resolved = (
        /* alloc */
        new URL(url, location.href)
      );
      if ((resolved.protocol === "https:" || resolved.protocol === "http:") && resolved.origin !== location.origin) {
        blobUrl = URL.createObjectURL(
          /* alloc */
          new Blob(
            /* alloc */
            [`import ${JSON.stringify(resolved.href)};`],
            /* alloc */
            { type: "text/javascript" }
          )
        );
        workerUrl = blobUrl;
      }
    }
    try {
      worker = /* alloc */
      new Worker(
        workerUrl,
        /* alloc */
        { type: "module" }
      );
    } finally {
      if (!worker && blobUrl) URL.revokeObjectURL(blobUrl);
    }
    const entry = (
      /* alloc */
      { url, pool, worker, blobUrl }
    );
    if (pool) pool.entries.add(entry);
    return entry;
  }

  // src/workers/acquireGeometryWorker.js
  function acquireGeometryWorker(map, url) {
    let pool = map && geometryWorkersByMap.get(map);
    if (map && !pool) {
      pool = /* alloc */
      { entries: (
        /* alloc */
        /* @__PURE__ */ new Set()
      ), idle: (
        /* alloc */
        []
      ), closed: false };
      geometryWorkersByMap.set(map, pool);
      map.once("unload", closeGeometryWorkers.bind(null, pool));
    }
    let entry, i;
    if (pool) {
      if (pool.closed) throw (
        /* alloc */
        new DOMException("Map removed", "AbortError")
      );
      for (i = 0; i < pool.idle.length; i++) {
        if (pool.idle[i].url !== url) continue;
        entry = pool.idle[i];
        pool.idle.splice(i, 1);
        return entry;
      }
      entry = pool.idle.pop();
      if (entry) {
        entry.closed = true;
        entry.worker.terminate();
        pool.entries.delete(entry);
      }
    }
    return createGeometryWorker(url, pool);
  }

  // src/workers/runSourceWorker.js
  async function runSourceWorker(map, url, input, signal = (
    /* alloc */
    new AbortController().signal
  )) {
    signal.throwIfAborted();
    const entry = acquireGeometryWorker(map, url || geometryWorkerUrl);
    const { worker, pool } = entry;
    const task = (
      /* alloc */
      { worker, signal, input }
    );
    entry.task = task;
    let completed = false;
    try {
      const data = await /* alloc */
      new Promise(startGeometryWorker.bind(null, task));
      completed = true;
      return data;
    } finally {
      worker.removeEventListener("message", task.onEvent);
      worker.removeEventListener("error", task.onEvent);
      worker.removeEventListener("messageerror", task.onEvent);
      signal.removeEventListener("abort", task.onEvent);
      entry.task = null;
      if (completed && pool && !pool.closed && !signal.aborted) pool.idle.push(entry);
      else {
        if (!entry.closed) worker.terminate();
        if (pool) pool.entries.delete(entry);
      }
      if (entry.blobUrl) {
        URL.revokeObjectURL(entry.blobUrl);
        entry.blobUrl = null;
      }
    }
  }

  // src/workers/buildAreaInWorker.js
  async function buildAreaInWorker(context, signal) {
    try {
      const data = await runSourceWorker(
        context.map || context.backend._map,
        context.backend.options.workerUrl,
        /* alloc */
        { jobs: context.jobs, nightLight: Boolean(context.backend.options.nightLight) },
        signal
      );
      let i;
      for (i = 0; i < data.ranges.length; i++) Object.assign(context.featureFaces[i], data.ranges[i]);
      context.positions = data.positions;
      context.uvs = data.uvs;
      context.lights = data.lights;
      context.preparedGeometry = data;
    } finally {
      context.jobs = null;
    }
  }

  // src/sources/featureAnchor.js
  function featureAnchor(feature, nightLight) {
    const geometry = feature?.geometry, point = geometry?.type === "Point";
    if (nightLight && !point) throw (
      /* alloc */
      new Error("Night lights require Point geometry")
    );
    if (geometry?.type !== "Polygon" && geometry?.type !== "MultiPolygon" && !point) throw (
      /* alloc */
      new Error("Unsupported GeoJSON geometry")
    );
    const coordinates = point ? geometry.coordinates : geometry.type === "Polygon" ? geometry.coordinates[0]?.[0] : geometry.coordinates[0]?.[0]?.[0];
    if (!Number.isFinite(coordinates?.[0]) || !Number.isFinite(coordinates?.[1])) throw (
      /* alloc */
      new Error("Invalid GeoJSON coordinates")
    );
    return coordinates;
  }

  // src/sources/extrusionStyle.js
  function extrusionStyle(layer, feature) {
    const style = layer.options.style(feature);
    if (style === null) return null;
    if (!style || typeof style !== "object") throw (
      /* alloc */
      new Error("style must return an extrusion style or null")
    );
    const { top, bottom = 0 } = style;
    if (!Number.isFinite(top) || !Number.isFinite(bottom) || bottom < 0 || top <= bottom) {
      throw (
        /* alloc */
        new Error("Invalid extrusion heights: expected top > bottom >= 0")
      );
    }
    return style;
  }

  // src/projections/projectTreePoint.js
  init_L();
  function projectedTree(context, lon, lat) {
    const { backend: layer, crs, origin, metres, map } = context;
    const location2 = (
      /* alloc */
      new L.LatLng(lat, lon)
    );
    const point = crs.project(location2);
    const elevation = mapElevationOf(map, location2), root = rootByLayer.get(layer);
    return (
      /* alloc */
      {
        x: (point.x - origin.x) * metres,
        y: (point.y - origin.y) * metres,
        ground: Number.isFinite(elevation) && Number.isFinite(root.position[1]) ? elevation - root.position[1] : 0
      }
    );
  }

  // src/projections/projectRing.js
  init_L();
  function projectRing(context, ring) {
    const { backend: layer, crs, origin, metres, map } = context;
    if (ring.length < 4) throw (
      /* alloc */
      new Error("Invalid GeoJSON polygon ring")
    );
    const path = (
      /* alloc */
      []
    );
    const root = rootByLayer.get(layer);
    let i, lng, lat, location2, point, elevation;
    for (i = 0; i < ring.length - 1; i++) {
      lng = ring[i][0], lat = ring[i][1];
      if (!Number.isFinite(lng) || !Number.isFinite(lat)) throw (
        /* alloc */
        new Error("Invalid GeoJSON coordinates")
      );
      location2 = /* alloc */
      new L.LatLng(lat, lng);
      point = crs.project(location2);
      elevation = mapElevationOf(map, location2);
      path.push(
        /* alloc */
        {
          x: (point.x - origin.x) * metres,
          y: (point.y - origin.y) * metres,
          ground: Number.isFinite(elevation) && Number.isFinite(root.position[1]) ? elevation - root.position[1] : 0
        }
      );
    }
    return path;
  }

  // src/sources/projectAreaPolygons.js
  function projectAreaPolygons(context, geometry) {
    const rings = geometry.type === "Polygon" ? (
      /* alloc */
      [geometry.coordinates]
    ) : geometry.type === "MultiPolygon" ? geometry.coordinates : (
      /* alloc */
      []
    );
    const polygons = (
      /* alloc */
      []
    );
    let polygon2, ring, paths;
    for (polygon2 of rings) {
      if (!polygon2.length) throw (
        /* alloc */
        new Error("Empty GeoJSON polygon")
      );
      paths = /* alloc */
      [];
      for (ring of polygon2) paths.push(projectRing(context, ring));
      polygons.push(paths);
    }
    return polygons;
  }

  // src/sources/prepareAreaGeometryJob.js
  function prepareAreaGeometryJob(context, feature, lon, lat, style, baseColor) {
    const geometry = feature.geometry;
    const polygons = projectAreaPolygons(context, geometry);
    const point = geometry.type === "Point" ? projectedTree(context, lon, lat) : null;
    const nightLight = context.backend.options.nightLight;
    const crownColor = point ? parseColor(style.color ?? (nightLight ? void 0 : 5210683)) : baseColor;
    const trunkColor = point && !nightLight ? parseColor(style.trunkColor ?? 7491898) : null;
    context.jobs.push(
      /* alloc */
      {
        point,
        polygons,
        baseColor: (
          /* alloc */
          { r: baseColor.r, g: baseColor.g, b: baseColor.b }
        ),
        support: feature.properties?.cod_ouvrag || `${lon},${lat}`,
        style: (
          /* alloc */
          {
            top: style.top,
            bottom: style.bottom ?? 0,
            color: (
              /* alloc */
              { r: crownColor.r, g: crownColor.g, b: crownColor.b }
            ),
            trunkColor: trunkColor ? (
              /* alloc */
              { r: trunkColor.r, g: trunkColor.g, b: trunkColor.b }
            ) : void 0,
            trunkRadius: style.trunkRadius,
            crownRadius: style.crownRadius,
            crownBottom: style.crownBottom,
            crownShape: style.crownShape,
            poleRadius: style.poleRadius,
            lightRadius: style.lightRadius,
            lightFlux: style.lightFlux
          }
        )
      }
    );
  }

  // src/sources/matchesAreaTile.js
  init_L();
  function matchesAreaTile(map, coords, lon, lat) {
    if (!coords) return true;
    const anchor = map.project(
      /* alloc */
      new L.LatLng(lat, lon),
      coords.z
    );
    return Math.floor(anchor.x / 256) === coords.x && Math.floor(anchor.y / 256) === coords.y;
  }

  // src/sources/buildAreaFeature.js
  function buildAreaFeature(context, feature) {
    const { backend: layer, area: area2, map } = context;
    const coords = area2.coords;
    const coordinates = featureAnchor(feature, layer.options.nightLight);
    const geometry = feature.geometry;
    const lon = coordinates[0], lat = coordinates[1];
    if (!matchesAreaTile(map, coords, lon, lat)) return;
    const style = extrusionStyle(layer, feature);
    if (style === null) {
      context.skipped++;
      return;
    }
    const { color = 14267276 } = style;
    const baseColor = parseColor(color);
    prepareAreaGeometryJob(context, feature, lon, lat, style, baseColor);
    context.featureFaces.push(
      /* alloc */
      {
        id: feature.id ?? feature.properties?.objectid ?? JSON.stringify(geometry),
        properties: feature.properties,
        baseColor,
        polygon: geometry.type === "Polygon" || geometry.type === "MultiPolygon"
      }
    );
  }

  // src/sources/buildAreaFeatures.js
  async function buildAreaFeatures(context, area2, features) {
    let deadline = performance.now() + 4, feature;
    for (feature of features) {
      if (area2.request.signal.aborted) return;
      if (performance.now() >= deadline) {
        await /* alloc */
        new Promise(requestAnimationFrame);
        if (area2.request.signal.aborted) return;
        deadline = performance.now() + 4;
      }
      buildAreaFeature(context, feature);
    }
  }

  // src/sources/buildArea.js
  async function buildArea(layer, area2, map) {
    try {
      await /* alloc */
      new Promise(requestAnimationFrame);
      await cameraViewByMap.get(map);
      if (area2.request.signal.aborted) return;
      const data = await loadSource(layer, area2);
      if (area2.request.signal.aborted) return;
      if (data?.type !== "FeatureCollection" || !Array.isArray(data.features)) {
        throw (
          /* alloc */
          new Error("Invalid GeoJSON response")
        );
      }
      if (geojsonByLayer.get(layer) && typeof layer.options.style !== "function") {
        throw (
          /* alloc */
          new Error("style must be a function")
        );
      }
      if (layer.options.worker === false) {
        throw (
          /* alloc */
          new Error("worker: false is no longer supported; GeoJSON geometry requires Web Workers")
        );
      }
      const context = sourceAreaContext(layer, area2, map);
      await buildAreaFeatures(context, area2, data.features);
      if (area2.request.signal.aborted) return;
      await buildAreaInWorker(context, area2.request.signal);
      if (area2.request.signal.aborted) return;
      attachAreaMesh(context);
    } catch (error) {
      if (!area2.request.signal.aborted) {
        area2.error = error.message;
        layer.fire(
          "error",
          /* alloc */
          { error }
        );
      }
    } finally {
      inflightByLayer.set(layer, inflightByLayer.get(layer) - 1);
      pump(layer, map);
    }
  }

  // src/utils/compareDistance.js
  function compareDistance(a, b) {
    return a.distance - b.distance;
  }

  // src/sources/pendingSourceAreas.js
  function pendingSourceAreas(layers, map) {
    const pending = (
      /* alloc */
      []
    );
    let layer, area2, center;
    for (layer of layers) {
      for (area2 of areasByLayer.get(layer).values()) {
        if (area2.started || area2.request.signal.aborted) continue;
        center = area2.coords && map.project(map.getCenter(), area2.coords.z).divideBy(256);
        pending.push(
          /* alloc */
          {
            layer,
            area: area2,
            distance: center ? Math.hypot(area2.coords.x + 0.5 - center.x, area2.coords.y + 0.5 - center.y) / 2 ** area2.coords.z : 0
          }
        );
      }
    }
    pending.sort(compareDistance);
    return pending;
  }

  // src/sources/pumpSourceAreas.js
  function pump(layer, map = layer._map) {
    const shared = map && renderers.get(map);
    if (!shared || !layersByLayer.has(shared)) return;
    const layers = (
      /* alloc */
      []
    );
    let sourceLayer, area2, areaBackend;
    for (sourceLayer of layersByLayer.get(shared)) {
      if (Number.isFinite(inflightByLayer.get(sourceLayer)) && areasByLayer.get(sourceLayer) && (urlByLayer.get(sourceLayer) || geojsonByLayer.get(sourceLayer))) layers.push(sourceLayer);
    }
    const pending = pendingSourceAreas(layers, map);
    let inflight = 0;
    for (sourceLayer of layers) inflight += inflightByLayer.get(sourceLayer);
    for ({ layer: areaBackend, area: area2 } of pending) {
      if (inflight >= 4) break;
      if (inflightByLayer.get(areaBackend) >= 2) continue;
      area2.started = true;
      inflightByLayer.set(areaBackend, inflightByLayer.get(areaBackend) + 1);
      inflight++;
      buildArea(areaBackend, area2, map);
    }
    for (sourceLayer of layers) updateStatus(sourceLayer);
  }

  // src/weakmaps/highlightedFeatureByLayer.js
  var highlightedFeatureByLayer = /* @__PURE__ */ new WeakMap();

  // src/weakmaps/hoveredFeatureByLayer.js
  var hoveredFeatureByLayer = /* @__PURE__ */ new WeakMap();

  // src/picking/setHighlight.js
  function setHighlight(layer, feature) {
    if (feature?.model) feature = null;
    if (highlightedFeatureByLayer.get(layer)?.mesh === feature?.mesh && highlightedFeatureByLayer.get(layer)?.vertexStart === feature?.vertexStart) return;
    if (highlightedFeatureByLayer.get(layer)) highlightedFeatureByLayer.get(layer).mesh.highlight = null;
    highlightedFeatureByLayer.set(layer, feature);
    if (feature) {
      feature.mesh.highlightRange[0] = feature.vertexStart;
      feature.mesh.highlightRange[1] = feature.vertexEnd;
      feature.mesh.highlight = feature.mesh.highlightRange;
    }
    update(layer);
  }

  // src/weakmaps/containerByLayer.js
  var containerByLayer = /* @__PURE__ */ new WeakMap();

  // src/weakmaps/cursorByLayer.js
  var cursorByLayer = /* @__PURE__ */ new WeakMap();

  // src/weakmaps/tooltipByLayer.js
  var tooltipByLayer = /* @__PURE__ */ new WeakMap();

  // src/picking/showFeature.js
  function showFeature(layer, feature, event) {
    const tooltip2 = tooltipByLayer.get(layer);
    if (!tooltip2) return;
    if (feature) {
      tooltip2.replaceChildren(layer.options.tooltip(feature));
      tooltip2.hidden = false;
      const rect = containerByLayer.get(layer).getBoundingClientRect();
      const x = event.clientX - rect.left, y = event.clientY - rect.top;
      tooltip2.style.left = `${x + tooltip2.offsetWidth + 16 > rect.width ? x - tooltip2.offsetWidth - 12 : x + 12}px`;
      tooltip2.style.top = `${y + tooltip2.offsetHeight + 16 > rect.height ? y - tooltip2.offsetHeight - 12 : y + 12}px`;
    } else {
      tooltip2.hidden = true;
    }
    const shared = sharedByLayer.get(layer);
    let sharedLayer;
    if (shared) {
      let visible = false;
      for (sharedLayer of layersByLayer.get(shared)) {
        if (tooltipByLayer.get(sharedLayer) && !tooltipByLayer.get(sharedLayer).hidden) {
          visible = true;
          break;
        }
      }
      if (visible) {
        if (cursorByLayer.get(shared) === void 0) cursorByLayer.set(shared, containerByLayer.get(layer).style.cursor);
        containerByLayer.get(layer).style.cursor = "pointer";
      } else if (cursorByLayer.get(shared) !== void 0) {
        containerByLayer.get(layer).style.cursor = cursorByLayer.get(shared);
        cursorByLayer.delete(shared);
      }
    }
  }

  // src/sources/releaseArea.js
  function releaseArea(layer, area2) {
    area2.request.abort();
    let attribute;
    if (area2.mesh) {
      if (highlightedFeatureByLayer.get(layer)?.mesh === area2.mesh) {
        setHighlight(layer, null);
        hoveredFeatureByLayer.set(layer, null);
        showFeature(layer, null);
      }
      setParent(area2.mesh, null);
      update(layer);
      const geometry = area2.mesh.geometry;
      for (attribute of Object.values(geometry.attributes)) attribute.buffer.destroy();
      area2.mesh.program.pipelineCache.clear();
    }
  }

  // src/sources/compareAreaDistance.js
  function compareAreaDistance(a, b) {
    return a.distance - b.distance;
  }

  // src/sources/updateArea.js
  function updateArea(layer) {
    if (!layer._map || !sharedByLayer.get(layer)) return;
    if (geojsonByLayer.get(layer)) {
      if (!areasByLayer.get(layer).has("geojson")) {
        areasByLayer.get(layer).set(
          "geojson",
          /* alloc */
          { request: (
            /* alloc */
            new AbortController()
          ) }
        );
      }
      pump(layer);
      return;
    }
    if (!headerByLayer.get(layer)) return;
    const z = headerByLayer.get(layer).minZoom;
    const center = layer._map.project(layer._map.getCenter(), z).divideBy(256).floor();
    const bounds = layer._map.getBounds();
    const nw = layer._map.project(bounds.getNorthWest(), z).divideBy(256).floor();
    const se = layer._map.project(bounds.getSouthEast(), z).divideBy(256).floor();
    const archiveNW = layer._map.project(
      /* alloc */
      [headerByLayer.get(layer).maxLat, headerByLayer.get(layer).minLon],
      z
    ).divideBy(256).floor();
    const archiveSE = layer._map.project(
      /* alloc */
      [headerByLayer.get(layer).minLat, headerByLayer.get(layer).maxLon],
      z
    ).divideBy(256).floor();
    const wanted = (
      /* alloc */
      /* @__PURE__ */ new Map()
    );
    let x, y, key, area2, coords;
    for (x = Math.max(0, nw.x - 1, archiveNW.x); x <= Math.min(2 ** z - 1, se.x + 1, archiveSE.x); x++) {
      for (y = Math.max(0, nw.y - 1, archiveNW.y); y <= Math.min(2 ** z - 1, se.y + 1, archiveSE.y); y++) {
        wanted.set(
          `${x}/${y}`,
          /* alloc */
          { z, x, y }
        );
      }
    }
    for ([key, area2] of areasByLayer.get(layer)) {
      if (!wanted.has(key)) {
        releaseArea(layer, area2);
        areasByLayer.get(layer).delete(key);
      }
    }
    const areas = (
      /* alloc */
      []
    );
    for ([key, coords] of wanted) {
      coords.distance = Math.hypot(coords.x + 0.5 - center.x, coords.y + 0.5 - center.y) / 2 ** z;
      areas.push(coords);
    }
    areas.sort(compareAreaDistance);
    for (coords of areas) {
      key = `${coords.x}/${coords.y}`;
      if (!areasByLayer.get(layer).has(key)) areasByLayer.get(layer).set(
        key,
        /* alloc */
        { coords, request: (
          /* alloc */
          new AbortController()
        ) }
      );
    }
    pump(layer);
  }

  // src/terrain/setTerrainHeight.js
  function setTerrainHeight(layer) {
    if (!rootByLayer.get(layer) || !locationByLayer.get(layer)) return;
    if (terrainBaseYByLayer.get(layer) == null) terrainBaseYByLayer.set(layer, rootByLayer.get(layer).position[1]);
    const terrain = terrain3DByMap.get(layer._map);
    const elevation = terrain && getElevation(terrain, locationByLayer.get(layer));
    const offset = Number.isFinite(elevation) ? layer.options.terrainOffset ?? 0 : 0;
    rootByLayer.get(layer).position[1] = terrainBaseYByLayer.get(layer) + (elevation ?? 0) + offset;
  }

  // src/geometry/restoreGeometry.js
  function restoreGeometry(geometry, device) {
    if (geometry.attributes.index?.data instanceof Uint8Array) {
      geometry.attributes.index.data = /* alloc */
      new Uint16Array(geometry.attributes.index.data);
    }
    let name, attribute, oldBuffer;
    for (name in geometry.attributes) {
      attribute = geometry.attributes[name];
      attribute.size ||= 1;
      attribute.count = attribute.data.length / attribute.size;
      attribute.indexFormat = attribute.data instanceof Uint32Array ? "uint32" : "uint16";
      oldBuffer = attribute.buffer;
      attribute.buffer = device.createBuffer(
        /* alloc */
        {
          size: Math.max(4, attribute.data.byteLength),
          usage: name === "index" ? GPUBufferUsage.INDEX | GPUBufferUsage.COPY_DST : GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST
        }
      );
      device.queue.writeBuffer(attribute.buffer, 0, attribute.data);
      oldBuffer?.destroy();
    }
    geometry.device = device;
    geometry.drawRange.count = geometry.attributes.index?.count || geometry.attributes.position.count;
  }

  // src/textures/restoreMaterialTextures.js
  function restoreMaterialTextures(material, device) {
    let name, texture;
    for (name in material) {
      if (name !== "baseTexture" && name !== "metalTexture" && name !== "emissiveTexture" && name !== "occlusionTexture") continue;
      texture = material[name];
      if (!texture || texture.device === device) continue;
      texture.device = device;
      texture.texture = device.createTexture(
        /* alloc */
        {
          size: (
            /* alloc */
            [texture.image.width, texture.image.height]
          ),
          format: texture.format,
          usage: GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_DST | GPUTextureUsage.RENDER_ATTACHMENT
        }
      );
      texture.sampler = device.createSampler(texture.samplerOptions);
      texture.uploaded = null;
    }
  }

  // src/scene/restoreObject.js
  function restoreObject(object, layer) {
    const shared = sharedByLayer.get(layer);
    let texture;
    if (object.geometry && object.geometry.device !== rendererByLayer.get(shared).device) {
      const geometry = object.geometry;
      const material = object.program._layerMaterial;
      const device = rendererByLayer.get(shared).device;
      restoreGeometry(geometry, device);
      object.bindGroup = null;
      if (object.boundTextures) object.boundTextures.length = 0;
      else object.boundTextures = /* alloc */
      [];
      restoreMaterialTextures(material, device);
      object.program.pipelineCache.clear();
      object.program = createProgram(layer, material);
      object.device = device;
    }
    if (object.texture && object.texture.device !== rendererByLayer.get(shared).device) {
      texture = object.texture;
      texture.device = rendererByLayer.get(shared).device;
      texture.texture = rendererByLayer.get(shared).device.createTexture(
        /* alloc */
        {
          size: (
            /* alloc */
            [object.texture.image.width, object.texture.image.height]
          ),
          format: object.texture.format,
          usage: GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_DST | GPUTextureUsage.RENDER_ATTACHMENT
        }
      );
      texture.sampler = rendererByLayer.get(shared).device.createSampler(texture.samplerOptions);
      texture.uploaded = null;
    }
  }

  // src/weakmaps/rendererDevices.js
  var rendererDevices = /* @__PURE__ */ new WeakMap();

  // src/gpu/showWebGPUWarning.js
  function showWebGPUWarning(map) {
    const container = map.getContainer();
    if (container.querySelector(".leaflet-webgpu-warning")) return;
    const warning = document.createElement("div");
    warning.className = "leaflet-webgpu-warning";
    warning.setAttribute("role", "alert");
    warning.style.cssText = "position:absolute;z-index:1000;top:50%;left:50%;transform:translate(-50%,-50%);max-width:calc(100% - 32px);box-sizing:border-box;padding:12px 16px;border:1px solid #c98b24;border-radius:6px;background:#fff8e6;box-shadow:0 3px 12px #0005;color:#30251d;font:14px/1.5 sans-serif;text-align:center;pointer-events:auto";
    warning.append("WebGPU is not available in this browser or device. ");
    const link = document.createElement("a");
    link.href = "https://developer.mozilla.org/en-US/docs/Web/API/WebGPU_API#browser_compatibility";
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.textContent = "Learn more";
    warning.append(link);
    container.append(warning);
  }

  // src/scene/failAttachment.js
  function failAttachment(error, layer, map) {
    showWebGPUWarning(map);
    rendererReadyByLayer.get(layer).reject(error);
    renderers.delete(map);
    throw error;
  }

  // src/gpu/requestAdapter.js
  async function requestAdapter(layer, map) {
    let adapter;
    try {
      adapter = await navigator.gpu.requestAdapter();
    } catch (error) {
      failAttachment(error, layer, map);
    }
    if (!adapter) failAttachment(
      /* alloc */
      new Error("Unable to acquire a WebGPU adapter"),
      layer,
      map
    );
    return adapter;
  }

  // src/gpu/requestDevice.js
  async function requestDevice(adapter, layer, map) {
    try {
      return await adapter.requestDevice();
    } catch (error) {
      failAttachment(error, layer, map);
    }
  }

  // src/gpu/rendererDeviceError.js
  function rendererDeviceError(event) {
    const map = rendererDevices.get(event.currentTarget);
    const owner = renderers.get(map);
    if (rendererByLayer.get(owner)?.device !== event.currentTarget) return;
    if (!layersByLayer.get(owner)) return;
    let layer;
    for (layer of layersByLayer.get(owner)) layer.fire(
      "error",
      /* alloc */
      { error: event.error }
    );
  }

  // src/gpu/rendererDeviceLost.js
  function rendererDeviceLost([info, device]) {
    const map = rendererDevices.get(device);
    const owner = renderers.get(map);
    if (!owner || rendererByLayer.get(owner)?.device !== device) return;
    const error = (
      /* alloc */
      new Error(`WebGPU device lost: ${info.message || info.reason}`)
    );
    let layer;
    for (layer of layersByLayer.get(owner)) layer.fire(
      "error",
      /* alloc */
      { error }
    );
  }

  // src/camera/createSceneCamera.js
  function createSceneCamera() {
    return (
      /* alloc */
      {
        position: (
          /* alloc */
          [0, 0, 0]
        ),
        up: (
          /* alloc */
          [0, 1, 0]
        ),
        target: (
          /* alloc */
          [0, 0, 0]
        ),
        x: (
          /* alloc */
          [0, 0, 0]
        ),
        y: (
          /* alloc */
          [0, 0, 0]
        ),
        z: (
          /* alloc */
          [0, 0, 0]
        ),
        viewMatrix: (
          /* alloc */
          [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]
        ),
        projectionMatrix: (
          /* alloc */
          [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]
        ),
        projectionViewMatrix: (
          /* alloc */
          [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]
        ),
        viewTransform: (
          /* alloc */
          new DOMMatrix()
        ),
        projectionTransform: (
          /* alloc */
          new DOMMatrix()
        ),
        projectionViewTransform: (
          /* alloc */
          new DOMMatrix()
        ),
        fov: 45,
        aspect: 1,
        near: 0.1,
        far: 1e4
      }
    );
  }

  // src/globals/sceneSunlightUniforms.js
  var sceneSunlightUniforms = new Float32Array(20);
  sceneSunlightUniforms[0] = sceneSunlightUniforms[5] = sceneSunlightUniforms[10] = sceneSunlightUniforms[15] = 1;

  // src/gpu/initializeRendererResources.js
  function initializeRendererResources(layer, device) {
    const renderer = rendererByLayer.get(layer);
    const layout = device.createBindGroupLayout(
      /* alloc */
      {
        entries: (
          /* alloc */
          [
            /* alloc */
            { binding: 0, visibility: GPUShaderStage.VERTEX | GPUShaderStage.FRAGMENT, buffer: (
              /* alloc */
              { type: "uniform" }
            ) },
            /* alloc */
            { binding: 1, visibility: GPUShaderStage.FRAGMENT, texture: (
              /* alloc */
              { sampleType: "depth" }
            ) },
            /* alloc */
            { binding: 2, visibility: GPUShaderStage.FRAGMENT, sampler: (
              /* alloc */
              { type: "comparison" }
            ) },
            /* alloc */
            { binding: 3, visibility: GPUShaderStage.FRAGMENT, buffer: (
              /* alloc */
              { type: "read-only-storage" }
            ) }
          ]
        )
      }
    );
    const buffer = device.createBuffer(
      /* alloc */
      { size: 80, usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST }
    );
    const sampler = device.createSampler(
      /* alloc */
      { compare: "less-equal", minFilter: "linear", magFilter: "linear" }
    );
    const lights = device.createBuffer(
      /* alloc */
      { size: 32, usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST }
    );
    renderer.sunlight = /* alloc */
    { layout, buffer, sampler, lights, size: 0 };
    device.queue.writeBuffer(buffer, 0, sceneSunlightUniforms);
    resizeSunlight(layer, 1);
    renderer.roofFallbackTexture = /* alloc */
    {
      device,
      texture: device.createTexture(
        /* alloc */
        {
          size: (
            /* alloc */
            [1, 1]
          ),
          format: "rgba8unorm",
          usage: GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_DST | GPUTextureUsage.RENDER_ATTACHMENT
        }
      ),
      sampler: device.createSampler(
        /* alloc */
        {
          addressModeU: "clamp-to-edge",
          addressModeV: "clamp-to-edge"
        }
      ),
      image: null,
      format: "rgba8unorm",
      srgb: false,
      uploaded: null
    };
  }

  // src/weakmaps/queuedByLayer.js
  var queuedByLayer = /* @__PURE__ */ new WeakMap();

  // src/globals/pendingMapChanges.js
  var pendingMapChanges = [];

  // src/scene/renderPendingMapChange.js
  function renderPendingMapChange() {
    const layer = pendingMapChanges.shift();
    queuedByLayer.set(layer, false);
    if (sharedByLayer.get(layer) !== layer || !rendererByLayer.get(layer)) return;
    if (layer._map._animatingZoom) update(layer);
    else render(layer);
  }

  // src/scene/onMapChange.js
  function onMapChange() {
    const layer = this;
    if (queuedByLayer.get(layer)) return;
    queuedByLayer.set(layer, true);
    pendingMapChanges.push(layer);
    queueMicrotask(renderPendingMapChange);
  }

  // src/weakmaps/zoomLevelByLayer.js
  var zoomLevelByLayer = /* @__PURE__ */ new WeakMap();

  // src/animations/startZoom.js
  function startZoom() {
    zoomLevelByLayer.set(this, null);
  }

  // src/globals/pendingZoomAnimations.js
  var pendingZoomAnimations = [];

  // src/animations/renderPendingZoomAnimation.js
  function renderPendingZoomAnimation() {
    const layer = pendingZoomAnimations.shift();
    if (sharedByLayer.get(layer) === layer && rendererByLayer.get(layer)) render(layer);
  }

  // src/animations/onZoomAnim.js
  function onZoomAnim(event) {
    const map = this._map;
    if (event && !zoomViewByLayer.get(this)) {
      zoomViewByLayer.set(
        this,
        /* alloc */
        {
          from: map.getCenter(),
          zoom: map.getZoom(),
          to: event.center,
          targetZoom: event.zoom,
          start: performance.now()
        }
      );
      map.getContainer().classList.add("leaflet-camera-zoom");
    }
    pendingZoomAnimations.push(this);
    queueMicrotask(renderPendingZoomAnimation);
  }

  // src/animations/endZoom.js
  function endZoom() {
    const layer = this;
    let animation;
    if (zoomTransitionsByLayer.get(layer)) {
      for (animation of zoomTransitionsByLayer.get(layer).keys()) animation.finish();
    }
    zoomTransitionsByLayer.set(layer, null);
    zoomViewByLayer.set(layer, null);
    cameraViewByMap.delete(layer._map);
    layer._map.getContainer().classList.remove("leaflet-camera-zoom");
    mapUpdateCameraOverlays(layer._map);
    zoomLevelByLayer.set(layer, null);
    update(layer);
  }

  // src/gpu/mountRenderer.js
  function mountRenderer(layer, map, canvas) {
    sizeByLayer.set(layer, null);
    canvas.className = "leaflet-3d";
    canvas.style.cssText = "position:absolute;top:0;left:0;z-index:1;pointer-events:none";
    canvas.setAttribute("role", "img");
    canvas.setAttribute("aria-label", layer.options.ariaLabel ?? "3D scene");
    map.getPane("mapPane").before(canvas);
    map.on("move zoom rotate pitch resize viewreset layeradd layerremove", onMapChange, layer);
    map.on("zoomstart", startZoom, layer);
    map.on("zoomanim", onZoomAnim, layer);
    map.on("zoomend", endZoom, layer);
  }

  // src/gpu/initializeSharedRenderer.js
  async function initializeSharedRenderer(layer, map) {
    const canvas = document.createElement("canvas");
    if (!navigator.gpu) {
      failAttachment(
        /* alloc */
        new Error("Layer3D requires WebGPU"),
        layer,
        map
      );
    }
    const adapter = await requestAdapter(layer, map);
    const device = await requestDevice(adapter, layer, map);
    rendererDevices.set(device, map);
    device.addEventListener("uncapturederror", rendererDeviceError);
    Promise.all(
      /* alloc */
      [device.lost, Promise.resolve(device)]
    ).then(rendererDeviceLost);
    const context = canvas.getContext("webgpu");
    if (!context) {
      device.destroy();
      failAttachment(
        /* alloc */
        new Error("Unable to create a WebGPU canvas context"),
        layer,
        map
      );
    }
    const format = navigator.gpu.getPreferredCanvasFormat();
    context.configure(
      /* alloc */
      { device, format, alphaMode: "premultiplied" }
    );
    map.getContainer().querySelector(".leaflet-webgpu-warning")?.remove();
    sharedByLayer.set(layer, layer);
    layersByLayer.set(
      layer,
      /* alloc */
      /* @__PURE__ */ new Set()
    );
    sceneOriginByLayer.set(layer, locationByLayer.get(layer));
    sceneByLayer.set(layer, emptyNode());
    cameraByLayer.set(layer, createSceneCamera());
    rendererByLayer.set(
      layer,
      /* alloc */
      {
        device,
        context,
        format,
        canvas,
        dpr: Math.min(window.devicePixelRatio, 2)
      }
    );
    initializeRendererResources(layer, device);
    mountRenderer(layer, map, canvas);
  }

  // src/scene/attachSharedScene.js
  async function attach(layer, map) {
    let shared = renderers.get(map);
    if (rendererReadyByLayer.get(shared)) {
      await rendererReadyByLayer.get(shared).promise;
    }
    if (!shared) {
      shared = layer;
      rendererReadyByLayer.set(layer, Promise.withResolvers());
      rendererReadyByLayer.get(layer).promise.catch(noOperation);
      renderers.set(map, shared);
      await initializeSharedRenderer(layer, map);
      rendererReadyByLayer.get(layer).resolve();
      rendererReadyByLayer.delete(shared);
      render(shared);
      renderers.set(map, shared);
    }
    const origin = map.options.crs.project(sceneOriginByLayer.get(shared));
    const point = map.options.crs.project(locationByLayer.get(layer));
    const metres = Math.cos(sceneOriginByLayer.get(shared).lat * radians);
    if (terrainBaseYByLayer.get(layer) == null) terrainBaseYByLayer.set(layer, rootByLayer.get(layer).position[1]);
    rootByLayer.get(layer).position[0] = (point.x - origin.x) * metres;
    rootByLayer.get(layer).position[1] = terrainBaseYByLayer.get(layer);
    rootByLayer.get(layer).position[2] = -(point.y - origin.y) * metres;
    setTerrainHeight(layer);
    rootByLayer.get(layer).scale.fill(metres / Math.cos(locationByLayer.get(layer).lat * radians));
    sharedByLayer.set(layer, shared);
    rendererByLayer.set(layer, rendererByLayer.get(shared));
    sceneByLayer.set(layer, sceneByLayer.get(shared));
    cameraByLayer.set(layer, cameraByLayer.get(shared));
    layersByLayer.get(shared).add(layer);
    setParent(rootByLayer.get(layer), sceneByLayer.get(shared));
    traverse(rootByLayer.get(layer), restoreObject, layer);
    update(shared);
    if (headerByLayer.get(layer) && kindByLayer.get(layer) !== "raster" || geojsonByLayer.get(layer)) updateArea(layer);
  }

  // src/weakmaps/modelByLayer.js
  var modelByLayer = /* @__PURE__ */ new WeakMap();

  // src/geometry/conformModelToTerrain.js
  init_radians();
  init_L();

  // src/globals/HEIGHT.js
  var HEIGHT = 8;

  // src/geometry/vertexNormals.js
  function vertexNormals(p, indices) {
    const normals = (
      /* alloc */
      new Float32Array(p.length)
    );
    let i, a, b, c, ux, uy, uz, vx, vy, vz, j, nx, ny, nz, index, length;
    for (i = 0; i < (indices?.length || p.length / 3); i += 3) {
      a = indices ? indices[i] : i, b = indices ? indices[i + 1] : i + 1, c = indices ? indices[i + 2] : i + 2;
      ux = p[b * 3] - p[a * 3], uy = p[b * 3 + 1] - p[a * 3 + 1], uz = p[b * 3 + 2] - p[a * 3 + 2];
      vx = p[c * 3] - p[a * 3], vy = p[c * 3 + 1] - p[a * 3 + 1], vz = p[c * 3 + 2] - p[a * 3 + 2];
      nx = uy * vz - uz * vy, ny = uz * vx - ux * vz, nz = ux * vy - uy * vx;
      for (j = 0; j < 3; j++) {
        index = j === 0 ? a : j === 1 ? b : c;
        normals[index * 3] += nx;
        normals[index * 3 + 1] += ny;
        normals[index * 3 + 2] += nz;
      }
    }
    for (i = 0; i < normals.length; i += 3) {
      length = Math.hypot(normals[i], normals[i + 1], normals[i + 2]) || 1;
      for (j = 0; j < 3; j++) {
        normals[i + j] /= length;
      }
    }
    return normals;
  }

  // src/collision/collectMeshes.js
  function collectMeshes2(node, meshes) {
    if (node.geometry?.attributes.position) meshes.push(node);
    let child;
    for (child of node.children) collectMeshes2(child, meshes);
  }

  // src/geometry/conformModelToTerrain.js
  function conformModelToTerrain(layer, terrain) {
    if (!modelByLayer.get(layer)) return;
    const meshes = (
      /* alloc */
      []
    );
    collectMeshes2(modelByLayer.get(layer), meshes);
    let mesh, positions, geometry, position, normals, attribute, normal, world, inverse, i, x, y, z;
    let worldY, weight, worldX, worldZ, point, elevation, offset;
    if (!terrainReadyByLayer.get(terrain) || !layer.options.terrainConform) {
      for (mesh of meshes) {
        positions = mesh.geometry._terrainBasePositions;
        if (!positions) continue;
        geometry = mesh.geometry, position = geometry.attributes.position;
        position.data.set(positions);
        mesh.device.queue.writeBuffer(position.buffer, 0, positions);
        normals = geometry._terrainBaseNormals;
        if (normals) {
          geometry.attributes.normal.data.set(normals);
          mesh.device.queue.writeBuffer(geometry.attributes.normal.buffer, 0, normals);
        }
        computeBounds(geometry);
      }
      return;
    }
    updateWorldMatrix(rootByLayer.get(layer));
    const map = layer._map, crs = map.options.crs;
    const origin = crs.project(sceneOriginByLayer.get(sharedByLayer.get(layer)));
    const metres = Math.cos(sceneOriginByLayer.get(sharedByLayer.get(layer)).lat * radians);
    const pixelScale = crs.scale(terrainZoomByLayer.get(terrain));
    for (mesh of meshes) {
      geometry = mesh.geometry, attribute = geometry.attributes.position;
      geometry._terrainBasePositions ||= attribute.data.slice();
      normal = geometry.attributes.normal;
      geometry._terrainBaseNormals ||= normal.data.slice();
      attribute.data.set(geometry._terrainBasePositions);
      world = mesh.worldMatrix, inverse = /* alloc */
      new DOMMatrix(world).inverse().toFloat64Array();
      for (i = 0; i < attribute.data.length; i += 3) {
        x = attribute.data[i], y = attribute.data[i + 1], z = attribute.data[i + 2];
        worldY = world[1] * x + world[5] * y + world[9] * z + world[13];
        weight = Math.max(0, Math.min(1, 1 - (worldY - rootByLayer.get(layer).position[1]) / HEIGHT));
        if (!weight) continue;
        worldX = world[0] * x + world[4] * y + world[8] * z + world[12];
        worldZ = world[2] * x + world[6] * y + world[10] * z + world[14];
        point = crs.transformation.transform(
          /* alloc */
          new L.Point(
            origin.x + worldX / metres,
            origin.y - worldZ / metres
          ),
          pixelScale
        );
        elevation = getElevation(terrain, point);
        if (!Number.isFinite(elevation)) continue;
        offset = (elevation - worldY) * weight;
        attribute.data[i] += inverse[4] * offset;
        attribute.data[i + 1] += inverse[5] * offset;
        attribute.data[i + 2] += inverse[6] * offset;
      }
      mesh.device.queue.writeBuffer(attribute.buffer, 0, attribute.data);
      normal.data.set(vertexNormals(attribute.data, geometry.attributes.index?.data));
      mesh.device.queue.writeBuffer(normal.buffer, 0, normal.data);
      computeBounds(geometry);
    }
    update(layer);
  }

  // src/textures/modelTextureSampler.js
  function textureSampler(sampler) {
    return (
      /* alloc */
      {
        addressModeU: sampler?.wrapS === 33071 ? "clamp-to-edge" : sampler?.wrapS === 33648 ? "mirror-repeat" : "repeat",
        addressModeV: sampler?.wrapT === 33071 ? "clamp-to-edge" : sampler?.wrapT === 33648 ? "mirror-repeat" : "repeat",
        magFilter: sampler?.magFilter === 9728 ? "nearest" : "linear",
        minFilter: sampler?.minFilter === 9728 || sampler?.minFilter === 9984 || sampler?.minFilter === 9986 ? "nearest" : "linear"
      }
    );
  }

  // src/textures/modelTextureFor.js
  function textureFor2(context, reference, color = false) {
    const { backend: layer, description, images, textures } = context;
    if (!reference) return null;
    if ((reference.texCoord || 0) !== 0 || reference.extensions) {
      throw (
        /* alloc */
        new Error("Model textures currently require untransformed TEXCOORD_0 UVs")
      );
    }
    const device = rendererByLayer.get(layer).device;
    const key = `${reference.index}:${color}`;
    if (!textures.has(key)) {
      const texture = description.textures[reference.index];
      const sampler = description.samplers?.[texture.sampler];
      const image = images[texture.source];
      const format = color ? "rgba8unorm-srgb" : "rgba8unorm";
      const samplerOptions = textureSampler(sampler);
      textures.set(
        key,
        /* alloc */
        {
          device,
          texture: device.createTexture(
            /* alloc */
            {
              size: (
                /* alloc */
                [image.width, image.height]
              ),
              format,
              usage: GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_DST | GPUTextureUsage.RENDER_ATTACHMENT
            }
          ),
          sampler: device.createSampler(samplerOptions),
          samplerOptions,
          format,
          srgb: color,
          image,
          flipY: false,
          uploaded: null
        }
      );
    }
    return textures.get(key);
  }

  // src/materials/modelMaterialFor.js
  function materialFor(context, material) {
    const { backend: layer } = context;
    const pbr = material.pbrMetallicRoughness;
    return (
      /* alloc */
      {
        color: pbr?.baseColorFactor ? pbr.baseColorFactor.slice(0, 3) : (
          /* alloc */
          [1, 1, 1]
        ),
        opacity: pbr?.baseColorFactor?.[3] ?? 1,
        metallic: pbr?.metallicFactor ?? 1,
        roughness: pbr?.roughnessFactor ?? 1,
        baseTexture: textureFor2(context, pbr?.baseColorTexture, true),
        metalTexture: textureFor2(context, pbr?.metallicRoughnessTexture),
        emissiveTexture: textureFor2(context, material.emissiveTexture, true),
        occlusionTexture: textureFor2(context, material.occlusionTexture),
        emissive: material.emissiveFactor || /* alloc */
        [0, 0, 0],
        occlusionStrength: material.occlusionTexture?.strength ?? 1,
        alphaMode: layer.options.alphaMode || material.alphaMode || "OPAQUE",
        alphaCutoff: material.alphaCutoff ?? 0.5,
        doubleSided: material.doubleSided
      }
    );
  }

  // src/models/createModelContext.js
  function createModelContext(layer, description, images) {
    const context = (
      /* alloc */
      {
        backend: layer,
        description,
        images,
        textures: (
          /* alloc */
          /* @__PURE__ */ new Map()
        ),
        materials: (
          /* alloc */
          []
        ),
        active: (
          /* alloc */
          /* @__PURE__ */ new Set()
        ),
        resources: (
          /* alloc */
          []
        )
      }
    );
    let material;
    for (material of description.materials || geometryEmpty) context.materials.push(materialFor(context, material));
    return context;
  }

  // src/globals/geometryQuaternion.js
  var geometryQuaternion = [0, 0, 0, 1];

  // src/globals/geometryScale.js
  var geometryScale = [1, 1, 1];

  // src/globals/geometryTranslation.js
  var geometryTranslation = [0, 0, 0];

  // src/transforms/modelNodeMatrix.js
  function nodeMatrix(spec) {
    if (spec.matrix) return Array.from(spec.matrix);
    const [x, y, z, w] = spec.rotation || geometryQuaternion;
    const [sx, sy, sz] = spec.scale || geometryScale;
    return (
      /* alloc */
      [
        (1 - 2 * (y * y + z * z)) * sx,
        2 * (x * y + z * w) * sx,
        2 * (x * z - y * w) * sx,
        0,
        2 * (x * y - z * w) * sy,
        (1 - 2 * (x * x + z * z)) * sy,
        2 * (y * z + x * w) * sy,
        0,
        2 * (x * z + y * w) * sz,
        2 * (y * z - x * w) * sz,
        (1 - 2 * (x * x + y * y)) * sz,
        0,
        ...spec.translation || geometryTranslation,
        1
      ]
    );
  }

  // src/geometry/createModelGeometry.js
  function createModelGeometry(context, primitive, attributes) {
    const style = context.materials[primitive.material] || /* alloc */
    {
      color: (
        /* alloc */
        [1, 1, 1]
      ),
      metallic: 1
    };
    if ((style.baseTexture || style.metalTexture || style.emissiveTexture || style.occlusionTexture) && !attributes.uv) {
      throw (
        /* alloc */
        new Error("Textured model mesh requires UV coordinates")
      );
    }
    const program = createProgram(context.backend, style);
    context.resources.push(program);
    const device = rendererByLayer.get(context.backend).device;
    let name, attribute;
    for ([name, attribute] of Object.entries(attributes)) {
      attribute.size ||= 1;
      attribute.count = attribute.data.length / attribute.size;
      attribute.indexFormat = attribute.data instanceof Uint32Array ? "uint32" : "uint16";
      attribute.buffer = device.createBuffer(
        /* alloc */
        {
          size: Math.max(4, attribute.data.byteLength),
          usage: name === "index" ? GPUBufferUsage.INDEX | GPUBufferUsage.COPY_DST : GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST
        }
      );
      device.queue.writeBuffer(attribute.buffer, 0, attribute.data);
    }
    const geometry = (
      /* alloc */
      {
        device,
        attributes,
        drawRange: (
          /* alloc */
          { start: 0, count: attributes.index?.count || attributes.position.count }
        )
      }
    );
    context.resources.push(geometry);
    return (
      /* alloc */
      { device, geometry, program }
    );
  }

  // src/models/modelNode.js
  function modelNode(context, index) {
    const { backend: layer, description, active } = context;
    if (active.has(index)) throw (
      /* alloc */
      new Error("Cyclic glTF nodes")
    );
    const spec = description.nodes[index];
    if (!spec) throw (
      /* alloc */
      new Error("Invalid glTF node")
    );
    active.add(index);
    const group = (
      /* alloc */
      {
        ...emptyNode(),
        name: spec.name
      }
    );
    group.matrix = nodeMatrix(spec);
    let primitive, attributes, built, mesh, child;
    if (spec.mesh !== void 0) {
      for (primitive of description.meshes[spec.mesh].primitives) {
        attributes = structuredClone(primitive.preparedAttributes);
        built = createModelGeometry(context, primitive, attributes);
        mesh = /* alloc */
        {
          ...emptyNode(),
          device: built.device,
          geometry: built.geometry,
          program: built.program,
          fadeDuration: 250,
          id: nextId.value++,
          renderOrder: 0
        };
        mesh.name = description.meshes[spec.mesh].name;
        mesh.extras = spec.extras || /* alloc */
        {};
        setParent(mesh, group);
      }
    }
    for (child of spec.children || geometryEmpty) setParent(modelNode(context, child), group);
    active.delete(index);
    return group;
  }

  // src/models/releaseModelResources.js
  function releaseModelResources(context) {
    let resource, attribute;
    for (resource of context.resources) {
      if (resource.attributes) {
        for (attribute of Object.values(resource.attributes)) attribute.buffer.destroy();
      } else {
        resource.pipelineCache.clear();
      }
    }
  }

  // src/models/buildModelNodes.js
  function buildModelNodes(context, scene) {
    const nodes = (
      /* alloc */
      []
    );
    let index;
    try {
      for (index of scene.nodes) nodes.push(modelNode(context, index));
    } catch (error) {
      releaseModelResources(context);
      throw error;
    }
    return nodes;
  }

  // src/models/applyModelTransform.js
  function applyModelTransform(layer) {
    const model = modelByLayer.get(layer);
    if (layer.options.rotation) {
      const [x, y = x, z = x] = layer.options.rotation;
      model.rotation[0] = x;
      model.rotation[1] = y;
      model.rotation[2] = z;
    }
    if (layer.options.scale) {
      const [x, y = x, z = x] = layer.options.scale;
      model.scale[0] = x;
      model.scale[1] = y;
      model.scale[2] = z;
    }
  }

  // src/models/loadModel.js
  async function loadModel(layer) {
    await addedByLayer.get(layer).promise;
    const url = (
      /* alloc */
      new URL(modelUrlByLayer.get(layer), document.baseURI).href
    );
    const { description, images } = await runSourceWorker(
      layer._map,
      layer.options.workerUrl,
      /* alloc */
      { type: "model", url }
    );
    await addedByLayer.get(layer).promise;
    await cameraViewByMap.get(layer._map);
    const context = createModelContext(layer, description, images);
    const scene = description.scenes?.[description.scene || 0];
    if (!scene) throw (
      /* alloc */
      new Error("Missing glTF scene")
    );
    const nodes = buildModelNodes(context, scene);
    const model = (
      /* alloc */
      {
        ...emptyNode(),
        id: url,
        extras: description.extras || /* alloc */
        {}
      }
    );
    if (!nodes.length) throw (
      /* alloc */
      new Error("Expected a glTF model with a non-empty scene")
    );
    let node;
    for (node of nodes) setParent(node, model);
    modelByLayer.set(layer, model);
    applyModelTransform(layer);
    setParent(modelByLayer.get(layer), rootByLayer.get(layer));
    conformModelToTerrain(layer, terrain3DByMap.get(layer._map));
  }

  // src/scene/ready3D.js
  async function ready3D(layer) {
    try {
      rootByLayer.set(layer, emptyNode());
      raycasterByLayer.set(
        layer,
        /* alloc */
        {
          origin: (
            /* alloc */
            [0, 0, 0]
          ),
          direction: (
            /* alloc */
            [0, 0, 0]
          ),
          inverse: (
            /* alloc */
            new DOMMatrix()
          ),
          meshes: (
            /* alloc */
            []
          )
        }
      );
      if (urlByLayer.get(layer) || geojsonByLayer.get(layer)) {
        groupByLayer.set(layer, rootByLayer.get(layer));
        if (urlByLayer.get(layer)) headerByLayer.set(layer, await getHeader(layer));
      }
      if (layer._map) {
        await attach(layer, layer._map);
        addedByLayer.get(layer).resolve();
      }
      if (modelUrlByLayer.get(layer)) await loadModel(layer);
      if (sharedByLayer.get(layer)) update(layer);
      layer.fire("ready");
      return layer;
    } catch (error) {
      layer.fire(
        "error",
        /* alloc */
        { error }
      );
      throw error;
    }
  }

  // src/layer-controls/layerCountTitle.js
  function layerCountTitle(layer, formatted, pending, error) {
    return error ? `Unable to load: ${typeof error === "string" ? error : error.message}` : `${formatted} loaded ${modelUrlByLayer.get(layer) ? "models" : "elements"} in the current area${pending ? `; ${pending} blocks loading` : ""}`;
  }

  // src/layer-controls/renderLayerCount.js
  function renderLayerCount(layer, count, pending, error) {
    const status = countStatusByLayer.get(layer);
    const modelUrl = modelUrlByLayer.get(layer), model = modelByLayer.get(layer);
    if (modelUrl) count = model ? 1 : 0;
    const loading2 = pending || (modelUrl ? !model : !headerByLayer.get(layer) && !geojsonByLayer.get(layer));
    const formatted = count.toLocaleString("en-US");
    const text = error ? "Error" : `${formatted}${loading2 ? "\u2026" : ""}`;
    const title = layerCountTitle(layer, formatted, pending, error);
    if (status.textContent !== text) status.textContent = text;
    if (status.title !== title) status.title = title;
    if (error && status.getAttribute("role") !== "alert") status.setAttribute("role", "alert");
    else if (!error && status.hasAttribute("role")) status.removeAttribute("role");
  }

  // src/layer-controls/updateLayerCount.js
  function updateLayerCount(event) {
    const layer = event.target, status = countStatusByLayer.get(layer);
    if (!layer._map) return;
    if (event.type === "add") underEntry(layer, status);
    let count = 0, pending = 0, error = event.error, area2;
    if (Number.isFinite(event.loaded)) {
      count = event.loaded;
      pending = event.pending ?? 0;
      error ||= event.errors?.[0];
    } else {
      for (area2 of areasByLayer.get(layer).values()) {
        count += area2.buildings ?? 0;
        if (!area2.done && !area2.error) pending++;
        error ||= area2.error;
      }
    }
    renderLayerCount(layer, count, pending, error);
  }

  // src/scene/init3D.js
  function init3D(layer, options = sceneEmptyOptions) {
    state3dByLayer.set(layer, true);
    L.Util.setOptions(
      layer,
      /* alloc */
      { ariaLabel: "3D scene", ...options }
    );
    kindByLayer.set(layer, "3d");
    const isModel = !geojsonByLayer.get(layer) && /\.(glb|gltf)(?:[?#]|$)/i.test(layer.options.url);
    modelUrlByLayer.set(layer, isModel ? layer.options.url : null);
    urlByLayer.set(layer, layer.options.url && !isModel && !geojsonByLayer.get(layer) ? (
      /* alloc */
      new URL(layer.options.url, document.baseURI).href
    ) : null);
    directoriesByLayer.set(
      layer,
      /* alloc */
      /* @__PURE__ */ new Map()
    );
    if (layer.options.center) {
      locationByLayer.set(
        layer,
        /* alloc */
        new L.LatLng(layer.options.center[0], layer.options.center[1])
      );
    }
    areasByLayer.set(
      layer,
      /* alloc */
      /* @__PURE__ */ new Map()
    );
    inflightByLayer.set(layer, 0);
    if (urlByLayer.get(layer) || geojsonByLayer.get(layer) || isModel) {
      const status = L.DomUtil.create("small", "layer-count");
      status.style.cssText = "float:right;margin-left:12px;color:#555;font-variant-numeric:tabular-nums";
      countStatusByLayer.set(layer, status);
      layer.on("add error", updateLayerCount);
      layer.on("ready progress", L.Util.throttle(updateLayerCount, 250, layer));
    }
    addedByLayer.set(layer, Promise.withResolvers());
    readyByLayer.set(layer, Promise.resolve().then(ready3D.bind(null, layer)));
    readyByLayer.get(layer).catch(noOperation);
  }

  // src/walk/onWalkBlur.js
  function onBlur() {
    this.keys.clear();
  }

  // src/globals/moves.js
  var moves = {
    KeyW: [1, 0],
    ArrowUp: [1, 0],
    KeyS: [-1, 0],
    ArrowDown: [-1, 0],
    KeyD: [0, 1],
    ArrowRight: [0, 1],
    KeyA: [0, -1],
    ArrowLeft: [0, -1]
  };

  // src/walk/stopWalking.js
  init_L();
  init_mapSetPitch();

  // src/walk/onWalkPointer.js
  init_mapSetPitchAndBearing();
  init_mapGetPitch();
  init_mapGetBearing();
  function onPointer(event) {
    const map = this.layer._map;
    if (event.type === "pointerdown") {
      if (event.button !== 0 || event.target.closest(".leaflet-control")) return;
      this.dragX = event.clientX;
      this.dragY = event.clientY;
      this.dragging = true;
      map.getContainer().setPointerCapture(event.pointerId);
    } else if (this.dragging && event.type === "pointermove") {
      mapSetPitchAndBearing(map, Math.max(20, Math.min(85, mapGetPitch(map) - (event.clientY - this.dragY) * 0.2)), mapGetBearing(map) - (event.clientX - this.dragX) * 0.25);
      this.dragX = event.clientX;
      this.dragY = event.clientY;
    } else this.dragging = false;
  }

  // src/globals/limbs.js
  var limbs = [
    ["body", 0, 0, 0],
    ["leg", -0.09, 0.9, 1],
    ["leg", 0.09, 0.9, -1],
    ["arm", -0.25, 1.42, -1],
    ["arm", 0.25, 1.42, 1]
  ];

  // src/projections/walkerLocalPosition.js
  init_radians();
  function local(output) {
    const { layer, state } = this;
    const map = layer._map, crs = map.options.crs;
    const location2 = locationByLayer.get(layer), root = rootByLayer.get(layer);
    const origin = crs.project(location2), metres = Math.cos(location2.lat * radians);
    const p = crs.project(state.latlng);
    const ground = mapElevationOf(map, state.latlng) || 0;
    output[0] = (p.x - origin.x) * metres;
    output[1] = ground + (state.height ?? 0) - root.position[1];
    output[2] = -(p.y - origin.y) * metres;
    return output;
  }

  // src/walk/placeWalker.js
  function place() {
    const [x, y, z] = local.call(this, this.local);
    const yaw = -this.state.heading, cos = Math.cos(yaw), sin = Math.sin(yaw);
    let i, px, py, sign, mesh;
    for (i = 0; i < limbs.length; i++) {
      [, px, py, sign] = limbs[i];
      mesh = this.meshes[i];
      mesh.position[0] = x + px * cos;
      mesh.position[1] = y + py;
      mesh.position[2] = z - px * sin;
      mesh.rotation[0] = sign * this.swing * Math.sin(this.state.phase);
      mesh.rotation[1] = yaw;
    }
    update(this.layer);
  }

  // src/walk/onWalkTerrain.js
  function onTerrain() {
    if (this.meshes) place.call(this);
  }

  // src/walk/stopWalking.js
  function stop() {
    const map = this.layer._map;
    cancelAnimationFrame(this.frame);
    this.keys.clear();
    this.dragging = false;
    this.state.height = this.verticalSpeed = 0;
    L.DomEvent.off(document, "keydown keyup", this.onKey);
    L.DomEvent.off(window, "blur", this.onBlur);
    let mesh, name;
    if (this.meshes) for (mesh of this.meshes) disposeMesh(this.layer, mesh);
    this.meshes = null;
    this.button.setAttribute("aria-pressed", "false");
    this.button.style.background = "#fff";
    this.hint.style.display = "none";
    if (!map || !this.saved) return;
    L.DomEvent.off(map.getContainer(), "pointerdown pointermove pointerup pointercancel", this.onPointer);
    map.off("terrainchange", this.onTerrain);
    map.options.scrollWheelZoom = this.saved.scrollWheelZoom;
    for (name of this.saved.handlers) map[name].enable();
    map.setView(
      this.state.latlng,
      this.saved.zoom,
      /* alloc */
      { animate: false }
    );
    mapSetPitch(map, this.saved.pitch);
    this.saved = null;
  }

  // src/walk/onWalkKey.js
  function onKey(event) {
    if (event.type === "keyup" && event.code === "Space") this.keys.delete("Space");
    if (event.target.closest?.("input:not([type=checkbox], [type=radio]), select, textarea, [contenteditable]") || event.ctrlKey || event.altKey || event.metaKey) return;
    if (event.type === "keydown" && event.code === "Escape") {
      this.stop();
      return;
    }
    if (!moves[event.code] && event.code !== "Space") return;
    event.preventDefault();
    if (event.type === "keydown") this.keys.add(event.code);
    else this.keys.delete(event.code);
  }

  // src/walk/startWalking.js
  init_radians();
  init_L();

  // src/globals/sceneWalkHandlers.js
  var sceneWalkHandlers = ["dragging", "keyboard", "doubleClickZoom", "boxZoom"];

  // src/walk/startWalking.js
  init_mapGetPitch();
  init_mapGetBearing();
  init_mapSetPitch();

  // src/geometry/box.js
  function box(x0, x1, z0, z1) {
    return (
      /* alloc */
      [
        /* alloc */
        [x0, z0],
        /* alloc */
        [x1, z0],
        /* alloc */
        [x1, z1],
        /* alloc */
        [x0, z1]
      ]
    );
  }

  // src/globals/trousers.js
  var trousers = [0.16, 0.2, 0.32];

  // src/globals/shirt.js
  var shirt = [0.75, 0.2, 0.15];

  // src/globals/skin.js
  var skin = [0.85, 0.64, 0.5];

  // src/globals/dark.js
  var dark = [0.08, 0.07, 0.06];

  // src/globals/parts.js
  var parts = {
    body: [
      [box(-0.17, 0.17, -0.1, 0.1), 0.82, 0.95, trousers],
      [box(-0.19, 0.19, -0.11, 0.11), 0.95, 1.44, shirt],
      [box(-0.05, 0.05, -0.05, 0.05), 1.44, 1.5, skin],
      [box(-0.1, 0.1, -0.11, 0.1), 1.5, 1.72, skin],
      [box(-0.105, 0.105, -0.06, 0.115), 1.58, 1.77, dark],
      [box(-0.105, 0.105, -0.115, -0.06), 1.7, 1.77, dark]
    ],
    leg: [
      [box(-0.07, 0.07, -0.07, 0.07), -0.82, 0, trousers],
      [box(-0.07, 0.07, -0.17, 0.07), -0.9, -0.82, dark]
    ],
    arm: [
      [box(-0.05, 0.05, -0.05, 0.05), -0.55, 0, shirt],
      [box(-0.045, 0.045, -0.045, 0.045), -0.66, -0.55, skin]
    ]
  };

  // src/geometry/triangle.js
  function triangle2(position, normal, color, a, b, c, tint) {
    const ux = b[0] - a[0], uy = b[1] - a[1], uz = b[2] - a[2];
    const vx = c[0] - a[0], vy = c[1] - a[1], vz = c[2] - a[2];
    const nx = uy * vz - uz * vy, ny = uz * vx - ux * vz, nz = ux * vy - uy * vx;
    const length = Math.hypot(nx, ny, nz);
    let i, point;
    for (i = 0; i < 3; i++) {
      point = i === 0 ? a : i === 1 ? b : c;
      position.push(...point);
      normal.push(nx / length, ny / length, nz / length);
      color.push(...tint);
    }
  }

  // src/geometry/buildGeometryParts.js
  function build(parts2) {
    const position = (
      /* alloc */
      []
    );
    const normal = (
      /* alloc */
      []
    );
    const color = (
      /* alloc */
      []
    );
    const low = (
      /* alloc */
      []
    );
    const high = (
      /* alloc */
      []
    );
    let ring, bottom, top, tint, topRing, x, z, i, j;
    for ([ring, bottom, top, tint, topRing = ring] of parts2) {
      low.length = high.length = 0;
      for ([x, z] of ring) low.push(
        /* alloc */
        [x, bottom, z]
      );
      for ([x, z] of topRing) high.push(
        /* alloc */
        [x, top, z]
      );
      for (i = 0; i < ring.length; i++) {
        j = (i + 1) % ring.length;
        triangle2(position, normal, color, low[i], low[j], high[j], tint);
        triangle2(position, normal, color, low[i], high[j], high[i], tint);
      }
      for (i = 1; i < ring.length - 1; i++) {
        triangle2(position, normal, color, high[0], high[i], high[i + 1], tint);
        triangle2(position, normal, color, low[0], low[i + 1], low[i], tint);
      }
    }
    return (
      /* alloc */
      { position, normal, color }
    );
  }

  // src/walk/stepWalkerHeight.js
  function stepWalkerHeight(dt) {
    if (this.keys.has("Space")) {
      this.verticalSpeed = 6;
      this.state.height += this.verticalSpeed * dt;
      return true;
    }
    if (!this.verticalSpeed && !this.state.height) return false;
    this.state.height = Math.max(0, this.state.height + this.verticalSpeed * dt - 9.81 * dt * dt / 2);
    this.verticalSpeed = this.state.height > 0 ? this.verticalSpeed - 9.81 * dt : 0;
    return true;
  }

  // src/walk/resolveWalkerPosition.js
  init_L();

  // src/globals/CELL.js
  var CELL = 8;

  // src/weakmaps/colliders.js
  var colliders = /* @__PURE__ */ new WeakMap();

  // src/collision/advanceFeature.js
  function advanceFeature(ranges, feature, face) {
    while (ranges && feature < ranges.length && face >= ranges[feature].faceEnd) feature++;
    return feature;
  }

  // src/collision/cachedCollider.js
  function cachedCollider(mesh) {
    const c = colliders.get(mesh), m = mesh.worldMatrix;
    if (!c || c.geometry !== mesh.geometry) return void 0;
    let i;
    for (i = 0; i < 12; i++) {
      if (i % 4 !== 3 && c.matrix[i] !== m[i]) return void 0;
    }
    return c;
  }

  // src/collision/flipsNormal.js
  function flipsNormal(m, data, j, nx, nz) {
    return (m[0] * data[j] + m[4] * data[j + 1] + m[8] * data[j + 2]) * nx + (m[2] * data[j] + m[6] * data[j + 1] + m[10] * data[j + 2]) * nz < 0;
  }

  // src/collision/indexTriangle.js
  function indexTriangle(cells, v, t) {
    let ix, iz, key;
    for (ix = Math.floor(Math.min(v[0], v[3], v[6]) / CELL); ix <= Math.floor(Math.max(v[0], v[3], v[6]) / CELL); ix++)
      for (iz = Math.floor(Math.min(v[2], v[5], v[8]) / CELL); iz <= Math.floor(Math.max(v[2], v[5], v[8]) / CELL); iz++) {
        key = ix + "," + iz;
        if (!cells.has(key)) cells.set(
          key,
          /* alloc */
          []
        );
        cells.get(key).push(t);
      }
  }

  // src/collision/transformVertices.js
  function transformVertices(v, a, b, d, m) {
    let k, p;
    for (k = 0; k < 3; k++) {
      p = k === 0 ? a : k === 1 ? b : d;
      v[k * 3] = m[0] * p[0] + m[4] * p[1] + m[8] * p[2] + m[12];
      v[k * 3 + 1] = m[1] * p[0] + m[5] * p[1] + m[9] * p[2] + m[13];
      v[k * 3 + 2] = m[2] * p[0] + m[6] * p[1] + m[10] * p[2] + m[14];
    }
  }

  // src/collision/collider.js
  function collider(mesh) {
    const m = mesh.worldMatrix;
    const cached = cachedCollider(mesh);
    if (cached) return cached;
    const { position, index, normal, uv, instanceOffset } = mesh.geometry.attributes;
    const vertices = vertexCount(position, index);
    const count = vertices * (instanceOffset?.count ?? 1);
    const tri = (
      /* alloc */
      []
    );
    const nrm = (
      /* alloc */
      []
    );
    const features = (
      /* alloc */
      []
    );
    const cells = (
      /* alloc */
      /* @__PURE__ */ new Map()
    );
    const a = (
      /* alloc */
      [0, 0, 0]
    ), b = (
      /* alloc */
      [0, 0, 0]
    ), d = (
      /* alloc */
      [0, 0, 0]
    );
    const v = (
      /* alloc */
      []
    );
    const ranges = mesh.extras?.featureFaces;
    let i, first, j, ex, ey, ez, fx, fy, fz, nx, nz, ny, length, h, t, feature = 0, maxX = -Infinity;
    for (i = 0; i < count; i += 3) {
      feature = advanceFeature(ranges, feature, i / 3);
      first = index ? index.data[i % vertices] : i % vertices;
      if (mesh.program.nightLight && uv && uv.data[first * 2] <= 2) {
        continue;
      }
      readTriangle(mesh, i, a, b, d);
      transformVertices(v, a, b, d, m);
      ex = v[3] - v[0], ey = v[4] - v[1], ez = v[5] - v[2], fx = v[6] - v[0], fy = v[7] - v[1], fz = v[8] - v[2];
      nx = ey * fz - ez * fy, nz = ex * fy - ey * fx;
      ny = ez * fx - ex * fz, length = Math.hypot(nx, ny, nz);
      if (!length || Math.abs(ny) > 0.9 * length) {
        continue;
      }
      if (normal) {
        j = first * 3;
        if (flipsNormal(m, normal.data, j, nx, nz)) {
          nx = -nx;
          nz = -nz;
        }
      }
      h = Math.hypot(nx, nz), t = nrm.length / 2;
      tri.push(...v);
      maxX = Math.max(maxX, v[0], v[3], v[6]);
      nrm.push(nx / h, nz / h);
      features.push(ranges ? feature : instanceOffset ? Math.floor(i / vertices) : 0);
      indexTriangle(cells, v, t);
    }
    const c = (
      /* alloc */
      {
        tri: Float32Array.from(tri),
        nrm: Float32Array.from(nrm),
        features: Uint32Array.from(features),
        ranges,
        cells,
        maxX,
        geometry: mesh.geometry,
        matrix: Array.from(m),
        origin: (
          /* alloc */
          [m[12], m[13], m[14]]
        )
      }
    );
    colliders.set(mesh, c);
    return c;
  }

  // src/collision/horizontalRay.js
  function horizontalRay(v, t, ox, oy, oz, dx, dz) {
    const i = t * 9, ex = v[i + 3] - v[i], ey = v[i + 4] - v[i + 1], ez = v[i + 5] - v[i + 2];
    const fx = v[i + 6] - v[i], fy = v[i + 7] - v[i + 1], fz = v[i + 8] - v[i + 2];
    const px = -dz * fy, py = dz * fx - dx * fz, pz = dx * fy, det = ex * px + ey * py + ez * pz;
    if (Math.abs(det) < 1e-9) return -1;
    const tx = ox - v[i], ty = oy - v[i + 1], tz = oz - v[i + 2], u = (tx * px + ty * py + tz * pz) / det;
    if (u < 0 || u > 1) return -1;
    const qx = ty * ez - tz * ey, qy = tz * ex - tx * ez, qz = tx * ey - ty * ex, w = (dx * qx + dz * qz) / det;
    if (w < 0 || u + w > 1) return -1;
    return (fx * qx + fy * qy + fz * qz) / det;
  }

  // src/collision/collectIntersections.js
  function collectIntersections(shape, x, y, z, seen, hits, end, iz) {
    const { tri, features, ranges } = shape;
    let ix, cell, triangle3, distance, feature, i, ax, az, bx, bz, cx, cz, ab, ac, bc;
    for (ix = Math.floor(x / CELL); ix <= end; ix++) {
      cell = shape.cells.get(`${ix},${iz}`);
      if (!cell) continue;
      for (triangle3 of cell) {
        if (seen.has(triangle3)) continue;
        seen.add(triangle3);
        feature = features[triangle3];
        distance = horizontalRay(tri, triangle3, x, y, z, 1, 0);
        if (distance > 1e-4) hits.push(feature * 2, distance);
        if (!ranges?.[feature]?.polygon) continue;
        i = triangle3 * 9;
        ax = tri[i], az = tri[i + 2], bx = tri[i + 3], bz = tri[i + 5], cx = tri[i + 6], cz = tri[i + 8];
        ab = (ax - bx) ** 2 + (az - bz) ** 2;
        ac = (ax - cx) ** 2 + (az - cz) ** 2;
        bc = (bx - cx) ** 2 + (bz - cz) ** 2;
        if (ac > ab && ac >= bc) bx = cx, bz = cz;
        else if (bc > ab && bc > ac) ax = bx, az = bz, bx = cx, bz = cz;
        if (az > z === bz > z) continue;
        distance = ax + (z - az) * (bx - ax) / (bz - az) - x;
        if (distance > 1e-4) hits.push(feature * 2 + 1, distance);
      }
    }
  }

  // src/collision/enclosesOrigin.js
  function enclosesOrigin(height, footprint, ranges, feature) {
    return Boolean(height && (!ranges?.[feature]?.polygon || footprint));
  }

  // src/collision/sortCrossings.js
  function sortCrossings(hits) {
    let ix, j, feature, distance;
    for (ix = 2; ix < hits.length; ix += 2) {
      feature = hits[ix], distance = hits[ix + 1];
      j = ix - 2;
      while (j >= 0 && (hits[j] > feature || hits[j] === feature && hits[j + 1] > distance)) {
        hits[j + 2] = hits[j], hits[j + 3] = hits[j + 1];
        j -= 2;
      }
      hits[j + 2] = feature, hits[j + 3] = distance;
    }
  }

  // src/collision/countCrossings.js
  function countCrossings(hits, ranges) {
    sortCrossings(hits);
    let crossings = 0, enclosed = 0, previous = -Infinity, previousKey = -1, previousFeature = -1, height = 0, footprint = 0;
    let ix, key, feature, distance;
    for (ix = 0; ix <= hits.length; ix += 2) {
      key = ix < hits.length ? hits[ix] : -1;
      feature = Math.floor(key / 2);
      if (key !== previousKey && previousKey >= 0) {
        if (previousKey % 2) footprint = crossings % 2;
        else height = crossings % 2;
      }
      if (key !== previousKey && previousKey >= 0 && feature !== previousFeature) {
        enclosed += Number(enclosesOrigin(height, footprint, ranges, previousFeature));
        height = 0, footprint = 0;
      }
      if (key !== previousKey) crossings = 0, previous = -Infinity, previousKey = key, previousFeature = feature;
      if (ix === hits.length) break;
      distance = hits[ix + 1];
      if (distance - previous > (key % 2 ? 1e-3 : 1e-4)) crossings++;
      previous = distance;
    }
    return enclosed;
  }

  // src/collision/insideMesh.js
  function insideMesh(mesh, x, y, z, seen, intersections) {
    const geometry = mesh.geometry;
    if (!mesh.visible || !geometry?.attributes?.position?.data || mesh.program?.depthTest === false) return false;
    if (!geometry.bounds) computeBounds(geometry);
    const bounds = geometry.bounds;
    const world = mesh.worldMatrix;
    const center = bounds.center;
    const cx = world[0] * center[0] + world[4] * center[1] + world[8] * center[2] + world[12];
    const cy = world[1] * center[0] + world[5] * center[1] + world[9] * center[2] + world[13];
    const cz = world[2] * center[0] + world[6] * center[1] + world[10] * center[2] + world[14];
    const radius = bounds.radius * Math.max(
      Math.hypot(world[0], world[1], world[2]),
      Math.hypot(world[4], world[5], world[6]),
      Math.hypot(world[8], world[9], world[10])
    );
    if (Math.hypot(cx - x, cy - y, cz - z) > radius) return false;
    const shape = collider(mesh);
    x += shape.origin[0] - world[12];
    y += shape.origin[1] - world[13];
    z += shape.origin[2] - world[14];
    const end = Math.floor(shape.maxX / CELL);
    if (x >= shape.maxX) return false;
    const iz = Math.floor(z / CELL);
    const hits = intersections;
    hits.length = 0;
    seen.clear();
    collectIntersections(shape, x, y, z, seen, hits, end, iz);
    return countCrossings(hits, shape.ranges) > 0;
  }

  // src/collision/boxNormal.js
  function boxNormal(entry, xFirst, ox, oz, ux, uz, bounds, margin, out) {
    if (entry >= 0) {
      out[0] = xFirst ? -Math.sign(ux) : 0;
      out[1] = xFirst ? 0 : -Math.sign(uz);
      return;
    }
    let nearest = ox - (bounds.minX - margin);
    out[0] = -1;
    out[1] = 0;
    if (bounds.maxX + margin - ox < nearest) {
      nearest = bounds.maxX + margin - ox;
      out[0] = 1;
    }
    if (oz - (bounds.minZ - margin) < nearest) {
      nearest = oz - (bounds.minZ - margin);
      out[0] = 0;
      out[1] = -1;
    }
    if (bounds.maxZ + margin - oz < nearest) {
      out[0] = 0;
      out[1] = 1;
    }
  }

  // src/collision/trafficRay.js
  function trafficRay(root, position, x, z, dx, dz, px, pz, out) {
    const rx = (x - root.position[0]) / root.scale[0] - px;
    const rz = (z - root.position[2]) / root.scale[2] - pz;
    out[0] = -rx * position.dz + rz * position.dx;
    out[1] = -rx * position.dx - rz * position.dz;
    out[2] = -dx / root.scale[0] * position.dz + dz / root.scale[2] * position.dx;
    out[3] = -dx / root.scale[0] * position.dx - dz / root.scale[2] * position.dz;
  }

  // src/collision/missesBox.js
  function missesBox(entry, exit, reach, best) {
    return entry > exit || exit < 0 || entry > reach || reach && Math.max(0, entry) >= best;
  }

  // src/collision/slabDistance.js
  function slabDistance(origin, velocity, low, high, parallel) {
    return velocity ? ((velocity > 0 ? low : high) - origin) / velocity : parallel;
  }

  // src/collision/slabMiss.js
  function slabMiss(origin, velocity, min, max, margin) {
    return !velocity && (origin <= min - margin || origin >= max + margin);
  }

  // src/collision/collideTrip.js
  function collideTrip(state, trip, root, bounds, x, y, z, dx, dz, reach, data) {
    const position = state.position ||= /* alloc */
    {};
    const ray = state.ray ||= /* alloc */
    [0, 0, 0, 0];
    const normal = state.localNormal ||= /* alloc */
    [0, 0];
    const scale = Math.max(root.scale[0], root.scale[1], root.scale[2]);
    const margin = 0.35 / scale;
    const { x: px, y: py, z: pz } = locateTraffic(state, trip, position);
    const bottom = root.position[1] + (py + bounds.minY) * root.scale[1];
    const top = root.position[1] + (position.y + bounds.maxY) * root.scale[1];
    if (bottom > y + 1.7 * scale || top < y + 0.2 * scale) return;
    trafficRay(root, position, x, z, dx, dz, px, pz, ray);
    const ox = ray[0], oz = ray[1], ux = ray[2], uz = ray[3];
    if (slabMiss(ox, ux, bounds.minX, bounds.maxX, margin) || slabMiss(oz, uz, bounds.minZ, bounds.maxZ, margin)) return;
    const nearX = slabDistance(ox, ux, bounds.minX - margin, bounds.maxX + margin, -Infinity);
    const farX = slabDistance(ox, ux, bounds.maxX + margin, bounds.minX - margin, Infinity);
    const nearZ = slabDistance(oz, uz, bounds.minZ - margin, bounds.maxZ + margin, -Infinity);
    const farZ = slabDistance(oz, uz, bounds.maxZ + margin, bounds.minZ - margin, Infinity);
    const entry = Math.max(nearX, nearZ);
    if (missesBox(entry, Math.min(farX, farZ), reach, data.best)) return;
    if (!reach) {
      data.found = true;
      return;
    }
    boxNormal(entry, nearX > nearZ, ox, oz, ux, uz, bounds, margin, normal);
    const worldX = (-normal[0] * position.dz - normal[1] * position.dx) / root.scale[0];
    const worldZ = (normal[0] * position.dx - normal[1] * position.dz) / root.scale[2];
    if (entry < 0 && dx * worldX + dz * worldZ >= 0) return;
    const length = Math.hypot(worldX, worldZ);
    data.best = Math.max(0, entry);
    data.found = true;
    data.normal[0] = worldX / length;
    data.normal[1] = worldZ / length;
  }

  // src/collision/trafficBounds.js
  function trafficBounds(state) {
    if (state.collisionBounds) return state.collisionBounds;
    const bounds = state.collisionBounds = /* alloc */
    {
      minX: Infinity,
      maxX: -Infinity,
      minY: Infinity,
      maxY: -Infinity,
      minZ: Infinity,
      maxZ: -Infinity
    };
    const position = state.template.position;
    let i;
    for (i = 0; i < position.length; i += 3) {
      bounds.minX = Math.min(bounds.minX, position[i]);
      bounds.maxX = Math.max(bounds.maxX, position[i]);
      bounds.minY = Math.min(bounds.minY, position[i + 1]);
      bounds.maxY = Math.max(bounds.maxY, position[i + 1]);
      bounds.minZ = Math.min(bounds.minZ, position[i + 2]);
      bounds.maxZ = Math.max(bounds.maxZ, position[i + 2]);
    }
    return bounds;
  }

  // src/collision/trafficCollision.js
  function trafficCollision(layer, x, y, z, dx, dz, reach, data) {
    const state = trafficByLayer.get(layer);
    if (!state?.mesh || !state.trips.length) return false;
    const root = rootByLayer.get(layer), bounds = trafficBounds(state);
    let trip;
    for (trip of state.trips) {
      collideTrip(state, trip, root, bounds, x, y, z, dx, dz, reach, data);
      if (!reach && data.found) break;
    }
    return data.found;
  }

  // src/collision/insideWalker.js
  function insideWalker(context) {
    const { layer, local: localBuffer, hitData } = context;
    const shared = sharedByLayer.get(layer);
    if (!shared || !layersByLayer.get(shared)) return false;
    updateWorldMatrix(sceneByLayer.get(layer));
    const root = rootByLayer.get(layer);
    const feet = local.call(context, localBuffer);
    const x = root.position[0] + feet[0] * root.scale[0];
    const y = root.position[1] + feet[1] * root.scale[1];
    const z = root.position[2] + feet[2] * root.scale[2];
    const layers = layersByLayer.get(shared);
    let other, node, child, nodes;
    for (other of layers) {
      if (other === layer || kindByLayer.get(other) === "terrain") continue;
      if (kindByLayer.get(other) === "traffic") {
        hitData.best = 0;
        hitData.found = false;
        if (trafficCollision(other, x, y, z, 0, 0, 0, hitData)) return true;
        continue;
      }
      nodes = hitData.nodes;
      nodes.length = 0;
      if (rootByLayer.get(other)) nodes.push(rootByLayer.get(other));
      while (nodes.length) {
        node = nodes.pop();
        if (!node.visible) continue;
        if (node.geometry && (insideMesh(node, x, y + 0.45 * root.scale[1], z, hitData.seen, hitData.intersections) || insideMesh(node, x, y + 1.35 * root.scale[1], z, hitData.seen, hitData.intersections))) return true;
        for (child of node.children) nodes.push(child);
      }
    }
    return false;
  }

  // src/walk/resolveWalkerPosition.js
  function resolveWalkerPosition() {
    if (!this.saved || !insideWalker(this)) return false;
    const map = this.layer._map;
    const origin = this.state.latlng;
    const height = this.state.height;
    let distance, angle, candidate;
    for (distance = 0.5; distance <= 20; distance += 0.5) {
      for (angle = 0; angle < Math.PI * 2; angle += Math.PI / 4) {
        candidate = /* alloc */
        new L.LatLng(
          origin.lat + Math.cos(angle) * distance / 111320,
          origin.lng + Math.sin(angle) * distance / (111320 * Math.cos(origin.lat * Math.PI / 180))
        );
        this.state.latlng = candidate;
        this.state.height = 0;
        if (!insideWalker(this)) {
          this.verticalSpeed = 0;
          map.setView(
            candidate,
            map.getZoom(),
            /* alloc */
            { animate: false }
          );
          return true;
        }
      }
    }
    this.state.latlng = origin;
    this.state.height = height;
    return false;
  }

  // src/utils/wrap.js
  function wrap(angle) {
    return Math.atan2(Math.sin(angle), Math.cos(angle));
  }

  // src/picking/shouldSkipOther.js
  function shouldSkipOther(other, layer) {
    return other === layer || typeByLayer.get(other) === "terrain" || typeByLayer.get(other) === "traffic";
  }

  // src/walk/landWalker.js
  function land(previousY) {
    const ray = raycasterByLayer.get(this.layer);
    const feet = local.call(this, this.local), root = rootByLayer.get(this.layer);
    const x = root.position[0] + feet[0] * root.scale[0];
    const y = root.position[1] + feet[1] * root.scale[1];
    const z = root.position[2] + feet[2] * root.scale[2];
    if (y > previousY || this.verticalSpeed > 0) return;
    updateWorldMatrix(sceneByLayer.get(this.layer));
    ray.origin[0] = x;
    ray.origin[1] = previousY + 0.01;
    ray.origin[2] = z;
    ray.direction[0] = 0;
    ray.direction[1] = -1;
    ray.direction[2] = 0;
    ray.meshes.length = 0;
    let layer, hit2;
    for (layer of layersByLayer.get(sharedByLayer.get(this.layer))) {
      if (shouldSkipOther(layer, this.layer) || kindByLayer.get(layer) === "raster" || layer.options.nightLight) continue;
      traverse(rootByLayer.get(layer), collectVisibleMesh2, ray.meshes);
    }
    for (hit2 of intersectMeshes(ray, ray.meshes)) {
      if (hit2.point[1] < y - 1e-3) break;
      this.state.height += (hit2.point[1] - y) / root.scale[1];
      this.verticalSpeed = 0;
      break;
    }
    ray.meshes.length = 0;
  }

  // src/walk/moveWalker.js
  init_L();
  init_radians();

  // src/picking/hitColliderCell.js
  function hitColliderCell(cell, c, data, ox, oy, oz) {
    const { dx, dz, seen } = data;
    let t, height, d;
    for (t of cell) {
      if (seen.has(t) || dx * c.nrm[t * 2] + dz * c.nrm[t * 2 + 1] >= 0) continue;
      seen.add(t);
      for (height = 0.4; height < 2; height += 1.1) {
        d = horizontalRay(c.tri, t, ox, oy + height, oz, dx, dz);
        if (d >= 0 && d < data.best) {
          data.best = d;
          data.found = true;
          data.normal[0] = c.nrm[t * 2];
          data.normal[1] = c.nrm[t * 2 + 1];
        }
      }
    }
  }

  // src/picking/hitMesh.js
  function hitMesh(mesh, data) {
    if (!mesh.visible) return true;
    if (!mesh.geometry?.attributes?.position?.data || mesh.program?.depthTest === false) return;
    if (!mesh.geometry.bounds) computeBounds(mesh.geometry);
    const m = mesh.worldMatrix, { center: k, radius } = mesh.geometry.bounds;
    const { x, y, z, dx, dz, reach } = data;
    if (Math.hypot(m[0] * k[0] + m[4] * k[1] + m[8] * k[2] + m[12] - x, m[2] * k[0] + m[6] * k[1] + m[10] * k[2] + m[14] - z) > radius * Math.hypot(m[0], m[1], m[2]) + reach) return;
    const c = collider(mesh), ox = x - m[12] + c.origin[0], oy = y - m[13] + c.origin[1], oz = z - m[14] + c.origin[2];
    const seen = data.seen;
    seen.clear();
    let ix, iz, cell;
    for (ix = Math.floor(Math.min(ox, ox + dx * reach) / CELL); ix <= Math.floor(Math.max(ox, ox + dx * reach) / CELL); ix++)
      for (iz = Math.floor(Math.min(oz, oz + dz * reach) / CELL); iz <= Math.floor(Math.max(oz, oz + dz * reach) / CELL); iz++) {
        cell = c.cells.get(ix + "," + iz);
        if (!cell) continue;
        hitColliderCell(cell, c, data, ox, oy, oz);
      }
  }

  // src/picking/hit.js
  function hit(layer, x, y, z, dx, dz, reach, data) {
    updateWorldMatrix(sceneByLayer.get(layer));
    data.x = x, data.y = y, data.z = z, data.dx = dx, data.dz = dz, data.reach = reach;
    data.best = reach, data.found = false;
    let other;
    for (other of layersByLayer.get(sharedByLayer.get(layer))) {
      if (other === layer || kindByLayer.get(other) === "terrain") continue;
      if (kindByLayer.get(other) === "traffic") {
        trafficCollision(other, x, y, z, dx, dz, reach, data);
        continue;
      }
      traverse(rootByLayer.get(other), hitMesh, data);
    }
    return data.found ? data.normal : null;
  }

  // src/walk/isWalkBlocked.js
  function blocked(east, north, feet) {
    const length = Math.hypot(east, north);
    return length > 1e-6 && hit(this.layer, feet[0], feet[1], feet[2], east / length, -north / length, length + 0.3, this.hitData);
  }

  // src/walk/moveWalker.js
  function moveWalker(forward, dt) {
    const metres = forward * this.speed * dt, { lat, lng } = this.state.latlng;
    const { position, scale } = rootByLayer.get(this.layer);
    let east = Math.sin(this.state.heading) * metres, north = Math.cos(this.state.heading) * metres;
    const feet = local.call(this, this.local);
    let i;
    for (i = 0; i < feet.length; i++) feet[i] = position[i] + scale[i] * feet[i];
    const wall = blocked.call(this, east, north, feet);
    if (wall) {
      const fraction = Math.max(0, Math.min(1, (this.hitData.best - 0.3) / Math.hypot(east, north)));
      const movedEast = east * fraction, movedNorth = north * fraction;
      feet[0] += movedEast;
      feet[2] -= movedNorth;
      east -= movedEast;
      north -= movedNorth;
      const into = Math.min(0, east * wall[0] - north * wall[1]);
      east -= into * wall[0];
      north += into * wall[1];
      if (blocked.call(this, east, north, feet)) {
        const slide = Math.max(0, Math.min(1, (this.hitData.best - 0.3) / Math.hypot(east, north)));
        east *= slide;
        north *= slide;
      }
      east += movedEast;
      north += movedNorth;
    }
    this.state.latlng = /* alloc */
    new L.LatLng(lat + north / 111320, lng + east / (111320 * Math.cos(lat * radians)));
    this.state.phase += Math.hypot(east, north) / 1.6 * Math.PI;
  }

  // src/walk/updateWalkerView.js
  init_degrees();
  init_radians();
  init_mapGetBearing();
  init_mapSetPitchAndBearing();
  init_mapGetPitch();
  function updateWalkerView(forward, turn, dt) {
    const map = this.layer._map;
    if (forward || turn) {
      const bearing = mapGetBearing(map) * radians, behind = wrap(-this.state.heading - bearing);
      if (Math.abs(behind) > 1e-3) mapSetPitchAndBearing(map, mapGetPitch(map), (bearing + behind * Math.min(1, dt * 4)) * degrees);
      map.setView(
        this.state.latlng,
        map.getZoom(),
        /* alloc */
        { animate: false }
      );
    }
    const target = forward ? 0.9 : 0;
    if (Math.abs(this.swing - target) > 1e-3) {
      this.swing += (target - this.swing) * Math.min(1, dt * 10);
      return true;
    }
    return false;
  }

  // src/walk/updateWalkerFrame.js
  function updateWalkerFrame(walker, previousY, forward, turn, dt, changed) {
    if (turn) {
      walker.state.heading = wrap(walker.state.heading + turn * 2.5 * dt);
      changed = true;
    }
    if (forward) {
      moveWalker.call(walker, forward, dt);
      changed = true;
    }
    if (changed) land.call(walker, previousY);
    if (updateWalkerView.call(walker, forward, turn, dt)) changed = true;
    if (changed) place.call(walker);
  }

  // src/walk/animateWalker.js
  function step(now) {
    const layer = this.layer;
    this.frame = requestAnimationFrame(this.step);
    const dt = Math.min(0.1, (now - (this.last ?? now)) / 1e3);
    this.last = now;
    if (!rendererByLayer.get(layer)) return;
    let changed = false;
    let part, key;
    if (now >= this.nextClearanceCheck) {
      this.nextClearanceCheck = now + 250;
      if (resolveWalkerPosition.call(this)) changed = true;
    }
    if (!this.meshes) {
      this.meshes = /* alloc */
      [];
      for ([part] of limbs) this.meshes.push(createMesh(layer, build(parts[part])));
      changed = true;
    }
    const previousY = rootByLayer.get(layer).position[1] + local.call(this, this.local)[1] * rootByLayer.get(layer).scale[1];
    if (stepWalkerHeight.call(this, dt)) changed = true;
    let forward = 0, turn = 0;
    for (key of this.keys) {
      forward += moves[key]?.[0] || 0;
      turn += moves[key]?.[1] || 0;
    }
    forward = Math.sign(forward);
    turn = Math.sign(turn);
    updateWalkerFrame(this, previousY, forward, turn, dt, changed);
  }

  // src/walk/startWalking.js
  function start() {
    const map = this.layer._map;
    if (this.saved || !map) return;
    this.state.latlng = map.getCenter();
    this.state.height = this.verticalSpeed = 0;
    const pixelsPerMetre = map.getSize().y * 1.5 / this.distance;
    const zoom = Math.min(map.getMaxZoom(), Math.log2(pixelsPerMetre * earthCirc * Math.cos(this.state.latlng.lat * radians) / 256));
    let name;
    this.saved = /* alloc */
    {
      zoom: map.getZoom(),
      pitch: mapGetPitch(map),
      scrollWheelZoom: map.options.scrollWheelZoom,
      handlers: (
        /* alloc */
        []
      )
    };
    for (name of sceneWalkHandlers) {
      if (map[name]?.enabled()) this.saved.handlers.push(name);
    }
    for (name of this.saved.handlers) map[name].disable();
    map.options.scrollWheelZoom = this.saved.scrollWheelZoom && "center";
    this.state.heading = -mapGetBearing(map) * radians;
    map.setView(
      this.state.latlng,
      zoom,
      /* alloc */
      { animate: false }
    );
    mapSetPitch(map, 75);
    resolveWalkerPosition.call(this);
    L.DomEvent.on(document, "keydown keyup", this.onKey);
    L.DomEvent.on(window, "blur", this.onBlur);
    L.DomEvent.on(map.getContainer(), "pointerdown pointermove pointerup pointercancel", this.onPointer);
    map.on("terrainchange", this.onTerrain);
    this.button.setAttribute("aria-pressed", "true");
    this.button.style.background = "#e4e4e4";
    this.hint.style.display = "";
    this.last = void 0;
    this.nextClearanceCheck = 0;
    this.frame = requestAnimationFrame(this.step);
  }

  // src/walk/toggleWalking.js
  function toggle() {
    if (this.saved) stop.call(this);
    else start.call(this);
  }

  // src/walk/createWalk.js
  function createWalk(control, {
    speed: speed2,
    distance,
    ...options
  }) {
    const layer = (
      /* alloc */
      new L.Layer()
    );
    typeByLayer.set(layer, "walk");
    init3D(layer, options);
    const keys = (
      /* alloc */
      /* @__PURE__ */ new Set()
    );
    const container = L.DomUtil.create("div", "leaflet-bar leaflet-control");
    container.style.cssText = "display:flex;align-items:center;background:#fff;";
    const button = L.DomUtil.create("button", "", container);
    button.type = "button";
    button.title = "Walk";
    button.setAttribute("aria-label", "Walk");
    button.setAttribute("aria-pressed", "false");
    button.textContent = "\u{1F6B6}";
    button.style.cssText = "width:30px;height:30px;padding:0;border:0;border-radius:4px;background:#fff;font-size:18px;line-height:30px;cursor:pointer;";
    const hint = L.DomUtil.create("small", "", container);
    hint.style.cssText = "display:none;padding:0 8px;color:#333;white-space:nowrap;";
    hint.textContent = "W/S: run \xB7 A/D: turn \xB7 hold Space: ascend \xB7 drag: look around \xB7 Esc: exit";
    L.DomEvent.disableClickPropagation(container);
    const context = (
      /* alloc */
      {
        layer,
        speed: speed2,
        distance,
        keys,
        container,
        button,
        hint,
        meshes: null,
        frame: null,
        last: void 0,
        nextClearanceCheck: 0,
        swing: 0,
        verticalSpeed: 0,
        saved: null,
        hitData: null,
        local: null,
        state: control.walker = /* alloc */
        { latlng: null, heading: 0, phase: 0, height: 0 }
      }
    );
    walkerByLayer.set(layer, context.state);
    context.step = step.bind(context);
    context.onKey = onKey.bind(context);
    context.onBlur = onBlur.bind(context);
    context.onPointer = onPointer.bind(context);
    context.onTerrain = onTerrain.bind(context);
    context.start = start.bind(context);
    context.stop = stop.bind(context);
    context.toggle = toggle.bind(context);
    control._walk = context;
    L.DomEvent.on(button, "click", context.toggle);
  }

  // src/walk/initializeWalkControl.js
  function initialize2(options) {
    L.Util.setOptions(this, options);
    createWalk(this, this.options);
  }

  // src/walk/onAddWalkControl.js
  function onAdd2(map) {
    let state = walkByMap.get(map);
    if (state?.control && state.control !== this) {
      this._map = null;
      throw (
        /* alloc */
        new Error("Only one Walk control can be active per map")
      );
    }
    if (!state) {
      state = /* alloc */
      {
        control: null,
        hitData: (
          /* alloc */
          {
            x: 0,
            y: 0,
            z: 0,
            dx: 0,
            dz: 0,
            reach: 0,
            best: 0,
            found: false,
            seen: (
              /* alloc */
              /* @__PURE__ */ new Set()
            ),
            intersections: (
              /* alloc */
              []
            ),
            nodes: (
              /* alloc */
              []
            ),
            normal: (
              /* alloc */
              [0, 0]
            )
          }
        ),
        local: (
          /* alloc */
          [0, 0, 0]
        )
      };
      walkByMap.set(map, state);
    }
    state.control = this;
    state.local.fill(0);
    state.hitData.seen.clear();
    state.hitData.normal.fill(0);
    this._walk.hitData = state.hitData;
    this._walk.local = state.local;
    this._walk.layer.addTo(map);
    return this._walk.container;
  }

  // src/walk/onRemoveWalkControl.js
  function onRemove(map) {
    const state = walkByMap.get(map);
    if (state?.control !== this) return;
    this._walk.stop();
    this._walk.layer.remove();
    state.control = null;
    state.hitData.seen.clear();
    this._walk.hitData = null;
    this._walk.local = null;
  }

  // src/walk/initWalk.js
  init_extendLeafletClass();
  var WalkControl = class extends extendLeafletClass(L.Control) {
    static initHooks = true;
    static defaultOptions = { position: "bottomright", speed: 70, distance: 20 };
    /**
     * Initialize the control and its hooks explicitly when using Leaflet 2.
     *
     * @param {Object} options Walk control options.
     */
    constructor(options) {
      super(options);
      if (L.version.startsWith("2.")) {
        initialize2.call(this, options);
        this.callInitHooks();
      }
    }
  };
  Object.assign(WalkControl.prototype, { onAdd: onAdd2, onRemove });
  if (L.version.startsWith("1.")) {
    WalkControl.prototype.options = Object.assign(Object.create(L.Control.prototype.options), WalkControl.defaultOptions);
    WalkControl.prototype.initialize = initialize2;
  }
  L.Control.Walk = WalkControl;

  // src/weakmaps/eventMapByLayer.js
  var eventMapByLayer = /* @__PURE__ */ new WeakMap();

  // src/weakmaps/eventsByLayer.js
  var eventsByLayer = /* @__PURE__ */ new WeakMap();

  // src/scene/addRegisteredLayer.js
  init_L();

  // src/scene/removeLayerEvents.js
  function removeLayerEvents() {
    eventMapByLayer.get(this).off(eventsByLayer.get(this), this);
    eventMapByLayer.set(this, null);
    eventsByLayer.set(this, null);
  }

  // src/weakmaps/pointerEventsByLayer.js
  var pointerEventsByLayer = /* @__PURE__ */ new WeakMap();

  // src/scene/onAdd3DLayer.js
  init_L();

  // src/picking/findFeature.js
  function findFeature(layer, event) {
    const model = modelByLayer.get(layer);
    if (!rootByLayer.get(layer) || !cameraByLayer.get(layer)) {
      return null;
    }
    let hit2, object, ranges, low, high, middle, range;
    for (hit2 of raycast(layer, event, rootByLayer.get(layer).children, Boolean(model))) {
      if (model) {
        object = hit2.object;
        while (object && object !== model) {
          object = object.parent;
        }
        if (object === model) {
          return (
            /* alloc */
            {
              id: model.id,
              properties: model.extras,
              model,
              mesh: hit2.object,
              point: hit2.point
            }
          );
        }
      }
      ranges = hit2.object.extras?.featureFaces;
      if (!ranges) {
        continue;
      }
      low = 0, high = ranges.length - 1;
      while (low <= high) {
        middle = low + high >> 1;
        range = ranges[middle];
        if (hit2.faceIndex < range.faceStart) {
          high = middle - 1;
        } else if (hit2.faceIndex >= range.faceEnd) {
          low = middle + 1;
        } else {
          return (
            /* alloc */
            {
              ...range,
              mesh: hit2.object,
              point: hit2.point
            }
          );
        }
      }
    }
    return null;
  }

  // src/picking/onPointerLeave.js
  function onPointerLeave(layer) {
    hoveredFeatureByLayer.set(layer, null);
    setHighlight(layer, null);
    showFeature(layer, null);
    layer.fire(
      "featurehover",
      /* alloc */
      { feature: null }
    );
  }

  // src/picking/onPointerMove.js
  function onPointerMove(layer, event) {
    if (event.buttons || layer._map.dragging?.moving() || layer._map._animatingZoom) {
      if (hoveredFeatureByLayer.get(layer)) onPointerLeave(layer);
      return;
    }
    hoveredFeatureByLayer.set(layer, findFeature(layer, event));
    setHighlight(layer, hoveredFeatureByLayer.get(layer));
    showFeature(layer, hoveredFeatureByLayer.get(layer), event);
    layer.fire(
      "featurehover",
      /* alloc */
      {
        feature: hoveredFeatureByLayer.get(layer),
        originalEvent: event
      }
    );
  }

  // src/picking/pointerMove.js
  function pointerMove(event) {
    onPointerMove(this, event);
  }

  // src/picking/onClick.js
  function onClick(layer, event) {
    const feature = findFeature(layer, event);
    hoveredFeatureByLayer.set(layer, feature);
    setHighlight(layer, feature);
    showFeature(layer, feature, event);
    layer.fire(
      "featureclick",
      /* alloc */
      { feature, originalEvent: event }
    );
  }

  // src/picking/pointerClick.js
  function pointerClick(event) {
    onClick(this, event);
  }

  // src/picking/pointerLeave.js
  function pointerLeave() {
    onPointerLeave(this);
  }

  // src/scene/attachLayer.js
  async function attachLayer(layer, map) {
    try {
      await attach(layer, map);
      addedByLayer.get(layer).resolve();
    } catch (error) {
      layer.fire(
        "error",
        /* alloc */
        { error }
      );
    }
  }

  // src/scene/onAdd3DLayer.js
  function onAdd3DLayer(layer, map) {
    if (!locationByLayer.get(layer)) {
      const center = map.getCenter();
      locationByLayer.set(
        layer,
        /* alloc */
        new L.LatLng(center.lat, center.lng)
      );
    }
    if (urlByLayer.get(layer) || geojsonByLayer.get(layer) || layer.options.tooltip || modelUrlByLayer.get(layer)) {
      containerByLayer.set(layer, map.getContainer());
      if (!pointerEventsByLayer.get(layer)) {
        pointerEventsByLayer.set(
          layer,
          /* alloc */
          {
            mousemove: pointerMove,
            click: pointerClick,
            mouseleave: pointerLeave
          }
        );
      }
      if (layer.options.tooltip) {
        tooltipByLayer.set(layer, L.DomUtil.create("div", "leaflet-3d-tooltip", containerByLayer.get(layer)));
        tooltipByLayer.get(layer).hidden = true;
        tooltipByLayer.get(layer).setAttribute("role", "tooltip");
        tooltipByLayer.get(layer).setAttribute("aria-live", "polite");
        tooltipByLayer.get(layer).style.cssText = "position:absolute;z-index:600;max-width:220px;padding:10px 12px;border:1px solid #6b5140;border-radius:6px;background:#fffaf0;box-shadow:0 3px 12px #0005;color:#30251d;font:13px/1.45 sans-serif;pointer-events:none";
      }
      L.DomEvent.on(containerByLayer.get(layer), pointerEventsByLayer.get(layer), layer);
    }
    if (rootByLayer.get(layer)) {
      attachLayer(layer, map);
    }
  }

  // src/weakmaps/terrainBoundsByLayer.js
  var terrainBoundsByLayer = /* @__PURE__ */ new WeakMap();

  // src/weakmaps/terrainOriginElevationByLayer.js
  var terrainOriginElevationByLayer = /* @__PURE__ */ new WeakMap();

  // src/weakmaps/terrainPromiseByLayer.js
  var terrainPromiseByLayer = /* @__PURE__ */ new WeakMap();

  // src/raster/addRasterTile.js
  init_radians();

  // src/globals/rasterPoint.js
  var rasterPoint = {
    x: 0,
    y: 0
  };

  // src/weakmaps/demByLayer.js
  var demByLayer = /* @__PURE__ */ new WeakMap();

  // src/weakmaps/rasterProgramByLayer.js
  var rasterProgramByLayer = /* @__PURE__ */ new WeakMap();

  // src/weakmaps/terrainGridsByLayer.js
  var terrainGridsByLayer = /* @__PURE__ */ new WeakMap();

  // src/globals/demTexture.js
  var demTexture = {
    size: [null, null],
    format: "r32float",
    usage: null
  };

  // src/globals/demTarget.js
  var demTarget = {
    texture: null
  };

  // src/globals/demLayout.js
  var demLayout = {
    bytesPerRow: null
  };

  // src/globals/demSize.js
  var demSize = [null, null];

  // src/terrain/copyTerrainTile.js
  function copyTerrainTile(atlas, values, start2, columns) {
    let row, column, value;
    for (row = 0; row < 256; row++) {
      for (column = 0; column < 256; column++) {
        value = values[row * 256 + column];
        if (!Number.isFinite(value) || value <= -1e3) continue;
        atlas.elevations[start2 + row * columns * 256 + column] = value;
        atlas.low = Math.min(atlas.low, value);
        atlas.high = Math.max(atlas.high, value);
      }
    }
  }

  // src/terrain/terrainAtlas.js
  function terrainAtlas(tiles, bounds) {
    const columns = bounds.max.x - bounds.min.x + 1, rows = bounds.max.y - bounds.min.y + 1;
    const elevations = (
      /* alloc */
      new Float32Array(columns * rows * 65536).fill(-1e9)
    );
    const atlas = (
      /* alloc */
      { elevations, low: Infinity, high: -Infinity }
    );
    let key, values, coordinates, x, y, start2;
    for ([key, values] of tiles) {
      coordinates = key.split("/");
      x = Number(coordinates[0]), y = Number(coordinates[1]);
      start2 = (y - bounds.min.y) * 256 * columns * 256 + (x - bounds.min.x) * 256;
      copyTerrainTile(atlas, values, start2, columns);
    }
    return atlas;
  }

  // src/materials/terrainRasterProgram.js
  function rasterProgram(layer, texture) {
    const device = rendererByLayer.get(layer).device;
    if (rasterProgramByLayer.get(layer)?.device === device) return rasterProgramByLayer.get(layer);
    const bounds = terrainBoundsByLayer.get(layer), columns = bounds.max.x - bounds.min.x + 1, rows = bounds.max.y - bounds.min.y + 1;
    const { elevations, low, high } = terrainAtlas(terrainTilesByLayer.get(layer), bounds);
    if (demByLayer.get(layer)) destroyTexture(layer, demByLayer.get(layer).texture);
    demByLayer.set(
      layer,
      /* alloc */
      {
        texture: device.createTexture((demTexture.size[0] = columns * 256, demTexture.size[1] = rows * 256, demTexture.usage = GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_DST, demTexture)),
        low: Number.isFinite(low) ? low : terrainOriginElevationByLayer.get(layer),
        high: Number.isFinite(high) ? high : terrainOriginElevationByLayer.get(layer)
      }
    );
    device.queue.writeTexture(
      (demTarget.texture = demByLayer.get(layer).texture, demTarget),
      elevations,
      (demLayout.bytesPerRow = columns * 1024, demLayout),
      (demSize[0] = columns * 256, demSize[1] = rows * 256, demSize)
    );
    demTarget.texture = null;
    terrainGridsByLayer.set(
      layer,
      /* alloc */
      /* @__PURE__ */ new Map()
    );
    rasterProgramByLayer.set(layer, createProgram(
      layer,
      /* alloc */
      {
        baseTexture: texture,
        unlit: true,
        terrain: demByLayer.get(layer),
        alphaMode: "BLEND",
        depthWrite: true,
        doubleSided: layer.options.doubleSided
      }
    ));
    return rasterProgramByLayer.get(layer);
  }

  // src/globals/demBuffer.js
  var demBuffer = {
    size: null,
    usage: null
  };

  // src/geometry/terrainGrid.js
  function terrainGrid(divisions) {
    const vertices = (divisions + 1) ** 2;
    const positions = (
      /* alloc */
      new Float32Array(vertices * 3)
    );
    const normals = (
      /* alloc */
      new Float32Array(vertices * 3)
    );
    const uvs = (
      /* alloc */
      new Float32Array(vertices * 2)
    );
    const indices = (
      /* alloc */
      new Uint16Array(divisions * divisions * 6)
    );
    let row, column, a, b, c, d, vertex = 0, index = 0;
    for (row = 0; row <= divisions; row++) {
      for (column = 0; column <= divisions; column++) {
        positions[vertex * 3] = column / divisions;
        positions[vertex * 3 + 2] = row / divisions;
        normals[vertex * 3 + 1] = 1;
        uvs[vertex * 2] = column / divisions;
        uvs[vertex * 2 + 1] = row / divisions;
        vertex++;
        if (row < divisions && column < divisions) {
          a = row * (divisions + 1) + column;
          b = a + 1, c = a + divisions + 1, d = c + 1;
          indices[index++] = a;
          indices[index++] = c;
          indices[index++] = b;
          indices[index++] = b;
          indices[index++] = c;
          indices[index++] = d;
        }
      }
    }
    return (
      /* alloc */
      {
        position: (
          /* alloc */
          { size: 3, data: positions }
        ),
        normal: (
          /* alloc */
          { size: 3, data: normals }
        ),
        uv: (
          /* alloc */
          { size: 2, data: uvs }
        ),
        index: (
          /* alloc */
          { data: indices }
        )
      }
    );
  }

  // src/geometry/terrainBuffers.js
  function terrainBuffers(layer, divisions) {
    const device = rendererByLayer.get(layer).device;
    let attributes = terrainGridsByLayer.get(layer).get(divisions);
    if (!attributes) {
      attributes = terrainGrid(divisions);
      let name, attribute;
      for ([name, attribute] of Object.entries(attributes)) {
        attribute.size ||= 1;
        attribute.count = attribute.data.length / attribute.size;
        attribute.indexFormat = "uint16";
        attribute.buffer = device.createBuffer((demBuffer.size = Math.max(4, attribute.data.byteLength), demBuffer.usage = name === "index" ? GPUBufferUsage.INDEX | GPUBufferUsage.COPY_DST : GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST, demBuffer));
        device.queue.writeBuffer(attribute.buffer, 0, attribute.data);
      }
      terrainGridsByLayer.get(layer).set(divisions, attributes);
    }
    return attributes;
  }

  // src/geometry/terrainTileGeometry.js
  function terrainTileGeometry(layer, attributes, sizeX, sizeZ) {
    const base = terrainOriginElevationByLayer.get(layer);
    const bottom = Math.min(demByLayer.get(layer).low, base) - base, top = Math.max(demByLayer.get(layer).high, base) - base;
    return (
      /* alloc */
      {
        device: rendererByLayer.get(layer).device,
        attributes,
        drawRange: (
          /* alloc */
          { start: 0, count: attributes.index.count }
        ),
        // Bounds must cover the DEM-displaced tile, although picking uses the flat grid.
        bounds: (
          /* alloc */
          {
            min: (
              /* alloc */
              [0, bottom, 0]
            ),
            max: (
              /* alloc */
              [1, top, 1]
            ),
            center: (
              /* alloc */
              [0.5, (bottom + top) / 2, 0.5]
            ),
            radius: Math.hypot(sizeX, top - bottom, sizeZ) / 2 / Math.max(sizeX, 1, sizeZ)
          }
        )
      }
    );
  }

  // src/raster/addRasterTile.js
  async function addRasterTile(layer, rasterLayer, coords, tile) {
    const ready = await terrainPromiseByLayer.get(layer);
    if (!ready || !layer._map || terrain3DByMap.get(layer._map) !== layer || terrain3DByLayer.get(rasterLayer) !== layer || tile.request.signal.aborted || !rasterTilesByLayer.get(rasterLayer).has(`${coords.z}/${coords.x}/${coords.y}`) || rasterTilesByLayer.get(layer).has(tile)) {
      return;
    }
    const divisions = Math.max(1, Math.min(64, 256 / 2 ** (coords.z - terrainZoomByLayer.get(layer))));
    const map = layer._map, crs = map.options.crs;
    const origin = crs.project(locationByLayer.get(layer)), metres = Math.cos(locationByLayer.get(layer).lat * radians);
    const scale = crs.scale(coords.z), terrainScale = 2 ** (terrainZoomByLayer.get(layer) - coords.z);
    const point = rasterPoint;
    point.x = coords.x * 256;
    point.y = coords.y * 256;
    const corner = crs.transformation.untransform(point, scale);
    point.x = (coords.x + 1) * 256;
    point.y = (coords.y + 1) * 256;
    const opposite = crs.transformation.untransform(point, scale);
    const device = rendererByLayer.get(layer).device;
    const texture = tile.texture;
    const program = rasterProgram(layer, texture);
    const attributes = terrainBuffers(layer, divisions);
    const base = terrainOriginElevationByLayer.get(layer);
    const sizeX = (opposite.x - corner.x) * metres, sizeZ = -(opposite.y - corner.y) * metres;
    const geometry = terrainTileGeometry(layer, attributes, sizeX, sizeZ);
    const mesh = (
      /* alloc */
      {
        position: (
          /* alloc */
          [(corner.x - origin.x) * metres, 0, -(corner.y - origin.y) * metres]
        ),
        rotation: (
          /* alloc */
          [0, 0, 0]
        ),
        scale: (
          /* alloc */
          [sizeX, 1, sizeZ]
        ),
        worldMatrix: (
          /* alloc */
          [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]
        ),
        children: (
          /* alloc */
          []
        ),
        visible: true,
        device,
        geometry,
        program,
        texture,
        // DEM pixel of the tile's corner, DEM pixels per tile, and the elevation at the layer origin.
        terrain: (
          /* alloc */
          [
            coords.x * 256 * terrainScale - terrainBoundsByLayer.get(layer).min.x * 256,
            coords.y * 256 * terrainScale - terrainBoundsByLayer.get(layer).min.y * 256,
            256 * terrainScale,
            base
          ]
        ),
        tile,
        opacity: rasterLayer.options.opacity ?? 1,
        id: nextId.value++,
        renderOrder: rasterLayer.options.zIndex || 0,
        fadeDuration: 250,
        fadeStart: tile.loadedAt,
        ground: true,
        _rasterSource: rasterLayer
      }
    );
    tile.mesh.visible = false;
    setParent(mesh, rootByLayer.get(layer));
    update(layer);
    rasterTilesByLayer.get(layer).set(tile, mesh);
  }

  // src/raster/registerTerrainTile.js
  async function registerTerrainTile(layer, coords, tile) {
    if (terrain3DByLayer.get(layer) && tile.done && !tile.request.signal.aborted && rasterTilesByLayer.get(layer).get(`${coords.z}/${coords.x}/${coords.y}`) === tile) {
      try {
        await addRasterTile(terrain3DByLayer.get(layer), layer, coords, tile);
      } catch (error) {
        layer.fire(
          "tileerror",
          /* alloc */
          { tile, coords, error }
        );
      }
    }
  }

  // src/raster/setRasterTerrain.js
  function setRasterTerrain(layer, terrain) {
    if (!rasterTilesByLayer.get(layer) || terrain3DByLayer.get(layer) === terrain) return;
    let tile;
    for (tile of rasterTilesByLayer.get(layer).values()) {
      if (terrain3DByLayer.get(layer)) removeRasterTile(terrain3DByLayer.get(layer), tile);
      if (tile.mesh) {
        tile.mesh.visible = true;
        setParent(tile.mesh, rootByLayer.get(layer));
      }
    }
    terrain3DByLayer.set(layer, terrain || null);
    if (terrain) {
      for (tile of rasterTilesByLayer.get(layer).values()) {
        if (tile.done) registerTerrainTile(layer, tile.coords, tile);
      }
    }
  }

  // src/raster/finishRasterAttachment.js
  async function finishAttachment(layer, map, attached) {
    try {
      await attached;
      addedByLayer.get(layer).resolve();
      setRasterTerrain(layer, terrain3DByMap.get(map));
    } catch (error) {
      layer.fire(
        "error",
        /* alloc */
        { error }
      );
    }
  }

  // src/globals/wantedTiles.js
  var wantedTiles = /* @__PURE__ */ new Map();

  // src/globals/coverageTiles.js
  var coverageTiles = /* @__PURE__ */ new Map();

  // src/raster/comparePendingTiles.js
  function comparePendingTiles(a, b) {
    return a.tile.coords.z - b.tile.coords.z || a.distance - b.distance;
  }

  // src/globals/blobParts.js
  var blobParts = [null];

  // src/weakmaps/rasterGeometryByLayer.js
  var rasterGeometryByLayer = /* @__PURE__ */ new WeakMap();

  // src/raster/createRasterMesh.js
  init_radians();

  // src/globals/rasterTexture.js
  var rasterTexture = {
    size: [null, null],
    format: "rgba8unorm",
    usage: null
  };

  // src/globals/rasterSampler.js
  var rasterSampler = {
    addressModeU: "clamp-to-edge",
    addressModeV: "clamp-to-edge",
    magFilter: "linear",
    minFilter: "linear"
  };

  // src/globals/rasterBuffer.js
  var rasterBuffer = {
    size: null,
    usage: null
  };

  // src/globals/rasterPositions.js
  var rasterPositions = [0, 0, 0, 1, 0, 0, 0, 0, 1, 1, 0, 1];

  // src/globals/rasterNormals.js
  var rasterNormals = [0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0];

  // src/globals/rasterUVs.js
  var rasterUVs = [0, 0, 1, 0, 0, 1, 1, 1];

  // src/globals/rasterIndices.js
  var rasterIndices = [0, 2, 1, 1, 2, 3];

  // src/geometry/createRasterQuadGeometry.js
  function createGeometry(device) {
    const attributes = (
      /* alloc */
      {
        position: (
          /* alloc */
          { size: 3, data: (
            /* alloc */
            new Float32Array(rasterPositions)
          ) }
        ),
        normal: (
          /* alloc */
          { size: 3, data: (
            /* alloc */
            new Float32Array(rasterNormals)
          ) }
        ),
        uv: (
          /* alloc */
          { size: 2, data: (
            /* alloc */
            new Float32Array(rasterUVs)
          ) }
        ),
        index: (
          /* alloc */
          { data: (
            /* alloc */
            new Uint16Array(rasterIndices)
          ) }
        )
      }
    );
    let name, attribute;
    for ([name, attribute] of Object.entries(attributes)) {
      attribute.count = attribute.data.length / (attribute.size || 1);
      attribute.indexFormat = "uint16";
      attribute.buffer = device.createBuffer((rasterBuffer.size = attribute.data.byteLength, rasterBuffer.usage = name === "index" ? GPUBufferUsage.INDEX | GPUBufferUsage.COPY_DST : GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST, rasterBuffer));
      device.queue.writeBuffer(attribute.buffer, 0, attribute.data);
    }
    return (
      /* alloc */
      { device, attributes, drawRange: (
        /* alloc */
        { start: 0, count: attributes.index.count }
      ) }
    );
  }

  // src/raster/createRasterMesh.js
  function createRasterMesh(layer, tile) {
    const device = rendererByLayer.get(layer).device;
    const texture = (
      /* alloc */
      {
        device,
        texture: device.createTexture((rasterTexture.size[0] = tile.image.width, rasterTexture.size[1] = tile.image.height, rasterTexture.usage = GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_DST | GPUTextureUsage.RENDER_ATTACHMENT, rasterTexture)),
        sampler: device.createSampler(rasterSampler),
        image: tile.image,
        format: "rgba8unorm",
        srgb: false,
        uploaded: null
      }
    );
    const source = meshImage;
    const destination = meshTarget;
    const dimensions = meshCopySize;
    source.source = tile.image;
    source.flipY = false;
    destination.texture = texture.texture;
    dimensions[0] = tile.image.width;
    dimensions[1] = tile.image.height;
    device.queue.copyExternalImageToTexture(source, destination, dimensions);
    source.source = null;
    destination.texture = null;
    texture.uploaded = tile.image;
    if (!rasterProgramByLayer.get(layer)) {
      rasterProgramByLayer.set(layer, createProgram(
        layer,
        /* alloc */
        {
          baseTexture: texture,
          unlit: true,
          alphaMode: "BLEND",
          doubleSided: layer.options.doubleSided
        }
      ));
    }
    if (!rasterGeometryByLayer.get(layer)) rasterGeometryByLayer.set(layer, createGeometry(device));
    const { coords } = tile;
    const crs = layer._map.options.crs;
    const origin = crs.project(locationByLayer.get(layer));
    const metres = Math.cos(locationByLayer.get(layer).lat * radians);
    const scale = crs.scale(coords.z);
    const point = rasterPoint;
    point.x = coords.x * TILE_SIZE;
    point.y = coords.y * TILE_SIZE;
    const corner = crs.transformation.untransform(point, scale);
    point.x = (coords.x + 1) * TILE_SIZE;
    point.y = (coords.y + 1) * TILE_SIZE;
    const opposite = crs.transformation.untransform(point, scale);
    const sizeX = (opposite.x - corner.x) * metres;
    const sizeZ = -(opposite.y - corner.y) * metres;
    tile.texture = texture;
    tile.mesh = /* alloc */
    {
      position: (
        /* alloc */
        [(corner.x - origin.x) * metres, 0, -(corner.y - origin.y) * metres]
      ),
      rotation: (
        /* alloc */
        [0, 0, 0]
      ),
      scale: (
        /* alloc */
        [sizeX, 1, sizeZ]
      ),
      worldMatrix: (
        /* alloc */
        [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]
      ),
      children: (
        /* alloc */
        []
      ),
      visible: true,
      device,
      geometry: rasterGeometryByLayer.get(layer),
      program: rasterProgramByLayer.get(layer),
      texture,
      opacity: layer.options.opacity,
      id: nextId.value++,
      renderOrder: layer.options.zIndex || 0,
      tile,
      fadeDuration: 250,
      ground: true,
      _rasterSource: layer
    };
    setParent(tile.mesh, rootByLayer.get(layer));
  }

  // src/raster/finishRasterTile.js
  async function finishRasterTile(layer, tile) {
    try {
      await readyByLayer.get(layer);
      const result = await getZxy(
        layer.options.archive,
        tile.coords.z,
        tile.coords.x,
        tile.coords.y,
        tile.request.signal
      );
      if (tile.request.signal.aborted) {
        result?.image?.close();
        return;
      }
      if (!result) throw (
        /* alloc */
        new Error(`Tile ${tile.coords.z}/${tile.coords.x}/${tile.coords.y} is not in the offline archive`)
      );
      try {
        if (result.image) tile.image = result.image;
        else {
          blobParts[0] = result.data;
          const blob = (
            /* alloc */
            new Blob(blobParts)
          );
          blobParts[0] = null;
          tile.image = await createImageBitmap(blob);
        }
      } catch {
        blobParts[0] = null;
        throw (
          /* alloc */
          new Error(`Unable to decode tile ${tile.coords.z}/${tile.coords.x}/${tile.coords.y}`)
        );
      }
      if (tile.request.signal.aborted) {
        tile.image.close();
        tile.image = null;
        return;
      }
      createRasterMesh(layer, tile);
      tile.loadedAt = performance.now();
      tile.done = true;
      rasterVersionByLayer.set(layer, (rasterVersionByLayer.get(layer) || 0) + 1);
      registerTerrainTile(layer, tile.coords, tile);
      layer.fire(
        "tileload",
        /* alloc */
        { tile, coords: tile.coords }
      );
      update(layer);
    } catch (error) {
      if (tile.request.signal.aborted) return;
      tile.error = error.message;
      rasterVersionByLayer.set(layer, (rasterVersionByLayer.get(layer) || 0) + 1);
      layer.fire(
        "tileerror",
        /* alloc */
        { tile, coords: tile.coords, error }
      );
      layer.fire(
        "error",
        /* alloc */
        { error, coords: tile.coords }
      );
    } finally {
      loadingTilesByLayer.set(layer, loadingTilesByLayer.get(layer) - 1);
      if (layer._map) {
        pumpRasterTiles(layer);
        pruneRasterTiles(layer);
        if (!loadingTilesByLayer.get(layer)) layer.fire("load");
        update(layer);
      }
    }
  }

  // src/raster/loadRasterTile.js
  function loadRasterTile(layer, tile) {
    tile.started = true;
    const first = loadingTilesByLayer.get(layer) === 0;
    loadingTilesByLayer.set(layer, loadingTilesByLayer.get(layer) + 1);
    layer.fire(
      "tileloadstart",
      /* alloc */
      { tile, coords: tile.coords }
    );
    if (first) layer.fire("loading");
    return finishRasterTile(layer, tile);
  }

  // src/raster/pumpRasterTiles.js
  function pumpRasterTiles(layer) {
    const map = layer._map;
    if (!map) return;
    const center = map.project(map.getCenter(), 0).divideBy(TILE_SIZE);
    const pending = (
      /* alloc */
      []
    );
    let tile, coords;
    for (tile of rasterTilesByLayer.get(layer).values()) {
      if (tile.started || tile.request.signal.aborted) continue;
      ({ coords } = tile);
      pending.push(
        /* alloc */
        { tile, distance: Math.hypot(
          (coords.x + 0.5) / 2 ** coords.z - center.x,
          (coords.y + 0.5) / 2 ** coords.z - center.y
        ) }
      );
    }
    pending.sort(comparePendingTiles);
    for ({ tile } of pending) {
      if (loadingTilesByLayer.get(layer) >= 4) break;
      loadRasterTile(layer, tile);
    }
  }

  // src/raster/retainRasterTiles.js
  function retainRasterTiles(layer, required) {
    const tiles = rasterTilesByLayer.get(layer);
    let key, tile, coords;
    for ([key, tile] of tiles) {
      if (!required.has(key) && !tile.done) releaseRasterTile(layer, tile);
    }
    for ([key, coords] of required) {
      if (tiles.has(key)) continue;
      tile = /* alloc */
      { coords, request: (
        /* alloc */
        new AbortController()
      ), done: false };
      tiles.set(key, tile);
    }
  }

  // src/globals/TILE_RADIUS.js
  var TILE_RADIUS = 6;

  // src/globals/archiveNorthWest.js
  var archiveNorthWest = [0, 0];

  // src/globals/archiveSouthEast.js
  var archiveSouthEast = [0, 0];

  // src/raster/rasterTileRange.js
  function rasterTileRange(map, header, zoom) {
    const bounds = map.getBounds();
    const northwest = map.project(bounds.getNorthWest(), zoom).divideBy(TILE_SIZE).floor();
    const southeast = map.project(bounds.getSouthEast(), zoom).divideBy(TILE_SIZE).floor();
    archiveNorthWest[0] = header.maxLat;
    archiveNorthWest[1] = header.minLon;
    archiveSouthEast[0] = header.minLat;
    archiveSouthEast[1] = header.maxLon;
    const archiveMin = header.maxLat === void 0 || header.minLon === void 0 ? null : map.project(archiveNorthWest, zoom).divideBy(TILE_SIZE).floor();
    const archiveMax = header.minLat === void 0 || header.maxLon === void 0 ? null : map.project(archiveSouthEast, zoom).divideBy(TILE_SIZE).floor();
    const center = map.project(map.getCenter(), zoom).divideBy(TILE_SIZE).floor();
    return (
      /* alloc */
      {
        minX: Math.max(0, northwest.x, archiveMin?.x ?? 0, center.x - TILE_RADIUS),
        maxX: Math.min(2 ** zoom - 1, southeast.x, archiveMax?.x ?? 2 ** zoom - 1, center.x + TILE_RADIUS),
        minY: Math.max(0, northwest.y, archiveMin?.y ?? 0, center.y - TILE_RADIUS),
        maxY: Math.min(2 ** zoom - 1, southeast.y, archiveMax?.y ?? 2 ** zoom - 1, center.y + TILE_RADIUS)
      }
    );
  }

  // src/raster/updateRasterTiles.js
  function updateRasterTiles(layer) {
    const map = layer._map;
    if (!map || !sharedByLayer.get(layer) || !headerByLayer.get(layer)) return;
    const zoom = Math.max(headerByLayer.get(layer).minZoom ?? 0, Math.min(
      Math.round(map.getZoom()),
      layer.options.maxZoom,
      layer.options.maxNativeZoom
    ));
    tileZoomByLayer.set(layer, zoom);
    const range = rasterTileRange(map, headerByLayer.get(layer), zoom);
    const wanted = wantedTiles;
    wanted.clear();
    let x, y, key, coords, parent;
    for (x = range.minX; x <= range.maxX; x++) {
      for (y = range.minY; y <= range.maxY; y++) {
        wanted.set(
          `${zoom}/${x}/${y}`,
          /* alloc */
          { z: zoom, x, y }
        );
      }
    }
    wantedRasterTilesByLayer.set(
      layer,
      /* alloc */
      new Set(wanted.keys())
    );
    const coverage = coverageTiles;
    coverage.clear();
    const parentZoom = Math.max(headerByLayer.get(layer).minZoom ?? 0, zoom - 2), factor = 2 ** (zoom - parentZoom);
    if (parentZoom < zoom) {
      for ([key, coords] of wanted) {
        if (rasterTilesByLayer.get(layer).get(key)?.done) continue;
        parent = /* alloc */
        { z: parentZoom, x: Math.floor(coords.x / factor), y: Math.floor(coords.y / factor) };
        coverage.set(`${parent.z}/${parent.x}/${parent.y}`, parent);
      }
    }
    const required = (
      /* alloc */
      new Map(coverage)
    );
    for ([key, coords] of wanted) required.set(key, coords);
    wanted.clear();
    coverage.clear();
    retainRasterTiles(layer, required);
    pumpRasterTiles(layer);
    pruneRasterTiles(layer);
  }

  // src/raster/updateAttachedTiles.js
  async function updateAttachedTiles(layer, map, attached) {
    try {
      await Promise.all(
        /* alloc */
        [attached, readyByLayer.get(layer)]
      );
      if (layer._map === map && map.hasLayer(layer)) updateRasterTiles(layer);
    } catch (error) {
      layer.fire(
        "error",
        /* alloc */
        { error }
      );
    }
  }

  // src/raster/onPMTileAdd.js
  function onPMTileAdd(layer, map) {
    if (!locationByLayer.get(layer)) locationByLayer.set(layer, map.getCenter());
    const attached = attach(layer, map);
    finishAttachment(layer, map, attached);
    updateAttachedTiles(layer, map, attached);
  }

  // src/weakmaps/streamTerrainByLayer.js
  var streamTerrainByLayer = /* @__PURE__ */ new WeakMap();

  // src/weakmaps/terrainArchiveByLayer.js
  var terrainArchiveByLayer = /* @__PURE__ */ new WeakMap();

  // src/weakmaps/terrainControllerByLayer.js
  var terrainControllerByLayer = /* @__PURE__ */ new WeakMap();

  // src/weakmaps/terrainLoadingByLayer.js
  var terrainLoadingByLayer = /* @__PURE__ */ new WeakMap();

  // src/weakmaps/terrainSourceByLayer.js
  var terrainSourceByLayer = /* @__PURE__ */ new WeakMap();

  // src/weakmaps/workerMapByLayer.js
  var workerMapByLayer = /* @__PURE__ */ new WeakMap();

  // src/terrain/loadTerrainTiles.js
  async function loadTerrainTiles(state) {
    const { backend: layer, archive, controller, tiles } = state;
    let coords, result;
    while (state.next < tiles.length) {
      controller.signal.throwIfAborted();
      coords = tiles[state.next++];
      result = await getZxy(archive, coords.z, coords.x, coords.y, controller.signal);
      if (!result || result.data.byteLength !== 256 * 256 * 4) {
        throw (
          /* alloc */
          new Error(`Missing or invalid Float32 terrain tile ${coords.z}/${coords.x}/${coords.y}`)
        );
      }
      terrainTilesByLayer.get(layer).set(
        `${coords.x}/${coords.y}`,
        /* alloc */
        new Float32Array(result.data)
      );
    }
  }

  // src/terrain/readBridges.js
  function readBridges(response) {
    if (!response.ok) throw (
      /* alloc */
      new Error(`Bridges: HTTP ${response.status}`)
    );
    return response.json();
  }

  // src/terrain/terrainTileQueue.js
  init_L();
  function terrainTileQueue(layer, header) {
    const map = layer._map;
    terrainZoomByLayer.set(layer, header.maxZoom);
    archiveNorthWest[0] = header.maxLat;
    archiveNorthWest[1] = header.minLon;
    const northwest = map.project(archiveNorthWest, terrainZoomByLayer.get(layer)).divideBy(256).floor();
    archiveSouthEast[0] = header.minLat;
    archiveSouthEast[1] = header.maxLon;
    const southeast = map.project(archiveSouthEast, terrainZoomByLayer.get(layer)).divideBy(256).floor();
    terrainBoundsByLayer.set(
      layer,
      /* alloc */
      new L.Bounds(northwest, southeast)
    );
    const tiles = (
      /* alloc */
      []
    );
    const center = map.project(map.getCenter(), terrainZoomByLayer.get(layer)).divideBy(256);
    let x, y;
    for (x = northwest.x; x <= southeast.x; x++) {
      for (y = northwest.y; y <= southeast.y; y++) {
        tiles.push(
          /* alloc */
          { z: terrainZoomByLayer.get(layer), x, y, distance: Math.hypot(x + 0.5 - center.x, y + 0.5 - center.y) }
        );
      }
    }
    tiles.sort(compareDistance);
    return tiles;
  }

  // src/weakmaps/bridgeMeshByLayer.js
  var bridgeMeshByLayer = /* @__PURE__ */ new WeakMap();

  // src/geometry/addBridges.js
  init_radians();

  // src/projections/projectBridgePoint.js
  init_L();
  function local2([lng, lat, z], crs, origin, metres, base) {
    const p = crs.project(
      /* alloc */
      new L.LatLng(lat, lng)
    );
    return (
      /* alloc */
      [(p.x - origin.x) * metres, z - base, -(p.y - origin.y) * metres]
    );
  }

  // src/geometry/bridgePaths.js
  function bridgePaths(rings, pixels) {
    const paths = (
      /* alloc */
      []
    );
    let start2 = 0, ring, path, i;
    for (ring of rings) {
      path = /* alloc */
      [];
      for (i = 0; i < ring.length; i++) path.push(
        /* alloc */
        { x: pixels[start2 + i][0], y: pixels[start2 + i][1] }
      );
      paths.push(path);
      start2 += ring.length;
    }
    return paths;
  }

  // src/geometry/indexBridge.js
  function indexBridge(layer, pixels, triangles) {
    const bridgeTriangles = (
      /* alloc */
      []
    );
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    let t, triangle3, i, p, x, y, key, bucket;
    for (t of triangles) {
      triangle3 = /* alloc */
      [];
      for (i of t) triangle3.push(pixels[i]);
      bridgeTriangles.push(triangle3);
    }
    for (p of pixels) {
      minX = Math.min(minX, p[0]);
      minY = Math.min(minY, p[1]);
      maxX = Math.max(maxX, p[0]);
      maxY = Math.max(maxY, p[1]);
    }
    const bridge = (
      /* alloc */
      {
        triangles: bridgeTriangles,
        min: (
          /* alloc */
          [minX, minY]
        ),
        max: (
          /* alloc */
          [maxX, maxY]
        )
      }
    );
    for (x = Math.floor(bridge.min[0] / 64); x <= Math.floor(bridge.max[0] / 64); x++) {
      for (y = Math.floor(bridge.min[1] / 64); y <= Math.floor(bridge.max[1] / 64); y++) {
        key = `${x}/${y}`;
        bucket = bridgesByLayer.get(layer).get(key);
        if (!bucket) bridgesByLayer.get(layer).set(key, bucket = /* alloc */
        []);
        bucket.push(bridge);
      }
    }
  }

  // src/geometry/bridgeFaces.js
  function bridgeFaces(context, points, triangles) {
    const { position, normal, color } = context;
    let a, b, c, pa, pb, pc, i, k, p;
    for ([a, b, c] of triangles) {
      pa = points[a];
      pb = points[b];
      pc = points[c];
      if ((pb[2] - pa[2]) * (pc[0] - pa[0]) - (pb[0] - pa[0]) * (pc[2] - pa[2]) < 0) {
        i = b;
        b = c;
        c = i;
      }
      for (k = 0; k < 6; k++) {
        i = k === 0 || k === 3 ? a : k === 1 || k === 5 ? b : c;
        p = points[i];
        position.push(p[0], p[1] - (k >= 3 ? 1.2 : 0), p[2]);
        normal.push(0, k >= 3 ? -1 : 1, 0);
        color.push(0.6, 0.58, 0.54);
      }
    }
  }

  // src/geometry/bridgeEdge.js
  function bridgeEdge(context, p, q) {
    const { position, normal, color } = context;
    const length = Math.hypot(q[0] - p[0], q[2] - p[2]) || 1;
    const nx = (q[2] - p[2]) / length, nz = -(q[0] - p[0]) / length;
    let k, corner;
    for (k = 0; k < 6; k++) {
      corner = k === 0 || k === 3 || k === 5 ? p : q;
      position.push(corner[0], corner[1] - (k === 2 || k >= 4 ? 1.2 : 0), corner[2]);
      normal.push(nx, 0, nz);
      color.push(0.6, 0.58, 0.54);
    }
  }

  // src/geometry/bridgeSides.js
  function bridgeSides(context, points, rings) {
    let start2 = 0, ring, i;
    for (ring of rings) {
      for (i = 0; i < ring.length; i++) {
        bridgeEdge(context, points[start2 + i], points[start2 + (i + 1) % ring.length]);
      }
      start2 += ring.length;
    }
  }

  // src/geometry/bridgePolygon.js
  function bridgePolygon(context, polygon2) {
    const { backend: layer, map, zoom, crs, origin, metres, base } = context;
    const rings = (
      /* alloc */
      []
    );
    let ring, path, lng, lat, z, p, coordinate, paths, contour, holes, triangles;
    for (ring of polygon2) {
      path = ring.slice(0, -1);
      if (path.length >= 3) rings.push(path);
    }
    if (!rings.length) return;
    const pixels = (
      /* alloc */
      []
    ), points = (
      /* alloc */
      []
    );
    for (ring of rings) for ([lng, lat, z] of ring) {
      p = map.project(
        /* alloc */
        [lat, lng],
        zoom
      );
      pixels.push(
        /* alloc */
        [p.x, p.y, z]
      );
    }
    for (ring of rings) for (coordinate of ring) points.push(local2(coordinate, crs, origin, metres, base));
    try {
      paths = bridgePaths(rings, pixels);
      [contour, ...holes] = paths;
      triangles = triangulate(contour, holes);
    } catch {
      return;
    }
    indexBridge(layer, pixels, triangles);
    bridgeFaces(context, points, triangles);
    bridgeSides(context, points, rings);
  }

  // src/geometry/addBridges.js
  function addBridges(layer, geojson) {
    const map = layer._map, crs = map.options.crs, zoom = terrainZoomByLayer.get(layer);
    const origin = crs.project(locationByLayer.get(layer)), metres = Math.cos(locationByLayer.get(layer).lat * radians);
    const base = rootByLayer.get(layer).position[1];
    const position = (
      /* alloc */
      []
    ), normal = (
      /* alloc */
      []
    ), color = (
      /* alloc */
      []
    );
    bridgesByLayer.set(
      layer,
      /* alloc */
      /* @__PURE__ */ new Map()
    );
    const context = (
      /* alloc */
      { backend: layer, map, crs, zoom, origin, metres, base, position, normal, color }
    );
    let geometry, polygons, polygonIndex;
    for ({ geometry } of geojson.features) {
      if (geometry.type !== "Polygon" && geometry.type !== "MultiPolygon") continue;
      polygons = geometry.coordinates;
      for (polygonIndex = 0; polygonIndex < (geometry.type === "Polygon" ? 1 : polygons.length); polygonIndex++) {
        bridgePolygon(context, geometry.type === "Polygon" ? polygons : polygons[polygonIndex]);
      }
    }
    if (position.length) {
      bridgeMeshByLayer.set(layer, createMesh(
        layer,
        /* alloc */
        { position, normal, color }
      ));
    }
  }

  // src/terrain/applyTerrain.js
  function applyTerrain(layer, map, bridges) {
    terrainReadyByLayer.set(layer, true);
    terrainOriginElevationByLayer.set(layer, getElevation(layer, locationByLayer.get(layer)) ?? 0);
    let mapLayer;
    for (mapLayer of Object.values(map._layers)) {
      setTerrainHeight(mapLayer);
      conformModelToTerrain(mapLayer, layer);
    }
    if (bridges) addBridges(layer, bridges);
    map.fire("terrainchange");
    update(layer);
    layer.fire("terrainready");
  }

  // src/terrain/loadTerrain.js
  async function loadTerrain(layer) {
    if (terrainLoadingByLayer.get(layer) || !layer._map) return;
    terrainLoadingByLayer.set(layer, true);
    terrainReadyByLayer.set(layer, false);
    const controller = (
      /* alloc */
      new AbortController()
    );
    terrainControllerByLayer.set(layer, controller);
    let i;
    try {
      if (!terrainSourceByLayer.get(layer)) throw (
        /* alloc */
        new Error("Terrain layer requires a PMTiles or COG elevation archive")
      );
      const archive = createLayer(
        /* alloc */
        { source: (
          /* alloc */
          {
            type: "raster",
            url: terrainSourceByLayer.get(layer),
            archive: layer.options.archive,
            asset: layer.options.asset,
            workerUrl: layer.options.workerUrl
          }
        ) }
      );
      workerMapByLayer.set(archive, layer._map);
      terrainArchiveByLayer.set(layer, archive);
      await readyByLayer.get(archive);
      const header = headerByLayer.get(archive);
      if (header.tileType !== 0 || header.minZoom !== header.maxZoom) {
        throw (
          /* alloc */
          new Error("Expected a single-zoom Float32 terrain archive")
        );
      }
      const map = layer._map;
      const tiles = terrainTileQueue(layer, header);
      const state = (
        /* alloc */
        { backend: layer, archive, controller, tiles, next: 0 }
      );
      const workers = (
        /* alloc */
        []
      );
      for (i = 0; i < Math.min(4, tiles.length); i++) workers.push(loadTerrainTiles(state));
      await Promise.all(workers);
      const bridges = layer.options.bridges && await fetch(
        layer.options.bridges,
        /* alloc */
        { signal: controller.signal }
      ).then(readBridges);
      if (controller.signal.aborted || layer._map !== map) return;
      applyTerrain(layer, map, bridges);
      return true;
    } catch (error) {
      if (!controller.signal.aborted) layer.fire(
        "error",
        /* alloc */
        { error }
      );
      return false;
    } finally {
      terrainLoadingByLayer.set(layer, false);
    }
  }

  // src/terrain/loadReadyTerrain.js
  function loadReadyTerrain() {
    loadTerrain(this.backend).then(this.resolve, this.reject);
  }

  // src/terrain/setLayerTerrain.js
  function setLayerTerrain(layer) {
    if (kindByLayer.get(layer) === "raster") setRasterTerrain(layer, this);
  }

  // src/terrain/onTerrainAdd.js
  function onTerrainAdd(layer, map) {
    if (streamTerrainByMap.get(map) || terrain3DByMap.get(map) && terrain3DByMap.get(map) !== layer) {
      throw (
        /* alloc */
        new Error("Only one terrain layer can be active per map")
      );
    }
    if (streamTerrainByLayer.get(layer)) {
      streamTerrainByMap.set(
        map,
        /* alloc */
        {
          layer,
          map,
          terrainCache: (
            /* alloc */
            /* @__PURE__ */ new Map()
          ),
          terrainController: (
            /* alloc */
            new AbortController()
          )
        }
      );
      onAdd3DLayer(layer, map);
      map.fire("terrainchange");
      return;
    }
    terrain3DByMap.set(map, layer);
    onAdd3DLayer(layer, map);
    if (rootByLayer.get(layer)) terrainPromiseByLayer.set(layer, loadTerrain(layer));
    else {
      const pending = Promise.withResolvers();
      terrainPromiseByLayer.set(layer, pending.promise);
      layer.once(
        "ready",
        loadReadyTerrain,
        /* alloc */
        { backend: layer, ...pending }
      );
    }
    map.eachLayer(setLayerTerrain, layer);
    map.fire("terrainchange");
  }

  // src/globals/pendingRasterLoads.js
  var pendingRasterLoads = [];

  // src/core/fireRasterLoad.js
  function fireRasterLoad() {
    pendingRasterLoads.shift()?.fire("load");
  }

  // src/textures/attachRasterImage.js
  function addRasterImage() {
    if (!this._image) this._initImage();
    if (this._image.complete && this._image.naturalWidth) {
      pendingRasterLoads.push(this);
      queueMicrotask(fireRasterLoad);
    }
  }

  // src/scene/addSceneLayer.js
  function addSceneLayer(layer, map) {
    switch (kindByLayer.get(layer)) {
      case "3d":
        return onAdd3DLayer(layer, map);
      case "raster":
        return onPMTileAdd(layer, map);
      case "terrain":
        return onTerrainAdd(layer, map);
      case "image":
        return addRasterImage.call(layer, map);
      case "time":
        return addTimeLayer.call(layer, map);
    }
  }

  // src/terrain/onTerrainChange.js
  function onTerrainChange(layer) {
    if (!layer._map) return;
    let area2;
    for (area2 of areasByLayer.get(layer).values()) {
      releaseArea(layer, area2);
    }
    areasByLayer.get(layer).clear();
    updateArea(layer);
  }

  // src/scene/get3DEvents.js
  function get3DEvents(layer) {
    const events = (
      /* alloc */
      {}
    );
    if (urlByLayer.get(layer)) {
      events.moveend = events.zoomend = events.rotate = events.pitch = events.resize = updateArea.bind(null, layer);
    }
    if (geojsonByLayer.get(layer) || urlByLayer.get(layer)) {
      events.terrainchange = onTerrainChange.bind(null, layer);
    }
    return events;
  }

  // src/raster/getRasterEvents.js
  function getRasterEvents(layer) {
    const update2 = updateRasterTiles.bind(null, layer);
    return (
      /* alloc */
      { moveend: update2, zoomend: update2, rotate: update2, pitch: update2, resize: update2 }
    );
  }

  // src/scene/emptyEvents.js
  function emptyEvents() {
    return (
      /* alloc */
      {}
    );
  }

  // src/scene/isNativeLayer.js
  init_L();
  function isNativeLayer(layer) {
    return !state3dByLayer.get(layer) && (layer instanceof L.GridLayer || layer instanceof L.Polyline || layer instanceof L.CircleMarker || layer instanceof L.Marker && !(layer.options.icon instanceof L.DivIcon) || layer instanceof L.ImageOverlay && !(layer instanceof L.VideoOverlay) && !(layer instanceof L.SVGOverlay));
  }

  // src/scene/addRegisteredLayer.js
  function layerLayerAdd(event) {
    const native = isNativeLayer(this);
    if (native) {
      if (this instanceof L.GridLayer || this instanceof L.ImageOverlay) {
        this.options.crossOrigin ||= true;
      }
      if (this instanceof L.Marker) this.options.icon.options.crossOrigin ||= true;
    }
    const map = event.target;
    if (!map.hasLayer(this)) return;
    if (kindByLayer.get(this)) {
      this._map = map;
      this._zoomAnimated = map._zoomAnimated;
      if (kindByLayer.get(this) !== "pending" && kindByLayer.get(this) !== "time") {
        eventsByLayer.set(this, kindByLayer.get(this) === "raster" ? getRasterEvents(this) : state3dByLayer.get(this) ? get3DEvents(this) : emptyEvents());
        eventMapByLayer.set(this, map);
        map.on(eventsByLayer.get(this), this);
        this.once("remove", removeLayerEvents, this);
      }
      addSceneLayer(this, map);
      this.fire("add");
      map.fire(
        "layeradd",
        /* alloc */
        { layer: this }
      );
    } else {
      layerProto.value._layerAdd.call(this, event);
    }
    if (!native || !event.target.hasLayer(this)) return;
    initNativeGPU(this, event.target);
  }

  // src/scene/layerInitialize.js
  init_L();

  // src/globals/pendingInitializations.js
  var pendingInitializations = [];

  // src/globals/loading.js
  var loading = { value: Promise.resolve() };

  // src/sources/initializeGeoJSON.js
  function initializeGeoJSON(layer, options) {
    geojsonByLayer.set(layer, true);
    init3D(layer, options);
  }

  // src/sources/isVectorTileSource.js
  function isVectorTileSource(options) {
    return options.data === void 0 && (options.tileJSON !== void 0 || typeof options.url === "string" && /\{[zxy]\}|%7B[zxy]%7D/i.test(options.url));
  }

  // src/vector-tiles/configureVectorTileLayer.js
  init_L();

  // src/weakmaps/vectorTileOptionsByLayer.js
  var vectorTileOptionsByLayer = /* @__PURE__ */ new WeakMap();

  // src/vector-tiles/readTileJSON.js
  async function readTileJSON(options) {
    const url = (
      /* alloc */
      new URL(options.tileJSON, document.baseURI).href
    );
    const response = await fetch(url);
    if (!response.ok) throw (
      /* alloc */
      new Error(`TileJSON: HTTP ${response.status}`)
    );
    const metadata = await response.json();
    if (!metadata || !Array.isArray(metadata.tiles) || !metadata.tiles.length || typeof metadata.tiles[0] !== "string") {
      throw (
        /* alloc */
        new Error("TileJSON requires a tile URL template")
      );
    }
    return (
      /* alloc */
      {
        ...options,
        url: (
          /* alloc */
          new URL(metadata.tiles[0], url).href
        ),
        minNativeZoom: options.minNativeZoom ?? metadata.minzoom,
        maxNativeZoom: options.maxNativeZoom ?? metadata.maxzoom,
        attribution: options.attribution ?? metadata.attribution
      }
    );
  }

  // src/vector-style/removeTrailingCommas.js
  function removeTrailingCommas(json) {
    let cleaned = "", quoted = false, escaped = false, i = 0, char = "";
    for (i = 0; i < json.length; i++) {
      char = json[i];
      if (!quoted && char === "," && /^\s*[\]}]/.test(json.slice(i + 1))) continue;
      cleaned += char;
      if (escaped) escaped = false;
      else if (quoted && char === "\\") escaped = true;
      else if (char === '"') quoted = !quoted;
    }
    return cleaned;
  }

  // src/vector-style/appendQuotedStyleCharacter.js
  function appendQuotedStyleCharacter(char, state) {
    if (state.quoted) {
      if (state.escaped) {
        state.escaped = false;
        return char === "'" ? char : "\\" + char;
      }
      if (char === "\\") {
        state.escaped = true;
        return "";
      }
      if (char === state.quoted) {
        state.quoted = "";
        return '"';
      }
      return char === '"' ? '\\"' : char;
    }
    if (char === '"' || char === "'") {
      state.quoted = char;
      return '"';
    }
    return void 0;
  }

  // src/vector-style/skipStyleComment.js
  function skipStyleComment(text, index, marker) {
    if (marker === "/") {
      while (index < text.length && text[index] !== "\n") index++;
      return index;
    }
    const end = text.indexOf("*/", index + 2);
    if (end < 0) throw (
      /* alloc */
      new Error("Unterminated style comment")
    );
    return end + 1;
  }

  // src/vector-style/stripStyleComments.js
  function stripStyleComments(text) {
    let json = "", i = 0, char = "", next = "", converted = void 0;
    const state = (
      /* alloc */
      { quoted: "", escaped: false }
    );
    for (i = 0; i < text.length; i++) {
      char = text[i];
      next = text[i + 1];
      converted = appendQuotedStyleCharacter(char, state);
      if (converted !== void 0) {
        json += converted;
        continue;
      }
      if (char === "/" && (next === "/" || next === "*")) {
        i = skipStyleComment(text, i, next);
        json += next === "/" ? "\n" : " ";
      } else json += char;
    }
    return json;
  }

  // src/vector-style/validateVectorLayers.js
  function validateVectorLayers(layers) {
    let i = 0, layer = null;
    if (!Array.isArray(layers)) throw (
      /* alloc */
      new Error("Invalid vector style layers")
    );
    for (i = 0; i < layers.length; i++) {
      layer = layers[i];
      if (!layer || typeof layer.id !== "string" || typeof layer.type !== "string") {
        throw (
          /* alloc */
          new Error("Invalid vector style layers")
        );
      }
    }
  }

  // src/vector-style/parseVectorStyle.js
  function parseVectorStyle(text) {
    const prefix = /^\s*(?:const|let|var)\s+otm_layers\s*=\s*/.exec(text);
    if (prefix) text = text.slice(prefix[0].length);
    const cleaned = removeTrailingCommas(stripStyleComments(text).trim().replace(/;$/, ""));
    const document2 = JSON.parse(cleaned);
    const layers = document2.layers ?? document2;
    validateVectorLayers(layers);
    return layers;
  }

  // src/vector-tiles/readVectorStyle.js
  async function readVectorStyle(style) {
    if (typeof style === "string") {
      const response = await fetch(style);
      if (!response.ok) throw (
        /* alloc */
        new Error(`Vector style: HTTP ${response.status}`)
      );
      style = parseVectorStyle(await response.text());
    } else style = style?.layers ?? style;
    if (!Array.isArray(style)) throw (
      /* alloc */
      new Error("Invalid vector style layers")
    );
    let entry;
    for (entry of style) {
      if (!entry || typeof entry.id !== "string" || typeof entry.type !== "string") {
        throw (
          /* alloc */
          new Error("Invalid vector style layers")
        );
      }
    }
    return style;
  }

  // src/vector-tiles/validateVectorTileZooms.js
  function validateVectorTileZooms(minNativeZoom, maxNativeZoom, maxZoom) {
    if (!Number.isInteger(minNativeZoom) || !Number.isInteger(maxNativeZoom) || !Number.isInteger(maxZoom) || minNativeZoom < 0 || maxNativeZoom < minNativeZoom || maxZoom < maxNativeZoom || maxZoom > 24) {
      throw (
        /* alloc */
        new Error("Invalid vector tile zoom range")
      );
    }
  }

  // src/vector-tiles/vectorTileSettings.js
  async function vectorTileSettings(options) {
    if (!options || typeof options !== "object") throw (
      /* alloc */
      new TypeError("Vector tiles require source options")
    );
    if (options.tileJSON) options = await readTileJSON(options);
    let { url, style, minNativeZoom = 0, maxNativeZoom = 14, maxZoom = 19 } = options;
    let key;
    if (typeof url === "string") url = url.replaceAll(/%7B([zxy])%7D/gi, "{$1}");
    for (
      key of
      /* alloc */
      ["{z}", "{x}", "{y}"]
    ) {
      if (typeof url !== "string" || !url.includes(key)) throw (
        /* alloc */
        new Error("Vector tiles require an XYZ URL template")
      );
    }
    validateVectorTileZooms(minNativeZoom, maxNativeZoom, maxZoom);
    style = await readVectorStyle(style);
    return (
      /* alloc */
      { ...options, url, style, minNativeZoom, maxNativeZoom, maxZoom }
    );
  }

  // src/vector-tiles/loadVectorSprite.js
  async function loadVectorSprite(url) {
    const response = await fetch(`${url}.json`);
    if (!response.ok) throw (
      /* alloc */
      new Error(`Sprite ${url}.json: HTTP ${response.status}`)
    );
    return (
      /* alloc */
      { url: `${url}.png`, index: await response.json() }
    );
  }

  // src/globals/vectorTileEvents.js
  var vectorTileEvents = "move zoom rotate pitch resize viewreset";

  // src/vector-style/evaluateBoolean.js
  function evaluateBoolean(op, args, properties, zoom, legacy) {
    let i = 0;
    if (op === "all") {
      for (i = 0; i < args.length; i++) {
        if (!evaluateStyle(args[i], properties, zoom, legacy)) return false;
      }
      return true;
    }
    if (op === "any") {
      for (i = 0; i < args.length; i++) {
        if (evaluateStyle(args[i], properties, zoom, legacy)) return true;
      }
      return false;
    }
    throw (
      /* alloc */
      new Error(`Unsupported vector style expression: ${op}`)
    );
  }

  // src/vector-style/evaluateCoalesceOrCase.js
  function evaluateCoalesceOrCase(op, args, properties, zoom, legacy) {
    let i = 0, result = null;
    if (op === "coalesce") {
      for (i = 0; i < args.length; i++) {
        result = evaluateStyle(args[i], properties, zoom);
        if (result !== null && result !== void 0) return result;
      }
      return null;
    }
    if (op === "case") {
      for (i = 0; i < args.length - 1; i += 2) {
        if (evaluateStyle(args[i], properties, zoom)) {
          return evaluateStyle(args[i + 1], properties, zoom);
        }
      }
      return evaluateStyle(args[args.length - 1], properties, zoom);
    }
    throw (
      /* alloc */
      new Error(`Unsupported vector style expression: ${op}`)
    );
  }

  // src/vector-style/evaluateInput.js
  function evaluateInput(value, properties, zoom, legacy) {
    if (legacy && typeof value === "string") return properties[value];
    return evaluateStyle(value, properties, zoom);
  }

  // src/vector-style/evaluateComparison.js
  function evaluateComparison(op, args, properties, zoom, legacy) {
    const left = evaluateInput(args[0], properties, zoom, legacy);
    const right = evaluateStyle(args[1], properties, zoom);
    switch (op) {
      case "==":
        return left === right;
      case "!=":
        return left !== right;
      case "<=":
        return left <= right;
      case ">=":
        return left >= right;
      case "<":
        return left < right;
      case ">":
        return left > right;
      default:
        throw (
          /* alloc */
          new Error(`Unsupported vector style expression: ${op}`)
        );
    }
  }

  // src/globals/vectorStyleNamedColors.js
  var vectorStyleNamedColors = {
    black: [0, 0, 0, 1],
    white: [255, 255, 255, 1],
    gray: [128, 128, 128, 1],
    blue: [0, 0, 255, 1],
    red: [255, 0, 0, 1],
    green: [0, 128, 0, 1]
  };

  // src/vector-style/parseFunctionalColor.js
  function parseFunctionalColor(value) {
    const match = /^rgba?\(([^)]+)\)$/.exec(value);
    if (match) {
      const values = match[1].split(",");
      let i = 0, finite = true;
      for (i = 0; i < values.length; i++) values[i] = Number(values[i]);
      if (values.length === 3) values.push(1);
      for (i = 0; i < values.length; i++) {
        if (!Number.isFinite(values[i])) finite = false;
      }
      if (values.length === 4 && finite) return values;
    }
    throw (
      /* alloc */
      new Error(`Unsupported interpolated style color: ${value}`)
    );
  }

  // src/vector-style/parseHexColor.js
  function parseHexColor(value) {
    let i = 0, offset = 0;
    if (value.length === 4) {
      value = "#" + value[1] + value[1] + value[2] + value[2] + value[3] + value[3];
    }
    const color = (
      /* alloc */
      []
    );
    for (i = 1; i < 6; i += 2) {
      offset = parseInt(value.slice(i, i + 2), 16);
      color.push(offset);
    }
    color.push(1);
    return color;
  }

  // src/vector-style/styleColor.js
  function styleColor(value) {
    if (Object.hasOwn(vectorStyleNamedColors, value)) return vectorStyleNamedColors[value];
    if (/^#[0-9a-f]{3}$/i.test(value) || /^#[0-9a-f]{6}$/i.test(value)) {
      return parseHexColor(value);
    }
    return parseFunctionalColor(value);
  }

  // src/vector-style/evaluateInterpolate.js
  function evaluateInterpolate(args, properties, zoom) {
    const result = evaluateStyle(args[1], properties, zoom);
    const base = args[0][0] === "exponential" ? args[0][1] : 1;
    let i = 0, lower = 0, upper = 0, ratio = 0, left = null, right = null, j = 0, color = "";
    if (result <= args[2]) return evaluateStyle(args[3], properties, zoom);
    for (i = 4; i < args.length; i += 2) {
      if (result > args[i]) continue;
      lower = args[i - 2];
      upper = args[i];
      ratio = base === 1 ? (result - lower) / (upper - lower) : (base ** (result - lower) - 1) / (base ** (upper - lower) - 1);
      left = evaluateStyle(args[i - 1], properties, zoom);
      right = evaluateStyle(args[i + 1], properties, zoom);
      if (typeof left === "number" && typeof right === "number") return left + (right - left) * ratio;
      left = styleColor(left);
      right = styleColor(right);
      for (j = 0; j < 3; j++) {
        if (j) color += ",";
        color += Math.round(left[j] + (right[j] - left[j]) * ratio);
      }
      return `rgba(${color},${left[3] + (right[3] - left[3]) * ratio})`;
    }
    return evaluateStyle(args.at(-1), properties, zoom);
  }

  // src/vector-style/arrayContainsRange.js
  function arrayContainsRange(values, start2, end, target) {
    let i = 0, value = null;
    for (i = start2; i < end; i++) {
      value = values[i];
      if (value === target || value !== value && target !== target) return true;
    }
    return false;
  }

  // src/vector-style/evaluateMembership.js
  function evaluateMembership(op, args, properties, zoom, legacy) {
    let target = null;
    if (op === "!in") {
      target = evaluateInput(args[0], properties, zoom, legacy);
      return !arrayContainsRange(args, 1, args.length, target);
    }
    if (legacy) {
      target = evaluateInput(args[0], properties, zoom, true);
      return arrayContainsRange(args, 1, args.length, target);
    }
    const values = evaluateStyle(args[1], properties, zoom);
    target = evaluateInput(args[0], properties, zoom, false);
    return values.includes(target);
  }

  // src/vector-style/evaluateIExpression.js
  function evaluateIExpression(op, args, properties, zoom, legacy) {
    if (op === "in") return evaluateMembership(op, args, properties, zoom, legacy);
    if (op === "interpolate") return evaluateInterpolate(args, properties, zoom);
    throw (
      /* alloc */
      new Error(`Unsupported vector style expression: ${op}`)
    );
  }

  // src/vector-style/evaluateMath.js
  function evaluateMath(op, args, properties, zoom) {
    let i = 0, sum = 0;
    if (op === "+") {
      for (i = 0; i < args.length; i++) sum += evaluateStyle(args[i], properties, zoom);
      return sum;
    }
    if (op === "-") {
      if (args.length === 1) return -evaluateStyle(args[0], properties, zoom);
      return evaluateStyle(args[0], properties, zoom) - evaluateStyle(args[1], properties, zoom);
    }
    throw (
      /* alloc */
      new Error(`Unsupported vector style expression: ${op}`)
    );
  }

  // src/vector-style/evaluateMatch.js
  function evaluateMatch(args, properties, zoom) {
    const result = evaluateStyle(args[0], properties, zoom);
    let i = 0, matched = false;
    for (i = 1; i < args.length - 1; i += 2) {
      if (Array.isArray(args[i])) matched = args[i].includes(result);
      else matched = args[i] === result;
      if (matched) return evaluateStyle(args[i + 1], properties, zoom);
    }
    return evaluateStyle(args[args.length - 1], properties, zoom);
  }

  // src/vector-style/evaluateNegation.js
  function evaluateNegation(op, args, properties, zoom, legacy) {
    if (op === "!") return !evaluateStyle(args[0], properties, zoom, legacy);
    if (op === "!=") {
      return evaluateInput(args[0], properties, zoom, legacy) !== evaluateStyle(args[1], properties, zoom);
    }
    if (op === "!in") return evaluateMembership(op, args, properties, zoom, legacy);
    throw (
      /* alloc */
      new Error(`Unsupported vector style expression: ${op}`)
    );
  }

  // src/vector-style/evaluatePrimitive.js
  function evaluatePrimitive(op, args, properties, zoom) {
    switch (op) {
      case "literal":
        return args[0];
      case "get":
        return properties[args[0]];
      case "has":
        return Object.hasOwn(properties, args[0]);
      case "zoom":
        return zoom;
      default:
        throw (
          /* alloc */
          new Error(`Unsupported vector style expression: ${op}`)
        );
    }
  }

  // src/vector-style/evaluateStep.js
  function evaluateStep(args, properties, zoom) {
    const result = evaluateStyle(args[0], properties, zoom);
    let output = args[1], i = 0;
    for (i = 2; i < args.length; i += 2) {
      if (result < args[i]) break;
      output = args[i + 1];
    }
    return evaluateStyle(output, properties, zoom);
  }

  // src/vector-style/evaluateToExpression.js
  function evaluateToExpression(op, args, properties, zoom) {
    if (op === "to-boolean") return Boolean(evaluateStyle(args[0], properties, zoom));
    if (op === "to-number") {
      let i = 0, number = 0;
      for (i = 0; i < args.length; i++) {
        number = Number(evaluateStyle(args[i], properties, zoom));
        if (Number.isFinite(number)) return number;
      }
      throw (
        /* alloc */
        new Error("Invalid numeric style expression")
      );
    }
    throw (
      /* alloc */
      new Error(`Unsupported vector style expression: ${op}`)
    );
  }

  // src/vector-style/evaluateStyle.js
  function evaluateStyle(value, properties, zoom, legacy = false) {
    if (!Array.isArray(value)) return value;
    const op = value[0];
    const args = value.slice(1);
    const operation = String(op);
    if (/^(?:literal|get|has|zoom)$/.test(operation)) {
      return evaluatePrimitive(op, args, properties, zoom);
    }
    switch (operation[0]) {
      case "a":
        return evaluateBoolean(op, args, properties, zoom, legacy);
      case "!":
        return evaluateNegation(op, args, properties, zoom, legacy);
      case "=":
      case "<":
      case ">":
        return evaluateComparison(op, args, properties, zoom, legacy);
      case "i":
        return evaluateIExpression(op, args, properties, zoom, legacy);
      case "t":
        return evaluateToExpression(op, args, properties, zoom, legacy);
      case "c":
        return evaluateCoalesceOrCase(op, args, properties, zoom, legacy);
      case "m":
        return evaluateMatch(args, properties, zoom);
      case "s":
        return evaluateStep(args, properties, zoom);
      default:
        return evaluateMath(op, args, properties, zoom);
    }
  }

  // src/vector-tiles/vectorStyleZoom.js
  function vectorStyleZoom(layer) {
    return layer._map.getZoom() + (vectorTileOptionsByLayer.get(layer).styleZoomOffset ?? 0);
  }

  // src/vector-tiles/refreshVectorTiles.js
  function refreshVectorTiles() {
    clearTimeout(this.timer);
    this.changedAt = performance.now();
    this.timer = setTimeout(this.update.bind(this), 180);
  }

  // src/vector-tiles/rotateVectorLabel.js
  init_radians();

  // src/core/markerSetRotation.js
  function markerSetRotation(marker, rotation) {
    if (!Number.isFinite(rotation)) throw (
      /* alloc */
      new TypeError("Marker rotation must be finite")
    );
    marker.options.rotation = rotation;
    marker.update();
    refreshNativeLayerContract(marker);
    return marker;
  }

  // src/vector-tiles/rotateVectorLabel.js
  function rotateVectorLabel(map, marker, label) {
    if (!label.along) return;
    const a = map.latLngToContainerPoint(label.along[0]), b = map.latLngToContainerPoint(label.along[1]);
    let angle = Math.atan2(b.y - a.y, b.x - a.x) / radians;
    if (angle > 90) angle -= 180;
    else if (angle < -90) angle += 180;
    if (marker.options.rotation === angle * radians) return;
    markerSetRotation(marker, angle * radians);
  }

  // src/vector-tiles/rotateVectorLabels.js
  function rotateVectorLabels() {
    let marker;
    for (marker of this.labels.values()) if (marker._mvtLabel) rotateVectorLabel(this._map, marker, marker._mvtLabel);
  }

  // src/weakmaps/vectorWorkerByLayer.js
  var vectorWorkerByLayer = /* @__PURE__ */ new WeakMap();

  // src/vector-tiles/revokeVectorWorkerUrl.js
  function revokeVectorWorkerUrl(layer) {
    const entry = vectorWorkerByLayer.get(layer);
    if (entry?.blobUrl) {
      URL.revokeObjectURL(entry.blobUrl);
      entry.blobUrl = null;
    }
  }

  // src/vector-tiles/onVectorTileMessage.js
  function onVectorTileMessage({ data }) {
    revokeVectorWorkerUrl(this);
    const pending = this.waiting.get(data.id);
    if (!pending) return;
    this.waiting.delete(data.id);
    if (data.error) pending.reject(
      /* alloc */
      new Error(data.error)
    );
    else pending.resolve(data);
  }

  // src/vector-tiles/onVectorTileWorkerError.js
  function onVectorTileWorkerError(event) {
    revokeVectorWorkerUrl(this);
    const error = (
      /* alloc */
      new Error(`Worker MVT: ${event.message}`)
    );
    let pending;
    for (pending of this.waiting.values()) pending.reject(error);
    this.waiting.clear();
    reportError(this, error);
  }

  // src/vector-tiles/onVectorTileAdd.js
  function onVectorTileAdd(map) {
    const { style, pane } = vectorTileOptionsByLayer.get(this);
    let index, entry;
    for ([index] of style.entries()) {
      (map.getPane(`${pane}-${index}`) || map.createPane(`${pane}-${index}`)).style.zIndex = 200 + index;
    }
    for (entry of style) {
      if (entry.type !== "background") continue;
      map.getContainer().style.background = evaluateStyle(
        entry.paint["background-color"],
        /* alloc */
        {},
        vectorStyleZoom(this)
      );
      break;
    }
    this.session = /* alloc */
    {};
    this.tiles = /* alloc */
    /* @__PURE__ */ new Map();
    this.labels = /* alloc */
    /* @__PURE__ */ new Map();
    this.waiting = /* alloc */
    /* @__PURE__ */ new Map();
    this.retiring = /* alloc */
    /* @__PURE__ */ new Set();
    this.inflight = 0;
    this.sequence = 0;
    this.changedAt = 0;
    this.paintZoom = null;
    const workerEntry = createGeometryWorker(this.options.workerUrl || geometryWorkerUrl);
    vectorWorkerByLayer.set(this, workerEntry);
    this.worker = workerEntry.worker;
    this.worker.onmessage = onVectorTileMessage.bind(this);
    this.worker.onerror = onVectorTileWorkerError.bind(this);
    this.refresh = refreshVectorTiles.bind(this);
    this.rotateLabels = rotateVectorLabels.bind(this);
    map.on(vectorTileEvents, this.refresh);
    map.on("move rotate pitch", this.rotateLabels);
    this.update();
  }

  // src/vector-tiles/onVectorTileRemove.js
  function onVectorTileRemove(map) {
    map.off(vectorTileEvents, this.refresh);
    map.off("move rotate pitch", this.rotateLabels);
    clearTimeout(this.timer);
    this.session = null;
    this.worker.terminate();
    revokeVectorWorkerUrl(this);
    vectorWorkerByLayer.delete(this);
    let pending, tile, group, marker;
    for (pending of this.waiting.values()) pending.reject(
      /* alloc */
      new DOMException("Layer removed", "AbortError")
    );
    this.waiting.clear();
    for (tile of this.tiles.values()) {
      tile.controller.abort();
      tile.group?.remove();
    }
    for (group of this.retiring) group.remove();
    for (marker of this.labels.values()) marker.remove();
    this.tiles.clear();
    this.labels.clear();
    this.retiring.clear();
  }

  // src/vector-tiles/updateVectorTiles.js
  function updateVectorTiles() {
    if (!this.session) return;
    const { minNativeZoom, maxNativeZoom } = vectorTileOptionsByLayer.get(this);
    const z = Math.max(minNativeZoom, Math.min(maxNativeZoom, Math.floor(vectorStyleZoom(this))));
    const bounds = this._map.getBounds(), count = 2 ** z;
    const nw = this._map.project(bounds.getNorthWest(), z).divideBy(256);
    const se = this._map.project(bounds.getSouthEast(), z).divideBy(256);
    let tile, x, y, key;
    for (tile of this.tiles.values()) tile.needed = false;
    for (x = Math.floor(nw.x); x <= Math.floor(se.x); x++) {
      for (y = Math.max(0, Math.floor(nw.y)); y <= Math.min(count - 1, Math.floor(se.y)); y++) {
        key = `${z}/${x}/${y}`;
        tile = this.tiles.get(key);
        if (!tile) {
          tile = /* alloc */
          { key, coords: (
            /* alloc */
            { z, x, y }
          ), controller: (
            /* alloc */
            new AbortController()
          ) };
          this.tiles.set(key, tile);
        }
        tile.needed = true;
      }
    }
    this.prune();
    this.pump();
    this.updatePaint().catch(reportError.bind(null, this));
    this.updateLabels().catch(reportError.bind(null, this));
  }

  // src/vector-style/readPaintValue.js
  function readPaintValue(paint, key, fallback, properties, zoom) {
    if (paint[key] === void 0) return fallback;
    return evaluateStyle(paint[key], properties, zoom);
  }

  // src/vector-style/fillVectorPaint.js
  function fillVectorPaint(paint, properties, zoom) {
    const fill = styleColor(readPaintValue(paint, "fill-color", "#000", properties, zoom));
    const outline = readPaintValue(paint, "fill-outline-color", null, properties, zoom);
    const rgb2 = outline === null ? null : styleColor(outline);
    const fillOpacity = readPaintValue(paint, "fill-opacity", 1, properties, zoom) * fill[3];
    const fillColor = (
      /* alloc */
      { r: fill[0] / 255, g: fill[1] / 255, b: fill[2] / 255 }
    );
    const color = rgb2 ? (
      /* alloc */
      { r: rgb2[0] / 255, g: rgb2[1] / 255, b: rgb2[2] / 255 }
    ) : null;
    return (
      /* alloc */
      {
        fillColor,
        fillOpacity,
        color,
        weight: 0.5
      }
    );
  }

  // src/vector-style/scaleDashArray.js
  function scaleDashArray(dash, weight, properties, zoom) {
    if (!dash) return void 0;
    let values = dash, i = 0, result = "";
    if (typeof dash[0] !== "number") values = evaluateStyle(dash, properties, zoom);
    if (!Array.isArray(values)) throw (
      /* alloc */
      new TypeError("Style dash array must be an array")
    );
    for (i = 0; i < values.length; i++) {
      if (i) result += " ";
      result += values[i] * weight;
    }
    return result;
  }

  // src/vector-style/lineVectorPaint.js
  function lineVectorPaint(layer, paint, properties, zoom) {
    const weight = readPaintValue(paint, "line-width", 1, properties, zoom);
    const rgb2 = styleColor(readPaintValue(paint, "line-color", "#000", properties, zoom));
    const opacity = readPaintValue(paint, "line-opacity", 1, properties, zoom) * rgb2[3];
    const dashArray = scaleDashArray(paint["line-dasharray"], weight, properties, zoom);
    const lineCap = layer.layout?.["line-cap"] || "butt";
    const lineJoin2 = layer.layout?.["line-join"] || "miter";
    const color = (
      /* alloc */
      { r: rgb2[0] / 255, g: rgb2[1] / 255, b: rgb2[2] / 255 }
    );
    return (
      /* alloc */
      {
        color,
        opacity,
        weight,
        dashArray,
        lineCap,
        lineJoin: lineJoin2
      }
    );
  }

  // src/vector-style/vectorPaint.js
  function vectorPaint(layer, properties, zoom) {
    const paint = layer.paint || /* alloc */
    {};
    if (layer.type === "fill") return fillVectorPaint(paint, properties, zoom);
    return lineVectorPaint(layer, paint, properties, zoom);
  }

  // src/vector-style/visibleStyle.js
  function visibleStyle(layer, properties, zoom) {
    return zoom >= (layer.minzoom ?? 0) && zoom < (layer.maxzoom ?? Infinity) && layer.layout?.visibility !== "none" && (!layer.filter || evaluateStyle(layer.filter, properties, zoom, true));
  }

  // src/vector-tiles/vectorTilePaint.js
  function vectorTilePaint(batch, zoom) {
    const paint = vectorPaint(batch.entry, batch.properties, zoom);
    if (!visibleStyle(batch.entry, batch.properties, zoom)) {
      paint.opacity = 0;
      paint.fillOpacity = 0;
    }
    return paint;
  }

  // src/vector-tiles/paintVectorTileBatch.js
  function paintVectorTileBatch(batch, zoom) {
    const paint = vectorTilePaint(batch, zoom), { layer } = batch;
    if (batch.kind === "line") {
      if (paint.dashArray !== layer.options.dashArray) layer.setStyle(paint);
      else layer.setStyle(
        /* alloc */
        { color: paint.color, opacity: paint.opacity, weight: paint.weight }
      );
    } else if (JSON.stringify(paint.fillColor) !== JSON.stringify(layer.options.fillColor) || paint.fillOpacity !== layer.options.fillOpacity) {
      layer.setStyle(
        /* alloc */
        { fillColor: paint.fillColor, fillOpacity: paint.fillOpacity }
      );
    }
  }

  // src/vector-tiles/vectorTilesIdle.js
  function vectorTilesIdle(layer, session) {
    return layer.session === session && performance.now() - (layer.changedAt || 0) >= 180;
  }

  // src/utils/yieldTask.js
  function yieldTask(delay = 0) {
    const task = Promise.withResolvers();
    setTimeout(task.resolve, delay);
    return task.promise;
  }

  // src/vector-tiles/updateVectorTilePaint.js
  async function updateVectorTilePaint() {
    const zoom = vectorStyleZoom(this), session = this.session;
    if (this.paintZoom === zoom) return;
    const revision = this.paintRevision = (this.paintRevision || 0) + 1;
    let updated = 0, tile, batch;
    for (tile of this.tiles.values()) {
      if (!tile.rendered) continue;
      for (batch of tile.rendered) {
        if (!vectorTilesIdle(this, session) || this.paintRevision !== revision || vectorStyleZoom(this) !== zoom) return;
        paintVectorTileBatch(batch, zoom);
        if (++updated % 32 === 0) await yieldTask();
      }
    }
    this.paintZoom = zoom;
  }

  // src/vector-tiles/compareVectorLabelPriority.js
  function compareVectorLabelPriority(a, b) {
    return a.priority - b.priority;
  }

  // src/vector-tiles/vectorLabelCandidates.js
  function vectorLabelCandidates(layer) {
    const candidates = (
      /* alloc */
      []
    );
    let tile, label;
    for (tile of layer.tiles.values()) {
      if (!tile.needed || !tile.labelCandidates) continue;
      for (label of tile.labelCandidates) candidates.push(label);
    }
    return candidates.sort(compareVectorLabelPriority);
  }

  // src/vector-tiles/updateVectorLabelStyle.js
  function updateVectorLabelStyle(label, zoom) {
    label.size = evaluateStyle(label.entry.layout?.["text-size"] ?? 12, label.properties, zoom);
    label.color = evaluateStyle(label.entry.paint?.["text-color"] ?? "#000", label.properties, zoom);
    label.halo = evaluateStyle(label.entry.paint?.["text-halo-color"] ?? "#fff", label.properties, zoom);
    label.haloWidth = evaluateStyle(label.entry.paint?.["text-halo-width"] ?? 0, label.properties, zoom);
  }

  // src/vector-tiles/vectorLabelCells.js
  function vectorLabelCells(layer, label, size) {
    const map = layer._map, zoom = vectorStyleZoom(layer);
    if (!visibleStyle(label.entry, label.properties, zoom)) return null;
    updateVectorLabelStyle(label, zoom);
    if (!(label.size > 0)) return null;
    if (label.icon && !vectorTileOptionsByLayer.get(layer).spriteSheet?.index[label.icon]) return null;
    if (label.along && label.pixelBase * 2 ** map.getZoom() < label.text.length * label.size * 0.6) return null;
    const point = map.latLngToContainerPoint(label.latlng);
    if (point.x < 0 || point.y < 0 || point.x > size.x || point.y > size.y) return null;
    const width = label.text.length * label.size * 0.65 + 16, cells = (
      /* alloc */
      []
    );
    let x, y;
    for (x = Math.floor((point.x - width / 2) / 32); x <= Math.floor((point.x + width / 2) / 32); x++) {
      for (y = Math.floor((point.y - label.size) / 24); y <= Math.floor((point.y + label.size) / 24); y++) {
        cells.push(`${x}:${y}`);
      }
    }
    return cells;
  }

  // src/vector-tiles/reserveVectorLabelCells.js
  function reserveVectorLabelCells(cells, occupied) {
    let cell;
    for (cell of cells) if (occupied.has(cell)) return false;
    for (cell of cells) occupied.add(cell);
    return true;
  }

  // src/vector-tiles/updateVectorLabelMarker.js
  init_L();

  // src/vector-tiles/vectorLabelIcon.js
  init_L();

  // src/vector-tiles/vectorSpriteIcon.js
  init_L();
  function vectorSpriteIcon(label, sheet) {
    const { x, y, width, height } = sheet.index[label.icon], [dx, dy] = label.iconOffset;
    return (
      /* alloc */
      new L.DivIcon(
        /* alloc */
        {
          className: "",
          html: `<div style="width:${width}px;height:${height}px;background:url(${sheet.url}) -${x}px -${y}px"></div>`,
          iconSize: (
            /* alloc */
            [width, height]
          ),
          iconAnchor: (
            /* alloc */
            [width / 2 - dx, height / 2 - dy]
          )
        }
      )
    );
  }

  // src/vector-tiles/wrapVectorLabel.js
  function wrapVectorLabel(text) {
    const limit = Math.floor(10 / 0.52), lines = (
      /* alloc */
      []
    );
    let line2 = "", word;
    for (word of text.split(" ")) {
      if (line2 && Array.from(`${line2} ${word}`).length > limit) {
        lines.push(line2);
        line2 = word;
      } else line2 = line2 ? `${line2} ${word}` : word;
    }
    lines.push(line2);
    return lines;
  }

  // src/vector-tiles/vectorLabelIcon.js
  function vectorLabelIcon(label, sheet) {
    if (label.icon) return vectorSpriteIcon(label, sheet);
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    const lines = label.along ? (
      /* alloc */
      [label.text]
    ) : wrapVectorLabel(label.text);
    let longest = 0, line2, key, text, index;
    for (line2 of lines) longest = Math.max(longest, Array.from(line2).length);
    const width = Math.max(40, longest * label.size * 0.65 + 12);
    const lineHeight = label.size * 1.2, height = lines.length * lineHeight + 12;
    svg.setAttribute("width", width);
    svg.setAttribute("height", height);
    const attributes = (
      /* alloc */
      {
        x: width / 2,
        "text-anchor": "middle",
        "font-family": "sans-serif",
        "font-size": label.size,
        fill: label.color,
        stroke: label.halo,
        "stroke-width": label.haloWidth * 2,
        "paint-order": "stroke"
      }
    );
    for (index = 0; index < lines.length; index++) {
      text = document.createElementNS(svg.namespaceURI, "text");
      for (key of Object.keys(attributes)) text.setAttribute(key, attributes[key]);
      text.setAttribute("y", height / 2 + (index - (lines.length - 1) / 2) * lineHeight + label.size * 0.35);
      text.textContent = lines[index];
      svg.append(text);
    }
    return (
      /* alloc */
      new L.Icon(
        /* alloc */
        {
          iconUrl: `data:image/svg+xml;charset=utf-8,${encodeURIComponent(
            /* alloc */
            new XMLSerializer().serializeToString(svg)
          )}`,
          iconSize: (
            /* alloc */
            [width, height]
          ),
          iconAnchor: (
            /* alloc */
            [width / 2, height / 2]
          )
        }
      )
    );
  }

  // src/vector-tiles/forwardVectorTileError.js
  function forwardVectorTileError({ error }) {
    reportError(this, error);
  }

  // src/vector-tiles/updateVectorLabelMarker.js
  function updateVectorLabelMarker(owner, label, key) {
    const appearance = JSON.stringify(
      /* alloc */
      [label.size, label.color, label.halo, label.haloWidth, label.icon]
    );
    const sheet = vectorTileOptionsByLayer.get(owner).spriteSheet;
    let marker = owner.labels.get(key);
    if (marker) {
      marker._mvtLabel = label;
      if (marker._mvtLabelStyle === appearance) {
        rotateVectorLabel(owner._map, marker, label);
        return false;
      }
      marker.setIcon(vectorLabelIcon(label, sheet));
    } else {
      const { pane } = vectorTileOptionsByLayer.get(owner);
      marker = /* alloc */
      new L.Marker(
        label.latlng,
        /* alloc */
        {
          icon: vectorLabelIcon(label, sheet),
          pane: `${pane}-${label.order}`,
          title: label.text,
          alt: label.text,
          interactive: false,
          keyboard: false,
          rotateWithView: false
        }
      ).on("error", forwardVectorTileError, owner).addTo(owner._map);
      owner.labels.set(key, marker);
    }
    marker._mvtLabelStyle = appearance;
    marker._mvtLabel = label;
    rotateVectorLabel(owner._map, marker, label);
    return true;
  }

  // src/vector-tiles/updateVectorTileLabels.js
  async function updateVectorTileLabels() {
    const session = this.session, revision = this.labelRevision = (this.labelRevision || 0) + 1;
    this.labelsReady = false;
    const candidates = vectorLabelCandidates(this), size = this._map.getSize();
    const occupied = (
      /* alloc */
      /* @__PURE__ */ new Set()
    ), retained = (
      /* alloc */
      /* @__PURE__ */ new Set()
    );
    let visited = 0, label, key, cells, marker;
    for (label of candidates) {
      if (++visited % 128 === 0) await yieldTask();
      if (!vectorTilesIdle(this, session) || this.labelRevision !== revision) return;
      cells = vectorLabelCells(this, label, size);
      if (!cells || !label.allowOverlap && !reserveVectorLabelCells(cells, occupied)) continue;
      key = `${label.text}${label.icon || ""}:${label.latlng.join(":")}`;
      retained.add(key);
      if (updateVectorLabelMarker(this, label, key)) await yieldTask();
    }
    for ([key, marker] of this.labels) {
      if (!vectorTilesIdle(this, session) || this.labelRevision !== revision) return;
      if (!retained.has(key)) {
        marker.remove();
        this.labels.delete(key);
        await yieldTask();
      }
    }
    this.labelsReady = true;
  }

  // src/vector-tiles/vectorTileOverlaps.js
  function vectorTileOverlaps(a, b) {
    const shift = a.z - b.z;
    return shift >= 0 ? a.x >> shift === b.x && a.y >> shift === b.y : b.x >> -shift === a.x && b.y >> -shift === a.y;
  }

  // src/vector-tiles/vectorTileAwaited.js
  function vectorTileAwaited(layer, stale) {
    let tile;
    for (tile of layer.tiles.values()) {
      if (tile.needed && !tile.group && vectorTileOverlaps(tile.coords, stale.coords)) return true;
    }
    return false;
  }

  // src/vector-tiles/pruneVectorTiles.js
  function pruneVectorTiles() {
    let tile, key;
    for ([key, tile] of this.tiles) {
      if (tile.needed || tile.group && vectorTileAwaited(this, tile)) continue;
      tile.controller.abort();
      this.tiles.delete(key);
      if (tile.group) this.retire(tile.group).catch(reportError.bind(null, this));
    }
  }

  // src/vector-tiles/retireVectorTileGroup.js
  async function retireVectorTileGroup(group) {
    const session = this.session;
    this.retiring.add(group);
    let removed = 0, layer;
    for (layer of group.getLayers()) {
      if (this.session !== session) return;
      group.removeLayer(layer);
      if (++removed % 8 === 0) await yieldTask();
    }
    group.remove();
    this.retiring.delete(group);
  }

  // src/vector-tiles/compareVectorTileDistance.js
  function compareVectorTileDistance(a, b) {
    return a.distance - b.distance;
  }

  // src/vector-tiles/pumpVectorTiles.js
  function pumpVectorTiles() {
    if (!this.session) return;
    const center = this._map.getCenter(), pending = (
      /* alloc */
      []
    );
    let tile, point;
    for (tile of this.tiles.values()) {
      if (!tile.needed || tile.started) continue;
      point = this._map.project(center, tile.coords.z).divideBy(256);
      tile.distance = (tile.coords.x - point.x) ** 2 + (tile.coords.y - point.y) ** 2;
      pending.push(tile);
    }
    pending.sort(compareVectorTileDistance);
    for (tile of pending) {
      if (this.inflight >= 4) break;
      tile.started = true;
      this.inflight++;
      this.load(tile);
    }
  }

  // src/vector-tiles/loadVectorTile.js
  init_L();

  // src/vector-tiles/attachVectorTileBatch.js
  init_L();
  function attachVectorTileBatch(owner, tile, group, batch) {
    const { pane } = vectorTileOptionsByLayer.get(owner);
    const paint = vectorTilePaint(batch, vectorStyleZoom(owner));
    const options = (
      /* alloc */
      { ...paint, pane: `${pane}-${batch.order}`, interactive: false, smoothFactor: 0 }
    );
    const layer = batch.kind === "fill" ? (
      /* alloc */
      new L.Polygon(
        batch.paths,
        /* alloc */
        { ...options, stroke: false, triangulated: true }
      )
    ) : (
      /* alloc */
      new L.Polyline(batch.paths, options)
    );
    layer.on("error", forwardVectorTileError, owner);
    tile.rendered.push(
      /* alloc */
      { layer, kind: batch.kind, entry: batch.entry, properties: batch.properties }
    );
    group.addLayer(layer);
  }

  // src/vector-tiles/attachVectorTileBatches.js
  async function attachVectorTileBatches(owner, tile, group, batches, session) {
    let batch, start2 = performance.now();
    for (batch of batches) {
      while (!vectorTilesIdle(owner, session) && owner.session === session && !tile.controller.signal.aborted) await yieldTask(50);
      if (tile.controller.signal.aborted || owner.session !== session) return false;
      attachVectorTileBatch(owner, tile, group, batch);
      if (performance.now() - start2 > 8) {
        await yieldTask();
        start2 = performance.now();
      }
    }
    return true;
  }

  // src/vector-tiles/loadVectorTile.js
  async function loadVectorTile(tile) {
    const { coords, controller } = tile, session = this.session;
    const { url, style, sourceId, maxZoom, maxNativeZoom } = vectorTileOptionsByLayer.get(this);
    const count = 2 ** coords.z, x = (coords.x % count + count) % count;
    let group;
    try {
      const tileUrl = L.Util.template(
        url,
        /* alloc */
        { z: coords.z, x, y: coords.y }
      );
      const response = await fetch(
        tileUrl,
        /* alloc */
        { signal: controller.signal }
      );
      if (!response.ok) throw (
        /* alloc */
        new Error(`Tile ${tile.key}: HTTP ${response.status}`)
      );
      const buffer = await response.arrayBuffer();
      if (controller.signal.aborted) return;
      const id = ++this.sequence, prepared = Promise.withResolvers();
      this.waiting.set(id, prepared);
      this.worker.postMessage(
        /* alloc */
        {
          type: "vector",
          id,
          buffer,
          coords,
          style,
          source: sourceId,
          maxZoom,
          zoom: vectorStyleZoom(this),
          mapZoom: coords.z >= maxNativeZoom ? maxZoom : this._map.getZoom()
        },
        /* alloc */
        [buffer]
      );
      const data = await prepared.promise;
      if (controller.signal.aborted || this.session !== session) return;
      group = /* alloc */
      new L.LayerGroup().addTo(this._map);
      tile.rendered = /* alloc */
      [];
      if (!await attachVectorTileBatches(this, tile, group, data.batches, session)) {
        group.remove();
        return;
      }
      tile.group = group;
      tile.labelCandidates = data.labels;
      this.fire(
        "tileload",
        /* alloc */
        { coords, group }
      );
      this.prune();
      this.refresh();
    } catch (error) {
      group?.remove();
      if (!controller.signal.aborted && this.session === session) this.fire(
        "error",
        /* alloc */
        { error }
      );
    } finally {
      if (this.session === session) {
        this.inflight--;
        this.pump();
      }
    }
  }

  // src/vector-tiles/configureVectorTileLayer.js
  async function configureVectorTileLayer(layer, options) {
    const settings = await vectorTileSettings(options);
    if (typeof settings.sprite === "string") settings.spriteSheet = await loadVectorSprite(settings.sprite);
    const { url, tileJSON, style, sourceId, minNativeZoom, maxNativeZoom, maxZoom, ...core } = settings;
    L.Util.setOptions(layer, core);
    settings.pane = `mvt-${L.Util.stamp(layer)}`;
    vectorTileOptionsByLayer.set(layer, settings);
    Object.assign(
      layer,
      /* alloc */
      {
        onAdd: onVectorTileAdd,
        onRemove: onVectorTileRemove,
        update: updateVectorTiles,
        updatePaint: updateVectorTilePaint,
        updateLabels: updateVectorTileLabels,
        prune: pruneVectorTiles,
        retire: retireVectorTileGroup,
        pump: pumpVectorTiles,
        load: loadVectorTile
      }
    );
    return layer;
  }

  // src/sources/readyVectorTiles.js
  function readyVectorTiles(layer) {
    const map = layer._map;
    map?.removeLayer(layer);
    kindByLayer.delete(layer);
    map?.addLayer(layer);
    layer.fire("ready");
    return layer;
  }

  // src/raster/reportRasterError.js
  function reportError2(layer, error) {
    layer.fire(
      "error",
      /* alloc */
      { error }
    );
    throw error;
  }

  // src/sources/initVectorTiles.js
  function initVectorTiles(layer, options) {
    kindByLayer.set(layer, "pending");
    const ready = configureVectorTileLayer(layer, options).then(readyVectorTiles.bind(null, layer)).catch(reportError2.bind(null, layer));
    readyByLayer.set(layer, ready);
    ready.catch(noOperation);
  }

  // src/raster/initRaster.js
  init_L();

  // src/raster/readyRaster.js
  async function readyRaster(layer, archive) {
    const header = await getHeader(archive);
    layer.options.archive = archive;
    headerByLayer.set(layer, header);
    if (layer.options.maxNativeZoom === void 0) {
      layer.options.maxNativeZoom = header.maxZoom;
    }
    layer.options.maxZoom = Math.max(layer.options.minZoom || 0, layer.options.maxZoom);
    layer.fire("ready");
    return layer;
  }

  // src/raster/releaseRasterTiles.js
  function releaseRasterTiles(layer) {
    let tile, attribute;
    for (tile of rasterTilesByLayer.get(layer).values()) releaseRasterTile(layer, tile);
    rasterProgramByLayer.get(layer)?.pipelineCache.clear();
    rasterProgramByLayer.set(layer, null);
    if (rasterGeometryByLayer.get(layer)) {
      for (attribute of Object.values(rasterGeometryByLayer.get(layer).attributes)) {
        destroyTexture(layer, attribute.buffer);
      }
      rasterGeometryByLayer.set(layer, null);
    }
  }

  // src/weakmaps/fadeFrameByLayer.js
  var fadeFrameByLayer = /* @__PURE__ */ new WeakMap();

  // src/weakmaps/fadeVersionByLayer.js
  var fadeVersionByLayer = /* @__PURE__ */ new WeakMap();

  // src/weakmaps/sceneFields.js
  var sceneFields = {
    "_3d": state3dByLayer,
    "_added": addedByLayer,
    "_areas": areasByLayer,
    "_bridgeMesh": bridgeMeshByLayer,
    "_bridges": bridgesByLayer,
    "_cameraZIndexOffset": cameraZIndexOffsetByLayer,
    "_countStatus": countStatusByLayer,
    "_cursor": cursorByLayer,
    "_dem": demByLayer,
    "_directories": directoriesByLayer,
    "_etag": etagByLayer,
    "_fadeFrame": fadeFrameByLayer,
    "_fadeVersion": fadeVersionByLayer,
    "_frame": frameByLayer,
    "_geojson": geojsonByLayer,
    "_header": archiveHeaderByLayer,
    "_inflight": inflightByLayer,
    "_layers": layersByLayer,
    "_loadingTiles": loadingTilesByLayer,
    "_nativeGPU": nativeGPUByLayer,
    "_pointerEvents": pointerEventsByLayer,
    "_pruneAfter": pruneAfterByLayer,
    "_pruneVersion": pruneVersionByLayer,
    "_pruneWanted": pruneWantedByLayer,
    "_queued": queuedByLayer,
    "_rasterGeometry": rasterGeometryByLayer,
    "_rasterProgram": rasterProgramByLayer,
    "_rasterTiles": rasterTilesByLayer,
    "_rasterVersion": rasterVersionByLayer,
    "_rendererReady": rendererReadyByLayer,
    "_roofRaster": roofRasterByLayer,
    "_roofRasters": roofRastersByLayer,
    "_sceneOrigin": sceneOriginByLayer,
    "_shadowMeshes": shadowMeshesByLayer,
    "_shared": sharedByLayer,
    "_size": sizeByLayer,
    "_terrain3D": terrain3DByLayer,
    "_terrainArchive": terrainArchiveByLayer,
    "_terrainBaseY": terrainBaseYByLayer,
    "_terrainBounds": terrainBoundsByLayer,
    "_terrainController": terrainControllerByLayer,
    "_terrainGrids": terrainGridsByLayer,
    "_terrainLoading": terrainLoadingByLayer,
    "_terrainOriginElevation": terrainOriginElevationByLayer,
    "_terrainPromise": terrainPromiseByLayer,
    "_terrainReady": terrainReadyByLayer,
    "_terrainRequest": terrainRequestByLayer,
    "_terrainTiles": terrainTilesByLayer,
    "_terrainZoom": terrainZoomByLayer,
    "_tileZoom": tileZoomByLayer,
    "_tooltip": tooltipByLayer,
    "_type": typeByLayer,
    "_visibleMeshes": visibleMeshesByLayer,
    "_wantedRasterTiles": wantedRasterTilesByLayer,
    "_zoomLevel": zoomLevelByLayer,
    "_zoomTransitions": zoomTransitionsByLayer,
    "_zoomView": zoomViewByLayer,
    "camera": cameraByLayer,
    "container": containerByLayer,
    "control": controlByLayer,
    "eventMap": eventMapByLayer,
    "events": eventsByLayer,
    "group": groupByLayer,
    "header": headerByLayer,
    "highlightedFeature": highlightedFeatureByLayer,
    "hoveredFeature": hoveredFeatureByLayer,
    "kind": kindByLayer,
    "location": locationByLayer,
    "model": modelByLayer,
    "modelUrl": modelUrlByLayer,
    "raycaster": raycasterByLayer,
    "ready": readyByLayer,
    "renderer": rendererByLayer,
    "root": rootByLayer,
    "scene": sceneByLayer,
    "terrainSource": terrainSourceByLayer,
    "url": urlByLayer,
    "walker": walkerByLayer
  };

  // src/scene/onRemove3DLayer.js
  init_L();

  // src/globals/sceneTransferFields.js
  var sceneTransferFields = ["_layers", "_sceneOrigin", "_size", "_zoomLevel", "_zoomTransitions", "_zoomView", "_cursor", "_roofRaster"];

  // src/globals/sceneCleanupFields.js
  var sceneCleanupFields = ["_layers", "_sceneOrigin", "_size", "_zoomLevel", "_cursor"];

  // src/gpu/releaseRenderer.js
  async function releaseRenderer(renderer, layer) {
    try {
      await renderer.device.queue.onSubmittedWorkDone();
      renderer.depthTexture?.destroy();
      renderer.colorTexture?.destroy();
      renderer.roofFallbackTexture?.texture?.destroy();
      renderer.uniformBuffer?.destroy();
      renderer.sunlight?.texture?.destroy();
      renderer.sunlight?.buffer?.destroy();
      renderer.sunlight?.lights?.destroy();
    } catch (error) {
      layer.fire(
        "error",
        /* alloc */
        { error }
      );
    }
    renderer.device.destroy();
  }

  // src/scene/releaseSharedScene.js
  function releaseSharedScene(layer, map) {
    if (roofRasterByLayer.get(layer)) destroyTexture(layer, roofRasterByLayer.get(layer).texture.texture);
    roofRasterByLayer.set(layer, null);
    if (zoomTransitionsByLayer.get(layer)) {
      let animation;
      for (animation of zoomTransitionsByLayer.get(layer).keys()) animation.play();
    }
    zoomTransitionsByLayer.set(layer, null);
    zoomViewByLayer.set(layer, null);
    cameraViewByMap.delete(map);
    map.getContainer().classList.remove("leaflet-camera-zoom");
    const renderer = rendererByLayer.get(layer);
    renderer.canvas.remove();
    releaseRenderer(renderer, layer);
    renderers.delete(map);
    let key;
    for (key of sceneCleanupFields) sceneFields[key].delete(layer);
  }

  // src/scene/onRemove3DLayer.js
  function onRemove3DLayer(layer, map) {
    addedByLayer.set(layer, Promise.withResolvers());
    if (containerByLayer.get(layer)) {
      onPointerLeave(layer);
      L.DomEvent.off(containerByLayer.get(layer), pointerEventsByLayer.get(layer), layer);
      containerByLayer.set(layer, null);
    }
    let area2, key, sceneLayer, field;
    for (area2 of areasByLayer.get(layer).values()) releaseArea(layer, area2);
    areasByLayer.get(layer).clear();
    tooltipByLayer.get(layer)?.remove();
    tooltipByLayer.set(layer, null);
    if (urlByLayer.get(layer) || geojsonByLayer.get(layer)) updateStatus(layer, false);
    const shared = sharedByLayer.get(layer);
    if (!shared) return;
    setParent(rootByLayer.get(layer), null);
    layersByLayer.get(shared).delete(layer);
    if (shared === layer) {
      map.off("move zoom rotate pitch resize viewreset layeradd layerremove", onMapChange, layer);
      map.off("zoomstart", startZoom, layer);
      map.off("zoomanim", onZoomAnim, layer);
      map.off("zoomend", endZoom, layer);
      cancelUpdate(layer);
      if (layersByLayer.get(layer).size) {
        const next = layersByLayer.get(layer).values().next().value;
        for (key of sceneTransferFields) {
          field = sceneFields[key];
          field.set(next, field.get(layer));
          field.delete(layer);
        }
        for (sceneLayer of layersByLayer.get(next)) sharedByLayer.set(sceneLayer, next);
        renderers.set(map, next);
        map.on("move zoom rotate pitch resize viewreset layeradd layerremove", onMapChange, next);
        map.on("zoomstart", startZoom, next);
        map.on("zoomanim", onZoomAnim, next);
        map.on("zoomend", endZoom, next);
        update(next);
      } else {
        releaseSharedScene(layer, map);
      }
    } else update(shared);
    sharedByLayer.set(layer, null);
    rendererByLayer.set(layer, null);
    sceneByLayer.set(layer, null);
    cameraByLayer.set(layer, null);
  }

  // src/raster/onPMTileRemove.js
  function onPMTileRemove(layer, map) {
    releaseRasterTiles(layer);
    terrain3DByLayer.set(layer, null);
    onRemove3DLayer(layer, map);
  }

  // src/raster/getRasterTileSize.js
  init_L();

  // src/raster/initRaster.js
  function initRaster(layer, options) {
    kindByLayer.set(layer, "raster");
    options = /* alloc */
    { ariaLabel: "PMTiles raster", maxZoom: 18, opacity: 1, zIndex: 0, ...options };
    L.Util.setOptions(layer, options);
    rootByLayer.set(layer, emptyNode());
    areasByLayer.set(
      layer,
      /* alloc */
      /* @__PURE__ */ new Map()
    );
    rasterTilesByLayer.set(
      layer,
      /* alloc */
      /* @__PURE__ */ new Map()
    );
    loadingTilesByLayer.set(layer, 0);
    addedByLayer.set(layer, Promise.withResolvers());
    urlByLayer.set(
      layer,
      /* alloc */
      new URL(options.url, document.baseURI).href
    );
    directoriesByLayer.set(
      layer,
      /* alloc */
      /* @__PURE__ */ new Map()
    );
    readyByLayer.set(layer, Promise.resolve(layer.options.archive || layer).then(readyRaster.bind(null, layer)).catch(reportError2.bind(null, layer)));
  }

  // src/globals/renderEmpty.js
  var renderEmpty = Object.freeze([]);

  // src/terrain/clearLayerTerrain.js
  function clearLayerTerrain(layer) {
    if (kindByLayer.get(layer) === "raster") setRasterTerrain(layer, null);
  }

  // src/terrain/onTerrainRemove.js
  function onTerrainRemove(layer, map) {
    const stream = streamTerrainByMap.get(map);
    if (stream?.layer === layer) {
      streamTerrainByMap.delete(map);
      stream.terrainController.abort();
      stream.terrainCache.clear();
      map.fire("terrainchange");
      onRemove3DLayer(layer, map);
      return;
    }
    terrainControllerByLayer.get(layer)?.abort();
    terrainLoadingByLayer.set(layer, false);
    terrainReadyByLayer.set(layer, false);
    map.eachLayer(clearLayerTerrain);
    let tile, l, grid, attribute;
    for (tile of rasterTilesByLayer.get(layer).keys()) removeRasterTile(layer, tile);
    if (terrain3DByMap.get(map) === layer) terrain3DByMap.delete(map);
    for (l of Object.values(map._layers)) {
      conformModelToTerrain(l, null);
      setTerrainHeight(l);
    }
    map.fire("terrainchange");
    terrainTilesByLayer.get(layer).clear();
    terrainOriginElevationByLayer.set(layer, 0);
    terrainPromiseByLayer.set(layer, null);
    if (rasterProgramByLayer.get(layer)) {
      rasterProgramByLayer.get(layer).pipelineCache.clear();
    }
    rasterProgramByLayer.set(layer, null);
    if (demByLayer.get(layer)) destroyTexture(layer, demByLayer.get(layer).texture);
    demByLayer.set(layer, null);
    for (grid of terrainGridsByLayer.get(layer)?.values() || renderEmpty) {
      for (attribute of Object.values(grid)) destroyTexture(layer, attribute.buffer);
    }
    terrainGridsByLayer.set(layer, null);
    bridgesByLayer.set(layer, null);
    disposeMesh(layer, bridgeMeshByLayer.get(layer));
    bridgeMeshByLayer.set(layer, null);
    onRemove3DLayer(layer, map);
  }

  // src/terrain/initTerrain.js
  function initTerrain(layer, options) {
    if (options.getTile !== void 0 && typeof options.getTile !== "function") {
      throw (
        /* alloc */
        new Error("Streamed terrain requires a getTile function")
      );
    }
    const terrainSource = options.url;
    const layerOptions = (
      /* alloc */
      { ...options }
    );
    delete layerOptions.url;
    init3D(layer, layerOptions);
    terrainSourceByLayer.set(layer, terrainSource);
    terrainTilesByLayer.set(
      layer,
      /* alloc */
      /* @__PURE__ */ new Map()
    );
    rasterTilesByLayer.set(
      layer,
      /* alloc */
      /* @__PURE__ */ new Map()
    );
    terrainReadyByLayer.set(layer, false);
    if (options.getTile) streamTerrainByLayer.set(layer, true);
    kindByLayer.set(layer, "terrain");
  }

  // src/traffic/initTraffic.js
  init_L();

  // src/globals/speed.js
  var speed = 8;

  // src/globals/trafficEmptyOptions.js
  var trafficEmptyOptions = Object.freeze({});

  // src/globals/paints.js
  var paints = [
    [0.86, 0.86, 0.88],
    [0.1, 0.1, 0.12],
    [0.5, 0.53, 0.57],
    [0.65, 0.1, 0.08],
    [0.12, 0.25, 0.55],
    [0.85, 0.7, 0.15]
  ];

  // src/vehicles/bicycleModel.js
  function bicycleModel(index) {
    const paint = paints[index % paints.length];
    return (
      /* alloc */
      [
        /* alloc */
        [box(-0.045, 0.045, -0.85, -0.25), 0.02, 0.62, dark],
        /* alloc */
        [box(-0.045, 0.045, 0.25, 0.85), 0.02, 0.62, dark],
        /* alloc */
        [box(-0.06, 0.06, -0.5, 0.5), 0.4, 0.65, paint],
        /* alloc */
        [box(-0.32, 0.32, -0.58, -0.5), 0.95, 1.02, dark],
        /* alloc */
        [box(-0.1, 0.1, 0.15, 0.4), 0.85, 0.92, dark],
        /* alloc */
        [box(-0.18, 0.18, -0.12, 0.28), 1, 1.5, paint],
        /* alloc */
        [box(-0.11, 0.11, -0.22, 0), 1.5, 1.72, skin],
        /* alloc */
        [box(-0.13, 0.13, -0.23, 0.01), 1.72, 1.8, paint],
        /* alloc */
        [box(-0.25, -0.15, -0.5, -0.05), 1, 1.25, skin],
        /* alloc */
        [box(0.15, 0.25, -0.5, -0.05), 1, 1.25, skin],
        /* alloc */
        [box(-0.2, -0.08, 0, 0.32), 0.3, 1, trousers],
        /* alloc */
        [box(0.08, 0.2, -0.25, 0.07), 0.3, 1, trousers]
      ]
    );
  }

  // src/vehicles/pedestrianModel.js
  function pedestrianModel(index) {
    const model = parts.body.slice();
    model[1] = /* alloc */
    [model[1][0], model[1][1], model[1][2], paints[index % paints.length]];
    model.push(
      /* alloc */
      [box(-0.16, -0.02, -0.07, 0.07), 0.08, 0.9, trousers],
      /* alloc */
      [box(0.02, 0.16, -0.07, 0.07), 0.08, 0.9, trousers],
      /* alloc */
      [box(-0.3, -0.2, -0.05, 0.05), 0.76, 1.42, skin],
      /* alloc */
      [box(0.2, 0.3, -0.05, 0.05), 0.76, 1.42, skin]
    );
    return model;
  }

  // src/traffic/routeColor.js
  function routeColor(properties) {
    const color = properties?.route_color;
    if (!/^[\da-f]{6}$/i.test(color)) return (
      /* alloc */
      [0.1, 0.55, 0.65]
    );
    const value = Number.parseInt(color, 16);
    return (
      /* alloc */
      [(value >> 16 & 255) / 255, (value >> 8 & 255) / 255, (value & 255) / 255]
    );
  }

  // src/globals/glass.js
  var glass = [0.12, 0.15, 0.18];

  // src/globals/white.js
  var white = [0.92, 0.93, 0.92];

  // src/globals/tyre.js
  var tyre = [0.05, 0.05, 0.05];

  // src/globals/headlight.js
  var headlight = [1.9, 1.85, 1.7];

  // src/globals/taillight.js
  var taillight = [1.7, 0.06, 0.05];

  // src/vehicles/buildCarriage.js
  function carriage(center, length, color) {
    const front = center - length / 2, rear = center + length / 2;
    return (
      /* alloc */
      [
        /* alloc */
        [box(-1.25, 1.25, front, rear), 0.45, 1.25, color],
        /* alloc */
        [box(-1.2, 1.2, front + 0.15, rear - 0.15), 1.25, 2.65, glass],
        /* alloc */
        [box(-1.25, 1.25, front, rear), 2.65, 3.1, white],
        /* alloc */
        [box(-1.15, -0.85, front + 1, front + 2), 0, 0.7, tyre],
        /* alloc */
        [box(0.85, 1.15, rear - 2, rear - 1), 0, 0.7, tyre],
        /* alloc */
        [box(-0.9, 0.9, front - 0.03, front), 0.8, 1.05, headlight],
        /* alloc */
        [box(-0.9, 0.9, rear, rear + 0.03), 0.8, 1.05, taillight]
      ]
    );
  }

  // src/vehicles/busModel.js
  function busModel(index, properties) {
    return carriage(0, 12, routeColor(properties));
  }

  // src/vehicles/tramModel.js
  function tramModel(index, properties) {
    const color = routeColor(properties), parts2 = (
      /* alloc */
      []
    );
    let car;
    for (car = 0; car < 5; car++) parts2.push(...carriage((car - 2) * 6.5, 6, color));
    return parts2;
  }

  // src/vehicles/metroModel.js
  function metroModel(index, properties) {
    const color = routeColor(properties), parts2 = (
      /* alloc */
      []
    );
    let car;
    for (car = 0; car < 5; car++) parts2.push(...carriage((car - 2) * 15, 14, color));
    return parts2;
  }

  // src/vehicles/mirrorVehiclePart.js
  function mirror(x0, x1, z0, z1, ...rest) {
    return (
      /* alloc */
      [
        /* alloc */
        [box(x0, x1, z0, z1), ...rest],
        /* alloc */
        [box(-x1, -x0, z0, z1), ...rest]
      ]
    );
  }

  // src/vehicles/carModel.js
  function carModel(i) {
    const paint = paints[i % paints.length];
    return (
      /* alloc */
      [
        ...mirror(0.7, 0.92, -1.68, -1.02, 0, 0.64, tyre),
        ...mirror(0.7, 0.92, 1.02, 1.68, 0, 0.64, tyre),
        /* alloc */
        [
          /* alloc */
          [
            /* alloc */
            [-0.9, -1.95],
            /* alloc */
            [-0.72, -2.25],
            /* alloc */
            [0.72, -2.25],
            /* alloc */
            [0.9, -1.95],
            /* alloc */
            [0.9, 2.05],
            /* alloc */
            [0.76, 2.25],
            /* alloc */
            [-0.76, 2.25],
            /* alloc */
            [-0.9, 2.05]
          ],
          0.28,
          0.82,
          paint
        ],
        // Greenhouse: the windscreen leans back, the rear window less.
        /* alloc */
        [box(-0.84, 0.84, -0.75, 1.6), 0.82, 1.38, glass, box(-0.7, 0.7, -0.05, 1.3)],
        /* alloc */
        [box(-0.71, 0.71, -0.06, 1.31), 1.38, 1.46, paint],
        ...mirror(0.38, 0.8, -2.3, -2.16, 0.56, 0.76, headlight),
        /* alloc */
        [box(-0.78, 0.78, 2.16, 2.3), 0.6, 0.76, taillight]
      ]
    );
  }

  // src/globals/hull.js
  var hull = [
    [-5.5, 30],
    [5.5, 30],
    [5.5, -20],
    [4, -26],
    [1.5, -30],
    [-1.5, -30],
    [-4, -26],
    [-5.5, -20]
  ];

  // src/vehicles/boatBenches.js
  function boatBenches() {
    const benches = (
      /* alloc */
      []
    );
    let i;
    for (i = 0; i < 12; i++) benches.push(...mirror(
      0.5,
      3.8,
      -12 + i * 3,
      -11.3 + i * 3,
      3.9,
      4.4,
      /* alloc */
      [0.62, 0.1, 0.1]
    ));
    return benches;
  }

  // src/vehicles/boatModel.js
  function boatModel() {
    return (
      /* alloc */
      [
        /* alloc */
        [
          hull,
          0,
          0.8,
          /* alloc */
          [0.1, 0.16, 0.26]
        ],
        /* alloc */
        [hull, 0.8, 1.4, white],
        /* alloc */
        [box(-5, 5, -18, 26), 1.4, 3.7, glass, box(-4.6, 4.6, -17.4, 25.6)],
        ...mirror(
          4.64,
          4.74,
          -17,
          25,
          3.25,
          3.45,
          /* alloc */
          [1.6, 1.25, 0.8]
        ),
        /* alloc */
        [box(-4.8, 4.8, -17.8, 25.8), 3.7, 3.9, white],
        ...boatBenches(),
        ...mirror(4.65, 4.8, -13.6, 25.8, 3.9, 4.8, white),
        /* alloc */
        [box(-4.8, 4.8, 25.65, 25.8), 3.9, 4.8, white],
        /* alloc */
        [box(-2.2, 2.2, -17.6, -14), 3.9, 4.7, white],
        /* alloc */
        [box(-2.2, 2.2, -17.6, -14), 4.7, 5.5, glass],
        /* alloc */
        [box(-2.5, 2.5, -18, -13.6), 5.5, 5.7, white],
        /* alloc */
        [
          box(-2.45, -2.2, -16.2, -15.8),
          5,
          5.3,
          /* alloc */
          [2, 0.15, 0.1]
        ],
        /* alloc */
        [
          box(2.2, 2.45, -16.2, -15.8),
          5,
          5.3,
          /* alloc */
          [0.1, 2, 0.4]
        ],
        /* alloc */
        [box(-0.1, 0.1, -15.9, -15.7), 5.7, 6.6, white],
        /* alloc */
        [
          box(-0.15, 0.15, -15.95, -15.65),
          6.6,
          6.8,
          /* alloc */
          [2, 2, 1.9]
        ]
      ]
    );
  }

  // src/globals/vehicles.js
  var vehicles = {
    bicycle: {
      side: 0.4,
      model: bicycleModel
    },
    pedestrian: {
      side: 0.3,
      model: pedestrianModel
    },
    bus: {
      side: 1.5,
      model: busModel
    },
    tram: {
      side: 0,
      model: tramModel
    },
    metro: {
      side: 0,
      model: metroModel
    },
    car: {
      side: 1.8,
      model: carModel,
      lights: [{
        position: [0, 1.2, -6],
        radius: 10,
        color: [1, 0.94, 0.82],
        flux: 800
      }]
    },
    // Panoramic river cruiser, about 60 × 11 m: glass saloon, open upper deck with benches, wheelhouse forward.
    boat: {
      side: 0,
      model: boatModel,
      lights: [{
        position: [0, 8, 4],
        radius: 30,
        color: [1, 0.8, 0.55],
        flux: 2e4
      }]
    }
  };

  // src/globals/trafficShader.js
  var trafficShader = (
    /* wgsl */
    `
  struct Params { seconds: f32, side: f32, vertices: u32, total: u32 }
  struct Vehicle { start: u32, count: u32, base: f32, speed: f32 }
  @group(0) @binding(0) var<uniform> params: Params;
  @group(0) @binding(1) var<storage, read> model: array<f32>;
  @group(0) @binding(2) var<storage, read> points: array<vec4f>;
  @group(0) @binding(3) var<storage, read> vehicles: array<Vehicle>;
  @group(0) @binding(4) var<storage, read_write> position: array<f32>;
  @group(0) @binding(5) var<storage, read_write> normal: array<f32>;
  var<workgroup> center: vec3f;
  var<workgroup> heading: vec2f;
  @compute @workgroup_size(64)
  fn main(@builtin(workgroup_id) group: vec3u, @builtin(local_invocation_index) thread: u32) {
    let vehicleIndex = group.x;
    if (thread == 0u) {
      let vehicle = vehicles[vehicleIndex];
      let last = vehicle.start + vehicle.count - 1u;
      let length = points[last].w;
      var s = vehicle.base + params.seconds * vehicle.speed;
      s -= length * floor(s / length);
      var i = vehicle.start + 1u;
      var end = last;
      while (i < end) {
        let middle = i + (end - i) / 2u;
        if (points[middle].w < s) { i = middle + 1u; }
        else { end = middle; }
      }
      let a = points[i - 1u];
      let b = points[i];
      let d = select(b.w - a.w, 1.0, b.w == a.w);
      let t = (s - a.w) / d;
      heading = (b.xy - a.xy) / d;
      center = vec3f(a.x + (b.x - a.x) * t - heading.y * params.side,
        a.z + (b.z - a.z) * t, a.y + (b.y - a.y) * t + heading.x * params.side);
    }
    workgroupBarrier();
    for (var vertex = thread; vertex < params.vertices; vertex += 64u) {
      let k = vertex * 3u;
      let n = params.vertices * 3u + k;
      let o = (vehicleIndex * params.vertices + vertex) * 3u;
      position[o] = center.x - model[k] * heading.y - model[k + 2u] * heading.x;
      position[o + 1u] = center.y + model[k + 1u];
      position[o + 2u] = center.z + model[k] * heading.x - model[k + 2u] * heading.y;
      normal[o] = -model[n] * heading.y - model[n + 2u] * heading.x;
      normal[o + 1u] = model[n + 1u];
      normal[o + 2u] = model[n] * heading.x - model[n + 2u] * heading.y;
    }
  }`
  );

  // src/traffic/trafficTooltip.js
  function tooltip({ properties: p }) {
    const content = document.createElement("div");
    content.style.whiteSpace = "pre-line";
    let text = p.name ? String(p.name) : "";
    if (p.departure) text += `${text ? "\n" : ""}Departure ${p.departure} ${p.timetable.timeZone}`;
    if (p.description) text += `${text ? "\n" : ""}${p.description}`;
    content.textContent = text;
    return content;
  }

  // src/traffic/startTraffic.js
  function startTraffic(state) {
    state.layer._map.off("simulationtimechange layerremove", state.update).on("simulationtimechange layerremove", state.update);
    state.layer._map.off("terrainchange", state.terrain).on("terrainchange", state.terrain);
    underEntry(state.layer, state.status);
    state.update();
  }

  // src/traffic/addTraffic.js
  function addTraffic(state) {
    trafficByLayer.set(state.layer, state);
    if (state.ready) startTraffic(state);
  }

  // src/traffic/disposeTrafficObject.js
  function disposeTrafficObject(state, object) {
    if (!object) return;
    if (highlightedFeatureByLayer.get(state.layer)?.mesh === object) {
      setHighlight(state.layer, null);
      hoveredFeatureByLayer.set(state.layer, null);
      showFeature(state.layer, null);
    }
    ;
    disposeMesh(state.layer, object);
  }

  // src/traffic/destroyTrafficGpu.js
  function destroyTrafficGpu(state) {
    state.gpu?.params?.destroy();
    state.gpu?.template?.destroy();
    state.gpu?.points?.destroy();
    state.gpu?.vehicles?.destroy();
    state.gpu = null;
  }

  // src/traffic/removeTraffic.js
  function removeTraffic(state) {
    state.request?.abort();
    cancelAnimationFrame(state.frame);
    state.frame = void 0;
    state.layer._map.off("simulationtimechange layerremove", state.update).off("terrainchange", state.terrain);
    disposeTrafficObject(state, state.mesh);
    disposeTrafficObject(state, state.route);
    state.mesh = state.route = null;
    trafficByLayer.delete(state.layer);
    destroyTrafficGpu(state);
    state.lanes.length = 0;
    state.trips.length = 0;
    state.tripsKey = state.loaded = null;
  }

  // src/traffic/readyTraffic.js
  function readyTraffic(state) {
    state.ready = true;
    if (state.layer._map) startTraffic(state);
  }

  // src/traffic/trafficNow.js
  function trafficNow(state) {
    const control = timeControlByMap.get(state.layer._map);
    const live = control ? control.live : true;
    return (
      /* alloc */
      {
        live,
        time: live ? (
          /* alloc */
          /* @__PURE__ */ new Date()
        ) : control.time
      }
    );
  }

  // src/traffic/vehicleOffsets.js
  function vehicleOffsets(length, flow, velocity = speed) {
    const count = Math.round(length * flow / 3600 / velocity);
    const offsets = Array.from(
      /* alloc */
      { length: count }
    );
    let i;
    for (i = 0; i < offsets.length; i++) offsets[i] = (i + 0.5) * length / count;
    return offsets;
  }

  // src/globals/trafficClocks.js
  var trafficClocks = /* @__PURE__ */ new Map();

  // src/traffic/clockMinutes.js
  function clockMinutes(clockTime) {
    const parts2 = clockTime.split(":");
    return Number(parts2[0]) * 60 + Number(parts2[1]);
  }

  // src/traffic/compareDepartures.js
  function compareDepartures(a, b) {
    return a - b;
  }

  // src/traffic/scheduledTrips.js
  function scheduledTrips(date, { timeZone, duration, services }) {
    const time = date instanceof Date ? date : (
      /* alloc */
      new Date(date)
    );
    if (!Number.isFinite(time.getTime())) throw (
      /* alloc */
      new Error("Invalid date")
    );
    let clock = trafficClocks.get(timeZone);
    if (!clock) {
      clock = /* alloc */
      new Intl.DateTimeFormat(
        "en-GB",
        /* alloc */
        {
          timeZone,
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hourCycle: "h23"
        }
      );
      if (trafficClocks.size >= 32) {
        trafficClocks.delete(trafficClocks.keys().next().value);
      }
      trafficClocks.set(timeZone, clock);
    }
    const parts2 = (
      /* alloc */
      {}
    );
    let part, from, to, every, months, weekdays, departure;
    for (part of clock.formatToParts(time)) {
      if (part.type !== "literal") parts2[part.type] = Number(part.value);
    }
    const minute = parts2.hour * 60 + parts2.minute + (parts2.second + time.getUTCMilliseconds() / 1e3) / 60;
    const weekday = ((Math.floor(Date.UTC(parts2.year, parts2.month - 1, parts2.day) / 864e5) + 4) % 7 + 7) % 7;
    const departures = (
      /* alloc */
      []
    );
    for ({ from, to, every = Infinity, months, weekdays } of services) {
      if (months?.includes(parts2.month) === false || weekdays?.includes(weekday) === false) continue;
      for (departure = clockMinutes(from); departure <= clockMinutes(to); departure += every) departures.push(departure);
    }
    departures.sort(compareDepartures);
    const trips = (
      /* alloc */
      []
    );
    for (departure of departures) {
      if (minute >= departure && minute < departure + duration) trips.push(
        /* alloc */
        {
          id: `${parts2.year}-${parts2.month}-${parts2.day}-${departure}`,
          departure: `${String(Math.floor(departure / 60)).padStart(2, "0")}:${String(departure % 60).padStart(2, "0")}`,
          progress: (minute - departure) / duration
        }
      );
    }
    return trips;
  }

  // src/traffic/tripsAt.js
  function tripsAt(time, lanes, velocity) {
    const trips = (
      /* alloc */
      []
    );
    let l, lane, timetable, flow, trip, travelled, offsets, k;
    for (l = 0; l < lanes.length; l++) {
      lane = lanes[l];
      ({ timetable, flow = 0 } = lane.properties);
      if (!lane.length) continue;
      if (timetable) {
        for (trip of scheduledTrips(time, timetable)) trips.push(
          /* alloc */
          {
            id: `${l}-${trip.id}`,
            lane,
            distance: trip.progress * lane.length,
            speed: lane.length / (timetable.duration * 60),
            properties: (
              /* alloc */
              { ...lane.properties, departure: trip.departure }
            )
          }
        );
      } else {
        travelled = time / 1e3 * velocity;
        offsets = lane.offsets ||= vehicleOffsets(lane.length, flow, velocity);
        for (k = 0; k < offsets.length; k++) trips.push(
          /* alloc */
          {
            id: `${l}-${k}`,
            lane,
            distance: (offsets[k] + travelled) % lane.length,
            speed: velocity,
            properties: lane.properties
          }
        );
      }
    }
    return trips;
  }

  // src/traffic/failTraffic.js
  function failTraffic(state, error) {
    state.error = error;
    state.status.textContent = `${state.vehicle}: Error: ${error.message}`;
    state.status.setAttribute("role", "alert");
    console.error("Traffic layer", error);
  }

  // src/globals/trafficRouteMaterial.js
  var trafficRouteMaterial = Object.freeze({ unlit: true });

  // src/geometry/appendRouteDash.js
  function appendRouteDash(position, normal, color, a, b, dx, dz, x, z, start2, end, r, g, blue) {
    const px = a[0] + dx * start2, pz = a[1] + dz * start2;
    const py = a[2] + (b[2] - a[2]) * start2 + 0.4;
    const qx = a[0] + dx * end, qz = a[1] + dz * end;
    const qy = a[2] + (b[2] - a[2]) * end + 0.4;
    let vertex;
    for (vertex = 0; vertex < 6; vertex++) {
      if (vertex === 0 || vertex === 3) position.push(px - x, py, pz - z);
      else if (vertex === 1) position.push(px + x, py, pz + z);
      else if (vertex === 5) position.push(qx - x, qy, qz - z);
      else position.push(qx + x, qy, qz + z);
      normal.push(0, 1, 0);
      color.push(r, g, blue);
    }
  }

  // src/geometry/appendRouteSegment.js
  function appendRouteSegment(position, normal, color, points, lengths, i, r, g, blue) {
    const a = points[i - 1], b = points[i];
    const dx = b[0] - a[0], dz = b[1] - a[1], length = lengths[i] - lengths[i - 1];
    if (!length) return;
    const x = -dz / length * 2.5, z = dx / length * 2.5;
    let distance, start2, end;
    for (distance = Math.floor(lengths[i - 1] / 30) * 30; distance < lengths[i]; distance += 30) {
      start2 = Math.max(0, (distance - lengths[i - 1]) / length);
      end = Math.min(1, (distance + 18 - lengths[i - 1]) / length);
      if (end <= start2) continue;
      appendRouteDash(position, normal, color, a, b, dx, dz, x, z, start2, end, r, g, blue);
    }
  }

  // src/geometry/routeGeometry.js
  function routeGeometry(lanes) {
    const position = (
      /* alloc */
      []
    );
    const normal = (
      /* alloc */
      []
    );
    const color = (
      /* alloc */
      []
    );
    let points, lengths, properties, raw, rgb2, r, g, blue, i;
    for ({ points, lengths, properties } of lanes) {
      raw = properties?.route_color;
      rgb2 = /^[\da-f]{6}$/i.test(raw) ? Number.parseInt(raw, 16) : null;
      r = rgb2 === null ? 0.08 : (rgb2 >> 16 & 255) / 255;
      g = rgb2 === null ? 0.7 : (rgb2 >> 8 & 255) / 255;
      blue = rgb2 === null ? 0.85 : (rgb2 & 255) / 255;
      for (i = 1; i < points.length; i++) {
        appendRouteSegment(position, normal, color, points, lengths, i, r, g, blue);
      }
    }
    return (
      /* alloc */
      { position, normal, color }
    );
  }

  // src/traffic/createTrafficMesh.js
  function createTrafficMesh(state, data, featureFaces, material, usage = 0) {
    const result = createMesh(state.layer, data, material, usage);
    result.extras.featureFaces = featureFaces;
    return result;
  }

  // src/traffic/drawTrafficRoute.js
  function drawTrafficRoute(state) {
    state.route = createTrafficMesh(
      state,
      routeGeometry(state.lanes),
      /* alloc */
      [],
      trafficRouteMaterial
    );
  }

  // src/traffic/trafficBounds.js
  function trafficBounds2(state) {
    let radius = 20, height = 5;
    let i, lane, x, z, y;
    for (i = 0; i < state.template.position.length; i += 3) {
      radius = Math.max(radius, Math.hypot(state.template.position[i], state.template.position[i + 2]) + Math.abs(state.side));
      height = Math.max(height, state.template.position[i + 1]);
    }
    const data = (
      /* alloc */
      []
    );
    for (lane of state.lanes) {
      for ([x, z, y] of lane.points) data.push(x - radius, y, z - radius, x + radius, y + height, z + radius);
    }
    const extent = (
      /* alloc */
      {
        attributes: (
          /* alloc */
          {
            position: (
              /* alloc */
              { data }
            )
          }
        )
      }
    );
    computeBounds(extent);
    state.mesh.geometry.bounds = extent.bounds;
  }

  // src/traffic/rebuildTrafficMesh.js
  function rebuildTrafficMesh(state) {
    const { trips, model, vertices } = state;
    disposeTrafficObject(state, state.mesh);
    state.mesh = null;
    if (!trips.length) return;
    const color = (
      /* alloc */
      []
    );
    const featureFaces = (
      /* alloc */
      []
    );
    let i, trip, component;
    for (i = 0; i < trips.length; i++) {
      trip = trips[i];
      for (component of build(model(i, trip.properties)).color) color.push(component);
      featureFaces.push(
        /* alloc */
        {
          id: trip.id,
          properties: trip.properties,
          faceStart: i * vertices / 3,
          faceEnd: (i + 1) * vertices / 3,
          vertexStart: i * vertices,
          vertexEnd: (i + 1) * vertices
        }
      );
    }
    const count = color.length / 3;
    state.mesh = createTrafficMesh(
      state,
      /* alloc */
      {
        position: (
          /* alloc */
          new Array(color.length).fill(0)
        ),
        normal: (
          /* alloc */
          new Array(color.length).fill(0)
        ),
        color
      },
      featureFaces,
      trafficEmptyOptions,
      GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_SRC
    );
    state.mesh.geometry.drawRange.count = count;
    state.mesh.extras.dynamicLights = true;
    trafficBounds2(state);
  }

  // src/traffic/trafficStorage.js
  function trafficStorage(device, data) {
    const buffer = device.createBuffer(
      /* alloc */
      { size: Math.max(16, data.byteLength), usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST }
    );
    device.queue.writeBuffer(buffer, 0, data);
    return buffer;
  }

  // src/traffic/uploadTrafficLanes.js
  function uploadTrafficLanes(state, device) {
    let lane, i, point, count = 0;
    for (lane of state.lanes) count += lane.points.length;
    const data = (
      /* alloc */
      new Float32Array(count * 4)
    );
    let offset = 0;
    for (lane of state.lanes) {
      lane.start = offset / 4;
      for (i = 0; i < lane.points.length; i++) {
        point = lane.points[i];
        data[offset++] = point[0];
        data[offset++] = point[1];
        data[offset++] = point[2];
        data[offset++] = lane.lengths[i];
      }
    }
    state.gpu.points?.destroy();
    state.gpu.points = trafficStorage(device, data);
    state.lanesDirty = false;
  }

  // src/traffic/rebaseTraffic.js
  function rebaseTraffic(state) {
    const { device } = rendererByLayer.get(state.layer);
    if (state.gpu?.device !== device) {
      destroyTrafficGpu(state);
      const template = (
        /* alloc */
        new Float32Array(
          state.template.position.length + state.template.normal.length
        )
      );
      template.set(state.template.position);
      template.set(state.template.normal, state.template.position.length);
      state.gpu = /* alloc */
      {
        device,
        pipeline: device.createComputePipeline(
          /* alloc */
          {
            layout: "auto",
            compute: (
              /* alloc */
              {
                module: device.createShaderModule(
                  /* alloc */
                  { code: state.shader }
                ),
                entryPoint: "main"
              }
            )
          }
        ),
        params: device.createBuffer(
          /* alloc */
          { size: 16, usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST }
        ),
        template: trafficStorage(device, template)
      };
      state.lanesDirty = true;
    }
    let i, trip, binding;
    if (state.lanesDirty) uploadTrafficLanes(state, device);
    const data = (
      /* alloc */
      new Float32Array(state.trips.length * 4)
    );
    const index = (
      /* alloc */
      new Uint32Array(data.buffer)
    );
    for (i = 0; i < state.trips.length; i++) {
      trip = state.trips[i];
      index[i * 4] = trip.lane.start;
      index[i * 4 + 1] = trip.lane.points.length;
      data[i * 4 + 2] = trip.distance;
      data[i * 4 + 3] = trip.speed;
      state.mesh.extras.featureFaces[i].properties = trip.properties;
    }
    if (state.gpu.vehicles?.size >= data.byteLength) device.queue.writeBuffer(state.gpu.vehicles, 0, data);
    else {
      state.gpu.vehicles?.destroy();
      state.gpu.vehicles = trafficStorage(device, data);
    }
    const { position, normal } = state.mesh.geometry.attributes;
    const entries = (
      /* alloc */
      []
    );
    let buffer;
    for (binding = 0; binding < 6; binding++) {
      buffer = binding === 0 ? state.gpu.params : binding === 1 ? state.gpu.template : binding === 2 ? state.gpu.points : binding === 3 ? state.gpu.vehicles : binding === 4 ? position.buffer : normal.buffer;
      entries.push(
        /* alloc */
        {
          binding,
          resource: (
            /* alloc */
            { buffer }
          )
        }
      );
    }
    state.gpu.bindGroup = device.createBindGroup(
      /* alloc */
      {
        layout: state.gpu.pipeline.getBindGroupLayout(0),
        entries
      }
    );
  }

  // src/traffic/trafficStatusText.js
  function trafficStatusText(state, valid) {
    if (!valid) return `${state.vehicle}: select a valid simulation date`;
    if (!state.loaded) return `${state.vehicle}: loading\u2026`;
    return `${state.trips.length} ${state.vehicle === "boat" ? "boats" : state.vehicle}`;
  }

  // src/traffic/refreshTrafficTrips.js
  function refreshTrafficTrips(state, time, ms, valid) {
    let text;
    try {
      if (valid) state.trips = tripsAt(time, state.lanes, state.velocity);
      else state.trips.length = 0;
      text = trafficStatusText(state, valid);
    } catch (error) {
      failTraffic(state, error);
      return;
    }
    state.rebasedAt = ms;
    state.nextCheck = ms + 1e3;
    let key = "", trip;
    for (trip of state.trips) key += `${key ? "," : ""}${trip.id}`;
    const routeNeeded = state.outline && !state.route && state.lanes.length;
    const changed = key !== state.tripsKey || Boolean(routeNeeded);
    if (routeNeeded) drawTrafficRoute(state);
    if (key !== state.tripsKey) {
      rebuildTrafficMesh(state);
      state.tripsKey = key;
    }
    if (state.mesh) rebaseTraffic(state);
    if (!state.error) {
      if (state.status.textContent !== text) state.status.textContent = text;
      state.status.removeAttribute("role");
    }
    return changed;
  }

  // src/traffic/moveTraffic.js
  function moveTraffic(state, seconds) {
    const { device } = state.gpu;
    state.paramFloats[0] = state.elapsed = seconds;
    state.paramFloats[1] = state.side;
    state.paramInts[2] = state.vertices;
    state.paramInts[3] = state.trips.length * state.vertices;
    device.queue.writeBuffer(state.gpu.params, 0, state.params);
    const encoder = device.createCommandEncoder(), pass = encoder.beginComputePass();
    pass.setPipeline(state.gpu.pipeline);
    pass.setBindGroup(0, state.gpu.bindGroup);
    pass.dispatchWorkgroups(state.trips.length);
    pass.end();
    device.queue.submit(
      /* alloc */
      [encoder.finish()]
    );
    state.stale = true;
  }

  // src/traffic/updateTrafficLights.js
  function updateTrafficLights(state) {
    state.litAt = performance.now();
    const lights = (
      /* alloc */
      []
    );
    const target = state.position ||= /* alloc */
    {};
    let trip, x, y, z, dx, dz, lx, ly, lz, light;
    for (trip of state.trips) {
      ({ x, y, z, dx, dz } = locateTraffic(state, trip, target));
      for (light of state.lights) {
        [lx, ly, lz] = light.position;
        lights.push(
          /* alloc */
          {
            ...light,
            position: (
              /* alloc */
              [x - lx * dz - lz * dx, y + ly, z + lx * dx - lz * dz]
            )
          }
        );
      }
    }
    state.mesh.extras.lights = lights;
  }

  // src/traffic/updateTrafficPose.js
  function updateTrafficPose(state, ms, live) {
    if (!state.mesh) return;
    moveTraffic(state, (ms - state.rebasedAt) / 1e3);
    if (state.lights && (!live || !(performance.now() - state.litAt < 100))) updateTrafficLights(state);
  }

  // src/traffic/tickTraffic.js
  function tickTraffic(state) {
    state.frame = void 0;
    if (!state.ready || !state.layer._map) return;
    if (!rendererByLayer.get(state.layer)) {
      state.frame = requestAnimationFrame(state.tick);
      return;
    }
    if (state.mesh && !(state.mesh.geometry.attributes.position.buffer.usage & GPUBufferUsage.STORAGE)) {
      state.tripsKey = null;
      state.nextCheck = -Infinity;
    }
    const { live, time } = trafficNow(state), ms = time?.getTime(), valid = Number.isFinite(ms);
    let changed = false;
    if (!live || !valid || !(ms >= state.rebasedAt && ms < state.nextCheck)) {
      changed = refreshTrafficTrips(state, time, ms, valid);
      if (changed === void 0) return;
    }
    updateTrafficPose(state, ms, live);
    if (state.mesh || changed) update(state.layer);
    if (live && valid) state.frame = requestAnimationFrame(state.tick);
  }

  // src/traffic/fetchTrafficLanes.js
  async function fetchTrafficLanes(state, time, signal) {
    const href = (
      /* alloc */
      new URL(state.url, document.baseURI).href
    );
    if (/\.m?js(?:[?#]|$)/i.test(state.url)) return (await import(href)).default(time, state.layer, signal);
    if (!state.file) {
      const response = await fetch(
        href,
        /* alloc */
        { signal }
      );
      if (!response.ok) throw (
        /* alloc */
        new Error(`HTTP ${response.status}`)
      );
      state.file = await response.json();
    }
    return state.file;
  }

  // src/globals/trafficEmptyList.js
  var trafficEmptyList = Object.freeze([]);

  // src/traffic/featuresToTrafficLanes.js
  function toLanes({ features = trafficEmptyList }) {
    const lanes = (
      /* alloc */
      []
    );
    let geometry, properties, lines, line2, latlngs, lng, lat, i;
    for ({ geometry, properties } of features) {
      if (geometry?.type !== "LineString" && geometry?.type !== "MultiLineString") continue;
      lines = geometry.type === "MultiLineString" ? geometry.coordinates : null;
      for (i = 0; i < (lines ? lines.length : 1); i++) {
        line2 = lines ? lines[i] : geometry.coordinates;
        latlngs = /* alloc */
        [];
        for ([lng, lat] of line2) latlngs.push(
          /* alloc */
          [lat, lng]
        );
        lanes.push(
          /* alloc */
          {
            latlngs,
            properties: properties ?? /* alloc */
            {},
            elevation: properties?.elevation
          }
        );
      }
    }
    return lanes;
  }

  // src/traffic/prepareTraffic.js
  init_radians();
  init_L();

  // src/terrain/readyTerrainOf.js
  function readyTerrainOf(map) {
    const terrain = terrain3DByMap.get(map);
    return terrainReadyByLayer.get(terrain) && terrain;
  }

  // src/traffic/groundTraffic.js
  function groundTraffic(state) {
    const { layer, lanes } = state;
    const terrain = readyTerrainOf(layer._map);
    const base = rootByLayer.get(layer).position[1];
    let lane, i, elevation;
    for (lane of lanes) {
      for (i = 0; i < lane.points.length; i++) {
        elevation = terrain && (lane.elevation ?? mapElevationOf(layer._map, lane.latlngs[i]));
        lane.points[i][2] = Number.isFinite(elevation) && Number.isFinite(base) ? elevation - base : 0;
      }
    }
    state.lanesDirty = true;
    state.nextCheck = -Infinity;
  }

  // src/traffic/prepareTraffic.js
  function prepareTraffic(state) {
    const { layer, lanes } = state;
    const crs = layer._map.options.crs, origin = crs.project(locationByLayer.get(layer));
    const metres = Math.cos(locationByLayer.get(layer).lat * radians);
    let lane, lat, lng, point, i;
    for (lane of lanes) {
      lane.points = /* alloc */
      [];
      for ([lat, lng] of lane.latlngs) {
        point = crs.project(
          /* alloc */
          new L.LatLng(lat, lng)
        );
        lane.points.push(
          /* alloc */
          [(point.x - origin.x) * metres, -(point.y - origin.y) * metres, 0]
        );
      }
      lane.lengths = /* alloc */
      [0];
      for (i = 1; i < lane.points.length; i++) {
        lane.lengths.push(lane.lengths[i - 1] + Math.hypot(lane.points[i][0] - lane.points[i - 1][0], lane.points[i][1] - lane.points[i - 1][1]));
      }
      lane.length = lane.lengths.at(-1);
    }
    groundTraffic(state);
    disposeTrafficObject(state, state.route);
    state.route = null;
    state.tripsKey = null;
  }

  // src/traffic/loadedTrafficLanes.js
  function loadedTrafficLanes(state, signal, data) {
    if (signal.aborted || !state.layer._map) return;
    state.error = null;
    if (data === state.loaded) {
      state.nextCheck = -Infinity;
      if (!state.frame) state.tick();
      return;
    }
    state.loaded = data;
    state.lanes = toLanes(data);
    prepareTraffic(state);
    if (!state.frame) state.tick();
  }

  // src/traffic/failedTrafficLoad.js
  function failedTrafficLoad(state, signal, error) {
    if (!signal.aborted && error.name !== "AbortError") failTraffic(state, error);
  }

  // src/traffic/loadTraffic.js
  function loadTraffic(state) {
    const { time } = trafficNow(state);
    if (!Number.isFinite(time?.getTime())) return;
    state.request?.abort();
    const { signal } = state.request = /* alloc */
    new AbortController();
    fetchTrafficLanes(state, time, signal).then(
      loadedTrafficLanes.bind(null, state, signal),
      failedTrafficLoad.bind(null, state, signal)
    );
  }

  // src/traffic/updateTraffic.js
  function updateTraffic(state, event) {
    if (event?.layer && !controlByLayer.get(event.layer)?.time) return;
    cancelAnimationFrame(state.frame);
    loadTraffic(state);
    state.tick();
  }

  // src/traffic/updateTrafficTerrain.js
  function updateTrafficTerrain(state) {
    if (!state.lanes.length) return;
    groundTraffic(state);
    disposeTrafficObject(state, state.route);
    state.route = null;
    if (state.mesh) trafficBounds2(state);
    if (!state.frame) state.tick();
  }

  // src/traffic/initTraffic.js
  function initTraffic(layer, { url, vehicle = "car", side, outline, speed: velocity = speed, ...options } = trafficEmptyOptions) {
    const { model, lights, side: defaultSide } = vehicles[vehicle];
    side ??= defaultSide;
    init3D(
      layer,
      /* alloc */
      {
        tooltip,
        nightLight: Boolean(lights),
        ...options
      }
    );
    const status = L.DomUtil.create("small", "traffic-status");
    status.style.cssText = "flex:0 1 auto;padding:1px 5px;border-radius:3px;background:#00000008;color:#555;";
    status.title = vehicle;
    status.textContent = `${vehicle}: loading\u2026`;
    const template = build(model(0)), stride = template.position.length, vertices = stride / 3;
    const params = (
      /* alloc */
      new ArrayBuffer(16)
    );
    const paramFloats = (
      /* alloc */
      new Float32Array(params)
    );
    const paramInts = (
      /* alloc */
      new Uint32Array(params)
    );
    const state = (
      /* alloc */
      {
        layer,
        url,
        model,
        lights,
        side,
        outline,
        velocity,
        vehicle,
        status,
        template,
        stride,
        vertices,
        params,
        paramFloats,
        paramInts,
        ready: false,
        frame: void 0,
        request: void 0,
        lanes: (
          /* alloc */
          []
        ),
        tripsKey: void 0,
        mesh: void 0,
        route: void 0,
        litAt: -Infinity,
        trips: (
          /* alloc */
          []
        ),
        rebasedAt: 0,
        nextCheck: -Infinity,
        elapsed: 0,
        gpu: null,
        lanesDirty: true,
        stale: false,
        loaded: void 0,
        file: void 0
      }
    );
    state.shader = trafficShader;
    state.tick = tickTraffic.bind(null, state);
    state.update = updateTraffic.bind(null, state);
    state.terrain = updateTrafficTerrain.bind(null, state);
    trafficByLayer.set(layer, state);
    layer.on("ready", readyTraffic.bind(null, state));
    layer.on("add", addTraffic.bind(null, state));
    layer.on("remove", removeTraffic.bind(null, state));
  }

  // src/cog/getCogHeader.js
  function getCogHeader(source) {
    return source.header;
  }

  // src/workers/getCogInWorker.js
  function getCogInWorker(context, z, x, y, signal) {
    return runSourceWorker(
      context.layer._map || workerMapByLayer.get(context.layer),
      context.workerUrl,
      /* alloc */
      { type: "cog", url: context.url, asset: context.asset, z, x, y },
      signal
    );
  }

  // src/workers/openCogInWorker.js
  async function openCogInWorker(layer, options) {
    const context = (
      /* alloc */
      {
        layer,
        url: (
          /* alloc */
          new URL(options.url, document.baseURI).href
        ),
        asset: options.asset,
        workerUrl: options.workerUrl
      }
    );
    const header = await getCogInWorker(context);
    return (
      /* alloc */
      {
        getHeader: getCogHeader.bind(
          null,
          /* alloc */
          { header }
        ),
        getZxy: getCogInWorker.bind(null, context)
      }
    );
  }

  // src/cog/initCog.js
  function initCog(layer, options) {
    initRaster(
      layer,
      /* alloc */
      {
        ariaLabel: "COG raster",
        ...options,
        archive: options.archive || openCogInWorker(layer, options)
      }
    );
  }

  // src/scene/initializerFor.js
  function initializerFor(type, options = sceneEmptyOptions) {
    switch (type) {
      case "raster":
        return options.asset !== void 0 || /\.tiff?(?:[?#]|$)/i.test(options.url) ? initCog : initRaster;
      case "terrain":
        return initTerrain;
      case "traffic":
        return initTraffic;
      default:
        return null;
    }
  }

  // src/scene/resolveNextInitialization.js
  function resolveNextInitialization() {
    const task = pendingInitializations.shift();
    task.initialize = initializerFor(task.type, task.settings);
    if (!task.initialize) {
      task.error = /* alloc */
      new Error(`Unknown layer type: ${task.type}`);
    }
    return task;
  }

  // src/scene/initializeLayer.js
  function initializeLayer(task) {
    const { layer, ready } = task;
    if (task.error) {
      reportError(layer, task.error);
      return Promise.reject(task.error);
    }
    try {
      const map = layer._map;
      map?.removeLayer(layer);
      kindByLayer.delete(layer);
      task.initialize(layer, task.settings);
      map?.addLayer(layer);
      return readyByLayer.get(layer) === ready ? layer : readyByLayer.get(layer);
    } catch (error) {
      layer.fire(
        "error",
        /* alloc */
        { error }
      );
      throw error;
    }
  }

  // src/scene/layerInitialize.js
  function layerInitialize(options = sceneEmptyOptions) {
    if (!sceneLayers.has(this)) {
      sceneLayers.add(this);
    }
    if (Object.getPrototypeOf(this) !== L.Layer.prototype || !options?.source) {
      if (layerProto.value.initialize) return layerProto.value.initialize.apply(this, arguments);
      L.Util.setOptions(this, options);
      return;
    }
    const { source: { type = /\.pmtiles(?:[?#]|$)|\.tiff?(?:[?#]|$)/i.test(options.source.url) ? "raster" : "vector", ...source }, ...core } = options;
    const settings = (
      /* alloc */
      { ...source, ...core }
    );
    L.Util.setOptions(this, core);
    typeByLayer.set(this, type);
    if (type === "vector") {
      if (isVectorTileSource(settings)) {
        initVectorTiles(this, settings);
      } else if (settings.data !== void 0 || settings.style !== void 0 && !settings.url || settings.url && !/\.(?:pmtiles|glb|gltf)(?:[?#]|$)/i.test(settings.url)) {
        initializeGeoJSON(this, settings);
      } else {
        init3D(this, settings);
      }
      return;
    }
    kindByLayer.set(this, "pending");
    const task = (
      /* alloc */
      { layer: this, type, settings, ready: null }
    );
    pendingInitializations.push(task);
    loading.value = loading.value.catch(noOperation).then(resolveNextInitialization);
    const ready = loading.value.then(initializeLayer);
    readyByLayer.set(this, ready);
    task.ready = ready;
    ready.catch(noOperation);
  }

  // src/core/removeLayer.js
  init_L();

  // src/scene/removeSceneLayer.js
  function removeSceneLayer(layer, map) {
    switch (kindByLayer.get(layer)) {
      case "3d":
        return onRemove3DLayer(layer, map);
      case "raster":
        return onPMTileRemove(layer, map);
      case "terrain":
        return onTerrainRemove(layer, map);
      case "time":
        return removeTimeLayer.call(layer, map);
    }
  }

  // src/core/removeLayer.js
  function removeLayer2(layer) {
    const id = L.Util.stamp(layer);
    if (!this._layers[id]) return this;
    if (!kindByLayer.get(layer)) return removeLayer.value.call(this, layer);
    if (this._loaded) removeSceneLayer(layer, this);
    delete this._layers[id];
    if (this._loaded) {
      this.fire(
        "layerremove",
        /* alloc */
        { layer }
      );
      layer.fire("remove");
    }
    layer._map = layer._mapToAdd = null;
    return this;
  }

  // src/camera/getPitch.js
  init_mapGetPitch();
  function getPitch() {
    return mapGetPitch(this);
  }

  // src/camera/getBearing.js
  init_mapGetBearing();
  function getBearing() {
    return mapGetBearing(this);
  }

  // src/camera/setPitch.js
  init_mapSetPitch();
  function setPitch(pitch, options) {
    return mapSetPitch(this, pitch, options);
  }

  // src/camera/setBearing.js
  init_mapSetBearing();
  function setBearing(bearing, options) {
    return mapSetBearing(this, bearing, options);
  }

  // src/core/setRotation.js
  function setRotation(rotation) {
    return markerSetRotation(this, rotation);
  }

  // src/core/layerCallInitHooks.js
  init_L();

  // src/core/initializeNativeLayer.js
  init_L();

  // src/weakmaps/closestMethods.js
  var closestMethods = /* @__PURE__ */ new WeakMap();

  // src/weakmaps/boundsMethods.js
  var boundsMethods = /* @__PURE__ */ new WeakMap();

  // src/weakmaps/gridInitializers.js
  var gridInitializers = /* @__PURE__ */ new WeakMap();

  // src/core/closestCameraLayerPoint.js
  function closestCameraLayerPoint(point) {
    projectNativePath(this);
    this._parts = this._rings;
    return closestMethods.get(this).call(this, point);
  }

  // src/core/cameraCircleBounds.js
  function cameraCircleBounds() {
    if (this._map) projectNativePath(this);
    return boundsMethods.get(this).call(this);
  }

  // src/core/initializeGridContainer.js
  function initializeGridContainer() {
    gridInitializers.get(this).call(this);
    this._container.remove();
  }

  // src/globals/pendingGridFades.js
  var pendingGridFades = /* @__PURE__ */ new Map();

  // src/globals/gridFadeFrame.js
  var gridFadeFrame = { value: null };

  // src/animations/cancelGridFade.js
  function cancelGridFade(layer) {
    pendingGridFades.delete(layer);
    fadeFrameByLayer.set(layer, null);
    if (!pendingGridFades.size && gridFadeFrame.value !== null) {
      cancelAnimationFrame(gridFadeFrame.value);
      gridFadeFrame.value = null;
    }
  }

  // src/animations/runGridFades.js
  function runGridFades() {
    gridFadeFrame.value = null;
    const layers = (
      /* alloc */
      [...pendingGridFades]
    );
    let layer, version;
    for ([layer, version] of layers) {
      if (pendingGridFades.get(layer) !== version) continue;
      pendingGridFades.delete(layer);
      fadeFrameByLayer.set(layer, null);
      updateGridOpacity.call(layer);
    }
  }

  // src/animations/scheduleGridFade.js
  function scheduleGridFade(layer) {
    fadeVersionByLayer.set(layer, (fadeVersionByLayer.get(layer) || 0) + 1);
    pendingGridFades.set(layer, fadeVersionByLayer.get(layer));
    if (gridFadeFrame.value === null) gridFadeFrame.value = requestAnimationFrame(runGridFades);
    fadeFrameByLayer.set(layer, gridFadeFrame.value);
  }

  // src/core/updateGridOpacity.js
  function updateGridOpacity() {
    if (!this._map) return;
    const layer = this, now = Date.now();
    let fading = false, prune = false;
    let key, tile;
    for (key in this._tiles) {
      if (!Object.hasOwn(this._tiles, key)) continue;
      tile = this._tiles[key];
      if (!tile.current || !tile.loaded) continue;
      tile._gpuOpacity = this._map._fadeAnimated ? Math.min(1, (now - tile.loaded) / 200) : 1;
      if (tile._gpuOpacity < 1) fading = true;
      else if (!tile.active) {
        this._onOpaqueTile(tile);
        tile.active = true;
        prune = true;
      }
    }
    if (prune && !this._noPrune) this._pruneTiles();
    refreshNativeLayerContract(this);
    cancelGridFade(layer);
    if (fading) scheduleGridFade(layer);
  }

  // src/core/redrawPath.js
  function redrawPath() {
    refreshNativeLayerContract(this);
    return this;
  }

  // src/core/initializeNativeLayer.js
  function initializeNativeLayer() {
    if (this instanceof L.Polyline || this instanceof L.CircleMarker) {
      this.beforeAdd = this._updateBounds = noOperation;
      this.redraw = redrawPath;
      kindByLayer.set(this, "path");
      if (this instanceof L.Polyline) {
        closestMethods.set(this, this.closestLayerPoint);
        this.closestLayerPoint = closestCameraLayerPoint;
      }
      if (this instanceof L.Circle) {
        boundsMethods.set(this, this.getBounds);
        this.getBounds = cameraCircleBounds;
      }
    } else if (this instanceof L.GridLayer) {
      gridInitializers.set(this, this._initContainer);
      this._initContainer = initializeGridContainer;
      this._updateOpacity = updateGridOpacity;
    } else if (this instanceof L.ImageOverlay && !(this instanceof L.VideoOverlay) && !(this instanceof L.SVGOverlay)) {
      kindByLayer.set(this, "image");
      this._reset = refreshNativeLayerContract;
    }
  }

  // src/core/layerCallInitHooks.js
  function layerCallInitHooks() {
    const initialized = this._initHooksCalled;
    if (!L.version.startsWith("2.")) layerProto.value.callInitHooks.call(this);
    if (L.version.startsWith("2.") || !initialized) {
      sceneLayers.add(this);
      initializeNativeLayer.call(this);
    }
  }

  // src/globals/leafletLayer.js
  init_L();
  var leafletLayer = L?.Layer;

  // src/core/constructLayer.js
  function constructLayer(options) {
    const layer = Reflect.construct(
      leafletLayer,
      /* alloc */
      [],
      new.target
    );
    layerInitialize.call(layer, options);
    layer.callInitHooks();
    return layer;
  }

  // src/core/layerAddInitHook.js
  init_L();
  function layerAddInitHook() {
    leafletLayer.addInitHook.apply(this === L.Layer ? leafletLayer : this, arguments);
    return this;
  }

  // src/core/layerMergeOptions.js
  init_L();
  function layerMergeOptions(options) {
    leafletLayer.mergeOptions.call(this === L.Layer ? leafletLayer : this, options);
    return this;
  }

  // src/index.js
  layerProto.value = Object.defineProperties({}, Object.getOwnPropertyDescriptors(leafletLayer.prototype));
  layerProto.value._layerAdd = leafletLayer.prototype._layerAdd;
  layerProto.value.callInitHooks = leafletLayer.prototype.callInitHooks;
  if (L.version.startsWith("2.")) {
    Object.setPrototypeOf(constructLayer, leafletLayer);
    constructLayer.prototype = leafletLayer.prototype;
    constructLayer.initHooks = true;
    constructLayer.addInitHook = layerAddInitHook;
    constructLayer.mergeOptions = layerMergeOptions;
    L.Layer = constructLayer;
    leafletLayer.prototype.constructor = L.Layer;
    leafletLayer.addInitHook(layerCallInitHooks);
  } else {
    leafletLayer.prototype.initialize = layerInitialize;
    leafletLayer.prototype.callInitHooks = layerCallInitHooks;
  }
  Object.assign(leafletLayer.prototype, { _layerAdd: layerLayerAdd });
  removeLayer.value = L.Map.prototype.removeLayer;
  Object.assign(L.Map.prototype, { removeLayer: removeLayer2, getPitch, getBearing, setPitch, setBearing });
  Object.assign(L.Marker.prototype, { setRotation });
})();
//# sourceMappingURL=leaflet-city-mapper-src.js.map
