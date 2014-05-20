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

describe('DOMTemplateManager Test Suite', function() {

  beforeEach(function() {
    this.fooId = 'foo';
    this.fooTemplate = 'foo tmpl';

    this.barId = 'foo';
    this.barTemplate = 'foo tmpl';

    $('<div>')
      .attr('id', this.fooId)
      .html(this.fooTemplate)
      .appendTo('body');

    $('<div>')
      .attr('id', this.barId)
      .html(this.barTemplate)
      .appendTo('body');
  });

  beforeEach(function() {
    this.tmpl = new Backbone.DOMTemplateManager();
  });

  it('should have an dom template manager defined', function() {
    expect(Backbone.domTemplateManager).toBeDefined();
  });

  it('should build a DOM template manager', function() {
    expect(this.tmpl.$cache).toEqual({});
  });

  it('should clear cache', function() {
    this.tmpl.$cache['#foo'] = $('<div>');

    this.tmpl.$clear();

    expect(this.tmpl.$cache).toEqual({});
  });

  it('should clear a cache entry', function() {
    var $foo = $('<div>');
    var $bar = $('<div>');
    this.tmpl.$cache['#foo'] = $foo;
    this.tmpl.$cache['#bar'] = $bar;

    this.tmpl.$clear('#foo');

    expect(this.tmpl.$cache).toEqual({
      '#bar': $bar
    });
  });

  it('should get a template', function() {
    var id = '#' + this.fooId;
    var done = jasmine.createSpy('done');

    this.tmpl.$get(id, done);

    expect(done).toHaveBeenCalledWith(this.fooTemplate, id);
  });

  it('should load a single template', function() {
    spyOn(this.tmpl, '$get').andCallThrough();

    var id = '#' + this.fooId;
    var done = jasmine.createSpy('done');

    this.tmpl.$load(id, done);

    expect(this.tmpl.$get).toHaveBeenCalledWith(id, jasmine.any(Function));
    expect(done).toHaveBeenCalledWith(this.fooTemplate, id);
    expect(done.callCount).toBe(1);
  });

  it('should load an array of templates', function() {
    spyOn(this.tmpl, '$get').andCallThrough();

    var fooId = '#' + this.fooId;
    var barId = '#' + this.barId;
    var templates = [fooId, barId];
    var done = jasmine.createSpy('done');

    this.tmpl.$loads(templates, done);

    expect(this.tmpl.$get).toHaveBeenCalledWith(fooId, jasmine.any(Function));
    expect(this.tmpl.$get).toHaveBeenCalledWith(barId, jasmine.any(Function));
    expect(this.tmpl.$get.callCount).toBe(2);

    var results = {};
    results[fooId] = this.fooTemplate;
    results[barId] = this.barTemplate;
    expect(done).toHaveBeenCalledWith(results);
    expect(done.callCount).toBe(1);
  });

  it('should load a template', function() {
    var callback = jasmine.createSpy('callback');
    var template = '#foo';

    spyOn(this.tmpl, '$load');
    spyOn(this.tmpl, '$loads');

    this.tmpl.load(template, callback);

    expect(this.tmpl.$load).toHaveBeenCalledWith(template, callback, undefined);
    expect(this.tmpl.$loads).not.toHaveBeenCalled();
  });

  it('should load an array of templates', function() {
    var callback = jasmine.createSpy('callback');
    var templates = ['#foo', '#bar'];

    spyOn(this.tmpl, '$load');
    spyOn(this.tmpl, '$loads');

    this.tmpl.load(templates, callback);

    expect(this.tmpl.$loads).toHaveBeenCalledWith(templates, callback, undefined);
    expect(this.tmpl.$load).not.toHaveBeenCalled();
  });
});