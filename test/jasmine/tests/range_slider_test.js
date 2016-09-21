var Plotly = require('@lib/index');
var Lib = require('@src/lib');

var RangeSlider = require('@src/components/rangeslider');
var constants = require('@src/components/rangeslider/constants');

var createGraphDiv = require('../assets/create_graph_div');
var destroyGraphDiv = require('../assets/destroy_graph_div');
var mock = require('../../image/mocks/range_slider.json');
var mouseEvent = require('../assets/mouse_event');


describe('the range slider', function() {

    var gd,
        rangeSlider,
        children;

    var sliderY = 393;

    function getRangeSlider() {
        var className = constants.containerClassName;
        return document.getElementsByClassName(className)[0];
    }


    describe('when specified as visible', function() {

        beforeEach(function(done) {
            gd = createGraphDiv();

            var mockCopy = Lib.extendDeep({}, mock);

            Plotly.plot(gd, mockCopy.data, mockCopy.layout).then(function() {
                rangeSlider = getRangeSlider();
                children = rangeSlider.children;

                done();
            });
        });

        afterEach(destroyGraphDiv);

        it('should be added to the DOM when specified', function() {
            expect(rangeSlider).toBeDefined();
        });

        it('should have the correct width and height', function() {
            var bg = children[0];

            var options = mock.layout.xaxis.rangeslider,
                expectedWidth = gd._fullLayout._size.w + options.borderwidth;

            // width incorporates border widths
            expect(+bg.getAttribute('width')).toEqual(expectedWidth);
            expect(+bg.getAttribute('height')).toEqual(66);
        });

        it('should have the correct style', function() {
            var bg = children[0];

            expect(bg.getAttribute('fill')).toBe('#fafafa');
            expect(bg.getAttribute('stroke')).toBe('black');
            expect(bg.getAttribute('stroke-width')).toBe('2');
        });

        it('should react to resizing the minimum handle', function(done) {
            var start = 85,
                end = 140,
                dataMinStart = rangeSlider.getAttribute('data-min'),
                diff = end - start;

            slide(start, sliderY, end, sliderY).then(function() {
                var maskMin = children[2],
                    handleMin = children[5];

                expect(rangeSlider.getAttribute('data-min')).toEqual(String(+dataMinStart + diff));
                expect(maskMin.getAttribute('width')).toEqual(String(diff));
                expect(handleMin.getAttribute('transform')).toBe('translate(' + (diff - 3) + ',0)');
            }).then(done);
        });

        function testTranslate1D(node, val) {
            var transformParts = node.getAttribute('transform').split('(');
            expect(transformParts[0]).toEqual('translate');
            expect(+transformParts[1].split(',0)')[0]).toBeCloseTo(val, 0);
        }

        it('should react to resizing the maximum handle', function(done) {
            var start = 695,
                end = 490,
                dataMaxStart = rangeSlider.getAttribute('data-max'),
                diff = end - start;

            slide(start, sliderY, end, sliderY).then(function() {
                var maskMax = children[3],
                    handleMax = children[6];

                expect(+rangeSlider.getAttribute('data-max')).toBeCloseTo(+dataMaxStart + diff, 0);
                expect(+maskMax.getAttribute('width')).toBeCloseTo(-diff);
                testTranslate1D(handleMax, +dataMaxStart + diff);
            }).then(done);
        });

        it('should react to moving the slidebox left to right', function(done) {
            var start = 250,
                end = 300,
                dataMinStart = rangeSlider.getAttribute('data-min'),
                diff = end - start;

            slide(start, sliderY, end, sliderY).then(function() {
                var maskMin = children[2],
                    handleMin = children[5];

                expect(+rangeSlider.getAttribute('data-min')).toBeCloseTo(String(+dataMinStart + diff));
                expect(+maskMin.getAttribute('width')).toBeCloseTo(String(diff));
                testTranslate1D(handleMin, +dataMinStart + diff - 3);
            }).then(done);
        });

        it('should react to moving the slidebox right to left', function(done) {
            var start = 300,
                end = 250,
                dataMaxStart = rangeSlider.getAttribute('data-max'),
                diff = end - start;

            slide(start, sliderY, end, sliderY).then(function() {
                var maskMax = children[3],
                    handleMax = children[6];

                expect(+rangeSlider.getAttribute('data-max')).toBeCloseTo(+dataMaxStart + diff);
                expect(+maskMax.getAttribute('width')).toBeCloseTo(-diff);
                testTranslate1D(handleMax, +dataMaxStart + diff);
            }).then(done);


        });

        it('should resize the main plot when rangeslider has moved', function(done) {
            var start = 300,
                end = 400,
                rangeDiff1 = gd._fullLayout.xaxis.range[1] - gd._fullLayout.xaxis.range[0],
                rangeDiff2,
                rangeDiff3;

            slide(start, sliderY, end, sliderY).then(function() {
                rangeDiff2 = gd._fullLayout.xaxis.range[1] - gd._fullLayout.xaxis.range[0];
                expect(rangeDiff2).toBeLessThan(rangeDiff1);
            }).then(function() {
                start = 400;
                end = 200;

                return slide(start, sliderY, end, sliderY);
            }).then(function() {
                rangeDiff3 = gd._fullLayout.xaxis.range[1] - gd._fullLayout.xaxis.range[0];
                expect(rangeDiff3).toBeLessThan(rangeDiff2);
            }).then(done);
        });

        it('should relayout with relayout "array syntax"', function(done) {
            Plotly.relayout(gd, 'xaxis.range', [10, 20])
                .then(function() {
                    expect(gd._fullLayout.xaxis.range).toEqual([10, 20]);
                    expect(+rangeSlider.getAttribute('data-min')).toBeCloseTo(124.69, -1);
                    expect(+rangeSlider.getAttribute('data-max')).toBeCloseTo(249.39, -1);
                })
                .then(done);
        });

        it('should relayout with relayout "element syntax"', function(done) {
            Plotly.relayout(gd, 'xaxis.range[0]', 10)
                .then(function() {
                    expect(gd._fullLayout.xaxis.range[0]).toEqual(10);
                    expect(+rangeSlider.getAttribute('data-min')).toBeCloseTo(124.69, -1);
                })
                .then(done);
        });
    });


    describe('visibility property', function() {
        beforeEach(function() {
            gd = createGraphDiv();
        });

        afterEach(destroyGraphDiv);

        it('should not add the slider to the DOM by default', function(done) {
            Plotly.plot(gd, [{ x: [1, 2, 3], y: [2, 3, 4] }], {})
                .then(function() {
                    var rangeSlider = getRangeSlider();
                    expect(rangeSlider).not.toBeDefined();
                })
                .then(done);
        });

        it('should add the slider if rangeslider is set to anything', function(done) {
            Plotly.plot(gd, [{ x: [1, 2, 3], y: [2, 3, 4] }], {})
                .then(function() { Plotly.relayout(gd, 'xaxis.rangeslider', 'exists'); })
                .then(function() {
                    var rangeSlider = getRangeSlider();
                    expect(rangeSlider).toBeDefined();
                })
                .then(done);
        });

        it('should add the slider if visible changed to `true`', function(done) {
            Plotly.plot(gd, [{ x: [1, 2, 3], y: [2, 3, 4] }], {})
                .then(function() { Plotly.relayout(gd, 'xaxis.rangeslider.visible', true); })
                .then(function() {
                    var rangeSlider = getRangeSlider();
                    expect(rangeSlider).toBeDefined();
                })
                .then(done);
        });

        it('should remove the slider if changed to `false` or `undefined`', function(done) {
            Plotly.plot(gd, [{ x: [1, 2, 3], y: [2, 3, 4] }], { xaxis: { rangeslider: { visible: true }}})
                .then(function() { Plotly.relayout(gd, 'xaxis.rangeslider.visible', false); })
                .then(function() {
                    var rangeSlider = getRangeSlider();
                    expect(rangeSlider).not.toBeDefined();
                })
                .then(done);
        });
    });

    describe('handleDefaults function', function() {

        it('should not coerce anything if rangeslider isn\'t set', function() {
            var layoutIn = { xaxis: {}, yaxis: {}},
                layoutOut = { xaxis: {}, yaxis: {}},
                axName = 'xaxis',
                counterAxes = ['yaxis'],
                expected = { xaxis: {}, yaxis: {}};

            RangeSlider.handleDefaults(layoutIn, layoutOut, axName, counterAxes);

            expect(layoutIn).toEqual(expected);
        });

        it('should not mutate layoutIn', function() {
            var layoutIn = { xaxis: { rangeslider: { visible: true }}, yaxis: {}},
                layoutOut = { xaxis: { rangeslider: {}}, yaxis: {}},
                axName = 'xaxis',
                counterAxes = ['yaxis'],
                expected = { xaxis: { rangeslider: { visible: true }}, yaxis: {}};

            RangeSlider.handleDefaults(layoutIn, layoutOut, axName, counterAxes);

            expect(layoutIn).toEqual(expected);
        });

        it('should set defaults if rangeslider is set to anything truthy', function() {
            var layoutIn = { xaxis: { rangeslider: {}}, yaxis: {}},
                layoutOut = { xaxis: {}, yaxis: {}},
                axName = 'xaxis',
                counterAxes = ['yaxis'],
                expected = {
                    xaxis: {
                        rangeslider: {
                            visible: true,
                            thickness: 0.15,
                            bgcolor: '#fff',
                            borderwidth: 0,
                            bordercolor: '#444',
                            _input: layoutIn.xaxis.rangeslider
                        },
                        _needsExpand: true
                    },
                    yaxis: {
                        fixedrange: true
                    },
                };

            RangeSlider.handleDefaults(layoutIn, layoutOut, axName, counterAxes);

            expect(layoutOut).toEqual(expected);
        });

        it('should set defaults if rangeslider.visible is true', function() {
            var layoutIn = { xaxis: { rangeslider: { visible: true }}, yaxis: {}},
                layoutOut = { xaxis: { rangeslider: {}}, yaxis: {}},
                axName = 'xaxis',
                counterAxes = ['yaxis'],
                expected = {
                    xaxis: {
                        rangeslider: {
                            visible: true,
                            thickness: 0.15,
                            bgcolor: '#fff',
                            borderwidth: 0,
                            bordercolor: '#444',
                            _input: layoutIn.xaxis.rangeslider
                        },
                        _needsExpand: true
                    },
                    yaxis: {
                        fixedrange: true
                    }
                };

            RangeSlider.handleDefaults(layoutIn, layoutOut, axName, counterAxes);

            expect(layoutOut).toEqual(expected);
        });

        it('should set defaults if properties are invalid', function() {
            var layoutIn = { xaxis: { rangeslider: {
                    visible: 'invalid',
                    thickness: 'invalid',
                    bgcolor: 42,
                    bordercolor: 42,
                    borderwidth: 'superfat'
                }}, yaxis: {}},
                layoutOut = { xaxis: {}, yaxis: {}},
                axName = 'xaxis',
                counterAxes = ['yaxis'],
                expected = {
                    xaxis: {
                        rangeslider: {
                            visible: true,
                            thickness: 0.15,
                            bgcolor: '#fff',
                            borderwidth: 0,
                            bordercolor: '#444',
                            _input: layoutIn.xaxis.rangeslider
                        },
                        _needsExpand: true
                    },
                    yaxis: {
                        fixedrange: true
                    }
                };

            RangeSlider.handleDefaults(layoutIn, layoutOut, axName, counterAxes);

            expect(layoutOut).toEqual(expected);
        });

        it('should set all counterAxes to fixedrange', function() {
            var layoutIn = { xaxis: { rangeslider: true }, yaxis: {}, yaxis2: {}},
                layoutOut = { xaxis: {}, yaxis: {}, yaxis2: {}},
                axName = 'xaxis',
                counterAxes = ['yaxis', 'yaxis2'],
                expected = {
                    xaxis: {
                        rangeslider: {
                            visible: true,
                            thickness: 0.15,
                            bgcolor: '#fff',
                            borderwidth: 0,
                            bordercolor: '#444',
                            _input: {}
                        },
                        _needsExpand: true
                    },
                    yaxis: { fixedrange: true},
                    yaxis2: { fixedrange: true }
                };

            RangeSlider.handleDefaults(layoutIn, layoutOut, axName, counterAxes);

            expect(layoutOut).toEqual(expected);
        });

        it('should expand the rangeslider range to axis range', function() {
            var layoutIn = { xaxis: { rangeslider: { range: [5, 6] } }, yaxis: {}},
                layoutOut = { xaxis: { range: [1, 10]}, yaxis: {}},
                axName = 'xaxis',
                counterAxes = ['yaxis'],
                expected = {
                    xaxis: {
                        rangeslider: {
                            visible: true,
                            thickness: 0.15,
                            bgcolor: '#fff',
                            borderwidth: 0,
                            bordercolor: '#444',
                            range: [1, 10],
                            _input: layoutIn.xaxis.rangeslider
                        },
                        range: [1, 10]
                    },
                    yaxis: { fixedrange: true }
                };

            RangeSlider.handleDefaults(layoutIn, layoutOut, axName, counterAxes);

            expect(layoutOut).toEqual(expected);
        });

        it('should set _needsExpand when an axis range is set', function() {
            var layoutIn = { xaxis: { rangeslider: true }, yaxis: {}},
                layoutOut = { xaxis: { range: [2, 40]}, yaxis: {}},
                axName = 'xaxis',
                counterAxes = ['yaxis'],
                expected = {
                    xaxis: {
                        rangeslider: {
                            visible: true,
                            thickness: 0.15,
                            bgcolor: '#fff',
                            borderwidth: 0,
                            bordercolor: '#444',
                            _input: {}
                        },
                        range: [2, 40],
                        _needsExpand: true
                    },
                    yaxis: { fixedrange: true }
                };

            RangeSlider.handleDefaults(layoutIn, layoutOut, axName, counterAxes);

            expect(layoutOut).toEqual(expected);
        });
    });

    describe('in general', function() {

        beforeEach(function() {
            gd = createGraphDiv();
        });

        afterEach(destroyGraphDiv);

        it('should plot when only x data is provided', function(done) {
            Plotly.plot(gd, [{ x: [1, 2, 3] }], { xaxis: { rangeslider: {} }})
                .then(function() {
                    var rangeSlider = getRangeSlider();

                    expect(rangeSlider).toBeDefined();
                })
                .then(done);
        });

        it('should plot when only y data is provided', function(done) {
            Plotly.plot(gd, [{ y: [1, 2, 3] }], { xaxis: { rangeslider: {} }})
                .then(function() {
                    var rangeSlider = getRangeSlider();

                    expect(rangeSlider).toBeDefined();
                })
                .then(done);
        });
    });
});


function slide(fromX, fromY, toX, toY) {
    return new Promise(function(resolve) {
        mouseEvent('mousemove', fromX, fromY);
        mouseEvent('mousedown', fromX, fromY);
        mouseEvent('mousemove', toX, toY);
        mouseEvent('mouseup', toX, toY);

        setTimeout(function() {
            return resolve();
        }, 20);
    });
}
