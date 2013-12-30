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
      var tmplManager = Backbone.templateManager;
      expect(tmplManager).toBeDefined();
    });

    it("should have an empty cache, a prefix and a suffix", function() {
      var tmplManager = Backbone.templateManager;
      expect(tmplManager.$cache).toEqual({});
      expect(tmplManager.prefix).toEqual('/templates/');
      expect(tmplManager.suffix).toEqual('.template.html');
    });

    it("should load template only once", function() {
      var tmplManager = Backbone.templateManager;
      var callback = jasmine.createSpy('callback');

      tmplManager.load('foo', callback);
      expect(tmplManager.$cache['foo']).toBeDefined();
      expect($.get).toHaveBeenCalledWith('/templates/foo.template.html');
      expect(this.xhr.done).toHaveBeenCalled();
      expect(callback).not.toHaveBeenCalled();

      this.xhr.done.argsForCall[0][0]('foo result');
      expect(callback).toHaveBeenCalledWith('foo result');

      callback.reset();
      $.get.reset();
      tmplManager.load('foo', callback);
      expect(callback).not.toHaveBeenCalled();
      expect($.get).not.toHaveBeenCalled();
      this.xhr.done.argsForCall[0][0]('foo result');
      expect(callback).toHaveBeenCalled();
    });

    it("should load an array of templates only once", function() {
      var tmplManager = Backbone.templateManager;
      var callback = jasmine.createSpy('callback');

      tmplManager.loads(['foo', 'bar'], callback);
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

  describe("StrapView Test Suite", function() {

    it("should initialize an empty view", function() {
      spyOn(Backbone.StrapView.prototype, 'initialize').andCallThrough();
      spyOn(Backbone.StrapView.prototype, 'onInit').andCallThrough();
      spyOn(Backbone.StrapView.prototype, 'postInit').andCallThrough();
      spyOn(Backbone.StrapView.prototype, 'onReady').andCallThrough();
      spyOn(Backbone.StrapView.prototype, 'isEmpty').andCallThrough();
      spyOn(Backbone.StrapView.prototype, 'render').andCallThrough();

      var view = new Backbone.StrapView();
      expect(view.$cache).toEqual({});
      expect(view.subviews).toEqual([]);

      expect(view.initialize).toHaveBeenCalled();
      expect(view.onInit).toHaveBeenCalled();
      expect(view.postInit).toHaveBeenCalled();
      expect(view.isEmpty).toHaveBeenCalled();
      expect(view.render).toHaveBeenCalled();
      expect(view.onReady).not.toHaveBeenCalled();
    });

    it("should initialize a view that is already rendered", function() {
      spyOn(Backbone.StrapView.prototype, 'initialize').andCallThrough();
      spyOn(Backbone.StrapView.prototype, 'onInit').andCallThrough();
      spyOn(Backbone.StrapView.prototype, 'postInit').andCallThrough();
      spyOn(Backbone.StrapView.prototype, 'onReady').andCallThrough();
      spyOn(Backbone.StrapView.prototype, 'isEmpty').andReturn(false);
      spyOn(Backbone.StrapView.prototype, 'render').andCallThrough();

      var view = new Backbone.StrapView();
      expect(view.$cache).toEqual({});
      expect(view.subviews).toEqual([]);

      expect(view.initialize).toHaveBeenCalled();
      expect(view.onInit).toHaveBeenCalled();
      expect(view.onReady).toHaveBeenCalled();
      expect(view.isEmpty).toHaveBeenCalled();
      expect(view.postInit).not.toHaveBeenCalled();
      expect(view.render).not.toHaveBeenCalled();
    });

    it("should check if view is empty", function() {
      var view = new Backbone.StrapView();
      expect(view.isEmpty()).toBe(true);

      view.$el.html('hello world');
      expect(view.isEmpty()).toBe(false);
    });

    it("should add selector in internal cache", function() {
      var view = new Backbone.StrapView();
      expect(view.$cache).toEqual({});

      spyOn(view, '$').andCallThrough();

      view.$c('#foo');
      expect(view.$).toHaveBeenCalled();
      expect(view.$cache['#foo']).toBeDefined();

      view.$.reset();
      view.$c('#foo');
      expect(view.$).not.toHaveBeenCalled();
      expect(view.$cache['#foo']).toBeDefined();
    });

    it("should dispose view", function() {
      var view = new Backbone.StrapView();

      view.$cache['#foo'] = $('<div></div>');

      spyOn(view, 'onDispose').andCallThrough();
      spyOn(view, 'clearCache').andCallThrough();
      spyOn(view, 'closeSubviews').andCallThrough();
      spyOn(view, 'stopListening').andCallThrough();
      spyOn(view, 'undelegateEvents').andCallThrough();

      view.dispose();
      expect(view.$cache).toEqual({});
      expect(view.onDispose).toHaveBeenCalled();
      expect(view.clearCache).toHaveBeenCalled();
      expect(view.closeSubviews).toHaveBeenCalled();
      expect(view.stopListening).toHaveBeenCalled();
      expect(view.undelegateEvents).toHaveBeenCalled();
    });

    it("should add subview", function() {
      var view = new Backbone.StrapView();

      expect(view.subviews).toEqual([]);

      var subview = new Backbone.StrapView();
      view.addSubview(subview);
      expect(view.subviews.length).toBe(1);
      expect(view.subviews[0]).toBe(subview);
    });

    it("should add subviews", function() {
      var view = new Backbone.StrapView();

      expect(view.subviews).toEqual([]);

      var subview1 = new Backbone.StrapView();
      var subview2 = new Backbone.StrapView();
      view.addSubview([subview1, subview2]);
      expect(view.subviews.length).toBe(2);
      expect(view.subviews[0]).toBe(subview1);
      expect(view.subviews[1]).toBe(subview2);
    });

    it("should close subviews", function() {
      var subview1 = jasmine.createSpyObj('subview1', ['dispose']);
      var subview2 = jasmine.createSpyObj('subview1', ['dispose']);

      var view = new Backbone.StrapView();
      view.subviews = [subview1, subview2];

      view.closeSubviews();
      expect(subview1.dispose).toHaveBeenCalled();
      expect(subview2.dispose).toHaveBeenCalled();
      expect(view.subviews).toEqual([]);
    });

    it("should initialize model from window object value with a default variable name", function() {
      window.foo = {
        id: 1,
        name: 'bar'
      };

      var view = new Backbone.StrapView();
      view.foo = new Backbone.Model();
      view.$read('foo');

      expect(view.foo.get('id')).toBe(1);
      expect(view.foo.get('name')).toBe('bar');
      expect(window.foo).toBeUndefined();
    });

    it("should initialize model from window object value", function() {
      window.$$foo = {
        id: 1,
        name: 'bar'
      };

      var view = new Backbone.StrapView();
      view.foo = new Backbone.Model();
      view.$read('$$foo', 'foo');

      expect(view.foo.get('id')).toBe(1);
      expect(view.foo.get('name')).toBe('bar');
      expect(window.$$foo).toBeUndefined();
    });

    it("should not render view if view is not ready to be rendered", function() {
      spyOn(Backbone.templateManager, 'load');
      spyOn(Backbone.StrapView.prototype, 'isReady').andReturn(false);
      spyOn(Backbone.StrapView.prototype, 'render').andCallThrough();

      var view = new Backbone.StrapView({
        templates: 'foo'
      });

      expect(view.isReady).toHaveBeenCalled();
      expect(view.render).toHaveBeenCalled();
      expect(Backbone.templateManager.load).not.toHaveBeenCalled();
    });

    it("should load template and render view using datas function", function() {
      spyOn(Backbone.templateManager, 'load').andCallThrough();
      spyOn(Backbone.StrapView.prototype, 'render').andCallThrough();
      spyOn(Backbone.StrapView.prototype, 'onLoaded').andCallThrough();
      spyOn(Backbone.StrapView.prototype, 'populate').andCallThrough();

      var fakeData = {
        id: 1
      };

      var view = new Backbone.StrapView({
        templates: 'foo',
        datas: function() {
          return fakeData;
        }
      });

      expect(view.render).toHaveBeenCalled();
      expect(Backbone.templateManager.load).toHaveBeenCalledWith('foo', jasmine.any(Function), view);

      Backbone.templateManager.load.argsForCall[0][1].call(view, 'foo template');
      expect(view.onLoaded).toHaveBeenCalledWith('foo template');
      expect(view.populate).toHaveBeenCalledWith('foo template', fakeData);
    });

    it("should load template and render view using toJSON function", function() {
      spyOn(Backbone.templateManager, 'load').andCallThrough();
      spyOn(Backbone.StrapView.prototype, 'render').andCallThrough();
      spyOn(Backbone.StrapView.prototype, 'onLoaded').andCallThrough();
      spyOn(Backbone.StrapView.prototype, 'populate').andCallThrough();

      var fakeData = {
        id: 1
      };

      var view = new Backbone.StrapView({
        templates: 'foo',
        toJSON: function() {
          return fakeData;
        }
      });

      expect(view.render).toHaveBeenCalled();
      expect(Backbone.templateManager.load).toHaveBeenCalledWith('foo', jasmine.any(Function), view);

      Backbone.templateManager.load.argsForCall[0][1].call(view, 'foo template');
      expect(view.onLoaded).toHaveBeenCalledWith('foo template');
      expect(view.populate).toHaveBeenCalledWith('foo template', fakeData);
    });

    it("should load several templates and render view", function() {
      spyOn(Backbone.templateManager, 'load').andCallThrough();
      spyOn(Backbone.templateManager, 'loads').andCallThrough();
      spyOn(Backbone.StrapView.prototype, 'render').andCallThrough();
      spyOn(Backbone.StrapView.prototype, 'onLoaded').andCallThrough();
      spyOn(Backbone.StrapView.prototype, 'populate').andCallThrough();
      spyOn(Backbone.StrapView.prototype, 'preRender').andCallThrough();
      spyOn(Backbone.StrapView.prototype, 'clearCache').andCallThrough();
      spyOn(Backbone.StrapView.prototype, 'closeSubviews').andCallThrough();
      spyOn(Backbone.StrapView.prototype, '$partials').andCallThrough();

      var fakeData = {
        id: 1
      };

      var view = new Backbone.StrapView({
        templates: ['foo', 'bar'],
        datas: function() {
          return fakeData;
        },
        partials: function(tmpls) {
          return {
            'bar': tmpls['bar']
          };
        }
      });

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
      expect(view.clearCache).toHaveBeenCalled();
      expect(view.closeSubviews).toHaveBeenCalled();
    });

    it("should set subscriptions", function() {
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
    });

    it("should unset subscriptions", function() {
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

      view.undelegateEvents();
      expect(Backbone.Mediator.channels['foo']).toEqual([]);
    });
  });

  describe("Backbone.Mediator Test Suite", function() {
    it("should have a mediator initialized", function() {
      expect(Backbone.Mediator.channels).toEqual({});
    });

    it("should subscribe to a new channel", function() {
      var fn = jasmine.createSpy('fn');
      var context = fn;
      Backbone.Mediator.subscribe("foo", fn, fn);
      expect(Backbone.Mediator.channels['foo']).toBeDefined();
      expect(Backbone.Mediator.channels['foo']).toEqual([
        { fn: fn, context: context, once: false }
      ]);
    });

    it("should subscribe twice to a new channel", function() {
      var fn1 = jasmine.createSpy('fn1');
      Backbone.Mediator.subscribe("foo", fn1, fn1);

      var fn2 = jasmine.createSpy('fn2');
      Backbone.Mediator.subscribe("foo", fn2, fn2);

      expect(Backbone.Mediator.channels['foo']).toBeDefined();
      expect(Backbone.Mediator.channels['foo']).toEqual([
        { fn: fn1, context: fn1, once: false },
        { fn: fn2, context: fn2, once: false }
      ]);
    });

    it("should unsubscribe to channel", function() {
      var fn1 = jasmine.createSpy('fn1');
      Backbone.Mediator.channels['foo'] = [
        {
          fn: fn1,
          context: fn1,
          once: false
        }
      ];

      Backbone.Mediator.unsubscribe('foo');
      expect(Backbone.Mediator.channels['foo']).toEqual([]);
    });

    it("should unsubscribe a function of channel", function() {
      var fn1 = jasmine.createSpy('fn1');
      Backbone.Mediator.channels['foo'] = [
        {
          fn: fn1,
          context: fn1,
          once: false
        }
      ];

      Backbone.Mediator.unsubscribe('foo', fn1, fn1);
      expect(Backbone.Mediator.channels['foo']).toEqual([]);
    });

    it("should unsubscribe a function of channel and keep others", function() {
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

      Backbone.Mediator.unsubscribe('foo', fn2, fn2);
      expect(Backbone.Mediator.channels['foo']).toEqual([{
        fn: fn1,
        context: fn1,
        once: false
      }]);
    });

    it("should publish to dedicated channels", function() {
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

      Backbone.Mediator.publish('foo', 1, 2);
      expect(fn1).toHaveBeenCalledWith(1, 2);
      expect(fn2).toHaveBeenCalledWith(1, 2);
    });

    it("should publish to dedicated channels and remove callbacks that subscribed once", function() {
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

      Backbone.Mediator.publish('foo', 1, 2);
      expect(fn1).toHaveBeenCalledWith(1, 2);
      expect(fn2).toHaveBeenCalledWith(1, 2);
      expect(Backbone.Mediator.channels['foo']).toEqual([{
        fn: fn1,
        context: fn1,
        once: false
      }]);
    });

    it("should subscribed once", function() {
      var fn1 = jasmine.createSpy('fn1');
      Backbone.Mediator.channels['foo'] = [];
      Backbone.Mediator.subscribeOnce('foo', fn1, fn1);
      expect(Backbone.Mediator.channels['foo']).toEqual([{
        fn: fn1,
        context: fn1,
        once: true
      }]);
    });
  });

  describe("App Test Suite", function() {
    afterEach(function() {
      delete window.app;
    });

    it("should initialize app object", function() {
      spyOn(Backbone.App.prototype, 'preInit').andCallThrough();
      spyOn(Backbone.App.prototype, 'onInit').andCallThrough();

      var app = new Backbone.App();
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
      var e = jasmine.createSpyObj('Event', ['preventDefault']);
      e.currentTarget = $('<a href="http://localhost/foo"/>');

      var app = new Backbone.App();
      app.url = 'http://localhost';
      app.router = jasmine.createSpyObj('router', ['navigate']);

      app.nav(e);

      expect(e.preventDefault).toHaveBeenCalled();
      app.navigate('http://localhost/foo');
      expect(app.router.navigate).toHaveBeenCalledWith('/foo', {
        trigger: true
      });
    });

    it("should navigate", function() {
      var app = new Backbone.App();
      app.url = 'http://localhost';
      app.router = jasmine.createSpyObj('router', ['navigate']);

      app.navigate('http://localhost/foo');
      expect(app.router.navigate).toHaveBeenCalledWith('/foo', {
        trigger: true
      });
    });

    it("should navigate and don't trigger events", function() {
      var app = new Backbone.App();
      app.url = 'http://localhost';
      app.router = jasmine.createSpyObj('router', ['navigate']);

      app.navigate('http://localhost/foo', false);
      expect(app.router.navigate).toHaveBeenCalledWith('/foo', {
        trigger: false
      });
    });

    it("should add new view", function() {
      var app = new Backbone.App();

      var View = jasmine.createSpy('view');
      var opts = jasmine.createSpy('opts');

      app.replaceCurrentView(View);
      expect(app.views.current).toBeDefined();
      expect(app.views.current instanceof View).toBe(true);
    });

    it("should replace current view", function() {
      var app = new Backbone.App();

      var oldView = jasmine.createSpyObj('oldView', ['clear']);
      app.views.current = oldView;

      var View = jasmine.createSpy('view');
      var opts = jasmine.createSpy('opts');

      app.replaceCurrentView(View);
      expect(oldView.clear).toHaveBeenCalled();
      expect(app.views.current).toBeDefined();
      expect(app.views.current instanceof View).toBe(true);
    });

    it("should initialize scroll top", function() {
      var app = new Backbone.App();

      spyOn(app.$window, 'scrollTop');
      app.scrollTop();
      expect(app.$window.scrollTop).toHaveBeenCalledWith(0);
    });

    it("should initialize scroll top with y value", function() {
      var app = new Backbone.App();

      spyOn(app.$window, 'scrollTop');
      app.scrollTop(10);
      expect(app.$window.scrollTop).toHaveBeenCalledWith(10);
    });
  });

  describe("PaginatedCollection Test Suite", function() {
    beforeEach(function() {
      spyOn($, 'ajax');
      this.success = jasmine.createSpy('success');
    });

    it("should initialize collection with defaults page, pageSize and total", function() {
      var collection = new Backbone.PaginatedCollection([], {
        total: 20
      });
      expect(collection.total).toBe(20);
      expect(collection.page).toBe(0);
      expect(collection.pageSize).toBe(10);
    });

    it("should initialize collection with custom page, pageSize and total", function() {
      var collection = new Backbone.PaginatedCollection([], {
        page: 1,
        pageSize: 5,
        total: 20
      });
      expect(collection.total).toBe(20);
      expect(collection.page).toBe(1);
      expect(collection.pageSize).toBe(5);
    });

    it("should initialize collection with custom page, pageSize and total equal to zero", function() {
      var collection = new Backbone.PaginatedCollection([], {
        page: 1,
        pageSize: 5,
        total: 0
      });
      expect(collection.total).toBe(0);
      expect(collection.page).toBe(1);
      expect(collection.pageSize).toBe(5);
    });

    it("should fetch next page using next id", function() {
      var models = [
        { id: 1 },
        { id: 2 }
      ];

      var collection = new Backbone.PaginatedCollection(models, {
        total: 20
      });

      collection.url = '/foo';

      collection.nextPageById();
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
      var models = [
        { id: 1 },
        { id: 2 }
      ];

      var collection = new Backbone.PaginatedCollection(models, {
        page: 1,
        total: 20
      });

      collection.url = '/foo';

      collection.nextPage();
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
      var models = [
        { id: 1 },
        { id: 2 }
      ];

      var collection = new Backbone.PaginatedCollection(models, {
        total: 20
      });

      collection.url = '/foo';

      collection.nextPageById({
        success: this.success
      });

      var xhr = $.ajax.argsForCall[0][0];
      xhr.success([
        { id: 3 },
        { id: 4 }
      ]);

      expect(this.success).toHaveBeenCalled();
    });

    it("should fetch next page and set total equal to length", function() {
      var models = [
        { id: 1 },
        { id: 2 }
      ];

      var collection = new Backbone.PaginatedCollection(models, {
        total: 20
      });

      expect(collection.length).toBe(2);
      collection.url = '/foo';

      collection.nextPageById({
        success: this.success
      });

      var xhr = $.ajax.argsForCall[0][0];
      xhr.success([]);

      expect(this.success).toHaveBeenCalled();
      expect(collection.total).toBe(2);
    });
  });
});