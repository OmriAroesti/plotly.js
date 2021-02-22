'use strict';

exports.version = require('../src/version').version;

// inject promise polyfill
require('native-promise-only');

// inject plot css
require('../build/plotcss');

// inject default MathJax config
require('../src/fonts/mathjax_config')();

// include registry module and expose register method
var Registry = require('../src/registry');
var register = exports.register = Registry.register;

// expose plot api methods
var plotApi = require('../src/plot_api');
var methodNames = Object.keys(plotApi);
for(var i = 0; i < methodNames.length; i++) {
    var name = methodNames[i];
    // _ -> private API methods, but still registered for internal use
    if(name.charAt(0) !== '_') exports[name] = plotApi[name];
    register({
        moduleType: 'apiMethod',
        name: name,
        fn: plotApi[name]
    });
}

// scatter is the only trace included by default
register(require('./scatter'));

// register all registrable components modules
register([
    require('../src/components/legend'),
    require('../src/components/fx'), // fx needs to come after legend
    require('../src/components/annotations'),
    require('../src/components/annotations3d'),
    require('../src/components/shapes'),
    require('../src/components/images'),
    require('../src/components/updatemenus'),
    require('../src/components/sliders'),
    require('../src/components/rangeslider'),
    require('../src/components/rangeselector'),
    require('../src/components/grid'),
    require('../src/components/errorbars'),
    require('../src/components/colorscale'),
    require('../src/components/colorbar')
]);

// locales en and en-US are required for default behavior
register([
    require('../src/locale-en'),
    require('../src/locale-en-us')
]);

// locales that are present in the window should be loaded
if(window.PlotlyLocales && Array.isArray(window.PlotlyLocales)) {
    register(window.PlotlyLocales);
    delete window.PlotlyLocales;
}

// plot icons
exports.Icons = require('../src/fonts/ploticon');

// unofficial 'beta' plot methods, use at your own risk
var Fx = require('../src/components/fx');
var Plots = require('../src/plots/plots');

exports.Plots = {
    resize: Plots.resize,
    graphJson: Plots.graphJson,
    sendDataToCloud: Plots.sendDataToCloud
};
exports.Fx = {
    hover: Fx.hover,
    unhover: Fx.unhover,
    loneHover: Fx.loneHover,
    loneUnhover: Fx.loneUnhover
};
exports.Snapshot = require('../src/snapshot');
exports.PlotSchema = require('../src/plot_api/plot_schema');
