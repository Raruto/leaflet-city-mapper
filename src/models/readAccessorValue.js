export function readAccessorValue(input, Type, at) {
  return Type === Int8Array ? input.getInt8(at) :
    Type === Uint8Array ? input.getUint8(at) :
      Type === Int16Array ? input.getInt16(at, true) :
        Type === Uint16Array ? input.getUint16(at, true) :
          Type === Uint32Array ? input.getUint32(at, true) : input.getFloat32(at, true);
}
