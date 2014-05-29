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

describe('Sync Spec', function() {
  beforeEach(function() {
    spyOn($, 'ajax').andCallFake(function(options) {
      var xhr = jasmine.createSpyObj('xhr', ['abort']);
      xhr.success = options.success;
      xhr.error = options.error;
      return xhr;
    });
  });

  afterEach(function() {
    Backbone.safeSync = 'abort';
  });

  describe('Sync Model Spec', function() {
    it('should fetch a model, store current xhr and clear xhr on success', function() {
      var success = jasmine.createSpy('success');
      var error = jasmine.createSpy('error');
      var model = new Backbone.Model();
      model.url = '/foo';

      var xhr = model.fetch({
        success: success,
        error: error
      });

      expect(xhr).toBeDefined();
      expect(model.$xhr).toBeDefined();
      expect(model.$xhr['read']).toBe(xhr);
      expect(success).not.toHaveBeenCalled();
      expect(error).not.toHaveBeenCalled();

      xhr.success();
      expect(model.$xhr['read']).toBe(null);
      expect(success).toHaveBeenCalled();
      expect(error).not.toHaveBeenCalled();
    });

    it('should fetch a model, store current xhr and clear xhr on error', function() {
      var success = jasmine.createSpy('success');
      var error = jasmine.createSpy('error');
      var model = new Backbone.Model();
      model.url = '/foo';

      var xhr = model.fetch({
        success: success,
        error: error
      });

      expect(xhr).toBeDefined();
      expect(model.$xhr).toBeDefined();
      expect(model.$xhr['read']).toBe(xhr);
      expect(success).not.toHaveBeenCalled();
      expect(error).not.toHaveBeenCalled();

      xhr.error();
      expect(model.$xhr['read']).toBe(null);
      expect(success).not.toHaveBeenCalled();
      expect(error).toHaveBeenCalled();
    });

    it('should save a model, store current xhr and clear xhr on success', function() {
      var success = jasmine.createSpy('success');
      var error = jasmine.createSpy('error');
      var model = new Backbone.Model();
      model.url = '/foo';

      var xhr = model.save({}, {
        success: success,
        error: error
      });

      expect(xhr).toBeDefined();
      expect(model.$xhr).toBeDefined();
      expect(model.$xhr['create']).toBe(xhr);
      expect(success).not.toHaveBeenCalled();
      expect(error).not.toHaveBeenCalled();

      xhr.success();
      expect(model.$xhr['create']).toBe(null);
      expect(success).toHaveBeenCalled();
      expect(error).not.toHaveBeenCalled();
    });

    it('should save a model, store current xhr and clear xhr on error', function() {
      var success = jasmine.createSpy('success');
      var error = jasmine.createSpy('error');
      var model = new Backbone.Model();
      model.url = '/foo';

      var xhr = model.save({}, {
        success: success,
        error: error
      });

      expect(xhr).toBeDefined();
      expect(model.$xhr).toBeDefined();
      expect(model.$xhr['create']).toBe(xhr);
      expect(success).not.toHaveBeenCalled();
      expect(error).not.toHaveBeenCalled();

      xhr.error();
      expect(model.$xhr['create']).toBe(null);
      expect(success).not.toHaveBeenCalled();
      expect(error).toHaveBeenCalled();
    });

    it('should upade a model, store current xhr and clear xhr on success', function() {
      var success = jasmine.createSpy('success');
      var error = jasmine.createSpy('error');

      var model = new Backbone.Model({
        id: 1
      });

      model.url = '/foo';

      var xhr = model.save({}, {
        success: success,
        error: error
      });

      expect(xhr).toBeDefined();
      expect(model.$xhr).toBeDefined();
      expect(model.$xhr['update']).toBe(xhr);
      expect(success).not.toHaveBeenCalled();
      expect(error).not.toHaveBeenCalled();

      xhr.success();
      expect(model.$xhr['update']).toBe(null);
      expect(success).toHaveBeenCalled();
      expect(error).not.toHaveBeenCalled();
    });

    it('should upade a model, store current xhr and clear xhr on error', function() {
      var success = jasmine.createSpy('success');
      var error = jasmine.createSpy('error');

      var model = new Backbone.Model({
        id: 1
      });

      model.url = '/foo';

      var xhr = model.save({}, {
        success: success,
        error: error
      });

      expect(xhr).toBeDefined();
      expect(model.$xhr).toBeDefined();
      expect(model.$xhr['update']).toBe(xhr);
      expect(success).not.toHaveBeenCalled();
      expect(error).not.toHaveBeenCalled();

      xhr.error();
      expect(model.$xhr['update']).toBe(null);
      expect(success).not.toHaveBeenCalled();
      expect(error).toHaveBeenCalled();
    });

    it('should destroy a model, store current xhr and clear xhr on success', function() {
      var success = jasmine.createSpy('success');
      var error = jasmine.createSpy('error');

      var model = new Backbone.Model({
        id: 1
      });

      model.url = '/foo';

      var xhr = model.destroy({
        success: success,
        error: error
      });

      expect(xhr).toBeDefined();
      expect(model.$xhr).toBeDefined();
      expect(model.$xhr['delete']).toBe(xhr);
      expect(success).not.toHaveBeenCalled();
      expect(error).not.toHaveBeenCalled();

      xhr.success();
      expect(model.$xhr['delete']).toBe(null);
      expect(success).toHaveBeenCalled();
      expect(error).not.toHaveBeenCalled();
    });

    it('should destroy a model, store current xhr and clear xhr on error', function() {
      var success = jasmine.createSpy('success');
      var error = jasmine.createSpy('error');

      var model = new Backbone.Model({
        id: 1
      });

      model.url = '/foo';

      var xhr = model.destroy({
        success: success,
        error: error
      });

      expect(xhr).toBeDefined();
      expect(model.$xhr).toBeDefined();
      expect(model.$xhr['delete']).toBe(xhr);
      expect(success).not.toHaveBeenCalled();
      expect(error).not.toHaveBeenCalled();

      xhr.error();
      expect(model.$xhr['delete']).toBe(null);
      expect(success).not.toHaveBeenCalled();
      expect(error).toHaveBeenCalled();

    });

    it('should abort previous fetch when a model is fetched', function() {
      var success = jasmine.createSpy('success');
      var error = jasmine.createSpy('error');

      var model = new Backbone.Model();
      model.url = '/foo';

      var oldXhr = model.fetch({
        success: success,
        error: error
      });

      var xhr = model.fetch({
        success: success,
        error: error
      });

      expect(oldXhr.abort).toHaveBeenCalled();
      expect(xhr.abort).not.toHaveBeenCalled();
      expect(model.$xhr['read']).toBe(xhr);
      expect(success).not.toHaveBeenCalled();
      expect(error).not.toHaveBeenCalled();

      xhr.success();
      expect(model.$xhr['read']).toBe(null);
      expect(success).toHaveBeenCalled();
      expect(success.callCount).toBe(1);
      expect(error).not.toHaveBeenCalled();
    });

    it('should skip fetch when a model is fetched', function() {
      Backbone.safeSync = 'skip';
      var success = jasmine.createSpy('success');
      var error = jasmine.createSpy('error');

      var model = new Backbone.Model();
      model.url = '/foo';

      var oldXhr = model.fetch({
        success: success,
        error: error
      });

      var xhr = model.fetch({
        success: success,
        error: error
      });

      expect(oldXhr.abort).not.toHaveBeenCalled();
      expect(xhr.abort).not.toHaveBeenCalled();
      expect(model.$xhr['read']).toBe(oldXhr);
      expect(success).not.toHaveBeenCalled();
      expect(error).not.toHaveBeenCalled();
    });

    it('should trigger parallel fetch when a model is fetched', function() {
      Backbone.safeSync = '';
      var success = jasmine.createSpy('success');
      var error = jasmine.createSpy('error');

      var model = new Backbone.Model();
      model.url = '/foo';

      var oldXhr = model.fetch({
        success: success,
        error: error
      });

      var xhr = model.fetch({
        success: success,
        error: error
      });

      expect(oldXhr.abort).not.toHaveBeenCalled();
      expect(xhr.abort).not.toHaveBeenCalled();
      expect(model.$xhr).not.toBeDefined();
      expect(success).not.toHaveBeenCalled();
      expect(error).not.toHaveBeenCalled();
    });

    it('should trigger parallel fetch when a model is fetched', function() {
      var success = jasmine.createSpy('success');
      var error = jasmine.createSpy('error');

      var model = new Backbone.Model();
      model.url = '/foo';

      var oldXhr = model.fetch({
        safe: false,
        success: success,
        error: error
      });

      var xhr = model.fetch({
        safe: false,
        success: success,
        error: error
      });

      expect(oldXhr.abort).not.toHaveBeenCalled();
      expect(xhr.abort).not.toHaveBeenCalled();
      expect(model.$xhr).not.toBeDefined();
      expect(success).not.toHaveBeenCalled();
      expect(error).not.toHaveBeenCalled();
    });

    it('should abort previous save when a model is created', function() {
      var success = jasmine.createSpy('success');
      var error = jasmine.createSpy('error');

      var model = new Backbone.Model();
      model.url = '/foo';

      var oldXhr = model.save({}, {
        success: success,
        error: error
      });

      var xhr = model.save({}, {
        success: success,
        error: error
      });

      expect(oldXhr.abort).toHaveBeenCalled();
      expect(xhr.abort).not.toHaveBeenCalled();
      expect(model.$xhr['create']).toBe(xhr);
      expect(success).not.toHaveBeenCalled();
      expect(error).not.toHaveBeenCalled();

      xhr.success();
      expect(model.$xhr['create']).toBe(null);
      expect(success).toHaveBeenCalled();
      expect(success.callCount).toBe(1);
      expect(error).not.toHaveBeenCalled();
    });

    it('should skip save when a model is created', function() {
      Backbone.safeSync = 'skip';
      var success = jasmine.createSpy('success');
      var error = jasmine.createSpy('error');

      var model = new Backbone.Model();
      model.url = '/foo';

      var oldXhr = model.save({}, {
        success: success,
        error: error
      });

      var xhr = model.save({}, {
        success: success,
        error: error
      });

      expect(oldXhr.abort).not.toHaveBeenCalled();
      expect(xhr.abort).not.toHaveBeenCalled();
      expect(model.$xhr['create']).toBe(oldXhr);
      expect(success).not.toHaveBeenCalled();
      expect(error).not.toHaveBeenCalled();
    });

    it('should trigger parallel save when a model is created', function() {
      Backbone.safeSync = false;
      var success = jasmine.createSpy('success');
      var error = jasmine.createSpy('error');

      var model = new Backbone.Model();
      model.url = '/foo';

      var oldXhr = model.save({}, {
        success: success,
        error: error
      });

      var xhr = model.save({}, {
        success: success,
        error: error
      });

      expect(oldXhr.abort).not.toHaveBeenCalled();
      expect(xhr.abort).not.toHaveBeenCalled();
      expect(model.$xhr).not.toBeDefined();
      expect(success).not.toHaveBeenCalled();
      expect(error).not.toHaveBeenCalled();
    });

    it('should abort previous update when a model is updated', function() {
      var success = jasmine.createSpy('success');
      var error = jasmine.createSpy('error');

      var model = new Backbone.Model({
        id: 1
      });

      model.url = '/foo';

      var oldXhr = model.save({}, {
        success: success,
        error: error
      });

      var xhr = model.save({}, {
        success: success,
        error: error
      });

      expect(oldXhr.abort).toHaveBeenCalled();
      expect(xhr.abort).not.toHaveBeenCalled();
      expect(model.$xhr['update']).toBe(xhr);
      expect(success).not.toHaveBeenCalled();
      expect(error).not.toHaveBeenCalled();

      xhr.success();
      expect(model.$xhr['update']).toBe(null);
      expect(success).toHaveBeenCalled();
      expect(success.callCount).toBe(1);
      expect(error).not.toHaveBeenCalled();
    });

    it('should skip update when a model is updated', function() {
      Backbone.safeSync = 'skip';
      var success = jasmine.createSpy('success');
      var error = jasmine.createSpy('error');

      var model = new Backbone.Model({
        id: 1
      });

      model.url = '/foo';

      var oldXhr = model.save({}, {
        success: success,
        error: error
      });

      var xhr = model.save({}, {
        success: success,
        error: error
      });

      expect(oldXhr.abort).not.toHaveBeenCalled();
      expect(xhr.abort).not.toHaveBeenCalled();
      expect(model.$xhr['update']).toBe(oldXhr);
      expect(success).not.toHaveBeenCalled();
      expect(error).not.toHaveBeenCalled();
    });

    it('should trigger parallel update when a model is updated', function() {
      Backbone.safeSync = false;
      var success = jasmine.createSpy('success');
      var error = jasmine.createSpy('error');

      var model = new Backbone.Model({
        id: 1
      });

      model.url = '/foo';

      var oldXhr = model.save({}, {
        success: success,
        error: error
      });

      var xhr = model.save({}, {
        success: success,
        error: error
      });

      expect(oldXhr.abort).not.toHaveBeenCalled();
      expect(xhr.abort).not.toHaveBeenCalled();
      expect(model.$xhr).not.toBeDefined();
      expect(success).not.toHaveBeenCalled();
      expect(error).not.toHaveBeenCalled();
    });

    it('should abort previous destroy when a model is destroyed', function() {
      var success = jasmine.createSpy('success');
      var error = jasmine.createSpy('error');

      var model = new Backbone.Model({
        id: 1
      });

      model.url = '/foo';

      var oldXhr = model.destroy({
        success: success,
        error: error
      });

      var xhr = model.destroy({
        success: success,
        error: error
      });

      expect(oldXhr.abort).toHaveBeenCalled();
      expect(xhr.abort).not.toHaveBeenCalled();
      expect(model.$xhr['delete']).toBe(xhr);
      expect(success).not.toHaveBeenCalled();
      expect(error).not.toHaveBeenCalled();

      xhr.success();
      expect(model.$xhr['delete']).toBe(null);
      expect(success).toHaveBeenCalled();
      expect(success.callCount).toBe(1);
      expect(error).not.toHaveBeenCalled();
    });

    it('should skip destroy when a model is destroyed', function() {
      Backbone.safeSync = 'skip';

      var success = jasmine.createSpy('success');
      var error = jasmine.createSpy('error');

      var model = new Backbone.Model({
        id: 1
      });

      model.url = '/foo';

      var oldXhr = model.destroy({
        success: success,
        error: error
      });

      var xhr = model.destroy({
        success: success,
        error: error
      });

      expect(oldXhr.abort).not.toHaveBeenCalled();
      expect(xhr.abort).not.toHaveBeenCalled();
      expect(model.$xhr['delete']).toBe(oldXhr);
      expect(success).not.toHaveBeenCalled();
      expect(error).not.toHaveBeenCalled();
    });

    it('should trigger parallel destroy when a model is destroyed', function() {
      Backbone.safeSync = false;

      var success = jasmine.createSpy('success');
      var error = jasmine.createSpy('error');

      var model = new Backbone.Model({
        id: 1
      });

      model.url = '/foo';

      var oldXhr = model.destroy({
        success: success,
        error: error
      });

      var xhr = model.destroy({
        success: success,
        error: error
      });

      expect(oldXhr.abort).not.toHaveBeenCalled();
      expect(xhr.abort).not.toHaveBeenCalled();
      expect(model.$xhr).not.toBeDefined();
      expect(success).not.toHaveBeenCalled();
      expect(error).not.toHaveBeenCalled();
    });
  });

  describe('Sync Collection Spec', function() {
    it('should fetch a collection and store current xhr', function() {
      var success = jasmine.createSpy('success');
      var error = jasmine.createSpy('error');

      var collection = new Backbone.Collection();
      collection.url = '/foo';

      var xhr = collection.fetch({
        success: success,
        error: error
      });

      expect(xhr).toBeDefined();
      expect(collection.$xhr).toBeDefined();
      expect(collection.$xhr['read']).toBe(xhr);
      expect(success).not.toHaveBeenCalled();
      expect(error).not.toHaveBeenCalled();

      xhr.success();
      expect(collection.$xhr['read']).toBe(null);
      expect(success).toHaveBeenCalled();
      expect(error).not.toHaveBeenCalled();
    });

    it('should abort previous fetch when a collection is fetched', function() {
      var success = jasmine.createSpy('success');
      var error = jasmine.createSpy('error');

      var collection = new Backbone.Collection();
      collection.url = '/foo';

      var oldXhr = collection.fetch({
        success: success,
        error: error
      });

      var xhr = collection.fetch({
        success: success,
        error: error
      });

      expect(oldXhr.abort).toHaveBeenCalled();
      expect(xhr.abort).not.toHaveBeenCalled();
      expect(collection.$xhr['read']).toBe(xhr);
      expect(success).not.toHaveBeenCalled();
      expect(error).not.toHaveBeenCalled();

      xhr.success();
      expect(collection.$xhr['read']).toBe(null);
      expect(success).toHaveBeenCalled();
      expect(success.callCount).toBe(1);
      expect(error).not.toHaveBeenCalled();
    });

    it('should skip fetch when a collection is fetched', function() {
      Backbone.safeSync = 'skip';

      var success = jasmine.createSpy('success');
      var error = jasmine.createSpy('error');

      var collection = new Backbone.Collection();
      collection.url = '/foo';

      var oldXhr = collection.fetch({
        success: success,
        error: error
      });

      var xhr = collection.fetch({
        success: success,
        error: error
      });

      expect(oldXhr.abort).not.toHaveBeenCalled();
      expect(xhr.abort).not.toHaveBeenCalled();
      expect(collection.$xhr['read']).toBe(oldXhr);
      expect(success).not.toHaveBeenCalled();
      expect(error).not.toHaveBeenCalled();
    });

    it('should trigger parallel fetch when a collection is fetched', function() {
      Backbone.safeSync = false;

      var success = jasmine.createSpy('success');
      var error = jasmine.createSpy('error');

      var collection = new Backbone.Collection();
      collection.url = '/foo';

      var oldXhr = collection.fetch({
        success: success,
        error: error
      });

      var xhr = collection.fetch({
        success: success,
        error: error
      });

      expect(oldXhr.abort).not.toHaveBeenCalled();
      expect(xhr.abort).not.toHaveBeenCalled();
      expect(collection.$xhr).not.toBeDefined(oldXhr);
      expect(success).not.toHaveBeenCalled();
      expect(error).not.toHaveBeenCalled();
    });
  });
});
