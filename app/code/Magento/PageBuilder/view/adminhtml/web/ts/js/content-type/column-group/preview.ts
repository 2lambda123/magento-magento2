/**
 * Copyright © Magento, Inc. All rights reserved.
 * See COPYING.txt for license details.
 */

import $ from "jquery";
import ko from "knockout";
import events from "uiEvents";
import _ from "underscore";
import {createColumn} from "../../component/block/column-group/factory";
import {resizeColumn, updateColumnWidth} from "../../component/block/column-group/resizing";
import {calculateDropPositions, DropPosition} from "../../component/block/preview/column-group/dragdrop";
import {getDragColumn, removeDragColumn, setDragColumn} from "../../component/block/preview/column-group/registry";
import {
    calculateGhostWidth, comparator, determineAdjustedColumn, determineColumnWidths, determineMaxGhostWidth,
    findShrinkableColumn, getAcceptedColumnWidth, getAdjacentColumn, getColumnIndexInGroup, getColumnsWidth,
    getColumnWidth, getMaxColumns, getRoundedColumnWidth, getSmallestColumnWidth,
} from "../../component/block/preview/column-group/resizing";
import Config from "../../config";
import {Block as GroupBlock} from "../../component/stage/panel/group/block";
import ContentTypeConfigInterface from "../../content-type-config.d";
import ContentTypeInterface from "../../content-type.d";
import PreviewCollection from "../../preview-collection";
import {moveArrayItem} from "../../utils/array";
import {default as ColumnGroupPreview} from "../column-group/preview";
import Column from "../column/preview";

interface BlockRemovedParams {
    parent: ColumnGroup;
    block: Column;
    index: number;
}

export default class Preview extends PreviewCollection {
    public resizing: KnockoutObservable<boolean> = ko.observable(false);
    private dropPlaceholder: JQuery<HTMLElement>;
    private movePlaceholder: JQuery<HTMLElement>;
    private groupElement: JQuery<HTMLElement>;
    private resizeGhost: JQuery<HTMLElement>;
    private resizeColumnInstance: Column;
    private resizeColumnWidths: ColumnWidth[] = [];
    private resizeMaxGhostWidth: MaxGhostWidth;
    private resizeMouseDown: boolean;
    private resizeLeftLastColumnShrunk: Column;
    private resizeRightLastColumnShrunk: Column;
    private resizeLastPosition: number;
    private resizeLastColumnInPair: string;
    private resizeHistory: ResizeHistory = {
        left: [],
        right: [],
    };
    private dropOverElement: boolean;
    private dropPositions: DropPosition[] = [];
    private dropPosition: DropPosition;
    private movePosition: DropPosition;

    /**
     * @param {ContentTypeInterface} parent
     * @param {ContentTypeConfigInterface} config
     * @param {number} stageId
     */
    constructor(
        parent: EditableArea,
        config: Config,
        stageId,
    ) {
        super(parent, config, stageId);

        events.on("block:removed", (args: BlockRemovedParams) => {
            if (args.parent.id === this.parent.id) {
                this.spreadWidth(event, args);
            }
        });

        // Listen for resizing events from child columns
        events.on("column:bindResizeHandle", (args) => {
            // Does the events parent match the previews parent? (e.g. column group)
            if (args.parent.id === this.parent.id) {
                (this as ColumnGroupPreview).registerResizeHandle(args.column, args.handle);
            }
        });
        events.on("column:initElement", (args) => {
            // Does the events parent match the previews parent? (e.g. column group)
            if (args.parent.id === this.parent.id) {
                (this as ColumnGroupPreview).bindDraggable(args.column);
            }
        });

        this.parent.children.subscribe(
            _.debounce(
                this.removeIfEmpty.bind(this),
                50,
            ),
        );
    }

