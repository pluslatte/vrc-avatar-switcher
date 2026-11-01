import { DEFAULT_THEME } from '@mantine/core';

export const COLOR_SWATCHES: string[] = (() => {
    const colorNamesA = [
        'red', 'pink', 'grape', 'violet', 'indigo', 'blue', 'cyan',
    ] as const;
    const colorNamesB = [
        'teal', 'green', 'lime', 'yellow', 'orange', 'gray', 'dark'
    ] as const;
    return [colorNamesA, colorNamesB].flatMap(names =>
        [2, 4, 6].flatMap(shade => names.map(name => DEFAULT_THEME.colors[name][shade])),
    );
})();