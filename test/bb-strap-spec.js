describe("Backbone-Strap Test Suite", function() {

  beforeEach(function() {
    this.xhr = jasmine.createSpyObj('xhr', ['done']);
    spyOn($, 'get').andReturn(this.xhr);
    spyOn($.fn, 'addClass').andCallThrough();
    spyOn($.fn, 'removeClass').andCallThrough();
  });

  beforeEach(function() {
    Backbone.Mediator.channels = {};
  });

  afterEach(function() {
    Backbone.templateManager.$cache = {};
  });

  describe("TemplateManager Test Suite", function() {
    it("should have a template manager", function() {
      // WHEN
      var tmplManager = Backbone.templateManager;

      // THEN
      expect(tmplManager).toBeDefined();
      expect(tmplManager.$cache).toEqual({});
      expect(tmplManager.prefix).toBe('/templates/');
      expect(tmplManager.suffix).toBe('.template.html');
    });

    it("should have an empty cache, a prefix and a suffix", function() {
      // WHEN
      var tmplManager = Backbone.templateManager;

      // THEN
      expect(tmplManager.$cache).toEqual({});
      expect(tmplManager.prefix).toEqual('/templates/');
      expect(tmplManager.suffix).toEqual('.template.html');
    });

    it("should build template url", function() {
      // GIVEN
      var tmplManager = Backbone.templateManager;

      // WHEN
      var url = tmplManager.url('foo');

      // THEN
      expect(url).toBe('/templates/foo.template.html');
    });

    it("should build template id from url", function() {
      // GIVEN
      var tmplManager = Backbone.templateManager;

      // WHEN
      var id = tmplManager.id('/templates/foo.template.html');

      // THEN
      expect(id).toBe('foo');
    });

    it("should load template only once", function() {
      // GIVEN
      var callback = jasmine.createSpy('callback');
      var tmplManager = Backbone.templateManager;

      // WHEN
      tmplManager.load('foo', callback);

      // THEN
      expect(tmplManager.$cache['foo']).toBeDefined();
      expect($.get).toHaveBeenCalledWith('/templates/foo.template.html');
      expect(this.xhr.done).toHaveBeenCalled();
      expect(callback).not.toHaveBeenCalled();

      this.xhr.done.argsForCall[0][0]('foo result');
      expect(callback).toHaveBeenCalledWith('foo result');

      // call again
      callback.reset();
      $.get.reset();

      tmplManager.load('foo', callback);

      expect(callback).not.toHaveBeenCalled();
      expect($.get).not.toHaveBeenCalled();

      this.xhr.done.argsForCall[0][0]('foo result');
      expect(callback).toHaveBeenCalled();
    });

    it("should load an array of templates only once", function() {
      // GIVEN
      var tmplManager = Backbone.templateManager;
      var callback = jasmine.createSpy('callback');

      // WHEN
      tmplManager.loads(['foo', 'bar'], callback);

      // THEN
      expect(tmplManager.$cache['foo']).toBeDefined();
      expect(tmplManager.$cache['bar']).toBeDefined();

      expect($.get).toHaveBeenCalledWith('/templates/foo.template.html');
      expect($.get).toHaveBeenCalledWith('/templates/bar.template.html');

      this.xhr.url = '/templates/foo.template.html';
      this.xhr.done.argsForCall[0][0].call(this.xhr, 'foo result');
      expect(callback).not.toHaveBeenCalled();

      this.xhr.url = '/templates/bar.template.html';
      this.xhr.done.argsForCall[1][0].call(this.xhr, 'bar result');
      expect(callback).toHaveBeenCalledWith({
        'foo': 'foo result',
        'bar': 'bar result'
      });
    });
  });

  describe("Backbone.Mediator Test Suite", function() {
    it("should have a mediator initialized", function() {
      // WHEN
      var defaultsChannels = Backbone.Mediator.channels;

      // THEN
      expect(defaultsChannels).toEqual({});
    });

    it("should subscribe to a new channel", function() {
      // GIVEN
      var fn = jasmine.createSpy('fn');
      var context = fn;

      // WHEN
      var result = Backbone.Mediator.subscribe("foo", fn, fn);

      // THEN
      expect(result).toBe(Backbone.Mediator);
      expect(Backbone.Mediator.channels['foo']).toBeDefined();
      expect(Backbone.Mediator.channels['foo']).toEqual([
        {
          fn: fn,
          context: context,
          once: false
        }
      ]);
    });

    it("should clear subscriptions", function() {
      // GIVEN
      Backbone.Mediator.channels['foo'] = [
        {
          fn: jasmine.any(Function),
          context: jasmine.any(Function),
          once: false
        }
      ];

      // WHEN
      var result = Backbone.Mediator.clear();

      // THEN
      expect(result).toBe(Backbone.Mediator);
      expect(Backbone.Mediator.channels).toEqual({});
    });

    it("should subscribe twice to a new channel", function() {
      // GIVEN
      var fn1 = jasmine.createSpy('fn1');
      var fn2 = jasmine.createSpy('fn2');
      Backbone.Mediator.subscribe("foo", fn1, fn1);

      // WHEN
      Backbone.Mediator.subscribe("foo", fn2, fn2);

      // THEN
      expect(Backbone.Mediator.channels['foo']).toBeDefined();
      expect(Backbone.Mediator.channels['foo']).toEqual([
        { fn: fn1, context: fn1, once: false },
        { fn: fn2, context: fn2, once: false }
      ]);
    });

    it("should unsubscribe to channel", function() {
      // GIVEN
      var fn1 = jasmine.createSpy('fn1');
      Backbone.Mediator.channels['foo'] = [
        {
          fn: fn1,
          context: fn1,
          once: false
        }
      ];

      // WHEN
      var result = Backbone.Mediator.unsubscribe('foo');

      // THEN
      expect(result).toBe(Backbone.Mediator);
      expect(Backbone.Mediator.channels['foo']).toEqual([]);
    });

    it("should unsubscribe everything if no argument is given", function() {
      // GIVEN
      var fn1 = jasmine.createSpy('fn1');
      Backbone.Mediator.channels['foo'] = [
        {
          fn: fn1,
          context: fn1,
          once: false
        }
      ];

      // WHEN
      var result = Backbone.Mediator.unsubscribe();

      // THEN
      expect(result).toBe(Backbone.Mediator);
      expect(Backbone.Mediator.channels).toEqual({});
    });

    it("should unsubscribe a function of channel", function() {
      // GIVEN
      var fn1 = jasmine.createSpy('fn1');
      Backbone.Mediator.channels['foo'] = [
        {
          fn: fn1,
          context: fn1,
          once: false
        }
      ];

      // WHEN
      var result = Backbone.Mediator.unsubscribe('foo', fn1, fn1);

      // THEN
      expect(result).toBe(Backbone.Mediator);
      expect(Backbone.Mediator.channels['foo']).toEqual([]);
    });

    it("should unsubscribe a function of channel and keep others", function() {
      // GIVEN
      var fn1 = jasmine.createSpy('fn1');
      var fn2 = jasmine.createSpy('fn2');

      Backbone.Mediator.channels['foo'] = [
        {
          fn: fn1,
          context: fn1,
          once: false
        },
        {
          fn: fn2,
          context: fn2,
          once: false
        }
      ];

      // WHEN
      var result = Backbone.Mediator.unsubscribe('foo', fn2, fn2);

      // THEN
      expect(result).toBe(Backbone.Mediator);
      expect(Backbone.Mediator.channels['foo']).toEqual([{
        fn: fn1,
        context: fn1,
        once: false
      }]);
    });

    it("should publish to dedicated channels", function() {
      // GIVEN
      var fn1 = jasmine.createSpy('fn1');
      var fn2 = jasmine.createSpy('fn2');

      Backbone.Mediator.channels['foo'] = [
        {
          fn: fn1,
          context: fn1,
          once: false
        },
        {
          fn: fn2,
          context: fn2,
          once: false
        }
      ];

      // WHEN
      var result = Backbone.Mediator.publish('foo', 1, 2);

      // THEN
      expect(result).toBe(Backbone.Mediator);
      expect(fn1).toHaveBeenCalledWith(1, 2);
      expect(fn2).toHaveBeenCalledWith(1, 2);
    });

    it("should publish to dedicated channels and remove callbacks that subscribed once", function() {
      // GIVEN
      var fn1 = jasmine.createSpy('fn1');
      var fn2 = jasmine.createSpy('fn2');

      Backbone.Mediator.channels['foo'] = [
        {
          fn: fn1,
          context: fn1,
          once: false
        },
        {
          fn: fn2,
          context: fn2,
          once: true
        }
      ];

      // WHEN
      var result = Backbone.Mediator.publish('foo', 1, 2);

      // THEN
      expect(result).toBe(Backbone.Mediator);
      expect(fn1).toHaveBeenCalledWith(1, 2);
      expect(fn2).toHaveBeenCalledWith(1, 2);
      expect(Backbone.Mediator.channels['foo']).toEqual([{
        fn: fn1,
        context: fn1,
        once: false
      }]);
    });

    it("should subscribed once", function() {
      // GIVEN
      var fn1 = jasmine.createSpy('fn1');
      Backbone.Mediator.channels['foo'] = [];

      // WHEN
      var result = Backbone.Mediator.subscribeOnce('foo', fn1, fn1);

      // THEN
      expect(result).toBe(Backbone.Mediator);
      expect(Backbone.Mediator.channels['foo']).toEqual([{
        fn: fn1,
        context: fn1,
        once: true
      }]);
    });

    it("should have shortcuts to publish function", function() {
      expect(Backbone.Mediator.pub).toBe(Backbone.Mediator.publish);
    });

    it("should have shortcuts to subscribe function", function() {
      expect(Backbone.Mediator.sub).toBe(Backbone.Mediator.subscribe);
    });
  });

  describe("App Test Suite", function() {
    afterEach(function() {
      delete window.app;
    });

    it("should initialize app object", function() {
      // GIVEN
      spyOn(Backbone.App.prototype, 'preInit').andCallThrough();
      spyOn(Backbone.App.prototype, 'onInit').andCallThrough();

      // WHEN
      var app = new Backbone.App();

      // THEN
      expect(window.app).toBe(app);
      expect(app.preInit).toHaveBeenCalled();
      expect(app.onInit).toHaveBeenCalled();

      expect(app.$window).toBeDefined();
      expect(app.$body).toBeDefined();
      expect(app.$html).toBeDefined();

      expect(app.$html.addClass).toHaveBeenCalledWith('js');
      expect(app.$html.removeClass).toHaveBeenCalledWith('no-js');

      expect(app.events).toBeDefined();
      expect(app.events['click .js-link']).toEqual('nav');

      expect(app.views).toEqual({});
      expect(app.router).toBe(null);
    });

    it("should navigate when user click on a link", function() {
      // GIVEN
      var e = jasmine.createSpyObj('Event', ['preventDefault']);
      e.currentTarget = $('<a href="http://localhost/foo"/>');

      var app = new Backbone.App();
      app.url = 'http://localhost';
      app.router = jasmine.createSpyObj('router', ['navigate']);

      // WHEN
      var result = app.nav(e);

      // THEN
      expect(result).toBe(app);
      expect(e.preventDefault).toHaveBeenCalled();
      app.navigate('http://localhost/foo');
      expect(app.router.navigate).toHaveBeenCalledWith('/foo', {
        trigger: true
      });
    });

    it("should navigate", function() {
      // GIVEN
      var app = new Backbone.App();
      app.url = 'http://localhost';
      app.router = jasmine.createSpyObj('router', ['navigate']);

      // WHEN
      var result = app.navigate('http://localhost/foo');

      // THEN
      expect(result).toBe(app);
      expect(app.router.navigate).toHaveBeenCalledWith('/foo', {
        trigger: true
      });
    });

    it("should navigate and don't trigger events", function() {
      // GIVEN
      var app = new Backbone.App();
      app.url = 'http://localhost';
      app.router = jasmine.createSpyObj('router', ['navigate']);

      // WHEN
      var result = app.navigate('http://localhost/foo', false);

      // THEN
      expect(result).toBe(app);
      expect(app.router.navigate).toHaveBeenCalledWith('/foo', {
        trigger: false
      });
    });

    it("should add new view", function() {
      // GIVEN
      var app = new Backbone.App();

      var View = jasmine.createSpy('view');
      var opts = jasmine.createSpy('opts');

      // WHEN
      var result = app.replaceCurrentView(View);

      // THEN
      expect(result).toBe(app);
      expect(app.views.current).toBeDefined();
      expect(app.views.current instanceof View).toBe(true);
    });

    it("should replace current view", function() {
      // GIVEN
      var app = new Backbone.App();

      var oldView = jasmine.createSpyObj('oldView', ['clear']);
      app.views.current = oldView;

      var View = jasmine.createSpy('view');
      var opts = jasmine.createSpy('opts');

      // WHEN
      var result = app.replaceCurrentView(View);

      // THEN
      expect(result).toBe(app);
      expect(oldView.clear).toHaveBeenCalled();
      expect(app.views.current).toBeDefined();
      expect(app.views.current instanceof View).toBe(true);
    });

    it("should initialize scroll top", function() {
      // GIVEN
      var app = new Backbone.App();
      spyOn(app.$window, 'scrollTop');

      // WHEN
      app.scrollTop();

      // THEN
      expect(app.$window.scrollTop).toHaveBeenCalledWith(0);
    });

    it("should initialize scroll top with y value", function() {
      // GIVEN
      var app = new Backbone.App();
      spyOn(app.$window, 'scrollTop');

      // WHEN
      var result = app.scrollTop(10);

      // THEN
      expect(result).toBe(app);
      expect(app.$window.scrollTop).toHaveBeenCalledWith(10);
    });
  });

  describe("Router Test Suite", function() {
    beforeEach(function() {
      spyOn(Backbone.history, 'start');
    });

    it("should initialize router with default options", function() {
      // WHEN
      var router = new Backbone.StrapRouter();

      // THEN
      expect(router.$content).toBeDefined();
      expect(router.$content instanceof jQuery).toBe(true);
      expect(router.$content.selector).toBe('#content');

      expect(Backbone.history.start).toHaveBeenCalledWith({
        silent: false,
        pushState: true
      });
    });

    it("should initialize router with custom options", function() {
      // WHEN
      var router = new Backbone.StrapRouter({
        content: '#foo',
        silent: true,
        pushState: false
      });

      // THEN
      expect(router.$content).toBeDefined();
      expect(router.$content instanceof jQuery).toBe(true);
      expect(router.$content.selector).toBe('#foo');

      expect(Backbone.history.start).toHaveBeenCalledWith({
        silent: true,
        pushState: false
      });
    });

    it("should show new view", function() {
      // GIVEN
      window.app = jasmine.createSpyObj('app', ['replaceCurrentView', 'scrollTop']);
      window.app.replaceCurrentView.andReturn(window.app);
      window.app.scrollTop.andReturn(window.app);

      var router = new Backbone.StrapRouter();

      var ViewImpl = jasmine.createSpy('ViewImpl');

      // WHEN
      router.show(ViewImpl);

      // THEN
      expect(window.app.replaceCurrentView).toHaveBeenCalled();
      expect(window.app.scrollTop).toHaveBeenCalled();

      var args = window.app.replaceCurrentView.mostRecentCall.args;
      expect(args[0]).toBe(ViewImpl);
      expect(args[1]).toEqual({
        el: router.$content
      });
    });

    it("should show new view with options", function() {
      // GIVEN
      window.app = jasmine.createSpyObj('app', ['replaceCurrentView', 'scrollTop']);
      window.app.replaceCurrentView.andReturn(window.app);
      window.app.scrollTop.andReturn(window.app);

      var router = new Backbone.StrapRouter();

      var ViewImpl = jasmine.createSpy('ViewImpl');
      var opts = {
        foo: 'bar'
      };

      // WHEN
      router.show(ViewImpl, opts);

      // THEN
      expect(window.app.replaceCurrentView).toHaveBeenCalled();
      expect(window.app.scrollTop).toHaveBeenCalled();

      var args = window.app.replaceCurrentView.mostRecentCall.args;
      expect(args[0]).toBe(ViewImpl);
      expect(args[1]).toEqual({
        foo: 'bar',
        el: router.$content
      });
    });
  });

  describe("StrapView Test Suite", function() {

    it("should initialize view with given options", function() {
      // GIVEN
      var opts = {
        foo: 'bar'
      };

      // WHEN
      var view = new Backbone.StrapView(opts);

      // THEN
      expect(view.foo).toBe('bar');
      expect(view.$cache).toEqual({});
      expect(view.$subviews).toEqual({});
      expect(view.templateManager).toBe(Backbone.templateManager);
    });

    it("should initialize an empty view", function() {
      // GIVEN
      spyOn(Backbone.StrapView.prototype, 'initialize').andCallThrough();
      spyOn(Backbone.StrapView.prototype, 'onInit').andCallThrough();
      spyOn(Backbone.StrapView.prototype, 'postInit').andCallThrough();
      spyOn(Backbone.StrapView.prototype, 'onReady').andCallThrough();
      spyOn(Backbone.StrapView.prototype, 'isEmpty').andCallThrough();
      spyOn(Backbone.StrapView.prototype, 'render').andCallThrough();

      // WHEN
      var view = new Backbone.StrapView();

      // THEN
      expect(view.$cache).toEqual({});
      expect(view.$subviews).toEqual({});

      expect(view.initialize).toHaveBeenCalled();
      expect(view.onInit).toHaveBeenCalled();
      expect(view.postInit).toHaveBeenCalled();
      expect(view.isEmpty).toHaveBeenCalled();
      expect(view.render).toHaveBeenCalled();
      expect(view.onReady).not.toHaveBeenCalled();
    });

    it("should initialize a view that is already rendered", function() {
      // GIVEN
      spyOn(Backbone.StrapView.prototype, 'initialize').andCallThrough();
      spyOn(Backbone.StrapView.prototype, 'onInit').andCallThrough();
      spyOn(Backbone.StrapView.prototype, 'postInit').andCallThrough();
      spyOn(Backbone.StrapView.prototype, 'onReady').andCallThrough();
      spyOn(Backbone.StrapView.prototype, 'isEmpty').andReturn(false);
      spyOn(Backbone.StrapView.prototype, 'render').andCallThrough();

      // WHEN
      var view = new Backbone.StrapView();

      // THEN
      expect(view.$cache).toEqual({});
      expect(view.$subviews).toEqual({});

      expect(view.initialize).toHaveBeenCalled();
      expect(view.onInit).toHaveBeenCalled();
      expect(view.onReady).toHaveBeenCalled();
      expect(view.isEmpty).toHaveBeenCalled();
      expect(view.postInit).not.toHaveBeenCalled();
      expect(view.render).not.toHaveBeenCalled();
    });

    it("should return true if view is empty", function() {
      // GIVEN
      var view = new Backbone.StrapView();
      view.$el.html('');

      // WHEN
      var isEmpty = view.isEmpty();

      // THEN
      expect(isEmpty).toBe(true);
    });

    it("should return false if view is empty", function() {
      // GIVEN
      var view = new Backbone.StrapView();
      view.$el.html('hello world');

      // WHEN
      var isEmpty = view.isEmpty();

      // THEN
      expect(isEmpty).toBe(false);
    });

    it("should add selector in internal cache", function() {
      // GIVEN
      var view = new Backbone.StrapView();
      view.$cache = {};
      spyOn(view, '$').andCallThrough();

      // WHEN
      view.$c('#foo');

      // THEN
      expect(view.$).toHaveBeenCalled();
      expect(view.$cache['#foo']).toBeDefined();

      view.$.reset();
      view.$c('#foo');
      expect(view.$).not.toHaveBeenCalled();
      expect(view.$cache['#foo']).toBeDefined();
    });

    it("should clear selector cache", function() {
      // GIVEN
      var view = new Backbone.StrapView();
      view.$cache = {
        '#foo': $('<span></span>')
      };

      // WHEN
      var result = view.$clear();

      // THEN
      expect(result).toBe(view);
    });

    it("should dispose view", function() {
      // GIVEN
      var view = new Backbone.StrapView();
      view.$cache['#foo'] = $('<div></div>');

      spyOn(view, 'onDispose').andCallThrough();
      spyOn(view, '$clear').andCallThrough();
      spyOn(view, 'closeSubviews').andCallThrough();
      spyOn(view, 'stopListening').andCallThrough();
      spyOn(view, 'undelegateEvents').andCallThrough();
      spyOn(view, 'destroy').andCallThrough();

      // WHEN
      var result = view.dispose();

      // THEN
      expect(result).toBe(view);
      expect(view.$cache).toEqual({});
      expect(view.onDispose).toHaveBeenCalled();
      expect(view.$clear).toHaveBeenCalled();
      expect(view.closeSubviews).toHaveBeenCalled();
      expect(view.stopListening).toHaveBeenCalled();
      expect(view.undelegateEvents).toHaveBeenCalled();
      expect(view.destroy).not.toHaveBeenCalled();
    });

    it("should destroy internal data and close internal view", function() {
      // GIVEN
      var subview = new Backbone.StrapView();
      spyOn(subview, 'close');

      var view = new Backbone.StrapView();
      view.foo = 'bar';
      view.sub = subview;

      // WHEN
      var result = view.destroy();

      // THEN
      expect(result).toBe(view);
      expect(view.foo).toBe(null);
      expect(view.sub).toBe(null);
      expect(view.$subviews).toEqual({});
      expect(view.$cache).toEqual({});
      expect(subview.close).toHaveBeenCalled();
    });

    it("should add subview", function() {
      // GIVEN
      var view = new Backbone.StrapView();
      spyOn(view, 'listenToOnce').andCallThrough();
      spyOn(view, 'removeSubview').andCallThrough();

      var subview = new Backbone.StrapView();

      // WHEN
      var added = view.addSubview(subview);

      // THEN
      var cid = subview.cid;
      expect(view.$subviews).not.toEqual({});
      expect(view.$subviews[cid]).toBe(subview);
      expect(added).toBe(subview);

      expect(view.listenToOnce).toHaveBeenCalledWith(subview, 'close', view.removeSubview);

      subview.close();
      expect(view.removeSubview).toHaveBeenCalled();
      expect(view.$subviews[cid]).toBeUndefined();
      expect(view.$subviews).toEqual({});
    });

    it("should remove subview", function() {
      // GIVEN
      var view = new Backbone.StrapView();
      var subview = new Backbone.StrapView();

      spyOn(view, 'stopListening');

      var cid = subview.cid;
      view.$subviews[cid] = subview;

      // WHEN
      var result = view.removeSubview(subview);

      // THEN
      expect(result).toBe(view);
      expect(view.stopListening).toHaveBeenCalledWith(subview);
      expect(view.$subviews[cid]).toBeUndefined();
      expect(view.$subviews).toEqual({});
    });

    it("should add subviews", function() {
      // GIVEN
      var view = new Backbone.StrapView();
      var subview1 = new Backbone.StrapView();
      var subview2 = new Backbone.StrapView();

      // WHEN
      var added = view.addSubview([subview1, subview2]);

      // THEN
      var cid1 = subview1.cid;
      var cid2 = subview2.cid;
      expect(view.$subviews).not.toEqual({});
      expect(view.$subviews[cid1]).toBe(subview1);
      expect(view.$subviews[cid2]).toBe(subview2);
      expect(added.length).toBe(2);
      expect(added[0]).toBe(subview1);
      expect(added[1]).toBe(subview2);
    });

    it("should add subview from dom", function() {
      // GIVEN
      var $el1 = $('<div></div>').addClass('subview');
      var $el2 = $('<div></div>').addClass('subview');
      var $el = $('<div></div>').append($el1).append($el2);

      var view = new Backbone.StrapView({
        el: $el
      });

      expect(view.$subviews).toEqual({});

      // WHEN
      var added = view.$addSubview('.subview', Backbone.StrapView, {
        foo: 'bar'
      });

      // THEN
      expect(added).toBeDefined();
      expect(added.length).toBe(2);
      expect(added[0] instanceof Backbone.StrapView).toBe(true);
      expect(added[1] instanceof Backbone.StrapView).toBe(true);
      expect(view.$subviews).not.toEqual({});

      var cids = _.keys(view.$subviews);
      expect(cids.length).toBe(2);

      var cid1 = cids[0];
      var cid2 = cids[1];
      expect(view.$subviews[cid1].foo).toBe('bar');
      expect(view.$subviews[cid1].$el).toBeDefined();
      expect(view.$subviews[cid1].$el.length).toBe(1);

      expect(view.$subviews[cid2].foo).toBe('bar');
      expect(view.$subviews[cid2].$el).toBeDefined();
      expect(view.$subviews[cid2].$el.length).toBe(1);
    });

    it("should add one subview from dom", function() {
      // GIVEN
      var $el1 = $('<div></div>').addClass('subview');
      var $el = $('<div></div>').append($el1);

      var view = new Backbone.StrapView({
        el: $el
      });

      // WHEN
      var added = view.$addSubview('.subview', Backbone.StrapView, {
        foo: 'bar'
      });

      // THEN
      expect(added).toBeDefined();
      expect(added instanceof Backbone.StrapView).toBe(true);
      expect(view.$subviews).not.toEqual({});

      var keys = _.keys(view.$subviews);
      expect(keys.length).toBe(1);

      var cid = keys[0];
      expect(view.$subviews[cid].foo).toBe('bar');
      expect(view.$subviews[cid].$el).toBeDefined();
      expect(view.$subviews[cid].$el.length).toBe(1);
      expect(view.$subviews[cid]).toBe(added);
    });

    it("should add subview from dom and execute parameter function", function() {
      // GIVEN
      var $el1 = $('<div></div>').addClass('subview');
      var $el2 = $('<div></div>').addClass('subview');
      var $el = $('<div></div>').append($el1).append($el2);

      var view = new Backbone.StrapView({
        el: $el
      });

      var fn = jasmine.createSpy('fn').andReturn({
        foo: 'bar'
      });

      // WHEN
      view.$addSubview('.subview', Backbone.StrapView, fn);

      // THEN
      expect(view.$subviews).not.toEqual({});
      expect(fn).toHaveBeenCalledWith(0, jasmine.any(Object));
      expect(fn).toHaveBeenCalledWith(1, jasmine.any(Object));

      var keys = _.keys(view.$subviews);
      expect(keys.length).toBe(2);

      var cid1 = keys[0];
      var cid2 = keys[1];
      expect(view.$subviews[cid1].foo).toBe('bar');
      expect(view.$subviews[cid1].$el).toBeDefined();
      expect(view.$subviews[cid1].$el.length).toBe(1);

      expect(view.$subviews[cid2].foo).toBe('bar');
      expect(view.$subviews[cid2].$el).toBeDefined();
      expect(view.$subviews[cid2].$el.length).toBe(1);
    });

    it("should add subview from dom without parameters", function() {
      // GIVEN
      var $el1 = $('<div></div>').addClass('subview');
      var $el2 = $('<div></div>').addClass('subview');
      var $el = $('<div></div>').append($el1).append($el2);

      var view = new Backbone.StrapView({
        el: $el
      });

      // WHEN
      view.$addSubview('.subview', Backbone.StrapView);

      // THEN
      expect(view.$subviews).not.toEqual({});

      var keys = _.keys(view.$subviews);
      expect(keys.length).toBe(2);

      var cid1 = keys[0];
      var cid2 = keys[1];
      expect(view.$subviews[cid1].$el).toBeDefined();
      expect(view.$subviews[cid1].$el.length).toBe(1);
      expect(view.$subviews[cid2].$el).toBeDefined();
      expect(view.$subviews[cid2].$el.length).toBe(1);
    });

    it("should close subviews", function() {
      // GIVEN
      var view = new Backbone.StrapView();
      spyOn(view, 'dispose');
      spyOn(view, 'remove');
      spyOn(view, 'destroy');

      var fn = jasmine.createSpy('fn');
      view.on('close', fn);

      // WHEN
      var result = view.close();

      // THEN
      expect(result).toBe(view);
      expect(view.dispose).toHaveBeenCalled();
      expect(view.remove).toHaveBeenCalled();
      expect(view.destroy).toHaveBeenCalled();
      expect(fn).toHaveBeenCalledWith(view);
    });

    it("should clear subviews", function() {
      // GIVEN
      var view = new Backbone.StrapView();
      view.$el = jasmine.createSpyObj('$el', ['empty']);
      spyOn(view, 'dispose');
      spyOn(view, 'remove');
      spyOn(view, 'destroy');

      var fn = jasmine.createSpy('fn');
      view.on('clear', fn);

      // WHEN
      var result = view.clear();

      // THEN
      expect(result).toBe(view);
      expect(view.dispose).toHaveBeenCalled();
      expect(view.remove).not.toHaveBeenCalled();
      expect(view.$el.empty).toHaveBeenCalled();
      expect(view.destroy).toHaveBeenCalled();
      expect(fn).toHaveBeenCalledWith(view);
    });

    it("should close subviews", function() {
      // GIVEN
      var subview1 = new Backbone.StrapView();
      spyOn(subview1, 'close');
      subview1.cid = 'foo';

      var subview2 = new Backbone.StrapView();
      spyOn(subview2, 'close');
      subview2.cid = 'bar';

      var subview3 = new Backbone.StrapView();
      spyOn(subview3, 'close');

      var view = new Backbone.StrapView();
      view.$subviews = {
        foo: subview1,
        bar: subview2
      };
      view.subview3 = subview3;

      spyOn(view, 'stopListening');

      // WHEN
      var result = view.closeSubviews();

      // THEN
      expect(result).toBe(view);
      expect(view.stopListening).toHaveBeenCalledWith(subview1);
      expect(view.stopListening).toHaveBeenCalledWith(subview2);
      expect(subview1.close).toHaveBeenCalled();
      expect(subview2.close).toHaveBeenCalled();
      expect(subview3.close).toHaveBeenCalled();
      expect(view.$subviews).toEqual({});
    });

    it("should should show loader using default css", function() {
      // GIVEN
      var $el = $('<div></div>');

      var view = new Backbone.StrapView({
        el: $el
      });

      // WHEN
      var result = view.showLoader();

      // THEN
      expect(result).toBe(view);
      expect(view.$el.hasClass('loading')).toBe(true);

      var $i = view.$el.find('i');
      expect($i.length).toBe(1);
      expect($i.hasClass('icon-loader')).toBe(true);
    });

    it("should should show loader using custom css", function() {
      // GIVEN
      var $el = $('<div></div>');

      var view = new Backbone.StrapView({
        el: $el,
        elLoader: 'foo',
        iconLoader: 'bar'
      });

      // WHEN
      var result = view.showLoader();

      // THEN
      expect(result).toBe(view);
      expect(view.$loading).toBe(true);
      expect(view.$el.hasClass('foo')).toBe(true);
      expect(view.$el.hasClass('loading')).toBe(false);

      var $i = view.$el.find('i');
      expect($i.length).toBe(1);
      expect($i.hasClass('bar')).toBe(true);
      expect($i.hasClass('icon-loader')).toBe(false);
      expect(view.$loader).toBeDefined();
    });

    it("should should remove loader", function() {
      // GIVEN
      var $el = $('<div></div>');

      var view = new Backbone.StrapView({
        el: $el
      });

      view.$el.addClass('loading');
      view.$loader = $('<i></i>');
      view.$loading = true;

      // WHEN
      var result = view.hideLoader();

      // THEN
      expect(result).toBe(view);
      expect(view.$loading).toBe(false);
      expect(view.$el.hasClass('loading')).toBe(false);

      var $i = view.$el.find('i');
      expect($i.length).toBe(0);
      expect(view.$loader).toBe(null);
    });

    it("should should remove loader when view render", function() {
      // GIVEN
      var $el = $('<div></div>');

      spyOn(Backbone.templateManager, 'load').andCallFake(function(template, fn, context) {
        fn.call(context, template);
      });

      var view = new Backbone.StrapView({
        el: $el,
        templates: 'foo'
      });

      view.$el.addClass('loading');
      view.$loader = $('<i></i>');
      view.$loading = true;

      // WHEN
      view.render();

      // THEN
      expect(view.$loading).toBe(false);
      expect(view.$el.hasClass('loading')).toBe(false);
      var $i = view.$el.find('i');
      expect($i.length).toBe(0);
      expect(view.$loader).toBe(null);
    });

    it("should initialize model from window object value with a default variable name", function() {
      // GIVEN
      window.foo = {
        id: 1,
        name: 'bar'
      };

      var view = new Backbone.StrapView();
      view.foo = new Backbone.Model();

      // WHEN
      var result = view.$read('foo');

      // THEN
      expect(result).toBe(view);
      expect(view.foo.get('id')).toBe(1);
      expect(view.foo.get('name')).toBe('bar');
      expect(window.foo).toBeUndefined();
    });

    it("should initialize model from window object value", function() {
      // GIVEN
      window.$$foo = {
        id: 1,
        name: 'bar'
      };

      var view = new Backbone.StrapView();
      view.foo = new Backbone.Model();

      // WHEN
      var result = view.$read('$$foo', 'foo');

      // THEN
      expect(result).toBe(view);
      expect(view.foo.get('id')).toBe(1);
      expect(view.foo.get('name')).toBe('bar');
      expect(window.$$foo).toBeUndefined();
    });

    it("should initialize model from window object value with a default variable name", function() {
      // GIVEN
      window.$$foo = {
        id: 1,
        name: 'bar'
      };

      var view = new Backbone.StrapView();
      view.foo = new Backbone.Model();

      // WHEN
      var result = view.$$read('foo');

      // THEN
      expect(result).toBe(view);
      expect(view.foo.get('id')).toBe(1);
      expect(view.foo.get('name')).toBe('bar');
      expect(window.$$foo).toBeUndefined();
    });

    it("should not render view if view is not ready to be rendered", function() {
      // GIVEN
      spyOn(Backbone.templateManager, 'load');
      spyOn(Backbone.StrapView.prototype, 'isReady').andReturn(false);
      spyOn(Backbone.StrapView.prototype, 'render').andCallThrough();

      // WHEN
      var view = new Backbone.StrapView({
        templates: 'foo'
      });

      // THEN
      expect(view.isReady).toHaveBeenCalled();
      expect(view.render).toHaveBeenCalled();
      expect(Backbone.templateManager.load).not.toHaveBeenCalled();
    });

    it("should have default partials", function() {
      // GIVEN
      var view = new Backbone.StrapView();

      // WHEN
      var partials = view.partials();

      // THEN
      expect(partials).toEqual({});
    });

    it("should compile html template without data", function() {
      // GIVEN
      var view = new Backbone.StrapView();

      var template = 'foo';
      var compiledHtml = '<span>foo</span>';
      spyOn(_, 'template').andReturn(compiledHtml);

      // WHEN
      var html = view.compileTemplate(template);

      // THEN
      expect(html).toEqual(compiledHtml);
      expect(_.template).toHaveBeenCalledWith(template, {});
    });

    it("should compile html template with data", function() {
      // GIVEN
      var view = new Backbone.StrapView();
      var data = {
        foo: 'bar'
      };

      var template = 'foo';
      var compiledHtml = '<span>foo</span>';
      spyOn(_, 'template').andReturn(compiledHtml);

      // WHEN
      var html = view.compileTemplate(template, data);

      // THEN
      expect(html).toEqual(compiledHtml);
      expect(_.template).toHaveBeenCalledWith(template, data);
    });

    it("should populate view", function() {
      // GIVEN
      var view = new Backbone.StrapView();
      var template = 'foo';
      var data = {
        foo: 'bar'
      };

      spyOn(view, 'preRender');
      spyOn(view, '$clear').andReturn(view);
      spyOn(view, 'hideLoader').andReturn(view);
      spyOn(view, 'onReady');
      spyOn(view, 'closeSubviews').andReturn(view);
      spyOn(view, 'compileTemplate').andReturn('<span>foo</span>');

      // WHEN
      var result = view.populate(template, data);

      // THEN
      expect(result).toBe(view);
      expect(result.preRender).toHaveBeenCalled();
      expect(result.$clear).toHaveBeenCalled();
      expect(result.hideLoader).toHaveBeenCalled();
      expect(result.closeSubviews).toHaveBeenCalled();
      expect(result.onReady).toHaveBeenCalled();

      expect(view.$el.html()).toBe('<span>foo</span>');
    });

    it("should load template and render view using toJSON function", function() {
      // GIVEN
      spyOn(Backbone.templateManager, 'load').andCallThrough();
      spyOn(Backbone.StrapView.prototype, 'render').andCallThrough();
      spyOn(Backbone.StrapView.prototype, 'onLoaded').andCallThrough();
      spyOn(Backbone.StrapView.prototype, 'populate').andCallThrough();

      var fakeData = {
        id: 1
      };

      // WHEN
      var view = new Backbone.StrapView({
        templates: 'foo',
        toJSON: function() {
          return fakeData;
        }
      });

      // THEN
      expect(view.render).toHaveBeenCalled();
      expect(Backbone.templateManager.load).toHaveBeenCalledWith('foo', jasmine.any(Function), view);

      Backbone.templateManager.load.argsForCall[0][1].call(view, 'foo template');
      expect(view.onLoaded).toHaveBeenCalledWith('foo template');
      expect(view.populate).toHaveBeenCalledWith('foo template', fakeData);
    });

    it("should load several templates and render view", function() {
      // GIVEN
      spyOn(Backbone.templateManager, 'load').andCallThrough();
      spyOn(Backbone.templateManager, 'loads').andCallThrough();
      spyOn(Backbone.StrapView.prototype, 'render').andCallThrough();
      spyOn(Backbone.StrapView.prototype, 'onLoaded').andCallThrough();
      spyOn(Backbone.StrapView.prototype, 'populate').andCallThrough();
      spyOn(Backbone.StrapView.prototype, 'preRender').andCallThrough();
      spyOn(Backbone.StrapView.prototype, '$clear').andCallThrough();
      spyOn(Backbone.StrapView.prototype, 'closeSubviews').andCallThrough();
      spyOn(Backbone.StrapView.prototype, '$partials').andCallThrough();

      var fakeData = {
        id: 1
      };

      // WHEN
      var view = new Backbone.StrapView({
        templates: ['foo', 'bar'],
        toJSON: function() {
          return fakeData;
        },
        partials: function(tmpls) {
          return {
            'bar': tmpls['bar']
          };
        }
      });

      // THEN
      expect(view.render).toHaveBeenCalled();
      expect(Backbone.templateManager.loads).toHaveBeenCalledWith(['foo', 'bar'], jasmine.any(Function), view);

      var templates = {
        foo: 'foo template',
        bar: 'bar template'
      };

      view.populate.reset();
      Backbone.templateManager.loads.argsForCall[0][1].call(view, templates);
      expect(view.onLoaded).toHaveBeenCalledWith(templates);
      expect(view.$partials).toHaveBeenCalledWith({ foo: 'foo template', bar: 'bar template' }, 'foo');
      expect(view.populate).toHaveBeenCalledWith('foo template', fakeData, {
        'bar': 'bar template'
      });

      expect(view.preRender).toHaveBeenCalled();
      expect(view.$clear).toHaveBeenCalled();
      expect(view.closeSubviews).toHaveBeenCalled();
    });

    it("should set subscriptions", function() {
      // WHEN
      var view = new Backbone.StrapView({
        subscriptions: {
          'foo': 'fooCallback'
        },
        fooCallback: jasmine.createSpy('fooCallback')
      });

      // THEN
      expect(Backbone.Mediator.channels['foo']).toBeDefined();
      expect(Backbone.Mediator.channels['foo'][0]).toEqual({
        fn: view.fooCallback,
        context: view,
        once: false
      });
    });

    it("should unset subscriptions", function() {
      // GIVEN
      var view = new Backbone.StrapView({
        subscriptions: {
          'foo': 'fooCallback'
        },
        fooCallback: jasmine.createSpy('fooCallback')
      });

      expect(Backbone.Mediator.channels['foo']).toBeDefined();
      expect(Backbone.Mediator.channels['foo'][0]).toEqual({
        fn: view.fooCallback,
        context: view,
        once: false
      });

      // WHEN
      var result = view.undelegateEvents();

      // THEN
      expect(result).toBe(view);
      expect(Backbone.Mediator.channels['foo']).toEqual([]);
    });
  });

  describe("PaginatedCollection Test Suite", function() {
    beforeEach(function() {
      spyOn($, 'ajax');
      this.success = jasmine.createSpy('success');
    });

    it("should initialize collection without options", function() {
      // WHEN
      var collection = new Backbone.PaginatedCollection([]);

      // THEN
      expect(collection.total).toBe(Number.MAX_VALUE);
      expect(collection.page).toBe(0);
      expect(collection.pageSize).toBe(10);
    });

    it("should initialize collection with defaults page, pageSize and total", function() {
      // WHEN
      var collection = new Backbone.PaginatedCollection([], {
        total: 20
      });

      // THEN
      expect(collection.total).toBe(20);
      expect(collection.page).toBe(0);
      expect(collection.pageSize).toBe(10);
    });

    it("should initialize collection with custom page, pageSize and total", function() {
      // WHEN
      var collection = new Backbone.PaginatedCollection([], {
        page: 1,
        pageSize: 5,
        total: 20
      });

      // THEN
      expect(collection.total).toBe(20);
      expect(collection.page).toBe(1);
      expect(collection.pageSize).toBe(5);
    });

    it("should initialize collection with custom page, pageSize and total equal to zero", function() {
      // WHEN
      var collection = new Backbone.PaginatedCollection([], {
        page: 1,
        pageSize: 5,
        total: 0
      });

      // THEN
      expect(collection.total).toBe(0);
      expect(collection.page).toBe(1);
      expect(collection.pageSize).toBe(5);
    });

    it("should fetch next page using next id", function() {
      // GIVEN
      var models = [
        { id: 1 },
        { id: 2 }
      ];

      var collection = new Backbone.PaginatedCollection(models, {
        total: 20
      });

      collection.url = '/foo';

      // WHEN
      collection.nextPageById();

      // THEN
      expect($.ajax).toHaveBeenCalled();

      var xhr = $.ajax.argsForCall[0][0];
      expect(xhr.url).toBe('/foo');
      expect(xhr.data).toEqual({
        'next-id': 2,
        'page-size': 10
      });
      expect(xhr.success).toEqual(jasmine.any(Function));

      var triggerAdd = jasmine.createSpy('triggerAdd');
      var triggerSync = jasmine.createSpy('triggerSync');
      var triggerPage = jasmine.createSpy('triggerPage');

      collection.on('add', triggerAdd);
      collection.on('sync', triggerSync);
      collection.on('sync:page', triggerPage);

      xhr.success([
        { id: 3 },
        { id: 4 }
      ]);
      expect(collection.page).toBe(1);
      expect(collection.length).toBe(4);

      expect(triggerAdd).toHaveBeenCalled();
      expect(triggerAdd.callCount).toBe(2);
      expect(triggerSync).toHaveBeenCalled();
      expect(triggerSync.callCount).toBe(1);
      expect(triggerPage).toHaveBeenCalled();
      expect(triggerPage.callCount).toBe(1);
    });

    it("should fetch next page using next page", function() {
      // GIVEN
      var models = [
        { id: 1 },
        { id: 2 }
      ];

      var collection = new Backbone.PaginatedCollection(models, {
        page: 1,
        total: 20
      });

      collection.url = '/foo';

      // WHEN
      collection.nextPage();

      // THEN
      expect($.ajax).toHaveBeenCalled();

      var xhr = $.ajax.argsForCall[0][0];
      expect(xhr.url).toBe('/foo');
      expect(xhr.data).toEqual({
        'page': 2,
        'page-size': 10
      });

      expect(xhr.success).toEqual(jasmine.any(Function));

      var triggerAdd = jasmine.createSpy('triggerAdd');
      var triggerSync = jasmine.createSpy('triggerSync');
      var triggerPage = jasmine.createSpy('triggerPage');

      collection.on('add', triggerAdd);
      collection.on('sync', triggerSync);
      collection.on('sync:page', triggerPage);

      xhr.success([
        { id: 3 },
        { id: 4 }
      ]);
      expect(collection.page).toBe(2);
      expect(collection.length).toBe(4);

      expect(triggerAdd).toHaveBeenCalled();
      expect(triggerAdd.callCount).toBe(2);
      expect(triggerSync).toHaveBeenCalled();
      expect(triggerSync.callCount).toBe(1);
      expect(triggerPage).toHaveBeenCalled();
      expect(triggerPage.callCount).toBe(1);
    });

    it("should fetch next page and call success callback", function() {
      // GIVEN
      var models = [
        { id: 1 },
        { id: 2 }
      ];

      var collection = new Backbone.PaginatedCollection(models, {
        total: 20
      });

      collection.url = '/foo';

      // WHEN
      collection.nextPageById({
        success: this.success
      });

      // THEN
      var xhr = $.ajax.argsForCall[0][0];
      xhr.success([
        { id: 3 },
        { id: 4 }
      ]);

      expect(this.success).toHaveBeenCalled();
    });

    it("should fetch next page and set total equal to length", function() {
      // GIVEN
      var models = [
        { id: 1 },
        { id: 2 }
      ];

      var collection = new Backbone.PaginatedCollection(models, {
        total: 20
      });

      expect(collection.length).toBe(2);
      collection.url = '/foo';

      // WHEN
      collection.nextPageById({
        success: this.success
      });

      // THEN
      var xhr = $.ajax.argsForCall[0][0];
      xhr.success([]);

      expect(this.success).toHaveBeenCalled();
      expect(collection.total).toBe(2);
    });
  });
});