    /**
     * Handle a new column being dropped into the group
     *
     * @param {Event} event
     * @param {JQueryUI.DroppableEventUIParam} ui
     * @param {DropPosition} dropPosition
     */
    public onNewColumnDrop(event: Event, ui: JQueryUI.DroppableEventUIParam, dropPosition: DropPosition) {
        event.preventDefault();
        event.stopImmediatePropagation();

        // Create our new column
        createColumn(
            this.parent,
            getSmallestColumnWidth(),
            dropPosition.insertIndex,
        ).then(() => {
            const newWidth = getAcceptedColumnWidth(
                (getColumnWidth(dropPosition.affectedColumn) - getSmallestColumnWidth()).toString(),
            );
            // Reduce the affected columns width by the smallest column width
            updateColumnWidth(dropPosition.affectedColumn, newWidth);
        });
    }

    /**
     * Handle an existing column being dropped into a new column group
     *
     * @param {Event} event
     * @param {DropPosition} movePosition
     */
    public onExistingColumnDrop(event: Event, movePosition: DropPosition) {
        const column: Column = getDragColumn();
        let modifyOldNeighbour;
        event.preventDefault();
        event.stopImmediatePropagation();

        // Determine which old neighbour we should modify
        const oldWidth = getColumnWidth(column);

        // Retrieve the adjacent column either +1 or -1
        if (getAdjacentColumn(column, "+1")) {
            modifyOldNeighbour = getAdjacentColumn(column, "+1");
        } else if (getAdjacentColumn(column, "-1")) {
            modifyOldNeighbour = getAdjacentColumn(column, "-1");
        }

        // Set the column to it's smallest column width
        updateColumnWidth(column, getSmallestColumnWidth());

        column.parent.removeChild(column);

        events.trigger("block:instanceDropped", {
            blockInstance: column,
            index: movePosition.insertIndex,
            parent: this,
            stageId: this.parent.stageId,
        });

        // Modify the old neighbour
        if (modifyOldNeighbour) {
            const oldNeighbourWidth = getAcceptedColumnWidth(
                (oldWidth + getColumnWidth(modifyOldNeighbour)).toString(),
            );
            updateColumnWidth(modifyOldNeighbour, oldNeighbourWidth);
        }

        // Modify the columns new neighbour
        const newNeighbourWidth = getAcceptedColumnWidth(
            (getColumnWidth(movePosition.affectedColumn) - getSmallestColumnWidth()).toString(),
        );

        // Reduce the affected columns width by the smallest column width
        updateColumnWidth(movePosition.affectedColumn, newNeighbourWidth);
    }

    /**
     * Handle a column being sorted into a new position in the group
     *
     * @param {Column} column
     * @param {number} newIndex
     */
    public onColumnSort(column: Column, newIndex: number) {
        const currentIndex = getColumnIndexInGroup(column);
        if (currentIndex !== newIndex) {
            if (currentIndex < newIndex) {
                // As we're moving an array item the keys all reduce by 1
                --newIndex;
            }
            moveArrayItem(this.parent.children, currentIndex, newIndex);
        }
    }

    /**
     * Handle a column being resized
     *
     * @param {Column} column
     * @param {number} width
     * @param {Column} adjustedColumn
     */
    public onColumnResize(column: Column, width: number, adjustedColumn: Column) {
        resizeColumn(column, width, adjustedColumn);
    }

    /**
     * Init the droppable & resizing interactions
     *
     * @param group
     */
    public bindInteractions(group: Element) {
        this.groupElement = $(group);
        this.initDroppable(this.groupElement);
        this.initMouseMove(this.groupElement);

        // Handle the mouse leaving the window
        $("body").mouseleave(this.endAllInteractions.bind(this));
    }

    /**
     * Init the drop placeholder
     *
     * @param element
     */
    public bindDropPlaceholder(element: Element) {
        this.dropPlaceholder = $(element);
    }

    /**
     * Init the move placeholder
     *
     * @param {Element} element
     */
    public bindMovePlaceholder(element: Element) {
        this.movePlaceholder = $(element);
    }

    /**
     * Retrieve the ghost element from the template
     *
     * @param {Element} ghost
     */
    public bindGhost(ghost: Element) {
        this.resizeGhost = $(ghost);
    }

