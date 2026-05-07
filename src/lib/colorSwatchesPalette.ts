import { DEFAULT_THEME } from '@mantine/core';

export const COLOR_SWATCHES: string[] = (() => {
    const colorNamesA = [
        'red', 'pink', 'grape', 'violet', 'indigo', 'blue', 'cyan',
    ] as const;
    const colorNamesB = [
        'teal', 'green', 'lime', 'yellow', 'orange', 'gray', 'dark'
    ] as const;
    const colorSwatches: string[] = [];
    for (let shade = 2; shade <= 7; shade += 2) {
        for (const colorName of colorNamesA) {
            colorSwatches.push(DEFAULT_THEME.colors[colorName][shade]);
        }
    }
    for (let shade = 2; shade <= 7; shade += 2) {
        for (const colorName of colorNamesB) {
            colorSwatches.push(DEFAULT_THEME.colors[colorName][shade]);
        }
    }
    return colorSwatches;
})();