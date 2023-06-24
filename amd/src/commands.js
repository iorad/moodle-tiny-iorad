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
 * Tiny iorad commands.
 *
 * @module tiny_iorad/commands
 * @copyright 2023 iorad <info@iorad.com>
 * @license http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

import {get_string as getString} from 'core/str';
import {component, buttonName, icon} from './common';
import {hasAnyIoradPermission} from "./options";
import {handleAction} from "./ui";
import {getButtonImage} from 'editor_tiny/utils';

export const getSetup = async() => {
    const [buttonText, buttonImage] = await Promise.all([
        getString('button_title', component, undefined, undefined),
        getButtonImage('icon', component),
    ]);

    // Note: The function returned here must be synchronous and cannot use promises.
    // All promises must be resolved prior to returning the function.
    return (editor) => {
        if (!hasAnyIoradPermission(editor)) {
            return;
        }

        // Register the iorad icon
        editor.ui.registry.addIcon(icon, buttonImage.html);

        // TODO test it
        // Register the Menu Button as a toggle.
        // This means that when highlighted over an existing iorad element it will show as toggled on.
        editor.ui.registry.addToggleButton(buttonName, {
            icon,
            tooltip: buttonText,
            onAction: () => handleAction(editor),
            onSetup: (api) => {
                // Set the button to be active if the current selection matches the iorad formatter registered above during PreInit.
                api.setActive(editor.formatter.match(component));
                const changed = editor.formatter.formatChanged(component, (state) => api.setActive(state));
                return () => changed.unbind();
            }
        });

        // Add the iorad Menu Item.
        // This allows it to be added to a standard menu, or a context menu.
        editor.ui.registry.addMenuItem(buttonName, {
            icon,
            text: buttonText,
            onAction: () => handleAction(editor),
        });
    };
};
