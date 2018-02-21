/**
 * Copyright © Magento, Inc. All rights reserved.
 * See COPYING.txt for license details.
 */

/**
 * Convert HEX value to RGB or RGBA
 *
 * @param hexValue
 * @param alphaValue optional
 * @returns {string}
 */
export function fromHex(hexValue: string, alphaValue: string) {
    const shorthandHexRegEx = /^#([a-f\d])([a-f\d])([a-f\d])$/i;
    hexValue = hexValue.replace(shorthandHexRegEx, (m, r, g, b) => {
        return r + r + g + g + b + b;
    });
    const colors = /^#([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hexValue);
    const red = parseInt(colors[1], 16);
    const green = parseInt(colors[2], 16);
    const blue = parseInt(colors[3], 16);
    if (alphaValue === "NaN") {
        alphaValue = "0";
    }
    if (alphaValue) {
        return "rgba(" + red + "," + green + "," + blue + "," + alphaValue + ")";
    } else {
        return "rgba(" + red + "," + green + "," + blue + ")";
    }
}

/**
 * Adds 0 if HEX value is string character
 *
 * @returns string
 */
function padZero(value: string) {
    if (value.length === 1) {
        value = "0" + value;
    }
    return value;
}

/**
 * Convert RGB or RGBA value to HEX
 *
 * @param value "rgba(255,85,51,0.2)"
 * @returns {string}
 */
export function toHex(value: string) {
    const values = value.replace("#", "").match(/\d+/g);
    const r = parseInt(values[0], 10).toString(16);
    const g = parseInt(values[1], 10).toString(16);
    const b = parseInt(values[2], 10).toString(16);
    return "#" + padZero(r) + padZero(g) + padZero(b);
}
