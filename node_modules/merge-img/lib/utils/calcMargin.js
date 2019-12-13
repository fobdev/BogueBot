'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

exports.default = calcMargin;
function calcMargin() {
  var obj = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

  if (Number.isInteger(obj)) {
    return {
      top: obj,
      right: obj,
      bottom: obj,
      left: obj
    };
  }

  if (typeof obj === 'string') {
    var _obj$split = obj.split(' '),
        _obj$split2 = _slicedToArray(_obj$split, 4),
        _top = _obj$split2[0],
        _obj$split2$ = _obj$split2[1],
        _right = _obj$split2$ === undefined ? _top : _obj$split2$,
        _obj$split2$2 = _obj$split2[2],
        _bottom = _obj$split2$2 === undefined ? _top : _obj$split2$2,
        _obj$split2$3 = _obj$split2[3],
        _left = _obj$split2$3 === undefined ? _right : _obj$split2$3;

    return {
      top: Number(_top),
      right: Number(_right),
      bottom: Number(_bottom),
      left: Number(_left)
    };
  }

  var _obj$top = obj.top,
      top = _obj$top === undefined ? 0 : _obj$top,
      _obj$right = obj.right,
      right = _obj$right === undefined ? 0 : _obj$right,
      _obj$bottom = obj.bottom,
      bottom = _obj$bottom === undefined ? 0 : _obj$bottom,
      _obj$left = obj.left,
      left = _obj$left === undefined ? 0 : _obj$left;


  return {
    top,
    right,
    bottom,
    left
  };
}
module.exports = exports['default'];