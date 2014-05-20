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

  it('should create a new view with options', function() {
  	var options = {
  	  foo: 'bar'
  	};

  	var view = new Backbone.View(options);

  	expect(view.foo).toBeDefined();
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
});