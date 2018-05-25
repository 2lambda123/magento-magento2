/*eslint-disable */
define(["jquery", "knockout", "uiEvents", "underscore", "Magento_PageBuilder/js/config", "Magento_PageBuilder/js/interactions/container-animation", "Magento_PageBuilder/js/interactions/move-content-type", "Magento_PageBuilder/js/interactions/registry", "Magento_PageBuilder/js/content-type/preview-collection", "Magento_PageBuilder/js/content-type/column-group/drag-and-drop", "Magento_PageBuilder/js/content-type/column-group/factory", "Magento_PageBuilder/js/content-type/column-group/registry", "Magento_PageBuilder/js/content-type/column-group/resizing", "Magento_PageBuilder/js/utils/create-stylesheet"], function (_jquery, _knockout, _uiEvents, _underscore, _config, _containerAnimation, _moveContentType, _registry, _previewCollection, _dragAndDrop, _factory, _registry2, _resizing, _createStylesheet) {
  function _inheritsLoose(subClass, superClass) { subClass.prototype = Object.create(superClass.prototype); subClass.prototype.constructor = subClass; subClass.__proto__ = superClass; }

  var Preview =
  /*#__PURE__*/
  function (_PreviewCollection) {
    _inheritsLoose(Preview, _PreviewCollection);

    /**
     * @param {ContentTypeCollectionInterface} parent
     * @param {ContentTypeConfigInterface} config
     * @param {number} stageId
     */
    function Preview(parent, config, stageId) {
      var _this;

      _this = _PreviewCollection.call(this, parent, config, stageId) || this;
      _this.resizing = _knockout.observable(false);
      _this.dropPlaceholder = void 0;
      _this.movePlaceholder = void 0;
      _this.groupElement = void 0;
      _this.resizeGhost = void 0;
      _this.resizeColumnInstance = void 0;
      _this.resizeColumnWidths = [];
      _this.resizeMaxGhostWidth = void 0;
      _this.resizeMouseDown = void 0;
      _this.resizeLeftLastColumnShrunk = void 0;
      _this.resizeRightLastColumnShrunk = void 0;
      _this.resizeLastPosition = void 0;
      _this.resizeLastColumnInPair = void 0;
      _this.resizeHistory = {
        left: [],
        right: []
      };
      _this.dropOverElement = void 0;
      _this.dropPositions = [];
      _this.dropPosition = void 0;
      _this.movePosition = void 0;
      _this.groupPositionCache = void 0;

      _uiEvents.on("block:removed", function (args) {
        if (args.parent.id === _this.parent.id) {
          _this.spreadWidth(event, args);
        }
      }); // Listen for resizing events from child columns


      _uiEvents.on("column:bindResizeHandle", function (args) {
        // Does the events parent match the previews parent? (e.g. column group)
        if (args.parent.id === _this.parent.id) {
          _this.registerResizeHandle(args.column, args.handle);
        }
      });

      _uiEvents.on("column:initElement", function (args) {
        // Does the events parent match the previews parent? (e.g. column group)
        if (args.parent.id === _this.parent.id) {
          _this.bindDraggable(args.column);
        }
      });

      _this.parent.children.subscribe(_underscore.debounce(_this.removeIfEmpty.bind(_this), 50));

      return _this;
    }
    /**
     * Handle a new column being dropped into the group
     *
     * @param {DropPosition} dropPosition
     */


    var _proto = Preview.prototype;

    _proto.onNewColumnDrop = function onNewColumnDrop(dropPosition) {
      // Create our new column
      (0, _factory.createColumn)(this.parent, (0, _resizing.getSmallestColumnWidth)(), dropPosition.insertIndex).then(function (column) {
        var newWidth = (0, _resizing.getAcceptedColumnWidth)(((0, _resizing.getColumnWidth)(dropPosition.affectedColumn) - (0, _resizing.getSmallestColumnWidth)()).toString()); // Reduce the affected columns width by the smallest column width

        (0, _resizing.updateColumnWidth)(dropPosition.affectedColumn, newWidth);
      });
    };
    /**
     * Handle an existing column being dropped into a new column group
     *
     * @param {DropPosition} movePosition
     */


    _proto.onExistingColumnDrop = function onExistingColumnDrop(movePosition) {
      var column = (0, _registry2.getDragColumn)();
      var modifyOldNeighbour; // Determine which old neighbour we should modify

      var oldWidth = (0, _resizing.getColumnWidth)(column); // Retrieve the adjacent column either +1 or -1

      if ((0, _resizing.getAdjacentColumn)(column, "+1")) {
        modifyOldNeighbour = (0, _resizing.getAdjacentColumn)(column, "+1");
      } else if ((0, _resizing.getAdjacentColumn)(column, "-1")) {
        modifyOldNeighbour = (0, _resizing.getAdjacentColumn)(column, "-1");
      } // Set the column to it's smallest column width


      (0, _resizing.updateColumnWidth)(column, (0, _resizing.getSmallestColumnWidth)()); // Move the content type

      (0, _moveContentType.moveContentType)(column, movePosition.insertIndex, this.parent); // Modify the old neighbour

      if (modifyOldNeighbour) {
        var oldNeighbourWidth = (0, _resizing.getAcceptedColumnWidth)((oldWidth + (0, _resizing.getColumnWidth)(modifyOldNeighbour)).toString());
        (0, _resizing.updateColumnWidth)(modifyOldNeighbour, oldNeighbourWidth);
      } // Modify the columns new neighbour


      var newNeighbourWidth = (0, _resizing.getAcceptedColumnWidth)(((0, _resizing.getColumnWidth)(movePosition.affectedColumn) - (0, _resizing.getSmallestColumnWidth)()).toString()); // Reduce the affected columns width by the smallest column width

      (0, _resizing.updateColumnWidth)(movePosition.affectedColumn, newNeighbourWidth);
    };
    /**
     * Handle a column being sorted into a new position in the group
     *
     * @param {Column} column
     * @param {number} newIndex
     */


    _proto.onColumnSort = function onColumnSort(column, newIndex) {
      var currentIndex = (0, _resizing.getColumnIndexInGroup)(column);

      if (currentIndex !== newIndex) {
        if (currentIndex < newIndex) {
          // As we're moving an array item the keys all reduce by 1
          --newIndex;
        } // Move the content type


        (0, _moveContentType.moveContentType)(column, newIndex);
      }
    };
    /**
     * Handle a column being resized
     *
     * @param {Column} column
     * @param {number} width
     * @param {Column} adjustedColumn
     */


    _proto.onColumnResize = function onColumnResize(column, width, adjustedColumn) {
      (0, _resizing.resizeColumn)(column, width, adjustedColumn);
    };
    /**
     * Init the droppable & resizing interactions
     *
     * @param group
     */


    _proto.bindInteractions = function bindInteractions(group) {
      this.groupElement = (0, _jquery)(group);
      this.initDroppable(this.groupElement);
      this.initMouseMove(this.groupElement); // Handle the mouse leaving the window

      (0, _jquery)("body").mouseleave(this.endAllInteractions.bind(this));
    };
    /**
     * Init the drop placeholder
     *
     * @param element
     */


    _proto.bindDropPlaceholder = function bindDropPlaceholder(element) {
      this.dropPlaceholder = (0, _jquery)(element);
    };
    /**
     * Init the move placeholder
     *
     * @param {Element} element
     */


    _proto.bindMovePlaceholder = function bindMovePlaceholder(element) {
      this.movePlaceholder = (0, _jquery)(element);
    };
    /**
     * Retrieve the ghost element from the template
     *
     * @param {Element} ghost
     */


    _proto.bindGhost = function bindGhost(ghost) {
      this.resizeGhost = (0, _jquery)(ghost);
    };
    /**
     * Register a resize handle within a child column
     *
     * @param {Column} column
     * @param {JQuery<HTMLElement>} handle
     */


    _proto.registerResizeHandle = function registerResizeHandle(column, handle) {
      var _this2 = this;

      handle.off("mousedown touchstart");
      handle.on("mousedown touchstart", function (event) {
        event.preventDefault();

        var groupPosition = _this2.getGroupPosition(_this2.groupElement);

        _this2.resizing(true);

        _this2.resizeColumnInstance = column;
        _this2.resizeColumnWidths = (0, _resizing.determineColumnWidths)(_this2.resizeColumnInstance, groupPosition);
        _this2.resizeMaxGhostWidth = (0, _resizing.determineMaxGhostWidth)(_this2.resizeColumnWidths); // Set a flag of the columns which are currently being resized

        _this2.setColumnsAsResizing(column, (0, _resizing.getAdjacentColumn)(column, "+1")); // Force the cursor to resizing


        (0, _jquery)("body").css("cursor", "col-resize"); // Reset the resize history

        _this2.resizeHistory = {
          left: [],
          right: []
        };
        _this2.resizeLastPosition = null;
        _this2.resizeMouseDown = true;

        _uiEvents.trigger("interaction:start", {
          stageId: _this2.parent.stageId
        });
      });
    };
    /**
     * Bind draggable instances to the child columns
     */


    _proto.bindDraggable = function bindDraggable(column) {
      var _this3 = this;

      column.element.draggable({
        appendTo: "body",
        containment: "body",
        handle: ".move-column",
        revertDuration: 250,
        helper: function helper() {
          var helper = (0, _jquery)(this).clone();
          helper.css({
            height: (0, _jquery)(this).outerHeight() + "px",
            minHeight: 0,
            opacity: 0.5,
            pointerEvents: "none",
            width: (0, _jquery)(this).outerWidth() + "px",
            zIndex: 100
          });
          return helper;
        },
        start: function start(event) {
          var columnInstance = _knockout.dataFor((0, _jquery)(event.target)[0]); // Use the global state as columns can be dragged between groups


          (0, _registry2.setDragColumn)(columnInstance.parent);
          _this3.dropPositions = (0, _dragAndDrop.calculateDropPositions)(_this3.parent);

          _uiEvents.trigger("column:drag:start", {
            column: columnInstance,
            stageId: _this3.parent.stageId
          });

          _uiEvents.trigger("interaction:start", {
            stageId: _this3.parent.stageId
          });
        },
        stop: function stop() {
          var draggedColumn = (0, _registry2.getDragColumn)();

          if (_this3.movePosition && draggedColumn) {
            // Check if we're moving within the same group, even though this function will
            // only ever run on the group that bound the draggable event
            if (draggedColumn.parent === _this3.parent) {
              _this3.onColumnSort(draggedColumn, _this3.movePosition.insertIndex);

              _this3.movePosition = null;
            }
          }

          (0, _registry2.removeDragColumn)();

          _this3.dropPlaceholder.removeClass("left right");

          _this3.movePlaceholder.removeClass("active");

          _uiEvents.trigger("column:drag:stop", {
            column: draggedColumn,
            stageId: _this3.parent.stageId
          });

          _uiEvents.trigger("interaction:stop", {
            stageId: _this3.parent.stageId
          });
        }
      });
    };
    /**
     * Set columns in the group as resizing
     *
     * @param {Column} columns
     */


    _proto.setColumnsAsResizing = function setColumnsAsResizing() {
      for (var _len = arguments.length, columns = new Array(_len), _key = 0; _key < _len; _key++) {
        columns[_key] = arguments[_key];
      }

      columns.forEach(function (column) {
        column.preview.resizing(true);
        column.element.css({
          transition: "width " + _containerAnimation.animationTime + "ms ease-in-out"
        });
      });
    };
    /**
     * Unset resizing flag on all child columns
     */


    _proto.unsetResizingColumns = function unsetResizingColumns() {
      this.parent.children().forEach(function (column) {
        column.preview.resizing(false);

        if (column.element) {
          column.element.css({
            transition: ""
          });
        }
      });
    };
    /**
     * End all current interactions
     */


    _proto.endAllInteractions = function endAllInteractions() {
      if (this.resizing() === true) {
        _uiEvents.trigger("interaction:stop", {
          stageId: this.parent.stageId
        });
      }

      this.resizing(false);
      this.resizeMouseDown = null;
      this.resizeLeftLastColumnShrunk = this.resizeRightLastColumnShrunk = null;
      this.dropPositions = [];
      this.unsetResizingColumns(); // Change the cursor back

      (0, _jquery)("body").css("cursor", "");
      this.dropPlaceholder.removeClass("left right");
      this.movePlaceholder.css("left", "").removeClass("active");
      this.resizeGhost.removeClass("active"); // Reset the group positions cache

      this.groupPositionCache = null;
    };
    /**
     * Init the resizing events on the group
     *
     * @param {JQuery<HTMLElement>} group
     */


    _proto.initMouseMove = function initMouseMove(group) {
      var _this4 = this;

      var intersects = false;
      (0, _jquery)(document).on("mousemove touchmove", function (event) {
        var groupPosition = _this4.getGroupPosition(group); // If we're handling a touch event we need to pass through the page X & Y


        if (event.type === "touchmove") {
          event.pageX = event.originalEvent.pageX;
          event.pageY = event.originalEvent.pageY;
        }

        if (_this4.eventIntersectsGroup(event, groupPosition)) {
          intersects = true;

          _this4.onResizingMouseMove(event, group, groupPosition);

          _this4.onDraggingMouseMove(event, group, groupPosition);

          _this4.onDroppingMouseMove(event, group, groupPosition);
        } else {
          intersects = false;
          _this4.groupPositionCache = null;
          _this4.dropPosition = null;

          _this4.dropPlaceholder.removeClass("left right");

          _this4.movePlaceholder.css("left", "").removeClass("active");
        }
      }).on("mouseup touchend", function () {
        if (intersects) {
          _this4.handleMouseUp();
        }

        intersects = false;
        _this4.dropPosition = null;

        _this4.endAllInteractions();

        _underscore.defer(function () {
          // Re-enable any disabled sortable areas
          group.find(".ui-sortable").each(function () {
            if ((0, _jquery)(this).data("sortable")) {
              (0, _jquery)(this).sortable("option", "disabled", false);
            }
          });
        });
      });
    };
    /**
     * Handle the mouse up action, either adding a new column or moving an existing
     */


    _proto.handleMouseUp = function handleMouseUp() {
      if (this.dropOverElement && this.dropPosition) {
        this.onNewColumnDrop(this.dropPosition);
        this.dropOverElement = null;
      }

      var column = (0, _registry2.getDragColumn)();

      if (this.movePosition && column && column.parent !== this.parent) {
        this.onExistingColumnDrop(this.movePosition);
      }
    };
    /**
     * Does the current event intersect with the group?
     *
     * @param {JQuery.Event} event
     * @param {GroupPositionCache} groupPosition
     * @returns {boolean}
     */


    _proto.eventIntersectsGroup = function eventIntersectsGroup(event, groupPosition) {
      return event.pageY > groupPosition.top && event.pageY < groupPosition.top + groupPosition.outerHeight && event.pageX > groupPosition.left && event.pageX < groupPosition.left + groupPosition.outerWidth;
    };
    /**
     * Cache the groups positions
     *
     * @param {JQuery<HTMLElement>} group
     */


    _proto.getGroupPosition = function getGroupPosition(group) {
      if (!this.groupPositionCache) {
        this.groupPositionCache = {
          top: group.offset().top,
          left: group.offset().left,
          width: group.width(),
          height: group.height(),
          outerWidth: group.outerWidth(),
          outerHeight: group.outerHeight()
        };
      }

      return this.groupPositionCache;
    };
    /**
     * Record the resizing history for this action
     *
     * @param {string} usedHistory
     * @param {string} direction
     * @param {Column} adjustedColumn
     * @param {string} modifyColumnInPair
     */


    _proto.recordResizeHistory = function recordResizeHistory(usedHistory, direction, adjustedColumn, modifyColumnInPair) {
      if (usedHistory) {
        this.resizeHistory[usedHistory].pop();
      }

      this.resizeHistory[direction].push({
        adjustedColumn: adjustedColumn,
        modifyColumnInPair: modifyColumnInPair
      });
    };
    /**
     * Handle the resizing on mouse move, we always resize a pair of columns at once
     *
     * @param {JQuery.Event} event
     * @param {JQuery<HTMLElement>} group
     * @param {GroupPositionCache} groupPosition
     */


    _proto.onResizingMouseMove = function onResizingMouseMove(event, group, groupPosition) {
      var _this5 = this;

      var newColumnWidth;

      if (this.resizeMouseDown) {
        event.preventDefault();
        var currentPos = event.pageX;
        var resizeColumnLeft = this.resizeColumnInstance.element.offset().left;
        var resizeColumnWidth = this.resizeColumnInstance.element.outerWidth();
        var resizeHandlePosition = resizeColumnLeft + resizeColumnWidth;
        var direction = currentPos >= resizeHandlePosition ? "right" : "left";

        var _adjustedColumn;

        var _modifyColumnInPair; // We need to know if we're modifying the left or right column in the pair


        var usedHistory; // Was the adjusted column pulled from history?
        // Determine which column in the group should be adjusted for this action

        var _determineAdjustedCol = (0, _resizing.determineAdjustedColumn)(currentPos, this.resizeColumnInstance, this.resizeHistory);

        _adjustedColumn = _determineAdjustedCol[0];
        _modifyColumnInPair = _determineAdjustedCol[1];
        usedHistory = _determineAdjustedCol[2];
        // Calculate the ghost width based on mouse position and bounds of allowed sizes
        var ghostWidth = (0, _resizing.calculateGhostWidth)(groupPosition, currentPos, this.resizeColumnInstance, _modifyColumnInPair, this.resizeMaxGhostWidth);
        this.resizeGhost.width(ghostWidth - 15 + "px").addClass("active");

        if (_adjustedColumn && this.resizeColumnWidths) {
          newColumnWidth = this.resizeColumnWidths.find(function (val) {
            return (0, _resizing.comparator)(currentPos, val.position, 35) && val.forColumn === _modifyColumnInPair;
          });

          if (newColumnWidth) {
            var mainColumn = this.resizeColumnInstance; // If we're using the left data set, we're actually resizing the right column of the group

            if (_modifyColumnInPair === "right") {
              mainColumn = (0, _resizing.getAdjacentColumn)(this.resizeColumnInstance, "+1");
            } // Ensure we aren't resizing multiple times, also validate the last resize isn't the same as the
            // one being performed now. This occurs as we re-calculate the column positions on resize, we have
            // to use the comparator as the calculation may result in slightly different numbers due to rounding


            if ((0, _resizing.getColumnWidth)(mainColumn) !== newColumnWidth.width && !(0, _resizing.comparator)(this.resizeLastPosition, newColumnWidth.position, 10)) {
              // If our previous action was to resize the right column in pair, and we're now dragging back
              // to the right, but have matched a column for the left we need to fix the columns being
              // affected
              if (usedHistory && this.resizeLastColumnInPair === "right" && direction === "right" && newColumnWidth.forColumn === "left") {
                var originalMainColumn = mainColumn;
                mainColumn = _adjustedColumn;
                _adjustedColumn = (0, _resizing.getAdjacentColumn)(originalMainColumn, "+1");
              }

              this.recordResizeHistory(usedHistory, direction, _adjustedColumn, _modifyColumnInPair);
              this.resizeLastPosition = newColumnWidth.position;
              this.resizeLastColumnInPair = _modifyColumnInPair;
              this.onColumnResize(mainColumn, newColumnWidth.width, _adjustedColumn); // Wait for the render cycle to finish from the above resize before re-calculating

              _underscore.defer(function () {
                // If we do a resize, re-calculate the column widths
                _this5.resizeColumnWidths = (0, _resizing.determineColumnWidths)(_this5.resizeColumnInstance, groupPosition);
                _this5.resizeMaxGhostWidth = (0, _resizing.determineMaxGhostWidth)(_this5.resizeColumnWidths);
              });
            }
          }
        }
      }
    };
    /**
     * Handle a column being dragged around the group
     *
     * @param {JQuery.Event} event
     * @param {JQuery<HTMLElement>} group
     * @param {GroupPositionCache} groupPosition
     */


    _proto.onDraggingMouseMove = function onDraggingMouseMove(event, group, groupPosition) {
      var dragColumn = (0, _registry2.getDragColumn)();

      if (dragColumn) {
        // If the drop positions haven't been calculated for this group do so now
        if (this.dropPositions.length === 0) {
          this.dropPositions = (0, _dragAndDrop.calculateDropPositions)(this.parent);
        }

        var columnInstance = dragColumn;
        var currentX = event.pageX - groupPosition.left; // Are we within the same column group or have we ended up over another?

        if (columnInstance.parent === this.parent) {
          var currentColumn = dragColumn.element;
          var currentColumnRight = currentColumn.position().left + currentColumn.width();
          var lastColInGroup = this.parent.children()[this.parent.children().length - 1].element;
          var insertLastPos = lastColInGroup.position().left + lastColInGroup.width() / 2;
          this.movePosition = this.dropPositions.find(function (position) {
            // Only ever look for the left placement, except the last item where we look on the right
            var placement = currentX >= insertLastPos ? "right" : "left"; // There is 200px area over each column borders

            return (0, _resizing.comparator)(currentX, position[placement], 100) && !(0, _resizing.comparator)(currentX, currentColumnRight, 100) && position.affectedColumn !== columnInstance && // Check affected column isn't the current column
            position.placement === placement; // Verify the position, we only check left on sorting
          });

          if (this.movePosition) {
            this.dropPlaceholder.removeClass("left right");
            this.movePlaceholder.css({
              left: this.movePosition.placement === "left" ? this.movePosition.left : "",
              right: this.movePosition.placement === "right" ? groupPosition.outerWidth - this.movePosition.right - 5 : ""
            }).addClass("active");
          } else {
            this.movePlaceholder.removeClass("active");
          }
        } else {
          // If we're moving to another column group we utilise the existing drop placeholder
          this.movePosition = this.dropPositions.find(function (position) {
            return currentX > position.left && currentX < position.right && position.canShrink;
          });

          if (this.movePosition) {
            var classToRemove = this.movePosition.placement === "left" ? "right" : "left";
            this.movePlaceholder.removeClass("active");
            this.dropPlaceholder.removeClass(classToRemove).css({
              left: this.movePosition.placement === "left" ? this.movePosition.left : "",
              right: this.movePosition.placement === "right" ? groupPosition.width - this.movePosition.right : "",
              width: groupPosition.width / (0, _resizing.getMaxColumns)() + "px"
            }).addClass(this.movePosition.placement);
          } else {
            this.dropPlaceholder.removeClass("left right");
          }
        }
      }
    };
    /**
     * Handle mouse move events on when dropping elements
     *
     * @param {JQuery.Event} event
     * @param {JQuery<HTMLElement>} group
     * @param {GroupPositionCache} groupPosition
     */


    _proto.onDroppingMouseMove = function onDroppingMouseMove(event, group, groupPosition) {
      // Only initiate this process if we're within the group by a buffer to allow for sortable to function correctly
      if (this.dropOverElement && event.pageY > groupPosition.top + 20 && event.pageY < groupPosition.top + groupPosition.outerHeight - 20) {
        // Disable the parent sortable instance
        group.parents(".element-children").sortable("option", "disabled", true);
        var currentX = event.pageX - groupPosition.left;
        this.dropPosition = this.dropPositions.find(function (position) {
          return currentX > position.left && currentX < position.right && position.canShrink;
        });

        if (this.dropPosition) {
          this.dropPlaceholder.removeClass("left right").css({
            left: this.dropPosition.placement === "left" ? this.dropPosition.left : "",
            right: this.dropPosition.placement === "right" ? groupPosition.width - this.dropPosition.right : "",
            width: groupPosition.width / (0, _resizing.getMaxColumns)() + "px"
          }).addClass(this.dropPosition.placement);
        }
      } else if (this.dropOverElement) {
        // Re-enable the parent sortable instance
        group.parents(".element-children").sortable("option", "disabled", false);
        this.dropPosition = null;
        this.dropPlaceholder.removeClass("left right");
      }
    };
    /**
     * Init the droppable functionality for new columns
     *
     * @param {JQuery<HTMLElement>} group
     */


    _proto.initDroppable = function initDroppable(group) {
      var self = this;
      var headStyles;
      group.droppable({
        deactivate: function deactivate() {
          self.dropOverElement = null;
          self.dropPlaceholder.removeClass("left right");

          _underscore.defer(function () {
            // Re-enable the parent sortable instance & all children sortable instances
            group.parents(".element-children").each(function () {
              if ((0, _jquery)(this).data("sortable")) {
                (0, _jquery)(this).sortable("option", "disabled", false);
              }
            });
          });
        },
        activate: function activate() {
          if ((0, _registry.getDraggedBlockConfig)() === _config.getContentTypeConfig("column")) {
            group.find(".ui-sortable").each(function () {
              if ((0, _jquery)(this).data("sortable")) {
                (0, _jquery)(this).sortable("option", "disabled", true);
              }
            }); // Ensure we don't display any drop indicators inside the column

            headStyles = (0, _createStylesheet.createStyleSheet)({
              ".pagebuilder-content-type.pagebuilder-column .pagebuilder-drop-indicator": {
                display: "none!important"
              }
            });
            document.head.appendChild(headStyles);
          } else if (headStyles) {
            headStyles.remove();
            headStyles = null;
          }
        },
        drop: function drop() {
          self.dropPositions = [];
          self.dropPlaceholder.removeClass("left right");
        },
        out: function out() {
          self.dropOverElement = null;
          self.dropPlaceholder.removeClass("left right");
        },
        over: function over() {
          // Always calculate drop positions when an element is dragged over
          self.dropPositions = (0, _dragAndDrop.calculateDropPositions)(self.parent); // Is the element currently being dragged a column?

          if ((0, _registry.getDraggedBlockConfig)() === _config.getContentTypeConfig("column")) {
            self.dropOverElement = true;
          } else {
            self.dropOverElement = null;
          }
        }
      });
    };
    /**
     * Spread any empty space across the other columns
     *
     * @param {Event} event
     * @param {BlockRemovedParams} params
     */


    _proto.spreadWidth = function spreadWidth(event, params) {
      if (this.parent.children().length === 0) {
        return;
      }

      var availableWidth = 100 - (0, _resizing.getColumnsWidth)(this.parent);
      var formattedAvailableWidth = (0, _resizing.getRoundedColumnWidth)(availableWidth);
      var totalChildColumns = this.parent.children().length;
      var allowedColumnWidths = [];
      var spreadAcross = 1;
      var spreadAmount;

      for (var i = (0, _resizing.getMaxColumns)(); i > 0; i--) {
        allowedColumnWidths.push((0, _resizing.getRoundedColumnWidth)(100 / 6 * i));
      } // Determine how we can spread the empty space across the columns


      for (var _i = totalChildColumns; _i > 0; _i--) {
        var potentialWidth = Math.floor(formattedAvailableWidth / _i);

        for (var _i2 = 0; _i2 < allowedColumnWidths.length; _i2++) {
          var _width = allowedColumnWidths[_i2];

          if (potentialWidth === Math.floor(_width)) {
            spreadAcross = _i;
            spreadAmount = formattedAvailableWidth / _i;
            break;
          }
        }

        if (spreadAmount) {
          break;
        }
      } // Let's spread the width across the columns


      for (var _i3 = 1; _i3 <= spreadAcross; _i3++) {
        var columnToModify = void 0; // As the original column has been removed from the array, check the new index for a column

        if (params.index <= this.parent.children().length && typeof this.parent.children()[params.index] !== "undefined") {
          columnToModify = this.parent.children()[params.index];
        }

        if (!columnToModify && params.index - _i3 >= 0 && typeof this.parent.children()[params.index - _i3] !== "undefined") {
          columnToModify = this.parent.children()[params.index - _i3];
        }

        if (columnToModify) {
          (0, _resizing.updateColumnWidth)(columnToModify, (0, _resizing.getColumnWidth)(columnToModify) + spreadAmount);
        }
      }
    };
    /**
     * Remove self if we contain no children
     */


    _proto.removeIfEmpty = function removeIfEmpty() {
      if (this.parent.children().length === 0) {
        this.parent.parent.removeChild(this.parent);
        return;
      }
    };

    return Preview;
  }(_previewCollection);

  return Preview;
});
//# sourceMappingURL=preview.js.map
