/**
 * @module converse-chatboxviews
 * @copyright 2020, the Converse.js contributors
 * @license Mozilla Public License (MPLv2)
 */
import './components/converse.js';
import "@converse/headless/converse-chatboxes";
import tpl_avatar from "templates/avatar.svg";
import tpl_background_logo from "templates/background_logo.html";
import { View } from "@converse/skeletor/src/view";
import { ElementView } from "@converse/skeletor/src/element";
import { _converse, api, converse } from "@converse/headless/converse-core";
import { html, render } from "lit-html";


const AvatarMixin = {

    renderAvatar (el) {
        el = el || this.el;
        const avatar_el = el.querySelector('canvas.avatar, svg.avatar');
        if (avatar_el === null) {
            return;
        }
        if (this.model.vcard) {
            const data = {
                'classes': avatar_el.getAttribute('class'),
                'width': avatar_el.getAttribute('width'),
                'height': avatar_el.getAttribute('height'),
            }
            const image_type = this.model.vcard.get('image_type');
            const image = this.model.vcard.get('image');
            data['image'] = "data:" + image_type + ";base64," + image;
            avatar_el.outerHTML = tpl_avatar(data);
        }
    },
};


class ChatBoxViews extends ElementView {

    initialize () {
        this.model = _converse.chatboxes;

        this.listenTo(this.model, "destroy", this.removeChat)
        api.listen.on('clearSession', () => this.closeAllChatBoxes());

        const bg = document.getElementById('conversejs-bg');
        if (bg && !bg.innerHTML.trim()) {
            bg.innerHTML = tpl_background_logo();
        }
        const body = document.querySelector('body');
        body.classList.add(`converse-${api.settings.get("view_mode")}`);
        this.classList.add(`converse-${api.settings.get("view_mode")}`);
        if (api.settings.get("singleton")) {
            this.classList.add(`converse-singleton`);
        }
        this.render();
        /**
         * Triggered once the _converse.ChatBoxViews view-colleciton has been initialized
         * @event _converse#chatBoxViewsInitialized
         * @example _converse.api.listen.on('chatBoxViewsInitialized', () => { ... });
         */
        api.trigger('chatBoxViewsInitialized');
    }

    render () {
        render(html`<div class="converse-chatboxes row no-gutters"></div>`, this);
        this.row_el = this.querySelector('.row');
    }

    /**
     * Add a new DOM element (likely a chat box) into the
     * the row managed by this overview.
     * @param { HTMLElement } el
     */
    insertRowColumn (el) {
        this.row_el.insertAdjacentElement('afterBegin', el);
    }

    removeChat (item) {
        this.remove(item.get('id'));
    }

    closeAllChatBoxes () {
        return Promise.all(this.map(v => v.close({'name': 'closeAllChatBoxes'})));
    }
}

api.elements.define('converse-chats', ChatBoxViews);


converse.plugins.add('converse-chatboxviews', {

    dependencies: ["converse-chatboxes", "converse-vcard"],


    initialize () {
        /* The initialize function gets called as soon as the plugin is
         * loaded by converse.js's plugin machinery.
         */
        api.elements.register();

        api.promises.add(['chatBoxViewsInitialized']);

        // Configuration values for this plugin
        // ====================================
        // Refer to docs/source/configuration.rst for explanations of these
        // configuration settings.
        api.settings.extend({
            'animate': true,
            'theme': 'default',
        });

        _converse.ViewWithAvatar = View.extend(AvatarMixin);
        _converse.ChatBoxViews = ChatBoxViews;

        /************************ BEGIN Event Handlers ************************/
        api.listen.on('cleanup', () => (delete _converse.chatboxviews));


        function calculateViewportHeightUnit () {
            const vh = window.innerHeight * 0.01;
            document.documentElement.style.setProperty('--vh', `${vh}px`);
        }
        api.listen.on('chatBoxViewsInitialized', () => calculateViewportHeightUnit());
        window.addEventListener('resize', () => calculateViewportHeightUnit());
        /************************ END Event Handlers ************************/


        Object.assign(converse, {
            /**
             * Public API method which will ensure that the #conversejs element
             * is inserted into a container element.
             *
             * This method is useful when the #conversejs element has been
             * detached from the DOM somehow.
             * @async
             * @memberOf converse
             * @method insertInto
             * @example
             * converse.insertInto(document.querySelector('#converse-container'));
             */
            insertInto (container) {
                const el = _converse.chatboxviews?.el;
                if (el && !container.contains(el)) {
                    container.insertAdjacentElement('afterBegin', el);
                    api.chatviews.get()
                        .filter(v => v.model.get('id') !== 'controlbox')
                        .forEach(v => v.maintainScrollTop());

                } else if (!el) {
                    throw new Error("Cannot insert non-existing #conversejs element into the DOM");
                }
            }
        });
    }
});
