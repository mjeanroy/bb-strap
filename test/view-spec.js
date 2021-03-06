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

describe('View Spec', function() {

  afterEach(function() {
    Backbone.attachOptions = true;
  });

  it('should create a new view with options', function() {
    var options = {
      foo: 'bar'
    };

    var view = new Backbone.View(options);

    expect(view.foo).toBe('bar');
  });

  it('should not create a new view with options if option is disabled', function() {
    Backbone.attachOptions = false;

    var options = {
      foo: 'bar'
    };

    var view = new Backbone.View(options);

    expect(view.foo).not.toBeDefined();
  });

  it('should create a new view with default options', function() {
    var CustomView = Backbone.View.extend({
      defaults: {
        foo: 'foo',
        bar: 'bar'
      }
    });

    var options = {
      foo: 'bar'
    };

    var view = new CustomView(options);

    expect(view.foo).toBe('bar');
    expect(view.bar).toBe('bar');
  });

  it('should create a new view with default options as a function', function() {
    var CustomView = Backbone.View.extend({
      defaults: function() {
        return {
          foo: 'foo',
          bar: 'bar'
        };
      }
    });

    var options = {
      foo: 'bar'
    };

    var view = new CustomView(options);

    expect(view.foo).toBe('bar');
    expect(view.bar).toBe('bar');
  });

  it('should return true if view is empty', function() {
    var view = new Backbone.View();
    view.$el.html('   ');

    var isEmpty = view.isEmpty();

    expect(isEmpty).toBe(true);
  });

  it('should return false if view is empty', function() {
    var view = new Backbone.View();
    view.$el.html('<span>foo</span>');

    var isEmpty = view.isEmpty();

    expect(isEmpty).toBe(false);
  });

  describe('Spinner', function() {
    beforeEach(function() {
      this.view = new Backbone.View();

      spyOn($.fn, 'html').andCallThrough();
      spyOn($.fn, 'remove').andCallThrough();
    });

    it('should display spinner', function() {
      this.view.$showLoader();

      expect(this.view.$el.hasClass('loading')).toBe(true);
      expect(this.view.$loader).toBeDefined();
      expect(this.view.$loader.hasClass('icon-loader')).toBe(true);
    });

    it('should hide spinner', function() {
      this.view.$el.addClass('loading');
      var $loader = $('<i>');
      this.view.$loader = $loader;

      this.view.$hideLoader();

      expect(this.view.$el.hasClass('loading')).toBe(false);
      expect(this.view.$loader).toBe(null);
      expect($loader.remove).toHaveBeenCalled();
    });
  });

  describe('Read Data', function() {
    beforeEach(function() {
      var json = '{"id": 1, "name": "foo"}';
      this.$script = $('<script>')
        .attr('type', 'application/json')
        .attr('id', 'foo')
        .text(json)
        .appendTo('body');

      spyOn(JSON, 'parse').andCallThrough();
    });

    afterEach(function() {
      this.$script.remove();
    });

    it('should read data and set value to foo', function() {
      var view = new Backbone.View();
      view.foo = new Backbone.Model();

      var model = view.$readData('foo');

      expect(model).toBeDefined();
      expect(model.get('id')).toBe(1);
      expect(model.get('name')).toBe('foo');
      expect(view.foo).toBe(model);
    });

    it('should read data and set value to model', function() {
      var view = new Backbone.View();
      view.model = new Backbone.Model();

      var model = view.$readData('foo', 'model');

      expect(model).toBeDefined();
      expect(model.get('id')).toBe(1);
      expect(model.get('name')).toBe('foo');
      expect(view.model).toBe(model);
    });

    it('should read data and set value to model object', function() {
      var view = new Backbone.View();
      view.model = new Backbone.Model();

      var model = view.$readData('foo', view.model);

      expect(model).toBeDefined();
      expect(model.get('id')).toBe(1);
      expect(model.get('name')).toBe('foo');
      expect(view.model).toBe(model);
    });

    it('should not read data if dom content is empty', function() {
      this.$script.text('');

      var view = new Backbone.View();
      view.foo = new Backbone.Model();

      var model = view.$readData('foo');

      expect(model).toBeDefined();
      expect(view.foo).toBe(model);
      expect(JSON.parse).not.toHaveBeenCalled();
    });

    it('should not read data if dom content is a blank string', function() {
      this.$script.text('   ');

      var view = new Backbone.View();
      view.foo = new Backbone.Model();

      var model = view.$readData('foo');

      expect(model).toBeDefined();
      expect(view.foo).toBe(model);
      expect(JSON.parse).not.toHaveBeenCalled();
    });
  });

  describe('View Destruction', function() {
    beforeEach(function() {
      spyOn(Backbone.View.prototype, '$destroy').andCallThrough();
      spyOn(Backbone.View.prototype, 'undelegateEvents').andCallThrough();
      spyOn(Backbone.View.prototype, 'stopListening').andCallThrough();
      spyOn(Backbone.View.prototype, 'onDispose').andCallThrough();
      spyOn(Backbone.View.prototype, 'trigger').andCallThrough();
      spyOn(Backbone.View.prototype, 'unsetSubscriptions').andCallThrough();

      spyOn($.fn, 'empty');
      spyOn($.fn, 'remove');

      this.view = new Backbone.View();
    });

    it('should remove view', function() {
      var $el = this.view.$el;

      this.view.remove();

      expect(this.view.onDispose).toHaveBeenCalled();
      expect(this.view.trigger).toHaveBeenCalledWith('dispose', this.view);
      expect(this.view.trigger).toHaveBeenCalledWith('close', this.view);
      expect(this.view.undelegateEvents).toHaveBeenCalled();
      expect(this.view.stopListening).toHaveBeenCalled();
      expect(this.view.unsetSubscriptions).toHaveBeenCalled();
      expect(this.view.$destroy).toHaveBeenCalled();
      expect($el.remove).toHaveBeenCalled();
    });

    it('should close view', function() {
      var $el = this.view.$el;

      this.view.close();

      expect(this.view.onDispose).toHaveBeenCalled();
      expect(this.view.trigger).toHaveBeenCalledWith('dispose', this.view);
      expect(this.view.trigger).toHaveBeenCalledWith('close', this.view);
      expect(this.view.undelegateEvents).toHaveBeenCalled();
      expect(this.view.stopListening).toHaveBeenCalled();
      expect(this.view.unsetSubscriptions).toHaveBeenCalled();
      expect(this.view.$destroy).toHaveBeenCalled();
      expect($el.remove).toHaveBeenCalled();
    });

    it('should clear view', function() {
      var $el = this.view.$el;

      this.view.clear();

      expect(this.view.onDispose).toHaveBeenCalled();
      expect(this.view.trigger).toHaveBeenCalledWith('dispose', this.view);
      expect(this.view.trigger).toHaveBeenCalledWith('clear', this.view);
      expect($el.empty).toHaveBeenCalled();
      expect(this.view.undelegateEvents).toHaveBeenCalled();
      expect(this.view.stopListening).toHaveBeenCalled();
      expect(this.view.unsetSubscriptions).toHaveBeenCalled();
      expect(this.view.$destroy).toHaveBeenCalled();
      expect($el.remove).not.toHaveBeenCalled();
    });

    it('should destroy view', function() {
      this.view.model = new Backbone.Model();
      this.view.collection = new Backbone.Collection();
      this.view.xhr = jasmine.createSpyObj('xhr', ['abort']);

      this.view.$destroy();

      expect(this.view.model).toBe(null);
      expect(this.view.collection).toBe(null);
      expect(this.view.xhr).toBe(null);
    });
  });

  describe('View Subscriptions', function() {
    beforeEach(function() {
      spyOn(Backbone.Mediator, 'sub').andCallThrough();
      spyOn(Backbone.Mediator, 'unsubscribe').andCallThrough();

      spyOn(Backbone.View.prototype, 'setSubscriptions').andCallThrough();
      spyOn(Backbone.View.prototype, 'unsetSubscriptions').andCallThrough();

      this.view = new Backbone.View();
    });

    it('should attach subscriptions on view creation', function() {
      var view = new Backbone.View();

      expect(view.setSubscriptions).toHaveBeenCalledWith();
    });

    it('should attach subscriptions on view creation', function() {
      var fooFn = jasmine.createSpy('fooFn');
      var barFn = jasmine.createSpy('barFn');

      var CustomView = Backbone.View.extend({
        subscriptions: {
          'foo': 'fooFn',
          'bar': 'barFn'
        },

        fooFn: fooFn,

        barFn: barFn
      });

      var view = new CustomView();

      expect(view.setSubscriptions).toHaveBeenCalledWith();
      expect(Backbone.Mediator.sub).toHaveBeenCalledWith('foo', fooFn, view, false);
      expect(Backbone.Mediator.sub).toHaveBeenCalledWith('bar', barFn, view, false);
    });

    it('should attach subscriptions', function() {
      var fn1 = jasmine.createSpy('fn1');
      var fn2 = jasmine.createSpy('fn2');

      var subscriptions = {
        foo: fn1,
        bar: fn2
      };

      this.view.setSubscriptions(subscriptions);

      expect(Backbone.Mediator.sub).toHaveBeenCalledWith('foo', fn1, this.view, false);
      expect(Backbone.Mediator.sub).toHaveBeenCalledWith('bar', fn2, this.view, false);
    });

    it('should detach subscriptions', function() {
      var fn1 = jasmine.createSpy('fn1');
      var fn2 = jasmine.createSpy('fn2');

      var subscriptions = {
        foo: fn1,
        bar: fn2
      };

      this.view.unsetSubscriptions(subscriptions);

      expect(Backbone.Mediator.unsubscribe).toHaveBeenCalledWith('foo', fn1, this.view);
      expect(Backbone.Mediator.unsubscribe).toHaveBeenCalledWith('bar', fn2, this.view);
    });
  });

  describe('View Bindings', function() {
    it('should update view when model is updated', function() {
      var $span = $('<span>').attr('id', 'first-name').text('foo');
      var $el = $('<div>').append($span);

      var model = new Backbone.Model({
        firstName: 'foo'
      });

      var view = new Backbone.View({
        model: model,
        el: $el,
        bindings: {
          '#first-name': 'firstName'
        }
      });

      model.set('firstName', 'bar');

      expect($el.find('#first-name').text()).toBe('bar');
    });

    it('should update view of other model', function() {
      var $span = $('<span>').attr('id', 'first-name').text('foo');
      var $el = $('<div>').append($span);

      var model = new Backbone.Model({
        firstName: 'foo'
      });

      var view = new Backbone.View({
        foo: model,
        el: $el,
        bindings: {
          '#first-name': 'firstName'
        },
        initialize: function() {
          this.bind(this.foo);
        }
      });

      model.set('firstName', 'bar');

      expect($el.find('#first-name').text()).toBe('bar');
    });
  });
});