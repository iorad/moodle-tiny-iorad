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

import {component} from './common';
import {getPermissions} from './options';

import {renderForPromise} from 'core/templates';
import Modal from "tiny_iorad/modal";
import ModalEvents from 'core/modal_events';
import ModalFactory from 'core/modal_factory';
import {getButtonImage} from 'editor_tiny/utils';
import {get_string as getString} from 'core/str';

export const handleAction = async(editor) => {
    await displayDialogue(editor);
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
    return {
        elementid: editor.id,
        canEmbed: permissions.embed ?? false,
        showOptions: false,
        ...data
    };
};

/**
 * Verify if this could be a iorad URL.
 *
 * @param {string} url Url to verify
 * @return {boolean} whether this is a valid URL.
 */
const isValidUrl = (url) => {
    const regexList = [
        /^https?:\/\/(www\.|test\.|)iorad\.com\/player\/\d+(\/.*|)$/,
        /^https?:\/\/dev\.iorad\.dev\/player\/\d+(\/.*|)$/,
        /^https?:\/\/(www\.|)ior\.ad\/\w+\/?$/,
    ];

    return regexList.some(re => re.test(url));
};

const isValidIframe = (iframe) => {
    const element = document.createElement('div');
    element.innerHTML = iframe;
    const iframeElement = element.querySelector('iframe');
    return iframeElement && isValidUrl(iframeElement.src);
};

const buildIoradPlayer = (text) => {
    if (isValidUrl(text)) {
        return `<iframe src="${text}" width="100%" height="500px" style="width: 100%; height: 500px;"
                        referrerpolicy="strict-origin-when-cross-origin" frameborder="0" 
                        webkitallowfullscreen="webkitallowfullscreen" mozallowfullscreen="mozallowfullscreen" 
                        allowfullscreen="allowfullscreen" allow="camera; microphone; clipboard-write"></iframe>`;
    }

    return isValidIframe(text) ? text : '';
};

const isUrlInput = (htmlElement) => htmlElement?.constructor?.name === window.HTMLInputElement.name;
const isIframeInput = (htmlElement) => htmlElement?.constructor?.name === window.HTMLTextAreaElement.name;

const clearForm = (form) => {
    form.querySelector('.iorad-link-input').value = '';
    form.querySelector('.iorad-iframe-textarea').value = '';
    form.querySelector('.iorad-error-link').classList.add('iorad-hidden');
    form.querySelector('.iorad-error-iframe').classList.add('iorad-hidden');
    form.querySelector('.iorad-save-button').classList.remove('iorad-button-black');
    form.querySelector('.iorad-save-button').disabled = true;
};

const displayDialogue = async(editor, data = {}) => {
    const [switchToStepListText, switchToPlayerLinkText] = await Promise.all([
        getString('swicth_to_iframe', component, undefined, undefined),
        getString('swicth_to_url', component, undefined, undefined),
    ]);

    const selection = editor.selection.getNode();
    const currentData = selection.closest('.iorad-placeholder');
    data.ioradEmbedCode = currentData?.innerHTML;
    data.logo = (await getButtonImage('icon-colored', component)).html;

    const modal = await ModalFactory.create({
        type: Modal.TYPE,
        templateContext: getTemplateContext(editor, data),
        large: true,
    });

    modal.show();

    const $root = modal.getRoot();
    $root.on(ModalEvents.save, async(event, modal) => {
        event.preventDefault();

        const form = $root.get(0).querySelector('form');
        const inputElement = form.querySelector('.iorad-field-group:not(.iorad-hidden)')
            .querySelector('.iorad-link-input, .iorad-iframe-textarea');

        if (isUrlInput(inputElement) && !isValidUrl(inputElement.value.trim())) {
            form.querySelector('.iorad-error-link').classList.remove('iorad-hidden');
            return;
        }

        if (isIframeInput(inputElement) && !isValidIframe(inputElement.value.trim())) {
            form.querySelector('.iorad-error-iframe').classList.remove('iorad-hidden');
            return;
        }

        const ioradPlayer = buildIoradPlayer(inputElement.value.trim());
        const content = await renderForPromise(`${component}/content`, {ioradPlayer: ioradPlayer});

        editor.execCommand('mceInsertContent', false, content.html);
        modal.destroy();
    });

    $root.on('click', '.iorad-switch-button', () => {
        const form = $root.get(0).querySelector('form');
        clearForm(form);

        const ioradLinkElement = form.querySelector('.iorad-link-input');
        const ioradIframeElement = form.querySelector('.iorad-iframe-textarea');
        const ioradSwitchButtonElement = form.querySelector('.iorad-switch-button');

        if (ioradLinkElement.closest('.iorad-field-group').classList.contains('iorad-hidden')) {
            ioradLinkElement.closest('.iorad-field-group').classList.remove('iorad-hidden');
            ioradIframeElement.closest('.iorad-field-group').classList.add('iorad-hidden');
            ioradSwitchButtonElement.textContent = switchToStepListText;
        } else {
            ioradLinkElement.closest('.iorad-field-group').classList.add('iorad-hidden');
            ioradIframeElement.closest('.iorad-field-group').classList.remove('iorad-hidden');
            ioradSwitchButtonElement.textContent = switchToPlayerLinkText;
        }
    });

    $root.on('change, keyup', '.iorad-link-input, .iorad-iframe-textarea', (e) => {
        const inputElement = e.target;
        const form = $root.get(0).querySelector('form');

        form.querySelector('.iorad-error-link').classList.add('iorad-hidden');
        form.querySelector('.iorad-error-iframe').classList.add('iorad-hidden');

        if (isUrlInput(inputElement) && isValidUrl(inputElement.value.trim())) {
            form.querySelector('.iorad-save-button').classList.add('iorad-button-black');
            form.querySelector('.iorad-save-button').disabled = false;
        } else if (isIframeInput(inputElement) && isValidIframe(inputElement.value.trim())) {
            form.querySelector('.iorad-save-button').classList.add('iorad-button-black');
            form.querySelector('.iorad-save-button').disabled = false;
        } else {
            form.querySelector('.iorad-save-button').classList.remove('iorad-button-black');
            form.querySelector('.iorad-save-button').disabled = true;
        }
    });
};
