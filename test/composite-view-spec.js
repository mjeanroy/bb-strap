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
  });

  it('should initialize a composite view without options', function() {
    var view = new Backbone.CompositeView();

    expect(view.$cache).toEqual({});
    expect(view.$subviews).toEqual({});
    expect(view.setSubscriptions).toHaveBeenCalled();
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
  });
});