    /**
     * Register a resize handle within a child column
     *
     * @param {Column} column
     * @param {JQuery<HTMLElement>} handle
     */
    public registerResizeHandle(column: Column, handle: JQuery<HTMLElement>) {
        handle.off("mousedown");
        handle.on("mousedown", (event) => {
            event.preventDefault();
            this.resizing(true);

            this.resizeColumnInstance = column;
            this.resizeColumnWidths = determineColumnWidths(this.resizeColumnInstance, this.groupElement);
            this.resizeMaxGhostWidth = determineMaxGhostWidth(this.resizeColumnWidths);

            // Set a flag of the columns which are currently being resized
            this.setColumnsAsResizing(column, getAdjacentColumn(column, "+1"));

            // Force the cursor to resizing
            $("body").css("cursor", "col-resize");

            // Reset the resize history
            this.resizeHistory = {
                left: [],
                right: [],
            };

            this.resizeLastPosition = null;
            this.resizeMouseDown = true;

            events.trigger("interaction:start", {stageId: this.parent.stageId});
        });
    }

    /**
     * Bind draggable instances to the child columns
     */
    public bindDraggable(column: Column) {
        column.element.draggable({
            appendTo: "body",
            containment: "body",
            handle: ".move-column",
            revertDuration: 250,
            helper() {
                const helper = $(this).clone();
                helper.css({
                    height: $(this).outerHeight() + "px",
                    minHeight: 0,
                    opacity: 0.5,
                    pointerEvents: "none",
                    width: $(this).outerWidth() + "px",
                    zIndex: 100,
                });
                return helper;
            },
            start: (event: Event) => {
                const columnInstance: Column = ko.dataFor($(event.target)[0]);
                // Use the global state as columns can be dragged between groups
                setDragColumn(columnInstance.parent);
                this.dropPositions = calculateDropPositions((this.parent as ColumnGroupBlock));

                events.trigger("column:drag:start", {
                    column: columnInstance,
                    stageId: this.parent.stageId,
                });
                events.trigger("interaction:start", {stageId: this.parent.stageId});
            },
            stop: () => {
                const draggedColumn: Column = getDragColumn();
                if (this.movePosition && draggedColumn) {
                    // Check if we're moving within the same group, even though this function will
                    // only ever run on the group that bound the draggable event
                    if (draggedColumn.parent === this.parent) {
                        this.onColumnSort(draggedColumn, this.movePosition.insertIndex);
                        this.movePosition = null;
                    }
                }

                removeDragColumn();

                this.dropPlaceholder.removeClass("left right");
                this.movePlaceholder.removeClass("active");

                events.trigger("column:drag:stop", {
                    column: draggedColumn,
                    stageId: this.parent.stageId,
                });
                events.trigger("interaction:stop", {stageId: this.parent.stageId});
            },
        });
    }

    /**
     * Set columns in the group as resizing
     *
     * @param {Column} columns
     */
    private setColumnsAsResizing(...columns: Column[]) {
        columns.forEach((column) => {
            column.preview.resizing(true);
        });
    }

    /**
     * Unset resizing flag on all child columns
     */
    private unsetResizingColumns() {
        (this.parent as ColumnGroupBlock).children().forEach((column: Column) => {
            column.preview.resizing(false);
        });
    }

    /**
     * End all current interactions
     */
    private endAllInteractions() {
        if (this.resizing() === true) {
            events.trigger("interaction:stop", {stageId: this.parent.stageId});
        }

        this.resizing(false);
        this.resizeMouseDown = null;
        this.resizeLeftLastColumnShrunk = this.resizeRightLastColumnShrunk = null;
        this.dropPositions = [];

        this.unsetResizingColumns();

        // Change the cursor back
        $("body").css("cursor", "");

        this.dropPlaceholder.removeClass("left right");
        this.movePlaceholder.removeClass("active");
        this.resizeGhost.removeClass("active");
    }

    /**
     * Init the resizing events on the group
     *
     * @param {JQuery<HTMLElement>} group
     */
    private initMouseMove(group: JQuery<HTMLElement>) {
        group.mousemove((event: JQuery.Event) => {
            this.onResizingMouseMove(event, group);
            this.onDraggingMouseMove(event, group);
            this.onDroppingMouseMove(event, group);
        }).mouseleave(() => {
            this.movePlaceholder.css("left", "").removeClass("active");
        });

        // As the mouse might be released outside of the group, attach to the body
        $("body").mouseup(() => {
            this.endAllInteractions();
        });
    }

