/**
 * Read one glTF accessor component from a data view using little-endian byte order.
 *
 * @param {DataView} input View containing the component.
 * @param {TypedArrayConstructor} Type Component array constructor.
 * @param {number} at Byte offset in the view.
 *
 * @returns {number} Decoded component.
 */
export function readAccessorValue(input, Type, at) {
  return Type === Int8Array ? input.getInt8(at) :
    Type === Uint8Array ? input.getUint8(at) :
      Type === Int16Array ? input.getInt16(at, true) :
        Type === Uint16Array ? input.getUint16(at, true) :
          Type === Uint32Array ? input.getUint32(at, true) : input.getFloat32(at, true);
}
