define(["exports", "./abstract", "./column", "./options/option", "ko-resizable"], function (exports, _abstract, _column, _option) {
  "use strict";

  Object.defineProperty(exports, "__esModule", {
    value: true
  });

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  function _possibleConstructorReturn(self, call) {
    if (!self) {
      throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
    }

    return call && (typeof call === "object" || typeof call === "function") ? call : self;
  }

  function _inherits(subClass, superClass) {
    if (typeof superClass !== "function" && superClass !== null) {
      throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
    }

    subClass.prototype = Object.create(superClass && superClass.prototype, {
      constructor: {
        value: subClass,
        enumerable: false,
        writable: true,
        configurable: true
      }
    });
    if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
  }

  var Row = function (_AbstractStructural) {
    _inherits(Row, _AbstractStructural);

    /**
     * Abstract structural constructor
     *
     * @param parent
     * @param stage
     */
    function Row(parent, stage) {
      _classCallCheck(this, Row);

      var _this = _possibleConstructorReturn(this, _AbstractStructural.call(this, parent, stage));

      _this.template = 'Gene_BlueFoot/component/stage/structural/row.html';
      _this.options.push(new _option.Option(_this, 'column', '<i></i>', 'Add Column', false, ['add-column'], 10));
      return _this;
    }
    /**
     * Add a column to the row
     *
     * @param data
     * @returns {any}
     */


    Row.prototype.addColumn = function addColumn(data) {
      var column = new _column.Column(this, this.stage);
      this.addChild(column);
      column.updateColumnData(data);
      return column;
    };

    return Row;
  }(_abstract.AbstractStructural);

  exports.default = Row;
});
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3RzL2NvbXBvbmVudC9zdGFnZS9zdHJ1Y3R1cmFsL3Jvdy50cyJdLCJuYW1lcyI6WyJSb3ciLCJwYXJlbnQiLCJzdGFnZSIsInRlbXBsYXRlIiwib3B0aW9ucyIsInB1c2giLCJhZGRDb2x1bW4iLCJkYXRhIiwiY29sdW1uIiwiYWRkQ2hpbGQiLCJ1cGRhdGVDb2x1bW5EYXRhIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O01BZWNBLEc7OztBQUdWOzs7Ozs7QUFNQSxpQkFBWUMsTUFBWixFQUEyQ0MsS0FBM0MsRUFBZ0U7QUFBQTs7QUFBQSxtREFDNUQsK0JBQU1ELE1BQU4sRUFBY0MsS0FBZCxDQUQ0RDs7QUFSaEUsWUFBQUMsUUFBQSxHQUFtQixtREFBbkI7QUFXSSxZQUFLQyxPQUFMLENBQWFDLElBQWIsQ0FDSSwwQkFBaUIsUUFBakIsRUFBMkIsVUFBM0IsRUFBdUMsWUFBdkMsRUFBcUQsS0FBckQsRUFBNEQsQ0FBQyxZQUFELENBQTVELEVBQTRFLEVBQTVFLENBREo7QUFINEQ7QUFNL0Q7QUFFRDs7Ozs7Ozs7a0JBTUFDLFMsc0JBQVVDLEksRUFBaUI7QUFDdkIsVUFBSUMsU0FBUyxtQkFBVyxJQUFYLEVBQWlCLEtBQUtOLEtBQXRCLENBQWI7QUFDQSxXQUFLTyxRQUFMLENBQWNELE1BQWQ7QUFDQUEsYUFBT0UsZ0JBQVAsQ0FBd0JILElBQXhCO0FBQ0EsYUFBT0MsTUFBUDtBQUNILEs7Ozs7O29CQTVCU1IsRyIsImZpbGUiOiJjb21wb25lbnQvc3RhZ2Uvc3RydWN0dXJhbC9yb3cuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBBYnN0cmFjdFN0cnVjdHVyYWwgfSBmcm9tICcuL2Fic3RyYWN0JztcbmltcG9ydCB7IENvbHVtbkludGVyZmFjZSB9IGZyb20gJy4vY29sdW1uLmQnO1xuaW1wb3J0IHsgUm93SW50ZXJmYWNlIH0gZnJvbSBcIi4vcm93LmRcIjtcbmltcG9ydCB7IENvbHVtbiwgQ29sdW1uRGF0YSB9IGZyb20gXCIuL2NvbHVtblwiO1xuaW1wb3J0IHsgT3B0aW9uIH0gZnJvbSBcIi4vb3B0aW9ucy9vcHRpb25cIjtcbmltcG9ydCB7IE9wdGlvbkludGVyZmFjZSB9IGZyb20gXCIuL29wdGlvbnMvb3B0aW9uLmRcIjtcbmltcG9ydCB7IEVkaXRhYmxlQXJlYUludGVyZmFjZSB9IGZyb20gJy4vZWRpdGFibGUtYXJlYS5kJztcbmltcG9ydCB7IFN0YWdlSW50ZXJmYWNlIH0gZnJvbSAnLi4vLi4vc3RhZ2UuZCc7XG5pbXBvcnQgXCJrby1yZXNpemFibGVcIjtcblxuLyoqXG4gKiBSb3cgY2xhc3NcbiAqXG4gKiBAYXV0aG9yIERhdmUgTWFjYXVsYXkgPGRtYWNhdWxheUBtYWdlbnRvLmNvbT5cbiAqL1xuZXhwb3J0IGRlZmF1bHQgY2xhc3MgUm93IGV4dGVuZHMgQWJzdHJhY3RTdHJ1Y3R1cmFsIGltcGxlbWVudHMgUm93SW50ZXJmYWNlIHtcbiAgICB0ZW1wbGF0ZTogc3RyaW5nID0gJ0dlbmVfQmx1ZUZvb3QvY29tcG9uZW50L3N0YWdlL3N0cnVjdHVyYWwvcm93Lmh0bWwnO1xuXG4gICAgLyoqXG4gICAgICogQWJzdHJhY3Qgc3RydWN0dXJhbCBjb25zdHJ1Y3RvclxuICAgICAqXG4gICAgICogQHBhcmFtIHBhcmVudFxuICAgICAqIEBwYXJhbSBzdGFnZVxuICAgICAqL1xuICAgIGNvbnN0cnVjdG9yKHBhcmVudDogRWRpdGFibGVBcmVhSW50ZXJmYWNlLCBzdGFnZTogU3RhZ2VJbnRlcmZhY2UpIHtcbiAgICAgICAgc3VwZXIocGFyZW50LCBzdGFnZSk7XG4gICAgICAgIFxuICAgICAgICB0aGlzLm9wdGlvbnMucHVzaChcbiAgICAgICAgICAgIG5ldyBPcHRpb24odGhpcywgJ2NvbHVtbicsICc8aT7umLo8L2k+JywgJ0FkZCBDb2x1bW4nLCBmYWxzZSwgWydhZGQtY29sdW1uJ10sIDEwKVxuICAgICAgICApO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEFkZCBhIGNvbHVtbiB0byB0aGUgcm93XG4gICAgICpcbiAgICAgKiBAcGFyYW0gZGF0YVxuICAgICAqIEByZXR1cm5zIHthbnl9XG4gICAgICovXG4gICAgYWRkQ29sdW1uKGRhdGE/OiBDb2x1bW5EYXRhKTogQ29sdW1uSW50ZXJmYWNlIHtcbiAgICAgICAgbGV0IGNvbHVtbiA9IG5ldyBDb2x1bW4odGhpcywgdGhpcy5zdGFnZSk7XG4gICAgICAgIHRoaXMuYWRkQ2hpbGQoY29sdW1uKTtcbiAgICAgICAgY29sdW1uLnVwZGF0ZUNvbHVtbkRhdGEoZGF0YSk7XG4gICAgICAgIHJldHVybiBjb2x1bW47XG4gICAgfVxufSJdfQ==
