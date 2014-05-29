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

describe('Model Spec', function() {

  afterEach(function() {
    Backbone.attachOptions = true;
  });

  it('should create a new model with options', function() {
  	var attributes = {
  	  id: 1
  	};

  	var options = {
  	  foo: 'bar'
  	};

  	var model = new Backbone.Model(attributes, options);

  	expect(model.foo).toBeDefined();
  });

  it('should create a new model with options and do not override original values', function() {
    var attributes = {
      id: 1
    };

    var options = {
      foo: 'bar',
      parse: true
    };

    var model = new Backbone.Model(attributes, options);

    expect(model.foo).toBeDefined();
    expect(typeof model.parse).toBe('function');
  });

  it('should create a new model without options if option is disabled', function() {
    Backbone.attachOptions = false;

    var attributes = {
      id: 1
    };

    var options = {
      foo: 'bar'
    };

    var model = new Backbone.Model(attributes, options);

    expect(model.foo).not.toBeDefined();
  });

});