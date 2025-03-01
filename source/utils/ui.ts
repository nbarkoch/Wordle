/* eslint-disable no-bitwise */

import {colors, ThemeColor} from './colors';
import {Correctness} from './words';

// Helper function to darken a hex color
export const darkenColor = (color: string, percent: number) => {
  const num = parseInt(color.replace('#', ''), 16),
    amt = Math.round(2.55 * percent),
    R = (num >> 16) - amt,
    G = ((num >> 8) & 0x00ff) - amt,
    B = (num & 0x0000ff) - amt;
  return (
    '#' +
    (
      0x1000000 +
      (R < 255 ? (R < 1 ? 0 : R) : 255) * 0x10000 +
      (G < 255 ? (G < 1 ? 0 : G) : 255) * 0x100 +
      (B < 255 ? (B < 1 ? 0 : B) : 255)
    )
      .toString(16)
      .slice(1)
  );
};

export function rgbaToHex(rgba: string) {
  // Use a regular expression to extract the rgba values
  const result = rgba.match(/rgba?\((\d+),\s*(\d+),\s*(\d+),\s*([\d.]+)\)/);

  if (!result) {
    throw new Error('Invalid RGBA format');
  }

  const r = parseInt(result[1], 10);
  const g = parseInt(result[2], 10);
  const b = parseInt(result[3], 10);
  const a = parseFloat(result[4]);

  // Helper function to convert a number to a two-digit hex
  const toHex = (value: number) => {
    const hex = value.toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };

  // Convert the alpha to a two-digit hex value (from 0-255)
  const alpha = Math.round(a * 255);

  // Return the formatted hex color
  return `#${toHex(r)}${toHex(g)}${toHex(b)}${toHex(alpha)}`;
}

/**
 * Sets the opacity of a color string (hex or rgba).
 * @param {string} color - The color string (hex or rgba).
 * @param {number} opacity - The opacity value (0 to 1).
 * @returns {string} The color string with the new opacity.
 */
export function setColorOpacity(color: string, opacity: number) {
  // Check if the color is in hex format
  if (color.startsWith('#')) {
    color = color.replace('#', '');
    // Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
    if (color.length === 3) {
      color = color
        .split('')
        .map(char => char + char)
        .join('');
    }
    const r = parseInt(color.substr(0, 2), 16);
    const g = parseInt(color.substr(2, 2), 16);
    const b = parseInt(color.substr(4, 2), 16);
    return rgbaToHex(`rgba(${r}, ${g}, ${b}, ${opacity})`);
  }

  // Check if the color is in rgba format
  const rgbaMatch = color.match(
    /^rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([0-9.]+))?\)$/,
  );
  if (rgbaMatch) {
    const [, r, g, b] = rgbaMatch;
    return rgbaToHex(`rgba(${r}, ${g}, ${b}, ${opacity})`);
  }

  // If the color format is not recognized, return the original color
  console.warn('Unrecognized color format. Returning original color.');
  return color;
}

export const lightenColor = (color: string, percent: number): string => {
  // Remove the hash if it exists
  color = color.replace('#', '');

  let R, G, B, A;

  if (color.length === 8) {
    // Color has opacity
    R = parseInt(color.slice(0, 2), 16);
    G = parseInt(color.slice(2, 4), 16);
    B = parseInt(color.slice(4, 6), 16);
    A = color.slice(6, 8);
  } else if (color.length === 6) {
    // Color doesn't have opacity
    R = parseInt(color.slice(0, 2), 16);
    G = parseInt(color.slice(2, 4), 16);
    B = parseInt(color.slice(4, 6), 16);
  } else {
    throw new Error('Invalid hex color format');
  }

  // Calculate the lightening effect
  const amt = Math.round(2.55 * percent);
  R = Math.min(255, Math.max(0, R + amt));
  G = Math.min(255, Math.max(0, G + amt));
  B = Math.min(255, Math.max(0, B + amt));

  // Convert back to hex
  const RR = R.toString(16).padStart(2, '0');
  const GG = G.toString(16).padStart(2, '0');
  const BB = B.toString(16).padStart(2, '0');

  // Return the result with or without opacity
  return A ? `#${RR}${GG}${BB}${A}` : `#${RR}${GG}${BB}`;
};

export const colorLightMap: {[key in Exclude<Correctness, null>]: ThemeColor} =
  {
    correct: colors.lightGreen,
    exists: colors.lightYellow,
    notInUse: colors.lightRed,
  };

export const colorMediumMap: {[key in Exclude<Correctness, null>]: string} = {
  correct: lightenColor(colors.green, -20),
  exists: lightenColor(colors.yellow, -20),
  notInUse: lightenColor(colors.red, -20),
};

export const colorMap: {[key in Exclude<Correctness, null>]: ThemeColor} = {
  correct: colors.green,
  exists: colors.yellow,
  notInUse: colors.red,
};
