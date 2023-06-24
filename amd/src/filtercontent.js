// This file is part of Moodle - http://moodle.org/
//
// Moodle is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// Moodle is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with Moodle.  If not, see <http://www.gnu.org/licenses/>.

/**
 * Tiny iorad content configuration.
 *
 * @module tiny_iorad/filtercontent
 * @copyright 2023 iorad <info@iorad.com>
 * @license http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

import {registerPlaceholderSelectors} from 'editor_tiny/options';

export const setup = async(editor) => {
    const className = 'iorad-placeholder';
    const classSelector = `.${className}`;
    // Register iorad Formatter to the placeholder selector list.
    registerPlaceholderSelectors(editor, [classSelector]);
    // Register the iorad Formatter for use in all buttons.
    editor.on('PreInit', () => {
        editor.formatter.register('iorad', {
            inline: 'div',
            classes: className,
        });
    });

    editor.on('SetContent', () => {
        // Listen to the SetContent event on the editor and update any iorad-placeholder to not be editable.
        // Doing this means that the inner content of the placeholder cannot be changed without using the dialogue.
        // The SetContent event is called whenever content is changed by actions such as initial load, paste, undo, etc.
        editor.getBody().querySelectorAll(`${classSelector}:not([contenteditable])`).forEach((node) => {
            node.contentEditable = false;
        });
    });
};
