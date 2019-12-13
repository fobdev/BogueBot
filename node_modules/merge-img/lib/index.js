'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

exports.default = mergeImg;

var _isPlainObj = require('is-plain-obj');

var _isPlainObj2 = _interopRequireDefault(_isPlainObj);

var _jimp = require('jimp');

var _jimp2 = _interopRequireDefault(_jimp);

var _alignImage = require('./utils/alignImage');

var _alignImage2 = _interopRequireDefault(_alignImage);

var _calcMargin2 = require('./utils/calcMargin');

var _calcMargin3 = _interopRequireDefault(_calcMargin2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function mergeImg(images) {
  var _ref = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {},
      _ref$direction = _ref.direction,
      direction = _ref$direction === undefined ? false : _ref$direction,
      _ref$color = _ref.color,
      color = _ref$color === undefined ? 0x00000000 : _ref$color,
      _ref$align = _ref.align,
      align = _ref$align === undefined ? 'start' : _ref$align,
      _ref$offset = _ref.offset,
      offset = _ref$offset === undefined ? 0 : _ref$offset,
      margin = _ref.margin;

  if (!Array.isArray(images)) {
    throw new TypeError('`images` must be an array that contains images');
  }

  if (images.length < 1) {
    throw new Error('At least `images` must contain more than one image');
  }

  var processImg = function processImg(img) {
    if (img instanceof _jimp2.default) {
      return { img };
    }

    if ((0, _isPlainObj2.default)(img)) {
      var src = img.src,
          offsetX = img.offsetX,
          offsetY = img.offsetY;


      return (0, _jimp.read)(src).then(function (imgObj) {
        return {
          img: imgObj,
          offsetX,
          offsetY
        };
      });
    }

    return (0, _jimp.read)(img).then(function (imgObj) {
      return { img: imgObj };
    });
  };

  return Promise.all(images.map(processImg)).then(function (imgs) {
    var totalX = 0;
    var totalY = 0;

    var imgData = imgs.reduce(function (res, _ref2) {
      var img = _ref2.img,
          _ref2$offsetX = _ref2.offsetX,
          offsetX = _ref2$offsetX === undefined ? 0 : _ref2$offsetX,
          _ref2$offsetY = _ref2.offsetY,
          offsetY = _ref2$offsetY === undefined ? 0 : _ref2$offsetY;
      var _img$bitmap = img.bitmap,
          width = _img$bitmap.width,
          height = _img$bitmap.height;


      res.push({
        img,
        x: totalX + offsetX,
        y: totalY + offsetY,
        offsetX,
        offsetY
      });

      totalX += width + offsetX;
      totalY += height + offsetY;

      return res;
    }, []);

    var _calcMargin = (0, _calcMargin3.default)(margin),
        top = _calcMargin.top,
        right = _calcMargin.right,
        bottom = _calcMargin.bottom,
        left = _calcMargin.left;

    var marginTopBottom = top + bottom;
    var marginRightLeft = right + left;

    var totalWidth = direction ? Math.max.apply(Math, _toConsumableArray(imgData.map(function (_ref3) {
      var width = _ref3.img.bitmap.width,
          offsetX = _ref3.offsetX;
      return width + offsetX;
    }))) : imgData.reduce(function (res, _ref4, index) {
      var width = _ref4.img.bitmap.width,
          offsetX = _ref4.offsetX;
      return res + width + offsetX + Number(index > 0) * offset;
    }, 0);

    var totalHeight = direction ? imgData.reduce(function (res, _ref5, index) {
      var height = _ref5.img.bitmap.height,
          offsetY = _ref5.offsetY;
      return res + height + offsetY + Number(index > 0) * offset;
    }, 0) : Math.max.apply(Math, _toConsumableArray(imgData.map(function (_ref6) {
      var height = _ref6.img.bitmap.height,
          offsetY = _ref6.offsetY;
      return height + offsetY;
    })));

    var baseImage = new _jimp2.default(totalWidth + marginRightLeft, totalHeight + marginTopBottom, color);

    // Fallback for `Array#entries()`
    var imgDataEntries = imgData.map(function (data, index) {
      return [index, data];
    });

    var _iteratorNormalCompletion = true;
    var _didIteratorError = false;
    var _iteratorError = undefined;

    try {
      for (var _iterator = imgDataEntries[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
        var _ref7 = _step.value;

        var _ref8 = _slicedToArray(_ref7, 2);

        var index = _ref8[0];
        var _ref8$ = _ref8[1];
        var img = _ref8$.img;
        var x = _ref8$.x;
        var y = _ref8$.y;
        var offsetX = _ref8$.offsetX;
        var offsetY = _ref8$.offsetY;
        var _img$bitmap2 = img.bitmap,
            width = _img$bitmap2.width,
            height = _img$bitmap2.height;

        var _ref9 = direction ? [(0, _alignImage2.default)(totalWidth, width, align) + offsetX, y + index * offset] : [x + index * offset, (0, _alignImage2.default)(totalHeight, height, align) + offsetY],
            _ref10 = _slicedToArray(_ref9, 2),
            px = _ref10[0],
            py = _ref10[1];

        baseImage.composite(img, px + left, py + top);
      }
    } catch (err) {
      _didIteratorError = true;
      _iteratorError = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion && _iterator.return) {
          _iterator.return();
        }
      } finally {
        if (_didIteratorError) {
          throw _iteratorError;
        }
      }
    }

    return baseImage;
  });
}
module.exports = exports['default'];