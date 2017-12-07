export default function (UIkit) {

    UIkit.component('nav', UIkit.components.accordion.extend({

        name: 'nav',

        defaults: {
            targets: '> .tele2-parent',
            toggle: '> a',
            content: '> ul'
        }

    }));

}
