# Moodle iorad tinyMCE editor plugin #

[![Moodle Plugin CI](https://github.com/iorad/moodle-tiny-iorad/actions/workflows/moodle-plugin-ci.yml/badge.svg?branch=master)](https://github.com/iorad/moodle-tiny-iorad/actions/workflows/moodle-plugin-ci.yml)

Instantly create step-by-step tutorials. No uploads. No screenshot editing. See [how it works](https://www.iorad.com/tutorialbuilder).

Creating solution articles is extremely painful and time consuming. A 20 step article takes 1-2 hours to make. Take a screenshot, edit it, upload...rinse and repeat. Precious time wasted. Worst of all it’s your most valuable employee, a power user, thats tasked with doing this.

What if I told you iorad could speed this process -10X. That’s right. That same solution article could be done in under 5 minutes.

This makes it easy to embed iorad tutorial using the [tinyMCE editor](https://docs.moodle.org/311/en/TinyMCE_editor) and share them with your course participants.

## Installing via uploaded ZIP file ##

1. Log in to your Moodle site as an admin and go to _Site administration >
   Plugins > Install plugins_.
2. Upload the ZIP file with the plugin code. You should only be prompted to add
   extra details if your plugin type is not automatically detected.
3. Check the plugin validation report and finish the installation.

## Installing manually ##

The plugin can be also installed by putting the contents of this directory to

    {your/moodle/dirroot}/lib/editor/tiny/plugins/iorad

Afterwards, log in to your Moodle site as an admin and go to _Site administration >
Notifications_ to complete the installation.

Alternatively, you can run

    $ php admin/cli/upgrade.php

to complete the installation from the command line.

## License ##

This program is free software: you can redistribute it and/or modify it under
the terms of the GNU General Public License as published by the Free Software
Foundation, either version 3 of the License, or (at your option) any later
version.

This program is distributed in the hope that it will be useful, but WITHOUT ANY
WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A
PARTICULAR PURPOSE.  See the GNU General Public License for more details.

You should have received a copy of the GNU General Public License along with
this program.  If not, see <https://www.gnu.org/licenses/>.
