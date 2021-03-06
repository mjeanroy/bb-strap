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

describe('Composite View Spec', function() {

  beforeEach(function() {
    spyOn(Backbone.CompositeView.prototype, 'setSubscriptions').andCallThrough();
    spyOn(Backbone.CompositeView.prototype, 'unsetSubscriptions').andCallThrough();

    spyOn(Backbone.CompositeView.prototype, 'onInit').andCallThrough();
    spyOn(Backbone.CompositeView.prototype, 'postInit').andCallThrough();
    spyOn(Backbone.CompositeView.prototype, 'onReady').andCallThrough();
    spyOn(Backbone.CompositeView.prototype, 'onRendered').andCallThrough();
    spyOn(Backbone.CompositeView.prototype, 'render').andCallThrough();
  });

  it('should initialize a composite view without options', function() {
    var view = new Backbone.CompositeView();

    expect(view.$cache).toEqual({});
    expect(view.$subviews).toEqual({});
    expect(view.setSubscriptions).toHaveBeenCalled();
    expect(view.tmplManager).toBe(Backbone.remoteTemplateManager);
    expect(view.onInit).toHaveBeenCalled();
  });

  it('should initialize a composite view with options', function() {
    var options = {
      foo: 'bar'
    };

    var view = new Backbone.CompositeView(options);

    expect(view.foo).toBe('bar');
    expect(view.$cache).toEqual({});
    expect(view.$subviews).toEqual({});
    expect(view.setSubscriptions).toHaveBeenCalled();
    expect(view.tmplManager).toBe(Backbone.remoteTemplateManager);
    expect(view.onInit).toHaveBeenCalled();
  });

  it('should initialize an empty view', function() {
    spyOn(Backbone.CompositeView.prototype, 'isEmpty').andReturn(true);

    var view = new Backbone.CompositeView();

    expect(view.onInit).toHaveBeenCalled();
    expect(view.postInit).toHaveBeenCalled();
    expect(view.render).toHaveBeenCalled();
    expect(view.onRendered).not.toHaveBeenCalled();
  });

  it('should initialize a rendered view', function() {
    spyOn(Backbone.CompositeView.prototype, 'isEmpty').andReturn(false);

    var onReady = jasmine.createSpy('onReady');

    var view = new Backbone.CompositeView({
      onReady: onReady
    });

    expect(view.onInit).toHaveBeenCalled();
    expect(view.postInit).not.toHaveBeenCalled();
    expect(onReady).toHaveBeenCalled();
    expect(view.onRendered).toHaveBeenCalled();
  });

  describe('jQuery cache', function() {
    beforeEach(function() {
      this.view = new Backbone.CompositeView();

      spyOn(this.view, '$clear').andCallThrough();
      spyOn(this.view, 'trigger').andCallThrough();
    });

    it('should add a jQuery element to the cache', function() {
      var $div = $('<div>').attr('id', 'foo');
      this.view.$el.append($div);

      var $elem = this.view.$c('#foo');

      expect($elem).toBeDefined();
      expect(this.view.$cache['#foo']).toBeDefined();
      expect(this.view.$cache['#foo']).toBe($elem);
    });

    it('should get a jQuery element from the cache', function() {
      var $div = $('<div>').attr('id', 'foo');
      this.view.$cache['#foo'] = $div;
      spyOn(this.view, '$').andCallThrough();

      var $elem = this.view.$c('#foo');

      expect($elem).toBeDefined();
      expect(this.view.$cache['#foo']).toBeDefined();
      expect(this.view.$cache['#foo']).toBe($elem);
      expect(this.view.$).not.toHaveBeenCalled();
    });

    it('should clear entire cache', function() {
      var $foo = $('<div>').attr('id', 'foo');
      var $bar = $('<div>').attr('id', 'bar');
      this.view.$cache['#foo'] = $foo;
      this.view.$cache['#bar'] = $bar;

      this.view.$clear();

      expect(this.view.$cache).toEqual({});
    });

    it('should clear cache entry', function() {
      var $foo = $('<div>').attr('id', 'foo');
      var $bar = $('<div>').attr('id', 'bar');
      this.view.$cache['#foo'] = $foo;
      this.view.$cache['#bar'] = $bar;

      this.view.$clear('#foo');

      expect(this.view.$cache).not.toEqual({});
      expect(this.view.$cache['#bar']).toBeDefined();
      expect(this.view.$cache['#foo']).not.toBeDefined();
    });

    it('should cache when view is disposed', function() {
      var $foo = $('<div>').attr('id', 'foo');
      var $bar = $('<div>').attr('id', 'bar');
      this.view.$cache['#foo'] = $foo;
      this.view.$cache['#bar'] = $bar;

      this.view.dispose();

      expect(this.view.$clear).toHaveBeenCalledWith();
      expect(this.view.trigger).toHaveBeenCalledWith('dispose', this.view);
    });
  });

  describe('Subviews', function() {
    beforeEach(function() {
      this.view = new Backbone.CompositeView();

      spyOn(this.view, 'listenToOnce').andCallThrough();
      spyOn(this.view, 'stopListening').andCallThrough();
      spyOn(this.view, '$closeSubviews').andCallThrough();
      spyOn(this.view, 'trigger').andCallThrough();
    });

    it('should add a subview', function() {
      var subview = new Backbone.CompositeView();
      var cid = subview.cid;

      this.view.$addSubview(subview);

      expect(this.view.listenToOnce).toHaveBeenCalledWith(subview, 'dispose', this.view.$closeSubView);
      expect(this.view.$subviews[cid]).toBe(subview);
    });

    it('should add several subviews', function() {
      var subview1 = new Backbone.CompositeView();
      var subview2 = new Backbone.CompositeView();
      var cid1 = subview1.cid;
      var cid2 = subview2.cid;

      this.view.$addSubview(subview1, subview2);

      expect(this.view.listenToOnce).toHaveBeenCalledWith(subview1, 'dispose', this.view.$closeSubView);
      expect(this.view.listenToOnce).toHaveBeenCalledWith(subview2, 'dispose', this.view.$closeSubView);
      expect(this.view.$subviews[cid1]).toBe(subview1);
      expect(this.view.$subviews[cid2]).toBe(subview2);
    });

    it('should close subview', function() {
      var subview = new Backbone.CompositeView();
      var cid = subview.cid;
      this.view.$subviews[cid] = subview;

      spyOn(subview, 'remove').andCallThrough();
      var remove = subview.remove;

      this.view.$closeSubview(subview);

      expect(this.view.$subviews[cid]).not.toBeDefined();
      expect(this.view.stopListening).toHaveBeenCalledWith(subview);
      expect(remove).toHaveBeenCalled();
    });

    it('should close subview using cid', function() {
      var subview = new Backbone.CompositeView();
      var cid = subview.cid;
      this.view.$subviews[cid] = subview;

      spyOn(subview, 'remove').andCallThrough();
      var remove = subview.remove;

      this.view.$closeSubview(cid);

      expect(this.view.$subviews[cid]).not.toBeDefined();
      expect(this.view.stopListening).toHaveBeenCalledWith(subview);
      expect(remove).toHaveBeenCalled();
    });

    it('should close several subviews', function() {
      var subview1 = new Backbone.CompositeView();
      var subview2 = new Backbone.CompositeView();
      var subview3 = new Backbone.CompositeView();

      var cid1 = subview1.cid;
      var cid2 = subview2.cid;
      var cid3 = subview3.cid;

      this.view.$subviews[cid1] = subview1;
      this.view.$subviews[cid2] = subview2;
      this.view.$subviews[cid3] = subview3;

      spyOn(subview1, 'remove').andCallThrough();
      spyOn(subview2, 'remove').andCallThrough();
      spyOn(subview3, 'remove').andCallThrough();

      var remove1 = subview1.remove;
      var remove2 = subview2.remove;
      var remove3 = subview3.remove;

      this.view.$closeSubview(subview1, subview2);

      expect(this.view.$subviews[cid1]).not.toBeDefined();
      expect(this.view.$subviews[cid2]).not.toBeDefined();
      expect(this.view.$subviews[cid3]).toBeDefined();

      expect(this.view.stopListening).toHaveBeenCalledWith(subview1);
      expect(this.view.stopListening).toHaveBeenCalledWith(subview2);
      expect(this.view.stopListening).not.toHaveBeenCalledWith(subview3);

      expect(remove1).toHaveBeenCalled();
      expect(remove2).toHaveBeenCalled();
      expect(remove3).not.toHaveBeenCalled();
    });

    it('should close all subviews', function() {
      var subview1 = new Backbone.CompositeView();
      var subview2 = new Backbone.CompositeView();
      var subview3 = new Backbone.CompositeView();

      var cid1 = subview1.cid;
      var cid2 = subview2.cid;
      var cid3 = subview3.cid;

      this.view.$subviews[cid1] = subview1;
      this.view.$subviews[cid2] = subview2;
      this.view.$subviews[cid3] = subview3;

      spyOn(subview1, 'remove').andCallThrough();
      spyOn(subview2, 'remove').andCallThrough();
      spyOn(subview3, 'remove').andCallThrough();

      var remove1 = subview1.remove;
      var remove2 = subview2.remove;
      var remove3 = subview3.remove;

      this.view.$closeSubviews();

      expect(this.view.$subviews[cid1]).not.toBeDefined();
      expect(this.view.$subviews[cid2]).not.toBeDefined();
      expect(this.view.$subviews[cid3]).not.toBeDefined();

      expect(this.view.stopListening).toHaveBeenCalledWith(subview1);
      expect(this.view.stopListening).toHaveBeenCalledWith(subview2);
      expect(this.view.stopListening).toHaveBeenCalledWith(subview3);

      expect(remove1).toHaveBeenCalled();
      expect(remove2).toHaveBeenCalled();
      expect(remove3).toHaveBeenCalled();
    });

    it('should get number of subviews', function() {
      var subview1 = new Backbone.CompositeView();
      var subview2 = new Backbone.CompositeView();
      var subview3 = new Backbone.CompositeView();

      var cid1 = subview1.cid;
      var cid2 = subview2.cid;
      var cid3 = subview3.cid;

      this.view.$subviews[cid1] = subview1;
      this.view.$subviews[cid2] = subview2;
      this.view.$subviews[cid3] = subview3;

      var $size = this.view.$size();

      expect($size).toBe(3);
    });

    it('should close subviews when view is disposed', function() {
      var subview1 = new Backbone.CompositeView();
      var subview2 = new Backbone.CompositeView();
      var subview3 = new Backbone.CompositeView();

      var cid1 = subview1.cid;
      var cid2 = subview2.cid;
      var cid3 = subview3.cid;

      this.view.$subviews[cid1] = subview1;
      this.view.$subviews[cid2] = subview2;
      this.view.$subviews[cid3] = subview3;

      this.view.dispose();

      expect(this.view.$closeSubviews).toHaveBeenCalled();
      expect(this.view.trigger).toHaveBeenCalledWith('dispose', this.view);
    });

    it('should remove attached subviews', function() {
      var subview1 = new Backbone.CompositeView();
      var subview2 = new Backbone.CompositeView();
      var subview3 = new Backbone.CompositeView();

      var cid1 = subview1.cid;
      var cid2 = subview2.cid;
      var cid3 = subview3.cid;

      this.view.$subviews[cid1] = subview1;
      this.view.$subviews[cid2] = subview2;

      // Attach subview on view
      this.view.subview3 = subview3;

      spyOn(subview1, 'remove').andCallThrough();
      spyOn(subview2, 'remove').andCallThrough();
      spyOn(subview3, 'remove').andCallThrough();

      var remove1 = subview1.remove;
      var remove2 = subview2.remove;
      var remove3 = subview3.remove;

      this.view.dispose();

      expect(this.view.$subviews[cid1]).not.toBeDefined();
      expect(this.view.$subviews[cid2]).not.toBeDefined();
      expect(this.view.subview3).toBe(null);

      expect(this.view.stopListening).toHaveBeenCalledWith(subview1);
      expect(this.view.stopListening).toHaveBeenCalledWith(subview2);
      expect(this.view.stopListening).toHaveBeenCalledWith(subview3);

      expect(remove1).toHaveBeenCalled();
      expect(remove2).toHaveBeenCalled();
      expect(remove3).toHaveBeenCalled();
    });

    it('should read a subview from DOM without options', function() {
      var el = '' +
        '<div>' +
        '  <div class="subview">Subview 1</div>' +
        '  <div class="subview">Subview 1</div>' +
        '</div>';

      var $el = $(el);

      this.view.setElement($el);

      this.view.$readSubview('.subview', Backbone.CompositeView);

      expect(this.view.$subviews).not.toEqual({});
      expect(_.size(this.view.$subviews)).toBe(2);

      var keys = _.keys(this.view.$subviews);

      var subview1 = this.view.$subviews[keys[0]];
      expect(subview1 instanceof Backbone.CompositeView).toBe(true);
      expect(subview1.$el).toBeDefined();

      var subview2 = this.view.$subviews[keys[1]];
      expect(subview2 instanceof Backbone.CompositeView).toBe(true);
      expect(subview2.$el).toBeDefined();
    });

    it('should read a subview from DOM with options', function() {
      var el = '' +
        '<div>' +
        '  <div class="subview">Subview 1</div>' +
        '  <div class="subview">Subview 1</div>' +
        '</div>';

      var $el = $(el);

      this.view.setElement($el);

      this.view.$readSubview('.subview', Backbone.CompositeView, {
        foo: 'bar'
      });

      expect(this.view.$subviews).not.toEqual({});
      expect(_.size(this.view.$subviews)).toBe(2);

      var keys = _.keys(this.view.$subviews);

      var subview1 = this.view.$subviews[keys[0]];
      expect(subview1 instanceof Backbone.CompositeView).toBe(true);
      expect(subview1.$el).toBeDefined();
      expect(subview1.foo).toBe('bar');

      var subview2 = this.view.$subviews[keys[1]];
      expect(subview2 instanceof Backbone.CompositeView).toBe(true);
      expect(subview2.$el).toBeDefined();
      expect(subview2.foo).toBe('bar');
    });

    it('should read a subview from DOM with clone of options', function() {
      var el = '' +
        '<div>' +
        '  <div class="subview">Subview 1</div>' +
        '  <div class="subview">Subview 1</div>' +
        '</div>';

      var $el = $(el);

      this.view.setElement($el);

      var options = {
        foo: 'bar'
      };

      this.view.$readSubview('.subview', Backbone.CompositeView, options);

      expect(options.el).not.toBeDefined();
    });

    it('should read a subview from DOM with options as a function', function() {
      var el = '' +
        '<div>' +
        '  <div class="subview">Subview 1</div>' +
        '  <div class="subview">Subview 1</div>' +
        '</div>';

      var $el = $(el);

      this.view.setElement($el);

      var viewOptions = jasmine.createSpy('options').andCallFake(function() {
        return {
          foo: 'bar'
        };
      });

      var result = this.view.$readSubview('.subview', Backbone.CompositeView, viewOptions);

      expect(result).toBe(this.view);
      expect(this.view.$subviews).not.toEqual({});
      expect(_.size(this.view.$subviews)).toBe(2);

      var keys = _.keys(this.view.$subviews);

      var subview1 = this.view.$subviews[keys[0]];
      expect(subview1 instanceof Backbone.CompositeView).toBe(true);
      expect(subview1.$el).toBeDefined();
      expect(subview1.foo).toBe('bar');

      var subview2 = this.view.$subviews[keys[1]];
      expect(subview2 instanceof Backbone.CompositeView).toBe(true);
      expect(subview2.$el).toBeDefined();
      expect(subview2.foo).toBe('bar');

      expect(viewOptions).toHaveBeenCalled();
      expect(viewOptions.callCount).toBe(2);
      expect(viewOptions).toHaveBeenCalledWith(0, jasmine.any(Object));
      expect(viewOptions).toHaveBeenCalledWith(1, jasmine.any(Object));
    });

    it('should read a subview from DOM with options as a function and clone options', function() {
      var el = '' +
        '<div>' +
        '  <div class="subview">Subview 1</div>' +
        '  <div class="subview">Subview 1</div>' +
        '</div>';

      var $el = $(el);

      this.view.setElement($el);

      var defaults = {
        foo: 'bar'
      };

      var viewOptions = jasmine.createSpy('options').andCallFake(function(idx) {
        return _.defaults({
          idx: idx
        }, defaults);
      });

      var result = this.view.$readSubview('.subview', Backbone.CompositeView, viewOptions);

      expect(defaults.idx).not.toBeDefined();
    });

    it('should append subview', function() {
      var subview = new Backbone.CompositeView();
      var $elSubview = $('<span></span>').text('Hello World');
      subview.setElement($elSubview);

      var result = this.view.append(subview);

      expect(result).toBe(this.view);
      expect(this.view.$subviews).not.toEqual({});
      expect(_.size(this.view.$subviews)).toBe(1);

      var keys = _.keys(this.view.$subviews);

      var subview1 = this.view.$subviews[keys[0]];
      expect(subview1).toBe(subview);
      expect(this.view.$el.text()).toBe('Hello World');
    });

    it('should append subview', function() {
      var subview = new Backbone.CompositeView();
      var $elSubview = $('<span></span>').text('Subview');
      subview.setElement($elSubview);

      var $foo = $('<div>').attr('id', 'foo').text('Hello World');
      var $el = $('<div>').append($foo);
      this.view.setElement($el);

      var result = this.view.append(subview, '#foo');

      expect(result).toBe(this.view);
      expect(this.view.$subviews).not.toEqual({});
      expect(_.size(this.view.$subviews)).toBe(1);

      var keys = _.keys(this.view.$subviews);

      var subview1 = this.view.$subviews[keys[0]];
      expect(subview1).toBe(subview);
      expect(this.view.$el.text()).toBe('Hello WorldSubview');
      expect($foo.text()).toBe('Hello WorldSubview');
    });

    it('should append a view associated to given model', function() {
      var model = new Backbone.Model({
        id: 1
      });

      var result = this.view.appendModel(model, Backbone.CompositeView);

      expect(result).toBe(this.view);
      expect(this.view.$subviews).not.toEqual({});
      expect(_.size(this.view.$subviews)).toBe(1);

      var keys = _.keys(this.view.$subviews);

      var subview1 = this.view.$subviews[keys[0]];
      expect(subview1.model).toBe(model);
    });

    it('should append a view associated to given model with options as a function', function() {
      var model = new Backbone.Model({
        id: 1
      });

      var options = jasmine.createSpy('options').andCallFake(function(model) {
        return {
          foo: model
        };
      });

      var result = this.view.appendModel(model, Backbone.CompositeView, options);

      expect(result).toBe(this.view);
      expect(this.view.$subviews).not.toEqual({});
      expect(_.size(this.view.$subviews)).toBe(1);

      var keys = _.keys(this.view.$subviews);

      var subview1 = this.view.$subviews[keys[0]];
      expect(subview1.foo).toBe(model);
      expect(subview1.model).not.toBeDefined();
      expect(options).toHaveBeenCalledWith(model);
    });

    it('should append a view associated to given collection', function() {
      var model1 = new Backbone.Model({
        id: 1
      });

      var model2 = new Backbone.Model({
        id: 2
      });

      var collection = new Backbone.Collection([model1, model2]);

      var result = this.view.appendCollection(collection, Backbone.CompositeView);

      expect(result).toBe(this.view);
      expect(this.view.$subviews).not.toEqual({});
      expect(_.size(this.view.$subviews)).toBe(2);
    });

    it('should append a view associated to given collection using given options', function() {
      var model1 = new Backbone.Model({
        id: 1
      });

      var model2 = new Backbone.Model({
        id: 2
      });

      var options = jasmine.createSpy('options').andCallFake(function(model) {
        return {
          foo: model
        };
      });

      var collection = new Backbone.Collection([model1, model2]);

      var result = this.view.appendCollection(collection, Backbone.CompositeView, options);

      expect(result).toBe(this.view);
      expect(this.view.$subviews).not.toEqual({});
      expect(_.size(this.view.$subviews)).toBe(2);
      expect(options).toHaveBeenCalledWith(model1);
      expect(options).toHaveBeenCalledWith(model2);
    });
  });

  describe('Render', function() {
    beforeEach(function() {
      spyOn($.fn, 'empty').andCallThrough();
      spyOn($.fn, 'html').andCallThrough();

      spyOn(Backbone.CompositeView.prototype, '$clear').andCallThrough();
      spyOn(Backbone.CompositeView.prototype, '$closeSubviews').andCallThrough();
      spyOn(Backbone.CompositeView.prototype, 'preRender').andCallThrough();
      spyOn(Backbone.CompositeView.prototype, 'trigger').andCallThrough();
      spyOn(Backbone.CompositeView.prototype, 'toHTML').andCallThrough();
      spyOn(Backbone.CompositeView.prototype, '$populate').andCallThrough();
      spyOn(Backbone.CompositeView.prototype, '$partials').andCallThrough();
      spyOn(Backbone.remoteTemplateManager, 'load').andCallThrough();
      spyOn(Backbone, '$compile').andCallThrough();
    });

    it('should render an empty view', function() {
      var view = new Backbone.CompositeView();

      var result = view.render();

      expect(result.$el.empty).toHaveBeenCalled();
    });

    it('should render a single template', function() {
      var view = new Backbone.CompositeView({
        templates: 'foo'
      });

      var result = view.render();

      expect(view.tmplManager.load).toHaveBeenCalledWith('foo', view.$loaded, view);
    });

    it('should render an array of templates', function() {
      var view = new Backbone.CompositeView({
        templates: ['foo', 'bar']
      });

      var result = view.render();

      expect(view.tmplManager.load).toHaveBeenCalledWith(['foo', 'bar'], view.$loaded, view);
    });

    it('should render a single template that is a function', function() {
      var view = new Backbone.CompositeView({
        templates: function() {
          return 'foo';
        }
      });

      var result = view.render();

      expect(view.tmplManager.load).toHaveBeenCalledWith('foo', view.$loaded, view);
    });

    it('should compile view', function() {
      var view = new Backbone.CompositeView();

      var data = {
        id: 1
      };

      var partials = {
        'bar': 'bar html'
      };

      view.$compile('foo', data, partials);

      expect(Backbone.$compile).toHaveBeenCalledWith('foo', data, partials);
    });

    it('should serialize view to html', function() {
      var data = {
        id: 1
      };

      var partials = {
        'bar': 'bar html'
      };

      var view = new Backbone.CompositeView({
        toJSON: data
      });

      var html = view.toHTML('foo', partials);

      expect(Backbone.$compile).toHaveBeenCalledWith('foo', data, partials);
      expect(html).toBe('foo');
    });

    it('should serialize view to html using a toJSON function', function() {
      var data = {
        id: 1
      };

      var partials = {
        'bar': 'bar html'
      };

      var view = new Backbone.CompositeView({
        toJSON: function() {
          return data;
        }
      });

      var html = view.toHTML('foo', partials);

      expect(Backbone.$compile).toHaveBeenCalledWith('foo', data, partials);
      expect(html).toBe('foo');
    });

    it('should transform partials', function() {
      var view = new Backbone.CompositeView();

      var templates = {
        'foo/foo': 'foo html',
        'foo/bar': 'bar html'
      };

      var results = view.$partials(templates);

      expect(results).toEqual({
        foo: 'foo html',
        bar: 'bar html'
      });
    });

    it('should populate view when template is loaded', function() {
      var view = new Backbone.CompositeView();

      view.$loaded('foo');

      expect(view.$populate).toHaveBeenCalledWith('foo');
      expect(view.$partials).not.toHaveBeenCalled();
    });

    it('should populate view with partials when templates are loaded', function() {
      var view = new Backbone.CompositeView({
        templates: ['foo', 'bar']
      });

      var templates = {
        foo: 'foo html',
        bar: 'bar html'
      };

      view.$loaded(templates);

      expect(view.$populate).toHaveBeenCalledWith('foo html', templates);
      expect(view.$partials).toHaveBeenCalledWith(templates);
    });

    it('should populate view with partials and custom partials when templates are loaded', function() {
      var view = new Backbone.CompositeView({
        templates: ['foo', 'bar'],

        partials: {
          quix: 'quix html'
        }
      });

      var templates = {
        foo: 'foo html',
        bar: 'bar html'
      };

      view.$loaded(templates);

      expect(view.$populate).toHaveBeenCalledWith('foo html', {
        foo: 'foo html',
        bar: 'bar html',
        quix: 'quix html'
      });

      expect(view.$partials).toHaveBeenCalledWith(templates);
    });

    it('should populate view', function() {
      var view = new Backbone.CompositeView();
      spyOn(view, '$hideLoader');

      var templates = 'foo';

      var result = view.$populate(templates);

      expect(result).toBe(view);
      expect(view.$clear).toHaveBeenCalled();
      expect(view.$closeSubviews).toHaveBeenCalled();
      expect(view.toHTML).toHaveBeenCalledWith(templates);
      expect(view.preRender).toHaveBeenCalled();
      expect(view.onRendered).toHaveBeenCalled();
      expect(view.$hideLoader).toHaveBeenCalled();
      expect(view.onRendered).toHaveBeenCalled();
      expect(view.trigger).toHaveBeenCalledWith('render:start', view);
      expect(view.$el.html).toHaveBeenCalledWith('foo');
    });
  });
});