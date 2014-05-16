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

describe('RemoteTemplateManager Test Suite', function() {

  beforeEach(function() {
    this.xhr = jasmine.createSpyObj('xhr', ['done']);
    spyOn($, 'get').andReturn(this.xhr);
  });

  beforeEach(function() {
    this.tmpl = new Backbone.RemoteTemplateManager();
  });

  it('should build a remote template manager', function() {
    expect(this.tmpl.$cache).toEqual({});
    expect(this.tmpl.prefix).toBe('/templates/');
    expect(this.tmpl.suffix).toBe('.template.html');
  });

  it('should build a remote template manager with custom options', function() {
    var prefix = '/foo';
    var suffix = '.foo.html';

    var templateManager = new Backbone.RemoteTemplateManager({
      prefix: prefix,
      suffix: suffix
    });

    expect(templateManager.$cache).toEqual({});
    expect(templateManager.prefix).toBe(prefix);
    expect(templateManager.suffix).toBe(suffix);
  });

  it('should clear cache', function() {
    this.tmpl.$cache['foo'] = 'foo tmpl';

    this.tmpl.$clear();

    expect(this.tmpl.$cache).toEqual({});
  });

  it('should clear a cache entry', function() {
    var $foo = 'foo tmpl';
    var $bar = 'bar tmpl';
    this.tmpl.$cache['foo'] = $foo;
    this.tmpl.$cache['bar'] = $bar;

    this.tmpl.$clear('foo');

    expect(this.tmpl.$cache).toEqual({
      'bar': $bar
    });
  });

  it('should build template url', function() {
    var template = 'foo';

    var url = this.tmpl.$url(template);

    expect(url).toBe('/templates/' + template + '.template.html');
  });

  it('should get a template', function() {
    var template = 'foo';
    var done = jasmine.createSpy('done');

    this.tmpl.$get(template, done);

    var url = '/templates/' + template + '.template.html';
    expect($.get).toHaveBeenCalledWith(url);
    expect(this.xhr.done).toHaveBeenCalled();
    expect(done).not.toHaveBeenCalled();

    var html = template + ' html';
    this.xhr.done.mostRecentCall.args[0](html);
    expect(done).toHaveBeenCalledWith(html, template);
  });

  it('should not get a template twice', function() {
    var template = 'foo';
    var done = jasmine.createSpy('done');

    this.tmpl.$get(template, done);
    this.tmpl.$get(template, done);

    var url = '/templates/' + template + '.template.html';
    expect($.get).toHaveBeenCalledWith(url);
    expect($.get.callCount).toBe(1);
  });

  it('should load a single template', function() {
    var template = 'foo';
    var html = template + ' html';
    var done = jasmine.createSpy('done');
    var ctx = this;

    spyOn(this.tmpl, '$get').andCallThrough();

    this.tmpl.$load(template, done);

    expect(this.tmpl.$get).toHaveBeenCalledWith(template, jasmine.any(Function));
    expect(done).not.toHaveBeenCalled();
    expect($.get).toHaveBeenCalled();
    expect(this.xhr.done).toHaveBeenCalled();

    this.xhr.done.mostRecentCall.args[0](html);
    expect(done).toHaveBeenCalledWith(html, template);
  });

  it('should load an array template', function() {
    var templateFoo = 'foo';
    var fooHtml = templateFoo + ' html';

    var templateBar = 'bar';
    var barHtml = templateBar + ' html';

    var templates = [templateFoo, templateBar];

    var results = {};
    results[templateFoo] = fooHtml;
    results[templateBar] = barHtml;

    var done = jasmine.createSpy('done');
    var ctx = this;

    spyOn(this.tmpl, '$get').andCallThrough();

    this.tmpl.$loads(templates, done);

    expect(this.tmpl.$get).toHaveBeenCalledWith(templateFoo, jasmine.any(Function));
    expect(this.tmpl.$get).toHaveBeenCalledWith(templateBar, jasmine.any(Function));
    expect(this.tmpl.$get.callCount).toBe(2);
    expect(this.xhr.done).toHaveBeenCalled();
    expect(this.xhr.done.callCount).toBe(2);

    this.xhr.done.calls[0].args[0](fooHtml);
    expect(done).not.toHaveBeenCalled();

    this.xhr.done.calls[1].args[0](barHtml);
    expect(done).toHaveBeenCalledWith(results);
  });

  it('should load a template', function() {
    var callback = jasmine.createSpy('callback');
    var template = 'foo';

    spyOn(this.tmpl, '$load');
    spyOn(this.tmpl, '$loads');

    this.tmpl.load(template, callback);

    expect(this.tmpl.$load).toHaveBeenCalledWith(template, callback, undefined);
    expect(this.tmpl.$loads).not.toHaveBeenCalled();
  });

  it('should load an array of templates', function() {
    var callback = jasmine.createSpy('callback');
    var fooTemplate = 'foo';
    var barTemplate = 'bar';
    var templates = [fooTemplate, barTemplate];

    spyOn(this.tmpl, '$load');
    spyOn(this.tmpl, '$loads');

    this.tmpl.load(templates, callback);

    expect(this.tmpl.$loads).toHaveBeenCalledWith(templates, callback, undefined);
    expect(this.tmpl.$load).not.toHaveBeenCalled();
  });
});