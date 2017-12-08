;(function(root, factory) {
    'use strict';
    /*global define,module*/

    if (typeof module === 'object' && typeof module.exports === 'object') {
        // Node, CommonJS-like
        module.exports = factory(root, document);
    } else if (typeof define === 'function' && define.amd) {
        // AMD
        define(null, function() { factory(root, document) });
    } else {
        // Browser globals (root is window)
        root.pleier = factory(root, document);
    }
}(typeof window !== 'undefined' ? window : this, function(window, document) {
    'use strict';

    // Globals
    var fullscreen, 
    scroll = { x: 0, y: 0 },

    // Default config
    defaults = {
        enabled:                true,
        debug:                  false,
        autoplay:               false,
        loop:                   false,
        seekTime:               10,
        volume:                 10,
        volumeMin:              0, 
        volumeMax:              10, 
        volumeStep:             1,
        duration:               null,
        displayDuration:        true,
        loadSprite:             true,
        iconPrefix:             'pleier',
        iconUrl:                '/site/templates/pleier/sprite/pleier.svg',
        clickToPlay:            true,
        hideControls:           true,
        showPosterOnEnd:        false,
        disableContextMenu:     true,
        tooltips: {
            controls:           false,
            seek:               true
        },
        selectors: {
            html5:              'video, audio',
            embed:              '[data-type]',
            container:          '.pleier',
            controls: {
                container:      null,
                wrapper:        '.pleier__controls'
            },
            labels:             '[data-pleier]',
            buttons: {
                seek:           '[data-pleier="seek"]',
                play:           '[data-pleier="play"]',
                pause:          '[data-pleier="pause"]',
                restart:        '[data-pleier="restart"]',
                rewind:         '[data-pleier="rewind"]',
                forward:        '[data-pleier="fast-forward"]',
                mute:           '[data-pleier="mute"]',
                captions:       '[data-pleier="captions"]',
                fullscreen:     '[data-pleier="fullscreen"]'
            },
            volume: {
                input:          '[data-pleier="volume"]',
                display:        '.pleier__volume--display'
            },
            progress: {
                container:      '.pleier__progress',
                buffer:         '.pleier__progress--buffer',
                played:         '.pleier__progress--played'
            },
            captions:           '.pleier__captions',
            currentTime:        '.pleier__time--current',
            duration:           '.pleier__time--duration'
        },
        classes: {
            videoWrapper:       'pleier__video-wrapper',
            embedWrapper:       'pleier__video-embed',
            type:               'pleier--{0}',
            stopped:            'pleier--stopped',
            playing:            'pleier--playing',
            muted:              'pleier--muted',
            loading:            'pleier--loading',
            hover:              'pleier--hover',
            tooltip:            'pleier__tooltip',
            hidden:             'pleier__sr-only',
            hideControls:       'pleier--hide-controls',
            isIos:              'pleier--is-ios',
            isTouch:            'pleier--is-touch',
            captions: {
                enabled:        'pleier--captions-enabled',
                active:         'pleier--captions-active'
            },
            fullscreen: {
                enabled:        'pleier--fullscreen-enabled',
                active:         'pleier--fullscreen-active'
            },
            tabFocus:           'tab-focus'
        },
        captions: {
            defaultActive:      false
        },
        fullscreen: {
            enabled:            true,
            fallback:           true,
            allowAudio:         false
        },
        storage: {
            enabled:            true,
            key:                'pleier'
        },
        controls:               ['play-large', 'play', 'progress', 'current-time', 'mute', 'volume', 'captions', 'fullscreen'],
        i18n: {
            restart:            'Restart',
            rewind:             'Rewind {seektime} secs',
            play:               'Play',
            pause:              'Pause',
            forward:            'Forward {seektime} secs',
            played:             'played',
            buffered:           'buffered',
            currentTime:        'Current time',
            duration:           'Duration',
            volume:             'Volume',
            toggleMute:         'Toggle Mute',
            toggleCaptions:     'Toggle Captions',
            toggleFullscreen:   'Toggle Fullscreen',
            frameTitle:         'Player for {title}'
        },
        types: {
            embed:              ['youtube', 'vimeo', 'soundcloud'],
            html5:              ['video', 'audio']
        },
        // URLs
        urls: {
            vimeo: {
                api:            'https://player.vimeo.com/api/player.js',
            },
            youtube: {
                api:            'https://www.youtube.com/iframe_api'
            },
            soundcloud: {
                api:            'https://w.soundcloud.com/player/api.js'
            }
        },
        // Custom control listeners
        listeners: {
            seek:               null,
            play:               null,
            pause:              null,
            restart:            null,
            rewind:             null,
            forward:            null,
            mute:               null,
            volume:             null,
            captions:           null,
            fullscreen:         null
        },
        // Events to watch on HTML5 media elements
        events:                 ['ended', 'progress', 'stalled', 'playing', 'waiting', 'canplay', 'canplaythrough', 'loadstart', 'loadeddata', 'loadedmetadata', 'timeupdate', 'volumechange', 'play', 'pause', 'error', 'seeking', 'emptied']
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
            name = ua.substring(nameOffset,verOffset);
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
            name:       name,
            version:    majorVersion,
            isIE:       isIE,
            isFirefox:  isFirefox,
            isChrome:   isChrome,
            isSafari:   isSafari,
            isIos:      /(iPad|iPhone|iPod)/g.test(navigator.platform),
            isTouch:    'ontouchstart' in document.documentElement
        };
    }

    // Check for mime type support against a player instance
    // Credits: http://diveintohtml5.info/everything.html
    // Related: http://www.leanbackpleier.com/test/h5mt.html
    function _supportMime(pleier, mimeType) {
        var media = pleier.media;

        // Only check video types for video players
        if (pleier.type == 'video') {
            // Check type
            switch (mimeType) {
                case 'video/webm':   return !!(media.canPlayType && media.canPlayType('video/webm; codecs="vp8, vorbis"').replace(/no/, ''));
                case 'video/mp4':    return !!(media.canPlayType && media.canPlayType('video/mp4; codecs="avc1.42E01E, mp4a.40.2"').replace(/no/, ''));
                case 'video/ogg':    return !!(media.canPlayType && media.canPlayType('video/ogg; codecs="theora"').replace(/no/, ''));
            }
        }

        // Only check audio types for audio players
        else if (pleier.type == 'audio') {
            // Check type
            switch (mimeType) {
                case 'audio/mpeg':   return !!(media.canPlayType && media.canPlayType('audio/mpeg;').replace(/no/, ''));
                case 'audio/ogg':    return !!(media.canPlayType && media.canPlayType('audio/ogg; codecs="vorbis"').replace(/no/, ''));
                case 'audio/wav':    return !!(media.canPlayType && media.canPlayType('audio/wav; codecs="1"').replace(/no/, ''));
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
            var child   = (i > 0) ? wrapper.cloneNode(true) : wrapper;
            var element = elements[i];

            // Cache the current parent and sibling.
            var parent  = element.parentNode;
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

        var f = p.matches || p.webkitMatchesSelector || p.mozMatchesSelector || p.msMatchesSelector || function(s) {
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
        _on(element, eventName, function(event) {
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
            bubbles:    bubbles,
            detail:     properties 
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
            length      = objects.length;

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
        object: function(input) {
            return input !== null && typeof(input) === 'object'; 
        },
        array: function(input) {
            return input !== null && typeof(input) === 'object' && input.constructor === Array;
        },
        number: function(input) {
            return typeof(input) === 'number' && !isNaN(input - 0) || (typeof input == 'object' && input.constructor === Number);
        },
        string: function(input) {
            return typeof input === 'string' || (typeof input == 'object' && input.constructor === String);
        },
        boolean: function(input) {
            return typeof input === 'boolean';
        },
        nodeList: function(input) {
            return input instanceof NodeList;
        },
        htmlElement: function(input) {
            return input instanceof HTMLElement;
        },
        undefined: function(input) {
            return typeof input === 'undefined';
        }
    };

    // Fullscreen API
    function _fullscreen() {
        var fullscreen = {
                supportsFullScreen: false,
                isFullScreen: function() { return false; },
                requestFullScreen: function() {},
                cancelFullScreen: function() {},
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
            for (var i = 0, il = browserPrefixes.length; i < il; i++ ) {
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

            fullscreen.isFullScreen = function(element) {
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
            fullscreen.requestFullScreen = function(element) {
                if (_is.undefined(element)) {
                    element = document.body;
                }
                return (this.prefix === '') ? element.requestFullScreen() : element[this.prefix + (this.prefix == 'ms' ? 'RequestFullscreen' : 'RequestFullScreen')]();
            };
            fullscreen.cancelFullScreen = function() {
                return (this.prefix === '') ? document.cancelFullScreen() : document[this.prefix + (this.prefix == 'ms' ? 'ExitFullscreen' : 'CancelFullScreen')]();
            };
            fullscreen.element = function() {
                return (this.prefix === '') ? document.fullscreenElement : document[this.prefix + 'FullscreenElement'];
            };
        }

        return fullscreen;
    }

    // Local storage
    function _storage() {
        var storage = {
            supported: (function() {
                if (!('localStorage' in window)) {
                    return false;
                }

                // Try to use it (it might be disabled, e.g. user is in private/porn mode)
                // see: https://github.com/Selz/pleier/issues/131
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
        var pleier = this;
        pleier.container = container;
        pleier.timers = {};

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
                url:        config.iconUrl,
                absolute:   (config.iconUrl.indexOf("http") === 0) || pleier.browser.isIE
            };
        }

        // Build the default HTML
        function _buildControls() {
            // Create html array
            var html        = [],
                iconUrl     = _getIconUrl(),
                iconPath    = (!iconUrl.absolute ? iconUrl.url : '') + '#' + config.iconPrefix;

            // Larger overlaid play button
            if (_inArray(config.controls, 'play-large')) {
                html.push(
                    '<button type="button" data-pleier="play" class="pleier__play-large">',
                        '<svg><use xlink:href="' + iconPath + '-play" /></svg>',
                        '<span class="pleier__sr-only">' + config.i18n.play + '</span>',
                    '</button>'
                );
            }

            html.push('<div class="pleier__controls">');

            // Restart button
            if (_inArray(config.controls, 'restart')) {
                html.push(
                    '<button type="button" data-pleier="restart">',
                        '<svg><use xlink:href="' + iconPath + '-restart" /></svg>',
                        '<span class="pleier__sr-only">' + config.i18n.restart + '</span>',
                    '</button>'
                );
            }

            // Rewind button
            if (_inArray(config.controls, 'rewind')) {
                html.push(
                    '<button type="button" data-pleier="rewind">',
                        '<svg><use xlink:href="' + iconPath + '-rewind" /></svg>',
                        '<span class="pleier__sr-only">' + config.i18n.rewind + '</span>',
                    '</button>'
                );
            }

            // Play Pause button
            // TODO: This should be a toggle button really?
            if (_inArray(config.controls, 'play')) {
                html.push(
                    '<button type="button" data-pleier="play">',
                        '<svg><use xlink:href="' + iconPath + '-play" /></svg>',
                        '<span class="pleier__sr-only">' + config.i18n.play + '</span>',
                    '</button>',
                    '<button type="button" data-pleier="pause">',
                        '<svg><use xlink:href="' + iconPath + '-pause" /></svg>',
                        '<span class="pleier__sr-only">' + config.i18n.pause + '</span>',
                    '</button>'
                );
            }

            // Fast forward button
            if (_inArray(config.controls, 'fast-forward')) {
                html.push(
                    '<button type="button" data-pleier="fast-forward">',
                        '<svg><use xlink:href="' + iconPath + '-fast-forward" /></svg>',
                        '<span class="pleier__sr-only">' + config.i18n.forward + '</span>',
                    '</button>'
                );
            }

            // Progress
            if (_inArray(config.controls, 'progress')) {
                // Create progress
                html.push('<span class="pleier__progress">',
                    '<label for="seek{id}" class="pleier__sr-only">Seek</label>',
                    '<input id="seek{id}" class="pleier__progress--seek" type="range" min="0" max="100" step="0.1" value="0" data-pleier="seek">',
                    '<progress class="pleier__progress--played" max="100" value="0" role="presentation"></progress>',
                    '<progress class="pleier__progress--buffer" max="100" value="0">',
                        '<span>0</span>% ' + config.i18n.buffered,
                    '</progress>');

                // Seek tooltip
                if (config.tooltips.seek) {
                    html.push('<span class="pleier__tooltip">00:00</span>');
                }

                // Close
                html.push('</span>');
            }

            // Media current time display
            if (_inArray(config.controls, 'current-time')) {
                html.push(
                    '<span class="pleier__time">',
                        '<span class="pleier__sr-only">' + config.i18n.currentTime + '</span>',
                        '<span class="pleier__time--current">00:00</span>',
                    '</span>'
                );
            }

            // Media duration display
            if (_inArray(config.controls, 'duration')) {
                html.push(
                    '<span class="pleier__time">',
                        '<span class="pleier__sr-only">' + config.i18n.duration + '</span>',
                        '<span class="pleier__time--duration">00:00</span>',
                    '</span>'
                );
            }

            // Toggle mute button
            if (_inArray(config.controls, 'mute')) {
                html.push(
                    '<button type="button" data-pleier="mute">',
                        '<svg class="icon--muted"><use xlink:href="' + iconPath + '-muted" /></svg>',
                        '<svg><use xlink:href="' + iconPath + '-volume" /></svg>',
                        '<span class="pleier__sr-only">' + config.i18n.toggleMute + '</span>',
                    '</button>'
                );
            }

            // Volume range control
            // if (_inArray(config.controls, 'volume')) {
            //     html.push(
            //         '<span class="pleier__volume">',
            //             '<label for="volume{id}" class="pleier__sr-only">' + config.i18n.volume + '</label>',
            //             '<input id="volume{id}" class="pleier__volume--input" type="range" min="' + config.volumeMin + '" max="' + config.volumeMax + '" value="' + config.volume + '" data-pleier="volume">',
            //             '<progress class="pleier__volume--display" max="' + config.volumeMax + '" value="' + config.volumeMin + '" role="presentation"></progress>',
            //         '</span>'
            //     );
            // }

            // Toggle captions button
            if (_inArray(config.controls, 'captions')) {
                html.push(
                    '<button type="button" data-pleier="captions">',
                        '<svg class="icon--captions-on"><use xlink:href="' + iconPath + '-captions-on" /></svg>',
                        '<svg><use xlink:href="' + iconPath+ '-captions-off" /></svg>',
                        '<span class="pleier__sr-only">' + config.i18n.toggleCaptions + '</span>',
                    '</button>'
                );
            }

            // Toggle fullscreen button
            if (_inArray(config.controls, 'fullscreen')) {
                html.push(
                    '<button type="button" data-pleier="fullscreen">',
                        '<svg class="icon--exit-fullscreen"><use xlink:href="' + iconPath + '-exit-fullscreen" /></svg>',
                        '<svg><use xlink:href="' + iconPath + '-enter-fullscreen" /></svg>',
                        '<span class="pleier__sr-only">' + config.i18n.toggleFullscreen + '</span>',
                    '</button>'
                );
            }

            // Close everything
            html.push('</div>');

            return html.join('');
        }

        // Setup fullscreen
        function _setupFullscreen() {
            if (!pleier.supported.full) {
                return;
            }

            if ((pleier.type != 'audio' || config.fullscreen.allowAudio) && config.fullscreen.enabled) {
                // Check for native support
                var nativeSupport = fullscreen.supportsFullScreen;

                if (nativeSupport || (config.fullscreen.fallback && !_inFrame())) {
                    _log((nativeSupport ? 'Native' : 'Fallback') + ' fullscreen enabled');

                    // Add styling hook
                    _toggleClass(pleier.container, config.classes.fullscreen.enabled, true);
                }
                else {
                    _log('Fullscreen not supported and fallback disabled');
                }

                // Toggle state
                if (pleier.buttons && pleier.buttons.fullscreen) {
                    _toggleState(pleier.buttons.fullscreen, false);
                }

                // Setup focus trap
                _focusTrap();
            }
        }

        // Setup captions
        function _setupCaptions() {
            // Bail if not HTML5 video
            if (pleier.type !== 'video') {
                return;
            }

            // Inject the container
            if (!_getElement(config.selectors.captions)) {
                pleier.videoContainer.insertAdjacentHTML('afterbegin', '<div class="' + _getClassname(config.selectors.captions) + '"></div>');
            }

            // Determine if HTML5 textTracks is supported
            pleier.usingTextTracks = false;
            if (pleier.media.textTracks) {
                pleier.usingTextTracks = true;
            }

            // Get URL of caption file if exists
            var captionSrc = '',
                kind,
                children = pleier.media.childNodes;

            for (var i = 0; i < children.length; i++) {
                if (children[i].nodeName.toLowerCase() === 'track') {
                    kind = children[i].kind;
                    if (kind === 'captions' || kind === 'subtitles') {
                        captionSrc = children[i].getAttribute('src');
                    }
                }
            }

            // Record if caption file exists or not
            pleier.captionExists = true;
            if (captionSrc === '') {
                pleier.captionExists = false;
                _log('No caption track found');
            }
            else {
                _log('Caption track found; URI: ' + captionSrc);
            }

            // If no caption file exists, hide container for caption text
            if (!pleier.captionExists) {
                _toggleClass(pleier.container, config.classes.captions.enabled);
            }
            // If caption file exists, process captions
            else {
                // Turn off native caption rendering to avoid double captions
                // This doesn't seem to work in Safari 7+, so the <track> elements are removed from the dom below
                var tracks = pleier.media.textTracks;
                for (var x = 0; x < tracks.length; x++) {
                    tracks[x].mode = 'hidden';
                }

                // Enable UI
                _showCaptions(pleier);

                // Disable unsupported browsers than report false positive
                // Firefox bug: https://bugzilla.mozilla.org/show_bug.cgi?id=1033144
                if ((pleier.browser.isIE && pleier.browser.version >= 10) ||
                    (pleier.browser.isFirefox && pleier.browser.version >= 31)) {

                    // Debugging
                    _log('Detected browser with known TextTrack issues - using manual fallback');

                    // Set to false so skips to 'manual' captioning
                    pleier.usingTextTracks = false;
                }

                // Rendering caption tracks
                // Native support required - http://caniuse.com/webvtt
                if (pleier.usingTextTracks) {
                    _log('TextTracks supported');

                    for (var y = 0; y < tracks.length; y++) {
                        var track = tracks[y];

                        if (track.kind === 'captions' || track.kind === 'subtitles') {
                            _on(track, 'cuechange', function() {
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
                    pleier.currentCaption = '';
                    pleier.captions = [];

                    if (captionSrc !== '') {
                        // Create XMLHttpRequest Object
                        var xhr = new XMLHttpRequest();

                        xhr.onreadystatechange = function() {
                            if (xhr.readyState === 4) {
                                if (xhr.status === 200) {
                                    var captions = [],
                                        caption,
                                        req = xhr.responseText;

                                    captions = req.split('\n\n');

                                    for (var r = 0; r < captions.length; r++) {
                                        caption = captions[r];
                                        pleier.captions[r] = [];

                                        // Get the parts of the captions
                                        var parts = caption.split('\n'),
                                            index = 0;

                                        // Incase caption numbers are added
                                        if (parts[index].indexOf(":") === -1) {
                                            index = 1;
                                        }

                                        pleier.captions[r] = [parts[index], parts[index + 1]];
                                    }

                                    // Remove first element ('VTT')
                                    pleier.captions.shift();

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
                for(var i = 0; i < tcpair.length; i++) {
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
                    seconds = Math.floor(tc2[0]*60*60) + Math.floor(tc2[1]*60) + Math.floor(tc2[2]);
                    return seconds;
                }
            }

            // If it's not video, or we're using textTracks, bail.
            if (pleier.usingTextTracks || pleier.type !== 'video' || !pleier.supported.full) {
                return;
            }

            // Reset subcount
            pleier.subcount = 0;

            // Check time is a number, if not use currentTime
            // IE has a bug where currentTime doesn't go to 0
            // https://twitter.com/Sam_Potts/status/573715746506731521
            time = _is.number(time) ? time : pleier.media.currentTime;

            // If there's no subs available, bail
            if (!pleier.captions[pleier.subcount]) {
                return;
            }

            while (_timecodeMax(pleier.captions[pleier.subcount][0]) < time.toFixed(1)) {
                pleier.subcount++;
                if (pleier.subcount > pleier.captions.length-1) {
                    pleier.subcount = pleier.captions.length-1;
                    break;
                }
            }

            // Check if the next caption is in the current time range
            if (pleier.media.currentTime.toFixed(1) >= _timecodeMin(pleier.captions[pleier.subcount][0]) &&
                pleier.media.currentTime.toFixed(1) <= _timecodeMax(pleier.captions[pleier.subcount][0])) {
                    pleier.currentCaption = pleier.captions[pleier.subcount][1];

                // Render the caption
                _setCaption(pleier.currentCaption);
            }
            else {
                _setCaption();
            }
        }

        // Display captions container and button (for initialization)
        function _showCaptions() {
            // If there's no caption toggle, bail
            if (!pleier.buttons.captions) {
                return;
            }

            _toggleClass(pleier.container, config.classes.captions.enabled, true);

            if (config.captions.defaultActive) {
                _toggleClass(pleier.container, config.classes.captions.active, true);
                _toggleState(pleier.buttons.captions, true);
            }
        }

        // Find all elements
        function _getElements(selector) {
            return pleier.container.querySelectorAll(selector);
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
            var tabbables   = _getElements('input:not([disabled]), button:not([disabled])'),
                first       = tabbables[0],
                last        = tabbables[tabbables.length - 1];

            function _checkFocus(event) {
                // If it is TAB
                if (event.which === 9 && pleier.isFullscreen) {
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
            _on(pleier.container, 'keydown', _checkFocus);
        }

        // Add elements to HTML5 media (source, tracks, etc)
        function _insertChildElements(type, attributes) {
            if (_is.string(attributes)) {
               _insertElement(type, pleier.media, { src: attributes });
            }
            else if (attributes.constructor === Array) {
                for (var i = attributes.length - 1; i >= 0; i--) {
                    _insertElement(type, pleier.media, attributes[i]);
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
                    _log('AJAX loading absolute SVG sprite' + (pleier.browser.isIE ? ' (due to IE)' : ''));
                    loadSprite(iconUrl.url, "sprite-pleier");
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
                container = pleier.container
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
                pleier.controls                 = _getElement(config.selectors.controls.wrapper);

                // Buttons
                pleier.buttons = {};
                pleier.buttons.seek             = _getElement(config.selectors.buttons.seek);
                pleier.buttons.play             = _getElements(config.selectors.buttons.play);
                pleier.buttons.pause            = _getElement(config.selectors.buttons.pause);
                pleier.buttons.restart          = _getElement(config.selectors.buttons.restart);
                pleier.buttons.rewind           = _getElement(config.selectors.buttons.rewind);
                pleier.buttons.forward          = _getElement(config.selectors.buttons.forward);
                pleier.buttons.fullscreen       = _getElement(config.selectors.buttons.fullscreen);

                // Inputs
                pleier.buttons.mute             = _getElement(config.selectors.buttons.mute);
                pleier.buttons.captions         = _getElement(config.selectors.buttons.captions);

                // Progress
                pleier.progress = {};
                pleier.progress.container       = _getElement(config.selectors.progress.container);

                // Progress - Buffering
                pleier.progress.buffer          = {};
                pleier.progress.buffer.bar      = _getElement(config.selectors.progress.buffer);
                pleier.progress.buffer.text     = pleier.progress.buffer.bar && pleier.progress.buffer.bar.getElementsByTagName('span')[0];

                // Progress - Played
                pleier.progress.played          = _getElement(config.selectors.progress.played);

                // Seek tooltip
                pleier.progress.tooltip         = pleier.progress.container && pleier.progress.container.querySelector('.' + config.classes.tooltip);

                // Volume
                pleier.volume                   = {};
                pleier.volume.input             = _getElement(config.selectors.volume.input);
                pleier.volume.display           = _getElement(config.selectors.volume.display);

                // Timing
                pleier.duration                 = _getElement(config.selectors.duration);
                pleier.currentTime              = _getElement(config.selectors.currentTime);
                pleier.seekTime                 = _getElements(config.selectors.seekTime);

                return true;
            }
            catch(e) {
                _warn('It looks like there is a problem with your controls HTML');

                // Restore native video controls
                _toggleNativeControls(true);

                return false;
            }
        }

        // Toggle style hook
        function _toggleStyleHook() {
            _toggleClass(pleier.container, config.selectors.container.replace('.', ''), pleier.supported.full);
        }

        // Toggle native controls
        function _toggleNativeControls(toggle) {
            if (toggle && _inArray(config.types.html5, pleier.type)) {
                pleier.media.setAttribute('controls', '');
            }
            else {
                pleier.media.removeAttribute('controls');
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
            if (pleier.supported.full && pleier.buttons.play) {
                for (var i = pleier.buttons.play.length - 1; i >= 0; i--) {
                    pleier.buttons.play[i].setAttribute('aria-label', label);
                }
            }

            // Set iframe title
            // https://github.com/Selz/pleier/issues/124
            if (_is.htmlElement(iframe)) {
                iframe.setAttribute('title', config.i18n.frameTitle.replace('{title}', config.title));
            }
        }

        // Setup media
        function _setupMedia() {
            // If there's no media, bail
            if (!pleier.media) {
                _warn('No media element found!');
                return;
            }

            if (pleier.supported.full) {
                // Add type class
                _toggleClass(pleier.container, config.classes.type.replace('{0}', pleier.type), true);

                // Add video class for embeds
                // This will require changes if audio embeds are added
                if (_inArray(config.types.embed, pleier.type)) {
                    _toggleClass(pleier.container, config.classes.type.replace('{0}', 'video'), true);
                }

                // If there's no autoplay attribute, assume the video is stopped and add state class
                _toggleClass(pleier.container, config.classes.stopped, config.autoplay);

                // Add iOS class
                _toggleClass(pleier.container, config.classes.isIos, pleier.browser.isIos);

                // Add touch class
                _toggleClass(pleier.container, config.classes.isTouch, pleier.browser.isTouch);

                // Inject the player wrapper
                if (pleier.type === 'video') {
                    // Create the wrapper div
                    var wrapper = document.createElement('div');
                    wrapper.setAttribute('class', config.classes.videoWrapper);

                    // Wrap the video in a container
                    _wrap(pleier.media, wrapper);

                    // Cache the container
                    pleier.videoContainer = wrapper;
                }
            }

            // Embeds
            if (_inArray(config.types.embed, pleier.type)) {
                _setupEmbed();

                // Clean up
                pleier.embedId = null;
            }
        }

        // Setup YouTube/Vimeo
        function _setupEmbed() {
            var container = document.createElement('div'),
                mediaId = pleier.embedId,
                id = pleier.type + '-' + Math.floor(Math.random() * (10000));

            // Remove old containers
            var containers = _getElements('[id^="' + pleier.type + '-"]');
            for (var i = containers.length - 1; i >= 0; i--) {
                _remove(containers[i]);
            }

            // Add embed class for responsive
            _toggleClass(pleier.media, config.classes.videoWrapper, true);
            _toggleClass(pleier.media, config.classes.embedWrapper, true);

            // YouTube
            if (pleier.type === 'youtube') {
                // Create the YouTube container
                pleier.media.appendChild(container);

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
                    window.onYouTubeReadyCallbacks.push(function() { _youTubeReady(mediaId, container); });

                    // Set callback to process queue
                    window.onYouTubeIframeAPIReady = function () {
                        window.onYouTubeReadyCallbacks.forEach(function(callback) { callback(); });
                    };
                }
            }
            // Vimeo
            else if (pleier.type === 'vimeo') {
                // Vimeo needs an extra div to hide controls on desktop (which has full support)
                if (pleier.supported.full) {
                    pleier.media.appendChild(container);
                }
                else {
                    container = pleier.media;
                }

                // Set ID
                container.setAttribute('id', id);

                // Load the API if not already
                if (!_is.object(window.Vimeo)) {
                    _injectScript(config.urls.vimeo.api);

                    // Wait for fragaloop load
                    var vimeoTimer = window.setInterval(function() {
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
            else if (pleier.type === 'soundcloud') {
                // Inject the iframe
                var soundCloud = document.createElement('iframe');

                // Watch for iframe load
                soundCloud.loaded = false;
                _on(soundCloud, 'load', function() { soundCloud.loaded = true; });

                _setAttributes(soundCloud, {
                    'src':  'https://w.soundcloud.com/player/?url=https://api.soundcloud.com/tracks/' + mediaId,
                    'id':   id
                });

                container.appendChild(soundCloud);
                pleier.media.appendChild(container);

                // Load the API if not already
                if (!window.SC) {
                    _injectScript(config.urls.soundcloud.api);
                }

                // Wait for SC load
                var soundCloudTimer = window.setInterval(function() {
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
            pleier.container.pleier.embed = pleier.embed;

            // Setup the UI if full support
            if (pleier.supported.full) {
                _setupInterface();
            }

            // Set title
            _setTitle(_getElement('iframe'));
        }

        // Handle YouTube API ready
        function _youTubeReady(videoId, container) {
            // Setup timers object
            // We have to poll YouTube for updates
            if (!('timer' in pleier)) {
                pleier.timer = {};
            }

            // Setup instance
            // https://developers.google.com/youtube/iframe_api_reference
            pleier.embed = new window.YT.Player(container.id, {
                videoId: videoId,
                playerVars: {
                    autoplay:       (config.autoplay ? 1 : 0),
                    controls:       (pleier.supported.full ? 0 : 1),
                    rel:            0,
                    showinfo:       0,
                    iv_load_policy: 3,
                    cc_load_policy: (config.captions.defaultActive ? 1 : 0),
                    cc_lang_pref:   'en',
                    wmode:          'transparent',
                    modestbranding: 1,
                    disablekb:      1,
                    origin:         '*' // https://code.google.com/p/gdata-issues/issues/detail?id=5788#c45
                },
                events: {
                    'onError': function(event) {
                        _triggerEvent(pleier.container, 'error', true, {
                            code:   event.data,
                            embed:  event.target
                        });
                    },
                    'onReady': function(event) {
                        // Get the instance
                        var instance = event.target;

                        // Create a faux HTML5 API using the YouTube API
                        pleier.media.play = function() {
                            instance.playVideo();
                            pleier.media.paused = false;
                        };
                        pleier.media.pause = function() {
                            instance.pauseVideo();
                            pleier.media.paused = true;
                        };
                        pleier.media.stop = function() {
                            instance.stopVideo();
                            pleier.media.paused = true;
                        };
                        pleier.media.duration = instance.getDuration();
                        pleier.media.paused = true;
                        pleier.media.currentTime = instance.getCurrentTime();
                        pleier.media.muted = instance.isMuted();

                        // Set title
                        config.title = instance.getVideoData().title;

                        // Trigger timeupdate
                        _triggerEvent(pleier.media, 'timeupdate');

                        // Reset timer
                        window.clearInterval(pleier.timer.buffering);

                        // Setup buffering
                        pleier.timer.buffering = window.setInterval(function() {
                            // Get loaded % from YouTube
                            pleier.media.buffered = instance.getVideoLoadedFraction();

                            // Trigger progress
                            _triggerEvent(pleier.media, 'progress');

                            // Bail if we're at 100%
                            if (pleier.media.buffered === 1) {
                                window.clearInterval(pleier.timer.buffering);

                                // Trigger event
                                _triggerEvent(pleier.media, 'canplaythrough');
                            }
                        }, 200);

                        // Update UI
                        _embedReady();

                        // Display duration if available
                        _displayDuration();
                    },
                    'onStateChange': function(event) {
                        // Get the instance
                        var instance = event.target;

                        // Reset timer
                        window.clearInterval(pleier.timer.playing);

                        // Handle events
                        // -1   Unstarted
                        // 0    Ended
                        // 1    Playing
                        // 2    Paused
                        // 3    Buffering
                        // 5    Video cued
                        switch (event.data) {
                            case 0:
                                pleier.media.paused = true;
                                _triggerEvent(pleier.media, 'ended');
                                break;

                            case 1:
                                pleier.media.paused = false;
                                pleier.media.seeking = false;
                                _triggerEvent(pleier.media, 'play');
                                _triggerEvent(pleier.media, 'playing');

                                // Poll to get playback progress
                                pleier.timer.playing = window.setInterval(function() {
                                    // Set the current time
                                    pleier.media.currentTime = instance.getCurrentTime();

                                    // Trigger timeupdate
                                    _triggerEvent(pleier.media, 'timeupdate');
                                }, 100);

                                break;

                            case 2:
                                pleier.media.paused = true;
                                _triggerEvent(pleier.media, 'pause');
                                break;
                        }

                        _triggerEvent(pleier.container, 'statechange', false, {
                            code: event.data
                        });
                    }
                }
            });
        }

        // Vimeo ready
        function _vimeoReady(mediaId, container) {
            // Setup player
            pleier.embed = new window.Vimeo.Player(container.id, {
                id:         mediaId,
                loop:       config.loop,
                autoplay:   config.autoplay,
                byline:     false,
                portrait:   false,
                title:      false
            });

            // Create a faux HTML5 API using the Vimeo API
            pleier.media.play = function() {
                pleier.embed.play();
                pleier.media.paused = false;
            };
            pleier.media.pause = function() {
                pleier.embed.pause();
                pleier.media.paused = true;
            };
            pleier.media.stop = function() {
                pleier.embed.stop();
                pleier.media.paused = true;
            };
            pleier.media.paused = true;
            pleier.media.currentTime = 0;

            // Update UI
            _embedReady();

            pleier.embed.getCurrentTime().then(function (value) {
                pleier.media.currentTime = value;

                // Trigger timeupdate
                _triggerEvent(pleier.media, 'timeupdate');
            });

            pleier.embed.getDuration().then(function(value) {
                pleier.media.duration = value;

                // Display duration if available
                _displayDuration();
            });

            // TODO: Captions
            /*if (config.captions.defaultActive) {
                pleier.embed.enableTextTrack('en');
            }*/

            // Fix keyboard focus issues
            // https://github.com/Selz/pleier/issues/317
            pleier.embed.on('loaded', function() {
                if(_is.htmlElement(pleier.embed.element)) {
                    pleier.embed.element.setAttribute('tabindex', '-1');
                }
            });

            pleier.embed.on('play', function() {
                pleier.media.paused = false;
                _triggerEvent(pleier.media, 'play');
                _triggerEvent(pleier.media, 'playing');
            });

            pleier.embed.on('pause', function() {
                pleier.media.paused = true;
                _triggerEvent(pleier.media, 'pause');
            });

            pleier.embed.on('timeupdate', function(data) {
                pleier.media.seeking = false;
                pleier.media.currentTime = data.seconds;
                _triggerEvent(pleier.media, 'timeupdate');
            });

            pleier.embed.on('progress', function(data) {
                pleier.media.buffered = data.percent;
                _triggerEvent(pleier.media, 'progress');

                if (parseInt(data.percent) === 1) {
                    // Trigger event
                    _triggerEvent(pleier.media, 'canplaythrough');
                }
            });

            pleier.embed.on('ended', function() {
                pleier.media.paused = true;
                _triggerEvent(pleier.media, 'ended');
            });
        }

        // Soundcloud ready
        function _soundcloudReady() {
            /* jshint validthis: true */
            pleier.embed = window.SC.Widget(this);

            // Setup on ready
            pleier.embed.bind(window.SC.Widget.Events.READY, function() {
                // Create a faux HTML5 API using the Soundcloud API
                pleier.media.play = function() {
                    pleier.embed.play();
                    pleier.media.paused = false;
                };
                pleier.media.pause = function() {
                    pleier.embed.pause();
                    pleier.media.paused = true;
                };
                pleier.media.stop = function() {
                    pleier.embed.seekTo(0);
                    pleier.embed.pause();
                    pleier.media.paused = true;
                };
                pleier.media.paused = true;
                pleier.media.currentTime = 0;

                // Update UI
                _embedReady();

                pleier.embed.getPosition(function(value) {
                    pleier.media.currentTime = value;

                    // Trigger timeupdate
                    _triggerEvent(pleier.media, 'timeupdate');
                });

                pleier.embed.getDuration(function(value) {
                    pleier.media.duration = value/1000;
                    // Display duration if available
                    _displayDuration();
                });

                pleier.embed.bind(window.SC.Widget.Events.PLAY, function() {
                    pleier.media.paused = false;
                    _triggerEvent(pleier.media, 'play');
                    _triggerEvent(pleier.media, 'playing');
                });

                pleier.embed.bind(window.SC.Widget.Events.PAUSE, function() {
                    pleier.media.paused = true;
                    _triggerEvent(pleier.media, 'pause');
                });

                pleier.embed.bind(window.SC.Widget.Events.PLAY_PROGRESS, function(data) {
                    pleier.media.seeking = false;
                    pleier.media.currentTime = data.currentPosition/1000;
                    _triggerEvent(pleier.media, 'timeupdate');
                });

                pleier.embed.bind(window.SC.Widget.Events.LOAD_PROGRESS, function(data) {
                    pleier.media.buffered = data.loadProgress;
                    _triggerEvent(pleier.media, 'progress');

                    if (parseInt(data.loadProgress) === 1) {
                        // Trigger event
                        _triggerEvent(pleier.media, 'canplaythrough');
                    }
                });

                pleier.embed.bind(window.SC.Widget.Events.FINISH, function() {
                    pleier.media.paused = true;
                    _triggerEvent(pleier.media, 'ended');
                });

                // Autoplay
                if (config.autoplay) {
                    pleier.embed.play();
                }
            });
        }

        // Play media
        function _play() {
            if ('play' in pleier.media) {
                pleier.media.play();
            }
        }

        // Pause media
        function _pause() {
            if ('pause' in pleier.media) {
                pleier.media.pause();
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
                pleier.media[pleier.media.paused ? 'play' : 'pause']();
            }
        }

        // Rewind
        function _rewind(seekTime) {
            // Use default if needed
            if (!_is.number(seekTime)) {
                seekTime = config.seekTime;
            }
            _seek(pleier.media.currentTime - seekTime);
        }

        // Fast forward
        function _forward(seekTime) {
            // Use default if needed
            if (!_is.number(seekTime)) {
                seekTime = config.seekTime;
            }
            _seek(pleier.media.currentTime + seekTime);
        }

        // Seek to time
        // The input parameter can be an event or a number
        function _seek(input) {
            var targetTime  = 0,
                paused      = pleier.media.paused,
                duration    = _getDuration();

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
                pleier.media.currentTime = targetTime.toFixed(4);
            }
            catch(e) {}

            // Embeds
            if (_inArray(config.types.embed, pleier.type)) {
                // YouTube
                switch(pleier.type) {
                    case 'youtube':
                        pleier.embed.seekTo(targetTime);
                        break;

                    case 'vimeo':
                        // Round to nearest second for vimeo
                        pleier.embed.setCurrentTime(targetTime.toFixed(0));
                        break;

                    case 'soundcloud':
                        pleier.embed.seekTo(targetTime * 1000);
                        break;
                }

                if (paused) {
                    _pause();
                }

                // Trigger timeupdate for embeds
                _triggerEvent(pleier.media, 'timeupdate');

                // Set seeking flag
                pleier.media.seeking = true;
            }

            // Logging
            _log('Seeking to ' + pleier.media.currentTime + ' seconds');

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
            if(pleier.media.duration !== null && !isNaN(pleier.media.duration)) {
                mediaDuration = pleier.media.duration;
            }

            // If custom duration is funky, use regular duration
            return (isNaN(duration) ? mediaDuration : duration);
        }

        // Check playing state
        function _checkPlaying() {
            _toggleClass(pleier.container, config.classes.playing, !pleier.media.paused);
            _toggleClass(pleier.container, config.classes.stopped, pleier.media.paused);

            _toggleControls(pleier.media.paused);
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
                pleier.isFullscreen = fullscreen.isFullScreen(pleier.container);
            }
            // If there's native support, use it
            else if (nativeSupport) {
                // Request fullscreen
                if (!fullscreen.isFullScreen(pleier.container)) {
                    // Save scroll position
                    _saveScrollPosition();

                    // Request full screen
                    fullscreen.requestFullScreen(pleier.container);
                }
                // Bail from fullscreen
                else {
                    fullscreen.cancelFullScreen();
                }

                // Check if we're actually full screen (it could fail)
                pleier.isFullscreen = fullscreen.isFullScreen(pleier.container);
            }
            else {
                // Otherwise, it's a simple toggle
                pleier.isFullscreen = !pleier.isFullscreen;

                // Bind/unbind escape key
                if (pleier.isFullscreen) {
                    _on(document, 'keyup', _handleEscapeFullscreen);
                    document.body.style.overflow = 'hidden';
                }
                else {
                    _off(document, 'keyup', _handleEscapeFullscreen);
                    document.body.style.overflow = '';
                }
            }

            // Set class hook
            _toggleClass(pleier.container, config.classes.fullscreen.active, pleier.isFullscreen);

            // Trap focus
            if (pleier.isFullscreen) {
                pleier.container.setAttribute('tabindex', '-1');
            }
            else {
                pleier.container.removeAttribute('tabindex');
            }

            // Trap focus
            _focusTrap(pleier.isFullscreen);

            // Set button state
            if (pleier.buttons && pleier.buttons.fullscreen) {
                _toggleState(pleier.buttons.fullscreen, pleier.isFullscreen);
            }

            // Trigger an event
            _triggerEvent(pleier.container, pleier.isFullscreen ? 'enterfullscreen' : 'exitfullscreen', true);

            // Restore scroll position
            if (!pleier.isFullscreen && nativeSupport) {
                _restoreScrollPosition();
            }
        }

        // Bail from faux-fullscreen
        function _handleEscapeFullscreen(event) {
            // If it's a keypress and not escape, bail
            if ((event.which || event.charCode || event.keyCode) === 27 && pleier.isFullscreen) {
                _toggleFullscreen();
            }
        }

        // Mute
        function _toggleMute(muted) {
            // If the method is called without parameter, toggle based on current value
            if (!_is.boolean(muted)) {
                muted = !pleier.media.muted;
            }

            // Set button state
            _toggleState(pleier.buttons.mute, muted);

            // Set mute on the player
            pleier.media.muted = muted;

            // If volume is 0 after unmuting, set to default
            if (pleier.media.volume === 0) {
                _setVolume(config.volume);
            }

            // Embeds
            if (_inArray(config.types.embed, pleier.type)) {
                // YouTube
                switch(pleier.type) {
                    case 'youtube':
                        pleier.embed[pleier.media.muted ? 'mute' : 'unMute']();
                        break;

                    case 'vimeo':
                    case 'soundcloud':
                        pleier.embed.setVolume(pleier.media.muted ? 0 : parseFloat(config.volume / config.volumeMax));
                        break;
                }

                // Trigger volumechange for embeds
                _triggerEvent(pleier.media, 'volumechange');
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
                    // https://github.com/Selz/pleier/issues/171
                    window.localStorage.removeItem('pleier-volume');
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
            pleier.media.volume = parseFloat(volume / max);

            // Set the display
            if (pleier.volume.display) {
                pleier.volume.display.value = volume;
            }

            // Embeds
            if (_inArray(config.types.embed, pleier.type)) {
                switch(pleier.type) {
                    case 'youtube':
                        pleier.embed.setVolume(pleier.media.volume * 100);
                        break;

                    case 'vimeo':
                    case 'soundcloud':
                        pleier.embed.setVolume(pleier.media.volume);
                        break;
                }

                // Trigger volumechange for embeds
                _triggerEvent(pleier.media, 'volumechange');
            }

            // Toggle muted state
            if (pleier.media.muted && volume > 0) {
                _toggleMute();
            }
        }

        // Increase volume
        function _increaseVolume() {
            var volume = pleier.media.muted ? 0 : (pleier.media.volume * config.volumeMax);

            _setVolume(volume + (config.volumeStep / 5));
        }

        // Decrease volume
        function _decreaseVolume() {
            var volume = pleier.media.muted ? 0 : (pleier.media.volume * config.volumeMax);

            _setVolume(volume - (config.volumeStep / 5));
        }

        // Update volume UI and storage
        function _updateVolume() {
            // Get the current volume
            var volume = pleier.media.muted ? 0 : (pleier.media.volume * config.volumeMax);

            // Update the <input type="range"> if present
            if (pleier.supported.full) {
                if (pleier.volume.input) {
                    pleier.volume.input.value = volume;
                }
                if (pleier.volume.display) {
                    pleier.volume.display.value = volume;
                }
            }

            // Store the volume in storage
            if (config.storage.enabled && _storage().supported && !isNaN(volume)) {
                window.localStorage.setItem(config.storage.key, volume);
            }

            // Toggle class if muted
            _toggleClass(pleier.container, config.classes.muted, (volume === 0));

            // Update checkbox for mute state
            if (pleier.supported.full && pleier.buttons.mute) {
                _toggleState(pleier.buttons.mute, (volume === 0));
            }
        }

        // Toggle captions
        function _toggleCaptions(show) {
            // If there's no full support, or there's no caption toggle
            if (!pleier.supported.full || !pleier.buttons.captions) {
                return;
            }

            // If the method is called without parameter, toggle based on current value
            if (!_is.boolean(show)) {
                show = (pleier.container.className.indexOf(config.classes.captions.active) === -1);
            }

            // Set global
            pleier.captionsEnabled = show;

            // Toggle state
            _toggleState(pleier.buttons.captions, pleier.captionsEnabled);

            // Add class hook
            _toggleClass(pleier.container, config.classes.captions.active, pleier.captionsEnabled);

            // Trigger an event
            _triggerEvent(pleier.container, pleier.captionsEnabled ? 'captionsenabled' : 'captionsdisabled', true);
        }

        // Check if media is loading
        function _checkLoading(event) {
            var loading = (event.type === 'waiting');

            // Clear timer
            clearTimeout(pleier.timers.loading);

            // Timer to prevent flicker when seeking
            pleier.timers.loading = setTimeout(function() {
                _toggleClass(pleier.container, config.classes.loading, loading);
            }, (loading ? 250 : 0));
        }

        // Update <progress> elements
        function _updateProgress(event) {
            if (!pleier.supported.full) {
                return;
            }

            var progress    = pleier.progress.played,
                value       = 0,
                duration    = _getDuration();

            if (event) {
                switch (event.type) {
                    // Video playing
                    case 'timeupdate':
                    case 'seeking':
                        if (pleier.controls.pressed) {
                            return;
                        }

                        value = _getPercentage(pleier.media.currentTime, duration);

                        // Set seek range value only if it's a 'natural' time event
                        if (event.type == 'timeupdate' && pleier.buttons.seek) {
                            pleier.buttons.seek.value = value;
                        }

                        break;

                    // Check buffer status
                    case 'playing':
                    case 'progress':
                        progress    = pleier.progress.buffer;
                        value       = (function() {
                            var buffered = pleier.media.buffered;

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
            if (!pleier.supported.full) {
                return;
            }
            
            // Default to 0
            if (_is.undefined(value)) {
                value = 0;
            }
            // Default to buffer or bail
            if (_is.undefined(progress)) {
                if (pleier.progress && pleier.progress.buffer) {
                    progress = pleier.progress.buffer;
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

            pleier.secs = parseInt(time % 60);
            pleier.mins = parseInt((time / 60) % 60);
            pleier.hours = parseInt(((time / 60) / 60) % 60);

            // Do we need to display hours?
            var displayHours = (parseInt(((_getDuration() / 60) / 60) % 60) > 0);

            // Ensure it's two digits. For example, 03 rather than 3.
            pleier.secs = ('0' + pleier.secs).slice(-2);
            pleier.mins = ('0' + pleier.mins).slice(-2);

            // Render
            element.innerHTML = (displayHours ? pleier.hours + ':' : '') + pleier.mins + ':' + pleier.secs;
        }

        // Show the duration on metadataloaded
        function _displayDuration() {
            if (!pleier.supported.full) {
                return;
            }

            // Determine duration
            var duration = _getDuration() || 0;

            // If there's only one time display, display duration there
            if (!pleier.duration && config.displayDuration && pleier.media.paused) {
                _updateTimeDisplay(duration, pleier.currentTime);
            }

            // If there's a duration element, update content
            if (pleier.duration) {
                _updateTimeDisplay(duration, pleier.duration);
            }

            // Update the tooltip (if visible)
            _updateSeekTooltip();
        }

        // Handle time change event
        function _timeUpdate(event) {
            // Duration
            _updateTimeDisplay(pleier.media.currentTime, pleier.currentTime);

            // Ignore updates while seeking
            if (event && event.type == 'timeupdate' && pleier.media.seeking) {
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

            var duration    = _getDuration(),
                value       = _getPercentage(time, duration);

            // Update progress 
            if (pleier.progress && pleier.progress.played) {
                pleier.progress.played.value = value;
            }

            // Update seek range input
            if (pleier.buttons && pleier.buttons.seek) {
                pleier.buttons.seek.value = value;
            }
        }

        // Update hover tooltip for seeking
        function _updateSeekTooltip(event) {
            var duration = _getDuration();

            // Bail if setting not true
            if (!config.tooltips.seek || !pleier.progress.container || duration === 0) {
                return;
            }

            // Calculate percentage
            var clientRect  = pleier.progress.container.getBoundingClientRect(),
                percent     = 0,
                visible     = config.classes.tooltip + '--visible';

            // Determine percentage, if already visible
            if (!event) {
                if (_hasClass(pleier.progress.tooltip, visible)) {
                    percent = pleier.progress.tooltip.style.left.replace('%', '');
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
            _updateTimeDisplay(((duration / 100) * percent), pleier.progress.tooltip);

            // Set position
            pleier.progress.tooltip.style.left = percent + "%";

            // Show/hide the tooltip
            // If the event is a moues in/out and percentage is inside bounds
            if (event && _inArray(['mouseenter', 'mouseleave'], event.type)) {
                _toggleClass(pleier.progress.tooltip, visible, (event.type === 'mouseenter'));
            }
        }

        // Show the player controls in fullscreen mode
        function _toggleControls(toggle) {
            if (!config.hideControls || pleier.type === 'audio') {
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
                    show = _hasClass(pleier.container, config.classes.hideControls);
                }
            }

            // Clear timer every movement
            window.clearTimeout(pleier.timers.hover);

            // If the mouse is not over the controls, set a timeout to hide them
            if (show || pleier.media.paused) {
                _toggleClass(pleier.container, config.classes.hideControls, false);

                // Always show controls when paused or if touch
                if (pleier.media.paused) {
                    return;
                }

                // Delay for hiding on touch
                if (pleier.browser.isTouch) {
                    delay = 3000;
                }
            }

            // If toggle is false or if we're playing (regardless of toggle), 
            // then set the timer to hide the controls 
            if (!show || !pleier.media.paused) {
                pleier.timers.hover = window.setTimeout(function() {
                    // If the mouse is over the controls (and not entering fullscreen), bail
                    if ((pleier.controls.pressed || pleier.controls.hover) && !isEnterFullscreen) {
                        return;
                    }
                    
                    _toggleClass(pleier.container, config.classes.hideControls, true);
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
            switch(pleier.type) {
                case 'youtube':
                    url = pleier.embed.getVideoUrl();
                    break;

                case 'vimeo':
                    pleier.embed.getVideoUrl.then(function (value) {
                        url = value;
                    });
                    break;

                case 'soundcloud':
                    pleier.embed.getCurrentSound(function(object) {
                        url = object.permalink_url;
                    });
                    break;

                default:
                    url = pleier.media.currentSrc;
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
            if (pleier.type === 'youtube') {
                // Destroy the embed instance
                pleier.embed.destroy();

                // Clear timer
                window.clearInterval(pleier.timer.buffering);
                window.clearInterval(pleier.timer.playing);
            }
            // HTML5 Video
            else if (pleier.type === 'video' && pleier.videoContainer) {
                // Remove video wrapper
                _remove(pleier.videoContainer);
            }

            // Remove embed object
            pleier.embed = null;

            // Remove the old media
            _remove(pleier.media);

            // Set the type
            if ('type' in source) {
                pleier.type = source.type;

                // Get child type for video (it might be an embed)
                if (pleier.type === 'video') {
                    var firstSource = source.sources[0];

                    if ('type' in firstSource && _inArray(config.types.embed, firstSource.type)) {
                        pleier.type = firstSource.type;
                    }
                }
            }

            // Check for support
            pleier.supported = supported(pleier.type);

            // Create new markup
            switch(pleier.type) {
                case 'video':
                    pleier.media = document.createElement('video');
                    break;

                case 'audio':
                    pleier.media = document.createElement('audio');
                    break;

                case 'youtube':
                case 'vimeo':
                case 'soundcloud':
                    pleier.media = document.createElement('div');
                    pleier.embedId = source.sources[0].src;
                    break;
            }

            // Inject the new element
            _prependChild(pleier.container, pleier.media);

            // Autoplay the new source?
            if (_is.boolean(source.autoplay)) {
                config.autoplay = source.autoplay;
            }

            // Set attributes for audio video
            if (_inArray(config.types.html5, pleier.type)) {
                if (config.crossorigin) {
                    pleier.media.setAttribute('crossorigin', '');
                }
                if (config.autoplay) {
                    pleier.media.setAttribute('autoplay', '');
                }
                if ('poster' in source) {
                    pleier.media.setAttribute('poster', source.poster);
                }
                if (config.loop) {
                    pleier.media.setAttribute('loop', '');
                }
            }

            // Classname reset
            pleier.container.className = pleier.originalClassName;

            // Restore class hooks
            _toggleClass(pleier.container, config.classes.fullscreen.active, pleier.isFullscreen);
            _toggleClass(pleier.container, config.classes.captions.active, pleier.captionsEnabled);
            _toggleStyleHook();

            // Set new sources for html5
            if (_inArray(config.types.html5, pleier.type)) {
                _insertChildElements('source', source.sources);
            }

            // Set up from scratch
            _setupMedia();

            // HTML5 stuff
            if (_inArray(config.types.html5, pleier.type)) {
                // Setup captions
                if ('tracks' in source) {
                    _insertChildElements('track', source.tracks);
                }

                // Load HTML5 sources
                pleier.media.load();

                // Setup interface
                _setupInterface();

                // Display duration if available
                _displayDuration();
            }
            // If embed but not fully supported, setupInterface now
            else if (_inArray(config.types.embed, pleier.type) && !pleier.supported.full) {
                _setupInterface();
            }

            // Set aria title and iframe title
            config.title = source.title;
            _setTitle();

            // Reset media objects
            pleier.container.pleier.media = pleier.media;
        }

        // Update poster
        function _updatePoster(source) {
            if (pleier.type === 'video') {
                pleier.media.setAttribute('poster', source);
            }
        }

        // Listen for control events
        function _controlListeners() {
            // IE doesn't support input event, so we fallback to change
            var inputEvent = (pleier.browser.isIE ? 'change' : 'input');

            // Click play/pause helper
            function _togglePlay() {
                var play = pleier.media.paused;

                // Toggle playback
                if (play) {
                    _play();
                }
                else {
                    _pause();
                }

                // Determine which buttons
                var trigger = pleier.buttons[play ? 'play' : 'pause'],
                    target = pleier.buttons[play ? 'pause' : 'play'];

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

                    setTimeout(function() {
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
                for (var button in pleier.buttons) {
                    var element = pleier.buttons[button];

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

            _on(window, 'keyup', function(event) {
                var code = (event.keyCode ? event.keyCode : event.which);

                if (code == 9) {
                    checkFocus();
                }
            });
            _on(document.body, 'click', function() {
                _toggleClass(_getElement('.' + config.classes.tabFocus), config.classes.tabFocus, false);
            });
            for (var button in pleier.buttons) {
                var element = pleier.buttons[button];

                _on(element, 'blur', function() {
                    _toggleClass(element, 'tab-focus', false);
                });
            }

            // Play
            _proxyListener(pleier.buttons.play, 'click', config.listeners.play, _togglePlay);

            // Pause
            _proxyListener(pleier.buttons.pause, 'click', config.listeners.pause, _togglePlay);

            // Restart
            _proxyListener(pleier.buttons.restart, 'click', config.listeners.restart, _seek);

            // Rewind
            _proxyListener(pleier.buttons.rewind, 'click', config.listeners.rewind, _rewind);

            // Fast forward
            _proxyListener(pleier.buttons.forward, 'click', config.listeners.forward, _forward);

            // Seek
            _proxyListener(pleier.buttons.seek, inputEvent, config.listeners.seek, _seek);

            // Set volume
            _proxyListener(pleier.volume.input, inputEvent, config.listeners.volume, function() {
                _setVolume(pleier.volume.input.value);
            });

            // Mute
            _proxyListener(pleier.buttons.mute, 'click', config.listeners.mute, _toggleMute);

            // Fullscreen
            _proxyListener(pleier.buttons.fullscreen, 'click', config.listeners.fullscreen, _toggleFullscreen);

            // Handle user exiting fullscreen by escaping etc
            if (fullscreen.supportsFullScreen) {
                _on(document, fullscreen.fullScreenEventName, _toggleFullscreen);
            }

            // Captions
            _on(pleier.buttons.captions, 'click', _toggleCaptions);

            // Seek tooltip
            _on(pleier.progress.container, 'mouseenter mouseleave mousemove', _updateSeekTooltip);

            // Toggle controls visibility based on mouse movement
            if (config.hideControls) {
                // Toggle controls on mouse events and entering fullscreen
                _on(pleier.container, 'mouseenter mouseleave mousemove touchstart touchend touchcancel touchmove enterfullscreen', _toggleControls);

                // Watch for cursor over controls so they don't hide when trying to interact
                _on(pleier.controls, 'mouseenter mouseleave', function(event) {
                    pleier.controls.hover = event.type === 'mouseenter';
                });

                 // Watch for cursor over controls so they don't hide when trying to interact
                _on(pleier.controls, 'mousedown mouseup touchstart touchend touchcancel', function(event) {
                    pleier.controls.pressed = _inArray(['mousedown', 'touchstart'], event.type);
                });

                // Focus in/out on controls
                _on(pleier.controls, 'focus blur', _toggleControls, true);
            }

            // Adjust volume on scroll
            _on(pleier.volume.input, 'wheel', function(event) {
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
            _on(pleier.media, 'timeupdate seeking', _timeUpdate);

            // Update manual captions
            _on(pleier.media, 'timeupdate', _seekManualCaptions);

            // Display duration
            _on(pleier.media, 'durationchange loadedmetadata', _displayDuration);

            // Handle the media finishing
            _on(pleier.media, 'ended', function() {
                // Clear
                if (pleier.type === 'video') {
                    _setCaption();
                }

                // Reset UI
                _checkPlaying();

                // Seek to 0
                _seek(0);

                // Reset duration display
                _displayDuration();

                // Show poster on end
                if(pleier.type === 'video' && config.showPosterOnEnd) {
                    // Re-load media
                    pleier.media.load();
                }
            });

            // Check for buffer progress
            _on(pleier.media, 'progress playing', _updateProgress);

            // Handle native mute
            _on(pleier.media, 'volumechange', _updateVolume);

            // Handle native play/pause
            _on(pleier.media, 'play pause', _checkPlaying);

            // Loading
            _on(pleier.media, 'waiting canplay seeked', _checkLoading);

            // Click video
            if (config.clickToPlay && pleier.type !== 'audio') {
                // Re-fetch the wrapper
                var wrapper = _getElement('.' + config.classes.videoWrapper);

                // Bail if there's no wrapper (this should never happen)
                if (!wrapper) {
                    return;
                }

                // Set cursor
                wrapper.style.cursor = "pointer";

                // On click play, pause ore restart
                _on(wrapper, 'click', function() {
                    // Touch devices will just show controls (if we're hiding controls)
                    if (config.hideControls && pleier.browser.isTouch && !pleier.media.paused) {
                        return;
                    }

                    if (pleier.media.paused) {
                        _play();
                    }
                    else if (pleier.media.ended) {
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
                _on(pleier.media, 'contextmenu', function(event) { event.preventDefault(); });
            }

            // Proxy events to container
            _on(pleier.media, config.events.join(' '), function(event) {
                _triggerEvent(pleier.container, event.type, true);
            });
        }

        // Cancel current network requests
        // See https://github.com/Selz/pleier/issues/174
        function _cancelRequests() {
            if (!_inArray(config.types.html5, pleier.type)) {
                return;
            }

            // Remove child sources
            var sources = pleier.media.querySelectorAll('source');
            for (var i = 0; i < sources.length; i++) {
                _remove(sources[i]);
            }

            // Set blank video src attribute
            // This is to prevent a MEDIA_ERR_SRC_NOT_SUPPORTED error
            // Info: http://stackoverflow.com/questions/32231579/how-to-properly-dispose-of-an-html5-video-and-close-socket-or-connection
            pleier.media.setAttribute('src', 'https://cdn.selz.com/pleier/blank.mp4');

            // Load the new empty source
            // This will cancel existing requests
            // See https://github.com/Selz/pleier/issues/174
            pleier.media.load();

            // Debugging
            _log("Cancelled network requests for old media");
        }

        // Destroy an instance
        // Event listeners are removed when elements are removed
        // http://stackoverflow.com/questions/12528049/if-a-dom-element-is-removed-are-its-listeners-also-removed-from-memory
        function _destroy() {
            // Bail if the element is not initialized
            if (!pleier.init) {
                return null;
            }

            // Reset container classname
            pleier.container.setAttribute('class', _getClassname(config.selectors.container));

            // Remove init flag
            pleier.init = false;

            // Remove controls
            _remove(_getElement(config.selectors.controls.wrapper));

            // YouTube
            if (pleier.type === 'youtube') {
                pleier.embed.destroy();
                return;
            }

            // If video, we need to remove some more
            if (pleier.type === 'video') {
                // Remove captions container
                _remove(_getElement(config.selectors.captions));

                // Remove video wrapper
                _unwrap(pleier.videoContainer);
            }

            // Restore native video controls
            _toggleNativeControls(true);

            // Clone the media element to remove listeners
            // http://stackoverflow.com/questions/19469881/javascript-remove-all-event-listeners-of-specific-type
            var clone = pleier.media.cloneNode(true);
            pleier.media.parentNode.replaceChild(clone, pleier.media);
        }

        // Setup a player
        function _init() {
            // Bail if the element is initialized
            if (pleier.init) {
                return null;
            }

            // Setup the fullscreen api
            fullscreen = _fullscreen();

            // Sniff out the browser
            pleier.browser = _browserSniff();

            // Get the media element
            pleier.media = pleier.container.querySelectorAll('audio, video')[0];

            // Get the div placeholder for YouTube and Vimeo
            if (!pleier.media) {
                pleier.media = pleier.container.querySelectorAll('[data-type]')[0];
            }

            // Bail if nothing to setup
            if (!pleier.media) {
                return;
            }

            // Get original classname
            pleier.originalClassName = pleier.container.className;

            // Set media type based on tag or data attribute
            // Supported: video, audio, vimeo, youtube
            var tagName = pleier.media.tagName.toLowerCase();
            if (tagName === 'div') {
                pleier.type     = pleier.media.getAttribute('data-type');
                pleier.embedId  = pleier.media.getAttribute('data-video-id');

                // Clean up
                pleier.media.removeAttribute('data-type');
                pleier.media.removeAttribute('data-video-id');
            }
            else {
                pleier.type           = tagName;
                config.crossorigin  = (pleier.media.getAttribute('crossorigin') !== null);
                config.autoplay     = (config.autoplay || (pleier.media.getAttribute('autoplay') !== null));
                config.loop         = (config.loop || (pleier.media.getAttribute('loop') !== null));
            }

            // Check for support
            pleier.supported = supported(pleier.type);

            // Add style hook
            _toggleStyleHook();

            // If no native support, bail
            if (!pleier.supported.basic) {
                return false;
            }

            // Debug info
            _log(pleier.browser.name + ' ' + pleier.browser.version);

            // Setup media
            _setupMedia();

            // Setup interface
            if (_inArray(config.types.html5, pleier.type)) {
                // Bail if no support
                if (!pleier.supported.full) {
                    // Successful setup
                    pleier.init = true;

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
            else if (_inArray(config.types.embed, pleier.type) && !pleier.supported.full) {
                _setupInterface();
            }

            // Successful setup
            pleier.init = true;
        }

        function _setupInterface() {
            // Don't setup interface if no support
            if (!pleier.supported.full) {
                _warn('No full support for this media type (' + pleier.type + ')');

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
            _triggerEvent(pleier.container, 'ready', true);
        }

        // Initialize instance
        _init();

        // If init failed, return an empty object
        if (!pleier.init) {
            return {};
        }

        return {
            media:              pleier.media,
            play:               _play,
            pause:              _pause,
            restart:            _seek,
            rewind:             _rewind,
            forward:            _forward,
            seek:               _seek,
            source:             _source,
            poster:             _updatePoster,
            setVolume:          _setVolume,
            togglePlay:         _togglePlay,
            toggleMute:         _toggleMute,
            toggleCaptions:     _toggleCaptions,
            toggleFullscreen:   _toggleFullscreen,
            toggleControls:     _toggleControls,
            isFullscreen:       function() { return pleier.isFullscreen || false; },
            support:            function(mimeType) { return _supportMime(pleier, mimeType); },
            destroy:            _destroy,
            restore:            _init,
            getCurrentTime:     function() { return pleier.media.currentTime; }
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
        x.onload = function() {
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
        var browser     = _browserSniff(),
            isOldIE     = (browser.isIE && browser.version <= 9),
            isIos       = browser.isIos,
            isIphone    = /iPhone|iPod/i.test(navigator.userAgent),
            audio       = !!document.createElement('audio').canPlayType,
            video       = !!document.createElement('video').canPlayType,
            basic, full;

        switch (type) {
            case 'video':
                basic = video;
                full  = (basic && (!isOldIE && !isIphone));
                break;

            case 'audio':
                basic = audio;
                full  = (basic && !isOldIE);
                break;

            case 'vimeo':
            case 'youtube':
            case 'soundcloud':
                basic = true;
                full  = (!isOldIE && !isIos);
                break;

            default:
                basic = (audio && video);
                full  = (basic && !isOldIE);
        }

        return {
            basic:  basic,
            full:   full
        };
    }

    // Setup function
    function setup(targets, options) {
        // Get the players
        var elements    = [],
            containers  = [],
            selector    = [defaults.selectors.html5, defaults.selectors.embed].join(',');

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
        else if (!_is.nodeList(targets) && !_is.array(targets) && !_is.string(targets))  {
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
            if (!('pleier' in element)) {
                // Create instance-specific config
                var config = _extend({}, defaults, options, JSON.parse(original.getAttribute('data-pleier')));

                // Bail if not enabled
                if (!config.enabled) {
                    return null;
                }

                // Create new instance
                var instance = new Plyr(element, config);

                // Set pleier to false if setup failed
                element.pleier = (Object.keys(instance).length ? instance : false);

                // Callback
                _triggerEvent(original, 'setup', true, { 
                    pleier: element.pleier
                });
            }

            // Add to return array even if it's already setup
            elements.push(element);
        }

        return elements;
    }

    return {
        setup:      setup,
        supported:  supported,
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
        params = params || { bubbles: false, cancelable: false, detail: undefined };
        var evt = document.createEvent('CustomEvent');
        evt.initCustomEvent(event, params.bubbles, params.cancelable, params.detail);
        return evt;
    }

    CustomEvent.prototype = window.Event.prototype;

    window.CustomEvent = CustomEvent;
})();
