import { Class, Modal } from '../mixin/index';
import { $, addClass, assign, closest, css, hasClass, height, html, index, isString, on, Promise, removeClass, trigger } from '../util/index';

export default function (UIkit) {

    UIkit.component('modal', {

        mixins: [Modal],

        defaults: {
            clsPage: 'tele2-modal-page',
            clsPanel: 'tele2-modal-dialog',
            selClose: '.tele2-modal-close, .tele2-modal-close-default, .tele2-modal-close-outside, .tele2-modal-close-full'
        },

        events: [

            {
                name: 'show',

                self: true,

                handler() {

                    if (hasClass(this.panel, 'tele2-margin-auto-vertical')) {
                        addClass(this.$el, 'tele2-flex');
                    } else {
                        css(this.$el, 'display', 'block');
                    }

                    height(this.$el); // force reflow
                }
            },

            {
                name: 'hidden',

                self: true,

                handler() {

                    css(this.$el, 'display', '');
                    removeClass(this.$el, 'tele2-flex');

                }
            }

        ]

    });

    UIkit.component('overflow-auto', {

        mixins: [Class],

        computed: {

            modal(_, $el) {
                return closest($el, '.tele2-modal');
            },

            panel(_, $el) {
                return closest($el, '.tele2-modal-dialog');
            }

        },

        connected() {
            css(this.$el, 'minHeight', 150);
        },

        update: {

            write() {

                if (!this.panel || !this.modal) {
                    return;
                }

                var current = css(this.$el, 'maxHeight');

                css(css(this.$el, 'maxHeight', 150), 'maxHeight', Math.max(150, 150 + height(this.modal) - this.panel.offsetHeight));
                if (current !== css(this.$el, 'maxHeight')) {
                    trigger(this.$el, 'resize');
                }
            },

            events: ['load', 'resize']

        }

    });

    UIkit.modal.dialog = function (content, options) {

        var dialog = UIkit.modal(`
            <div class="tele2-modal">
                <div class="tele2-modal-dialog">${content}</div>
             </div>
        `, options);

        on(dialog.$el, 'hidden', ({target, current}) => {
            if (target === current) {
                dialog.$destroy(true);
            }
        });
        dialog.show();

        return dialog;
    };

    UIkit.modal.alert = function (message, options) {

        options = assign({bgClose: false, escClose: false, labels: UIkit.modal.labels}, options);

        return new Promise(
            resolve => on(UIkit.modal.dialog(`
                <div class="tele2-modal-body">${isString(message) ? message : html(message)}</div>
                <div class="tele2-modal-footer tele2-text-right">
                    <button class="tele2-button tele2-button-primary tele2-modal-close" autofocus>${options.labels.ok}</button>
                </div>
            `, options).$el, 'hide', resolve)
        );
    };

    UIkit.modal.confirm = function (message, options) {

        options = assign({bgClose: false, escClose: false, labels: UIkit.modal.labels}, options);

        return new Promise(
            (resolve, reject) => on(UIkit.modal.dialog(`
                <div class="tele2-modal-body">${isString(message) ? message : html(message)}</div>
                <div class="tele2-modal-footer tele2-text-right">
                    <button class="tele2-button tele2-button-default tele2-modal-close">${options.labels.cancel}</button>
                    <button class="tele2-button tele2-button-primary tele2-modal-close" autofocus>${options.labels.ok}</button>
                </div>
            `, options).$el, 'click', '.tele2-modal-footer button', ({target}) => index(target) === 0 ? reject() : resolve())
        );
    };

    UIkit.modal.prompt = function (message, value, options) {

        options = assign({bgClose: false, escClose: false, labels: UIkit.modal.labels}, options);

        return new Promise(resolve => {

            var resolved = false,
                prompt = UIkit.modal.dialog(`
                    <form class="tele2-form-stacked">
                        <div class="tele2-modal-body">
                            <label>${isString(message) ? message : html(message)}</label>
                            <input class="tele2-input" autofocus>
                        </div>
                        <div class="tele2-modal-footer tele2-text-right">
                            <button class="tele2-button tele2-button-default tele2-modal-close" type="button">${options.labels.cancel}</button>
                            <button class="tele2-button tele2-button-primary">${options.labels.ok}</button>
                        </div>
                    </form>
                `, options),
                input = $('input', prompt.$el);

            input.value = value;

            on(prompt.$el, 'submit', 'form', e => {
                e.preventDefault();
                resolve(input.value);
                resolved = true;
                prompt.hide()
            });
            on(prompt.$el, 'hide', () => {
                if (!resolved) {
                    resolve(null);
                }
            });

        });
    };

    UIkit.modal.labels = {
        ok: 'Ok',
        cancel: 'Cancel'
    }

}
