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
 * Tiny iorad UI.
 *
 * @module tiny_iorad/ui
 * @copyright 2023 iorad <info@iorad.com>
 * @license http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

import {displayFilepicker} from 'editor_tiny/utils';
import {component} from './common';
import {getPermissions} from './options';

import Config from 'core/config';
import {getList} from 'core/normalise';
import {renderForPromise} from 'core/templates';
import Modal from "tiny_iorad/modal";
import ModalEvents from 'core/modal_events';
import ModalFactory from 'core/modal_factory';
import Pending from 'core/pending';


let openingSelection = null;

export const handleAction = (editor) => {
    openingSelection = editor.selection.getBookmark();
    displayDialogue(editor);
};

/**
 * Get the template context for the dialogue.
 *
 * @param {TinyMCE} editor
 * @param {object} data
 * @returns {object} data
 */
const getTemplateContext = (editor, data) => {
    const permissions = getPermissions(editor);
    return Object.assign({}, {
        elementid: editor.id,
        canEmbed: permissions.embed ?? false,
        showOptions: false,
        fileURL: data?.url ?? '',
    }, data);
};

const handleDialogueSubmission = async(editor, modal, data) => {
    const pendingPromise = new Pending('tiny_iorad:handleDialogueSubmission');

    const form = getList(modal.getRoot())[0].querySelector('form');
    if (!form) {
        // The form couldn't be found, which is weird.
        // This should not happen.
        // Display the dialogue again.
        modal.destroy();
        await displayDialogue(editor, Object.assign({}, data));
        pendingPromise.resolve();
        return;
    }

    // Get the URL from the submitted form.
    const submittedUrl = form.querySelector('input[name="url"]').value;
    const url = getUrlFromSubmission(form, submittedUrl, getPermissions(editor));

    if (!url) {
        // The URL is invalid.
        // Fill it in and represent the dialogue with an error.
        modal.destroy();
        await displayDialogue(editor, Object.assign({}, data, {url: submittedUrl, invalidUrl: true}));
        pendingPromise.resolve();
        return;
    }

    const content = await renderForPromise(`${component}/content`, {
        url: url.toString(),
    });

    editor.selection.moveToBookmark(openingSelection);
    editor.execCommand('mceInsertContent', false, content.html);
    editor.selection.moveToBookmark(openingSelection);
    pendingPromise.resolve();
};

/**
 * Verify if this could be a h5p URL.
 *
 * @param {string} url Url to verify
 * @return {boolean} whether this is a valid URL.
 */
const isValidUrl = (url) => {
    const pattern = new RegExp('^(https?:\\/\\/)?' + // Protocol.
        '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|' + // Domain name.
        '((\\d{1,3}\\.){3}\\d{1,3}))' + // OR ip (v4) address.
        '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*'); // Port and path.
    return !!pattern.test(url);
};

/**
 * Get the URL from the submitted form.
 *
 * @param {FormNode} form
 * @param {string} submittedUrl
 * @param {object} permissions
 * @returns {URL|null}
 */
const getUrlFromSubmission = (form, submittedUrl, permissions) => {
    if (!submittedUrl || (!submittedUrl.startsWith(Config.wwwroot) && !isValidUrl(submittedUrl))) {
        return null;
    }

    // Generate a URL Object for the submitted URL.
    const url = new URL(submittedUrl);

    if (permissions?.embed) {
        if (form.querySelector('[name="embed"]').checked) {
            url.searchParams.append('embed', "1");
        }
    }

    return url;
};

const getCurrentIoradData = (ioradData) => {
    const data = {};
    let url;
    try {
        url = new URL(ioradData.textContent);
    } catch (error) {
        return data;
    }

    if (url.searchParams.has('embed')) {
        data.embed = true;
        data.showOptions = true;
        url.searchParams.delete('embed');
    }

    data.url = url.toString();

    return data;
};

const displayDialogue = async(editor, data = {}) => {
    const selection = editor.selection.getNode();
    const currentH5P = selection.closest('.h5p-placeholder');
    if (currentH5P) {
        Object.assign(data, getCurrentIoradData(currentH5P));
    }

    const modal = await ModalFactory.create({
        type: Modal.TYPE,
        templateContext: getTemplateContext(editor, data),
        large: true,
    });
    modal.show();

    const $root = modal.getRoot();
    const root = $root[0];
    $root.on(ModalEvents.save, (event, modal) => {
        handleDialogueSubmission(editor, modal, data);
    });

    root.addEventListener('click', (e) => {
        const filepickerButton = e.target.closest('[data-target="filepicker"]');
        if (filepickerButton) {
            displayFilepicker(editor, 'h5p').then((params) => {
                if (params.url !== '') {
                    const input = root.querySelector('form input[name="url"]');
                    input.value = params.url;
                }
                return params;
            })
                .catch();
        }
    });
};
