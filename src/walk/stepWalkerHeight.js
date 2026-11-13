/**
 * Advance ascent or gravity-driven descent and report whether the walker's height changed.
 *
 * @param {number} dt Frame duration in seconds.
 *
 * @returns {boolean} Whether a vertical update was applied.
 */
export function stepWalkerHeight(dt) {
  if (this.keys.has('Space')) {
    this.verticalSpeed = 6;
    this.state.height += this.verticalSpeed * dt;
    return true;
  }
  if (!this.verticalSpeed && !this.state.height) return false;
  this.state.height = Math.max(0, this.state.height + this.verticalSpeed * dt - 9.81 * dt * dt / 2);
  this.verticalSpeed = this.state.height > 0 ? this.verticalSpeed - 9.81 * dt : 0;
  return true;
}