    /**
     * Record the resizing history for this action
     *
     * @param {string} usedHistory
     * @param {string} direction
     * @param {Column} adjustedColumn
     * @param {string} modifyColumnInPair
     */
    private recordResizeHistory(
        usedHistory: string,
        direction: string,
        adjustedColumn: Column,
        modifyColumnInPair: string,
    ) {
        if (usedHistory) {
            this.resizeHistory[usedHistory].pop();
        }
        this.resizeHistory[direction].push({
            adjustedColumn,
            modifyColumnInPair,
        });
    }

    /**
     * Handle the resizing on mouse move, we always resize a pair of columns at once
     *
     * @param {JQuery.Event} event
     * @param {JQuery<HTMLElement>} group
     */
    private onResizingMouseMove(event: JQuery.Event, group: JQuery<HTMLElement>) {
        let newColumnWidth: ColumnWidth;

        if (this.resizeMouseDown) {
            event.preventDefault();
            const currentPos = event.pageX;
            const resizeColumnLeft = this.resizeColumnInstance.element.offset().left;
            const resizeColumnWidth = this.resizeColumnInstance.element.outerWidth();
            const resizeHandlePosition = resizeColumnLeft + resizeColumnWidth;
            const direction = (currentPos >= resizeHandlePosition) ? "right" : "left";

            let adjustedColumn: Column;
            let modifyColumnInPair: string; // We need to know if we're modifying the left or right column in the pair
            let usedHistory: string; // Was the adjusted column pulled from history?

            // Determine which column in the group should be adjusted for this action
            [adjustedColumn, modifyColumnInPair, usedHistory] = determineAdjustedColumn(
                group,
                currentPos,
                this.resizeColumnInstance,
                this.resizeHistory,
            );

            // Calculate the ghost width based on mouse position and bounds of allowed sizes
            const ghostWidth = calculateGhostWidth(
                group,
                currentPos,
                this.resizeColumnInstance,
                modifyColumnInPair,
                this.resizeMaxGhostWidth,
            );

            this.resizeGhost.width(ghostWidth - 15 + "px").addClass("active");

            if (adjustedColumn && this.resizeColumnWidths) {
                newColumnWidth = this.resizeColumnWidths.find((val) => {
                    return comparator(currentPos, val.position, 35) && val.forColumn === modifyColumnInPair;
                });

                if (newColumnWidth) {
                    let mainColumn = this.resizeColumnInstance;
                    // If we're using the left data set, we're actually resizing the right column of the group
                    if (modifyColumnInPair === "right") {
                        mainColumn = getAdjacentColumn(this.resizeColumnInstance, "+1");
                    }

                    // Ensure we aren't resizing multiple times, also validate the last resize isn't the same as the
                    // one being performed now. This occurs as we re-calculate the column positions on resize, we have
                    // to use the comparator as the calculation may result in slightly different numbers due to rounding
                    if (getColumnWidth(mainColumn) !== newColumnWidth.width &&
                        !comparator(this.resizeLastPosition, newColumnWidth.position, 10)
                    ) {
                        // If our previous action was to resize the right column in pair, and we're now dragging back
                        // to the right, but have matched a column for the left we need to fix the columns being
                        // affected
                        if (usedHistory && this.resizeLastColumnInPair === "right" && direction === "right" &&
                            newColumnWidth.forColumn === "left"
                        ) {
                            const originalMainColumn = mainColumn;
                            mainColumn = adjustedColumn;
                            adjustedColumn = getAdjacentColumn(originalMainColumn, "+1");
                        }

                        this.recordResizeHistory(
                            usedHistory,
                            direction,
                            adjustedColumn,
                            modifyColumnInPair,
                        );
                        this.resizeLastPosition = newColumnWidth.position;

                        this.resizeLastColumnInPair = modifyColumnInPair;

                        this.onColumnResize(
                            mainColumn,
                            newColumnWidth.width,
                            adjustedColumn,
                        );

                        // Wait for the render cycle to finish from the above resize before re-calculating
                        _.defer(() => {
                            // If we do a resize, re-calculate the column widths
                            this.resizeColumnWidths = determineColumnWidths(
                                this.resizeColumnInstance,
                                this.groupElement,
                            );
                            this.resizeMaxGhostWidth = determineMaxGhostWidth(this.resizeColumnWidths);
                        });
                    }
                }
            }
        }
    }

