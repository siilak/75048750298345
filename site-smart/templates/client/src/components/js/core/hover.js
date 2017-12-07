import { $$, addClass, doc, hasTouch, on, ready, removeClass, within } from '../util/index';

export default function (UIkit) {

    ready(() => {

        if (!hasTouch) {
            return;
        }

        var cls = 'tele2-hover';

        on(doc, 'tap', ({target}) =>
            $$(`.${cls}`).forEach((_, el) =>
                !within(target, el) && removeClass(el, cls)
            )
        );

        Object.defineProperty(UIkit, 'hoverSelector', {

            set(selector) {
                on(doc, 'tap', selector, ({current}) => addClass(current, cls));
            }

        });

        UIkit.hoverSelector = '.tele2-animation-toggle, .tele2-transition-toggle, [tele2-hover]';

    });

}
