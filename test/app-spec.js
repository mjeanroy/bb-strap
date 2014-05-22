/**
 * The MIT License (MIT)
 *
 * Copyright (c) 2014 Mickael Jeanroy <mickael.jeanroy@gmail.com>
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */

describe('App Spec', function() {

  beforeEach(function() {
    spyOn($.fn, 'addClass').andCallThrough();
    spyOn($.fn, 'removeClass').andCallThrough();
    spyOn($.fn, 'scrollTop');
  });

  afterEach(function() {
    delete window.app;
  });

  it('should initialize application', function() {
    var app = new Backbone.App();

    expect(window.app).toBe(app);

    var expectedUrl = window.location.protocol + '//' + window.location.host + window.location.pathname;
    expect(app.url).toBe(expectedUrl);

    expect(app.$window).toBeDefined();
    expect(app.$body).toBeDefined();
    expect(app.$html).toBeDefined();
    expect(app.$document).toBeDefined();

    expect(app.$html.addClass).toHaveBeenCalledWith('js');
    expect(app.$html.removeClass).toHaveBeenCalledWith('no-js');

    expect(app.views).toEqual({});
    expect(app.router).toBe(null);
  });

  it('should handle click on a link', function() {
    var app = new Backbone.App();
    app.router = jasmine.createSpyObj('router', ['navigate']);

    var $a = $('<a>').attr('href', '/foo');
    var event = jasmine.createSpyObj('event', ['preventDefault']);
    event.currentTarget = $a;

    app.nav(event);

    expect(event.preventDefault).toHaveBeenCalled();
    expect(app.router.navigate).toHaveBeenCalledWith('/foo', {
      trigger: true
    })
  });

  it('should navigate to a given url and trigger route', function() {
    var app = new Backbone.App();
    app.router = jasmine.createSpyObj('router', ['navigate']);

    app.navigate('/foo');

    expect(app.router.navigate).toHaveBeenCalledWith('/foo', {
      trigger: true
    });
  });

  it('should navigate to a given url and do not trigger route', function() {
    var app = new Backbone.App();
    app.router = jasmine.createSpyObj('router', ['navigate']);

    app.navigate('/foo', false);

    expect(app.router.navigate).toHaveBeenCalledWith('/foo', {
      trigger: false
    });
  });

  it('should navigate to a fully qualified url', function() {
    var app = new Backbone.App();
    app.router = jasmine.createSpyObj('router', ['navigate']);

    app.navigate(app.url + '/foo', false);

    expect(app.router.navigate).toHaveBeenCalledWith('/foo', {
      trigger: false
    });
  });

  it('should scroll to a given y value', function() {
    var y = 10;
    var app = new Backbone.App();

    app.scrollTop(y);

    expect(app.$window.scrollTop).toHaveBeenCalledWith(y);
  });

  it('should scroll to top', function() {
    var app = new Backbone.App();

    app.scrollTop();

    expect(app.$window.scrollTop).toHaveBeenCalledWith(0);
  });
});