    /**
     * Handle a column being dragged around the group
     *
     * @param {JQuery.Event} event
     * @param {JQuery<HTMLElement>} group
     */
    private onDraggingMouseMove(event: JQuery.Event, group: JQuery<HTMLElement>) {
        const dragColumn: Column = getDragColumn();
        if (dragColumn) {
            // If the drop positions haven't been calculated for this group do so now
            if (this.dropPositions.length === 0) {
                this.dropPositions = calculateDropPositions((this.parent as ColumnGroupBlock));
            }
            const columnInstance = dragColumn;
            const currentX = event.pageX - $(group).offset().left;

            // Are we within the same column group or have we ended up over another?
            if (columnInstance.parent === this.parent) {
                const currentColumn = dragColumn.element;
                const currentColumnRight = currentColumn.position().left + currentColumn.width();
                const lastColInGroup = this.parent.children()[this.parent.children().length - 1].element;
                const insertLastPos = lastColInGroup.position().left + (lastColInGroup.width() / 2);

                this.movePosition = this.dropPositions.find((position) => {
                    // Only ever look for the left placement, except the last item where we look on the right
                    const placement = (currentX >= insertLastPos ? "right" : "left");
                    // There is 200px area over each column borders
                    return comparator(currentX, position[placement], 100) &&
                        !comparator(currentX, currentColumnRight, 100) &&
                        position.affectedColumn !== columnInstance && // Check affected column isn't the current column
                        position.placement === placement; // Verify the position, we only check left on sorting
                });

                if (this.movePosition) {
                    this.dropPlaceholder.removeClass("left right");
                    this.movePlaceholder.css({
                        left: (this.movePosition.placement === "left" ? this.movePosition.left : ""),
                        right: (this.movePosition.placement === "right" ?
                                $(group).outerWidth() - this.movePosition.right - 5 : ""
                        ),
                    }).addClass("active");
                } else {
                    this.movePlaceholder.removeClass("active");
                }
            } else {
                // If we're moving to another column group we utilise the existing drop placeholder
                this.movePosition = this.dropPositions.find((position) => {
                    return currentX > position.left && currentX < position.right && position.canShrink;
                });

                if (this.movePosition) {
                    const classToRemove = (this.movePosition.placement === "left" ? "right" : "left");
                    this.movePlaceholder.removeClass("active");
                    this.dropPlaceholder.removeClass(classToRemove).css({
                        left: (this.movePosition.placement === "left" ? this.movePosition.left : ""),
                        right: (this.movePosition.placement === "right" ?
                                $(group).width() - this.movePosition.right : ""
                        ),
                        width: $(group).width() / getMaxColumns() + "px",
                    }).addClass(this.movePosition.placement);
                } else {
                    this.dropPlaceholder.removeClass("left right");
                }
            }
        }
    }

    /**
     * Handle mouse move events on when dropping elements
     *
     * @param {JQuery.Event} event
     * @param {JQuery<HTMLElement>} group
     */
    private onDroppingMouseMove(event: JQuery.Event, group: JQuery<HTMLElement>) {
        if (this.dropOverElement) {
            const currentX = event.pageX - $(group).offset().left;
            this.dropPosition = this.dropPositions.find((position) => {
                return currentX > position.left && currentX < position.right && position.canShrink;
            });

            if (this.dropPosition) {
                this.dropPlaceholder.removeClass("left right").css({
                    left: (this.dropPosition.placement === "left" ? this.dropPosition.left : ""),
                    right: (this.dropPosition.placement === "right" ? $(group).width() - this.dropPosition.right : ""),
                    width: $(group).width() / getMaxColumns() + "px",
                }).addClass(this.dropPosition.placement);
            }
        }
    }

