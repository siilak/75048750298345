import { $$, camelize, fastdom, isJQuery, isPlainObject, isUndefined, startsWith } from '../util/index';

export default function (UIkit) {

    const DATA = UIkit.data;

    UIkit.components = {};

    UIkit.component = function (id, options) {

        var name = camelize(id);

        if (isPlainObject(options)) {
            options.name = name;
            options = UIkit.extend(options);
        } else if (isUndefined(options)) {
            return UIkit.components[name]
        } else {
            options.options.name = name;
        }

        UIkit.components[name] = options;

        UIkit[name] = function (element, data) {

            if (isPlainObject(element)) {
                return new UIkit.components[name]({data: element});
            }

            if (UIkit.components[name].options.functional) {
                return new UIkit.components[name]({data: [...arguments]});
            }

            return element && element.nodeType ? init(element) : $$(element).map(init)[0];

            function init(element) {
                return UIkit.getComponent(element, name) || new UIkit.components[name]({el: element, data: data || {}});
            }

        };

        if (UIkit._initialized && !options.options.functional) {
            fastdom.read(() => UIkit[name](`[tele2-${id}],[data-tele2-${id}]`));
        }

        return UIkit.components[name];
    };

    UIkit.getComponents = element => element && (element = isJQuery(element) ? element[0] : element) && element[DATA] || {};
    UIkit.getComponent = (element, name) => UIkit.getComponents(element)[name];

    UIkit.connect = node => {

        var name;

        if (node[DATA]) {
            for (name in node[DATA]) {
                node[DATA][name]._callConnected();
            }
        }

        for (var i = 0; i < node.attributes.length; i++) {

            name = node.attributes[i].name;

            if (startsWith(name, 'tele2-') || startsWith(name, 'data-tele2-')) {

                name = camelize(name.replace('data-tele2-', '').replace('tele2-', ''));

                if (UIkit[name]) {
                    UIkit[name](node);
                }
            }
        }

    };

    UIkit.disconnect = node => {
        for (var name in node[DATA]) {
            node[DATA][name]._callDisconnected();
        }
    }

}
