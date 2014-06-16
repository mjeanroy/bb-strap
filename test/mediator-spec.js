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

describe('Mediator Test Suite', function() {

  beforeEach(function() {
    Backbone.Mediator.$channels = {};
  });

  it('should have channels', function() {
    expect(Backbone.Mediator.$channels).toEqual({});
  });

  it('should subscribe to a channel', function() {
    var callback = jasmine.createSpy('callback');
    var channel = 'foo';

    Backbone.Mediator.subscribe(channel, callback);

    var $channels = Backbone.Mediator.$channels;
    expect($channels.foo).toBeDefined();
    expect($channels.foo.length).toBe(1);

    var subscribtion = $channels.foo[0];
    expect(subscribtion.fn).toBe(callback);
    expect(subscribtion.once).toBe(false);
    expect(subscribtion.ctx).toBeFalsy();
  });

  it('should subscribe to a channel with a context', function() {
    var callback = jasmine.createSpy('callback');
    var context = {};
    var channel = 'foo';

    Backbone.Mediator.subscribe(channel, callback, context);

    var $channels = Backbone.Mediator.$channels;
    expect($channels.foo).toBeDefined();
    expect($channels.foo.length).toBe(1);

    var subscribtion = $channels.foo[0];
    expect(subscribtion.fn).toBe(callback);
    expect(subscribtion.once).toBe(false);
    expect(subscribtion.ctx).toBe(context);
  });

  it('should subscribe to a channel with a context and once', function() {
    var callback = jasmine.createSpy('callback');
    var context = {};
    var channel = 'foo';
    var once = true;

    Backbone.Mediator.subscribe(channel, callback, context, once);

    var $channels = Backbone.Mediator.$channels;
    expect($channels.foo).toBeDefined();
    expect($channels.foo.length).toBe(1);

    var subscribtion = $channels.foo[0];
    expect(subscribtion.fn).toBe(callback);
    expect(subscribtion.once).toBe(once);
    expect(subscribtion.ctx).toBe(context);
  });

  it('should subscribe to a channel once', function() {
    var callback = jasmine.createSpy('callback');
    var context = {};
    var channel = 'foo';

    Backbone.Mediator.subscribeOnce(channel, callback, context);

    var $channels = Backbone.Mediator.$channels;
    expect($channels.foo).toBeDefined();
    expect($channels.foo.length).toBe(1);

    var subscribtion = $channels.foo[0];
    expect(subscribtion.fn).toBe(callback);
    expect(subscribtion.once).toBe(true);
    expect(subscribtion.ctx).toBe(context);
  });

  it('should publish to a channel', function() {
    var channel = 'foo';
    var callback1 = jasmine.createSpy('callback');
    var callback2 = jasmine.createSpy('callback');

    Backbone.Mediator.$channels[channel] = [];
    Backbone.Mediator.$channels[channel].push({
      fn: callback1
    });
    Backbone.Mediator.$channels[channel].push({
      fn: callback2
    });

    Backbone.Mediator.publish(channel);

    expect(callback1).toHaveBeenCalledWith();
    expect(callback2).toHaveBeenCalledWith();
    expect(Backbone.Mediator.$channels[channel].length).toBe(2);
  });

  it('should publish to a channel with arguments', function() {
    var channel = 'foo';
    var arg1 = 'bar';
    var arg2 = 'foobar';
    var callback1 = jasmine.createSpy('callback');
    var callback2 = jasmine.createSpy('callback');

    Backbone.Mediator.$channels[channel] = [];
    Backbone.Mediator.$channels[channel].push({
      fn: callback1
    });
    Backbone.Mediator.$channels[channel].push({
      fn: callback2
    });

    Backbone.Mediator.publish(channel, arg1, arg2);

    expect(callback1).toHaveBeenCalledWith(arg1, arg2);
    expect(callback2).toHaveBeenCalledWith(arg1, arg2);
    expect(Backbone.Mediator.$channels[channel].length).toBe(2);
  });

  it('should publish to a channel and unsubscribe once subscribtion', function() {
    var channel = 'foo';
    var arg1 = 'bar';
    var arg2 = 'foobar';
    var callback1 = jasmine.createSpy('callback');
    var callback2 = jasmine.createSpy('callback');

    Backbone.Mediator.$channels[channel] = [];
    Backbone.Mediator.$channels[channel].push({
      fn: callback1,
      once: true
    });
    Backbone.Mediator.$channels[channel].push({
      fn: callback2
    });

    var oldChannels = Backbone.Mediator.$channels[channel];

    Backbone.Mediator.publish(channel, arg1, arg2);

    expect(callback1).toHaveBeenCalledWith(arg1, arg2);
    expect(callback2).toHaveBeenCalledWith(arg1, arg2);
    expect(Backbone.Mediator.$channels[channel].length).toBe(1);
    expect(Backbone.Mediator.$channels[channel][0].fn).toBe(callback2);
    expect(Backbone.Mediator.$channels[channel]).toBe(oldChannels);
  });

  it('should unsubscribe all channels', function() {
    var channel1 = 'foo';
    var channel2 = 'bar';
    var callback1 = jasmine.createSpy('callback');
    var callback2 = jasmine.createSpy('callback');

    Backbone.Mediator.$channels[channel1] = [];
    Backbone.Mediator.$channels[channel2] = [];

    Backbone.Mediator.$channels[channel1].push({
      fn: callback1,
    });

    Backbone.Mediator.$channels[channel2].push({
      fn: callback2
    });

    Backbone.Mediator.unsubscribe();

    expect(Backbone.Mediator.$channels).toEqual({});
  });

  it('should unsubscribe a given channel', function() {
    var channel1 = 'foo';
    var channel2 = 'bar';
    var callback1 = jasmine.createSpy('callback');
    var callback2 = jasmine.createSpy('callback');

    Backbone.Mediator.$channels[channel1] = [];
    Backbone.Mediator.$channels[channel2] = [];

    Backbone.Mediator.$channels[channel1].push({
      fn: callback1,
    });

    Backbone.Mediator.$channels[channel2].push({
      fn: callback2
    });

    var oldChannel1 = Backbone.Mediator.$channels[channel1];
    var oldChannel2 = Backbone.Mediator.$channels[channel2];

    Backbone.Mediator.unsubscribe(channel1);

    expect(Backbone.Mediator.$channels).not.toEqual({});
    expect(Backbone.Mediator.$channels[channel1]).toBeDefined();
    expect(Backbone.Mediator.$channels[channel1]).toEqual([]);
    expect(Backbone.Mediator.$channels[channel1]).toBe(oldChannel1);

    expect(Backbone.Mediator.$channels[channel2]).toBeDefined();
    expect(Backbone.Mediator.$channels[channel2].length).toBe(1);
    expect(Backbone.Mediator.$channels[channel2][0].fn).toBe(callback2);
    expect(Backbone.Mediator.$channels[channel2]).toBe(oldChannel2);
  });

  it('should unsubscribe a given subscribtion on a given channel', function() {
    var channel1 = 'foo';
    var callback1 = jasmine.createSpy('callback');
    var callback2 = jasmine.createSpy('callback');

    Backbone.Mediator.$channels[channel1] = [];

    Backbone.Mediator.$channels[channel1].push({
      fn: callback1
    });

    Backbone.Mediator.$channels[channel1].push({
      fn: callback2
    });

    var oldChannel = Backbone.Mediator.$channels[channel1];

    Backbone.Mediator.unsubscribe(channel1, callback2);

    expect(Backbone.Mediator.$channels).not.toEqual({});
    expect(Backbone.Mediator.$channels[channel1]).toBeDefined();
    expect(Backbone.Mediator.$channels[channel1].length).toBe(1);
    expect(Backbone.Mediator.$channels[channel1][0].fn).toBe(callback1);
    expect(Backbone.Mediator.$channels[channel1]).toBe(oldChannel);
  });

  it('should unsubscribe a given subscribtion related to a given context on a given channel', function() {
    var channel1 = 'foo';
    var ctx1 = {};
    var ctx2 = {};
    var callback = jasmine.createSpy('callback');

    Backbone.Mediator.$channels[channel1] = [];

    Backbone.Mediator.$channels[channel1].push({
      fn: callback,
      ctx: ctx1
    });

    Backbone.Mediator.$channels[channel1].push({
      fn: callback,
      ctx: ctx2
    });

    var oldChannels = Backbone.Mediator.$channels[channel1];

    Backbone.Mediator.unsubscribe(channel1, callback, ctx2);

    expect(Backbone.Mediator.$channels).not.toEqual({});
    expect(Backbone.Mediator.$channels[channel1]).toBeDefined();
    expect(Backbone.Mediator.$channels[channel1].length).toBe(1);
    expect(Backbone.Mediator.$channels[channel1][0].fn).toBe(callback);
    expect(Backbone.Mediator.$channels[channel1][0].ctx).toBe(ctx1);
    expect(Backbone.Mediator.$channels[channel1]).toBe(oldChannels);
  });

  it('should have publish / subscribe shortcuts', function() {
    expect(Backbone.Mediator.sub).toBe(Backbone.Mediator.subscribe);
    expect(Backbone.Mediator.subOnce).toBe(Backbone.Mediator.subscribeOnce);
    expect(Backbone.Mediator.pub).toBe(Backbone.Mediator.publish);
  });
});