<?php
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

namespace tiny_iorad;

use context;
use editor_tiny\editor;
use editor_tiny\plugin;
use editor_tiny\plugin_with_buttons;
use editor_tiny\plugin_with_menuitems;

/**
 * Tiny iorad plugin.
 *
 * @package tiny_iorad
 * @copyright 2023 iorad <info@iorad.com>
 * @license https://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */
class plugininfo extends plugin implements plugin_with_buttons, plugin_with_menuitems {
    /**
     * Whether the plugin is enabled
     *
     * @param context $context The context that the editor is used within
     * @param array $options The options passed in when requesting the editor
     * @param array $fpoptions The filepicker options passed in when requesting the editor
     * @param editor|null $editor $editor The editor instance in which the plugin is initialised
     * @return boolean
     */
    public static function is_enabled(context $context, array $options, array $fpoptions, ?editor $editor = null): bool {
        return true;
    }

    public static function get_available_buttons(): array {
        return [
            'tiny_iorad/tiny_iorad_button',
        ];
    }

    public static function get_available_menuitems(): array {
        return [
            'tiny_iorad/tiny_iorad_button',
        ];
    }
}
