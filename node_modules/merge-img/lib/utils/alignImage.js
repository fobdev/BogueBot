'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = alignImage;
function alignImage(total, size, align) {
  if (align === 'center') {
    return (total - size) / 2;
  }

  if (align === 'end') {
    return total - size;
  }

  return 0;
}
module.exports = exports['default'];