    /**
     * Init the droppable functionality for new columns
     *
     * @param {JQuery<HTMLElement>} group
     */
    private initDroppable(group: JQuery<HTMLElement>) {
        let currentDraggedBlock: GroupBlock;

        group.droppable({
            activate: (event: Event) => {
                currentDraggedBlock = ko.dataFor(event.currentTarget);
            },
            deactivate: () => {
                this.dropOverElement = null;
                this.dropPlaceholder.removeClass("left right");
            },
            drop: (event: Event, ui: JQueryUI.DroppableEventUIParam) => {
                if (this.dropOverElement && this.dropPosition) {
                    (this as ColumnGroupBlock).onNewColumnDrop(event, ui, this.dropPosition);
                    this.dropOverElement = null;
                }

                const column: Column = getDragColumn();

                if (this.movePosition && column && column.parent !== this.parent) {
                    (this as ColumnGroupBlock).onExistingColumnDrop(event, this.movePosition);
                }

                this.dropPositions = [];
                this.dropPlaceholder.removeClass("left right");
            },
            greedy: true,
            out: () => {
                this.dropOverElement = null;
                this.dropPlaceholder.removeClass("left right");
            },
            over: () => {
                // Always calculate drop positions when an element is dragged over
                this.dropPositions = calculateDropPositions((this.parent as ColumnGroupBlock));

                // Is the element currently being dragged a column?
                if (currentDraggedBlock instanceof GroupBlock &&
                    currentDraggedBlock.getConfig() === Config.getContentTypeConfig("column")
                ) {
                    this.dropOverElement = true;
                }
            },
        });
    }

    /**
     * Spread any empty space across the other columns
     *
     * @param {Event} event
     * @param {BlockRemovedParams} params
     */
    private spreadWidth(event: Event, params: BlockRemovedParams) {
        if (this.parent.children().length === 0) {
            return;
        }

        const availableWidth = 100 - getColumnsWidth(this.parent);
        const formattedAvailableWidth = getRoundedColumnWidth(availableWidth);
        const totalChildColumns = this.parent.children().length;
        const allowedColumnWidths = [];
        let spreadAcross = 1;
        let spreadAmount;

        for (let i = getMaxColumns(); i > 0; i--) {
            allowedColumnWidths.push(getRoundedColumnWidth(100 / 6 * i));
        }

        // Determine how we can spread the empty space across the columns
        for (let i = totalChildColumns; i > 0; i--) {
            const potentialWidth = Math.floor(formattedAvailableWidth / i);
            for (const width of allowedColumnWidths) {
                if (potentialWidth === Math.floor(width)) {
                    spreadAcross = i;
                    spreadAmount = formattedAvailableWidth / i;
                    break;
                }
            }
            if (spreadAmount) {
                break;
            }
        }

        // Let's spread the width across the columns
        for (let i = 1; i <= spreadAcross; i++) {
            let columnToModify: Column;

            // As the original column has been removed from the array, check the new index for a column
            if ((params.index) <= this.parent.children().length
                && typeof this.parent.children()[params.index] !== "undefined") {
                columnToModify = (this.parent.children()[params.index] as Column);
            }
            if (!columnToModify && (params.index - i) >= 0 &&
                typeof this.parent.children()[params.index - i] !== "undefined"
            ) {
                columnToModify = (this.parent.children()[params.index - i] as Column);
            }
            if (columnToModify) {
                updateColumnWidth(columnToModify, getColumnWidth(columnToModify) + spreadAmount);
            }
        }
    }

    /**
     * Remove self if we contain no children
     */
    private removeIfEmpty() {
        if (this.parent.children().length === 0) {
            this.parent.parent.removeChild(this.parent);
            return;
        }
    }
}

export interface ResizeHistory {
    left: ResizeHistoryItem[];
    right: ResizeHistoryItem[];
    [key: string]: ResizeHistoryItem[];
}

export interface ResizeHistoryItem {
    adjustedColumn: Column;
    modifyColumnInPair: string;
}

export interface MaxGhostWidth {
    left: number;
    right: number;
}

export interface ColumnWidth {
    name: string;
    position: number;
    width: number;
    forColumn: string;
}
