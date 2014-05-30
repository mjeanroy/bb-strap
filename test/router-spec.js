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

describe('Router Spec', function() {

  beforeEach(function() {
    spyOn(Backbone.history, 'start').andCallFake(function() {
      Backbone.History.started = true;
    });
  });

  afterEach(function() {
    Backbone.History.started = false;
  });

  it('should start history navigation', function() {
    var router = new Backbone.Router();

    expect(Backbone.history.start).toHaveBeenCalledWith({
      silent: false,
      pushState: true
    });
  });

  it('should start history navigation with custom options', function() {
    var router = new Backbone.Router({
      silent: true,
      pushState: false
    });

    expect(Backbone.history.start).toHaveBeenCalledWith({
      silent: true,
      pushState: false
    });
  });

  it('should not start history navigation if it is already started', function() {
    Backbone.History.started = true;

    var router = new Backbone.Router({
      silent: true,
      pushState: false
    });

    expect(Backbone.history.start).not.toHaveBeenCalled();
  });

  it('should not start history navigation if it is started in initialize function', function() {
    var CustomRouter = Backbone.Router.extend({
      initialize: function() {
        Backbone.history.start();
      }
    });

    var router = new CustomRouter();

    expect(Backbone.history.start).toHaveBeenCalled();
    expect(Backbone.history.start.callCount).toBe(1);
  });
});
