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

describe('InlineTemplateManager Test Suite', function() {

  beforeEach(function() {
    this.tmpl = new Backbone.InlineTemplateManager();
  });

  it('should have an inline template manager defined', function() {
    expect(Backbone.inlineTemplateManager).toBeDefined();
  });

  it('should get a template', function() {
    var template = 'foo';
    var done = jasmine.createSpy('done');

    this.tmpl.$get(template, done);

    expect(done).toHaveBeenCalledWith(template, template);
  });

  it('should get a template object', function() {
    var template = {
      id: 'foo',
      tmpl: 'foo tmpl'
    };

    var done = jasmine.createSpy('done');

    this.tmpl.$get(template, done);

    expect(done).toHaveBeenCalledWith(template.tmpl, template.id);
  });

  it('should load a single template', function() {
    spyOn(this.tmpl, '$get').andCallThrough();

    var template = 'foo';
    var done = jasmine.createSpy('done');

    this.tmpl.$load(template, done);

    expect(this.tmpl.$get).toHaveBeenCalledWith(template, jasmine.any(Function));
    expect(done).toHaveBeenCalledWith(template, template);
    expect(done.callCount).toBe(1);
  });

  it('should load an array of templates', function() {
    spyOn(this.tmpl, '$get').andCallThrough();

    var fooId = 'foo';
    var fooTemplate = 'foo tmpl';

    var barId = 'bar';
    var barTemplate = 'bar tmpl';

    var foo = {
      id: fooId,
      tmpl: fooTemplate
    };

    var bar = {
      id: barId,
      tmpl: barTemplate
    };

    var templates = [foo, bar];

    var done = jasmine.createSpy('done');

    this.tmpl.$loads(templates, done);

    expect(this.tmpl.$get).toHaveBeenCalledWith(foo, jasmine.any(Function));
    expect(this.tmpl.$get).toHaveBeenCalledWith(bar, jasmine.any(Function));
    expect(this.tmpl.$get.callCount).toBe(2);

    var results = {};
    results[fooId] = fooTemplate;
    results[barId] = barTemplate;
    expect(done).toHaveBeenCalledWith(results);
    expect(done.callCount).toBe(1);
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

    var fooId = 'foo';
    var fooTemplate = 'foo tmpl';

    var barId = 'bar';
    var barTemplate = 'bar tmpl';

    var foo = {
      id: fooId,
      tmpl: fooTemplate
    };

    var bar = {
      id: barId,
      tmpl: barTemplate
    };

    var templates = [foo, bar];

    spyOn(this.tmpl, '$load');
    spyOn(this.tmpl, '$loads');

    this.tmpl.load(templates, callback);

    expect(this.tmpl.$loads).toHaveBeenCalledWith(templates, callback, undefined);
    expect(this.tmpl.$load).not.toHaveBeenCalled();
  });
});