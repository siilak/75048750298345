;(function (root, factory) {
    'use strict';
    /*global define,module*/

    if (typeof module === 'object' && typeof module.exports === 'object') {
        // Node, CommonJS-like
        module.exports = factory(root, document);
    } else if (typeof define === 'function' && define.amd) {
        // AMD
        define(null, function () {
            factory(root, document)
        });
    } else {
        // Browser globals (root is window)
        root.pleierbg = factory(root, document);
    }
}(typeof window !== 'undefined' ? window : this, function (window, document) {
    'use strict';

    // Globals
    var fullscreen,
        scroll = {x: 0, y: 0},

        // Default config
        defaults = {
            enabled: true,
            debug: false,
            autoplay: false,
            loop: false,
            seekTime: 10,
            volume: 10,
            volumeMin: 0,
            volumeMax: 10,
            volumeStep: 1,
            duration: null,
            displayDuration: true,
            loadSprite: true,
            iconPrefix: 'pleier',
            iconUrl: '/site/templates/pleier/sprite/pleier.svg',
            clickToPlay: true,
            hideControls: true,
            showPosterOnEnd: false,
            disableContextMenu: true,
            tooltips: {
                controls: false,
                seek: true
            },
            selectors: {
                html5: 'video, audio',
                embed: '[data-type]',
                container: '.pleierbg',
                controls: {
                    container: null,
                    wrapper: '.pleierbg__controls'
                },
                labels: '[data-pleierbg]',
                buttons: {
                    seek: '[data-pleierbg="seek"]',
                    play: '[data-pleierbg="play"]',
                    pause: '[data-pleierbg="pause"]',
                    restart: '[data-pleierbg="restart"]',
                    rewind: '[data-pleierbg="rewind"]',
                    forward: '[data-pleierbg="fast-forward"]',
                    mute: '[data-pleierbg="mute"]',
                    captions: '[data-pleierbg="captions"]',
                    fullscreen: '[data-pleierbg="fullscreen"]'
                },
                volume: {
                    input: '[data-pleierbg="volume"]',
                    display: '.pleierbg__volume--display'
                },
                progress: {
                    container: '.pleierbg__progress',
                    buffer: '.pleierbg__progress--buffer',
                    played: '.pleierbg__progress--played'
                },
                captions: '.pleierbg__captions',
                currentTime: '.pleierbg__time--current',
                duration: '.pleierbg__time--duration'
            },
            classes: {
                videoWrapper: 'pleierbg__video-wrapper',
                embedWrapper: 'pleierbg__video-embed',
                type: 'pleierbg--{0}',
                stopped: 'pleierbg--stopped',
                playing: 'pleierbg--playing',
                muted: 'pleierbg--muted',
                loading: 'pleierbg--loading',
                hover: 'pleierbg--hover',
                tooltip: 'pleierbg__tooltip',
                hidden: 'pleierbg__sr-only',
                hideControls: 'pleierbg--hide-controls',
                isIos: 'pleierbg--is-ios',
                isTouch: 'pleierbg--is-touch',
                captions: {
                    enabled: 'pleierbg--captions-enabled',
                    active: 'pleierbg--captions-active'
                },
                fullscreen: {
                    enabled: 'pleierbg--fullscreen-enabled',
                    active: 'pleierbg--fullscreen-active'
                },
                tabFocus: 'tab-focus'
            },
            captions: {
                defaultActive: false
            },
            fullscreen: {
                enabled: true,
                fallback: true,
                allowAudio: false
            },
            storage: {
                enabled: true,
                key: 'pleierbg'
            },
            controls: ['play-large', 'play', 'progress', 'current-time', 'mute', 'volume', 'captions', 'fullscreen'],
            i18n: {
                restart: 'Restart',
                rewind: 'Rewind {seektime} secs',
                play: 'Play',
                pause: 'Pause',
                forward: 'Forward {seektime} secs',
                played: 'played',
                buffered: 'buffered',
                currentTime: 'Current time',
                duration: 'Duration',
                volume: 'Volume',
                toggleMute: 'Toggle Mute',
                toggleCaptions: 'Toggle Captions',
                toggleFullscreen: 'Toggle Fullscreen',
                frameTitle: 'Player for {title}'
            },
            types: {
                embed: ['youtube', 'vimeo', 'soundcloud'],
                html5: ['video', 'audio']
            },
            // URLs
            urls: {
                vimeo: {
                    api: 'https://player.vimeo.com/api/player.js',
                },
                youtube: {
                    api: 'https://www.youtube.com/iframe_api'
                },
                soundcloud: {
                    api: 'https://w.soundcloud.com/player/api.js'
                }
            },
            // Custom control listeners
            listeners: {
                seek: null,
                play: null,
                pause: null,
                restart: null,
                rewind: null,
                forward: null,
                mute: null,
                volume: null,
                captions: null,
                fullscreen: null
            },
            // Events to watch on HTML5 media elements
            events: ['ended', 'progress', 'stalled', 'playing', 'waiting', 'canplay', 'canplaythrough', 'loadstart', 'loadeddata', 'loadedmetadata', 'timeupdate', 'volumechange', 'play', 'pause', 'error', 'seeking', 'emptied']
        };

    // Credits: http://paypal.github.io/accessible-html5-video-player/
    // Unfortunately, due to mixed support, UA sniffing is required
    function _browserSniff() {
        var ua = navigator.userAgent,
            name = navigator.appName,
            fullVersion = '' + parseFloat(navigator.appVersion),
            majorVersion = parseInt(navigator.appVersion, 10),
            nameOffset,
            verOffset,
            ix,
            isIE = false,
            isFirefox = false,
            isChrome = false,
            isSafari = false;

        // MSIE 11
        if ((navigator.appVersion.indexOf('Windows NT') !== -1) && (navigator.appVersion.indexOf('rv:11') !== -1)) {
            isIE = true;
            name = 'IE';
            fullVersion = '11';
        }
        // MSIE
        else if ((verOffset = ua.indexOf('MSIE')) !== -1) {
            isIE = true;
            name = 'IE';
            fullVersion = ua.substring(verOffset + 5);
        }
        // Chrome
        else if ((verOffset = ua.indexOf('Chrome')) !== -1) {
            isChrome = true;
            name = 'Chrome';
            fullVersion = ua.substring(verOffset + 7);
        }
        // Safari
        else if ((verOffset = ua.indexOf('Safari')) !== -1) {
            isSafari = true;
            name = 'Safari';
            fullVersion = ua.substring(verOffset + 7);
            if ((verOffset = ua.indexOf('Version')) !== -1) {
                fullVersion = ua.substring(verOffset + 8);
            }
        }
        // Firefox
        else if ((verOffset = ua.indexOf('Firefox')) !== -1) {
            isFirefox = true;
            name = 'Firefox';
            fullVersion = ua.substring(verOffset + 8);
        }
        // In most other browsers, 'name/version' is at the end of userAgent
        else if ((nameOffset = ua.lastIndexOf(' ') + 1) < (verOffset = ua.lastIndexOf('/'))) {
            name = ua.substring(nameOffset, verOffset);
            fullVersion = ua.substring(verOffset + 1);

            if (name.toLowerCase() == name.toUpperCase()) {
                name = navigator.appName;
            }
        }

        // Trim the fullVersion string at semicolon/space if present
        if ((ix = fullVersion.indexOf(';')) !== -1) {
            fullVersion = fullVersion.substring(0, ix);
        }
        if ((ix = fullVersion.indexOf(' ')) !== -1) {
            fullVersion = fullVersion.substring(0, ix);
        }

        // Get major version
        majorVersion = parseInt('' + fullVersion, 10);
        if (isNaN(majorVersion)) {
            fullVersion = '' + parseFloat(navigator.appVersion);
            majorVersion = parseInt(navigator.appVersion, 10);
        }

        // Return data
        return {
            name: name,
            version: majorVersion,
            isIE: isIE,
            isFirefox: isFirefox,
            isChrome: isChrome,
            isSafari: isSafari,
            isIos: /(iPad|iPhone|iPod)/g.test(navigator.platform),
            isTouch: 'ontouchstart' in document.documentElement
        };
    }

    // Check for mime type support against a player instance
    // Credits: http://diveintohtml5.info/everything.html
    // Related: http://www.leanbackpleierbg.com/test/h5mt.html
    function _supportMime(pleierbg, mimeType) {
        var media = pleierbg.media;

        // Only check video types for video players
        if (pleierbg.type == 'video') {
            // Check type
            switch (mimeType) {
                case 'video/webm':
                    return !!(media.canPlayType && media.canPlayType('video/webm; codecs="vp8, vorbis"').replace(/no/, ''));
                case 'video/mp4':
                    return !!(media.canPlayType && media.canPlayType('video/mp4; codecs="avc1.42E01E, mp4a.40.2"').replace(/no/, ''));
                case 'video/ogg':
                    return !!(media.canPlayType && media.canPlayType('video/ogg; codecs="theora"').replace(/no/, ''));
            }
        }

        // Only check audio types for audio players
        else if (pleierbg.type == 'audio') {
            // Check type
            switch (mimeType) {
                case 'audio/mpeg':
                    return !!(media.canPlayType && media.canPlayType('audio/mpeg;').replace(/no/, ''));
                case 'audio/ogg':
                    return !!(media.canPlayType && media.canPlayType('audio/ogg; codecs="vorbis"').replace(/no/, ''));
                case 'audio/wav':
                    return !!(media.canPlayType && media.canPlayType('audio/wav; codecs="1"').replace(/no/, ''));
            }
        }

        // If we got this far, we're stuffed
        return false;
    }

    // Inject a script
    function _injectScript(source) {
        if (document.querySelectorAll('script[src="' + source + '"]').length) {
            return;
        }

        var tag = document.createElement('script');
        tag.src = source;
        var firstScriptTag = document.getElementsByTagName('script')[0];
        firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
    }

    // Element exists in an array
    function _inArray(haystack, needle) {
        return Array.prototype.indexOf && (haystack.indexOf(needle) != -1);
    }

    // Replace all
    function _replaceAll(string, find, replace) {
        return string.replace(new RegExp(find.replace(/([.*+?\^=!:${}()|\[\]\/\\])/g, '\\$1'), 'g'), replace);
    }

    // Wrap an element
    function _wrap(elements, wrapper) {
        // Convert `elements` to an array, if necessary.
        if (!elements.length) {
            elements = [elements];
        }

        // Loops backwards to prevent having to clone the wrapper on the
        // first element (see `child` below).
        for (var i = elements.length - 1; i >= 0; i--) {
            var child = (i > 0) ? wrapper.cloneNode(true) : wrapper;
            var element = elements[i];

            // Cache the current parent and sibling.
            var parent = element.parentNode;
            var sibling = element.nextSibling;

            // Wrap the element (is automatically removed from its current
            // parent).
            child.appendChild(element);

            // If the element had a sibling, insert the wrapper before
            // the sibling to maintain the HTML structure; otherwise, just
            // append it to the parent.
            if (sibling) {
                parent.insertBefore(child, sibling);
            }
            else {
                parent.appendChild(child);
            }

            return child;
        }
    }

    // Unwrap an element
    // http://plainjs.com/javascript/manipulation/unwrap-a-dom-element-35/
    function _unwrap(wrapper) {
        // Get the element's parent node
        var parent = wrapper.parentNode;

        // Move all children out of the element
        while (wrapper.firstChild) {
            parent.insertBefore(wrapper.firstChild, wrapper);
        }

        // Remove the empty element
        parent.removeChild(wrapper);
    }

    // Remove an element
    function _remove(element) {
        if (!element) {
            return;
        }
        element.parentNode.removeChild(element);
    }

    // Prepend child
    function _prependChild(parent, element) {
        parent.insertBefore(element, parent.firstChild);
    }

    // Set attributes
    function _setAttributes(element, attributes) {
        for (var key in attributes) {
            element.setAttribute(key, (_is.boolean(attributes[key]) && attributes[key]) ? '' : attributes[key]);
        }
    }

    // Insert a HTML element
    function _insertElement(type, parent, attributes) {
        // Create a new <element>
        var element = document.createElement(type);

        // Set all passed attributes
        _setAttributes(element, attributes);

        // Inject the new element
        _prependChild(parent, element);
    }

    // Get a classname from selector
    function _getClassname(selector) {
        return selector.replace('.', '');
    }

    // Toggle class on an element
    function _toggleClass(element, className, state) {
        if (element) {
            if (element.classList) {
                element.classList[state ? 'add' : 'remove'](className);
            }
            else {
                var name = (' ' + element.className + ' ').replace(/\s+/g, ' ').replace(' ' + className + ' ', '');
                element.className = name + (state ? ' ' + className : '');
            }
        }
    }

    // Has class name
    function _hasClass(element, className) {
        if (element) {
            if (element.classList) {
                return element.classList.contains(className);
            }
            else {
                return new RegExp('(\\s|^)' + className + '(\\s|$)').test(element.className);
            }
        }
        return false;
    }

    // Element matches selector
    function _matches(element, selector) {
        var p = Element.prototype;

        var f = p.matches || p.webkitMatchesSelector || p.mozMatchesSelector || p.msMatchesSelector || function (s) {
                return [].indexOf.call(document.querySelectorAll(s), this) !== -1;
            };

        return f.call(element, selector);
    }

    // Bind event
    function _on(element, events, callback, useCapture) {
        if (element) {
            _toggleListener(element, events, callback, true, useCapture);
        }
    }

    // Unbind event
    function _off(element, events, callback, useCapture) {
        if (element) {
            _toggleListener(element, events, callback, false, useCapture);
        }
    }

    // Bind along with custom handler
    function _proxyListener(element, eventName, userListener, defaultListener, useCapture) {
        _on(element, eventName, function (event) {
            if (userListener) {
                userListener.apply(element, [event]);
            }
            defaultListener.apply(element, [event]);
        }, useCapture);
    }

    // Toggle event listener
    function _toggleListener(element, events, callback, toggle, useCapture) {
        var eventList = events.split(' ');

        // Whether the listener is a capturing listener or not
        // Default to false
        if (!_is.boolean(useCapture)) {
            useCapture = false;
        }

        // If a nodelist is passed, call itself on each node
        if (element instanceof NodeList) {
            for (var x = 0; x < element.length; x++) {
                if (element[x] instanceof Node) {
                    _toggleListener(element[x], arguments[1], arguments[2], arguments[3]);
                }
            }
            return;
        }

        // If a single node is passed, bind the event listener
        for (var i = 0; i < eventList.length; i++) {
            element[toggle ? 'addEventListener' : 'removeEventListener'](eventList[i], callback, useCapture);
        }
    }

    // Trigger event
    function _triggerEvent(element, eventName, bubbles, properties) {
        // Bail if no element
        if (!element || !eventName) {
            return;
        }

        // Default bubbles to false
        if (!_is.boolean(bubbles)) {
            bubbles = false;
        }

        // Create and dispatch the event
        var event = new CustomEvent(eventName, {
            bubbles: bubbles,
            detail: properties
        });

        // Dispatch the event
        element.dispatchEvent(event);
    }

    // Toggle aria-pressed state on a toggle button
    // http://www.ssbbartgroup.com/blog/how-not-to-misuse-aria-states-properties-and-roles
    function _toggleState(target, state) {
        // Bail if no target
        if (!target) {
            return;
        }

        // Get state
        state = (_is.boolean(state) ? state : !target.getAttribute('aria-pressed'));

        // Set the attribute on target
        target.setAttribute('aria-pressed', state);

        return state;
    }

    // Get percentage
    function _getPercentage(current, max) {
        if (current === 0 || max === 0 || isNaN(current) || isNaN(max)) {
            return 0;
        }
        return ((current / max) * 100).toFixed(2);
    }

    // Deep extend/merge destination object with N more objects
    // http://andrewdupont.net/2009/08/28/deep-extending-objects-in-javascript/
    // Removed call to arguments.callee (used explicit function name instead)
    function _extend() {
        // Get arguments
        var objects = arguments;

        // Bail if nothing to merge
        if (!objects.length) {
            return;
        }

        // Return first if specified but nothing to merge
        if (objects.lenth == 1) {
            return objects[0];
        }

        // First object is the destination
        var destination = Array.prototype.shift.call(objects),
            length = objects.length;

        // Loop through all objects to merge
        for (var i = 0; i < length; i++) {
            var source = objects[i];

            for (var property in source) {
                if (source[property] && source[property].constructor && source[property].constructor === Object) {
                    destination[property] = destination[property] || {};
                    _extend(destination[property], source[property]);
                }
                else {
                    destination[property] = source[property];
                }
            }
        }

        return destination;
    }

    // Check variable types
    var _is = {
        object: function (input) {
            return input !== null && typeof(input) === 'object';
        },
        array: function (input) {
            return input !== null && typeof(input) === 'object' && input.constructor === Array;
        },
        number: function (input) {
            return typeof(input) === 'number' && !isNaN(input - 0) || (typeof input == 'object' && input.constructor === Number);
        },
        string: function (input) {
            return typeof input === 'string' || (typeof input == 'object' && input.constructor === String);
        },
        boolean: function (input) {
            return typeof input === 'boolean';
        },
        nodeList: function (input) {
            return input instanceof NodeList;
        },
        htmlElement: function (input) {
            return input instanceof HTMLElement;
        },
        undefined: function (input) {
            return typeof input === 'undefined';
        }
    };

    // Fullscreen API
    function _fullscreen() {
        var fullscreen = {
                supportsFullScreen: false,
                isFullScreen: function () {
                    return false;
                },
                requestFullScreen: function () {
                },
                cancelFullScreen: function () {
                },
                fullScreenEventName: '',
                element: null,
                prefix: ''
            },
            browserPrefixes = 'webkit moz o ms khtml'.split(' ');

        // Check for native support
        if (!_is.undefined(document.cancelFullScreen)) {
            fullscreen.supportsFullScreen = true;
        }
        else {
            // Check for fullscreen support by vendor prefix
            for (var i = 0, il = browserPrefixes.length; i < il; i++) {
                fullscreen.prefix = browserPrefixes[i];

                if (!_is.undefined(document[fullscreen.prefix + 'CancelFullScreen'])) {
                    fullscreen.supportsFullScreen = true;
                    break;
                }
                // Special case for MS (when isn't it?)
                else if (!_is.undefined(document.msExitFullscreen) && document.msFullscreenEnabled) {
                    fullscreen.prefix = 'ms';
                    fullscreen.supportsFullScreen = true;
                    break;
                }
            }
        }

        // Update methods to do something useful
        if (fullscreen.supportsFullScreen) {
            // Yet again Microsoft awesomeness,
            // Sometimes the prefix is 'ms', sometimes 'MS' to keep you on your toes
            fullscreen.fullScreenEventName = (fullscreen.prefix == 'ms' ? 'MSFullscreenChange' : fullscreen.prefix + 'fullscreenchange');

            fullscreen.isFullScreen = function (element) {
                if (_is.undefined(element)) {
                    element = document.body;
                }
                switch (this.prefix) {
                    case '':
                        return document.fullscreenElement == element;
                    case 'moz':
                        return document.mozFullScreenElement == element;
                    default:
                        return document[this.prefix + 'FullscreenElement'] == element;
                }
            };
            fullscreen.requestFullScreen = function (element) {
                if (_is.undefined(element)) {
                    element = document.body;
                }
                return (this.prefix === '') ? element.requestFullScreen() : element[this.prefix + (this.prefix == 'ms' ? 'RequestFullscreen' : 'RequestFullScreen')]();
            };
            fullscreen.cancelFullScreen = function () {
                return (this.prefix === '') ? document.cancelFullScreen() : document[this.prefix + (this.prefix == 'ms' ? 'ExitFullscreen' : 'CancelFullScreen')]();
            };
            fullscreen.element = function () {
                return (this.prefix === '') ? document.fullscreenElement : document[this.prefix + 'FullscreenElement'];
            };
        }

        return fullscreen;
    }

    // Local storage
    function _storage() {
        var storage = {
            supported: (function () {
                if (!('localStorage' in window)) {
                    return false;
                }

                // Try to use it (it might be disabled, e.g. user is in private/porn mode)
                // see: https://github.com/Selz/pleierbg/issues/131
                try {
                    // Add test item
                    window.localStorage.setItem('___test', 'OK');

                    // Get the test item
                    var result = window.localStorage.getItem('___test');

                    // Clean up
                    window.localStorage.removeItem('___test');

                    // Check if value matches
                    return (result === 'OK');
                }
                catch (e) {
                    return false;
                }

                return false;
            })()
        };
        return storage;
    }

    // Player instance
    function Plyr(container, config) {
        var pleierbg = this;
        pleierbg.container = container;
        pleierbg.timers = {};

        // Log config options
        _log(config);

        // Debugging
        function _log() {
            if (config.debug && window.console) {
                console.log.apply(console, arguments);
            }
        }

        function _warn() {
            if (config.debug && window.console) {
                console.warn.apply(console, arguments);
            }
        }

        // Get icon URL
        function _getIconUrl() {
            return {
                url: config.iconUrl,
                absolute: (config.iconUrl.indexOf("http") === 0) || pleierbg.browser.isIE
            };
        }

        // Build the default HTML
        function _buildControls() {
            // Create html array
            var html = [],
                iconUrl = _getIconUrl(),
                iconPath = (!iconUrl.absolute ? iconUrl.url : '') + '#' + config.iconPrefix;

            // Larger overlaid play button
            if (_inArray(config.controls, 'play-large')) {
                html.push(
                    '<button type="button" data-pleierbg="play" class="pleierbg__play-large">',
                    '<svg><use xlink:href="' + iconPath + '-play" /></svg>',
                    '<span class="pleierbg__sr-only">' + config.i18n.play + '</span>',
                    '</button>'
                );
            }

            html.push('<div class="pleierbg__controls">');

            // Restart button
            if (_inArray(config.controls, 'restart')) {
                html.push(
                    '<button type="button" data-pleierbg="restart">',
                    '<svg><use xlink:href="' + iconPath + '-restart" /></svg>',
                    '<span class="pleierbg__sr-only">' + config.i18n.restart + '</span>',
                    '</button>'
                );
            }

            // Rewind button
            if (_inArray(config.controls, 'rewind')) {
                html.push(
                    '<button type="button" data-pleierbg="rewind">',
                    '<svg><use xlink:href="' + iconPath + '-rewind" /></svg>',
                    '<span class="pleierbg__sr-only">' + config.i18n.rewind + '</span>',
                    '</button>'
                );
            }

            // Play Pause button
            // TODO: This should be a toggle button really?
            if (_inArray(config.controls, 'play')) {
                html.push(
                    '<button type="button" data-pleierbg="play">',
                    '<svg><use xlink:href="' + iconPath + '-play" /></svg>',
                    '<span class="pleierbg__sr-only">' + config.i18n.play + '</span>',
                    '</button>',
                    '<button type="button" data-pleierbg="pause">',
                    '<svg><use xlink:href="' + iconPath + '-pause" /></svg>',
                    '<span class="pleierbg__sr-only">' + config.i18n.pause + '</span>',
                    '</button>'
                );
            }

            // Fast forward button
            if (_inArray(config.controls, 'fast-forward')) {
                html.push(
                    '<button type="button" data-pleierbg="fast-forward">',
                    '<svg><use xlink:href="' + iconPath + '-fast-forward" /></svg>',
                    '<span class="pleierbg__sr-only">' + config.i18n.forward + '</span>',
                    '</button>'
                );
            }

            // Progress
            if (_inArray(config.controls, 'progress')) {
                // Create progress
                html.push('<span class="pleierbg__progress">',
                    '<label for="seek{id}" class="pleierbg__sr-only">Seek</label>',
                    '<input id="seek{id}" class="pleierbg__progress--seek" type="range" min="0" max="100" step="0.1" value="0" data-pleierbg="seek">',
                    '<progress class="pleierbg__progress--played" max="100" value="0" role="presentation"></progress>',
                    '<progress class="pleierbg__progress--buffer" max="100" value="0">',
                    '<span>0</span>% ' + config.i18n.buffered,
                    '</progress>');

                // Seek tooltip
                if (config.tooltips.seek) {
                    html.push('<span class="pleierbg__tooltip">00:00</span>');
                }

                // Close
                html.push('</span>');
            }

            // Media current time display
            if (_inArray(config.controls, 'current-time')) {
                html.push(
                    '<span class="pleierbg__time">',
                    '<span class="pleierbg__sr-only">' + config.i18n.currentTime + '</span>',
                    '<span class="pleierbg__time--current">00:00</span>',
                    '</span>'
                );
            }

            // Media duration display
            if (_inArray(config.controls, 'duration')) {
                html.push(
                    '<span class="pleierbg__time">',
                    '<span class="pleierbg__sr-only">' + config.i18n.duration + '</span>',
                    '<span class="pleierbg__time--duration">00:00</span>',
                    '</span>'
                );
            }

            // Toggle mute button
            if (_inArray(config.controls, 'mute')) {
                html.push(
                    '<button type="button" data-pleierbg="mute">',
                    '<svg class="icon--muted"><use xlink:href="' + iconPath + '-muted" /></svg>',
                    '<svg><use xlink:href="' + iconPath + '-volume" /></svg>',
                    '<span class="pleierbg__sr-only">' + config.i18n.toggleMute + '</span>',
                    '</button>'
                );
            }

            // Volume range control
            // if (_inArray(config.controls, 'volume')) {
            //     html.push(
            //         '<span class="pleierbg__volume">',
            //             '<label for="volume{id}" class="pleierbg__sr-only">' + config.i18n.volume + '</label>',
            //             '<input id="volume{id}" class="pleierbg__volume--input" type="range" min="' + config.volumeMin + '" max="' + config.volumeMax + '" value="' + config.volume + '" data-pleierbg="volume">',
            //             '<progress class="pleierbg__volume--display" max="' + config.volumeMax + '" value="' + config.volumeMin + '" role="presentation"></progress>',
            //         '</span>'
            //     );
            // }

            // Toggle captions button
            if (_inArray(config.controls, 'captions')) {
                html.push(
                    '<button type="button" data-pleierbg="captions">',
                    '<svg class="icon--captions-on"><use xlink:href="' + iconPath + '-captions-on" /></svg>',
                    '<svg><use xlink:href="' + iconPath + '-captions-off" /></svg>',
                    '<span class="pleierbg__sr-only">' + config.i18n.toggleCaptions + '</span>',
                    '</button>'
                );
            }

            // Toggle fullscreen button
            if (_inArray(config.controls, 'fullscreen')) {
                html.push(
                    '<button type="button" data-pleierbg="fullscreen">',
                    '<svg class="icon--exit-fullscreen"><use xlink:href="' + iconPath + '-exit-fullscreen" /></svg>',
                    '<svg><use xlink:href="' + iconPath + '-enter-fullscreen" /></svg>',
                    '<span class="pleierbg__sr-only">' + config.i18n.toggleFullscreen + '</span>',
                    '</button>'
                );
            }

            // Close everything
            html.push('</div>');

            return html.join('');
        }

        // Setup fullscreen
        function _setupFullscreen() {
            if (!pleierbg.supported.full) {
                return;
            }

            if ((pleierbg.type != 'audio' || config.fullscreen.allowAudio) && config.fullscreen.enabled) {
                // Check for native support
                var nativeSupport = fullscreen.supportsFullScreen;

                if (nativeSupport || (config.fullscreen.fallback && !_inFrame())) {
                    _log((nativeSupport ? 'Native' : 'Fallback') + ' fullscreen enabled');

                    // Add styling hook
                    _toggleClass(pleierbg.container, config.classes.fullscreen.enabled, true);
                }
                else {
                    _log('Fullscreen not supported and fallback disabled');
                }

                // Toggle state
                if (pleierbg.buttons && pleierbg.buttons.fullscreen) {
                    _toggleState(pleierbg.buttons.fullscreen, false);
                }

                // Setup focus trap
                _focusTrap();
            }
        }

        // Setup captions
        function _setupCaptions() {
            // Bail if not HTML5 video
            if (pleierbg.type !== 'video') {
                return;
            }

            // Inject the container
            if (!_getElement(config.selectors.captions)) {
                pleierbg.videoContainer.insertAdjacentHTML('afterbegin', '<div class="' + _getClassname(config.selectors.captions) + '"></div>');
            }

            // Determine if HTML5 textTracks is supported
            pleierbg.usingTextTracks = false;
            if (pleierbg.media.textTracks) {
                pleierbg.usingTextTracks = true;
            }

            // Get URL of caption file if exists
            var captionSrc = '',
                kind,
                children = pleierbg.media.childNodes;

            for (var i = 0; i < children.length; i++) {
                if (children[i].nodeName.toLowerCase() === 'track') {
                    kind = children[i].kind;
                    if (kind === 'captions' || kind === 'subtitles') {
                        captionSrc = children[i].getAttribute('src');
                    }
                }
            }

            // Record if caption file exists or not
            pleierbg.captionExists = true;
            if (captionSrc === '') {
                pleierbg.captionExists = false;
                _log('No caption track found');
            }
            else {
                _log('Caption track found; URI: ' + captionSrc);
            }

            // If no caption file exists, hide container for caption text
            if (!pleierbg.captionExists) {
                _toggleClass(pleierbg.container, config.classes.captions.enabled);
            }
            // If caption file exists, process captions
            else {
                // Turn off native caption rendering to avoid double captions
                // This doesn't seem to work in Safari 7+, so the <track> elements are removed from the dom below
                var tracks = pleierbg.media.textTracks;
                for (var x = 0; x < tracks.length; x++) {
                    tracks[x].mode = 'hidden';
                }

                // Enable UI
                _showCaptions(pleierbg);

                // Disable unsupported browsers than report false positive
                // Firefox bug: https://bugzilla.mozilla.org/show_bug.cgi?id=1033144
                if ((pleierbg.browser.isIE && pleierbg.browser.version >= 10) ||
                    (pleierbg.browser.isFirefox && pleierbg.browser.version >= 31)) {

                    // Debugging
                    _log('Detected browser with known TextTrack issues - using manual fallback');

                    // Set to false so skips to 'manual' captioning
                    pleierbg.usingTextTracks = false;
                }

                // Rendering caption tracks
                // Native support required - http://caniuse.com/webvtt
                if (pleierbg.usingTextTracks) {
                    _log('TextTracks supported');

                    for (var y = 0; y < tracks.length; y++) {
                        var track = tracks[y];

                        if (track.kind === 'captions' || track.kind === 'subtitles') {
                            _on(track, 'cuechange', function () {
                                // Display a cue, if there is one
                                if (this.activeCues[0] && 'text' in this.activeCues[0]) {
                                    _setCaption(this.activeCues[0].getCueAsHTML());
                                }
                                else {
                                    _setCaption();
                                }
                            });
                        }
                    }
                }
                // Caption tracks not natively supported
                else {
                    _log('TextTracks not supported so rendering captions manually');

                    // Render captions from array at appropriate time
                    pleierbg.currentCaption = '';
                    pleierbg.captions = [];

                    if (captionSrc !== '') {
                        // Create XMLHttpRequest Object
                        var xhr = new XMLHttpRequest();

                        xhr.onreadystatechange = function () {
                            if (xhr.readyState === 4) {
                                if (xhr.status === 200) {
                                    var captions = [],
                                        caption,
                                        req = xhr.responseText;

                                    captions = req.split('\n\n');

                                    for (var r = 0; r < captions.length; r++) {
                                        caption = captions[r];
                                        pleierbg.captions[r] = [];

                                        // Get the parts of the captions
                                        var parts = caption.split('\n'),
                                            index = 0;

                                        // Incase caption numbers are added
                                        if (parts[index].indexOf(":") === -1) {
                                            index = 1;
                                        }

                                        pleierbg.captions[r] = [parts[index], parts[index + 1]];
                                    }

                                    // Remove first element ('VTT')
                                    pleierbg.captions.shift();

                                    _log('Successfully loaded the caption file via AJAX');
                                }
                                else {
                                    _warn('There was a problem loading the caption file via AJAX');
                                }
                            }
                        };

                        xhr.open('get', captionSrc, true);

                        xhr.send();
                    }
                }
            }
        }

        // Set the current caption
        function _setCaption(caption) {
            /* jshint unused:false */
            var container = _getElement(config.selectors.captions),
                content = document.createElement('span');

            // Empty the container
            container.innerHTML = '';

            // Default to empty
            if (_is.undefined(caption)) {
                caption = '';
            }

            // Set the span content
            if (_is.undefined(caption)) {
                content.innerHTML = caption.trim();
            }
            else {
                content.appendChild(caption);
            }

            // Set new caption text
            container.appendChild(content);

            // Force redraw (for Safari)
            var redraw = container.offsetHeight;
        }

        // Captions functions
        // Seek the manual caption time and update UI
        function _seekManualCaptions(time) {
            // Utilities for caption time codes
            function _timecodeCommon(tc, pos) {
                var tcpair = [];
                tcpair = tc.split(' --> ');
                for (var i = 0; i < tcpair.length; i++) {
                    // WebVTT allows for extra meta data after the timestamp line
                    // So get rid of this if it exists
                    tcpair[i] = tcpair[i].replace(/(\d+:\d+:\d+\.\d+).*/, "$1");
                }
                return _subTcSecs(tcpair[pos]);
            }

            function _timecodeMin(tc) {
                return _timecodeCommon(tc, 0);
            }

            function _timecodeMax(tc) {
                return _timecodeCommon(tc, 1);
            }

            function _subTcSecs(tc) {
                if (tc === null || tc === undefined) {
                    return 0;
                }
                else {
                    var tc1 = [],
                        tc2 = [],
                        seconds;
                    tc1 = tc.split(',');
                    tc2 = tc1[0].split(':');
                    seconds = Math.floor(tc2[0] * 60 * 60) + Math.floor(tc2[1] * 60) + Math.floor(tc2[2]);
                    return seconds;
                }
            }

            // If it's not video, or we're using textTracks, bail.
            if (pleierbg.usingTextTracks || pleierbg.type !== 'video' || !pleierbg.supported.full) {
                return;
            }

            // Reset subcount
            pleierbg.subcount = 0;

            // Check time is a number, if not use currentTime
            // IE has a bug where currentTime doesn't go to 0
            // https://twitter.com/Sam_Potts/status/573715746506731521
            time = _is.number(time) ? time : pleierbg.media.currentTime;

            // If there's no subs available, bail
            if (!pleierbg.captions[pleierbg.subcount]) {
                return;
            }

            while (_timecodeMax(pleierbg.captions[pleierbg.subcount][0]) < time.toFixed(1)) {
                pleierbg.subcount++;
                if (pleierbg.subcount > pleierbg.captions.length - 1) {
                    pleierbg.subcount = pleierbg.captions.length - 1;
                    break;
                }
            }

            // Check if the next caption is in the current time range
            if (pleierbg.media.currentTime.toFixed(1) >= _timecodeMin(pleierbg.captions[pleierbg.subcount][0]) &&
                pleierbg.media.currentTime.toFixed(1) <= _timecodeMax(pleierbg.captions[pleierbg.subcount][0])) {
                pleierbg.currentCaption = pleierbg.captions[pleierbg.subcount][1];

                // Render the caption
                _setCaption(pleierbg.currentCaption);
            }
            else {
                _setCaption();
            }
        }

        // Display captions container and button (for initialization)
        function _showCaptions() {
            // If there's no caption toggle, bail
            if (!pleierbg.buttons.captions) {
                return;
            }

            _toggleClass(pleierbg.container, config.classes.captions.enabled, true);

            if (config.captions.defaultActive) {
                _toggleClass(pleierbg.container, config.classes.captions.active, true);
                _toggleState(pleierbg.buttons.captions, true);
            }
        }

        // Find all elements
        function _getElements(selector) {
            return pleierbg.container.querySelectorAll(selector);
        }

        // Find a single element
        function _getElement(selector) {
            return _getElements(selector)[0];
        }

        // Determine if we're in an iframe
        function _inFrame() {
            try {
                return window.self !== window.top;
            }
            catch (e) {
                return true;
            }
        }

        // Trap focus inside container
        function _focusTrap() {
            var tabbables = _getElements('input:not([disabled]), button:not([disabled])'),
                first = tabbables[0],
                last = tabbables[tabbables.length - 1];

            function _checkFocus(event) {
                // If it is TAB
                if (event.which === 9 && pleierbg.isFullscreen) {
                    // Move focus to first element that can be tabbed if Shift isn't used
                    if (event.target === last && !event.shiftKey) {
                        event.preventDefault();
                        first.focus();
                    }
                    // Move focus to last element that can be tabbed if Shift is used
                    else if (event.target === first && event.shiftKey) {
                        event.preventDefault();
                        last.focus();
                    }
                }
            }

            // Bind the handler
            _on(pleierbg.container, 'keydown', _checkFocus);
        }

        // Add elements to HTML5 media (source, tracks, etc)
        function _insertChildElements(type, attributes) {
            if (_is.string(attributes)) {
                _insertElement(type, pleierbg.media, {src: attributes});
            }
            else if (attributes.constructor === Array) {
                for (var i = attributes.length - 1; i >= 0; i--) {
                    _insertElement(type, pleierbg.media, attributes[i]);
                }
            }
        }

        // Insert controls
        function _injectControls() {
            // Sprite
            if (config.loadSprite) {
                var iconUrl = _getIconUrl();

                // Only load external sprite using AJAX
                if (iconUrl.absolute) {
                    _log('AJAX loading absolute SVG sprite' + (pleierbg.browser.isIE ? ' (due to IE)' : ''));
                    loadSprite(iconUrl.url, "sprite-pleierbg");
                }
                else {
                    _log('Sprite will be used as external resource directly');
                }
            }

            // Make a copy of the html
            var html = config.html;

            // Insert custom video controls
            _log('Injecting custom controls');

            // If no controls are specified, create default
            if (!html) {
                html = _buildControls();
            }

            // Replace seek time instances
            html = _replaceAll(html, '{seektime}', config.seekTime);

            // Replace all id references with random numbers
            html = _replaceAll(html, '{id}', Math.floor(Math.random() * (10000)));

            // Controls container
            var container;

            // Inject to custom location
            if (config.selectors.controls.container !== null) {
                container = config.selectors.controls.container;

                if (_is.string(container)) {
                    container = document.querySelector(container);
                }
            }

            // Inject into the container by default
            if (!_is.htmlElement(container)) {
                container = pleierbg.container
            }

            // Inject controls HTML
            container.insertAdjacentHTML('beforeend', html);

            // Setup tooltips
            if (config.tooltips.controls) {
                var labels = _getElements([config.selectors.controls.wrapper, ' ', config.selectors.labels, ' .', config.classes.hidden].join(''));

                for (var i = labels.length - 1; i >= 0; i--) {
                    var label = labels[i];

                    _toggleClass(label, config.classes.hidden, false);
                    _toggleClass(label, config.classes.tooltip, true);
                }
            }
        }

        // Find the UI controls and store references
        function _findElements() {
            try {
                pleierbg.controls = _getElement(config.selectors.controls.wrapper);

                // Buttons
                pleierbg.buttons = {};
                pleierbg.buttons.seek = _getElement(config.selectors.buttons.seek);
                pleierbg.buttons.play = _getElements(config.selectors.buttons.play);
                pleierbg.buttons.pause = _getElement(config.selectors.buttons.pause);
                pleierbg.buttons.restart = _getElement(config.selectors.buttons.restart);
                pleierbg.buttons.rewind = _getElement(config.selectors.buttons.rewind);
                pleierbg.buttons.forward = _getElement(config.selectors.buttons.forward);
                pleierbg.buttons.fullscreen = _getElement(config.selectors.buttons.fullscreen);

                // Inputs
                pleierbg.buttons.mute = _getElement(config.selectors.buttons.mute);
                pleierbg.buttons.captions = _getElement(config.selectors.buttons.captions);

                // Progress
                pleierbg.progress = {};
                pleierbg.progress.container = _getElement(config.selectors.progress.container);

                // Progress - Buffering
                pleierbg.progress.buffer = {};
                pleierbg.progress.buffer.bar = _getElement(config.selectors.progress.buffer);
                pleierbg.progress.buffer.text = pleierbg.progress.buffer.bar && pleierbg.progress.buffer.bar.getElementsByTagName('span')[0];

                // Progress - Played
                pleierbg.progress.played = _getElement(config.selectors.progress.played);

                // Seek tooltip
                pleierbg.progress.tooltip = pleierbg.progress.container && pleierbg.progress.container.querySelector('.' + config.classes.tooltip);

                // Volume
                pleierbg.volume = {};
                pleierbg.volume.input = _getElement(config.selectors.volume.input);
                pleierbg.volume.display = _getElement(config.selectors.volume.display);

                // Timing
                pleierbg.duration = _getElement(config.selectors.duration);
                pleierbg.currentTime = _getElement(config.selectors.currentTime);
                pleierbg.seekTime = _getElements(config.selectors.seekTime);

                return true;
            }
            catch (e) {
                _warn('It looks like there is a problem with your controls HTML');

                // Restore native video controls
                _toggleNativeControls(true);

                return false;
            }
        }

        // Toggle style hook
        function _toggleStyleHook() {
            _toggleClass(pleierbg.container, config.selectors.container.replace('.', ''), pleierbg.supported.full);
        }

        // Toggle native controls
        function _toggleNativeControls(toggle) {
            if (toggle && _inArray(config.types.html5, pleierbg.type)) {
                pleierbg.media.setAttribute('controls', '');
            }
            else {
                pleierbg.media.removeAttribute('controls');
            }
        }

        // Setup aria attribute for play and iframe title
        function _setTitle(iframe) {
            // Find the current text
            var label = config.i18n.play;

            // If there's a media title set, use that for the label
            if (!_is.undefined(config.title) && config.title.length) {
                label += ', ' + config.title;
            }

            // If there's a play button, set label
            if (pleierbg.supported.full && pleierbg.buttons.play) {
                for (var i = pleierbg.buttons.play.length - 1; i >= 0; i--) {
                    pleierbg.buttons.play[i].setAttribute('aria-label', label);
                }
            }

            // Set iframe title
            // https://github.com/Selz/pleierbg/issues/124
            if (_is.htmlElement(iframe)) {
                iframe.setAttribute('title', config.i18n.frameTitle.replace('{title}', config.title));
            }
        }

        // Setup media
        function _setupMedia() {
            // If there's no media, bail
            if (!pleierbg.media) {
                _warn('No media element found!');
                return;
            }

            if (pleierbg.supported.full) {
                // Add type class
                _toggleClass(pleierbg.container, config.classes.type.replace('{0}', pleierbg.type), true);

                // Add video class for embeds
                // This will require changes if audio embeds are added
                if (_inArray(config.types.embed, pleierbg.type)) {
                    _toggleClass(pleierbg.container, config.classes.type.replace('{0}', 'video'), true);
                }

                // If there's no autoplay attribute, assume the video is stopped and add state class
                _toggleClass(pleierbg.container, config.classes.stopped, config.autoplay);

                // Add iOS class
                _toggleClass(pleierbg.container, config.classes.isIos, pleierbg.browser.isIos);

                // Add touch class
                _toggleClass(pleierbg.container, config.classes.isTouch, pleierbg.browser.isTouch);

                // Inject the player wrapper
                if (pleierbg.type === 'video') {
                    // Create the wrapper div
                    var wrapper = document.createElement('div');
                    wrapper.setAttribute('class', config.classes.videoWrapper);

                    // Wrap the video in a container
                    _wrap(pleierbg.media, wrapper);

                    // Cache the container
                    pleierbg.videoContainer = wrapper;
                }
            }

            // Embeds
            if (_inArray(config.types.embed, pleierbg.type)) {
                _setupEmbed();

                // Clean up
                pleierbg.embedId = null;
            }
        }

        // Setup YouTube/Vimeo
        function _setupEmbed() {
            var container = document.createElement('div'),
                mediaId = pleierbg.embedId,
                id = pleierbg.type + '-' + Math.floor(Math.random() * (10000));

            // Remove old containers
            var containers = _getElements('[id^="' + pleierbg.type + '-"]');
            for (var i = containers.length - 1; i >= 0; i--) {
                _remove(containers[i]);
            }

            // Add embed class for responsive
            _toggleClass(pleierbg.media, config.classes.videoWrapper, true);
            _toggleClass(pleierbg.media, config.classes.embedWrapper, true);

            // YouTube
            if (pleierbg.type === 'youtube') {
                // Create the YouTube container
                pleierbg.media.appendChild(container);

                // Set ID
                container.setAttribute('id', id);

                // Setup API
                if (_is.object(window.YT)) {
                    _youTubeReady(mediaId, container);
                }
                else {
                    // Load the API
                    _injectScript(config.urls.youtube.api);

                    // Setup callback for the API
                    window.onYouTubeReadyCallbacks = window.onYouTubeReadyCallbacks || [];

                    // Add to queue
                    window.onYouTubeReadyCallbacks.push(function () {
                        _youTubeReady(mediaId, container);
                    });

                    // Set callback to process queue
                    window.onYouTubeIframeAPIReady = function () {
                        window.onYouTubeReadyCallbacks.forEach(function (callback) {
                            callback();
                        });
                    };
                }
            }
            // Vimeo
            else if (pleierbg.type === 'vimeo') {
                // Vimeo needs an extra div to hide controls on desktop (which has full support)
                if (pleierbg.supported.full) {
                    pleierbg.media.appendChild(container);
                }
                else {
                    container = pleierbg.media;
                }

                // Set ID
                container.setAttribute('id', id);

                // Load the API if not already
                if (!_is.object(window.Vimeo)) {
                    _injectScript(config.urls.vimeo.api);

                    // Wait for fragaloop load
                    var vimeoTimer = window.setInterval(function () {
                        if (_is.object(window.Vimeo)) {
                            window.clearInterval(vimeoTimer);
                            _vimeoReady(mediaId, container);
                        }
                    }, 50);
                }
                else {
                    _vimeoReady(mediaId, container);
                }
            }
            // Soundcloud
            // TODO: Currently unsupported and undocumented
            else if (pleierbg.type === 'soundcloud') {
                // Inject the iframe
                var soundCloud = document.createElement('iframe');

                // Watch for iframe load
                soundCloud.loaded = false;
                _on(soundCloud, 'load', function () {
                    soundCloud.loaded = true;
                });

                _setAttributes(soundCloud, {
                    'src': 'https://w.soundcloud.com/player/?url=https://api.soundcloud.com/tracks/' + mediaId,
                    'id': id
                });

                container.appendChild(soundCloud);
                pleierbg.media.appendChild(container);

                // Load the API if not already
                if (!window.SC) {
                    _injectScript(config.urls.soundcloud.api);
                }

                // Wait for SC load
                var soundCloudTimer = window.setInterval(function () {
                    if (window.SC && soundCloud.loaded) {
                        window.clearInterval(soundCloudTimer);
                        _soundcloudReady.call(soundCloud);
                    }
                }, 50);
            }
        }

        // When embeds are ready
        function _embedReady() {
            // Store reference to API
            pleierbg.container.pleierbg.embed = pleierbg.embed;

            // Setup the UI if full support
            if (pleierbg.supported.full) {
                _setupInterface();
            }

            // Set title
            _setTitle(_getElement('iframe'));
        }

        // Handle YouTube API ready
        function _youTubeReady(videoId, container) {
            // Setup timers object
            // We have to poll YouTube for updates
            if (!('timer' in pleierbg)) {
                pleierbg.timer = {};
            }

            // Setup instance
            // https://developers.google.com/youtube/iframe_api_reference
            pleierbg.embed = new window.YT.Player(container.id, {
                videoId: videoId,
                playerVars: {
                    autoplay: (config.autoplay ? 1 : 0),
                    controls: (pleierbg.supported.full ? 0 : 1),
                    rel: 0,
                    showinfo: 0,
                    iv_load_policy: 3,
                    cc_load_policy: (config.captions.defaultActive ? 1 : 0),
                    cc_lang_pref: 'en',
                    wmode: 'transparent',
                    modestbranding: 1,
                    disablekb: 1,
                    origin: '*' // https://code.google.com/p/gdata-issues/issues/detail?id=5788#c45
                },
                events: {
                    'onError': function (event) {
                        _triggerEvent(pleierbg.container, 'error', true, {
                            code: event.data,
                            embed: event.target
                        });
                    },
                    'onReady': function (event) {
                        // Get the instance
                        var instance = event.target;

                        // Create a faux HTML5 API using the YouTube API
                        pleierbg.media.play = function () {
                            instance.playVideo();
                            pleierbg.media.paused = false;
                        };
                        pleierbg.media.pause = function () {
                            instance.pauseVideo();
                            pleierbg.media.paused = true;
                        };
                        pleierbg.media.stop = function () {
                            instance.stopVideo();
                            pleierbg.media.paused = true;
                        };
                        pleierbg.media.duration = instance.getDuration();
                        pleierbg.media.paused = true;
                        pleierbg.media.currentTime = instance.getCurrentTime();
                        pleierbg.media.muted = instance.isMuted();

                        // Set title
                        config.title = instance.getVideoData().title;

                        // Trigger timeupdate
                        _triggerEvent(pleierbg.media, 'timeupdate');

                        // Reset timer
                        window.clearInterval(pleierbg.timer.buffering);

                        // Setup buffering
                        pleierbg.timer.buffering = window.setInterval(function () {
                            // Get loaded % from YouTube
                            pleierbg.media.buffered = instance.getVideoLoadedFraction();

                            // Trigger progress
                            _triggerEvent(pleierbg.media, 'progress');

                            // Bail if we're at 100%
                            if (pleierbg.media.buffered === 1) {
                                window.clearInterval(pleierbg.timer.buffering);

                                // Trigger event
                                _triggerEvent(pleierbg.media, 'canplaythrough');
                            }
                        }, 200);

                        // Update UI
                        _embedReady();

                        // Display duration if available
                        _displayDuration();
                    },
                    'onStateChange': function (event) {
                        // Get the instance
                        var instance = event.target;

                        // Reset timer
                        window.clearInterval(pleierbg.timer.playing);

                        // Handle events
                        // -1   Unstarted
                        // 0    Ended
                        // 1    Playing
                        // 2    Paused
                        // 3    Buffering
                        // 5    Video cued
                        switch (event.data) {
                            case 0:
                                pleierbg.media.paused = true;
                                _triggerEvent(pleierbg.media, 'ended');
                                break;

                            case 1:
                                pleierbg.media.paused = false;
                                pleierbg.media.seeking = false;
                                _triggerEvent(pleierbg.media, 'play');
                                _triggerEvent(pleierbg.media, 'playing');

                                // Poll to get playback progress
                                pleierbg.timer.playing = window.setInterval(function () {
                                    // Set the current time
                                    pleierbg.media.currentTime = instance.getCurrentTime();

                                    // Trigger timeupdate
                                    _triggerEvent(pleierbg.media, 'timeupdate');
                                }, 100);

                                break;

                            case 2:
                                pleierbg.media.paused = true;
                                _triggerEvent(pleierbg.media, 'pause');
                                break;
                        }

                        _triggerEvent(pleierbg.container, 'statechange', false, {
                            code: event.data
                        });
                    }
                }
            });
        }

        // Vimeo ready
        function _vimeoReady(mediaId, container) {
            // Setup player
            pleierbg.embed = new window.Vimeo.Player(container.id, {
                id: mediaId,
                loop: config.loop,
                autoplay: config.autoplay,
                byline: false,
                portrait: false,
                title: false
            });

            // Create a faux HTML5 API using the Vimeo API
            pleierbg.media.play = function () {
                pleierbg.embed.play();
                pleierbg.media.paused = false;
            };
            pleierbg.media.pause = function () {
                pleierbg.embed.pause();
                pleierbg.media.paused = true;
            };
            pleierbg.media.stop = function () {
                pleierbg.embed.stop();
                pleierbg.media.paused = true;
            };
            pleierbg.media.paused = true;
            pleierbg.media.currentTime = 0;

            // Update UI
            _embedReady();

            pleierbg.embed.getCurrentTime().then(function (value) {
                pleierbg.media.currentTime = value;

                // Trigger timeupdate
                _triggerEvent(pleierbg.media, 'timeupdate');
            });

            pleierbg.embed.getDuration().then(function (value) {
                pleierbg.media.duration = value;

                // Display duration if available
                _displayDuration();
            });

            // TODO: Captions
            /*if (config.captions.defaultActive) {
             pleierbg.embed.enableTextTrack('en');
             }*/

            // Fix keyboard focus issues
            // https://github.com/Selz/pleierbg/issues/317
            pleierbg.embed.on('loaded', function () {
                if (_is.htmlElement(pleierbg.embed.element)) {
                    pleierbg.embed.element.setAttribute('tabindex', '-1');
                }
            });

            pleierbg.embed.on('play', function () {
                pleierbg.media.paused = false;
                _triggerEvent(pleierbg.media, 'play');
                _triggerEvent(pleierbg.media, 'playing');
            });

            pleierbg.embed.on('pause', function () {
                pleierbg.media.paused = true;
                _triggerEvent(pleierbg.media, 'pause');
            });

            pleierbg.embed.on('timeupdate', function (data) {
                pleierbg.media.seeking = false;
                pleierbg.media.currentTime = data.seconds;
                _triggerEvent(pleierbg.media, 'timeupdate');
            });

            pleierbg.embed.on('progress', function (data) {
                pleierbg.media.buffered = data.percent;
                _triggerEvent(pleierbg.media, 'progress');

                if (parseInt(data.percent) === 1) {
                    // Trigger event
                    _triggerEvent(pleierbg.media, 'canplaythrough');
                }
            });

            pleierbg.embed.on('ended', function () {
                pleierbg.media.paused = true;
                _triggerEvent(pleierbg.media, 'ended');
            });
        }

        // Soundcloud ready
        function _soundcloudReady() {
            /* jshint validthis: true */
            pleierbg.embed = window.SC.Widget(this);

            // Setup on ready
            pleierbg.embed.bind(window.SC.Widget.Events.READY, function () {
                // Create a faux HTML5 API using the Soundcloud API
                pleierbg.media.play = function () {
                    pleierbg.embed.play();
                    pleierbg.media.paused = false;
                };
                pleierbg.media.pause = function () {
                    pleierbg.embed.pause();
                    pleierbg.media.paused = true;
                };
                pleierbg.media.stop = function () {
                    pleierbg.embed.seekTo(0);
                    pleierbg.embed.pause();
                    pleierbg.media.paused = true;
                };
                pleierbg.media.paused = true;
                pleierbg.media.currentTime = 0;

                // Update UI
                _embedReady();

                pleierbg.embed.getPosition(function (value) {
                    pleierbg.media.currentTime = value;

                    // Trigger timeupdate
                    _triggerEvent(pleierbg.media, 'timeupdate');
                });

                pleierbg.embed.getDuration(function (value) {
                    pleierbg.media.duration = value / 1000;
                    // Display duration if available
                    _displayDuration();
                });

                pleierbg.embed.bind(window.SC.Widget.Events.PLAY, function () {
                    pleierbg.media.paused = false;
                    _triggerEvent(pleierbg.media, 'play');
                    _triggerEvent(pleierbg.media, 'playing');
                });

                pleierbg.embed.bind(window.SC.Widget.Events.PAUSE, function () {
                    pleierbg.media.paused = true;
                    _triggerEvent(pleierbg.media, 'pause');
                });

                pleierbg.embed.bind(window.SC.Widget.Events.PLAY_PROGRESS, function (data) {
                    pleierbg.media.seeking = false;
                    pleierbg.media.currentTime = data.currentPosition / 1000;
                    _triggerEvent(pleierbg.media, 'timeupdate');
                });

                pleierbg.embed.bind(window.SC.Widget.Events.LOAD_PROGRESS, function (data) {
                    pleierbg.media.buffered = data.loadProgress;
                    _triggerEvent(pleierbg.media, 'progress');

                    if (parseInt(data.loadProgress) === 1) {
                        // Trigger event
                        _triggerEvent(pleierbg.media, 'canplaythrough');
                    }
                });

                pleierbg.embed.bind(window.SC.Widget.Events.FINISH, function () {
                    pleierbg.media.paused = true;
                    _triggerEvent(pleierbg.media, 'ended');
                });

                // Autoplay
                if (config.autoplay) {
                    pleierbg.embed.play();
                }
            });
        }

        // Play media
        function _play() {
            if ('play' in pleierbg.media) {
                pleierbg.media.play();
            }
        }

        // Pause media
        function _pause() {
            if ('pause' in pleierbg.media) {
                pleierbg.media.pause();
            }
        }

        // Toggle playback
        function _togglePlay(toggle) {
            // Play
            if (toggle === true) {
                _play();
            }
            // Pause
            else if (toggle === false) {
                _pause();
            }
            // True toggle
            else {
                pleierbg.media[pleierbg.media.paused ? 'play' : 'pause']();
            }
        }

        // Rewind
        function _rewind(seekTime) {
            // Use default if needed
            if (!_is.number(seekTime)) {
                seekTime = config.seekTime;
            }
            _seek(pleierbg.media.currentTime - seekTime);
        }

        // Fast forward
        function _forward(seekTime) {
            // Use default if needed
            if (!_is.number(seekTime)) {
                seekTime = config.seekTime;
            }
            _seek(pleierbg.media.currentTime + seekTime);
        }

        // Seek to time
        // The input parameter can be an event or a number
        function _seek(input) {
            var targetTime = 0,
                paused = pleierbg.media.paused,
                duration = _getDuration();

            // Explicit position
            if (_is.number(input)) {
                targetTime = input;
            }
            // Event
            else if (_is.object(input) && _inArray(['input', 'change'], input.type)) {
                // It's the seek slider
                // Seek to the selected time
                targetTime = ((input.target.value / input.target.max) * duration);
            }

            // Normalise targetTime
            if (targetTime < 0) {
                targetTime = 0;
            }
            else if (targetTime > duration) {
                targetTime = duration;
            }

            // Update seek range and progress 
            _updateSeekDisplay(targetTime);

            // Set the current time
            // Try/catch incase the media isn't set and we're calling seek() from source() and IE moans
            try {
                pleierbg.media.currentTime = targetTime.toFixed(4);
            }
            catch (e) {
            }

            // Embeds
            if (_inArray(config.types.embed, pleierbg.type)) {
                // YouTube
                switch (pleierbg.type) {
                    case 'youtube':
                        pleierbg.embed.seekTo(targetTime);
                        break;

                    case 'vimeo':
                        // Round to nearest second for vimeo
                        pleierbg.embed.setCurrentTime(targetTime.toFixed(0));
                        break;

                    case 'soundcloud':
                        pleierbg.embed.seekTo(targetTime * 1000);
                        break;
                }

                if (paused) {
                    _pause();
                }

                // Trigger timeupdate for embeds
                _triggerEvent(pleierbg.media, 'timeupdate');

                // Set seeking flag
                pleierbg.media.seeking = true;
            }

            // Logging
            _log('Seeking to ' + pleierbg.media.currentTime + ' seconds');

            // Special handling for 'manual' captions
            _seekManualCaptions(targetTime);
        }

        // Get the duration (or custom if set)
        function _getDuration() {
            // It should be a number, but parse it just incase
            var duration = parseInt(config.duration),

                // True duration
                mediaDuration = 0;

            // Only if duration available
            if (pleierbg.media.duration !== null && !isNaN(pleierbg.media.duration)) {
                mediaDuration = pleierbg.media.duration;
            }

            // If custom duration is funky, use regular duration
            return (isNaN(duration) ? mediaDuration : duration);
        }

        // Check playing state
        function _checkPlaying() {
            _toggleClass(pleierbg.container, config.classes.playing, !pleierbg.media.paused);
            _toggleClass(pleierbg.container, config.classes.stopped, pleierbg.media.paused);

            _toggleControls(pleierbg.media.paused);
        }

        // Save scroll position
        function _saveScrollPosition() {
            scroll = {
                x: window.pageXOffset || 0,
                y: window.pageYOffset || 0
            };
        }

        // Restore scroll position
        function _restoreScrollPosition() {
            window.scrollTo(scroll.x, scroll.y);
        }

        // Toggle fullscreen
        function _toggleFullscreen(event) {
            // Check for native support
            var nativeSupport = fullscreen.supportsFullScreen;

            // If it's a fullscreen change event, it's probably a native close
            if (event && event.type === fullscreen.fullScreenEventName) {
                pleierbg.isFullscreen = fullscreen.isFullScreen(pleierbg.container);
            }
            // If there's native support, use it
            else if (nativeSupport) {
                // Request fullscreen
                if (!fullscreen.isFullScreen(pleierbg.container)) {
                    // Save scroll position
                    _saveScrollPosition();

                    // Request full screen
                    fullscreen.requestFullScreen(pleierbg.container);
                }
                // Bail from fullscreen
                else {
                    fullscreen.cancelFullScreen();
                }

                // Check if we're actually full screen (it could fail)
                pleierbg.isFullscreen = fullscreen.isFullScreen(pleierbg.container);
            }
            else {
                // Otherwise, it's a simple toggle
                pleierbg.isFullscreen = !pleierbg.isFullscreen;

                // Bind/unbind escape key
                if (pleierbg.isFullscreen) {
                    _on(document, 'keyup', _handleEscapeFullscreen);
                    document.body.style.overflow = 'hidden';
                }
                else {
                    _off(document, 'keyup', _handleEscapeFullscreen);
                    document.body.style.overflow = '';
                }
            }

            // Set class hook
            _toggleClass(pleierbg.container, config.classes.fullscreen.active, pleierbg.isFullscreen);

            // Trap focus
            if (pleierbg.isFullscreen) {
                pleierbg.container.setAttribute('tabindex', '-1');
            }
            else {
                pleierbg.container.removeAttribute('tabindex');
            }

            // Trap focus
            _focusTrap(pleierbg.isFullscreen);

            // Set button state
            if (pleierbg.buttons && pleierbg.buttons.fullscreen) {
                _toggleState(pleierbg.buttons.fullscreen, pleierbg.isFullscreen);
            }

            // Trigger an event
            _triggerEvent(pleierbg.container, pleierbg.isFullscreen ? 'enterfullscreen' : 'exitfullscreen', true);

            // Restore scroll position
            if (!pleierbg.isFullscreen && nativeSupport) {
                _restoreScrollPosition();
            }
        }

        // Bail from faux-fullscreen
        function _handleEscapeFullscreen(event) {
            // If it's a keypress and not escape, bail
            if ((event.which || event.charCode || event.keyCode) === 27 && pleierbg.isFullscreen) {
                _toggleFullscreen();
            }
        }

        // Mute
        function _toggleMute(muted) {
            // If the method is called without parameter, toggle based on current value
            if (!_is.boolean(muted)) {
                muted = !pleierbg.media.muted;
            }

            // Set button state
            _toggleState(pleierbg.buttons.mute, muted);

            // Set mute on the player
            pleierbg.media.muted = muted;

            // If volume is 0 after unmuting, set to default
            if (pleierbg.media.volume === 0) {
                _setVolume(config.volume);
            }

            // Embeds
            if (_inArray(config.types.embed, pleierbg.type)) {
                // YouTube
                switch (pleierbg.type) {
                    case 'youtube':
                        pleierbg.embed[pleierbg.media.muted ? 'mute' : 'unMute']();
                        break;

                    case 'vimeo':
                    case 'soundcloud':
                        pleierbg.embed.setVolume(pleierbg.media.muted ? 0 : parseFloat(config.volume / config.volumeMax));
                        break;
                }

                // Trigger volumechange for embeds
                _triggerEvent(pleierbg.media, 'volumechange');
            }
        }

        // Set volume
        function _setVolume(volume) {
            var max = config.volumeMax,
                min = config.volumeMin;

            // Use default if no value specified
            if (_is.undefined(volume)) {
                volume = config.volume;

                if (config.storage.enabled && _storage().supported) {
                    volume = window.localStorage.getItem(config.storage.key);

                    // Clean up old volume
                    // https://github.com/Selz/pleierbg/issues/171
                    window.localStorage.removeItem('pleierbg-volume');
                }
            }

            // Use config if all else fails
            if (volume === null || isNaN(volume)) {
                volume = config.volume;
            }

            // Maximum is volumeMax
            if (volume > max) {
                volume = max;
            }
            // Minimum is volumeMin
            if (volume < min) {
                volume = min;
            }

            // Set the player volume
            pleierbg.media.volume = parseFloat(volume / max);

            // Set the display
            if (pleierbg.volume.display) {
                pleierbg.volume.display.value = volume;
            }

            // Embeds
            if (_inArray(config.types.embed, pleierbg.type)) {
                switch (pleierbg.type) {
                    case 'youtube':
                        pleierbg.embed.setVolume(pleierbg.media.volume * 100);
                        break;

                    case 'vimeo':
                    case 'soundcloud':
                        pleierbg.embed.setVolume(pleierbg.media.volume);
                        break;
                }

                // Trigger volumechange for embeds
                _triggerEvent(pleierbg.media, 'volumechange');
            }

            // Toggle muted state
            if (pleierbg.media.muted && volume > 0) {
                _toggleMute();
            }
        }

        // Increase volume
        function _increaseVolume() {
            var volume = pleierbg.media.muted ? 0 : (pleierbg.media.volume * config.volumeMax);

            _setVolume(volume + (config.volumeStep / 5));
        }

        // Decrease volume
        function _decreaseVolume() {
            var volume = pleierbg.media.muted ? 0 : (pleierbg.media.volume * config.volumeMax);

            _setVolume(volume - (config.volumeStep / 5));
        }

        // Update volume UI and storage
        function _updateVolume() {
            // Get the current volume
            var volume = pleierbg.media.muted ? 0 : (pleierbg.media.volume * config.volumeMax);

            // Update the <input type="range"> if present
            if (pleierbg.supported.full) {
                if (pleierbg.volume.input) {
                    pleierbg.volume.input.value = volume;
                }
                if (pleierbg.volume.display) {
                    pleierbg.volume.display.value = volume;
                }
            }

            // Store the volume in storage
            if (config.storage.enabled && _storage().supported && !isNaN(volume)) {
                window.localStorage.setItem(config.storage.key, volume);
            }

            // Toggle class if muted
            _toggleClass(pleierbg.container, config.classes.muted, (volume === 0));

            // Update checkbox for mute state
            if (pleierbg.supported.full && pleierbg.buttons.mute) {
                _toggleState(pleierbg.buttons.mute, (volume === 0));
            }
        }

        // Toggle captions
        function _toggleCaptions(show) {
            // If there's no full support, or there's no caption toggle
            if (!pleierbg.supported.full || !pleierbg.buttons.captions) {
                return;
            }

            // If the method is called without parameter, toggle based on current value
            if (!_is.boolean(show)) {
                show = (pleierbg.container.className.indexOf(config.classes.captions.active) === -1);
            }

            // Set global
            pleierbg.captionsEnabled = show;

            // Toggle state
            _toggleState(pleierbg.buttons.captions, pleierbg.captionsEnabled);

            // Add class hook
            _toggleClass(pleierbg.container, config.classes.captions.active, pleierbg.captionsEnabled);

            // Trigger an event
            _triggerEvent(pleierbg.container, pleierbg.captionsEnabled ? 'captionsenabled' : 'captionsdisabled', true);
        }

        // Check if media is loading
        function _checkLoading(event) {
            var loading = (event.type === 'waiting');

            // Clear timer
            clearTimeout(pleierbg.timers.loading);

            // Timer to prevent flicker when seeking
            pleierbg.timers.loading = setTimeout(function () {
                _toggleClass(pleierbg.container, config.classes.loading, loading);
            }, (loading ? 250 : 0));
        }

        // Update <progress> elements
        function _updateProgress(event) {
            if (!pleierbg.supported.full) {
                return;
            }

            var progress = pleierbg.progress.played,
                value = 0,
                duration = _getDuration();

            if (event) {
                switch (event.type) {
                    // Video playing
                    case 'timeupdate':
                    case 'seeking':
                        if (pleierbg.controls.pressed) {
                            return;
                        }

                        value = _getPercentage(pleierbg.media.currentTime, duration);

                        // Set seek range value only if it's a 'natural' time event
                        if (event.type == 'timeupdate' && pleierbg.buttons.seek) {
                            pleierbg.buttons.seek.value = value;
                        }

                        break;

                    // Check buffer status
                    case 'playing':
                    case 'progress':
                        progress = pleierbg.progress.buffer;
                        value = (function () {
                            var buffered = pleierbg.media.buffered;

                            // HTML5
                            if (buffered && buffered.length) {
                                return _getPercentage(buffered.end(0), duration);
                            }
                            // YouTube returns between 0 and 1
                            else if (_is.number(buffered)) {
                                return (buffered * 100);
                            }

                            return 0;
                        })();

                        break;
                }
            }

            // Set values
            _setProgress(progress, value);
        }

        // Set <progress> value
        function _setProgress(progress, value) {
            if (!pleierbg.supported.full) {
                return;
            }

            // Default to 0
            if (_is.undefined(value)) {
                value = 0;
            }
            // Default to buffer or bail
            if (_is.undefined(progress)) {
                if (pleierbg.progress && pleierbg.progress.buffer) {
                    progress = pleierbg.progress.buffer;
                }
                else {
                    return;
                }
            }

            // One progress element passed
            if (_is.htmlElement(progress)) {
                progress.value = value;
            }
            // Object of progress + text element
            else if (progress) {
                if (progress.bar) {
                    progress.bar.value = value;
                }
                if (progress.text) {
                    progress.text.innerHTML = value;
                }
            }
        }

        // Update the displayed time
        function _updateTimeDisplay(time, element) {
            // Bail if there's no duration display
            if (!element) {
                return;
            }

            // Fallback to 0
            if (isNaN(time)) {
                time = 0;
            }

            pleierbg.secs = parseInt(time % 60);
            pleierbg.mins = parseInt((time / 60) % 60);
            pleierbg.hours = parseInt(((time / 60) / 60) % 60);

            // Do we need to display hours?
            var displayHours = (parseInt(((_getDuration() / 60) / 60) % 60) > 0);

            // Ensure it's two digits. For example, 03 rather than 3.
            pleierbg.secs = ('0' + pleierbg.secs).slice(-2);
            pleierbg.mins = ('0' + pleierbg.mins).slice(-2);

            // Render
            element.innerHTML = (displayHours ? pleierbg.hours + ':' : '') + pleierbg.mins + ':' + pleierbg.secs;
        }

        // Show the duration on metadataloaded
        function _displayDuration() {
            if (!pleierbg.supported.full) {
                return;
            }

            // Determine duration
            var duration = _getDuration() || 0;

            // If there's only one time display, display duration there
            if (!pleierbg.duration && config.displayDuration && pleierbg.media.paused) {
                _updateTimeDisplay(duration, pleierbg.currentTime);
            }

            // If there's a duration element, update content
            if (pleierbg.duration) {
                _updateTimeDisplay(duration, pleierbg.duration);
            }

            // Update the tooltip (if visible)
            _updateSeekTooltip();
        }

        // Handle time change event
        function _timeUpdate(event) {
            // Duration
            _updateTimeDisplay(pleierbg.media.currentTime, pleierbg.currentTime);

            // Ignore updates while seeking
            if (event && event.type == 'timeupdate' && pleierbg.media.seeking) {
                return;
            }

            // Playing progress
            _updateProgress(event);
        }

        // Update seek range and progress 
        function _updateSeekDisplay(time) {
            // Default to 0
            if (!_is.number(time)) {
                time = 0;
            }

            var duration = _getDuration(),
                value = _getPercentage(time, duration);

            // Update progress 
            if (pleierbg.progress && pleierbg.progress.played) {
                pleierbg.progress.played.value = value;
            }

            // Update seek range input
            if (pleierbg.buttons && pleierbg.buttons.seek) {
                pleierbg.buttons.seek.value = value;
            }
        }

        // Update hover tooltip for seeking
        function _updateSeekTooltip(event) {
            var duration = _getDuration();

            // Bail if setting not true
            if (!config.tooltips.seek || !pleierbg.progress.container || duration === 0) {
                return;
            }

            // Calculate percentage
            var clientRect = pleierbg.progress.container.getBoundingClientRect(),
                percent = 0,
                visible = config.classes.tooltip + '--visible';

            // Determine percentage, if already visible
            if (!event) {
                if (_hasClass(pleierbg.progress.tooltip, visible)) {
                    percent = pleierbg.progress.tooltip.style.left.replace('%', '');
                }
                else {
                    return;
                }
            }
            else {
                percent = ((100 / clientRect.width) * (event.pageX - clientRect.left));
            }

            // Set bounds
            if (percent < 0) {
                percent = 0;
            }
            else if (percent > 100) {
                percent = 100;
            }

            // Display the time a click would seek to
            _updateTimeDisplay(((duration / 100) * percent), pleierbg.progress.tooltip);

            // Set position
            pleierbg.progress.tooltip.style.left = percent + "%";

            // Show/hide the tooltip
            // If the event is a moues in/out and percentage is inside bounds
            if (event && _inArray(['mouseenter', 'mouseleave'], event.type)) {
                _toggleClass(pleierbg.progress.tooltip, visible, (event.type === 'mouseenter'));
            }
        }

        // Show the player controls in fullscreen mode
        function _toggleControls(toggle) {
            if (!config.hideControls || pleierbg.type === 'audio') {
                return;
            }

            var delay = 0,
                isEnterFullscreen = false,
                show = toggle;

            // Default to false if no boolean
            if (!_is.boolean(toggle)) {
                if (toggle && toggle.type) {
                    // Is the enter fullscreen event
                    isEnterFullscreen = (toggle.type === 'enterfullscreen');

                    // Whether to show controls
                    show = _inArray(['mousemove', 'touchstart', 'mouseenter', 'focus'], toggle.type);

                    // Delay hiding on move events
                    if (_inArray(['mousemove', 'touchmove'], toggle.type)) {
                        delay = 2000;
                    }

                    // Delay a little more for keyboard users
                    if (toggle.type === 'focus') {
                        delay = 3000;
                    }
                }
                else {
                    show = _hasClass(pleierbg.container, config.classes.hideControls);
                }
            }

            // Clear timer every movement
            window.clearTimeout(pleierbg.timers.hover);

            // If the mouse is not over the controls, set a timeout to hide them
            if (show || pleierbg.media.paused) {
                _toggleClass(pleierbg.container, config.classes.hideControls, false);

                // Always show controls when paused or if touch
                if (pleierbg.media.paused) {
                    return;
                }

                // Delay for hiding on touch
                if (pleierbg.browser.isTouch) {
                    delay = 3000;
                }
            }

            // If toggle is false or if we're playing (regardless of toggle), 
            // then set the timer to hide the controls 
            if (!show || !pleierbg.media.paused) {
                pleierbg.timers.hover = window.setTimeout(function () {
                    // If the mouse is over the controls (and not entering fullscreen), bail
                    if ((pleierbg.controls.pressed || pleierbg.controls.hover) && !isEnterFullscreen) {
                        return;
                    }

                    _toggleClass(pleierbg.container, config.classes.hideControls, true);
                }, delay);
            }
        }

        // Add common function to retrieve media source
        function _source(source) {
            // If not null or undefined, parse it
            if (!_is.undefined(source)) {
                _updateSource(source);
                return;
            }

            // Return the current source
            var url;
            switch (pleierbg.type) {
                case 'youtube':
                    url = pleierbg.embed.getVideoUrl();
                    break;

                case 'vimeo':
                    pleierbg.embed.getVideoUrl.then(function (value) {
                        url = value;
                    });
                    break;

                case 'soundcloud':
                    pleierbg.embed.getCurrentSound(function (object) {
                        url = object.permalink_url;
                    });
                    break;

                default:
                    url = pleierbg.media.currentSrc;
                    break;
            }

            return url || '';
        }

        // Update source
        // Sources are not checked for support so be careful
        function _updateSource(source) {
            if (!_is.object(source) || !('sources' in source) || !source.sources.length) {
                _warn('Invalid source format');
                return;
            }

            // Pause playback
            _pause();

            // Update seek range and progress
            _updateSeekDisplay();

            // Reset buffer progress
            _setProgress();

            // Cancel current network requests
            _cancelRequests();

            // Clean up YouTube stuff
            if (pleierbg.type === 'youtube') {
                // Destroy the embed instance
                pleierbg.embed.destroy();

                // Clear timer
                window.clearInterval(pleierbg.timer.buffering);
                window.clearInterval(pleierbg.timer.playing);
            }
            // HTML5 Video
            else if (pleierbg.type === 'video' && pleierbg.videoContainer) {
                // Remove video wrapper
                _remove(pleierbg.videoContainer);
            }

            // Remove embed object
            pleierbg.embed = null;

            // Remove the old media
            _remove(pleierbg.media);

            // Set the type
            if ('type' in source) {
                pleierbg.type = source.type;

                // Get child type for video (it might be an embed)
                if (pleierbg.type === 'video') {
                    var firstSource = source.sources[0];

                    if ('type' in firstSource && _inArray(config.types.embed, firstSource.type)) {
                        pleierbg.type = firstSource.type;
                    }
                }
            }

            // Check for support
            pleierbg.supported = supported(pleierbg.type);

            // Create new markup
            switch (pleierbg.type) {
                case 'video':
                    pleierbg.media = document.createElement('video');
                    break;

                case 'audio':
                    pleierbg.media = document.createElement('audio');
                    break;

                case 'youtube':
                case 'vimeo':
                case 'soundcloud':
                    pleierbg.media = document.createElement('div');
                    pleierbg.embedId = source.sources[0].src;
                    break;
            }

            // Inject the new element
            _prependChild(pleierbg.container, pleierbg.media);

            // Autoplay the new source?
            if (_is.boolean(source.autoplay)) {
                config.autoplay = source.autoplay;
            }

            // Set attributes for audio video
            if (_inArray(config.types.html5, pleierbg.type)) {
                if (config.crossorigin) {
                    pleierbg.media.setAttribute('crossorigin', '');
                }
                if (config.autoplay) {
                    pleierbg.media.setAttribute('autoplay', '');
                }
                if ('poster' in source) {
                    pleierbg.media.setAttribute('poster', source.poster);
                }
                if (config.loop) {
                    pleierbg.media.setAttribute('loop', '');
                }
            }

            // Classname reset
            pleierbg.container.className = pleierbg.originalClassName;

            // Restore class hooks
            _toggleClass(pleierbg.container, config.classes.fullscreen.active, pleierbg.isFullscreen);
            _toggleClass(pleierbg.container, config.classes.captions.active, pleierbg.captionsEnabled);
            _toggleStyleHook();

            // Set new sources for html5
            if (_inArray(config.types.html5, pleierbg.type)) {
                _insertChildElements('source', source.sources);
            }

            // Set up from scratch
            _setupMedia();

            // HTML5 stuff
            if (_inArray(config.types.html5, pleierbg.type)) {
                // Setup captions
                if ('tracks' in source) {
                    _insertChildElements('track', source.tracks);
                }

                // Load HTML5 sources
                pleierbg.media.load();

                // Setup interface
                _setupInterface();

                // Display duration if available
                _displayDuration();
            }
            // If embed but not fully supported, setupInterface now
            else if (_inArray(config.types.embed, pleierbg.type) && !pleierbg.supported.full) {
                _setupInterface();
            }

            // Set aria title and iframe title
            config.title = source.title;
            _setTitle();

            // Reset media objects
            pleierbg.container.pleierbg.media = pleierbg.media;
        }

        // Update poster
        function _updatePoster(source) {
            if (pleierbg.type === 'video') {
                pleierbg.media.setAttribute('poster', source);
            }
        }

        // Listen for control events
        function _controlListeners() {
            // IE doesn't support input event, so we fallback to change
            var inputEvent = (pleierbg.browser.isIE ? 'change' : 'input');

            // Click play/pause helper
            function _togglePlay() {
                var play = pleierbg.media.paused;

                // Toggle playback
                if (play) {
                    _play();
                }
                else {
                    _pause();
                }

                // Determine which buttons
                var trigger = pleierbg.buttons[play ? 'play' : 'pause'],
                    target = pleierbg.buttons[play ? 'pause' : 'play'];

                // Get the last play button to account for the large play button
                if (target && target.length > 1) {
                    target = target[target.length - 1];
                }
                else {
                    target = target[0];
                }

                // Setup focus and tab focus
                if (target) {
                    var hadTabFocus = _hasClass(trigger, config.classes.tabFocus);

                    setTimeout(function () {
                        target.focus();

                        if (hadTabFocus) {
                            _toggleClass(trigger, config.classes.tabFocus, false);
                            _toggleClass(target, config.classes.tabFocus, true);
                        }
                    }, 100);
                }
            }

            // Detect tab focus
            function checkFocus() {
                var focused = document.activeElement;

                if (!focused || focused == document.body) {
                    focused = null;
                }
                else if (document.querySelector) {
                    focused = document.querySelector(':focus');
                }
                for (var button in pleierbg.buttons) {
                    var element = pleierbg.buttons[button];

                    if (_is.nodeList(element)) {
                        for (var i = 0; i < element.length; i++) {
                            _toggleClass(element[i], config.classes.tabFocus, (element[i] === focused));
                        }
                    }
                    else {
                        _toggleClass(element, config.classes.tabFocus, (element === focused));
                    }
                }
            }

            _on(window, 'keyup', function (event) {
                var code = (event.keyCode ? event.keyCode : event.which);

                if (code == 9) {
                    checkFocus();
                }
            });
            _on(document.body, 'click', function () {
                _toggleClass(_getElement('.' + config.classes.tabFocus), config.classes.tabFocus, false);
            });
            for (var button in pleierbg.buttons) {
                var element = pleierbg.buttons[button];

                _on(element, 'blur', function () {
                    _toggleClass(element, 'tab-focus', false);
                });
            }

            // Play
            _proxyListener(pleierbg.buttons.play, 'click', config.listeners.play, _togglePlay);

            // Pause
            _proxyListener(pleierbg.buttons.pause, 'click', config.listeners.pause, _togglePlay);

            // Restart
            _proxyListener(pleierbg.buttons.restart, 'click', config.listeners.restart, _seek);

            // Rewind
            _proxyListener(pleierbg.buttons.rewind, 'click', config.listeners.rewind, _rewind);

            // Fast forward
            _proxyListener(pleierbg.buttons.forward, 'click', config.listeners.forward, _forward);

            // Seek
            _proxyListener(pleierbg.buttons.seek, inputEvent, config.listeners.seek, _seek);

            // Set volume
            _proxyListener(pleierbg.volume.input, inputEvent, config.listeners.volume, function () {
                _setVolume(pleierbg.volume.input.value);
            });

            // Mute
            _proxyListener(pleierbg.buttons.mute, 'click', config.listeners.mute, _toggleMute);

            // Fullscreen
            _proxyListener(pleierbg.buttons.fullscreen, 'click', config.listeners.fullscreen, _toggleFullscreen);

            // Handle user exiting fullscreen by escaping etc
            if (fullscreen.supportsFullScreen) {
                _on(document, fullscreen.fullScreenEventName, _toggleFullscreen);
            }

            // Captions
            _on(pleierbg.buttons.captions, 'click', _toggleCaptions);

            // Seek tooltip
            _on(pleierbg.progress.container, 'mouseenter mouseleave mousemove', _updateSeekTooltip);

            // Toggle controls visibility based on mouse movement
            if (config.hideControls) {
                // Toggle controls on mouse events and entering fullscreen
                _on(pleierbg.container, 'mouseenter mouseleave mousemove touchstart touchend touchcancel touchmove enterfullscreen', _toggleControls);

                // Watch for cursor over controls so they don't hide when trying to interact
                _on(pleierbg.controls, 'mouseenter mouseleave', function (event) {
                    pleierbg.controls.hover = event.type === 'mouseenter';
                });

                // Watch for cursor over controls so they don't hide when trying to interact
                _on(pleierbg.controls, 'mousedown mouseup touchstart touchend touchcancel', function (event) {
                    pleierbg.controls.pressed = _inArray(['mousedown', 'touchstart'], event.type);
                });

                // Focus in/out on controls
                _on(pleierbg.controls, 'focus blur', _toggleControls, true);
            }

            // Adjust volume on scroll
            _on(pleierbg.volume.input, 'wheel', function (event) {
                event.preventDefault();

                // Detect "natural" scroll - suppored on OS X Safari only
                // Other browsers on OS X will be inverted until support improves
                var inverted = event.webkitDirectionInvertedFromDevice;

                // Scroll down (or up on natural) to decrease
                if (event.deltaY < 0 || event.deltaX > 0) {
                    if (inverted) {
                        _decreaseVolume();
                    }
                    else {
                        _increaseVolume();
                    }
                }

                // Scroll up (or down on natural) to increase
                if (event.deltaY > 0 || event.deltaX < 0) {
                    if (inverted) {
                        _increaseVolume();
                    }
                    else {
                        _decreaseVolume();
                    }
                }
            });
        }

        // Listen for media events
        function _mediaListeners() {
            // Time change on media
            _on(pleierbg.media, 'timeupdate seeking', _timeUpdate);

            // Update manual captions
            _on(pleierbg.media, 'timeupdate', _seekManualCaptions);

            // Display duration
            _on(pleierbg.media, 'durationchange loadedmetadata', _displayDuration);

            // Handle the media finishing
            _on(pleierbg.media, 'ended', function () {
                // Clear
                if (pleierbg.type === 'video') {
                    _setCaption();
                }

                // Reset UI
                _checkPlaying();

                // Seek to 0
                _seek(0);

                // Reset duration display
                _displayDuration();

                // Show poster on end
                if (pleierbg.type === 'video' && config.showPosterOnEnd) {
                    // Re-load media
                    pleierbg.media.load();
                }
            });

            // Check for buffer progress
            _on(pleierbg.media, 'progress playing', _updateProgress);

            // Handle native mute
            _on(pleierbg.media, 'volumechange', _updateVolume);

            // Handle native play/pause
            _on(pleierbg.media, 'play pause', _checkPlaying);

            // Loading
            _on(pleierbg.media, 'waiting canplay seeked', _checkLoading);

            // Click video
            if (config.clickToPlay && pleierbg.type !== 'audio') {
                // Re-fetch the wrapper
                var wrapper = _getElement('.' + config.classes.videoWrapper);

                // Bail if there's no wrapper (this should never happen)
                if (!wrapper) {
                    return;
                }

                // Set cursor
                wrapper.style.cursor = "pointer";

                // On click play, pause ore restart
                _on(wrapper, 'click', function () {
                    // Touch devices will just show controls (if we're hiding controls)
                    if (config.hideControls && pleierbg.browser.isTouch && !pleierbg.media.paused) {
                        return;
                    }

                    if (pleierbg.media.paused) {
                        _play();
                    }
                    else if (pleierbg.media.ended) {
                        _seek();
                        _play();
                    }
                    else {
                        _pause();
                    }
                });
            }

            // Disable right click
            if (config.disableContextMenu) {
                _on(pleierbg.media, 'contextmenu', function (event) {
                    event.preventDefault();
                });
            }

            // Proxy events to container
            _on(pleierbg.media, config.events.join(' '), function (event) {
                _triggerEvent(pleierbg.container, event.type, true);
            });
        }

        // Cancel current network requests
        // See https://github.com/Selz/pleierbg/issues/174
        function _cancelRequests() {
            if (!_inArray(config.types.html5, pleierbg.type)) {
                return;
            }

            // Remove child sources
            var sources = pleierbg.media.querySelectorAll('source');
            for (var i = 0; i < sources.length; i++) {
                _remove(sources[i]);
            }

            // Set blank video src attribute
            // This is to prevent a MEDIA_ERR_SRC_NOT_SUPPORTED error
            // Info: http://stackoverflow.com/questions/32231579/how-to-properly-dispose-of-an-html5-video-and-close-socket-or-connection
            pleierbg.media.setAttribute('src', 'https://cdn.selz.com/pleierbg/blank.mp4');

            // Load the new empty source
            // This will cancel existing requests
            // See https://github.com/Selz/pleierbg/issues/174
            pleierbg.media.load();

            // Debugging
            _log("Cancelled network requests for old media");
        }

        // Destroy an instance
        // Event listeners are removed when elements are removed
        // http://stackoverflow.com/questions/12528049/if-a-dom-element-is-removed-are-its-listeners-also-removed-from-memory
        function _destroy() {
            // Bail if the element is not initialized
            if (!pleierbg.init) {
                return null;
            }

            // Reset container classname
            pleierbg.container.setAttribute('class', _getClassname(config.selectors.container));

            // Remove init flag
            pleierbg.init = false;

            // Remove controls
            _remove(_getElement(config.selectors.controls.wrapper));

            // YouTube
            if (pleierbg.type === 'youtube') {
                pleierbg.embed.destroy();
                return;
            }

            // If video, we need to remove some more
            if (pleierbg.type === 'video') {
                // Remove captions container
                _remove(_getElement(config.selectors.captions));

                // Remove video wrapper
                _unwrap(pleierbg.videoContainer);
            }

            // Restore native video controls
            _toggleNativeControls(true);

            // Clone the media element to remove listeners
            // http://stackoverflow.com/questions/19469881/javascript-remove-all-event-listeners-of-specific-type
            var clone = pleierbg.media.cloneNode(true);
            pleierbg.media.parentNode.replaceChild(clone, pleierbg.media);
        }

        // Setup a player
        function _init() {
            // Bail if the element is initialized
            if (pleierbg.init) {
                return null;
            }

            // Setup the fullscreen api
            fullscreen = _fullscreen();

            // Sniff out the browser
            pleierbg.browser = _browserSniff();

            // Get the media element
            pleierbg.media = pleierbg.container.querySelectorAll('audio, video')[0];

            // Get the div placeholder for YouTube and Vimeo
            if (!pleierbg.media) {
                pleierbg.media = pleierbg.container.querySelectorAll('[data-type]')[0];
            }

            // Bail if nothing to setup
            if (!pleierbg.media) {
                return;
            }

            // Get original classname
            pleierbg.originalClassName = pleierbg.container.className;

            // Set media type based on tag or data attribute
            // Supported: video, audio, vimeo, youtube
            var tagName = pleierbg.media.tagName.toLowerCase();
            if (tagName === 'div') {
                pleierbg.type = pleierbg.media.getAttribute('data-type');
                pleierbg.embedId = pleierbg.media.getAttribute('data-video-id');

                // Clean up
                pleierbg.media.removeAttribute('data-type');
                pleierbg.media.removeAttribute('data-video-id');
            }
            else {
                pleierbg.type = tagName;
                config.crossorigin = (pleierbg.media.getAttribute('crossorigin') !== null);
                config.autoplay = (config.autoplay || (pleierbg.media.getAttribute('autoplay') !== null));
                config.loop = (config.loop || (pleierbg.media.getAttribute('loop') !== null));
            }

            // Check for support
            pleierbg.supported = supported(pleierbg.type);

            // Add style hook
            _toggleStyleHook();

            // If no native support, bail
            if (!pleierbg.supported.basic) {
                return false;
            }

            // Debug info
            _log(pleierbg.browser.name + ' ' + pleierbg.browser.version);

            // Setup media
            _setupMedia();

            // Setup interface
            if (_inArray(config.types.html5, pleierbg.type)) {
                // Bail if no support
                if (!pleierbg.supported.full) {
                    // Successful setup
                    pleierbg.init = true;

                    // Don't inject controls if no full support
                    return;
                }

                // Setup UI
                _setupInterface();

                // Set title on button and frame
                _setTitle();

                // Autoplay
                if (config.autoplay) {
                    _play();
                }
            }
            // If embed but not fully supported, setupInterface now (to avoid flash of controls)
            else if (_inArray(config.types.embed, pleierbg.type) && !pleierbg.supported.full) {
                _setupInterface();
            }

            // Successful setup
            pleierbg.init = true;
        }

        function _setupInterface() {
            // Don't setup interface if no support
            if (!pleierbg.supported.full) {
                _warn('No full support for this media type (' + pleierbg.type + ')');

                // Remove controls
                _remove(_getElement(config.selectors.controls.wrapper));

                // Remove large play
                _remove(_getElement(config.selectors.buttons.play));

                // Restore native controls
                _toggleNativeControls(true);

                // Bail
                return;
            }

            // Inject custom controls if not present
            var controlsMissing = !_getElements(config.selectors.controls.wrapper).length;
            if (controlsMissing) {
                // Inject custom controls
                _injectControls();
            }

            // Find the elements
            if (!_findElements()) {
                return;
            }

            // If the controls are injected, re-bind listeners for controls
            if (controlsMissing) {
                _controlListeners();
            }

            // Media element listeners
            _mediaListeners();

            // Remove native controls
            _toggleNativeControls();

            // Setup fullscreen
            _setupFullscreen();

            // Captions
            _setupCaptions();

            // Set volume
            _setVolume();
            _updateVolume();

            // Reset time display
            _timeUpdate();

            // Update the UI
            _checkPlaying();

            // Display duration
            _displayDuration();

            // Ready event
            _triggerEvent(pleierbg.container, 'ready', true);
        }

        // Initialize instance
        _init();

        // If init failed, return an empty object
        if (!pleierbg.init) {
            return {};
        }

        return {
            media: pleierbg.media,
            play: _play,
            pause: _pause,
            restart: _seek,
            rewind: _rewind,
            forward: _forward,
            seek: _seek,
            source: _source,
            poster: _updatePoster,
            setVolume: _setVolume,
            togglePlay: _togglePlay,
            toggleMute: _toggleMute,
            toggleCaptions: _toggleCaptions,
            toggleFullscreen: _toggleFullscreen,
            toggleControls: _toggleControls,
            isFullscreen: function () {
                return pleierbg.isFullscreen || false;
            },
            support: function (mimeType) {
                return _supportMime(pleierbg, mimeType);
            },
            destroy: _destroy,
            restore: _init,
            getCurrentTime: function () {
                return pleierbg.media.currentTime;
            }
        };
    }

    // Load a sprite
    function loadSprite(url, id) {
        var x = new XMLHttpRequest();

        // If the id is set and sprite exists, bail
        if (_is.string(id) && document.querySelector('#' + id) !== null) {
            return;
        }

        // Check for CORS support
        if ('withCredentials' in x) {
            x.open('GET', url, true);
        }
        else {
            return;
        }

        // Inject hidden div with sprite on load
        x.onload = function () {
            var c = document.createElement('div');
            c.setAttribute('hidden', '');
            if (_is.string(id)) {
                c.setAttribute('id', id);
            }
            c.innerHTML = x.responseText;
            document.body.insertBefore(c, document.body.childNodes[0]);
        }

        x.send();
    }

    // Check for support
    function supported(type) {
        var browser = _browserSniff(),
            isOldIE = (browser.isIE && browser.version <= 9),
            isIos = browser.isIos,
            isIphone = /iPhone|iPod/i.test(navigator.userAgent),
            audio = !!document.createElement('audio').canPlayType,
            video = !!document.createElement('video').canPlayType,
            basic, full;

        switch (type) {
            case 'video':
                basic = video;
                full = (basic && (!isOldIE && !isIphone));
                break;

            case 'audio':
                basic = audio;
                full = (basic && !isOldIE);
                break;

            case 'vimeo':
            case 'youtube':
            case 'soundcloud':
                basic = true;
                full = (!isOldIE && !isIos);
                break;

            default:
                basic = (audio && video);
                full = (basic && !isOldIE);
        }

        return {
            basic: basic,
            full: full
        };
    }

    // Setup function
    function setup(targets, options) {
        // Get the players
        var elements = [],
            containers = [],
            selector = [defaults.selectors.html5, defaults.selectors.embed].join(',');

        // Select the elements
        // Assume elements is a NodeList by default
        if (_is.string(targets)) {
            targets = document.querySelectorAll(targets);
        }
        // Single HTMLElement passed
        else if (_is.htmlElement(targets)) {
            targets = [targets];
        }
        // No selector passed, possibly options as first argument
        else if (!_is.nodeList(targets) && !_is.array(targets) && !_is.string(targets)) {
            // If options are the first argument
            if (_is.undefined(options) && _is.object(targets)) {
                options = targets;
            }

            // Use default selector
            targets = document.querySelectorAll(selector);
        }

        // Convert NodeList to array
        if (_is.nodeList(targets)) {
            targets = Array.prototype.slice.call(targets);
        }

        // Bail if disabled or no basic support
        // You may want to disable certain UAs etc
        if (!supported().basic || !targets.length) {
            return false;
        }

        // Check if the targets have multiple media elements
        for (var i = 0; i < targets.length; i++) {
            var target = targets[i];

            // Get children
            var children = target.querySelectorAll(selector);

            // If there's more than one media element, wrap them
            if (children.length > 1) {
                for (var x = 0; x < children.length; x++) {
                    containers.push({
                        element: _wrap(children[x], document.createElement('div')),
                        original: target
                    });
                }
            }
            else {
                containers.push({
                    element: target
                });
            }
        }

        // Create a player instance for each element
        for (var key in containers) {
            var element = containers[key].element,
                original = containers[key].original || element;

            // Wrap each media element if is target is media element
            // as opposed to a wrapper
            if (_matches(element, selector)) {
                // Wrap in a <div>
                element = _wrap(element, document.createElement('div'));
            }

            // Setup a player instance and add to the element
            if (!('pleierbg' in element)) {
                // Create instance-specific config
                var config = _extend({}, defaults, options, JSON.parse(original.getAttribute('data-pleierbg')));

                // Bail if not enabled
                if (!config.enabled) {
                    return null;
                }

                // Create new instance
                var instance = new Plyr(element, config);

                // Set pleierbg to false if setup failed
                element.pleierbg = (Object.keys(instance).length ? instance : false);

                // Callback
                _triggerEvent(original, 'setup', true, {
                    pleierbg: element.pleierbg
                });
            }

            // Add to return array even if it's already setup
            elements.push(element);
        }

        return elements;
    }

    return {
        setup: setup,
        supported: supported,
        loadSprite: loadSprite
    };
}));

// Custom event polyfill
// https://developer.mozilla.org/en-US/docs/Web/API/CustomEvent/CustomEvent
(function () {
    if (typeof window.CustomEvent === 'function') {
        return;
    }

    function CustomEvent(event, params) {
        params = params || {bubbles: false, cancelable: false, detail: undefined};
        var evt = document.createEvent('CustomEvent');
        evt.initCustomEvent(event, params.bubbles, params.cancelable, params.detail);
        return evt;
    }

    CustomEvent.prototype = window.Event.prototype;

    window.CustomEvent = CustomEvent;
})();
