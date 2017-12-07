import { Class } from '../mixin/index';
import { hasClass } from '../util/index';

export default function (UIkit) {

    UIkit.component('tab', UIkit.components.switcher.extend({

        mixins: [Class],

        name: 'tab',

        props: {
            media: 'media'
        },

        defaults: {
            media: 960,
            attrItem: 'tele2-tab-item'
        },

        init() {

            var cls = hasClass(this.$el, 'tele2-tab-left')
                ? 'tele2-tab-left'
                : hasClass(this.$el, 'tele2-tab-right')
                    ? 'tele2-tab-right'
                    : false;

            if (cls) {
                UIkit.toggle(this.$el, {cls, mode: 'media', media: this.media});
            }
        }

    }));

}
