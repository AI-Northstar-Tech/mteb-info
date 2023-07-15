const p$1 = function polyfill() {
    const relList = document.createElement('link').relList;
    if (relList && relList.supports && relList.supports('modulepreload')) {
        return;
    }
    for (const link of document.querySelectorAll('link[rel="modulepreload"]')) {
        processPreload(link);
    }
    new MutationObserver((mutations) => {
        for (const mutation of mutations) {
            if (mutation.type !== 'childList') {
                continue;
            }
            for (const node of mutation.addedNodes) {
                if (node.tagName === 'LINK' && node.rel === 'modulepreload')
                    processPreload(node);
            }
        }
    }).observe(document, { childList: true, subtree: true });
    function getFetchOpts(script) {
        const fetchOpts = {};
        if (script.integrity)
            fetchOpts.integrity = script.integrity;
        if (script.referrerpolicy)
            fetchOpts.referrerPolicy = script.referrerpolicy;
        if (script.crossorigin === 'use-credentials')
            fetchOpts.credentials = 'include';
        else if (script.crossorigin === 'anonymous')
            fetchOpts.credentials = 'omit';
        else
            fetchOpts.credentials = 'same-origin';
        return fetchOpts;
    }
    function processPreload(link) {
        if (link.ep)
            // ep marker = processed
            return;
        link.ep = true;
        // prepopulate the load record
        const fetchOpts = getFetchOpts(link);
        fetch(link.href, fetchOpts);
    }
};true&&p$1();

function noop() { }
const identity = x => x;
function assign(tar, src) {
    // @ts-ignore
    for (const k in src)
        tar[k] = src[k];
    return tar;
}
function run(fn) {
    return fn();
}
function blank_object() {
    return Object.create(null);
}
function run_all(fns) {
    fns.forEach(run);
}
function is_function(thing) {
    return typeof thing === 'function';
}
function safe_not_equal(a, b) {
    return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
}
let src_url_equal_anchor;
function src_url_equal(element_src, url) {
    if (!src_url_equal_anchor) {
        src_url_equal_anchor = document.createElement('a');
    }
    src_url_equal_anchor.href = url;
    return element_src === src_url_equal_anchor.href;
}
function is_empty(obj) {
    return Object.keys(obj).length === 0;
}
function subscribe(store, ...callbacks) {
    if (store == null) {
        return noop;
    }
    const unsub = store.subscribe(...callbacks);
    return unsub.unsubscribe ? () => unsub.unsubscribe() : unsub;
}
function get_store_value(store) {
    let value;
    subscribe(store, _ => value = _)();
    return value;
}
function component_subscribe(component, store, callback) {
    component.$$.on_destroy.push(subscribe(store, callback));
}
function create_slot(definition, ctx, $$scope, fn) {
    if (definition) {
        const slot_ctx = get_slot_context(definition, ctx, $$scope, fn);
        return definition[0](slot_ctx);
    }
}
function get_slot_context(definition, ctx, $$scope, fn) {
    return definition[1] && fn
        ? assign($$scope.ctx.slice(), definition[1](fn(ctx)))
        : $$scope.ctx;
}
function get_slot_changes(definition, $$scope, dirty, fn) {
    if (definition[2] && fn) {
        const lets = definition[2](fn(dirty));
        if ($$scope.dirty === undefined) {
            return lets;
        }
        if (typeof lets === 'object') {
            const merged = [];
            const len = Math.max($$scope.dirty.length, lets.length);
            for (let i = 0; i < len; i += 1) {
                merged[i] = $$scope.dirty[i] | lets[i];
            }
            return merged;
        }
        return $$scope.dirty | lets;
    }
    return $$scope.dirty;
}
function update_slot_base(slot, slot_definition, ctx, $$scope, slot_changes, get_slot_context_fn) {
    if (slot_changes) {
        const slot_context = get_slot_context(slot_definition, ctx, $$scope, get_slot_context_fn);
        slot.p(slot_context, slot_changes);
    }
}
function get_all_dirty_from_scope($$scope) {
    if ($$scope.ctx.length > 32) {
        const dirty = [];
        const length = $$scope.ctx.length / 32;
        for (let i = 0; i < length; i++) {
            dirty[i] = -1;
        }
        return dirty;
    }
    return -1;
}
function set_store_value(store, ret, value) {
    store.set(value);
    return ret;
}
function action_destroyer(action_result) {
    return action_result && is_function(action_result.destroy) ? action_result.destroy : noop;
}

const is_client = typeof window !== 'undefined';
let now = is_client
    ? () => window.performance.now()
    : () => Date.now();
let raf = is_client ? cb => requestAnimationFrame(cb) : noop;

const tasks = new Set();
function run_tasks(now) {
    tasks.forEach(task => {
        if (!task.c(now)) {
            tasks.delete(task);
            task.f();
        }
    });
    if (tasks.size !== 0)
        raf(run_tasks);
}
/**
 * Creates a new task that runs on each raf frame
 * until it returns a falsy value or is aborted
 */
function loop(callback) {
    let task;
    if (tasks.size === 0)
        raf(run_tasks);
    return {
        promise: new Promise(fulfill => {
            tasks.add(task = { c: callback, f: fulfill });
        }),
        abort() {
            tasks.delete(task);
        }
    };
}
function append(target, node) {
    target.appendChild(node);
}
function get_root_for_style(node) {
    if (!node)
        return document;
    const root = node.getRootNode ? node.getRootNode() : node.ownerDocument;
    if (root && root.host) {
        return root;
    }
    return node.ownerDocument;
}
function append_empty_stylesheet(node) {
    const style_element = element('style');
    append_stylesheet(get_root_for_style(node), style_element);
    return style_element.sheet;
}
function append_stylesheet(node, style) {
    append(node.head || node, style);
}
function insert(target, node, anchor) {
    target.insertBefore(node, anchor || null);
}
function detach(node) {
    node.parentNode.removeChild(node);
}
function destroy_each(iterations, detaching) {
    for (let i = 0; i < iterations.length; i += 1) {
        if (iterations[i])
            iterations[i].d(detaching);
    }
}
function element(name) {
    return document.createElement(name);
}
function svg_element(name) {
    return document.createElementNS('http://www.w3.org/2000/svg', name);
}
function text(data) {
    return document.createTextNode(data);
}
function space() {
    return text(' ');
}
function empty() {
    return text('');
}
function listen(node, event, handler, options) {
    node.addEventListener(event, handler, options);
    return () => node.removeEventListener(event, handler, options);
}
function prevent_default(fn) {
    return function (event) {
        event.preventDefault();
        // @ts-ignore
        return fn.call(this, event);
    };
}
function stop_propagation(fn) {
    return function (event) {
        event.stopPropagation();
        // @ts-ignore
        return fn.call(this, event);
    };
}
function attr(node, attribute, value) {
    if (value == null)
        node.removeAttribute(attribute);
    else if (node.getAttribute(attribute) !== value)
        node.setAttribute(attribute, value);
}
function set_attributes(node, attributes) {
    // @ts-ignore
    const descriptors = Object.getOwnPropertyDescriptors(node.__proto__);
    for (const key in attributes) {
        if (attributes[key] == null) {
            node.removeAttribute(key);
        }
        else if (key === 'style') {
            node.style.cssText = attributes[key];
        }
        else if (key === '__value') {
            node.value = node[key] = attributes[key];
        }
        else if (descriptors[key] && descriptors[key].set) {
            node[key] = attributes[key];
        }
        else {
            attr(node, key, attributes[key]);
        }
    }
}
function to_number(value) {
    return value === '' ? null : +value;
}
function children(element) {
    return Array.from(element.childNodes);
}
function set_data(text, data) {
    data = '' + data;
    if (text.wholeText !== data)
        text.data = data;
}
function set_input_value(input, value) {
    input.value = value == null ? '' : value;
}
function set_style(node, key, value, important) {
    if (value === null) {
        node.style.removeProperty(key);
    }
    else {
        node.style.setProperty(key, value, important ? 'important' : '');
    }
}
function select_option(select, value) {
    for (let i = 0; i < select.options.length; i += 1) {
        const option = select.options[i];
        if (option.__value === value) {
            option.selected = true;
            return;
        }
    }
    select.selectedIndex = -1; // no option should be selected
}
function select_value(select) {
    const selected_option = select.querySelector(':checked') || select.options[0];
    return selected_option && selected_option.__value;
}
// unfortunately this can't be a constant as that wouldn't be tree-shakeable
// so we cache the result instead
let crossorigin;
function is_crossorigin() {
    if (crossorigin === undefined) {
        crossorigin = false;
        try {
            if (typeof window !== 'undefined' && window.parent) {
                void window.parent.document;
            }
        }
        catch (error) {
            crossorigin = true;
        }
    }
    return crossorigin;
}
function add_resize_listener(node, fn) {
    const computed_style = getComputedStyle(node);
    if (computed_style.position === 'static') {
        node.style.position = 'relative';
    }
    const iframe = element('iframe');
    iframe.setAttribute('style', 'display: block; position: absolute; top: 0; left: 0; width: 100%; height: 100%; ' +
        'overflow: hidden; border: 0; opacity: 0; pointer-events: none; z-index: -1;');
    iframe.setAttribute('aria-hidden', 'true');
    iframe.tabIndex = -1;
    const crossorigin = is_crossorigin();
    let unsubscribe;
    if (crossorigin) {
        iframe.src = "data:text/html,<script>onresize=function(){parent.postMessage(0,'*')}</script>";
        unsubscribe = listen(window, 'message', (event) => {
            if (event.source === iframe.contentWindow)
                fn();
        });
    }
    else {
        iframe.src = 'about:blank';
        iframe.onload = () => {
            unsubscribe = listen(iframe.contentWindow, 'resize', fn);
        };
    }
    append(node, iframe);
    return () => {
        if (crossorigin) {
            unsubscribe();
        }
        else if (unsubscribe && iframe.contentWindow) {
            unsubscribe();
        }
        detach(iframe);
    };
}
function toggle_class(element, name, toggle) {
    element.classList[toggle ? 'add' : 'remove'](name);
}
function custom_event(type, detail, { bubbles = false, cancelable = false } = {}) {
    const e = document.createEvent('CustomEvent');
    e.initCustomEvent(type, bubbles, cancelable, detail);
    return e;
}
class HtmlTag {
    constructor(is_svg = false) {
        this.is_svg = false;
        this.is_svg = is_svg;
        this.e = this.n = null;
    }
    c(html) {
        this.h(html);
    }
    m(html, target, anchor = null) {
        if (!this.e) {
            if (this.is_svg)
                this.e = svg_element(target.nodeName);
            else
                this.e = element(target.nodeName);
            this.t = target;
            this.c(html);
        }
        this.i(anchor);
    }
    h(html) {
        this.e.innerHTML = html;
        this.n = Array.from(this.e.childNodes);
    }
    i(anchor) {
        for (let i = 0; i < this.n.length; i += 1) {
            insert(this.t, this.n[i], anchor);
        }
    }
    p(html) {
        this.d();
        this.h(html);
        this.i(this.a);
    }
    d() {
        this.n.forEach(detach);
    }
}

// we need to store the information for multiple documents because a Svelte application could also contain iframes
// https://github.com/sveltejs/svelte/issues/3624
const managed_styles = new Map();
let active = 0;
// https://github.com/darkskyapp/string-hash/blob/master/index.js
function hash(str) {
    let hash = 5381;
    let i = str.length;
    while (i--)
        hash = ((hash << 5) - hash) ^ str.charCodeAt(i);
    return hash >>> 0;
}
function create_style_information(doc, node) {
    const info = { stylesheet: append_empty_stylesheet(node), rules: {} };
    managed_styles.set(doc, info);
    return info;
}
function create_rule(node, a, b, duration, delay, ease, fn, uid = 0) {
    const step = 16.666 / duration;
    let keyframes = '{\n';
    for (let p = 0; p <= 1; p += step) {
        const t = a + (b - a) * ease(p);
        keyframes += p * 100 + `%{${fn(t, 1 - t)}}\n`;
    }
    const rule = keyframes + `100% {${fn(b, 1 - b)}}\n}`;
    const name = `__svelte_${hash(rule)}_${uid}`;
    const doc = get_root_for_style(node);
    const { stylesheet, rules } = managed_styles.get(doc) || create_style_information(doc, node);
    if (!rules[name]) {
        rules[name] = true;
        stylesheet.insertRule(`@keyframes ${name} ${rule}`, stylesheet.cssRules.length);
    }
    const animation = node.style.animation || '';
    node.style.animation = `${animation ? `${animation}, ` : ''}${name} ${duration}ms linear ${delay}ms 1 both`;
    active += 1;
    return name;
}
function delete_rule(node, name) {
    const previous = (node.style.animation || '').split(', ');
    const next = previous.filter(name
        ? anim => anim.indexOf(name) < 0 // remove specific animation
        : anim => anim.indexOf('__svelte') === -1 // remove all Svelte animations
    );
    const deleted = previous.length - next.length;
    if (deleted) {
        node.style.animation = next.join(', ');
        active -= deleted;
        if (!active)
            clear_rules();
    }
}
function clear_rules() {
    raf(() => {
        if (active)
            return;
        managed_styles.forEach(info => {
            const { stylesheet } = info;
            let i = stylesheet.cssRules.length;
            while (i--)
                stylesheet.deleteRule(i);
            info.rules = {};
        });
        managed_styles.clear();
    });
}

let current_component;
function set_current_component(component) {
    current_component = component;
}
function get_current_component() {
    if (!current_component)
        throw new Error('Function called outside component initialization');
    return current_component;
}
function beforeUpdate(fn) {
    get_current_component().$$.before_update.push(fn);
}
function onMount(fn) {
    get_current_component().$$.on_mount.push(fn);
}
function afterUpdate(fn) {
    get_current_component().$$.after_update.push(fn);
}
function onDestroy(fn) {
    get_current_component().$$.on_destroy.push(fn);
}
function createEventDispatcher() {
    const component = get_current_component();
    return (type, detail, { cancelable = false } = {}) => {
        const callbacks = component.$$.callbacks[type];
        if (callbacks) {
            // TODO are there situations where events could be dispatched
            // in a server (non-DOM) environment?
            const event = custom_event(type, detail, { cancelable });
            callbacks.slice().forEach(fn => {
                fn.call(component, event);
            });
            return !event.defaultPrevented;
        }
        return true;
    };
}
function setContext(key, context) {
    get_current_component().$$.context.set(key, context);
    return context;
}
function getContext(key) {
    return get_current_component().$$.context.get(key);
}
// TODO figure out if we still want to support
// shorthand events, or if we want to implement
// a real bubbling mechanism
function bubble(component, event) {
    const callbacks = component.$$.callbacks[event.type];
    if (callbacks) {
        // @ts-ignore
        callbacks.slice().forEach(fn => fn.call(this, event));
    }
}

const dirty_components = [];
const binding_callbacks = [];
const render_callbacks = [];
const flush_callbacks = [];
const resolved_promise = Promise.resolve();
let update_scheduled = false;
function schedule_update() {
    if (!update_scheduled) {
        update_scheduled = true;
        resolved_promise.then(flush);
    }
}
function tick() {
    schedule_update();
    return resolved_promise;
}
function add_render_callback(fn) {
    render_callbacks.push(fn);
}
function add_flush_callback(fn) {
    flush_callbacks.push(fn);
}
// flush() calls callbacks in this order:
// 1. All beforeUpdate callbacks, in order: parents before children
// 2. All bind:this callbacks, in reverse order: children before parents.
// 3. All afterUpdate callbacks, in order: parents before children. EXCEPT
//    for afterUpdates called during the initial onMount, which are called in
//    reverse order: children before parents.
// Since callbacks might update component values, which could trigger another
// call to flush(), the following steps guard against this:
// 1. During beforeUpdate, any updated components will be added to the
//    dirty_components array and will cause a reentrant call to flush(). Because
//    the flush index is kept outside the function, the reentrant call will pick
//    up where the earlier call left off and go through all dirty components. The
//    current_component value is saved and restored so that the reentrant call will
//    not interfere with the "parent" flush() call.
// 2. bind:this callbacks cannot trigger new flush() calls.
// 3. During afterUpdate, any updated components will NOT have their afterUpdate
//    callback called a second time; the seen_callbacks set, outside the flush()
//    function, guarantees this behavior.
const seen_callbacks = new Set();
let flushidx = 0; // Do *not* move this inside the flush() function
function flush() {
    const saved_component = current_component;
    do {
        // first, call beforeUpdate functions
        // and update components
        while (flushidx < dirty_components.length) {
            const component = dirty_components[flushidx];
            flushidx++;
            set_current_component(component);
            update(component.$$);
        }
        set_current_component(null);
        dirty_components.length = 0;
        flushidx = 0;
        while (binding_callbacks.length)
            binding_callbacks.pop()();
        // then, once components are updated, call
        // afterUpdate functions. This may cause
        // subsequent updates...
        for (let i = 0; i < render_callbacks.length; i += 1) {
            const callback = render_callbacks[i];
            if (!seen_callbacks.has(callback)) {
                // ...so guard against infinite loops
                seen_callbacks.add(callback);
                callback();
            }
        }
        render_callbacks.length = 0;
    } while (dirty_components.length);
    while (flush_callbacks.length) {
        flush_callbacks.pop()();
    }
    update_scheduled = false;
    seen_callbacks.clear();
    set_current_component(saved_component);
}
function update($$) {
    if ($$.fragment !== null) {
        $$.update();
        run_all($$.before_update);
        const dirty = $$.dirty;
        $$.dirty = [-1];
        $$.fragment && $$.fragment.p($$.ctx, dirty);
        $$.after_update.forEach(add_render_callback);
    }
}

let promise;
function wait() {
    if (!promise) {
        promise = Promise.resolve();
        promise.then(() => {
            promise = null;
        });
    }
    return promise;
}
function dispatch(node, direction, kind) {
    node.dispatchEvent(custom_event(`${direction ? 'intro' : 'outro'}${kind}`));
}
const outroing = new Set();
let outros;
function group_outros() {
    outros = {
        r: 0,
        c: [],
        p: outros // parent group
    };
}
function check_outros() {
    if (!outros.r) {
        run_all(outros.c);
    }
    outros = outros.p;
}
function transition_in(block, local) {
    if (block && block.i) {
        outroing.delete(block);
        block.i(local);
    }
}
function transition_out(block, local, detach, callback) {
    if (block && block.o) {
        if (outroing.has(block))
            return;
        outroing.add(block);
        outros.c.push(() => {
            outroing.delete(block);
            if (callback) {
                if (detach)
                    block.d(1);
                callback();
            }
        });
        block.o(local);
    }
    else if (callback) {
        callback();
    }
}
const null_transition = { duration: 0 };
function create_in_transition(node, fn, params) {
    let config = fn(node, params);
    let running = false;
    let animation_name;
    let task;
    let uid = 0;
    function cleanup() {
        if (animation_name)
            delete_rule(node, animation_name);
    }
    function go() {
        const { delay = 0, duration = 300, easing = identity, tick = noop, css } = config || null_transition;
        if (css)
            animation_name = create_rule(node, 0, 1, duration, delay, easing, css, uid++);
        tick(0, 1);
        const start_time = now() + delay;
        const end_time = start_time + duration;
        if (task)
            task.abort();
        running = true;
        add_render_callback(() => dispatch(node, true, 'start'));
        task = loop(now => {
            if (running) {
                if (now >= end_time) {
                    tick(1, 0);
                    dispatch(node, true, 'end');
                    cleanup();
                    return running = false;
                }
                if (now >= start_time) {
                    const t = easing((now - start_time) / duration);
                    tick(t, 1 - t);
                }
            }
            return running;
        });
    }
    let started = false;
    return {
        start() {
            if (started)
                return;
            started = true;
            delete_rule(node);
            if (is_function(config)) {
                config = config();
                wait().then(go);
            }
            else {
                go();
            }
        },
        invalidate() {
            started = false;
        },
        end() {
            if (running) {
                cleanup();
                running = false;
            }
        }
    };
}
function create_out_transition(node, fn, params) {
    let config = fn(node, params);
    let running = true;
    let animation_name;
    const group = outros;
    group.r += 1;
    function go() {
        const { delay = 0, duration = 300, easing = identity, tick = noop, css } = config || null_transition;
        if (css)
            animation_name = create_rule(node, 1, 0, duration, delay, easing, css);
        const start_time = now() + delay;
        const end_time = start_time + duration;
        add_render_callback(() => dispatch(node, false, 'start'));
        loop(now => {
            if (running) {
                if (now >= end_time) {
                    tick(0, 1);
                    dispatch(node, false, 'end');
                    if (!--group.r) {
                        // this will result in `end()` being called,
                        // so we don't need to clean up here
                        run_all(group.c);
                    }
                    return false;
                }
                if (now >= start_time) {
                    const t = easing((now - start_time) / duration);
                    tick(1 - t, t);
                }
            }
            return running;
        });
    }
    if (is_function(config)) {
        wait().then(() => {
            // @ts-ignore
            config = config();
            go();
        });
    }
    else {
        go();
    }
    return {
        end(reset) {
            if (reset && config.tick) {
                config.tick(1, 0);
            }
            if (running) {
                if (animation_name)
                    delete_rule(node, animation_name);
                running = false;
            }
        }
    };
}
function create_bidirectional_transition(node, fn, params, intro) {
    let config = fn(node, params);
    let t = intro ? 0 : 1;
    let running_program = null;
    let pending_program = null;
    let animation_name = null;
    function clear_animation() {
        if (animation_name)
            delete_rule(node, animation_name);
    }
    function init(program, duration) {
        const d = (program.b - t);
        duration *= Math.abs(d);
        return {
            a: t,
            b: program.b,
            d,
            duration,
            start: program.start,
            end: program.start + duration,
            group: program.group
        };
    }
    function go(b) {
        const { delay = 0, duration = 300, easing = identity, tick = noop, css } = config || null_transition;
        const program = {
            start: now() + delay,
            b
        };
        if (!b) {
            // @ts-ignore todo: improve typings
            program.group = outros;
            outros.r += 1;
        }
        if (running_program || pending_program) {
            pending_program = program;
        }
        else {
            // if this is an intro, and there's a delay, we need to do
            // an initial tick and/or apply CSS animation immediately
            if (css) {
                clear_animation();
                animation_name = create_rule(node, t, b, duration, delay, easing, css);
            }
            if (b)
                tick(0, 1);
            running_program = init(program, duration);
            add_render_callback(() => dispatch(node, b, 'start'));
            loop(now => {
                if (pending_program && now > pending_program.start) {
                    running_program = init(pending_program, duration);
                    pending_program = null;
                    dispatch(node, running_program.b, 'start');
                    if (css) {
                        clear_animation();
                        animation_name = create_rule(node, t, running_program.b, running_program.duration, 0, easing, config.css);
                    }
                }
                if (running_program) {
                    if (now >= running_program.end) {
                        tick(t = running_program.b, 1 - t);
                        dispatch(node, running_program.b, 'end');
                        if (!pending_program) {
                            // we're done
                            if (running_program.b) {
                                // intro — we can tidy up immediately
                                clear_animation();
                            }
                            else {
                                // outro — needs to be coordinated
                                if (!--running_program.group.r)
                                    run_all(running_program.group.c);
                            }
                        }
                        running_program = null;
                    }
                    else if (now >= running_program.start) {
                        const p = now - running_program.start;
                        t = running_program.a + running_program.d * easing(p / running_program.duration);
                        tick(t, 1 - t);
                    }
                }
                return !!(running_program || pending_program);
            });
        }
    }
    return {
        run(b) {
            if (is_function(config)) {
                wait().then(() => {
                    // @ts-ignore
                    config = config();
                    go(b);
                });
            }
            else {
                go(b);
            }
        },
        end() {
            clear_animation();
            running_program = pending_program = null;
        }
    };
}

const globals = (typeof window !== 'undefined'
    ? window
    : typeof globalThis !== 'undefined'
        ? globalThis
        : global);

function destroy_block(block, lookup) {
    block.d(1);
    lookup.delete(block.key);
}
function outro_and_destroy_block(block, lookup) {
    transition_out(block, 1, 1, () => {
        lookup.delete(block.key);
    });
}
function update_keyed_each(old_blocks, dirty, get_key, dynamic, ctx, list, lookup, node, destroy, create_each_block, next, get_context) {
    let o = old_blocks.length;
    let n = list.length;
    let i = o;
    const old_indexes = {};
    while (i--)
        old_indexes[old_blocks[i].key] = i;
    const new_blocks = [];
    const new_lookup = new Map();
    const deltas = new Map();
    i = n;
    while (i--) {
        const child_ctx = get_context(ctx, list, i);
        const key = get_key(child_ctx);
        let block = lookup.get(key);
        if (!block) {
            block = create_each_block(key, child_ctx);
            block.c();
        }
        else if (dynamic) {
            block.p(child_ctx, dirty);
        }
        new_lookup.set(key, new_blocks[i] = block);
        if (key in old_indexes)
            deltas.set(key, Math.abs(i - old_indexes[key]));
    }
    const will_move = new Set();
    const did_move = new Set();
    function insert(block) {
        transition_in(block, 1);
        block.m(node, next);
        lookup.set(block.key, block);
        next = block.first;
        n--;
    }
    while (o && n) {
        const new_block = new_blocks[n - 1];
        const old_block = old_blocks[o - 1];
        const new_key = new_block.key;
        const old_key = old_block.key;
        if (new_block === old_block) {
            // do nothing
            next = new_block.first;
            o--;
            n--;
        }
        else if (!new_lookup.has(old_key)) {
            // remove old block
            destroy(old_block, lookup);
            o--;
        }
        else if (!lookup.has(new_key) || will_move.has(new_key)) {
            insert(new_block);
        }
        else if (did_move.has(old_key)) {
            o--;
        }
        else if (deltas.get(new_key) > deltas.get(old_key)) {
            did_move.add(new_key);
            insert(new_block);
        }
        else {
            will_move.add(old_key);
            o--;
        }
    }
    while (o--) {
        const old_block = old_blocks[o];
        if (!new_lookup.has(old_block.key))
            destroy(old_block, lookup);
    }
    while (n)
        insert(new_blocks[n - 1]);
    return new_blocks;
}

function get_spread_update(levels, updates) {
    const update = {};
    const to_null_out = {};
    const accounted_for = { $$scope: 1 };
    let i = levels.length;
    while (i--) {
        const o = levels[i];
        const n = updates[i];
        if (n) {
            for (const key in o) {
                if (!(key in n))
                    to_null_out[key] = 1;
            }
            for (const key in n) {
                if (!accounted_for[key]) {
                    update[key] = n[key];
                    accounted_for[key] = 1;
                }
            }
            levels[i] = n;
        }
        else {
            for (const key in o) {
                accounted_for[key] = 1;
            }
        }
    }
    for (const key in to_null_out) {
        if (!(key in update))
            update[key] = undefined;
    }
    return update;
}
function get_spread_object(spread_props) {
    return typeof spread_props === 'object' && spread_props !== null ? spread_props : {};
}

function bind(component, name, callback) {
    const index = component.$$.props[name];
    if (index !== undefined) {
        component.$$.bound[index] = callback;
        callback(component.$$.ctx[index]);
    }
}
function create_component(block) {
    block && block.c();
}
function mount_component(component, target, anchor, customElement) {
    const { fragment, on_mount, on_destroy, after_update } = component.$$;
    fragment && fragment.m(target, anchor);
    if (!customElement) {
        // onMount happens before the initial afterUpdate
        add_render_callback(() => {
            const new_on_destroy = on_mount.map(run).filter(is_function);
            if (on_destroy) {
                on_destroy.push(...new_on_destroy);
            }
            else {
                // Edge case - component was destroyed immediately,
                // most likely as a result of a binding initialising
                run_all(new_on_destroy);
            }
            component.$$.on_mount = [];
        });
    }
    after_update.forEach(add_render_callback);
}
function destroy_component(component, detaching) {
    const $$ = component.$$;
    if ($$.fragment !== null) {
        run_all($$.on_destroy);
        $$.fragment && $$.fragment.d(detaching);
        // TODO null out other refs, including component.$$ (but need to
        // preserve final state?)
        $$.on_destroy = $$.fragment = null;
        $$.ctx = [];
    }
}
function make_dirty(component, i) {
    if (component.$$.dirty[0] === -1) {
        dirty_components.push(component);
        schedule_update();
        component.$$.dirty.fill(0);
    }
    component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
}
function init(component, options, instance, create_fragment, not_equal, props, append_styles, dirty = [-1]) {
    const parent_component = current_component;
    set_current_component(component);
    const $$ = component.$$ = {
        fragment: null,
        ctx: null,
        // state
        props,
        update: noop,
        not_equal,
        bound: blank_object(),
        // lifecycle
        on_mount: [],
        on_destroy: [],
        on_disconnect: [],
        before_update: [],
        after_update: [],
        context: new Map(options.context || (parent_component ? parent_component.$$.context : [])),
        // everything else
        callbacks: blank_object(),
        dirty,
        skip_bound: false,
        root: options.target || parent_component.$$.root
    };
    append_styles && append_styles($$.root);
    let ready = false;
    $$.ctx = instance
        ? instance(component, options.props || {}, (i, ret, ...rest) => {
            const value = rest.length ? rest[0] : ret;
            if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                if (!$$.skip_bound && $$.bound[i])
                    $$.bound[i](value);
                if (ready)
                    make_dirty(component, i);
            }
            return ret;
        })
        : [];
    $$.update();
    ready = true;
    run_all($$.before_update);
    // `false` as a special case of no DOM component
    $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
    if (options.target) {
        if (options.hydrate) {
            const nodes = children(options.target);
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            $$.fragment && $$.fragment.l(nodes);
            nodes.forEach(detach);
        }
        else {
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            $$.fragment && $$.fragment.c();
        }
        if (options.intro)
            transition_in(component.$$.fragment);
        mount_component(component, options.target, options.anchor, options.customElement);
        flush();
    }
    set_current_component(parent_component);
}
/**
 * Base class for Svelte components. Used when dev=false.
 */
class SvelteComponent {
    $destroy() {
        destroy_component(this, 1);
        this.$destroy = noop;
    }
    $on(type, callback) {
        const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
        callbacks.push(callback);
        return () => {
            const index = callbacks.indexOf(callback);
            if (index !== -1)
                callbacks.splice(index, 1);
        };
    }
    $set($$props) {
        if (this.$$set && !is_empty($$props)) {
            this.$$.skip_bound = true;
            this.$$set($$props);
            this.$$.skip_bound = false;
        }
    }
}

const subscriber_queue = [];
/**
 * Creates a `Readable` store that allows reading by subscription.
 * @param value initial value
 * @param {StartStopNotifier}start start and stop notifications for subscriptions
 */
function readable(value, start) {
    return {
        subscribe: writable(value, start).subscribe
    };
}
/**
 * Create a `Writable` store that allows both updating and reading by subscription.
 * @param {*=}value initial value
 * @param {StartStopNotifier=}start start and stop notifications for subscriptions
 */
function writable(value, start = noop) {
    let stop;
    const subscribers = new Set();
    function set(new_value) {
        if (safe_not_equal(value, new_value)) {
            value = new_value;
            if (stop) { // store is ready
                const run_queue = !subscriber_queue.length;
                for (const subscriber of subscribers) {
                    subscriber[1]();
                    subscriber_queue.push(subscriber, value);
                }
                if (run_queue) {
                    for (let i = 0; i < subscriber_queue.length; i += 2) {
                        subscriber_queue[i][0](subscriber_queue[i + 1]);
                    }
                    subscriber_queue.length = 0;
                }
            }
        }
    }
    function update(fn) {
        set(fn(value));
    }
    function subscribe(run, invalidate = noop) {
        const subscriber = [run, invalidate];
        subscribers.add(subscriber);
        if (subscribers.size === 1) {
            stop = start(set) || noop;
        }
        run(value);
        return () => {
            subscribers.delete(subscriber);
            if (subscribers.size === 0) {
                stop();
                stop = null;
            }
        };
    }
    return { set, update, subscribe };
}
function derived(stores, fn, initial_value) {
    const single = !Array.isArray(stores);
    const stores_array = single
        ? [stores]
        : stores;
    const auto = fn.length < 2;
    return readable(initial_value, (set) => {
        let inited = false;
        const values = [];
        let pending = 0;
        let cleanup = noop;
        const sync = () => {
            if (pending) {
                return;
            }
            cleanup();
            const result = fn(single ? values[0] : values, set);
            if (auto) {
                set(result);
            }
            else {
                cleanup = is_function(result) ? result : noop;
            }
        };
        const unsubscribers = stores_array.map((store, i) => subscribe(store, (value) => {
            values[i] = value;
            pending &= ~(1 << i);
            if (inited) {
                sync();
            }
        }, () => {
            pending |= (1 << i);
        }));
        inited = true;
        sync();
        return function stop() {
            run_all(unsubscribers);
            cleanup();
        };
    });
}

var isMergeableObject = function isMergeableObject(value) {
	return isNonNullObject(value)
		&& !isSpecial(value)
};

function isNonNullObject(value) {
	return !!value && typeof value === 'object'
}

function isSpecial(value) {
	var stringValue = Object.prototype.toString.call(value);

	return stringValue === '[object RegExp]'
		|| stringValue === '[object Date]'
		|| isReactElement(value)
}

// see https://github.com/facebook/react/blob/b5ac963fb791d1298e7f396236383bc955f916c1/src/isomorphic/classic/element/ReactElement.js#L21-L25
var canUseSymbol = typeof Symbol === 'function' && Symbol.for;
var REACT_ELEMENT_TYPE = canUseSymbol ? Symbol.for('react.element') : 0xeac7;

function isReactElement(value) {
	return value.$$typeof === REACT_ELEMENT_TYPE
}

function emptyTarget(val) {
	return Array.isArray(val) ? [] : {}
}

function cloneUnlessOtherwiseSpecified(value, options) {
	return (options.clone !== false && options.isMergeableObject(value))
		? deepmerge(emptyTarget(value), value, options)
		: value
}

function defaultArrayMerge(target, source, options) {
	return target.concat(source).map(function(element) {
		return cloneUnlessOtherwiseSpecified(element, options)
	})
}

function getMergeFunction(key, options) {
	if (!options.customMerge) {
		return deepmerge
	}
	var customMerge = options.customMerge(key);
	return typeof customMerge === 'function' ? customMerge : deepmerge
}

function getEnumerableOwnPropertySymbols(target) {
	return Object.getOwnPropertySymbols
		? Object.getOwnPropertySymbols(target).filter(function(symbol) {
			return target.propertyIsEnumerable(symbol)
		})
		: []
}

function getKeys(target) {
	return Object.keys(target).concat(getEnumerableOwnPropertySymbols(target))
}

function propertyIsOnObject(object, property) {
	try {
		return property in object
	} catch(_) {
		return false
	}
}

// Protects from prototype poisoning and unexpected merging up the prototype chain.
function propertyIsUnsafe(target, key) {
	return propertyIsOnObject(target, key) // Properties are safe to merge if they don't exist in the target yet,
		&& !(Object.hasOwnProperty.call(target, key) // unsafe if they exist up the prototype chain,
			&& Object.propertyIsEnumerable.call(target, key)) // and also unsafe if they're nonenumerable.
}

function mergeObject(target, source, options) {
	var destination = {};
	if (options.isMergeableObject(target)) {
		getKeys(target).forEach(function(key) {
			destination[key] = cloneUnlessOtherwiseSpecified(target[key], options);
		});
	}
	getKeys(source).forEach(function(key) {
		if (propertyIsUnsafe(target, key)) {
			return
		}

		if (propertyIsOnObject(target, key) && options.isMergeableObject(source[key])) {
			destination[key] = getMergeFunction(key, options)(target[key], source[key], options);
		} else {
			destination[key] = cloneUnlessOtherwiseSpecified(source[key], options);
		}
	});
	return destination
}

function deepmerge(target, source, options) {
	options = options || {};
	options.arrayMerge = options.arrayMerge || defaultArrayMerge;
	options.isMergeableObject = options.isMergeableObject || isMergeableObject;
	// cloneUnlessOtherwiseSpecified is added to `options` so that custom arrayMerge()
	// implementations can use it. The caller may not replace it.
	options.cloneUnlessOtherwiseSpecified = cloneUnlessOtherwiseSpecified;

	var sourceIsArray = Array.isArray(source);
	var targetIsArray = Array.isArray(target);
	var sourceAndTargetTypesMatch = sourceIsArray === targetIsArray;

	if (!sourceAndTargetTypesMatch) {
		return cloneUnlessOtherwiseSpecified(source, options)
	} else if (sourceIsArray) {
		return options.arrayMerge(target, source, options)
	} else {
		return mergeObject(target, source, options)
	}
}

deepmerge.all = function deepmergeAll(array, options) {
	if (!Array.isArray(array)) {
		throw new Error('first argument should be an array')
	}

	return array.reduce(function(prev, next) {
		return deepmerge(prev, next, options)
	}, {})
};

var deepmerge_1 = deepmerge;

var cjs = deepmerge_1;

/*! *****************************************************************************
Copyright (c) Microsoft Corporation.

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.
***************************************************************************** */
/* global Reflect, Promise */

var extendStatics = function(d, b) {
    extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
    return extendStatics(d, b);
};

function __extends(d, b) {
    if (typeof b !== "function" && b !== null)
        throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
    extendStatics(d, b);
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
}

var __assign = function() {
    __assign = Object.assign || function __assign(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};

function __spreadArray(to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
}

var ErrorKind;
(function (ErrorKind) {
    /** Argument is unclosed (e.g. `{0`) */
    ErrorKind[ErrorKind["EXPECT_ARGUMENT_CLOSING_BRACE"] = 1] = "EXPECT_ARGUMENT_CLOSING_BRACE";
    /** Argument is empty (e.g. `{}`). */
    ErrorKind[ErrorKind["EMPTY_ARGUMENT"] = 2] = "EMPTY_ARGUMENT";
    /** Argument is malformed (e.g. `{foo!}``) */
    ErrorKind[ErrorKind["MALFORMED_ARGUMENT"] = 3] = "MALFORMED_ARGUMENT";
    /** Expect an argument type (e.g. `{foo,}`) */
    ErrorKind[ErrorKind["EXPECT_ARGUMENT_TYPE"] = 4] = "EXPECT_ARGUMENT_TYPE";
    /** Unsupported argument type (e.g. `{foo,foo}`) */
    ErrorKind[ErrorKind["INVALID_ARGUMENT_TYPE"] = 5] = "INVALID_ARGUMENT_TYPE";
    /** Expect an argument style (e.g. `{foo, number, }`) */
    ErrorKind[ErrorKind["EXPECT_ARGUMENT_STYLE"] = 6] = "EXPECT_ARGUMENT_STYLE";
    /** The number skeleton is invalid. */
    ErrorKind[ErrorKind["INVALID_NUMBER_SKELETON"] = 7] = "INVALID_NUMBER_SKELETON";
    /** The date time skeleton is invalid. */
    ErrorKind[ErrorKind["INVALID_DATE_TIME_SKELETON"] = 8] = "INVALID_DATE_TIME_SKELETON";
    /** Exepct a number skeleton following the `::` (e.g. `{foo, number, ::}`) */
    ErrorKind[ErrorKind["EXPECT_NUMBER_SKELETON"] = 9] = "EXPECT_NUMBER_SKELETON";
    /** Exepct a date time skeleton following the `::` (e.g. `{foo, date, ::}`) */
    ErrorKind[ErrorKind["EXPECT_DATE_TIME_SKELETON"] = 10] = "EXPECT_DATE_TIME_SKELETON";
    /** Unmatched apostrophes in the argument style (e.g. `{foo, number, 'test`) */
    ErrorKind[ErrorKind["UNCLOSED_QUOTE_IN_ARGUMENT_STYLE"] = 11] = "UNCLOSED_QUOTE_IN_ARGUMENT_STYLE";
    /** Missing select argument options (e.g. `{foo, select}`) */
    ErrorKind[ErrorKind["EXPECT_SELECT_ARGUMENT_OPTIONS"] = 12] = "EXPECT_SELECT_ARGUMENT_OPTIONS";
    /** Expecting an offset value in `plural` or `selectordinal` argument (e.g `{foo, plural, offset}`) */
    ErrorKind[ErrorKind["EXPECT_PLURAL_ARGUMENT_OFFSET_VALUE"] = 13] = "EXPECT_PLURAL_ARGUMENT_OFFSET_VALUE";
    /** Offset value in `plural` or `selectordinal` is invalid (e.g. `{foo, plural, offset: x}`) */
    ErrorKind[ErrorKind["INVALID_PLURAL_ARGUMENT_OFFSET_VALUE"] = 14] = "INVALID_PLURAL_ARGUMENT_OFFSET_VALUE";
    /** Expecting a selector in `select` argument (e.g `{foo, select}`) */
    ErrorKind[ErrorKind["EXPECT_SELECT_ARGUMENT_SELECTOR"] = 15] = "EXPECT_SELECT_ARGUMENT_SELECTOR";
    /** Expecting a selector in `plural` or `selectordinal` argument (e.g `{foo, plural}`) */
    ErrorKind[ErrorKind["EXPECT_PLURAL_ARGUMENT_SELECTOR"] = 16] = "EXPECT_PLURAL_ARGUMENT_SELECTOR";
    /** Expecting a message fragment after the `select` selector (e.g. `{foo, select, apple}`) */
    ErrorKind[ErrorKind["EXPECT_SELECT_ARGUMENT_SELECTOR_FRAGMENT"] = 17] = "EXPECT_SELECT_ARGUMENT_SELECTOR_FRAGMENT";
    /**
     * Expecting a message fragment after the `plural` or `selectordinal` selector
     * (e.g. `{foo, plural, one}`)
     */
    ErrorKind[ErrorKind["EXPECT_PLURAL_ARGUMENT_SELECTOR_FRAGMENT"] = 18] = "EXPECT_PLURAL_ARGUMENT_SELECTOR_FRAGMENT";
    /** Selector in `plural` or `selectordinal` is malformed (e.g. `{foo, plural, =x {#}}`) */
    ErrorKind[ErrorKind["INVALID_PLURAL_ARGUMENT_SELECTOR"] = 19] = "INVALID_PLURAL_ARGUMENT_SELECTOR";
    /**
     * Duplicate selectors in `plural` or `selectordinal` argument.
     * (e.g. {foo, plural, one {#} one {#}})
     */
    ErrorKind[ErrorKind["DUPLICATE_PLURAL_ARGUMENT_SELECTOR"] = 20] = "DUPLICATE_PLURAL_ARGUMENT_SELECTOR";
    /** Duplicate selectors in `select` argument.
     * (e.g. {foo, select, apple {apple} apple {apple}})
     */
    ErrorKind[ErrorKind["DUPLICATE_SELECT_ARGUMENT_SELECTOR"] = 21] = "DUPLICATE_SELECT_ARGUMENT_SELECTOR";
    /** Plural or select argument option must have `other` clause. */
    ErrorKind[ErrorKind["MISSING_OTHER_CLAUSE"] = 22] = "MISSING_OTHER_CLAUSE";
    /** The tag is malformed. (e.g. `<bold!>foo</bold!>) */
    ErrorKind[ErrorKind["INVALID_TAG"] = 23] = "INVALID_TAG";
    /** The tag name is invalid. (e.g. `<123>foo</123>`) */
    ErrorKind[ErrorKind["INVALID_TAG_NAME"] = 25] = "INVALID_TAG_NAME";
    /** The closing tag does not match the opening tag. (e.g. `<bold>foo</italic>`) */
    ErrorKind[ErrorKind["UNMATCHED_CLOSING_TAG"] = 26] = "UNMATCHED_CLOSING_TAG";
    /** The opening tag has unmatched closing tag. (e.g. `<bold>foo`) */
    ErrorKind[ErrorKind["UNCLOSED_TAG"] = 27] = "UNCLOSED_TAG";
})(ErrorKind || (ErrorKind = {}));

var TYPE;
(function (TYPE) {
    /**
     * Raw text
     */
    TYPE[TYPE["literal"] = 0] = "literal";
    /**
     * Variable w/o any format, e.g `var` in `this is a {var}`
     */
    TYPE[TYPE["argument"] = 1] = "argument";
    /**
     * Variable w/ number format
     */
    TYPE[TYPE["number"] = 2] = "number";
    /**
     * Variable w/ date format
     */
    TYPE[TYPE["date"] = 3] = "date";
    /**
     * Variable w/ time format
     */
    TYPE[TYPE["time"] = 4] = "time";
    /**
     * Variable w/ select format
     */
    TYPE[TYPE["select"] = 5] = "select";
    /**
     * Variable w/ plural format
     */
    TYPE[TYPE["plural"] = 6] = "plural";
    /**
     * Only possible within plural argument.
     * This is the `#` symbol that will be substituted with the count.
     */
    TYPE[TYPE["pound"] = 7] = "pound";
    /**
     * XML-like tag
     */
    TYPE[TYPE["tag"] = 8] = "tag";
})(TYPE || (TYPE = {}));
var SKELETON_TYPE;
(function (SKELETON_TYPE) {
    SKELETON_TYPE[SKELETON_TYPE["number"] = 0] = "number";
    SKELETON_TYPE[SKELETON_TYPE["dateTime"] = 1] = "dateTime";
})(SKELETON_TYPE || (SKELETON_TYPE = {}));
/**
 * Type Guards
 */
function isLiteralElement(el) {
    return el.type === TYPE.literal;
}
function isArgumentElement(el) {
    return el.type === TYPE.argument;
}
function isNumberElement(el) {
    return el.type === TYPE.number;
}
function isDateElement(el) {
    return el.type === TYPE.date;
}
function isTimeElement(el) {
    return el.type === TYPE.time;
}
function isSelectElement(el) {
    return el.type === TYPE.select;
}
function isPluralElement(el) {
    return el.type === TYPE.plural;
}
function isPoundElement(el) {
    return el.type === TYPE.pound;
}
function isTagElement(el) {
    return el.type === TYPE.tag;
}
function isNumberSkeleton(el) {
    return !!(el && typeof el === 'object' && el.type === SKELETON_TYPE.number);
}
function isDateTimeSkeleton(el) {
    return !!(el && typeof el === 'object' && el.type === SKELETON_TYPE.dateTime);
}

// @generated from regex-gen.ts
var SPACE_SEPARATOR_REGEX = /[ \xA0\u1680\u2000-\u200A\u202F\u205F\u3000]/;

/**
 * https://unicode.org/reports/tr35/tr35-dates.html#Date_Field_Symbol_Table
 * Credit: https://github.com/caridy/intl-datetimeformat-pattern/blob/master/index.js
 * with some tweaks
 */
var DATE_TIME_REGEX = /(?:[Eec]{1,6}|G{1,5}|[Qq]{1,5}|(?:[yYur]+|U{1,5})|[ML]{1,5}|d{1,2}|D{1,3}|F{1}|[abB]{1,5}|[hkHK]{1,2}|w{1,2}|W{1}|m{1,2}|s{1,2}|[zZOvVxX]{1,4})(?=([^']*'[^']*')*[^']*$)/g;
/**
 * Parse Date time skeleton into Intl.DateTimeFormatOptions
 * Ref: https://unicode.org/reports/tr35/tr35-dates.html#Date_Field_Symbol_Table
 * @public
 * @param skeleton skeleton string
 */
function parseDateTimeSkeleton(skeleton) {
    var result = {};
    skeleton.replace(DATE_TIME_REGEX, function (match) {
        var len = match.length;
        switch (match[0]) {
            // Era
            case 'G':
                result.era = len === 4 ? 'long' : len === 5 ? 'narrow' : 'short';
                break;
            // Year
            case 'y':
                result.year = len === 2 ? '2-digit' : 'numeric';
                break;
            case 'Y':
            case 'u':
            case 'U':
            case 'r':
                throw new RangeError('`Y/u/U/r` (year) patterns are not supported, use `y` instead');
            // Quarter
            case 'q':
            case 'Q':
                throw new RangeError('`q/Q` (quarter) patterns are not supported');
            // Month
            case 'M':
            case 'L':
                result.month = ['numeric', '2-digit', 'short', 'long', 'narrow'][len - 1];
                break;
            // Week
            case 'w':
            case 'W':
                throw new RangeError('`w/W` (week) patterns are not supported');
            case 'd':
                result.day = ['numeric', '2-digit'][len - 1];
                break;
            case 'D':
            case 'F':
            case 'g':
                throw new RangeError('`D/F/g` (day) patterns are not supported, use `d` instead');
            // Weekday
            case 'E':
                result.weekday = len === 4 ? 'short' : len === 5 ? 'narrow' : 'short';
                break;
            case 'e':
                if (len < 4) {
                    throw new RangeError('`e..eee` (weekday) patterns are not supported');
                }
                result.weekday = ['short', 'long', 'narrow', 'short'][len - 4];
                break;
            case 'c':
                if (len < 4) {
                    throw new RangeError('`c..ccc` (weekday) patterns are not supported');
                }
                result.weekday = ['short', 'long', 'narrow', 'short'][len - 4];
                break;
            // Period
            case 'a': // AM, PM
                result.hour12 = true;
                break;
            case 'b': // am, pm, noon, midnight
            case 'B': // flexible day periods
                throw new RangeError('`b/B` (period) patterns are not supported, use `a` instead');
            // Hour
            case 'h':
                result.hourCycle = 'h12';
                result.hour = ['numeric', '2-digit'][len - 1];
                break;
            case 'H':
                result.hourCycle = 'h23';
                result.hour = ['numeric', '2-digit'][len - 1];
                break;
            case 'K':
                result.hourCycle = 'h11';
                result.hour = ['numeric', '2-digit'][len - 1];
                break;
            case 'k':
                result.hourCycle = 'h24';
                result.hour = ['numeric', '2-digit'][len - 1];
                break;
            case 'j':
            case 'J':
            case 'C':
                throw new RangeError('`j/J/C` (hour) patterns are not supported, use `h/H/K/k` instead');
            // Minute
            case 'm':
                result.minute = ['numeric', '2-digit'][len - 1];
                break;
            // Second
            case 's':
                result.second = ['numeric', '2-digit'][len - 1];
                break;
            case 'S':
            case 'A':
                throw new RangeError('`S/A` (second) patterns are not supported, use `s` instead');
            // Zone
            case 'z': // 1..3, 4: specific non-location format
                result.timeZoneName = len < 4 ? 'short' : 'long';
                break;
            case 'Z': // 1..3, 4, 5: The ISO8601 varios formats
            case 'O': // 1, 4: miliseconds in day short, long
            case 'v': // 1, 4: generic non-location format
            case 'V': // 1, 2, 3, 4: time zone ID or city
            case 'X': // 1, 2, 3, 4: The ISO8601 varios formats
            case 'x': // 1, 2, 3, 4: The ISO8601 varios formats
                throw new RangeError('`Z/O/v/V/X/x` (timeZone) patterns are not supported, use `z` instead');
        }
        return '';
    });
    return result;
}

// @generated from regex-gen.ts
var WHITE_SPACE_REGEX = /[\t-\r \x85\u200E\u200F\u2028\u2029]/i;

function parseNumberSkeletonFromString(skeleton) {
    if (skeleton.length === 0) {
        throw new Error('Number skeleton cannot be empty');
    }
    // Parse the skeleton
    var stringTokens = skeleton
        .split(WHITE_SPACE_REGEX)
        .filter(function (x) { return x.length > 0; });
    var tokens = [];
    for (var _i = 0, stringTokens_1 = stringTokens; _i < stringTokens_1.length; _i++) {
        var stringToken = stringTokens_1[_i];
        var stemAndOptions = stringToken.split('/');
        if (stemAndOptions.length === 0) {
            throw new Error('Invalid number skeleton');
        }
        var stem = stemAndOptions[0], options = stemAndOptions.slice(1);
        for (var _a = 0, options_1 = options; _a < options_1.length; _a++) {
            var option = options_1[_a];
            if (option.length === 0) {
                throw new Error('Invalid number skeleton');
            }
        }
        tokens.push({ stem: stem, options: options });
    }
    return tokens;
}
function icuUnitToEcma(unit) {
    return unit.replace(/^(.*?)-/, '');
}
var FRACTION_PRECISION_REGEX = /^\.(?:(0+)(\*)?|(#+)|(0+)(#+))$/g;
var SIGNIFICANT_PRECISION_REGEX = /^(@+)?(\+|#+)?[rs]?$/g;
var INTEGER_WIDTH_REGEX = /(\*)(0+)|(#+)(0+)|(0+)/g;
var CONCISE_INTEGER_WIDTH_REGEX = /^(0+)$/;
function parseSignificantPrecision(str) {
    var result = {};
    if (str[str.length - 1] === 'r') {
        result.roundingPriority = 'morePrecision';
    }
    else if (str[str.length - 1] === 's') {
        result.roundingPriority = 'lessPrecision';
    }
    str.replace(SIGNIFICANT_PRECISION_REGEX, function (_, g1, g2) {
        // @@@ case
        if (typeof g2 !== 'string') {
            result.minimumSignificantDigits = g1.length;
            result.maximumSignificantDigits = g1.length;
        }
        // @@@+ case
        else if (g2 === '+') {
            result.minimumSignificantDigits = g1.length;
        }
        // .### case
        else if (g1[0] === '#') {
            result.maximumSignificantDigits = g1.length;
        }
        // .@@## or .@@@ case
        else {
            result.minimumSignificantDigits = g1.length;
            result.maximumSignificantDigits =
                g1.length + (typeof g2 === 'string' ? g2.length : 0);
        }
        return '';
    });
    return result;
}
function parseSign(str) {
    switch (str) {
        case 'sign-auto':
            return {
                signDisplay: 'auto',
            };
        case 'sign-accounting':
        case '()':
            return {
                currencySign: 'accounting',
            };
        case 'sign-always':
        case '+!':
            return {
                signDisplay: 'always',
            };
        case 'sign-accounting-always':
        case '()!':
            return {
                signDisplay: 'always',
                currencySign: 'accounting',
            };
        case 'sign-except-zero':
        case '+?':
            return {
                signDisplay: 'exceptZero',
            };
        case 'sign-accounting-except-zero':
        case '()?':
            return {
                signDisplay: 'exceptZero',
                currencySign: 'accounting',
            };
        case 'sign-never':
        case '+_':
            return {
                signDisplay: 'never',
            };
    }
}
function parseConciseScientificAndEngineeringStem(stem) {
    // Engineering
    var result;
    if (stem[0] === 'E' && stem[1] === 'E') {
        result = {
            notation: 'engineering',
        };
        stem = stem.slice(2);
    }
    else if (stem[0] === 'E') {
        result = {
            notation: 'scientific',
        };
        stem = stem.slice(1);
    }
    if (result) {
        var signDisplay = stem.slice(0, 2);
        if (signDisplay === '+!') {
            result.signDisplay = 'always';
            stem = stem.slice(2);
        }
        else if (signDisplay === '+?') {
            result.signDisplay = 'exceptZero';
            stem = stem.slice(2);
        }
        if (!CONCISE_INTEGER_WIDTH_REGEX.test(stem)) {
            throw new Error('Malformed concise eng/scientific notation');
        }
        result.minimumIntegerDigits = stem.length;
    }
    return result;
}
function parseNotationOptions(opt) {
    var result = {};
    var signOpts = parseSign(opt);
    if (signOpts) {
        return signOpts;
    }
    return result;
}
/**
 * https://github.com/unicode-org/icu/blob/master/docs/userguide/format_parse/numbers/skeletons.md#skeleton-stems-and-options
 */
function parseNumberSkeleton(tokens) {
    var result = {};
    for (var _i = 0, tokens_1 = tokens; _i < tokens_1.length; _i++) {
        var token = tokens_1[_i];
        switch (token.stem) {
            case 'percent':
            case '%':
                result.style = 'percent';
                continue;
            case '%x100':
                result.style = 'percent';
                result.scale = 100;
                continue;
            case 'currency':
                result.style = 'currency';
                result.currency = token.options[0];
                continue;
            case 'group-off':
            case ',_':
                result.useGrouping = false;
                continue;
            case 'precision-integer':
            case '.':
                result.maximumFractionDigits = 0;
                continue;
            case 'measure-unit':
            case 'unit':
                result.style = 'unit';
                result.unit = icuUnitToEcma(token.options[0]);
                continue;
            case 'compact-short':
            case 'K':
                result.notation = 'compact';
                result.compactDisplay = 'short';
                continue;
            case 'compact-long':
            case 'KK':
                result.notation = 'compact';
                result.compactDisplay = 'long';
                continue;
            case 'scientific':
                result = __assign(__assign(__assign({}, result), { notation: 'scientific' }), token.options.reduce(function (all, opt) { return (__assign(__assign({}, all), parseNotationOptions(opt))); }, {}));
                continue;
            case 'engineering':
                result = __assign(__assign(__assign({}, result), { notation: 'engineering' }), token.options.reduce(function (all, opt) { return (__assign(__assign({}, all), parseNotationOptions(opt))); }, {}));
                continue;
            case 'notation-simple':
                result.notation = 'standard';
                continue;
            // https://github.com/unicode-org/icu/blob/master/icu4c/source/i18n/unicode/unumberformatter.h
            case 'unit-width-narrow':
                result.currencyDisplay = 'narrowSymbol';
                result.unitDisplay = 'narrow';
                continue;
            case 'unit-width-short':
                result.currencyDisplay = 'code';
                result.unitDisplay = 'short';
                continue;
            case 'unit-width-full-name':
                result.currencyDisplay = 'name';
                result.unitDisplay = 'long';
                continue;
            case 'unit-width-iso-code':
                result.currencyDisplay = 'symbol';
                continue;
            case 'scale':
                result.scale = parseFloat(token.options[0]);
                continue;
            // https://unicode-org.github.io/icu/userguide/format_parse/numbers/skeletons.html#integer-width
            case 'integer-width':
                if (token.options.length > 1) {
                    throw new RangeError('integer-width stems only accept a single optional option');
                }
                token.options[0].replace(INTEGER_WIDTH_REGEX, function (_, g1, g2, g3, g4, g5) {
                    if (g1) {
                        result.minimumIntegerDigits = g2.length;
                    }
                    else if (g3 && g4) {
                        throw new Error('We currently do not support maximum integer digits');
                    }
                    else if (g5) {
                        throw new Error('We currently do not support exact integer digits');
                    }
                    return '';
                });
                continue;
        }
        // https://unicode-org.github.io/icu/userguide/format_parse/numbers/skeletons.html#integer-width
        if (CONCISE_INTEGER_WIDTH_REGEX.test(token.stem)) {
            result.minimumIntegerDigits = token.stem.length;
            continue;
        }
        if (FRACTION_PRECISION_REGEX.test(token.stem)) {
            // Precision
            // https://unicode-org.github.io/icu/userguide/format_parse/numbers/skeletons.html#fraction-precision
            // precision-integer case
            if (token.options.length > 1) {
                throw new RangeError('Fraction-precision stems only accept a single optional option');
            }
            token.stem.replace(FRACTION_PRECISION_REGEX, function (_, g1, g2, g3, g4, g5) {
                // .000* case (before ICU67 it was .000+)
                if (g2 === '*') {
                    result.minimumFractionDigits = g1.length;
                }
                // .### case
                else if (g3 && g3[0] === '#') {
                    result.maximumFractionDigits = g3.length;
                }
                // .00## case
                else if (g4 && g5) {
                    result.minimumFractionDigits = g4.length;
                    result.maximumFractionDigits = g4.length + g5.length;
                }
                else {
                    result.minimumFractionDigits = g1.length;
                    result.maximumFractionDigits = g1.length;
                }
                return '';
            });
            var opt = token.options[0];
            // https://unicode-org.github.io/icu/userguide/format_parse/numbers/skeletons.html#trailing-zero-display
            if (opt === 'w') {
                result = __assign(__assign({}, result), { trailingZeroDisplay: 'stripIfInteger' });
            }
            else if (opt) {
                result = __assign(__assign({}, result), parseSignificantPrecision(opt));
            }
            continue;
        }
        // https://unicode-org.github.io/icu/userguide/format_parse/numbers/skeletons.html#significant-digits-precision
        if (SIGNIFICANT_PRECISION_REGEX.test(token.stem)) {
            result = __assign(__assign({}, result), parseSignificantPrecision(token.stem));
            continue;
        }
        var signOpts = parseSign(token.stem);
        if (signOpts) {
            result = __assign(__assign({}, result), signOpts);
        }
        var conciseScientificAndEngineeringOpts = parseConciseScientificAndEngineeringStem(token.stem);
        if (conciseScientificAndEngineeringOpts) {
            result = __assign(__assign({}, result), conciseScientificAndEngineeringOpts);
        }
    }
    return result;
}

var _a;
var SPACE_SEPARATOR_START_REGEX = new RegExp("^".concat(SPACE_SEPARATOR_REGEX.source, "*"));
var SPACE_SEPARATOR_END_REGEX = new RegExp("".concat(SPACE_SEPARATOR_REGEX.source, "*$"));
function createLocation(start, end) {
    return { start: start, end: end };
}
// #region Ponyfills
// Consolidate these variables up top for easier toggling during debugging
var hasNativeStartsWith = !!String.prototype.startsWith;
var hasNativeFromCodePoint = !!String.fromCodePoint;
var hasNativeFromEntries = !!Object.fromEntries;
var hasNativeCodePointAt = !!String.prototype.codePointAt;
var hasTrimStart = !!String.prototype.trimStart;
var hasTrimEnd = !!String.prototype.trimEnd;
var hasNativeIsSafeInteger = !!Number.isSafeInteger;
var isSafeInteger = hasNativeIsSafeInteger
    ? Number.isSafeInteger
    : function (n) {
        return (typeof n === 'number' &&
            isFinite(n) &&
            Math.floor(n) === n &&
            Math.abs(n) <= 0x1fffffffffffff);
    };
// IE11 does not support y and u.
var REGEX_SUPPORTS_U_AND_Y = true;
try {
    var re = RE('([^\\p{White_Space}\\p{Pattern_Syntax}]*)', 'yu');
    /**
     * legacy Edge or Xbox One browser
     * Unicode flag support: supported
     * Pattern_Syntax support: not supported
     * See https://github.com/formatjs/formatjs/issues/2822
     */
    REGEX_SUPPORTS_U_AND_Y = ((_a = re.exec('a')) === null || _a === void 0 ? void 0 : _a[0]) === 'a';
}
catch (_) {
    REGEX_SUPPORTS_U_AND_Y = false;
}
var startsWith = hasNativeStartsWith
    ? // Native
        function startsWith(s, search, position) {
            return s.startsWith(search, position);
        }
    : // For IE11
        function startsWith(s, search, position) {
            return s.slice(position, position + search.length) === search;
        };
var fromCodePoint = hasNativeFromCodePoint
    ? String.fromCodePoint
    : // IE11
        function fromCodePoint() {
            var codePoints = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                codePoints[_i] = arguments[_i];
            }
            var elements = '';
            var length = codePoints.length;
            var i = 0;
            var code;
            while (length > i) {
                code = codePoints[i++];
                if (code > 0x10ffff)
                    throw RangeError(code + ' is not a valid code point');
                elements +=
                    code < 0x10000
                        ? String.fromCharCode(code)
                        : String.fromCharCode(((code -= 0x10000) >> 10) + 0xd800, (code % 0x400) + 0xdc00);
            }
            return elements;
        };
var fromEntries = 
// native
hasNativeFromEntries
    ? Object.fromEntries
    : // Ponyfill
        function fromEntries(entries) {
            var obj = {};
            for (var _i = 0, entries_1 = entries; _i < entries_1.length; _i++) {
                var _a = entries_1[_i], k = _a[0], v = _a[1];
                obj[k] = v;
            }
            return obj;
        };
var codePointAt = hasNativeCodePointAt
    ? // Native
        function codePointAt(s, index) {
            return s.codePointAt(index);
        }
    : // IE 11
        function codePointAt(s, index) {
            var size = s.length;
            if (index < 0 || index >= size) {
                return undefined;
            }
            var first = s.charCodeAt(index);
            var second;
            return first < 0xd800 ||
                first > 0xdbff ||
                index + 1 === size ||
                (second = s.charCodeAt(index + 1)) < 0xdc00 ||
                second > 0xdfff
                ? first
                : ((first - 0xd800) << 10) + (second - 0xdc00) + 0x10000;
        };
var trimStart = hasTrimStart
    ? // Native
        function trimStart(s) {
            return s.trimStart();
        }
    : // Ponyfill
        function trimStart(s) {
            return s.replace(SPACE_SEPARATOR_START_REGEX, '');
        };
var trimEnd = hasTrimEnd
    ? // Native
        function trimEnd(s) {
            return s.trimEnd();
        }
    : // Ponyfill
        function trimEnd(s) {
            return s.replace(SPACE_SEPARATOR_END_REGEX, '');
        };
// Prevent minifier to translate new RegExp to literal form that might cause syntax error on IE11.
function RE(s, flag) {
    return new RegExp(s, flag);
}
// #endregion
var matchIdentifierAtIndex;
if (REGEX_SUPPORTS_U_AND_Y) {
    // Native
    var IDENTIFIER_PREFIX_RE_1 = RE('([^\\p{White_Space}\\p{Pattern_Syntax}]*)', 'yu');
    matchIdentifierAtIndex = function matchIdentifierAtIndex(s, index) {
        var _a;
        IDENTIFIER_PREFIX_RE_1.lastIndex = index;
        var match = IDENTIFIER_PREFIX_RE_1.exec(s);
        return (_a = match[1]) !== null && _a !== void 0 ? _a : '';
    };
}
else {
    // IE11
    matchIdentifierAtIndex = function matchIdentifierAtIndex(s, index) {
        var match = [];
        while (true) {
            var c = codePointAt(s, index);
            if (c === undefined || _isWhiteSpace(c) || _isPatternSyntax(c)) {
                break;
            }
            match.push(c);
            index += c >= 0x10000 ? 2 : 1;
        }
        return fromCodePoint.apply(void 0, match);
    };
}
var Parser = /** @class */ (function () {
    function Parser(message, options) {
        if (options === void 0) { options = {}; }
        this.message = message;
        this.position = { offset: 0, line: 1, column: 1 };
        this.ignoreTag = !!options.ignoreTag;
        this.requiresOtherClause = !!options.requiresOtherClause;
        this.shouldParseSkeletons = !!options.shouldParseSkeletons;
    }
    Parser.prototype.parse = function () {
        if (this.offset() !== 0) {
            throw Error('parser can only be used once');
        }
        return this.parseMessage(0, '', false);
    };
    Parser.prototype.parseMessage = function (nestingLevel, parentArgType, expectingCloseTag) {
        var elements = [];
        while (!this.isEOF()) {
            var char = this.char();
            if (char === 123 /* `{` */) {
                var result = this.parseArgument(nestingLevel, expectingCloseTag);
                if (result.err) {
                    return result;
                }
                elements.push(result.val);
            }
            else if (char === 125 /* `}` */ && nestingLevel > 0) {
                break;
            }
            else if (char === 35 /* `#` */ &&
                (parentArgType === 'plural' || parentArgType === 'selectordinal')) {
                var position = this.clonePosition();
                this.bump();
                elements.push({
                    type: TYPE.pound,
                    location: createLocation(position, this.clonePosition()),
                });
            }
            else if (char === 60 /* `<` */ &&
                !this.ignoreTag &&
                this.peek() === 47 // char code for '/'
            ) {
                if (expectingCloseTag) {
                    break;
                }
                else {
                    return this.error(ErrorKind.UNMATCHED_CLOSING_TAG, createLocation(this.clonePosition(), this.clonePosition()));
                }
            }
            else if (char === 60 /* `<` */ &&
                !this.ignoreTag &&
                _isAlpha(this.peek() || 0)) {
                var result = this.parseTag(nestingLevel, parentArgType);
                if (result.err) {
                    return result;
                }
                elements.push(result.val);
            }
            else {
                var result = this.parseLiteral(nestingLevel, parentArgType);
                if (result.err) {
                    return result;
                }
                elements.push(result.val);
            }
        }
        return { val: elements, err: null };
    };
    /**
     * A tag name must start with an ASCII lower/upper case letter. The grammar is based on the
     * [custom element name][] except that a dash is NOT always mandatory and uppercase letters
     * are accepted:
     *
     * ```
     * tag ::= "<" tagName (whitespace)* "/>" | "<" tagName (whitespace)* ">" message "</" tagName (whitespace)* ">"
     * tagName ::= [a-z] (PENChar)*
     * PENChar ::=
     *     "-" | "." | [0-9] | "_" | [a-z] | [A-Z] | #xB7 | [#xC0-#xD6] | [#xD8-#xF6] | [#xF8-#x37D] |
     *     [#x37F-#x1FFF] | [#x200C-#x200D] | [#x203F-#x2040] | [#x2070-#x218F] | [#x2C00-#x2FEF] |
     *     [#x3001-#xD7FF] | [#xF900-#xFDCF] | [#xFDF0-#xFFFD] | [#x10000-#xEFFFF]
     * ```
     *
     * [custom element name]: https://html.spec.whatwg.org/multipage/custom-elements.html#valid-custom-element-name
     * NOTE: We're a bit more lax here since HTML technically does not allow uppercase HTML element but we do
     * since other tag-based engines like React allow it
     */
    Parser.prototype.parseTag = function (nestingLevel, parentArgType) {
        var startPosition = this.clonePosition();
        this.bump(); // `<`
        var tagName = this.parseTagName();
        this.bumpSpace();
        if (this.bumpIf('/>')) {
            // Self closing tag
            return {
                val: {
                    type: TYPE.literal,
                    value: "<".concat(tagName, "/>"),
                    location: createLocation(startPosition, this.clonePosition()),
                },
                err: null,
            };
        }
        else if (this.bumpIf('>')) {
            var childrenResult = this.parseMessage(nestingLevel + 1, parentArgType, true);
            if (childrenResult.err) {
                return childrenResult;
            }
            var children = childrenResult.val;
            // Expecting a close tag
            var endTagStartPosition = this.clonePosition();
            if (this.bumpIf('</')) {
                if (this.isEOF() || !_isAlpha(this.char())) {
                    return this.error(ErrorKind.INVALID_TAG, createLocation(endTagStartPosition, this.clonePosition()));
                }
                var closingTagNameStartPosition = this.clonePosition();
                var closingTagName = this.parseTagName();
                if (tagName !== closingTagName) {
                    return this.error(ErrorKind.UNMATCHED_CLOSING_TAG, createLocation(closingTagNameStartPosition, this.clonePosition()));
                }
                this.bumpSpace();
                if (!this.bumpIf('>')) {
                    return this.error(ErrorKind.INVALID_TAG, createLocation(endTagStartPosition, this.clonePosition()));
                }
                return {
                    val: {
                        type: TYPE.tag,
                        value: tagName,
                        children: children,
                        location: createLocation(startPosition, this.clonePosition()),
                    },
                    err: null,
                };
            }
            else {
                return this.error(ErrorKind.UNCLOSED_TAG, createLocation(startPosition, this.clonePosition()));
            }
        }
        else {
            return this.error(ErrorKind.INVALID_TAG, createLocation(startPosition, this.clonePosition()));
        }
    };
    /**
     * This method assumes that the caller has peeked ahead for the first tag character.
     */
    Parser.prototype.parseTagName = function () {
        var startOffset = this.offset();
        this.bump(); // the first tag name character
        while (!this.isEOF() && _isPotentialElementNameChar(this.char())) {
            this.bump();
        }
        return this.message.slice(startOffset, this.offset());
    };
    Parser.prototype.parseLiteral = function (nestingLevel, parentArgType) {
        var start = this.clonePosition();
        var value = '';
        while (true) {
            var parseQuoteResult = this.tryParseQuote(parentArgType);
            if (parseQuoteResult) {
                value += parseQuoteResult;
                continue;
            }
            var parseUnquotedResult = this.tryParseUnquoted(nestingLevel, parentArgType);
            if (parseUnquotedResult) {
                value += parseUnquotedResult;
                continue;
            }
            var parseLeftAngleResult = this.tryParseLeftAngleBracket();
            if (parseLeftAngleResult) {
                value += parseLeftAngleResult;
                continue;
            }
            break;
        }
        var location = createLocation(start, this.clonePosition());
        return {
            val: { type: TYPE.literal, value: value, location: location },
            err: null,
        };
    };
    Parser.prototype.tryParseLeftAngleBracket = function () {
        if (!this.isEOF() &&
            this.char() === 60 /* `<` */ &&
            (this.ignoreTag ||
                // If at the opening tag or closing tag position, bail.
                !_isAlphaOrSlash(this.peek() || 0))) {
            this.bump(); // `<`
            return '<';
        }
        return null;
    };
    /**
     * Starting with ICU 4.8, an ASCII apostrophe only starts quoted text if it immediately precedes
     * a character that requires quoting (that is, "only where needed"), and works the same in
     * nested messages as on the top level of the pattern. The new behavior is otherwise compatible.
     */
    Parser.prototype.tryParseQuote = function (parentArgType) {
        if (this.isEOF() || this.char() !== 39 /* `'` */) {
            return null;
        }
        // Parse escaped char following the apostrophe, or early return if there is no escaped char.
        // Check if is valid escaped character
        switch (this.peek()) {
            case 39 /* `'` */:
                // double quote, should return as a single quote.
                this.bump();
                this.bump();
                return "'";
            // '{', '<', '>', '}'
            case 123:
            case 60:
            case 62:
            case 125:
                break;
            case 35: // '#'
                if (parentArgType === 'plural' || parentArgType === 'selectordinal') {
                    break;
                }
                return null;
            default:
                return null;
        }
        this.bump(); // apostrophe
        var codePoints = [this.char()]; // escaped char
        this.bump();
        // read chars until the optional closing apostrophe is found
        while (!this.isEOF()) {
            var ch = this.char();
            if (ch === 39 /* `'` */) {
                if (this.peek() === 39 /* `'` */) {
                    codePoints.push(39);
                    // Bump one more time because we need to skip 2 characters.
                    this.bump();
                }
                else {
                    // Optional closing apostrophe.
                    this.bump();
                    break;
                }
            }
            else {
                codePoints.push(ch);
            }
            this.bump();
        }
        return fromCodePoint.apply(void 0, codePoints);
    };
    Parser.prototype.tryParseUnquoted = function (nestingLevel, parentArgType) {
        if (this.isEOF()) {
            return null;
        }
        var ch = this.char();
        if (ch === 60 /* `<` */ ||
            ch === 123 /* `{` */ ||
            (ch === 35 /* `#` */ &&
                (parentArgType === 'plural' || parentArgType === 'selectordinal')) ||
            (ch === 125 /* `}` */ && nestingLevel > 0)) {
            return null;
        }
        else {
            this.bump();
            return fromCodePoint(ch);
        }
    };
    Parser.prototype.parseArgument = function (nestingLevel, expectingCloseTag) {
        var openingBracePosition = this.clonePosition();
        this.bump(); // `{`
        this.bumpSpace();
        if (this.isEOF()) {
            return this.error(ErrorKind.EXPECT_ARGUMENT_CLOSING_BRACE, createLocation(openingBracePosition, this.clonePosition()));
        }
        if (this.char() === 125 /* `}` */) {
            this.bump();
            return this.error(ErrorKind.EMPTY_ARGUMENT, createLocation(openingBracePosition, this.clonePosition()));
        }
        // argument name
        var value = this.parseIdentifierIfPossible().value;
        if (!value) {
            return this.error(ErrorKind.MALFORMED_ARGUMENT, createLocation(openingBracePosition, this.clonePosition()));
        }
        this.bumpSpace();
        if (this.isEOF()) {
            return this.error(ErrorKind.EXPECT_ARGUMENT_CLOSING_BRACE, createLocation(openingBracePosition, this.clonePosition()));
        }
        switch (this.char()) {
            // Simple argument: `{name}`
            case 125 /* `}` */: {
                this.bump(); // `}`
                return {
                    val: {
                        type: TYPE.argument,
                        // value does not include the opening and closing braces.
                        value: value,
                        location: createLocation(openingBracePosition, this.clonePosition()),
                    },
                    err: null,
                };
            }
            // Argument with options: `{name, format, ...}`
            case 44 /* `,` */: {
                this.bump(); // `,`
                this.bumpSpace();
                if (this.isEOF()) {
                    return this.error(ErrorKind.EXPECT_ARGUMENT_CLOSING_BRACE, createLocation(openingBracePosition, this.clonePosition()));
                }
                return this.parseArgumentOptions(nestingLevel, expectingCloseTag, value, openingBracePosition);
            }
            default:
                return this.error(ErrorKind.MALFORMED_ARGUMENT, createLocation(openingBracePosition, this.clonePosition()));
        }
    };
    /**
     * Advance the parser until the end of the identifier, if it is currently on
     * an identifier character. Return an empty string otherwise.
     */
    Parser.prototype.parseIdentifierIfPossible = function () {
        var startingPosition = this.clonePosition();
        var startOffset = this.offset();
        var value = matchIdentifierAtIndex(this.message, startOffset);
        var endOffset = startOffset + value.length;
        this.bumpTo(endOffset);
        var endPosition = this.clonePosition();
        var location = createLocation(startingPosition, endPosition);
        return { value: value, location: location };
    };
    Parser.prototype.parseArgumentOptions = function (nestingLevel, expectingCloseTag, value, openingBracePosition) {
        var _a;
        // Parse this range:
        // {name, type, style}
        //        ^---^
        var typeStartPosition = this.clonePosition();
        var argType = this.parseIdentifierIfPossible().value;
        var typeEndPosition = this.clonePosition();
        switch (argType) {
            case '':
                // Expecting a style string number, date, time, plural, selectordinal, or select.
                return this.error(ErrorKind.EXPECT_ARGUMENT_TYPE, createLocation(typeStartPosition, typeEndPosition));
            case 'number':
            case 'date':
            case 'time': {
                // Parse this range:
                // {name, number, style}
                //              ^-------^
                this.bumpSpace();
                var styleAndLocation = null;
                if (this.bumpIf(',')) {
                    this.bumpSpace();
                    var styleStartPosition = this.clonePosition();
                    var result = this.parseSimpleArgStyleIfPossible();
                    if (result.err) {
                        return result;
                    }
                    var style = trimEnd(result.val);
                    if (style.length === 0) {
                        return this.error(ErrorKind.EXPECT_ARGUMENT_STYLE, createLocation(this.clonePosition(), this.clonePosition()));
                    }
                    var styleLocation = createLocation(styleStartPosition, this.clonePosition());
                    styleAndLocation = { style: style, styleLocation: styleLocation };
                }
                var argCloseResult = this.tryParseArgumentClose(openingBracePosition);
                if (argCloseResult.err) {
                    return argCloseResult;
                }
                var location_1 = createLocation(openingBracePosition, this.clonePosition());
                // Extract style or skeleton
                if (styleAndLocation && startsWith(styleAndLocation === null || styleAndLocation === void 0 ? void 0 : styleAndLocation.style, '::', 0)) {
                    // Skeleton starts with `::`.
                    var skeleton = trimStart(styleAndLocation.style.slice(2));
                    if (argType === 'number') {
                        var result = this.parseNumberSkeletonFromString(skeleton, styleAndLocation.styleLocation);
                        if (result.err) {
                            return result;
                        }
                        return {
                            val: { type: TYPE.number, value: value, location: location_1, style: result.val },
                            err: null,
                        };
                    }
                    else {
                        if (skeleton.length === 0) {
                            return this.error(ErrorKind.EXPECT_DATE_TIME_SKELETON, location_1);
                        }
                        var style = {
                            type: SKELETON_TYPE.dateTime,
                            pattern: skeleton,
                            location: styleAndLocation.styleLocation,
                            parsedOptions: this.shouldParseSkeletons
                                ? parseDateTimeSkeleton(skeleton)
                                : {},
                        };
                        var type = argType === 'date' ? TYPE.date : TYPE.time;
                        return {
                            val: { type: type, value: value, location: location_1, style: style },
                            err: null,
                        };
                    }
                }
                // Regular style or no style.
                return {
                    val: {
                        type: argType === 'number'
                            ? TYPE.number
                            : argType === 'date'
                                ? TYPE.date
                                : TYPE.time,
                        value: value,
                        location: location_1,
                        style: (_a = styleAndLocation === null || styleAndLocation === void 0 ? void 0 : styleAndLocation.style) !== null && _a !== void 0 ? _a : null,
                    },
                    err: null,
                };
            }
            case 'plural':
            case 'selectordinal':
            case 'select': {
                // Parse this range:
                // {name, plural, options}
                //              ^---------^
                var typeEndPosition_1 = this.clonePosition();
                this.bumpSpace();
                if (!this.bumpIf(',')) {
                    return this.error(ErrorKind.EXPECT_SELECT_ARGUMENT_OPTIONS, createLocation(typeEndPosition_1, __assign({}, typeEndPosition_1)));
                }
                this.bumpSpace();
                // Parse offset:
                // {name, plural, offset:1, options}
                //                ^-----^
                //
                // or the first option:
                //
                // {name, plural, one {...} other {...}}
                //                ^--^
                var identifierAndLocation = this.parseIdentifierIfPossible();
                var pluralOffset = 0;
                if (argType !== 'select' && identifierAndLocation.value === 'offset') {
                    if (!this.bumpIf(':')) {
                        return this.error(ErrorKind.EXPECT_PLURAL_ARGUMENT_OFFSET_VALUE, createLocation(this.clonePosition(), this.clonePosition()));
                    }
                    this.bumpSpace();
                    var result = this.tryParseDecimalInteger(ErrorKind.EXPECT_PLURAL_ARGUMENT_OFFSET_VALUE, ErrorKind.INVALID_PLURAL_ARGUMENT_OFFSET_VALUE);
                    if (result.err) {
                        return result;
                    }
                    // Parse another identifier for option parsing
                    this.bumpSpace();
                    identifierAndLocation = this.parseIdentifierIfPossible();
                    pluralOffset = result.val;
                }
                var optionsResult = this.tryParsePluralOrSelectOptions(nestingLevel, argType, expectingCloseTag, identifierAndLocation);
                if (optionsResult.err) {
                    return optionsResult;
                }
                var argCloseResult = this.tryParseArgumentClose(openingBracePosition);
                if (argCloseResult.err) {
                    return argCloseResult;
                }
                var location_2 = createLocation(openingBracePosition, this.clonePosition());
                if (argType === 'select') {
                    return {
                        val: {
                            type: TYPE.select,
                            value: value,
                            options: fromEntries(optionsResult.val),
                            location: location_2,
                        },
                        err: null,
                    };
                }
                else {
                    return {
                        val: {
                            type: TYPE.plural,
                            value: value,
                            options: fromEntries(optionsResult.val),
                            offset: pluralOffset,
                            pluralType: argType === 'plural' ? 'cardinal' : 'ordinal',
                            location: location_2,
                        },
                        err: null,
                    };
                }
            }
            default:
                return this.error(ErrorKind.INVALID_ARGUMENT_TYPE, createLocation(typeStartPosition, typeEndPosition));
        }
    };
    Parser.prototype.tryParseArgumentClose = function (openingBracePosition) {
        // Parse: {value, number, ::currency/GBP }
        //
        if (this.isEOF() || this.char() !== 125 /* `}` */) {
            return this.error(ErrorKind.EXPECT_ARGUMENT_CLOSING_BRACE, createLocation(openingBracePosition, this.clonePosition()));
        }
        this.bump(); // `}`
        return { val: true, err: null };
    };
    /**
     * See: https://github.com/unicode-org/icu/blob/af7ed1f6d2298013dc303628438ec4abe1f16479/icu4c/source/common/messagepattern.cpp#L659
     */
    Parser.prototype.parseSimpleArgStyleIfPossible = function () {
        var nestedBraces = 0;
        var startPosition = this.clonePosition();
        while (!this.isEOF()) {
            var ch = this.char();
            switch (ch) {
                case 39 /* `'` */: {
                    // Treat apostrophe as quoting but include it in the style part.
                    // Find the end of the quoted literal text.
                    this.bump();
                    var apostrophePosition = this.clonePosition();
                    if (!this.bumpUntil("'")) {
                        return this.error(ErrorKind.UNCLOSED_QUOTE_IN_ARGUMENT_STYLE, createLocation(apostrophePosition, this.clonePosition()));
                    }
                    this.bump();
                    break;
                }
                case 123 /* `{` */: {
                    nestedBraces += 1;
                    this.bump();
                    break;
                }
                case 125 /* `}` */: {
                    if (nestedBraces > 0) {
                        nestedBraces -= 1;
                    }
                    else {
                        return {
                            val: this.message.slice(startPosition.offset, this.offset()),
                            err: null,
                        };
                    }
                    break;
                }
                default:
                    this.bump();
                    break;
            }
        }
        return {
            val: this.message.slice(startPosition.offset, this.offset()),
            err: null,
        };
    };
    Parser.prototype.parseNumberSkeletonFromString = function (skeleton, location) {
        var tokens = [];
        try {
            tokens = parseNumberSkeletonFromString(skeleton);
        }
        catch (e) {
            return this.error(ErrorKind.INVALID_NUMBER_SKELETON, location);
        }
        return {
            val: {
                type: SKELETON_TYPE.number,
                tokens: tokens,
                location: location,
                parsedOptions: this.shouldParseSkeletons
                    ? parseNumberSkeleton(tokens)
                    : {},
            },
            err: null,
        };
    };
    /**
     * @param nesting_level The current nesting level of messages.
     *     This can be positive when parsing message fragment in select or plural argument options.
     * @param parent_arg_type The parent argument's type.
     * @param parsed_first_identifier If provided, this is the first identifier-like selector of
     *     the argument. It is a by-product of a previous parsing attempt.
     * @param expecting_close_tag If true, this message is directly or indirectly nested inside
     *     between a pair of opening and closing tags. The nested message will not parse beyond
     *     the closing tag boundary.
     */
    Parser.prototype.tryParsePluralOrSelectOptions = function (nestingLevel, parentArgType, expectCloseTag, parsedFirstIdentifier) {
        var _a;
        var hasOtherClause = false;
        var options = [];
        var parsedSelectors = new Set();
        var selector = parsedFirstIdentifier.value, selectorLocation = parsedFirstIdentifier.location;
        // Parse:
        // one {one apple}
        // ^--^
        while (true) {
            if (selector.length === 0) {
                var startPosition = this.clonePosition();
                if (parentArgType !== 'select' && this.bumpIf('=')) {
                    // Try parse `={number}` selector
                    var result = this.tryParseDecimalInteger(ErrorKind.EXPECT_PLURAL_ARGUMENT_SELECTOR, ErrorKind.INVALID_PLURAL_ARGUMENT_SELECTOR);
                    if (result.err) {
                        return result;
                    }
                    selectorLocation = createLocation(startPosition, this.clonePosition());
                    selector = this.message.slice(startPosition.offset, this.offset());
                }
                else {
                    break;
                }
            }
            // Duplicate selector clauses
            if (parsedSelectors.has(selector)) {
                return this.error(parentArgType === 'select'
                    ? ErrorKind.DUPLICATE_SELECT_ARGUMENT_SELECTOR
                    : ErrorKind.DUPLICATE_PLURAL_ARGUMENT_SELECTOR, selectorLocation);
            }
            if (selector === 'other') {
                hasOtherClause = true;
            }
            // Parse:
            // one {one apple}
            //     ^----------^
            this.bumpSpace();
            var openingBracePosition = this.clonePosition();
            if (!this.bumpIf('{')) {
                return this.error(parentArgType === 'select'
                    ? ErrorKind.EXPECT_SELECT_ARGUMENT_SELECTOR_FRAGMENT
                    : ErrorKind.EXPECT_PLURAL_ARGUMENT_SELECTOR_FRAGMENT, createLocation(this.clonePosition(), this.clonePosition()));
            }
            var fragmentResult = this.parseMessage(nestingLevel + 1, parentArgType, expectCloseTag);
            if (fragmentResult.err) {
                return fragmentResult;
            }
            var argCloseResult = this.tryParseArgumentClose(openingBracePosition);
            if (argCloseResult.err) {
                return argCloseResult;
            }
            options.push([
                selector,
                {
                    value: fragmentResult.val,
                    location: createLocation(openingBracePosition, this.clonePosition()),
                },
            ]);
            // Keep track of the existing selectors
            parsedSelectors.add(selector);
            // Prep next selector clause.
            this.bumpSpace();
            (_a = this.parseIdentifierIfPossible(), selector = _a.value, selectorLocation = _a.location);
        }
        if (options.length === 0) {
            return this.error(parentArgType === 'select'
                ? ErrorKind.EXPECT_SELECT_ARGUMENT_SELECTOR
                : ErrorKind.EXPECT_PLURAL_ARGUMENT_SELECTOR, createLocation(this.clonePosition(), this.clonePosition()));
        }
        if (this.requiresOtherClause && !hasOtherClause) {
            return this.error(ErrorKind.MISSING_OTHER_CLAUSE, createLocation(this.clonePosition(), this.clonePosition()));
        }
        return { val: options, err: null };
    };
    Parser.prototype.tryParseDecimalInteger = function (expectNumberError, invalidNumberError) {
        var sign = 1;
        var startingPosition = this.clonePosition();
        if (this.bumpIf('+')) ;
        else if (this.bumpIf('-')) {
            sign = -1;
        }
        var hasDigits = false;
        var decimal = 0;
        while (!this.isEOF()) {
            var ch = this.char();
            if (ch >= 48 /* `0` */ && ch <= 57 /* `9` */) {
                hasDigits = true;
                decimal = decimal * 10 + (ch - 48);
                this.bump();
            }
            else {
                break;
            }
        }
        var location = createLocation(startingPosition, this.clonePosition());
        if (!hasDigits) {
            return this.error(expectNumberError, location);
        }
        decimal *= sign;
        if (!isSafeInteger(decimal)) {
            return this.error(invalidNumberError, location);
        }
        return { val: decimal, err: null };
    };
    Parser.prototype.offset = function () {
        return this.position.offset;
    };
    Parser.prototype.isEOF = function () {
        return this.offset() === this.message.length;
    };
    Parser.prototype.clonePosition = function () {
        // This is much faster than `Object.assign` or spread.
        return {
            offset: this.position.offset,
            line: this.position.line,
            column: this.position.column,
        };
    };
    /**
     * Return the code point at the current position of the parser.
     * Throws if the index is out of bound.
     */
    Parser.prototype.char = function () {
        var offset = this.position.offset;
        if (offset >= this.message.length) {
            throw Error('out of bound');
        }
        var code = codePointAt(this.message, offset);
        if (code === undefined) {
            throw Error("Offset ".concat(offset, " is at invalid UTF-16 code unit boundary"));
        }
        return code;
    };
    Parser.prototype.error = function (kind, location) {
        return {
            val: null,
            err: {
                kind: kind,
                message: this.message,
                location: location,
            },
        };
    };
    /** Bump the parser to the next UTF-16 code unit. */
    Parser.prototype.bump = function () {
        if (this.isEOF()) {
            return;
        }
        var code = this.char();
        if (code === 10 /* '\n' */) {
            this.position.line += 1;
            this.position.column = 1;
            this.position.offset += 1;
        }
        else {
            this.position.column += 1;
            // 0 ~ 0x10000 -> unicode BMP, otherwise skip the surrogate pair.
            this.position.offset += code < 0x10000 ? 1 : 2;
        }
    };
    /**
     * If the substring starting at the current position of the parser has
     * the given prefix, then bump the parser to the character immediately
     * following the prefix and return true. Otherwise, don't bump the parser
     * and return false.
     */
    Parser.prototype.bumpIf = function (prefix) {
        if (startsWith(this.message, prefix, this.offset())) {
            for (var i = 0; i < prefix.length; i++) {
                this.bump();
            }
            return true;
        }
        return false;
    };
    /**
     * Bump the parser until the pattern character is found and return `true`.
     * Otherwise bump to the end of the file and return `false`.
     */
    Parser.prototype.bumpUntil = function (pattern) {
        var currentOffset = this.offset();
        var index = this.message.indexOf(pattern, currentOffset);
        if (index >= 0) {
            this.bumpTo(index);
            return true;
        }
        else {
            this.bumpTo(this.message.length);
            return false;
        }
    };
    /**
     * Bump the parser to the target offset.
     * If target offset is beyond the end of the input, bump the parser to the end of the input.
     */
    Parser.prototype.bumpTo = function (targetOffset) {
        if (this.offset() > targetOffset) {
            throw Error("targetOffset ".concat(targetOffset, " must be greater than or equal to the current offset ").concat(this.offset()));
        }
        targetOffset = Math.min(targetOffset, this.message.length);
        while (true) {
            var offset = this.offset();
            if (offset === targetOffset) {
                break;
            }
            if (offset > targetOffset) {
                throw Error("targetOffset ".concat(targetOffset, " is at invalid UTF-16 code unit boundary"));
            }
            this.bump();
            if (this.isEOF()) {
                break;
            }
        }
    };
    /** advance the parser through all whitespace to the next non-whitespace code unit. */
    Parser.prototype.bumpSpace = function () {
        while (!this.isEOF() && _isWhiteSpace(this.char())) {
            this.bump();
        }
    };
    /**
     * Peek at the *next* Unicode codepoint in the input without advancing the parser.
     * If the input has been exhausted, then this returns null.
     */
    Parser.prototype.peek = function () {
        if (this.isEOF()) {
            return null;
        }
        var code = this.char();
        var offset = this.offset();
        var nextCode = this.message.charCodeAt(offset + (code >= 0x10000 ? 2 : 1));
        return nextCode !== null && nextCode !== void 0 ? nextCode : null;
    };
    return Parser;
}());
/**
 * This check if codepoint is alphabet (lower & uppercase)
 * @param codepoint
 * @returns
 */
function _isAlpha(codepoint) {
    return ((codepoint >= 97 && codepoint <= 122) ||
        (codepoint >= 65 && codepoint <= 90));
}
function _isAlphaOrSlash(codepoint) {
    return _isAlpha(codepoint) || codepoint === 47; /* '/' */
}
/** See `parseTag` function docs. */
function _isPotentialElementNameChar(c) {
    return (c === 45 /* '-' */ ||
        c === 46 /* '.' */ ||
        (c >= 48 && c <= 57) /* 0..9 */ ||
        c === 95 /* '_' */ ||
        (c >= 97 && c <= 122) /** a..z */ ||
        (c >= 65 && c <= 90) /* A..Z */ ||
        c == 0xb7 ||
        (c >= 0xc0 && c <= 0xd6) ||
        (c >= 0xd8 && c <= 0xf6) ||
        (c >= 0xf8 && c <= 0x37d) ||
        (c >= 0x37f && c <= 0x1fff) ||
        (c >= 0x200c && c <= 0x200d) ||
        (c >= 0x203f && c <= 0x2040) ||
        (c >= 0x2070 && c <= 0x218f) ||
        (c >= 0x2c00 && c <= 0x2fef) ||
        (c >= 0x3001 && c <= 0xd7ff) ||
        (c >= 0xf900 && c <= 0xfdcf) ||
        (c >= 0xfdf0 && c <= 0xfffd) ||
        (c >= 0x10000 && c <= 0xeffff));
}
/**
 * Code point equivalent of regex `\p{White_Space}`.
 * From: https://www.unicode.org/Public/UCD/latest/ucd/PropList.txt
 */
function _isWhiteSpace(c) {
    return ((c >= 0x0009 && c <= 0x000d) ||
        c === 0x0020 ||
        c === 0x0085 ||
        (c >= 0x200e && c <= 0x200f) ||
        c === 0x2028 ||
        c === 0x2029);
}
/**
 * Code point equivalent of regex `\p{Pattern_Syntax}`.
 * See https://www.unicode.org/Public/UCD/latest/ucd/PropList.txt
 */
function _isPatternSyntax(c) {
    return ((c >= 0x0021 && c <= 0x0023) ||
        c === 0x0024 ||
        (c >= 0x0025 && c <= 0x0027) ||
        c === 0x0028 ||
        c === 0x0029 ||
        c === 0x002a ||
        c === 0x002b ||
        c === 0x002c ||
        c === 0x002d ||
        (c >= 0x002e && c <= 0x002f) ||
        (c >= 0x003a && c <= 0x003b) ||
        (c >= 0x003c && c <= 0x003e) ||
        (c >= 0x003f && c <= 0x0040) ||
        c === 0x005b ||
        c === 0x005c ||
        c === 0x005d ||
        c === 0x005e ||
        c === 0x0060 ||
        c === 0x007b ||
        c === 0x007c ||
        c === 0x007d ||
        c === 0x007e ||
        c === 0x00a1 ||
        (c >= 0x00a2 && c <= 0x00a5) ||
        c === 0x00a6 ||
        c === 0x00a7 ||
        c === 0x00a9 ||
        c === 0x00ab ||
        c === 0x00ac ||
        c === 0x00ae ||
        c === 0x00b0 ||
        c === 0x00b1 ||
        c === 0x00b6 ||
        c === 0x00bb ||
        c === 0x00bf ||
        c === 0x00d7 ||
        c === 0x00f7 ||
        (c >= 0x2010 && c <= 0x2015) ||
        (c >= 0x2016 && c <= 0x2017) ||
        c === 0x2018 ||
        c === 0x2019 ||
        c === 0x201a ||
        (c >= 0x201b && c <= 0x201c) ||
        c === 0x201d ||
        c === 0x201e ||
        c === 0x201f ||
        (c >= 0x2020 && c <= 0x2027) ||
        (c >= 0x2030 && c <= 0x2038) ||
        c === 0x2039 ||
        c === 0x203a ||
        (c >= 0x203b && c <= 0x203e) ||
        (c >= 0x2041 && c <= 0x2043) ||
        c === 0x2044 ||
        c === 0x2045 ||
        c === 0x2046 ||
        (c >= 0x2047 && c <= 0x2051) ||
        c === 0x2052 ||
        c === 0x2053 ||
        (c >= 0x2055 && c <= 0x205e) ||
        (c >= 0x2190 && c <= 0x2194) ||
        (c >= 0x2195 && c <= 0x2199) ||
        (c >= 0x219a && c <= 0x219b) ||
        (c >= 0x219c && c <= 0x219f) ||
        c === 0x21a0 ||
        (c >= 0x21a1 && c <= 0x21a2) ||
        c === 0x21a3 ||
        (c >= 0x21a4 && c <= 0x21a5) ||
        c === 0x21a6 ||
        (c >= 0x21a7 && c <= 0x21ad) ||
        c === 0x21ae ||
        (c >= 0x21af && c <= 0x21cd) ||
        (c >= 0x21ce && c <= 0x21cf) ||
        (c >= 0x21d0 && c <= 0x21d1) ||
        c === 0x21d2 ||
        c === 0x21d3 ||
        c === 0x21d4 ||
        (c >= 0x21d5 && c <= 0x21f3) ||
        (c >= 0x21f4 && c <= 0x22ff) ||
        (c >= 0x2300 && c <= 0x2307) ||
        c === 0x2308 ||
        c === 0x2309 ||
        c === 0x230a ||
        c === 0x230b ||
        (c >= 0x230c && c <= 0x231f) ||
        (c >= 0x2320 && c <= 0x2321) ||
        (c >= 0x2322 && c <= 0x2328) ||
        c === 0x2329 ||
        c === 0x232a ||
        (c >= 0x232b && c <= 0x237b) ||
        c === 0x237c ||
        (c >= 0x237d && c <= 0x239a) ||
        (c >= 0x239b && c <= 0x23b3) ||
        (c >= 0x23b4 && c <= 0x23db) ||
        (c >= 0x23dc && c <= 0x23e1) ||
        (c >= 0x23e2 && c <= 0x2426) ||
        (c >= 0x2427 && c <= 0x243f) ||
        (c >= 0x2440 && c <= 0x244a) ||
        (c >= 0x244b && c <= 0x245f) ||
        (c >= 0x2500 && c <= 0x25b6) ||
        c === 0x25b7 ||
        (c >= 0x25b8 && c <= 0x25c0) ||
        c === 0x25c1 ||
        (c >= 0x25c2 && c <= 0x25f7) ||
        (c >= 0x25f8 && c <= 0x25ff) ||
        (c >= 0x2600 && c <= 0x266e) ||
        c === 0x266f ||
        (c >= 0x2670 && c <= 0x2767) ||
        c === 0x2768 ||
        c === 0x2769 ||
        c === 0x276a ||
        c === 0x276b ||
        c === 0x276c ||
        c === 0x276d ||
        c === 0x276e ||
        c === 0x276f ||
        c === 0x2770 ||
        c === 0x2771 ||
        c === 0x2772 ||
        c === 0x2773 ||
        c === 0x2774 ||
        c === 0x2775 ||
        (c >= 0x2794 && c <= 0x27bf) ||
        (c >= 0x27c0 && c <= 0x27c4) ||
        c === 0x27c5 ||
        c === 0x27c6 ||
        (c >= 0x27c7 && c <= 0x27e5) ||
        c === 0x27e6 ||
        c === 0x27e7 ||
        c === 0x27e8 ||
        c === 0x27e9 ||
        c === 0x27ea ||
        c === 0x27eb ||
        c === 0x27ec ||
        c === 0x27ed ||
        c === 0x27ee ||
        c === 0x27ef ||
        (c >= 0x27f0 && c <= 0x27ff) ||
        (c >= 0x2800 && c <= 0x28ff) ||
        (c >= 0x2900 && c <= 0x2982) ||
        c === 0x2983 ||
        c === 0x2984 ||
        c === 0x2985 ||
        c === 0x2986 ||
        c === 0x2987 ||
        c === 0x2988 ||
        c === 0x2989 ||
        c === 0x298a ||
        c === 0x298b ||
        c === 0x298c ||
        c === 0x298d ||
        c === 0x298e ||
        c === 0x298f ||
        c === 0x2990 ||
        c === 0x2991 ||
        c === 0x2992 ||
        c === 0x2993 ||
        c === 0x2994 ||
        c === 0x2995 ||
        c === 0x2996 ||
        c === 0x2997 ||
        c === 0x2998 ||
        (c >= 0x2999 && c <= 0x29d7) ||
        c === 0x29d8 ||
        c === 0x29d9 ||
        c === 0x29da ||
        c === 0x29db ||
        (c >= 0x29dc && c <= 0x29fb) ||
        c === 0x29fc ||
        c === 0x29fd ||
        (c >= 0x29fe && c <= 0x2aff) ||
        (c >= 0x2b00 && c <= 0x2b2f) ||
        (c >= 0x2b30 && c <= 0x2b44) ||
        (c >= 0x2b45 && c <= 0x2b46) ||
        (c >= 0x2b47 && c <= 0x2b4c) ||
        (c >= 0x2b4d && c <= 0x2b73) ||
        (c >= 0x2b74 && c <= 0x2b75) ||
        (c >= 0x2b76 && c <= 0x2b95) ||
        c === 0x2b96 ||
        (c >= 0x2b97 && c <= 0x2bff) ||
        (c >= 0x2e00 && c <= 0x2e01) ||
        c === 0x2e02 ||
        c === 0x2e03 ||
        c === 0x2e04 ||
        c === 0x2e05 ||
        (c >= 0x2e06 && c <= 0x2e08) ||
        c === 0x2e09 ||
        c === 0x2e0a ||
        c === 0x2e0b ||
        c === 0x2e0c ||
        c === 0x2e0d ||
        (c >= 0x2e0e && c <= 0x2e16) ||
        c === 0x2e17 ||
        (c >= 0x2e18 && c <= 0x2e19) ||
        c === 0x2e1a ||
        c === 0x2e1b ||
        c === 0x2e1c ||
        c === 0x2e1d ||
        (c >= 0x2e1e && c <= 0x2e1f) ||
        c === 0x2e20 ||
        c === 0x2e21 ||
        c === 0x2e22 ||
        c === 0x2e23 ||
        c === 0x2e24 ||
        c === 0x2e25 ||
        c === 0x2e26 ||
        c === 0x2e27 ||
        c === 0x2e28 ||
        c === 0x2e29 ||
        (c >= 0x2e2a && c <= 0x2e2e) ||
        c === 0x2e2f ||
        (c >= 0x2e30 && c <= 0x2e39) ||
        (c >= 0x2e3a && c <= 0x2e3b) ||
        (c >= 0x2e3c && c <= 0x2e3f) ||
        c === 0x2e40 ||
        c === 0x2e41 ||
        c === 0x2e42 ||
        (c >= 0x2e43 && c <= 0x2e4f) ||
        (c >= 0x2e50 && c <= 0x2e51) ||
        c === 0x2e52 ||
        (c >= 0x2e53 && c <= 0x2e7f) ||
        (c >= 0x3001 && c <= 0x3003) ||
        c === 0x3008 ||
        c === 0x3009 ||
        c === 0x300a ||
        c === 0x300b ||
        c === 0x300c ||
        c === 0x300d ||
        c === 0x300e ||
        c === 0x300f ||
        c === 0x3010 ||
        c === 0x3011 ||
        (c >= 0x3012 && c <= 0x3013) ||
        c === 0x3014 ||
        c === 0x3015 ||
        c === 0x3016 ||
        c === 0x3017 ||
        c === 0x3018 ||
        c === 0x3019 ||
        c === 0x301a ||
        c === 0x301b ||
        c === 0x301c ||
        c === 0x301d ||
        (c >= 0x301e && c <= 0x301f) ||
        c === 0x3020 ||
        c === 0x3030 ||
        c === 0xfd3e ||
        c === 0xfd3f ||
        (c >= 0xfe45 && c <= 0xfe46));
}

function pruneLocation(els) {
    els.forEach(function (el) {
        delete el.location;
        if (isSelectElement(el) || isPluralElement(el)) {
            for (var k in el.options) {
                delete el.options[k].location;
                pruneLocation(el.options[k].value);
            }
        }
        else if (isNumberElement(el) && isNumberSkeleton(el.style)) {
            delete el.style.location;
        }
        else if ((isDateElement(el) || isTimeElement(el)) &&
            isDateTimeSkeleton(el.style)) {
            delete el.style.location;
        }
        else if (isTagElement(el)) {
            pruneLocation(el.children);
        }
    });
}
function parse(message, opts) {
    if (opts === void 0) { opts = {}; }
    opts = __assign({ shouldParseSkeletons: true, requiresOtherClause: true }, opts);
    var result = new Parser(message, opts).parse();
    if (result.err) {
        var error = SyntaxError(ErrorKind[result.err.kind]);
        // @ts-expect-error Assign to error object
        error.location = result.err.location;
        // @ts-expect-error Assign to error object
        error.originalMessage = result.err.message;
        throw error;
    }
    if (!(opts === null || opts === void 0 ? void 0 : opts.captureLocation)) {
        pruneLocation(result.val);
    }
    return result.val;
}

//
// Main
//
function memoize(fn, options) {
    var cache = options && options.cache ? options.cache : cacheDefault;
    var serializer = options && options.serializer ? options.serializer : serializerDefault;
    var strategy = options && options.strategy ? options.strategy : strategyDefault;
    return strategy(fn, {
        cache: cache,
        serializer: serializer,
    });
}
//
// Strategy
//
function isPrimitive(value) {
    return (value == null || typeof value === 'number' || typeof value === 'boolean'); // || typeof value === "string" 'unsafe' primitive for our needs
}
function monadic(fn, cache, serializer, arg) {
    var cacheKey = isPrimitive(arg) ? arg : serializer(arg);
    var computedValue = cache.get(cacheKey);
    if (typeof computedValue === 'undefined') {
        computedValue = fn.call(this, arg);
        cache.set(cacheKey, computedValue);
    }
    return computedValue;
}
function variadic(fn, cache, serializer) {
    var args = Array.prototype.slice.call(arguments, 3);
    var cacheKey = serializer(args);
    var computedValue = cache.get(cacheKey);
    if (typeof computedValue === 'undefined') {
        computedValue = fn.apply(this, args);
        cache.set(cacheKey, computedValue);
    }
    return computedValue;
}
function assemble(fn, context, strategy, cache, serialize) {
    return strategy.bind(context, fn, cache, serialize);
}
function strategyDefault(fn, options) {
    var strategy = fn.length === 1 ? monadic : variadic;
    return assemble(fn, this, strategy, options.cache.create(), options.serializer);
}
function strategyVariadic(fn, options) {
    return assemble(fn, this, variadic, options.cache.create(), options.serializer);
}
function strategyMonadic(fn, options) {
    return assemble(fn, this, monadic, options.cache.create(), options.serializer);
}
//
// Serializer
//
var serializerDefault = function () {
    return JSON.stringify(arguments);
};
//
// Cache
//
function ObjectWithoutPrototypeCache() {
    this.cache = Object.create(null);
}
ObjectWithoutPrototypeCache.prototype.get = function (key) {
    return this.cache[key];
};
ObjectWithoutPrototypeCache.prototype.set = function (key, value) {
    this.cache[key] = value;
};
var cacheDefault = {
    create: function create() {
        // @ts-ignore
        return new ObjectWithoutPrototypeCache();
    },
};
var strategies = {
    variadic: strategyVariadic,
    monadic: strategyMonadic,
};

var ErrorCode;
(function (ErrorCode) {
    // When we have a placeholder but no value to format
    ErrorCode["MISSING_VALUE"] = "MISSING_VALUE";
    // When value supplied is invalid
    ErrorCode["INVALID_VALUE"] = "INVALID_VALUE";
    // When we need specific Intl API but it's not available
    ErrorCode["MISSING_INTL_API"] = "MISSING_INTL_API";
})(ErrorCode || (ErrorCode = {}));
var FormatError = /** @class */ (function (_super) {
    __extends(FormatError, _super);
    function FormatError(msg, code, originalMessage) {
        var _this = _super.call(this, msg) || this;
        _this.code = code;
        _this.originalMessage = originalMessage;
        return _this;
    }
    FormatError.prototype.toString = function () {
        return "[formatjs Error: ".concat(this.code, "] ").concat(this.message);
    };
    return FormatError;
}(Error));
var InvalidValueError = /** @class */ (function (_super) {
    __extends(InvalidValueError, _super);
    function InvalidValueError(variableId, value, options, originalMessage) {
        return _super.call(this, "Invalid values for \"".concat(variableId, "\": \"").concat(value, "\". Options are \"").concat(Object.keys(options).join('", "'), "\""), ErrorCode.INVALID_VALUE, originalMessage) || this;
    }
    return InvalidValueError;
}(FormatError));
var InvalidValueTypeError = /** @class */ (function (_super) {
    __extends(InvalidValueTypeError, _super);
    function InvalidValueTypeError(value, type, originalMessage) {
        return _super.call(this, "Value for \"".concat(value, "\" must be of type ").concat(type), ErrorCode.INVALID_VALUE, originalMessage) || this;
    }
    return InvalidValueTypeError;
}(FormatError));
var MissingValueError = /** @class */ (function (_super) {
    __extends(MissingValueError, _super);
    function MissingValueError(variableId, originalMessage) {
        return _super.call(this, "The intl string context variable \"".concat(variableId, "\" was not provided to the string \"").concat(originalMessage, "\""), ErrorCode.MISSING_VALUE, originalMessage) || this;
    }
    return MissingValueError;
}(FormatError));

var PART_TYPE;
(function (PART_TYPE) {
    PART_TYPE[PART_TYPE["literal"] = 0] = "literal";
    PART_TYPE[PART_TYPE["object"] = 1] = "object";
})(PART_TYPE || (PART_TYPE = {}));
function mergeLiteral(parts) {
    if (parts.length < 2) {
        return parts;
    }
    return parts.reduce(function (all, part) {
        var lastPart = all[all.length - 1];
        if (!lastPart ||
            lastPart.type !== PART_TYPE.literal ||
            part.type !== PART_TYPE.literal) {
            all.push(part);
        }
        else {
            lastPart.value += part.value;
        }
        return all;
    }, []);
}
function isFormatXMLElementFn(el) {
    return typeof el === 'function';
}
// TODO(skeleton): add skeleton support
function formatToParts(els, locales, formatters, formats, values, currentPluralValue, 
// For debugging
originalMessage) {
    // Hot path for straight simple msg translations
    if (els.length === 1 && isLiteralElement(els[0])) {
        return [
            {
                type: PART_TYPE.literal,
                value: els[0].value,
            },
        ];
    }
    var result = [];
    for (var _i = 0, els_1 = els; _i < els_1.length; _i++) {
        var el = els_1[_i];
        // Exit early for string parts.
        if (isLiteralElement(el)) {
            result.push({
                type: PART_TYPE.literal,
                value: el.value,
            });
            continue;
        }
        // TODO: should this part be literal type?
        // Replace `#` in plural rules with the actual numeric value.
        if (isPoundElement(el)) {
            if (typeof currentPluralValue === 'number') {
                result.push({
                    type: PART_TYPE.literal,
                    value: formatters.getNumberFormat(locales).format(currentPluralValue),
                });
            }
            continue;
        }
        var varName = el.value;
        // Enforce that all required values are provided by the caller.
        if (!(values && varName in values)) {
            throw new MissingValueError(varName, originalMessage);
        }
        var value = values[varName];
        if (isArgumentElement(el)) {
            if (!value || typeof value === 'string' || typeof value === 'number') {
                value =
                    typeof value === 'string' || typeof value === 'number'
                        ? String(value)
                        : '';
            }
            result.push({
                type: typeof value === 'string' ? PART_TYPE.literal : PART_TYPE.object,
                value: value,
            });
            continue;
        }
        // Recursively format plural and select parts' option — which can be a
        // nested pattern structure. The choosing of the option to use is
        // abstracted-by and delegated-to the part helper object.
        if (isDateElement(el)) {
            var style = typeof el.style === 'string'
                ? formats.date[el.style]
                : isDateTimeSkeleton(el.style)
                    ? el.style.parsedOptions
                    : undefined;
            result.push({
                type: PART_TYPE.literal,
                value: formatters
                    .getDateTimeFormat(locales, style)
                    .format(value),
            });
            continue;
        }
        if (isTimeElement(el)) {
            var style = typeof el.style === 'string'
                ? formats.time[el.style]
                : isDateTimeSkeleton(el.style)
                    ? el.style.parsedOptions
                    : undefined;
            result.push({
                type: PART_TYPE.literal,
                value: formatters
                    .getDateTimeFormat(locales, style)
                    .format(value),
            });
            continue;
        }
        if (isNumberElement(el)) {
            var style = typeof el.style === 'string'
                ? formats.number[el.style]
                : isNumberSkeleton(el.style)
                    ? el.style.parsedOptions
                    : undefined;
            if (style && style.scale) {
                value =
                    value *
                        (style.scale || 1);
            }
            result.push({
                type: PART_TYPE.literal,
                value: formatters
                    .getNumberFormat(locales, style)
                    .format(value),
            });
            continue;
        }
        if (isTagElement(el)) {
            var children = el.children, value_1 = el.value;
            var formatFn = values[value_1];
            if (!isFormatXMLElementFn(formatFn)) {
                throw new InvalidValueTypeError(value_1, 'function', originalMessage);
            }
            var parts = formatToParts(children, locales, formatters, formats, values, currentPluralValue);
            var chunks = formatFn(parts.map(function (p) { return p.value; }));
            if (!Array.isArray(chunks)) {
                chunks = [chunks];
            }
            result.push.apply(result, chunks.map(function (c) {
                return {
                    type: typeof c === 'string' ? PART_TYPE.literal : PART_TYPE.object,
                    value: c,
                };
            }));
        }
        if (isSelectElement(el)) {
            var opt = el.options[value] || el.options.other;
            if (!opt) {
                throw new InvalidValueError(el.value, value, Object.keys(el.options), originalMessage);
            }
            result.push.apply(result, formatToParts(opt.value, locales, formatters, formats, values));
            continue;
        }
        if (isPluralElement(el)) {
            var opt = el.options["=".concat(value)];
            if (!opt) {
                if (!Intl.PluralRules) {
                    throw new FormatError("Intl.PluralRules is not available in this environment.\nTry polyfilling it using \"@formatjs/intl-pluralrules\"\n", ErrorCode.MISSING_INTL_API, originalMessage);
                }
                var rule = formatters
                    .getPluralRules(locales, { type: el.pluralType })
                    .select(value - (el.offset || 0));
                opt = el.options[rule] || el.options.other;
            }
            if (!opt) {
                throw new InvalidValueError(el.value, value, Object.keys(el.options), originalMessage);
            }
            result.push.apply(result, formatToParts(opt.value, locales, formatters, formats, values, value - (el.offset || 0)));
            continue;
        }
    }
    return mergeLiteral(result);
}

/*
Copyright (c) 2014, Yahoo! Inc. All rights reserved.
Copyrights licensed under the New BSD License.
See the accompanying LICENSE file for terms.
*/
// -- MessageFormat --------------------------------------------------------
function mergeConfig(c1, c2) {
    if (!c2) {
        return c1;
    }
    return __assign(__assign(__assign({}, (c1 || {})), (c2 || {})), Object.keys(c1).reduce(function (all, k) {
        all[k] = __assign(__assign({}, c1[k]), (c2[k] || {}));
        return all;
    }, {}));
}
function mergeConfigs(defaultConfig, configs) {
    if (!configs) {
        return defaultConfig;
    }
    return Object.keys(defaultConfig).reduce(function (all, k) {
        all[k] = mergeConfig(defaultConfig[k], configs[k]);
        return all;
    }, __assign({}, defaultConfig));
}
function createFastMemoizeCache(store) {
    return {
        create: function () {
            return {
                get: function (key) {
                    return store[key];
                },
                set: function (key, value) {
                    store[key] = value;
                },
            };
        },
    };
}
function createDefaultFormatters(cache) {
    if (cache === void 0) { cache = {
        number: {},
        dateTime: {},
        pluralRules: {},
    }; }
    return {
        getNumberFormat: memoize(function () {
            var _a;
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            return new ((_a = Intl.NumberFormat).bind.apply(_a, __spreadArray([void 0], args, false)))();
        }, {
            cache: createFastMemoizeCache(cache.number),
            strategy: strategies.variadic,
        }),
        getDateTimeFormat: memoize(function () {
            var _a;
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            return new ((_a = Intl.DateTimeFormat).bind.apply(_a, __spreadArray([void 0], args, false)))();
        }, {
            cache: createFastMemoizeCache(cache.dateTime),
            strategy: strategies.variadic,
        }),
        getPluralRules: memoize(function () {
            var _a;
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            return new ((_a = Intl.PluralRules).bind.apply(_a, __spreadArray([void 0], args, false)))();
        }, {
            cache: createFastMemoizeCache(cache.pluralRules),
            strategy: strategies.variadic,
        }),
    };
}
var IntlMessageFormat = /** @class */ (function () {
    function IntlMessageFormat(message, locales, overrideFormats, opts) {
        var _this = this;
        if (locales === void 0) { locales = IntlMessageFormat.defaultLocale; }
        this.formatterCache = {
            number: {},
            dateTime: {},
            pluralRules: {},
        };
        this.format = function (values) {
            var parts = _this.formatToParts(values);
            // Hot path for straight simple msg translations
            if (parts.length === 1) {
                return parts[0].value;
            }
            var result = parts.reduce(function (all, part) {
                if (!all.length ||
                    part.type !== PART_TYPE.literal ||
                    typeof all[all.length - 1] !== 'string') {
                    all.push(part.value);
                }
                else {
                    all[all.length - 1] += part.value;
                }
                return all;
            }, []);
            if (result.length <= 1) {
                return result[0] || '';
            }
            return result;
        };
        this.formatToParts = function (values) {
            return formatToParts(_this.ast, _this.locales, _this.formatters, _this.formats, values, undefined, _this.message);
        };
        this.resolvedOptions = function () { return ({
            locale: Intl.NumberFormat.supportedLocalesOf(_this.locales)[0],
        }); };
        this.getAst = function () { return _this.ast; };
        if (typeof message === 'string') {
            this.message = message;
            if (!IntlMessageFormat.__parse) {
                throw new TypeError('IntlMessageFormat.__parse must be set to process `message` of type `string`');
            }
            // Parse string messages into an AST.
            this.ast = IntlMessageFormat.__parse(message, {
                ignoreTag: opts === null || opts === void 0 ? void 0 : opts.ignoreTag,
            });
        }
        else {
            this.ast = message;
        }
        if (!Array.isArray(this.ast)) {
            throw new TypeError('A message must be provided as a String or AST.');
        }
        // Creates a new object with the specified `formats` merged with the default
        // formats.
        this.formats = mergeConfigs(IntlMessageFormat.formats, overrideFormats);
        // Defined first because it's used to build the format pattern.
        this.locales = locales;
        this.formatters =
            (opts && opts.formatters) || createDefaultFormatters(this.formatterCache);
    }
    Object.defineProperty(IntlMessageFormat, "defaultLocale", {
        get: function () {
            if (!IntlMessageFormat.memoizedDefaultLocale) {
                IntlMessageFormat.memoizedDefaultLocale =
                    new Intl.NumberFormat().resolvedOptions().locale;
            }
            return IntlMessageFormat.memoizedDefaultLocale;
        },
        enumerable: false,
        configurable: true
    });
    IntlMessageFormat.memoizedDefaultLocale = null;
    IntlMessageFormat.__parse = parse;
    // Default format options used as the prototype of the `formats` provided to the
    // constructor. These are used when constructing the internal Intl.NumberFormat
    // and Intl.DateTimeFormat instances.
    IntlMessageFormat.formats = {
        number: {
            integer: {
                maximumFractionDigits: 0,
            },
            currency: {
                style: 'currency',
            },
            percent: {
                style: 'percent',
            },
        },
        date: {
            short: {
                month: 'numeric',
                day: 'numeric',
                year: '2-digit',
            },
            medium: {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
            },
            long: {
                month: 'long',
                day: 'numeric',
                year: 'numeric',
            },
            full: {
                weekday: 'long',
                month: 'long',
                day: 'numeric',
                year: 'numeric',
            },
        },
        time: {
            short: {
                hour: 'numeric',
                minute: 'numeric',
            },
            medium: {
                hour: 'numeric',
                minute: 'numeric',
                second: 'numeric',
            },
            long: {
                hour: 'numeric',
                minute: 'numeric',
                second: 'numeric',
                timeZoneName: 'short',
            },
            full: {
                hour: 'numeric',
                minute: 'numeric',
                second: 'numeric',
                timeZoneName: 'short',
            },
        },
    };
    return IntlMessageFormat;
}());

/*
Copyright (c) 2014, Yahoo! Inc. All rights reserved.
Copyrights licensed under the New BSD License.
See the accompanying LICENSE file for terms.
*/
var o = IntlMessageFormat;

const r={},i=(e,n,t)=>t?(n in r||(r[n]={}),e in r[n]||(r[n][e]=t),t):t,l=(e,n)=>{if(null==n)return;if(n in r&&e in r[n])return r[n][e];const t=E(n);for(let o=0;o<t.length;o++){const r=c(t[o],e);if(r)return i(e,n,r)}};let a;const s=writable({});function u(e){return e in a}function c(e,n){if(!u(e))return null;return function(e,n){if(null==n)return;if(n in e)return e[n];const t=n.split(".");let o=e;for(let e=0;e<t.length;e++)if("object"==typeof o){if(e>0){const n=t.slice(e,t.length).join(".");if(n in o){o=o[n];break}}o=o[t[e]];}else o=void 0;return o}(function(e){return a[e]||null}(e),n)}function m(e,...n){delete r[e],s.update((o=>(o[e]=cjs.all([o[e]||{},...n]),o)));}derived([s],(([e])=>Object.keys(e)));s.subscribe((e=>a=e));const d={};function g(e){return d[e]}function w(e){return null!=e&&E(e).some((e=>{var n;return null===(n=g(e))||void 0===n?void 0:n.size}))}function h(e,n){return Promise.all(n.map((n=>(function(e,n){d[e].delete(n),0===d[e].size&&delete d[e];}(e,n),n().then((e=>e.default||e)))))).then((n=>m(e,...n)))}const p={};function b(e){if(!w(e))return e in p?p[e]:Promise.resolve();const n=function(e){return E(e).map((e=>{const n=g(e);return [e,n?[...n]:[]]})).filter((([,e])=>e.length>0))}(e);return p[e]=Promise.all(n.map((([e,n])=>h(e,n)))).then((()=>{if(w(e))return b(e);delete p[e];})),p[e]}/*! *****************************************************************************
Copyright (c) Microsoft Corporation.

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.
***************************************************************************** */function v(e,n){var t={};for(var o in e)Object.prototype.hasOwnProperty.call(e,o)&&n.indexOf(o)<0&&(t[o]=e[o]);if(null!=e&&"function"==typeof Object.getOwnPropertySymbols){var r=0;for(o=Object.getOwnPropertySymbols(e);r<o.length;r++)n.indexOf(o[r])<0&&Object.prototype.propertyIsEnumerable.call(e,o[r])&&(t[o[r]]=e[o[r]]);}return t}const O={fallbackLocale:null,loadingDelay:200,formats:{number:{scientific:{notation:"scientific"},engineering:{notation:"engineering"},compactLong:{notation:"compact",compactDisplay:"long"},compactShort:{notation:"compact",compactDisplay:"short"}},date:{short:{month:"numeric",day:"numeric",year:"2-digit"},medium:{month:"short",day:"numeric",year:"numeric"},long:{month:"long",day:"numeric",year:"numeric"},full:{weekday:"long",month:"long",day:"numeric",year:"numeric"}},time:{short:{hour:"numeric",minute:"numeric"},medium:{hour:"numeric",minute:"numeric",second:"numeric"},long:{hour:"numeric",minute:"numeric",second:"numeric",timeZoneName:"short"},full:{hour:"numeric",minute:"numeric",second:"numeric",timeZoneName:"short"}}},warnOnMissingMessages:!0,ignoreTag:!0};function j(){return O}function $(e){const{formats:n}=e,t=v(e,["formats"]),o=e.initialLocale||e.fallbackLocale;return Object.assign(O,t,{initialLocale:o}),n&&("number"in n&&Object.assign(O.formats.number,n.number),"date"in n&&Object.assign(O.formats.date,n.date),"time"in n&&Object.assign(O.formats.time,n.time)),M.set(o)}const k=writable(!1);let L;const T=writable(null);function x$1(e){return e.split("-").map(((e,n,t)=>t.slice(0,n+1).join("-"))).reverse()}function E(e,n=j().fallbackLocale){const t=x$1(e);return n?[...new Set([...t,...x$1(n)])]:t}function D(){return null!=L?L:void 0}T.subscribe((e=>{L=null!=e?e:void 0,"undefined"!=typeof window&&null!=e&&document.documentElement.setAttribute("lang",e);}));const M=Object.assign(Object.assign({},T),{set:e=>{if(e&&function(e){if(null==e)return;const n=E(e);for(let e=0;e<n.length;e++){const t=n[e];if(u(t))return t}}(e)&&w(e)){const{loadingDelay:n}=j();let t;return "undefined"!=typeof window&&null!=D()&&n?t=window.setTimeout((()=>k.set(!0)),n):k.set(!0),b(e).then((()=>{T.set(e);})).finally((()=>{clearTimeout(t),k.set(!1);}))}return T.set(e)}}),I=()=>"undefined"==typeof window?null:window.navigator.language||window.navigator.languages[0],Z=e=>{const n=Object.create(null);return t=>{const o=JSON.stringify(t);return o in n?n[o]:n[o]=e(t)}},C=(e,n)=>{const{formats:t}=j();if(e in t&&n in t[e])return t[e][n];throw new Error(`[svelte-i18n] Unknown "${n}" ${e} format.`)},G=Z((e=>{var{locale:n,format:t}=e,o=v(e,["locale","format"]);if(null==n)throw new Error('[svelte-i18n] A "locale" must be set to format numbers');return t&&(o=C("number",t)),new Intl.NumberFormat(n,o)})),J=Z((e=>{var{locale:n,format:t}=e,o=v(e,["locale","format"]);if(null==n)throw new Error('[svelte-i18n] A "locale" must be set to format dates');return t?o=C("date",t):0===Object.keys(o).length&&(o=C("date","short")),new Intl.DateTimeFormat(n,o)})),U=Z((e=>{var{locale:n,format:t}=e,o=v(e,["locale","format"]);if(null==n)throw new Error('[svelte-i18n] A "locale" must be set to format time values');return t?o=C("time",t):0===Object.keys(o).length&&(o=C("time","short")),new Intl.DateTimeFormat(n,o)})),_=(e={})=>{var{locale:n=D()}=e,t=v(e,["locale"]);return G(Object.assign({locale:n},t))},q=(e={})=>{var{locale:n=D()}=e,t=v(e,["locale"]);return J(Object.assign({locale:n},t))},B=(e={})=>{var{locale:n=D()}=e,t=v(e,["locale"]);return U(Object.assign({locale:n},t))},H=Z(((e,n=D())=>new o(e,n,j().formats,{ignoreTag:j().ignoreTag}))),K=(e,n={})=>{let t=n;"object"==typeof e&&(t=e,e=t.id);const{values:o,locale:r=D(),default:i}=t;if(null==r)throw new Error("[svelte-i18n] Cannot format a message without first setting the initial locale.");let a=l(e,r);if(a){if("string"!=typeof a)return console.warn(`[svelte-i18n] Message with id "${e}" must be of type "string", found: "${typeof a}". Gettin its value through the "$format" method is deprecated; use the "json" method instead.`),a}else j().warnOnMissingMessages&&console.warn(`[svelte-i18n] The message "${e}" was not found in "${E(r).join('", "')}".${w(D())?"\n\nNote: there are at least one loader still registered to this locale that wasn't executed.":""}`),a=null!=i?i:e;if(!o)return a;let s=a;try{s=H(a,r).format(o);}catch(n){console.warn(`[svelte-i18n] Message "${e}" has syntax error:`,n.message);}return s},Q=(e,n)=>B(n).format(e),R=(e,n)=>q(n).format(e),V=(e,n)=>_(n).format(e),W=(e,n=D())=>l(e,n),X=derived([M,s],(()=>K));derived([M],(()=>Q));derived([M],(()=>R));derived([M],(()=>V));derived([M,s],(()=>W));

const scriptRel = 'modulepreload';const seen = {};const base = './';const __vitePreload = function preload(baseModule, deps) {
    // @ts-ignore
    if (!true || !deps || deps.length === 0) {
        return baseModule();
    }
    return Promise.all(deps.map((dep) => {
        // @ts-ignore
        dep = `${base}${dep}`;
        // @ts-ignore
        if (dep in seen)
            return;
        // @ts-ignore
        seen[dep] = true;
        const isCss = dep.endsWith('.css');
        const cssSelector = isCss ? '[rel="stylesheet"]' : '';
        // @ts-ignore check if the file is already preloaded by SSR markup
        if (document.querySelector(`link[href="${dep}"]${cssSelector}`)) {
            return;
        }
        // @ts-ignore
        const link = document.createElement('link');
        // @ts-ignore
        link.rel = isCss ? 'stylesheet' : scriptRel;
        if (!isCss) {
            link.as = 'script';
            link.crossOrigin = '';
        }
        link.href = dep;
        // @ts-ignore
        window.scoped_css_attach(link);
        if (isCss) {
            return new Promise((res, rej) => {
                link.addEventListener('load', res);
                link.addEventListener('error', () => rej(new Error(`Unable to preload CSS for ${dep}`)));
            });
        }
    })).then(() => baseModule());
};

const component_map = {
  accordion: () => __vitePreload(() => import('./index.b384253d.js'),true?["assets/index.b384253d.js","assets/Column.e0962208.js","assets/styles.c72835fa.js"]:void 0),
  audio: () => __vitePreload(() => import('./index.e3fafb79.js'),true?["assets/index.e3fafb79.js","assets/index.4975a780.css","assets/Upload.2f4650bf.js","assets/ModifyUpload.7ca2bf88.js","assets/BlockLabel.31f372c5.js","assets/styles.c72835fa.js","assets/Block.1a05a0a3.js","assets/utils.27234e1d.js"]:void 0),
  box: () => __vitePreload(() => import('./index.1ab05be4.js'),true?["assets/index.1ab05be4.js","assets/Block.1a05a0a3.js","assets/styles.c72835fa.js"]:void 0),
  button: () => __vitePreload(() => import('./index.f28d6623.js'),true?["assets/index.f28d6623.js","assets/styles.c72835fa.js"]:void 0),
  carousel: () => __vitePreload(() => import('./index.884a75df.js'),true?["assets/index.884a75df.js","assets/CarouselItem.svelte_svelte_type_style_lang.cbe5a617.js","assets/CarouselItem.svelte_svelte_type_style_lang.d8150608.css"]:void 0),
  carouselitem: () => __vitePreload(() => import('./index.f612dfc3.js'),true?["assets/index.f612dfc3.js","assets/CarouselItem.svelte_svelte_type_style_lang.cbe5a617.js","assets/CarouselItem.svelte_svelte_type_style_lang.d8150608.css"]:void 0),
  chatbot: () => __vitePreload(() => import('./index.0c5c654d.js'),true?["assets/index.0c5c654d.js","assets/Block.1a05a0a3.js","assets/styles.c72835fa.js","assets/BlockLabel.31f372c5.js"]:void 0),
  checkbox: () => __vitePreload(() => import('./index.fbda4d2a.js'),true?["assets/index.fbda4d2a.js","assets/styles.c72835fa.js","assets/Block.1a05a0a3.js"]:void 0),
  checkboxgroup: () => __vitePreload(() => import('./index.77090d42.js'),true?["assets/index.77090d42.js","assets/styles.c72835fa.js","assets/BlockTitle.d14e8b91.js","assets/Block.1a05a0a3.js"]:void 0),
  colorpicker: () => __vitePreload(() => import('./index.e9077c92.js'),true?["assets/index.e9077c92.js","assets/Block.1a05a0a3.js","assets/styles.c72835fa.js","assets/BlockTitle.d14e8b91.js"]:void 0),
  column: () => __vitePreload(() => import('./index.b54cc18b.js'),true?["assets/index.b54cc18b.js","assets/Column.e0962208.js","assets/styles.c72835fa.js"]:void 0),
  dataframe: () => __vitePreload(() => import('./index.7d83bd80.js'),true?["assets/index.7d83bd80.js","assets/styles.c72835fa.js","assets/Upload.2f4650bf.js","assets/dsv.7fe76a93.js"]:void 0),
  dataset: () => __vitePreload(() => import('./index.664e2a3d.js'),true?["assets/index.664e2a3d.js","assets/Image.81bf6864.js","assets/csv.27f5436c.js","assets/dsv.7fe76a93.js","assets/Model3D.aa8e1b60.js"]:void 0),
  dropdown: () => __vitePreload(() => import('./index.802f0d8a.js'),true?["assets/index.802f0d8a.js","assets/Block.1a05a0a3.js","assets/styles.c72835fa.js","assets/BlockTitle.d14e8b91.js"]:void 0),
  file: () => __vitePreload(() => import('./index.b010f6a0.js'),true?["assets/index.b010f6a0.js","assets/BlockLabel.31f372c5.js","assets/styles.c72835fa.js","assets/File.a55e6678.js","assets/Upload.2f4650bf.js","assets/ModifyUpload.7ca2bf88.js","assets/Block.1a05a0a3.js","assets/utils.27234e1d.js"]:void 0),
  form: () => __vitePreload(() => import('./index.63bd03bf.js'),true?[]:void 0),
  gallery: () => __vitePreload(() => import('./index.8a62f989.js'),true?["assets/index.8a62f989.js","assets/index.7f113d6d.css","assets/Block.1a05a0a3.js","assets/styles.c72835fa.js","assets/BlockLabel.31f372c5.js","assets/ModifyUpload.7ca2bf88.js","assets/Image.ff74e38b.js"]:void 0),
  group: () => __vitePreload(() => import('./index.af798c89.js'),true?["assets/index.af798c89.js","assets/index.5eeac5d1.css"]:void 0),
  highlightedtext: () => __vitePreload(() => import('./index.53b520e6.js'),true?["assets/index.53b520e6.js","assets/index.b93ecfae.css","assets/color.28cd1c22.js","assets/Block.1a05a0a3.js","assets/styles.c72835fa.js","assets/BlockLabel.31f372c5.js"]:void 0),
  html: () => __vitePreload(() => import('./index.2b6de6cd.js'),true?[]:void 0),
  image: () => __vitePreload(() => import('./index.83b3e626.js'),true?["assets/index.83b3e626.js","assets/BlockLabel.31f372c5.js","assets/styles.c72835fa.js","assets/Image.ff74e38b.js","assets/Webcam.adb6fb2a.js","assets/ModifyUpload.7ca2bf88.js","assets/Upload.2f4650bf.js","assets/Block.1a05a0a3.js","assets/Image.81bf6864.js"]:void 0),
  interpretation: () => __vitePreload(() => import('./index.cbbf2839.js'),true?["assets/index.cbbf2839.js","assets/index.2866e474.css","assets/BlockTitle.d14e8b91.js"]:void 0),
  json: () => __vitePreload(() => import('./index.45a2e262.js'),true?["assets/index.45a2e262.js","assets/Block.1a05a0a3.js","assets/styles.c72835fa.js","assets/BlockLabel.31f372c5.js"]:void 0),
  label: () => __vitePreload(() => import('./index.12cb3bf8.js'),true?["assets/index.12cb3bf8.js","assets/Block.1a05a0a3.js","assets/styles.c72835fa.js","assets/BlockLabel.31f372c5.js"]:void 0),
  markdown: () => __vitePreload(() => import('./index.363ad7a7.js'),true?["assets/index.363ad7a7.js","assets/index.19bb94ff.css"]:void 0),
  model3d: () => __vitePreload(() => import('./index.14d790f7.js'),true?["assets/index.14d790f7.js","assets/Block.1a05a0a3.js","assets/styles.c72835fa.js","assets/utils.27234e1d.js","assets/BlockLabel.31f372c5.js","assets/File.a55e6678.js","assets/_commonjsHelpers.88e99c8f.js","assets/Upload.2f4650bf.js","assets/ModifyUpload.7ca2bf88.js","assets/Model3D.aa8e1b60.js"]:void 0),
  number: () => __vitePreload(() => import('./index.e6927860.js'),true?["assets/index.e6927860.js","assets/Block.1a05a0a3.js","assets/styles.c72835fa.js","assets/BlockTitle.d14e8b91.js"]:void 0),
  plot: () => __vitePreload(() => import('./index.80a55ccc.js'),true?["assets/index.80a55ccc.js","assets/_commonjsHelpers.88e99c8f.js","assets/Block.1a05a0a3.js","assets/styles.c72835fa.js","assets/BlockLabel.31f372c5.js"]:void 0),
  radio: () => __vitePreload(() => import('./index.ec0f5dde.js'),true?["assets/index.ec0f5dde.js","assets/Block.1a05a0a3.js","assets/styles.c72835fa.js","assets/BlockTitle.d14e8b91.js"]:void 0),
  row: () => __vitePreload(() => import('./index.cd5ea0ff.js'),true?["assets/index.cd5ea0ff.js","assets/styles.c72835fa.js"]:void 0),
  slider: () => __vitePreload(() => import('./index.8e698748.js'),true?["assets/index.8e698748.js","assets/Block.1a05a0a3.js","assets/styles.c72835fa.js","assets/BlockTitle.d14e8b91.js"]:void 0),
  state: () => __vitePreload(() => import('./index.5b6832ac.js'),true?[]:void 0),
  statustracker: () => __vitePreload(() => import('./index.fdf4506b.js'),true?[]:void 0),
  tabs: () => __vitePreload(() => import('./index.51a6779c.js'),true?["assets/index.51a6779c.js","assets/Tabs.2bafd99b.js","assets/Column.e0962208.js","assets/styles.c72835fa.js"]:void 0),
  tabitem: () => __vitePreload(() => import('./index.acfda8c0.js'),true?["assets/index.acfda8c0.js","assets/Tabs.2bafd99b.js","assets/Column.e0962208.js","assets/styles.c72835fa.js"]:void 0),
  textbox: () => __vitePreload(() => import('./index.496e0059.js'),true?["assets/index.496e0059.js","assets/Block.1a05a0a3.js","assets/styles.c72835fa.js","assets/BlockTitle.d14e8b91.js"]:void 0),
  timeseries: () => __vitePreload(() => import('./index.a526ada6.js'),true?["assets/index.a526ada6.js","assets/Upload.2f4650bf.js","assets/Block.1a05a0a3.js","assets/styles.c72835fa.js","assets/BlockLabel.31f372c5.js","assets/color.28cd1c22.js","assets/csv.27f5436c.js","assets/dsv.7fe76a93.js"]:void 0),
  video: () => __vitePreload(() => import('./index.ac773f03.js'),true?["assets/index.ac773f03.js","assets/index.fb73cc16.css","assets/Block.1a05a0a3.js","assets/styles.c72835fa.js","assets/utils.27234e1d.js","assets/Upload.2f4650bf.js","assets/ModifyUpload.7ca2bf88.js","assets/BlockLabel.31f372c5.js","assets/Webcam.adb6fb2a.js"]:void 0)
};

function create_loading_status_store() {
  const store = writable({});
  const fn_inputs = [];
  const fn_outputs = [];
  const pending_outputs = /* @__PURE__ */ new Map();
  const pending_inputs = /* @__PURE__ */ new Map();
  const inputs_to_update = /* @__PURE__ */ new Map();
  const fn_status = [];
  function update(fn_index, status, queue, size, position, eta, message) {
    const outputs = fn_outputs[fn_index];
    const inputs = fn_inputs[fn_index];
    const last_status = fn_status[fn_index];
    const outputs_to_update = outputs.map((id) => {
      let new_status;
      const pending_count = pending_outputs.get(id) || 0;
      if (last_status === "pending" && status !== "pending") {
        let new_count = pending_count - 1;
        pending_outputs.set(id, new_count < 0 ? 0 : new_count);
        new_status = new_count > 0 ? "pending" : status;
      } else if (last_status === "pending" && status === "pending") {
        new_status = "pending";
      } else if (last_status !== "pending" && status === "pending") {
        new_status = "pending";
        pending_outputs.set(id, pending_count + 1);
      } else {
        new_status = status;
      }
      return {
        id,
        queue_position: position,
        queue_size: size,
        eta,
        status: new_status,
        message
      };
    });
    inputs.map((id) => {
      const pending_count = pending_inputs.get(id) || 0;
      if (last_status === "pending" && status !== "pending") {
        let new_count = pending_count - 1;
        pending_inputs.set(id, new_count < 0 ? 0 : new_count);
        inputs_to_update.set(id, status);
      } else if (last_status !== "pending" && status === "pending") {
        pending_inputs.set(id, pending_count + 1);
        inputs_to_update.set(id, status);
      } else {
        inputs_to_update.delete(id);
      }
    });
    store.update((outputs2) => {
      outputs_to_update.forEach(({ id, queue_position, queue_size, eta: eta2, status: status2, message: message2 }) => {
        outputs2[id] = {
          queue,
          queue_size,
          queue_position,
          eta: eta2,
          message: message2,
          status: status2,
          fn_index
        };
      });
      return outputs2;
    });
    fn_status[fn_index] = status;
  }
  function register(index, inputs, outputs) {
    fn_inputs[index] = inputs;
    fn_outputs[index] = outputs;
  }
  return {
    update,
    register,
    subscribe: store.subscribe,
    get_status_for_fn(i) {
      return fn_status[i];
    },
    get_inputs_to_update() {
      return inputs_to_update;
    }
  };
}
const app_state = writable({ autoscroll: false });

const Submit$k = "أرسل";
const Clear$k = "أمسح";
const Interpret$k = "فسِّر";
const Flag$k = "بلِّغ";
const Examples$k = "أمثلة";
const or$k = "أو";
var ar = {
	"interface": {
	drop_image: "أسقط الصورة هنا",
	drop_video: "أسقط الفيديو هنا",
	drop_audio: "أسقط الملف الصوتي هنا",
	drop_file: "أسقط الملف هنا",
	drop_csv: "أسقط ملف البيانات هنا",
	click_to_upload: "إضغط للتحميل",
	view_api: "إستخدم واجهة البرمجة",
	built_with_Gradio: "تم الإنشاء بإستخدام Gradio"
},
	Submit: Submit$k,
	Clear: Clear$k,
	Interpret: Interpret$k,
	Flag: Flag$k,
	Examples: Examples$k,
	or: or$k
};

var __glob_1_0 = /*#__PURE__*/Object.freeze({
    __proto__: null,
    [Symbol.toStringTag]: 'Module',
    Submit: Submit$k,
    Clear: Clear$k,
    Interpret: Interpret$k,
    Flag: Flag$k,
    Examples: Examples$k,
    or: or$k,
    'default': ar
});

const Submit$j = "Absenden";
const Clear$j = "Löschen";
const Interpret$j = "Ersteller";
const Flag$j = "Flag";
const Examples$j = "Beispiele";
const or$j = "oder";
var de = {
	"interface": {
	drop_image: "Bild hier ablegen",
	drop_video: "Video hier ablegen",
	drop_audio: "Audio hier ablegen",
	drop_file: "Datei hier ablegen",
	drop_csv: "CSV Datei hier ablegen",
	click_to_upload: "Hochladen",
	view_api: "API anschauen",
	built_with_Gradio: "Mit Gradio erstellt"
},
	Submit: Submit$j,
	Clear: Clear$j,
	Interpret: Interpret$j,
	Flag: Flag$j,
	Examples: Examples$j,
	or: or$j
};

var __glob_1_1 = /*#__PURE__*/Object.freeze({
    __proto__: null,
    [Symbol.toStringTag]: 'Module',
    Submit: Submit$j,
    Clear: Clear$j,
    Interpret: Interpret$j,
    Flag: Flag$j,
    Examples: Examples$j,
    or: or$j,
    'default': de
});

const Submit$i = "Submit";
const Clear$i = "Clear";
const Interpret$i = "Interpret";
const Flag$i = "Flag";
const Examples$i = "Examples";
const or$i = "or";
var en = {
	"interface": {
	drop_image: "Drop Image Here",
	drop_video: "Drop Video Here",
	drop_audio: "Drop Audio Here",
	drop_file: "Drop File Here",
	drop_csv: "Drop CSV Here",
	click_to_upload: "Click to Upload",
	view_api: "view the api",
	built_with_Gradio: "built with gradio",
	copy_to_clipboard: "copy to clipboard",
	loading: "Loading",
	error: "ERROR",
	empty: "Empty"
},
	Submit: Submit$i,
	Clear: Clear$i,
	Interpret: Interpret$i,
	Flag: Flag$i,
	Examples: Examples$i,
	or: or$i
};

var __glob_1_2 = /*#__PURE__*/Object.freeze({
    __proto__: null,
    [Symbol.toStringTag]: 'Module',
    Submit: Submit$i,
    Clear: Clear$i,
    Interpret: Interpret$i,
    Flag: Flag$i,
    Examples: Examples$i,
    or: or$i,
    'default': en
});

const Submit$h = "Enviar";
const Clear$h = "Limpiar";
const Interpret$h = "Interpretar";
const Flag$h = "Avisar";
const Examples$h = "Ejemplos";
const or$h = "o";
var es = {
	"interface": {
	drop_image: "Coloque la imagen aquí",
	drop_video: "Coloque el video aquí",
	drop_audio: "Coloque el audio aquí",
	drop_file: "Coloque el archivo aquí",
	drop_csv: "Coloque el CSV aquí",
	click_to_upload: "Haga click para cargar",
	view_api: "Ver la API",
	built_with_Gradio: "Construido con Gradio"
},
	Submit: Submit$h,
	Clear: Clear$h,
	Interpret: Interpret$h,
	Flag: Flag$h,
	Examples: Examples$h,
	or: or$h
};

var __glob_1_3 = /*#__PURE__*/Object.freeze({
    __proto__: null,
    [Symbol.toStringTag]: 'Module',
    Submit: Submit$h,
    Clear: Clear$h,
    Interpret: Interpret$h,
    Flag: Flag$h,
    Examples: Examples$h,
    or: or$h,
    'default': es
});

const Submit$g = "ارسال";
const Clear$g = "حذف";
const Interpret$g = "تفسیر";
const Flag$g = "پرچم";
const Examples$g = "مثال ها";
const or$g = "یا";
var fa = {
	"interface": {
	drop_image: "تصویر را اینجا رها کنید",
	drop_video: "ویدیو را اینجا رها کنید",
	drop_audio: "صوت را اینجا رها کنید",
	drop_file: "فایل را اینجا رها کنید",
	drop_csv: "فایل csv را  اینجا رها کنید",
	click_to_upload: "برای آپلود کلیک کنید",
	view_api: "api را مشاهده کنید",
	built_with_Gradio: "ساخته شده با gradio"
},
	Submit: Submit$g,
	Clear: Clear$g,
	Interpret: Interpret$g,
	Flag: Flag$g,
	Examples: Examples$g,
	or: or$g
};

var __glob_1_4 = /*#__PURE__*/Object.freeze({
    __proto__: null,
    [Symbol.toStringTag]: 'Module',
    Submit: Submit$g,
    Clear: Clear$g,
    Interpret: Interpret$g,
    Flag: Flag$g,
    Examples: Examples$g,
    or: or$g,
    'default': fa
});

const Submit$f = "Soumettre";
const Clear$f = "Nettoyer";
const Interpret$f = "Interpréter";
const Flag$f = "Signaler";
const Examples$f = "Exemples";
const or$f = "ou";
var fr = {
	"interface": {
	drop_image: "Déposer l'Image Ici",
	drop_video: "Déposer la Vidéo Ici",
	drop_audio: "Déposer l'Audio Ici",
	drop_file: "Déposer le Fichier Ici",
	drop_csv: "Déposer le CSV Ici",
	click_to_upload: "Cliquer pour Télécharger",
	view_api: "Voir l'API",
	built_with_Gradio: "Conçu avec Gradio"
},
	Submit: Submit$f,
	Clear: Clear$f,
	Interpret: Interpret$f,
	Flag: Flag$f,
	Examples: Examples$f,
	or: or$f
};

var __glob_1_5 = /*#__PURE__*/Object.freeze({
    __proto__: null,
    [Symbol.toStringTag]: 'Module',
    Submit: Submit$f,
    Clear: Clear$f,
    Interpret: Interpret$f,
    Flag: Flag$f,
    Examples: Examples$f,
    or: or$f,
    'default': fr
});

const Submit$e = "שלח";
const Clear$e = "נקה";
const Interpret$e = "לפרש";
const Flag$e = "סמן";
const Examples$e = "דוגמות";
const or$e = "או";
var he = {
	"interface": {
	drop_image: "גרור קובץ תמונה לכאן",
	drop_video: "גרור קובץ סרטון לכאן",
	drop_audio: "גרור לכאן קובץ שמע",
	drop_file: "גרור קובץ לכאן",
	drop_csv: "גרור csv קובץ לכאן",
	click_to_upload: "לחץ כדי להעלות",
	view_api: "צפה ב API",
	built_with_Gradio: "בנוי עם גרדיו"
},
	Submit: Submit$e,
	Clear: Clear$e,
	Interpret: Interpret$e,
	Flag: Flag$e,
	Examples: Examples$e,
	or: or$e
};

var __glob_1_6 = /*#__PURE__*/Object.freeze({
    __proto__: null,
    [Symbol.toStringTag]: 'Module',
    Submit: Submit$e,
    Clear: Clear$e,
    Interpret: Interpret$e,
    Flag: Flag$e,
    Examples: Examples$e,
    or: or$e,
    'default': he
});

const Submit$d = "सबमिट करे";
const Clear$d = "हटाये";
const Interpret$d = "व्याख्या करे";
const Flag$d = "चिह्नित करे";
const Examples$d = "उदाहरण";
const or$d = "या";
var hi = {
	"interface": {
	drop_image: "यहाँ इमेज ड्रॉप करें",
	drop_video: "यहाँ वीडियो ड्रॉप करें",
	drop_audio: "यहाँ ऑडियो ड्रॉप करें",
	drop_file: "यहाँ File ड्रॉप करें",
	drop_csv: "यहाँ CSV ड्रॉप करें",
	click_to_upload: "अपलोड के लिए बटन दबायें",
	view_api: "API को देखे",
	built_with_Gradio: "Gradio से बना"
},
	Submit: Submit$d,
	Clear: Clear$d,
	Interpret: Interpret$d,
	Flag: Flag$d,
	Examples: Examples$d,
	or: or$d
};

var __glob_1_7 = /*#__PURE__*/Object.freeze({
    __proto__: null,
    [Symbol.toStringTag]: 'Module',
    Submit: Submit$d,
    Clear: Clear$d,
    Interpret: Interpret$d,
    Flag: Flag$d,
    Examples: Examples$d,
    or: or$d,
    'default': hi
});

const Submit$c = "送信";
const Clear$c = "クリア";
const Interpret$c = "解釈";
const Flag$c = "フラグする";
const Examples$c = "入力例";
const or$c = "または";
var ja = {
	"interface": {
	drop_image: "ここに画像をドロップ",
	drop_video: "ここに動画をドロップ",
	drop_audio: "ここに音声をドロップ",
	drop_file: "ここにファイルをドロップ",
	drop_csv: "ここにCSVをドロップ",
	click_to_upload: "クリックしてアップロード",
	view_api: "APIを見る",
	built_with_Gradio: "gradioで作ろう"
},
	Submit: Submit$c,
	Clear: Clear$c,
	Interpret: Interpret$c,
	Flag: Flag$c,
	Examples: Examples$c,
	or: or$c
};

var __glob_1_8 = /*#__PURE__*/Object.freeze({
    __proto__: null,
    [Symbol.toStringTag]: 'Module',
    Submit: Submit$c,
    Clear: Clear$c,
    Interpret: Interpret$c,
    Flag: Flag$c,
    Examples: Examples$c,
    or: or$c,
    'default': ja
});

const Submit$b = "제출하기";
const Clear$b = "클리어";
const Interpret$b = "설명하기";
const Flag$b = "플래그";
const Examples$b = "예시";
const or$b = "또는";
var ko = {
	"interface": {
	drop_image: "이미지를 끌어 놓으세요",
	drop_video: "비디오를 끌어 놓으세요",
	drop_audio: "오디오를 끌어 놓으세요",
	drop_file: "파일을 끌어 놓으세요",
	drop_csv: "CSV파일을 끌어 놓으세요",
	click_to_upload: "클릭해서 업로드하기",
	view_api: "API 보기",
	built_with_Gradio: "gradio로 제작되었습니다"
},
	Submit: Submit$b,
	Clear: Clear$b,
	Interpret: Interpret$b,
	Flag: Flag$b,
	Examples: Examples$b,
	or: or$b
};

var __glob_1_9 = /*#__PURE__*/Object.freeze({
    __proto__: null,
    [Symbol.toStringTag]: 'Module',
    Submit: Submit$b,
    Clear: Clear$b,
    Interpret: Interpret$b,
    Flag: Flag$b,
    Examples: Examples$b,
    or: or$b,
    'default': ko
});

const Submit$a = "Pateikti";
const Clear$a = "Trinti";
const Interpret$a = "Interpretuoti";
const Flag$a = "Pažymėti";
const Examples$a = "Pavyzdžiai";
const or$a = "arba";
var lt = {
	"interface": {
	drop_image: "Įkelkite paveikslėlį čia",
	drop_video: "Įkelkite vaizdo įrašą čia",
	drop_audio: "Įkelkite garso įrašą čia",
	drop_file: "Įkelkite bylą čia",
	drop_csv: "Įkelkite CSV čia",
	click_to_upload: "Spustelėkite norėdami įkelti",
	view_api: "peržiūrėti api",
	built_with_Gradio: "sukurta su gradio"
},
	Submit: Submit$a,
	Clear: Clear$a,
	Interpret: Interpret$a,
	Flag: Flag$a,
	Examples: Examples$a,
	or: or$a
};

var __glob_1_10 = /*#__PURE__*/Object.freeze({
    __proto__: null,
    [Symbol.toStringTag]: 'Module',
    Submit: Submit$a,
    Clear: Clear$a,
    Interpret: Interpret$a,
    Flag: Flag$a,
    Examples: Examples$a,
    or: or$a,
    'default': lt
});

const Submit$9 = "Zend in";
const Clear$9 = "Wis";
const Interpret$9 = "Interpreteer";
const Flag$9 = "Vlag";
const Examples$9 = "Voorbeelden";
const or$9 = "of";
var nl = {
	"interface": {
	drop_image: "Sleep een Afbeelding hier",
	drop_video: "Sleep een Video hier",
	drop_audio: "Sleep een Geluidsbestand hier",
	drop_file: "Sleep een Document hier",
	drop_csv: "Sleep een CSV hier",
	click_to_upload: "Klik om the Uploaden",
	view_api: "zie de api",
	built_with_Gradio: "gemaakt met gradio"
},
	Submit: Submit$9,
	Clear: Clear$9,
	Interpret: Interpret$9,
	Flag: Flag$9,
	Examples: Examples$9,
	or: or$9
};

var __glob_1_11 = /*#__PURE__*/Object.freeze({
    __proto__: null,
    [Symbol.toStringTag]: 'Module',
    Submit: Submit$9,
    Clear: Clear$9,
    Interpret: Interpret$9,
    Flag: Flag$9,
    Examples: Examples$9,
    or: or$9,
    'default': nl
});

const Submit$8 = "Zatwierdź";
const Clear$8 = "Wyczyść";
const Interpret$8 = "Interpretuj";
const Flag$8 = "Oznacz";
const Examples$8 = "Przykłady";
const or$8 = "lub";
var pl = {
	"interface": {
	drop_image: "Przeciągnij tutaj zdjęcie",
	drop_video: "Przeciągnij tutaj video",
	drop_audio: "Przeciągnij tutaj audio",
	drop_file: "Przeciągnij tutaj plik",
	drop_csv: "Przeciągnij tutaj CSV",
	click_to_upload: "Kliknij, aby przesłać",
	view_api: "zobacz api",
	built_with_Gradio: "utworzone z gradio"
},
	Submit: Submit$8,
	Clear: Clear$8,
	Interpret: Interpret$8,
	Flag: Flag$8,
	Examples: Examples$8,
	or: or$8
};

var __glob_1_12 = /*#__PURE__*/Object.freeze({
    __proto__: null,
    [Symbol.toStringTag]: 'Module',
    Submit: Submit$8,
    Clear: Clear$8,
    Interpret: Interpret$8,
    Flag: Flag$8,
    Examples: Examples$8,
    or: or$8,
    'default': pl
});

const Submit$7 = "Исполнить";
const Clear$7 = "Очистить";
const Interpret$7 = "Интерпретировать";
const Flag$7 = "Пометить";
const Examples$7 = "Примеры";
const or$7 = "или";
var ru = {
	"interface": {
	drop_image: "Поместите Изображение Здесь",
	drop_video: "Поместите Видео Здесь",
	drop_audio: "Поместите Аудио Здесь",
	drop_file: "Поместите Документ Здесь",
	drop_csv: "Поместите CSV Здесь",
	click_to_upload: "Нажмите, чтобы загрузить",
	view_api: "просмотр api",
	built_with_Gradio: "сделано с помощью gradio"
},
	Submit: Submit$7,
	Clear: Clear$7,
	Interpret: Interpret$7,
	Flag: Flag$7,
	Examples: Examples$7,
	or: or$7
};

var __glob_1_13 = /*#__PURE__*/Object.freeze({
    __proto__: null,
    [Symbol.toStringTag]: 'Module',
    Submit: Submit$7,
    Clear: Clear$7,
    Interpret: Interpret$7,
    Flag: Flag$7,
    Examples: Examples$7,
    or: or$7,
    'default': ru
});

const Submit$6 = "சமர்ப்பி";
const Clear$6 = "அழி";
const Interpret$6 = "உட்பொருள்";
const Flag$6 = "கொடியிடு";
const Examples$6 = "எடுத்துக்காட்டுகள்";
const or$6 = "அல்லது";
var ta = {
	"interface": {
	drop_image: "படத்தை வை",
	drop_video: "வீடியோவை வை",
	drop_audio: "ஆடியோவை வை",
	drop_file: "கோப்பை வை",
	drop_csv: "சிஎஸ்வி வை",
	click_to_upload: "பதிவேற்ற கிளிக் செய்",
	view_api: "அபியை காண்",
	built_with_Gradio: "க்ரேடியோ-வுடன் கட்டப்பட்டது"
},
	Submit: Submit$6,
	Clear: Clear$6,
	Interpret: Interpret$6,
	Flag: Flag$6,
	Examples: Examples$6,
	or: or$6
};

var __glob_1_14 = /*#__PURE__*/Object.freeze({
    __proto__: null,
    [Symbol.toStringTag]: 'Module',
    Submit: Submit$6,
    Clear: Clear$6,
    Interpret: Interpret$6,
    Flag: Flag$6,
    Examples: Examples$6,
    or: or$6,
    'default': ta
});

const Submit$5 = "Yükle";
const Clear$5 = "Temizle";
const Interpret$5 = "Yorumla";
const Flag$5 = "Etiketle";
const Examples$5 = "örnekler";
const or$5 = "veya";
var tr = {
	"interface": {
	drop_image: "Resmi Buraya Sürükle",
	drop_video: "Videoyu Buraya Sürükle",
	drop_audio: "Kaydı Buraya Sürükle",
	drop_file: "Dosyayı Buraya Sürükle",
	drop_csv: "CSV'yi Buraya Sürükle",
	click_to_upload: "Yüklemek için Tıkla",
	view_api: "api'yi görüntüle",
	built_with_Gradio: "Gradio ile oluşturulmuştur"
},
	Submit: Submit$5,
	Clear: Clear$5,
	Interpret: Interpret$5,
	Flag: Flag$5,
	Examples: Examples$5,
	or: or$5
};

var __glob_1_15 = /*#__PURE__*/Object.freeze({
    __proto__: null,
    [Symbol.toStringTag]: 'Module',
    Submit: Submit$5,
    Clear: Clear$5,
    Interpret: Interpret$5,
    Flag: Flag$5,
    Examples: Examples$5,
    or: or$5,
    'default': tr
});

const Submit$4 = "Надіслати";
const Clear$4 = "Очистити";
const Interpret$4 = "Пояснити результат";
const Flag$4 = "Позначити";
const Examples$4 = "Приклади";
const or$4 = "або";
var uk = {
	"interface": {
	drop_image: "Перетягніть зображення сюди",
	drop_video: "Перетягніть відео сюди",
	drop_audio: "Перетягніть аудіо сюди",
	drop_file: "Перетягніть файл сюди",
	drop_csv: "Перетягніть CSV-файл сюди",
	click_to_upload: "Натисніть щоб завантажити",
	view_api: "Переглянути API",
	built_with_Gradio: "Зроблено на основі gradio"
},
	Submit: Submit$4,
	Clear: Clear$4,
	Interpret: Interpret$4,
	Flag: Flag$4,
	Examples: Examples$4,
	or: or$4
};

var __glob_1_16 = /*#__PURE__*/Object.freeze({
    __proto__: null,
    [Symbol.toStringTag]: 'Module',
    Submit: Submit$4,
    Clear: Clear$4,
    Interpret: Interpret$4,
    Flag: Flag$4,
    Examples: Examples$4,
    or: or$4,
    'default': uk
});

const Submit$3 = "جمع کریں";
const Clear$3 = "ہٹا دیں";
const Interpret$3 = "تشریح کریں";
const Flag$3 = "نشان لگائیں";
const Examples$3 = "مثالیں";
const or$3 = "یا";
var ur = {
	"interface": {
	drop_image: "یہاں تصویر ڈراپ کریں",
	drop_video: "یہاں ویڈیو ڈراپ کریں",
	drop_audio: "یہاں آڈیو ڈراپ کریں",
	drop_file: "یہاں فائل ڈراپ کریں",
	drop_csv: "یہاں فائل ڈراپ کریں",
	click_to_upload: "اپ لوڈ کے لیے کلک کریں",
	view_api: "API دیکھیں",
	built_with_Gradio: "کے ساتھ بنایا گیا Gradio"
},
	Submit: Submit$3,
	Clear: Clear$3,
	Interpret: Interpret$3,
	Flag: Flag$3,
	Examples: Examples$3,
	or: or$3
};

var __glob_1_17 = /*#__PURE__*/Object.freeze({
    __proto__: null,
    [Symbol.toStringTag]: 'Module',
    Submit: Submit$3,
    Clear: Clear$3,
    Interpret: Interpret$3,
    Flag: Flag$3,
    Examples: Examples$3,
    or: or$3,
    'default': ur
});

const Submit$2 = "Yubor";
const Clear$2 = "Tozalash";
const Interpret$2 = "Tushuntirish";
const Flag$2 = "Bayroq";
const Examples$2 = "Namunalar";
const or$2 = "或";
var uz = {
	"interface": {
	drop_image: "Rasmni Shu Yerga Tashlang",
	drop_video: "Videoni Shu Yerga Tashlang",
	drop_audio: "Audioni Shu Yerga Tashlang",
	drop_file: "Faylni Shu Yerga Tashlang",
	drop_csv: "CSVni Shu Yerga Tashlang",
	click_to_upload: "Yuklash uchun Bosing",
	view_api: "apini ko'ring",
	built_with_Gradio: "gradio bilan qilingan"
},
	Submit: Submit$2,
	Clear: Clear$2,
	Interpret: Interpret$2,
	Flag: Flag$2,
	Examples: Examples$2,
	or: or$2
};

var __glob_1_18 = /*#__PURE__*/Object.freeze({
    __proto__: null,
    [Symbol.toStringTag]: 'Module',
    Submit: Submit$2,
    Clear: Clear$2,
    Interpret: Interpret$2,
    Flag: Flag$2,
    Examples: Examples$2,
    or: or$2,
    'default': uz
});

const Submit$1 = "提交";
const Clear$1 = "清除";
const Interpret$1 = "解释";
const Flag$1 = "标记";
const Examples$1 = "示例";
const or$1 = "或";
var zhCn = {
	"interface": {
	drop_image: "拖放图片至此处",
	drop_video: "拖放视频至此处",
	drop_audio: "拖放音频至此处",
	drop_file: "拖放文件至此处",
	drop_csv: "拖放CSV至此处",
	click_to_upload: "点击上传",
	view_api: "查看API",
	built_with_Gradio: "使用Gradio构建"
},
	Submit: Submit$1,
	Clear: Clear$1,
	Interpret: Interpret$1,
	Flag: Flag$1,
	Examples: Examples$1,
	or: or$1
};

var __glob_1_19 = /*#__PURE__*/Object.freeze({
    __proto__: null,
    [Symbol.toStringTag]: 'Module',
    Submit: Submit$1,
    Clear: Clear$1,
    Interpret: Interpret$1,
    Flag: Flag$1,
    Examples: Examples$1,
    or: or$1,
    'default': zhCn
});

const Submit = "提交";
const Clear = "清除";
const Interpret = "解釋";
const Flag = "Flag";
const Examples = "範例";
const or = "或";
var zhTw = {
	"interface": {
	drop_image: "刪除圖片",
	drop_video: "刪除影片",
	drop_audio: "刪除音頻",
	drop_file: "刪除檔案",
	drop_csv: "刪除CSV",
	click_to_upload: "點擊上傳",
	view_api: "查看API",
	built_with_Gradio: "使用Gradio構建"
},
	Submit: Submit,
	Clear: Clear,
	Interpret: Interpret,
	Flag: Flag,
	Examples: Examples,
	or: or
};

var __glob_1_20 = /*#__PURE__*/Object.freeze({
    __proto__: null,
    [Symbol.toStringTag]: 'Module',
    Submit: Submit,
    Clear: Clear,
    Interpret: Interpret,
    Flag: Flag,
    Examples: Examples,
    or: or,
    'default': zhTw
});

const langs = { "./lang/ar.json": __glob_1_0, "./lang/de.json": __glob_1_1, "./lang/en.json": __glob_1_2, "./lang/es.json": __glob_1_3, "./lang/fa.json": __glob_1_4, "./lang/fr.json": __glob_1_5, "./lang/he.json": __glob_1_6, "./lang/hi.json": __glob_1_7, "./lang/ja.json": __glob_1_8, "./lang/ko.json": __glob_1_9, "./lang/lt.json": __glob_1_10, "./lang/nl.json": __glob_1_11, "./lang/pl.json": __glob_1_12, "./lang/ru.json": __glob_1_13, "./lang/ta.json": __glob_1_14, "./lang/tr.json": __glob_1_15, "./lang/uk.json": __glob_1_16, "./lang/ur.json": __glob_1_17, "./lang/uz.json": __glob_1_18, "./lang/zh-cn.json": __glob_1_19, "./lang/zh-tw.json": __glob_1_20,};
function process_langs() {
  let _langs = {};
  for (const lang in langs) {
    const code = lang.split("/").pop().split(".").shift();
    _langs[code] = langs[lang].default;
  }
  return _langs;
}
const processed_langs = process_langs();
for (const lang in processed_langs) {
  m(lang, processed_langs[lang]);
}
function setupi18n() {
  $({
    fallbackLocale: "en",
    initialLocale: I()
  });
}

/* src/Render.svelte generated by Svelte v3.49.0 */

function get_each_context$1(ctx, list, i) {
	const child_ctx = ctx.slice();
	child_ctx[6] = list[i].component;
	child_ctx[15] = list[i].id;
	child_ctx[2] = list[i].props;
	child_ctx[16] = list[i].children;
	child_ctx[7] = list[i].has_modes;
	return child_ctx;
}

// (50:1) {#if children && children.length}
function create_if_block$4(ctx) {
	let each_blocks = [];
	let each_1_lookup = new Map();
	let each_1_anchor;
	let current;
	let each_value = /*children*/ ctx[1];
	const get_key = ctx => /*each_id*/ ctx[15];

	for (let i = 0; i < each_value.length; i += 1) {
		let child_ctx = get_each_context$1(ctx, each_value, i);
		let key = get_key(child_ctx);
		each_1_lookup.set(key, each_blocks[i] = create_each_block$1(key, child_ctx));
	}

	return {
		c() {
			for (let i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].c();
			}

			each_1_anchor = empty();
		},
		m(target, anchor) {
			for (let i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].m(target, anchor);
			}

			insert(target, each_1_anchor, anchor);
			current = true;
		},
		p(ctx, dirty) {
			if (dirty & /*children, root, instance_map, dynamic_ids*/ 43) {
				each_value = /*children*/ ctx[1];
				group_outros();
				each_blocks = update_keyed_each(each_blocks, dirty, get_key, 1, ctx, each_value, each_1_lookup, each_1_anchor.parentNode, outro_and_destroy_block, create_each_block$1, each_1_anchor, get_each_context$1);
				check_outros();
			}
		},
		i(local) {
			if (current) return;

			for (let i = 0; i < each_value.length; i += 1) {
				transition_in(each_blocks[i]);
			}

			current = true;
		},
		o(local) {
			for (let i = 0; i < each_blocks.length; i += 1) {
				transition_out(each_blocks[i]);
			}

			current = false;
		},
		d(detaching) {
			for (let i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].d(detaching);
			}

			if (detaching) detach(each_1_anchor);
		}
	};
}

// (51:2) {#each children as { component, id: each_id, props, children: _children, has_modes }
function create_each_block$1(key_1, ctx) {
	let first;
	let render;
	let current;

	render = new Render({
			props: {
				component: /*component*/ ctx[6],
				id: /*each_id*/ ctx[15],
				props: /*props*/ ctx[2],
				root: /*root*/ ctx[3],
				instance_map: /*instance_map*/ ctx[0],
				children: /*_children*/ ctx[16],
				dynamic_ids: /*dynamic_ids*/ ctx[5],
				has_modes: /*has_modes*/ ctx[7]
			}
		});

	render.$on("destroy", /*destroy_handler*/ ctx[10]);
	render.$on("mount", /*mount_handler*/ ctx[11]);

	return {
		key: key_1,
		first: null,
		c() {
			first = empty();
			create_component(render.$$.fragment);
			this.first = first;
		},
		m(target, anchor) {
			insert(target, first, anchor);
			mount_component(render, target, anchor);
			current = true;
		},
		p(new_ctx, dirty) {
			ctx = new_ctx;
			const render_changes = {};
			if (dirty & /*children*/ 2) render_changes.component = /*component*/ ctx[6];
			if (dirty & /*children*/ 2) render_changes.id = /*each_id*/ ctx[15];
			if (dirty & /*children*/ 2) render_changes.props = /*props*/ ctx[2];
			if (dirty & /*root*/ 8) render_changes.root = /*root*/ ctx[3];
			if (dirty & /*instance_map*/ 1) render_changes.instance_map = /*instance_map*/ ctx[0];
			if (dirty & /*children*/ 2) render_changes.children = /*_children*/ ctx[16];
			if (dirty & /*dynamic_ids*/ 32) render_changes.dynamic_ids = /*dynamic_ids*/ ctx[5];
			if (dirty & /*children*/ 2) render_changes.has_modes = /*has_modes*/ ctx[7];
			render.$set(render_changes);
		},
		i(local) {
			if (current) return;
			transition_in(render.$$.fragment, local);
			current = true;
		},
		o(local) {
			transition_out(render.$$.fragment, local);
			current = false;
		},
		d(detaching) {
			if (detaching) detach(first);
			destroy_component(render, detaching);
		}
	};
}

// (41:0) <svelte:component  this={component}  bind:this={instance_map[id].instance}  bind:value={instance_map[id].props.value}  elem_id={("elem_id" in props && props.elem_id) || `component-${id}`}  on:prop_change={handle_prop_change}  {...props}  {root} >
function create_default_slot(ctx) {
	let if_block_anchor;
	let current;
	let if_block = /*children*/ ctx[1] && /*children*/ ctx[1].length && create_if_block$4(ctx);

	return {
		c() {
			if (if_block) if_block.c();
			if_block_anchor = empty();
		},
		m(target, anchor) {
			if (if_block) if_block.m(target, anchor);
			insert(target, if_block_anchor, anchor);
			current = true;
		},
		p(ctx, dirty) {
			if (/*children*/ ctx[1] && /*children*/ ctx[1].length) {
				if (if_block) {
					if_block.p(ctx, dirty);

					if (dirty & /*children*/ 2) {
						transition_in(if_block, 1);
					}
				} else {
					if_block = create_if_block$4(ctx);
					if_block.c();
					transition_in(if_block, 1);
					if_block.m(if_block_anchor.parentNode, if_block_anchor);
				}
			} else if (if_block) {
				group_outros();

				transition_out(if_block, 1, 1, () => {
					if_block = null;
				});

				check_outros();
			}
		},
		i(local) {
			if (current) return;
			transition_in(if_block);
			current = true;
		},
		o(local) {
			transition_out(if_block);
			current = false;
		},
		d(detaching) {
			if (if_block) if_block.d(detaching);
			if (detaching) detach(if_block_anchor);
		}
	};
}

function create_fragment$5(ctx) {
	let switch_instance;
	let updating_value;
	let switch_instance_anchor;
	let current;

	const switch_instance_spread_levels = [
		{
			elem_id: "elem_id" in /*props*/ ctx[2] && /*props*/ ctx[2].elem_id || `component-${/*id*/ ctx[4]}`
		},
		/*props*/ ctx[2],
		{ root: /*root*/ ctx[3] }
	];

	function switch_instance_value_binding(value) {
		/*switch_instance_value_binding*/ ctx[13](value);
	}

	var switch_value = /*component*/ ctx[6];

	function switch_props(ctx) {
		let switch_instance_props = {
			$$slots: { default: [create_default_slot] },
			$$scope: { ctx }
		};

		for (let i = 0; i < switch_instance_spread_levels.length; i += 1) {
			switch_instance_props = assign(switch_instance_props, switch_instance_spread_levels[i]);
		}

		if (/*instance_map*/ ctx[0][/*id*/ ctx[4]].props.value !== void 0) {
			switch_instance_props.value = /*instance_map*/ ctx[0][/*id*/ ctx[4]].props.value;
		}

		return { props: switch_instance_props };
	}

	if (switch_value) {
		switch_instance = new switch_value(switch_props(ctx));
		/*switch_instance_binding*/ ctx[12](switch_instance);
		binding_callbacks.push(() => bind(switch_instance, 'value', switch_instance_value_binding));
		switch_instance.$on("prop_change", /*handle_prop_change*/ ctx[8]);
	}

	return {
		c() {
			if (switch_instance) create_component(switch_instance.$$.fragment);
			switch_instance_anchor = empty();
		},
		m(target, anchor) {
			if (switch_instance) {
				mount_component(switch_instance, target, anchor);
			}

			insert(target, switch_instance_anchor, anchor);
			current = true;
		},
		p(ctx, [dirty]) {
			const switch_instance_changes = (dirty & /*props, id, root*/ 28)
			? get_spread_update(switch_instance_spread_levels, [
					dirty & /*props, id*/ 20 && {
						elem_id: "elem_id" in /*props*/ ctx[2] && /*props*/ ctx[2].elem_id || `component-${/*id*/ ctx[4]}`
					},
					dirty & /*props*/ 4 && get_spread_object(/*props*/ ctx[2]),
					dirty & /*root*/ 8 && { root: /*root*/ ctx[3] }
				])
			: {};

			if (dirty & /*$$scope, children, root, instance_map, dynamic_ids*/ 524331) {
				switch_instance_changes.$$scope = { dirty, ctx };
			}

			if (!updating_value && dirty & /*instance_map, id*/ 17) {
				updating_value = true;
				switch_instance_changes.value = /*instance_map*/ ctx[0][/*id*/ ctx[4]].props.value;
				add_flush_callback(() => updating_value = false);
			}

			if (switch_value !== (switch_value = /*component*/ ctx[6])) {
				if (switch_instance) {
					group_outros();
					const old_component = switch_instance;

					transition_out(old_component.$$.fragment, 1, 0, () => {
						destroy_component(old_component, 1);
					});

					check_outros();
				}

				if (switch_value) {
					switch_instance = new switch_value(switch_props(ctx));
					/*switch_instance_binding*/ ctx[12](switch_instance);
					binding_callbacks.push(() => bind(switch_instance, 'value', switch_instance_value_binding));
					switch_instance.$on("prop_change", /*handle_prop_change*/ ctx[8]);
					create_component(switch_instance.$$.fragment);
					transition_in(switch_instance.$$.fragment, 1);
					mount_component(switch_instance, switch_instance_anchor.parentNode, switch_instance_anchor);
				} else {
					switch_instance = null;
				}
			} else if (switch_value) {
				switch_instance.$set(switch_instance_changes);
			}
		},
		i(local) {
			if (current) return;
			if (switch_instance) transition_in(switch_instance.$$.fragment, local);
			current = true;
		},
		o(local) {
			if (switch_instance) transition_out(switch_instance.$$.fragment, local);
			current = false;
		},
		d(detaching) {
			/*switch_instance_binding*/ ctx[12](null);
			if (detaching) detach(switch_instance_anchor);
			if (switch_instance) destroy_component(switch_instance, detaching);
		}
	};
}

function instance$5($$self, $$props, $$invalidate) {
	let { root } = $$props;
	let { component } = $$props;
	let { instance_map } = $$props;
	let { id } = $$props;
	let { props } = $$props;
	let { children } = $$props;
	let { dynamic_ids } = $$props;
	let { has_modes } = $$props;
	let { parent = null } = $$props;
	const dispatch = createEventDispatcher();

	if (has_modes) {
		if (props.interactive === false) {
			props.mode = "static";
		} else if (props.interactive === true) {
			props.mode = "dynamic";
		} else if (dynamic_ids.has(id)) {
			props.mode = "dynamic";
		} else {
			props.mode = "static";
		}
	}

	onMount(() => {
		dispatch("mount", id);
		return () => dispatch("destroy", id);
	});

	setContext("BLOCK_KEY", parent);

	function handle_prop_change(e) {
		for (const k in e.detail) {
			$$invalidate(0, instance_map[id].props[k] = e.detail[k], instance_map);
		}
	}

	function destroy_handler(event) {
		bubble.call(this, $$self, event);
	}

	function mount_handler(event) {
		bubble.call(this, $$self, event);
	}

	function switch_instance_binding($$value) {
		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
			instance_map[id].instance = $$value;
			$$invalidate(0, instance_map);
		});
	}

	function switch_instance_value_binding(value) {
		if ($$self.$$.not_equal(instance_map[id].props.value, value)) {
			instance_map[id].props.value = value;
			$$invalidate(0, instance_map);
		}
	}

	$$self.$$set = $$props => {
		if ('root' in $$props) $$invalidate(3, root = $$props.root);
		if ('component' in $$props) $$invalidate(6, component = $$props.component);
		if ('instance_map' in $$props) $$invalidate(0, instance_map = $$props.instance_map);
		if ('id' in $$props) $$invalidate(4, id = $$props.id);
		if ('props' in $$props) $$invalidate(2, props = $$props.props);
		if ('children' in $$props) $$invalidate(1, children = $$props.children);
		if ('dynamic_ids' in $$props) $$invalidate(5, dynamic_ids = $$props.dynamic_ids);
		if ('has_modes' in $$props) $$invalidate(7, has_modes = $$props.has_modes);
		if ('parent' in $$props) $$invalidate(9, parent = $$props.parent);
	};

	$$self.$$.update = () => {
		if ($$self.$$.dirty & /*children, instance_map*/ 3) {
			$$invalidate(1, children = children && children.filter(v => instance_map[v.id].type !== "statustracker"));
		}
	};

	return [
		instance_map,
		children,
		props,
		root,
		id,
		dynamic_ids,
		component,
		has_modes,
		handle_prop_change,
		parent,
		destroy_handler,
		mount_handler,
		switch_instance_binding,
		switch_instance_value_binding
	];
}

class Render extends SvelteComponent {
	constructor(options) {
		super();

		init(this, options, instance$5, create_fragment$5, safe_not_equal, {
			root: 3,
			component: 6,
			instance_map: 0,
			id: 4,
			props: 2,
			children: 1,
			dynamic_ids: 5,
			has_modes: 7,
			parent: 9
		});
	}
}

/* src/ApiDocs.svelte generated by Svelte v3.49.0 */

function get_each_context(ctx, list, i) {
	const child_ctx = ctx.slice();
	child_ctx[9] = list[i];
	child_ctx[11] = i;
	return child_ctx;
}

function get_each_context_1(ctx, list, i) {
	const child_ctx = ctx.slice();
	child_ctx[12] = list[i];
	child_ctx[14] = i;
	return child_ctx;
}

function get_each_context_2(ctx, list, i) {
	const child_ctx = ctx.slice();
	child_ctx[12] = list[i];
	child_ctx[14] = i;
	return child_ctx;
}

// (111:1) {:else}
function create_else_block_1(ctx) {
	let h2;
	let t0;
	let span0;
	let t1;
	let t2;
	let div;

	return {
		c() {
			h2 = element("h2");
			t0 = text("There are no named API Routes for\n\t\t\t");
			span0 = element("span");
			t1 = text(/*root*/ ctx[0]);
			t2 = space();
			div = element("div");

			div.innerHTML = `To expose an API endpoint of your app in these API docs, set the <span class="italic text-amber-500">api_name</span>
			parameter of the event listener. For more information, see the &quot;API Page&quot;
			<a href="https://gradio.app/sharing_your_app/#api-page" class="text-amber-500">section</a>
			in the guides. To hide this API page, set
			<span class="italic text-amber-500">show_api=False</span>
			in the <span class="italic text-amber-500">Blocks.launch()</span> method.`;

			attr(span0, "class", "italic text-amber-500");
			attr(h2, "class", "text-3xl text-center mb-6");
		},
		m(target, anchor) {
			insert(target, h2, anchor);
			append(h2, t0);
			append(h2, span0);
			append(span0, t1);
			insert(target, t2, anchor);
			insert(target, div, anchor);
		},
		p(ctx, dirty) {
			if (dirty & /*root*/ 1) set_data(t1, /*root*/ ctx[0]);
		},
		d(detaching) {
			if (detaching) detach(h2);
			if (detaching) detach(t2);
			if (detaching) detach(div);
		}
	};
}

// (14:1) {#if dependencies.some((d) => "documentation" in d)}
function create_if_block$3(ctx) {
	let h2;
	let t0;
	let span;
	let t1;
	let t2;
	let div;
	let each_value = /*dependencies*/ ctx[2];
	let each_blocks = [];

	for (let i = 0; i < each_value.length; i += 1) {
		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
	}

	return {
		c() {
			h2 = element("h2");
			t0 = text("API Docs for\n\t\t\t");
			span = element("span");
			t1 = text(/*root*/ ctx[0]);
			t2 = space();
			div = element("div");

			for (let i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].c();
			}

			attr(span, "class", "italic text-amber-500");
			attr(h2, "class", "text-3xl text-center mb-6");
			attr(div, "class", "flex flex-col gap-6");
		},
		m(target, anchor) {
			insert(target, h2, anchor);
			append(h2, t0);
			append(h2, span);
			append(span, t1);
			insert(target, t2, anchor);
			insert(target, div, anchor);

			for (let i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].m(div, null);
			}
		},
		p(ctx, dirty) {
			if (dirty & /*root*/ 1) set_data(t1, /*root*/ ctx[0]);

			if (dirty & /*dependencies, components, navigator, root, just_copied, setTimeout*/ 15) {
				each_value = /*dependencies*/ ctx[2];
				let i;

				for (i = 0; i < each_value.length; i += 1) {
					const child_ctx = get_each_context(ctx, each_value, i);

					if (each_blocks[i]) {
						each_blocks[i].p(child_ctx, dirty);
					} else {
						each_blocks[i] = create_each_block(child_ctx);
						each_blocks[i].c();
						each_blocks[i].m(div, null);
					}
				}

				for (; i < each_blocks.length; i += 1) {
					each_blocks[i].d(1);
				}

				each_blocks.length = each_value.length;
			}
		},
		d(detaching) {
			if (detaching) detach(h2);
			if (detaching) detach(t2);
			if (detaching) detach(div);
			destroy_each(each_blocks, detaching);
		}
	};
}

// (23:4) {#if dependency.documentation}
function create_if_block_1$2(ctx) {
	let div3;
	let h3;
	let t0;
	let t1_value = /*dependency*/ ctx[9].api_name + "";
	let t1;
	let t2;
	let div0;
	let t3;
	let span0;
	let t4;
	let t5;
	let t6_value = /*dependency*/ ctx[9].api_name + "";
	let t6;
	let t7;
	let button;
	let t8;
	let h40;
	let t10;
	let div1;
	let t11;
	let br0;
	let t12;
	let br1;
	let t13;
	let t14;
	let br2;
	let t15;
	let t16;
	let h41;
	let t18;
	let div2;
	let t19;
	let br3;
	let t20;
	let br4;
	let t21;
	let t22;
	let br5;
	let t23;
	let span1;
	let br6;
	let t25;
	let t26;
	let mounted;
	let dispose;

	function select_block_type_1(ctx, dirty) {
		if (/*just_copied*/ ctx[3] === /*d*/ ctx[11]) return create_if_block_2$2;
		return create_else_block$1;
	}

	let current_block_type = select_block_type_1(ctx);
	let if_block = current_block_type(ctx);

	function click_handler() {
		return /*click_handler*/ ctx[4](/*dependency*/ ctx[9], /*d*/ ctx[11]);
	}

	let each_value_2 = /*dependency*/ ctx[9].documentation[0];
	let each_blocks_1 = [];

	for (let i = 0; i < each_value_2.length; i += 1) {
		each_blocks_1[i] = create_each_block_2(get_each_context_2(ctx, each_value_2, i));
	}

	let each_value_1 = /*dependency*/ ctx[9].documentation[1];
	let each_blocks = [];

	for (let i = 0; i < each_value_1.length; i += 1) {
		each_blocks[i] = create_each_block_1(get_each_context_1(ctx, each_value_1, i));
	}

	return {
		c() {
			div3 = element("div");
			h3 = element("h3");
			t0 = text("POST /api/");
			t1 = text(t1_value);
			t2 = space();
			div0 = element("div");
			t3 = text("Full URL: ");
			span0 = element("span");
			t4 = text(/*root*/ ctx[0]);
			t5 = text("api/");
			t6 = text(t6_value);
			t7 = space();
			button = element("button");
			if_block.c();
			t8 = space();
			h40 = element("h4");
			h40.textContent = "Input Payload";
			t10 = space();
			div1 = element("div");
			t11 = text("{");
			br0 = element("br");
			t12 = text("\n\t\t\t\t\t\t\t  \"data\": [");
			br1 = element("br");
			t13 = space();

			for (let i = 0; i < each_blocks_1.length; i += 1) {
				each_blocks_1[i].c();
			}

			t14 = text("\n\t\t\t\t\t\t\t  ]");
			br2 = element("br");
			t15 = text("\n\t\t\t\t\t\t\t}");
			t16 = space();
			h41 = element("h4");
			h41.textContent = "Response Object";
			t18 = space();
			div2 = element("div");
			t19 = text("{");
			br3 = element("br");
			t20 = text("\n\t\t\t\t\t\t\t  \"data\": [");
			br4 = element("br");
			t21 = space();

			for (let i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].c();
			}

			t22 = text("\n\t\t\t\t\t\t\t  ],");
			br5 = element("br");
			t23 = text("\n\t\t\t\t\t\t\t  \"duration\": (float)\n\t\t\t\t\t\t\t");
			span1 = element("span");
			span1.textContent = "// number of seconds to run function call";
			br6 = element("br");
			t25 = text("\n\t\t\t\t\t\t\t}");
			t26 = space();
			attr(h3, "class", "text-3xl text-amber-500 font-semibold mb-2");
			attr(span0, "class", "underline");
			attr(button, "class", "ml-1 px-2 py-0.5 rounded bg-gray-200 dark:bg-gray-700");
			attr(div0, "class", "mb-6");
			attr(h40, "class", "text-2xl mt-6 mb-4");
			attr(div1, "class", "block mb-4 text-lg bg-gray-100 dark:bg-gray-700 p-4 font-mono");
			attr(h41, "class", "text-2xl mt-6 mb-4");
			attr(span1, "class", "text-pink-400 dark:text-pink-600");
			attr(div2, "class", "block mb-4 text-lg bg-gray-100 dark:bg-gray-700 p-4 font-mono");
			attr(div3, "class", "bg-gray-50 border border-gray-100 dark:bg-gray-800 dark:border-gray-700 p-6 rounded");
		},
		m(target, anchor) {
			insert(target, div3, anchor);
			append(div3, h3);
			append(h3, t0);
			append(h3, t1);
			append(div3, t2);
			append(div3, div0);
			append(div0, t3);
			append(div0, span0);
			append(span0, t4);
			append(span0, t5);
			append(span0, t6);
			append(div0, t7);
			append(div0, button);
			if_block.m(button, null);
			append(div3, t8);
			append(div3, h40);
			append(div3, t10);
			append(div3, div1);
			append(div1, t11);
			append(div1, br0);
			append(div1, t12);
			append(div1, br1);
			append(div1, t13);

			for (let i = 0; i < each_blocks_1.length; i += 1) {
				each_blocks_1[i].m(div1, null);
			}

			append(div1, t14);
			append(div1, br2);
			append(div1, t15);
			append(div3, t16);
			append(div3, h41);
			append(div3, t18);
			append(div3, div2);
			append(div2, t19);
			append(div2, br3);
			append(div2, t20);
			append(div2, br4);
			append(div2, t21);

			for (let i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].m(div2, null);
			}

			append(div2, t22);
			append(div2, br5);
			append(div2, t23);
			append(div2, span1);
			append(div2, br6);
			append(div2, t25);
			append(div3, t26);

			if (!mounted) {
				dispose = listen(button, "click", click_handler);
				mounted = true;
			}
		},
		p(new_ctx, dirty) {
			ctx = new_ctx;
			if (dirty & /*dependencies*/ 4 && t1_value !== (t1_value = /*dependency*/ ctx[9].api_name + "")) set_data(t1, t1_value);
			if (dirty & /*root*/ 1) set_data(t4, /*root*/ ctx[0]);
			if (dirty & /*dependencies*/ 4 && t6_value !== (t6_value = /*dependency*/ ctx[9].api_name + "")) set_data(t6, t6_value);

			if (current_block_type !== (current_block_type = select_block_type_1(ctx))) {
				if_block.d(1);
				if_block = current_block_type(ctx);

				if (if_block) {
					if_block.c();
					if_block.m(button, null);
				}
			}

			if (dirty & /*components, dependencies*/ 6) {
				each_value_2 = /*dependency*/ ctx[9].documentation[0];
				let i;

				for (i = 0; i < each_value_2.length; i += 1) {
					const child_ctx = get_each_context_2(ctx, each_value_2, i);

					if (each_blocks_1[i]) {
						each_blocks_1[i].p(child_ctx, dirty);
					} else {
						each_blocks_1[i] = create_each_block_2(child_ctx);
						each_blocks_1[i].c();
						each_blocks_1[i].m(div1, t14);
					}
				}

				for (; i < each_blocks_1.length; i += 1) {
					each_blocks_1[i].d(1);
				}

				each_blocks_1.length = each_value_2.length;
			}

			if (dirty & /*components, dependencies*/ 6) {
				each_value_1 = /*dependency*/ ctx[9].documentation[1];
				let i;

				for (i = 0; i < each_value_1.length; i += 1) {
					const child_ctx = get_each_context_1(ctx, each_value_1, i);

					if (each_blocks[i]) {
						each_blocks[i].p(child_ctx, dirty);
					} else {
						each_blocks[i] = create_each_block_1(child_ctx);
						each_blocks[i].c();
						each_blocks[i].m(div2, t22);
					}
				}

				for (; i < each_blocks.length; i += 1) {
					each_blocks[i].d(1);
				}

				each_blocks.length = each_value_1.length;
			}
		},
		d(detaching) {
			if (detaching) detach(div3);
			if_block.d();
			destroy_each(each_blocks_1, detaching);
			destroy_each(each_blocks, detaching);
			mounted = false;
			dispose();
		}
	};
}

// (46:38) {:else}
function create_else_block$1(ctx) {
	let t;

	return {
		c() {
			t = text("copy");
		},
		m(target, anchor) {
			insert(target, t, anchor);
		},
		d(detaching) {
			if (detaching) detach(t);
		}
	};
}

// (46:8) {#if just_copied === d}
function create_if_block_2$2(ctx) {
	let t;

	return {
		c() {
			t = text("copied!");
		},
		m(target, anchor) {
			insert(target, t, anchor);
		},
		d(detaching) {
			if (detaching) detach(t);
		}
	};
}

// (55:7) {#each dependency.documentation[0] as dependency_doc, i}
function create_each_block_2(ctx) {
	let t0;
	let t1_value = /*dependency_doc*/ ctx[12][1] + "";
	let t1;
	let t2;
	let span1;
	let t3;
	let t4_value = /*dependency_doc*/ ctx[12][0] + "";
	let t4;
	let t5;
	let t6_value = func_1(/*components*/ ctx[1].filter(func_2)[0].props.label) + "";
	let t6;
	let t7;
	let span0;
	let t8_value = /*components*/ ctx[1].filter(func_3)[0].props.name + "";
	let t8;
	let t9;
	let t10;
	let br;

	function func_2(...args) {
		return /*func_2*/ ctx[5](/*dependency*/ ctx[9], /*i*/ ctx[14], ...args);
	}

	function func_3(...args) {
		return /*func_3*/ ctx[6](/*dependency*/ ctx[9], /*i*/ ctx[14], ...args);
	}

	return {
		c() {
			t0 = text("    ");
			t1 = text(t1_value);
			t2 = text(",\n\t\t\t\t\t\t\t\t");
			span1 = element("span");
			t3 = text("// represents ");
			t4 = text(t4_value);
			t5 = text(" of\n\t\t\t\t\t\t\t\t\t");
			t6 = text(t6_value);
			t7 = space();
			span0 = element("span");
			t8 = text(t8_value);
			t9 = text(" component");
			t10 = space();
			br = element("br");
			attr(span0, "class", "capitalize");
			attr(span1, "class", "text-pink-400 dark:text-pink-600");
		},
		m(target, anchor) {
			insert(target, t0, anchor);
			insert(target, t1, anchor);
			insert(target, t2, anchor);
			insert(target, span1, anchor);
			append(span1, t3);
			append(span1, t4);
			append(span1, t5);
			append(span1, t6);
			append(span1, t7);
			append(span1, span0);
			append(span0, t8);
			append(span1, t9);
			insert(target, t10, anchor);
			insert(target, br, anchor);
		},
		p(new_ctx, dirty) {
			ctx = new_ctx;
			if (dirty & /*dependencies*/ 4 && t1_value !== (t1_value = /*dependency_doc*/ ctx[12][1] + "")) set_data(t1, t1_value);
			if (dirty & /*dependencies*/ 4 && t4_value !== (t4_value = /*dependency_doc*/ ctx[12][0] + "")) set_data(t4, t4_value);
			if (dirty & /*components, dependencies*/ 6 && t6_value !== (t6_value = func_1(/*components*/ ctx[1].filter(func_2)[0].props.label) + "")) set_data(t6, t6_value);
			if (dirty & /*components, dependencies*/ 6 && t8_value !== (t8_value = /*components*/ ctx[1].filter(func_3)[0].props.name + "")) set_data(t8, t8_value);
		},
		d(detaching) {
			if (detaching) detach(t0);
			if (detaching) detach(t1);
			if (detaching) detach(t2);
			if (detaching) detach(span1);
			if (detaching) detach(t10);
			if (detaching) detach(br);
		}
	};
}

// (82:7) {#each dependency.documentation[1] as dependency_doc, i}
function create_each_block_1(ctx) {
	let t0;
	let t1_value = /*dependency_doc*/ ctx[12][1] + "";
	let t1;
	let t2;
	let span1;
	let t3;
	let t4_value = /*dependency_doc*/ ctx[12][0] + "";
	let t4;
	let t5;
	let t6_value = func_4(/*components*/ ctx[1].filter(func_5)[0].props.label) + "";
	let t6;
	let t7;
	let span0;
	let t8_value = /*components*/ ctx[1].filter(func_6)[0].props.name + "";
	let t8;
	let t9;
	let t10;
	let br;

	function func_5(...args) {
		return /*func_5*/ ctx[7](/*dependency*/ ctx[9], /*i*/ ctx[14], ...args);
	}

	function func_6(...args) {
		return /*func_6*/ ctx[8](/*dependency*/ ctx[9], /*i*/ ctx[14], ...args);
	}

	return {
		c() {
			t0 = text("    ");
			t1 = text(t1_value);
			t2 = text(",\n\t\t\t\t\t\t\t\t");
			span1 = element("span");
			t3 = text("// represents ");
			t4 = text(t4_value);
			t5 = text(" of\n\t\t\t\t\t\t\t\t\t");
			t6 = text(t6_value);
			t7 = space();
			span0 = element("span");
			t8 = text(t8_value);
			t9 = text(" component");
			t10 = space();
			br = element("br");
			attr(span0, "class", "capitalize");
			attr(span1, "class", "text-pink-400 dark:text-pink-600");
		},
		m(target, anchor) {
			insert(target, t0, anchor);
			insert(target, t1, anchor);
			insert(target, t2, anchor);
			insert(target, span1, anchor);
			append(span1, t3);
			append(span1, t4);
			append(span1, t5);
			append(span1, t6);
			append(span1, t7);
			append(span1, span0);
			append(span0, t8);
			append(span1, t9);
			insert(target, t10, anchor);
			insert(target, br, anchor);
		},
		p(new_ctx, dirty) {
			ctx = new_ctx;
			if (dirty & /*dependencies*/ 4 && t1_value !== (t1_value = /*dependency_doc*/ ctx[12][1] + "")) set_data(t1, t1_value);
			if (dirty & /*dependencies*/ 4 && t4_value !== (t4_value = /*dependency_doc*/ ctx[12][0] + "")) set_data(t4, t4_value);
			if (dirty & /*components, dependencies*/ 6 && t6_value !== (t6_value = func_4(/*components*/ ctx[1].filter(func_5)[0].props.label) + "")) set_data(t6, t6_value);
			if (dirty & /*components, dependencies*/ 6 && t8_value !== (t8_value = /*components*/ ctx[1].filter(func_6)[0].props.name + "")) set_data(t8, t8_value);
		},
		d(detaching) {
			if (detaching) detach(t0);
			if (detaching) detach(t1);
			if (detaching) detach(t2);
			if (detaching) detach(span1);
			if (detaching) detach(t10);
			if (detaching) detach(br);
		}
	};
}

// (22:3) {#each dependencies as dependency, d}
function create_each_block(ctx) {
	let if_block_anchor;
	let if_block = /*dependency*/ ctx[9].documentation && create_if_block_1$2(ctx);

	return {
		c() {
			if (if_block) if_block.c();
			if_block_anchor = empty();
		},
		m(target, anchor) {
			if (if_block) if_block.m(target, anchor);
			insert(target, if_block_anchor, anchor);
		},
		p(ctx, dirty) {
			if (/*dependency*/ ctx[9].documentation) {
				if (if_block) {
					if_block.p(ctx, dirty);
				} else {
					if_block = create_if_block_1$2(ctx);
					if_block.c();
					if_block.m(if_block_anchor.parentNode, if_block_anchor);
				}
			} else if (if_block) {
				if_block.d(1);
				if_block = null;
			}
		},
		d(detaching) {
			if (if_block) if_block.d(detaching);
			if (detaching) detach(if_block_anchor);
		}
	};
}

function create_fragment$4(ctx) {
	let div;
	let show_if;

	function select_block_type(ctx, dirty) {
		if (dirty & /*dependencies*/ 4) show_if = null;
		if (show_if == null) show_if = !!/*dependencies*/ ctx[2].some(func);
		if (show_if) return create_if_block$3;
		return create_else_block_1;
	}

	let current_block_type = select_block_type(ctx, -1);
	let if_block = current_block_type(ctx);

	return {
		c() {
			div = element("div");
			if_block.c();
		},
		m(target, anchor) {
			insert(target, div, anchor);
			if_block.m(div, null);
		},
		p(ctx, [dirty]) {
			if (current_block_type === (current_block_type = select_block_type(ctx, dirty)) && if_block) {
				if_block.p(ctx, dirty);
			} else {
				if_block.d(1);
				if_block = current_block_type(ctx);

				if (if_block) {
					if_block.c();
					if_block.m(div, null);
				}
			}
		},
		i: noop,
		o: noop,
		d(detaching) {
			if (detaching) detach(div);
			if_block.d();
		}
	};
}

const func = d => "documentation" in d;

const func_1 = label => {
	return label ? "'" + label + "'" : "the";
};

const func_4 = label => {
	return label ? "'" + label + "'" : "the";
};

function instance$4($$self, $$props, $$invalidate) {
	let { components } = $$props;
	let { dependencies } = $$props;
	let { root } = $$props;

	if (root === "") {
		root = location.protocol + "//" + location.host + location.pathname;
	}

	if (!root.endsWith("/")) {
		root += "/";
	}

	let just_copied = -1;

	const click_handler = (dependency, d) => {
		navigator.clipboard.writeText(root + "api/" + dependency.api_name);
		$$invalidate(3, just_copied = d);

		setTimeout(
			() => {
				$$invalidate(3, just_copied = -1);
			},
			500
		);
	};

	const func_2 = (dependency, i, c) => c.id === dependency.inputs[i];
	const func_3 = (dependency, i, c) => c.id === dependency.inputs[i];
	const func_5 = (dependency, i, c) => c.id === dependency.outputs[i];
	const func_6 = (dependency, i, c) => c.id === dependency.outputs[i];

	$$self.$$set = $$props => {
		if ('components' in $$props) $$invalidate(1, components = $$props.components);
		if ('dependencies' in $$props) $$invalidate(2, dependencies = $$props.dependencies);
		if ('root' in $$props) $$invalidate(0, root = $$props.root);
	};

	return [
		root,
		components,
		dependencies,
		just_copied,
		click_handler,
		func_2,
		func_3,
		func_5,
		func_6
	];
}

class ApiDocs extends SvelteComponent {
	constructor(options) {
		super();
		init(this, options, instance$4, create_fragment$4, safe_not_equal, { components: 1, dependencies: 2, root: 0 });
	}
}

var logo = "./assets/logo.1a7cafda.svg";

/* src/Blocks.svelte generated by Svelte v3.49.0 */

const { document: document_1 } = globals;

function create_if_block_4$1(ctx) {
	let script;
	let script_src_value;

	return {
		c() {
			script = element("script");
			script.async = true;
			script.defer = true;
			if (!src_url_equal(script.src, script_src_value = "https://www.googletagmanager.com/gtag/js?id=UA-156449732-1")) attr(script, "src", script_src_value);
		},
		m(target, anchor) {
			insert(target, script, anchor);
		},
		d(detaching) {
			if (detaching) detach(script);
		}
	};
}

// (334:18) 
function create_if_block_3$1(ctx) {
	let render;
	let current;

	render = new Render({
			props: {
				has_modes: /*rootNode*/ ctx[6].has_modes,
				component: /*rootNode*/ ctx[6].component,
				id: /*rootNode*/ ctx[6].id,
				props: /*rootNode*/ ctx[6].props,
				children: /*rootNode*/ ctx[6].children,
				dynamic_ids: /*dynamic_ids*/ ctx[13],
				instance_map: /*instance_map*/ ctx[8],
				root: /*root*/ ctx[0]
			}
		});

	render.$on("mount", /*handle_mount*/ ctx[14]);
	render.$on("destroy", /*destroy_handler*/ ctx[23]);

	return {
		c() {
			create_component(render.$$.fragment);
		},
		m(target, anchor) {
			mount_component(render, target, anchor);
			current = true;
		},
		p(ctx, dirty) {
			const render_changes = {};
			if (dirty[0] & /*rootNode*/ 64) render_changes.has_modes = /*rootNode*/ ctx[6].has_modes;
			if (dirty[0] & /*rootNode*/ 64) render_changes.component = /*rootNode*/ ctx[6].component;
			if (dirty[0] & /*rootNode*/ 64) render_changes.id = /*rootNode*/ ctx[6].id;
			if (dirty[0] & /*rootNode*/ 64) render_changes.props = /*rootNode*/ ctx[6].props;
			if (dirty[0] & /*rootNode*/ 64) render_changes.children = /*rootNode*/ ctx[6].children;
			if (dirty[0] & /*instance_map*/ 256) render_changes.instance_map = /*instance_map*/ ctx[8];
			if (dirty[0] & /*root*/ 1) render_changes.root = /*root*/ ctx[0];
			render.$set(render_changes);
		},
		i(local) {
			if (current) return;
			transition_in(render.$$.fragment, local);
			current = true;
		},
		o(local) {
			transition_out(render.$$.fragment, local);
			current = false;
		},
		d(detaching) {
			destroy_component(render, detaching);
		}
	};
}

// (332:2) {#if api_docs_visible}
function create_if_block_2$1(ctx) {
	let apidocs;
	let current;

	apidocs = new ApiDocs({
			props: {
				components: /*components*/ ctx[1],
				dependencies: /*dependencies*/ ctx[2],
				root: /*root*/ ctx[0]
			}
		});

	return {
		c() {
			create_component(apidocs.$$.fragment);
		},
		m(target, anchor) {
			mount_component(apidocs, target, anchor);
			current = true;
		},
		p(ctx, dirty) {
			const apidocs_changes = {};
			if (dirty[0] & /*components*/ 2) apidocs_changes.components = /*components*/ ctx[1];
			if (dirty[0] & /*dependencies*/ 4) apidocs_changes.dependencies = /*dependencies*/ ctx[2];
			if (dirty[0] & /*root*/ 1) apidocs_changes.root = /*root*/ ctx[0];
			apidocs.$set(apidocs_changes);
		},
		i(local) {
			if (current) return;
			transition_in(apidocs.$$.fragment, local);
			current = true;
		},
		o(local) {
			transition_out(apidocs.$$.fragment, local);
			current = false;
		},
		d(detaching) {
			destroy_component(apidocs, detaching);
		}
	};
}

// (352:2) {#if show_api}
function create_if_block$2(ctx) {
	let div;
	let t0;
	let t1;
	let mounted;
	let dispose;

	function select_block_type_1(ctx, dirty) {
		if (/*api_docs_visible*/ ctx[7]) return create_if_block_1$1;
		return create_else_block;
	}

	let current_block_type = select_block_type_1(ctx);
	let if_block = current_block_type(ctx);

	return {
		c() {
			div = element("div");
			if_block.c();
			t0 = text(" api");
			t1 = text("\n\t\t\t  •  ");
			attr(div, "class", "cursor-pointer hover:text-gray-400 dark:hover:text-gray-400 transition-colors");
		},
		m(target, anchor) {
			insert(target, div, anchor);
			if_block.m(div, null);
			append(div, t0);
			insert(target, t1, anchor);

			if (!mounted) {
				dispose = listen(div, "click", /*click_handler*/ ctx[24]);
				mounted = true;
			}
		},
		p(ctx, dirty) {
			if (current_block_type !== (current_block_type = select_block_type_1(ctx))) {
				if_block.d(1);
				if_block = current_block_type(ctx);

				if (if_block) {
					if_block.c();
					if_block.m(div, t0);
				}
			}
		},
		d(detaching) {
			if (detaching) detach(div);
			if_block.d();
			if (detaching) detach(t1);
			mounted = false;
			dispose();
		}
	};
}

// (359:30) {:else}
function create_else_block(ctx) {
	let t;

	return {
		c() {
			t = text("view");
		},
		m(target, anchor) {
			insert(target, t, anchor);
		},
		d(detaching) {
			if (detaching) detach(t);
		}
	};
}

// (359:4) {#if api_docs_visible}
function create_if_block_1$1(ctx) {
	let t;

	return {
		c() {
			t = text("hide");
		},
		m(target, anchor) {
			insert(target, t, anchor);
		},
		d(detaching) {
			if (detaching) detach(t);
		}
	};
}

function create_fragment$3(ctx) {
	let title_value;
	let if_block0_anchor;
	let t0;
	let div1;
	let div0;
	let current_block_type_index;
	let if_block1;
	let t1;
	let footer;
	let t2;
	let a;
	let t3_value = /*$_*/ ctx[10]("interface.built_with_Gradio") + "";
	let t3;
	let t4;
	let img;
	let img_src_value;
	let current;
	document_1.title = title_value = /*title*/ ctx[3];
	let if_block0 = /*analytics_enabled*/ ctx[4] && create_if_block_4$1();
	const if_block_creators = [create_if_block_2$1, create_if_block_3$1];
	const if_blocks = [];

	function select_block_type(ctx, dirty) {
		if (/*api_docs_visible*/ ctx[7]) return 0;
		if (/*ready*/ ctx[9]) return 1;
		return -1;
	}

	if (~(current_block_type_index = select_block_type(ctx))) {
		if_block1 = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
	}

	let if_block2 = /*show_api*/ ctx[5] && create_if_block$2(ctx);

	return {
		c() {
			if (if_block0) if_block0.c();
			if_block0_anchor = empty();
			t0 = space();
			div1 = element("div");
			div0 = element("div");
			if (if_block1) if_block1.c();
			t1 = space();
			footer = element("footer");
			if (if_block2) if_block2.c();
			t2 = space();
			a = element("a");
			t3 = text(t3_value);
			t4 = space();
			img = element("img");
			attr(div0, "class", "mx-auto container px-4 py-6 dark:bg-gray-950");
			toggle_class(div0, "flex-grow", /*app_mode*/ ctx[11]);
			attr(img, "class", "h-[22px] ml-0.5 inline-block pb-0.5 filter grayscale opacity-50 group-hover:grayscale-0 group-hover:opacity-100 transition");
			if (!src_url_equal(img.src, img_src_value = logo)) attr(img, "src", img_src_value);
			attr(img, "alt", "logo");
			attr(a, "href", "https://gradio.app");
			attr(a, "target", "_blank");
			attr(a, "rel", "noreferrer");
			attr(a, "class", "group hover:text-gray-400 dark:hover:text-gray-400 transition-colors");
			attr(footer, "class", "flex justify-center pb-6 text-gray-300 dark:text-gray-500 font-semibold");
			attr(div1, "class", "w-full flex flex-col");
			toggle_class(div1, "min-h-screen", /*app_mode*/ ctx[11]);
		},
		m(target, anchor) {
			if (if_block0) if_block0.m(document_1.head, null);
			append(document_1.head, if_block0_anchor);
			insert(target, t0, anchor);
			insert(target, div1, anchor);
			append(div1, div0);

			if (~current_block_type_index) {
				if_blocks[current_block_type_index].m(div0, null);
			}

			append(div1, t1);
			append(div1, footer);
			if (if_block2) if_block2.m(footer, null);
			append(footer, t2);
			append(footer, a);
			append(a, t3);
			append(a, t4);
			append(a, img);
			current = true;
		},
		p(ctx, dirty) {
			if ((!current || dirty[0] & /*title*/ 8) && title_value !== (title_value = /*title*/ ctx[3])) {
				document_1.title = title_value;
			}

			if (/*analytics_enabled*/ ctx[4]) {
				if (if_block0) ; else {
					if_block0 = create_if_block_4$1();
					if_block0.c();
					if_block0.m(if_block0_anchor.parentNode, if_block0_anchor);
				}
			} else if (if_block0) {
				if_block0.d(1);
				if_block0 = null;
			}

			let previous_block_index = current_block_type_index;
			current_block_type_index = select_block_type(ctx);

			if (current_block_type_index === previous_block_index) {
				if (~current_block_type_index) {
					if_blocks[current_block_type_index].p(ctx, dirty);
				}
			} else {
				if (if_block1) {
					group_outros();

					transition_out(if_blocks[previous_block_index], 1, 1, () => {
						if_blocks[previous_block_index] = null;
					});

					check_outros();
				}

				if (~current_block_type_index) {
					if_block1 = if_blocks[current_block_type_index];

					if (!if_block1) {
						if_block1 = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
						if_block1.c();
					} else {
						if_block1.p(ctx, dirty);
					}

					transition_in(if_block1, 1);
					if_block1.m(div0, null);
				} else {
					if_block1 = null;
				}
			}

			if (/*show_api*/ ctx[5]) {
				if (if_block2) {
					if_block2.p(ctx, dirty);
				} else {
					if_block2 = create_if_block$2(ctx);
					if_block2.c();
					if_block2.m(footer, t2);
				}
			} else if (if_block2) {
				if_block2.d(1);
				if_block2 = null;
			}

			if ((!current || dirty[0] & /*$_*/ 1024) && t3_value !== (t3_value = /*$_*/ ctx[10]("interface.built_with_Gradio") + "")) set_data(t3, t3_value);
		},
		i(local) {
			if (current) return;
			transition_in(if_block1);
			current = true;
		},
		o(local) {
			transition_out(if_block1);
			current = false;
		},
		d(detaching) {
			if (if_block0) if_block0.d(detaching);
			detach(if_block0_anchor);
			if (detaching) detach(t0);
			if (detaching) detach(div1);

			if (~current_block_type_index) {
				if_blocks[current_block_type_index].d();
			}

			if (if_block2) if_block2.d();
		}
	};
}

function is_dep(id, type, deps) {
	let dep_index = 0;

	for (; ; ) {
		const dep = deps[dep_index];
		if (dep === undefined) break;
		let dep_item_index = 0;

		for (; ; ) {
			const dep_item = dep[type][dep_item_index];
			if (dep_item === undefined) break;
			if (dep_item === id) return true;
			dep_item_index++;
		}

		dep_index++;
	}

	return false;
}

function has_no_default_value(value) {
	return Array.isArray(value) && value.length === 0 || value === "" || value === 0 || !value;
}

function instance$3($$self, $$props, $$invalidate) {
	let $loading_status;
	let $_;
	component_subscribe($$self, X, $$value => $$invalidate(10, $_ = $$value));
	setupi18n();
	let { root } = $$props;
	let { fn } = $$props;
	let { components } = $$props;
	let { layout } = $$props;
	let { dependencies } = $$props;
	let { enable_queue } = $$props;
	let { title = "Gradio" } = $$props;
	let { analytics_enabled = false } = $$props;
	let { target } = $$props;
	let { id = 0 } = $$props;
	let { autoscroll = false } = $$props;
	let { show_api = true } = $$props;
	let app_mode = window.__gradio_mode__ === "app";
	let loading_status = create_loading_status_store();
	component_subscribe($$self, loading_status, value => $$invalidate(22, $loading_status = value));

	let rootNode = {
		id: layout.id,
		type: "column",
		props: {},
		has_modes: false,
		instance: {},
		component: {}
	};

	components.push(rootNode);

	const AsyncFunction = Object.getPrototypeOf(async function () {
		
	}).constructor;

	dependencies.forEach(d => {
		if (d.js) {
			try {
				d.frontend_fn = new AsyncFunction("__fn_args",
				`let result = await (${d.js})(...__fn_args);
					return ${d.outputs.length} === 1 ? [result] : result;`);
			} catch(e) {
				console.error("Could not parse custom js method.");
				console.error(e);
			}
		}
	});

	let api_docs_visible = false;

	const dynamic_ids = components.reduce(
		(acc, { id, props }) => {
			const is_input = is_dep(id, "inputs", dependencies);
			const is_output = is_dep(id, "outputs", dependencies);
			if (!is_input && !is_output && "value" in props && has_no_default_value(props?.value)) acc.add(id); // default dynamic
			if (is_input) acc.add(id);
			return acc;
		},
		new Set()
	);

	let instance_map = components.reduce(
		(acc, next) => {
			acc[next.id] = next;
			return acc;
		},
		{}
	);

	function load_component(name) {
		return new Promise(async (res, rej) => {
				try {
					const c = await component_map[name]();
					res({ name, component: c });
				} catch(e) {
					console.error("failed to load: " + name);
					console.error(e);
					rej(e);
				}
			});
	}

	const component_set = new Set();
	const _component_map = new Map();

	async function walk_layout(node) {
		let instance = instance_map[node.id];
		const _component = (await _component_map.get(instance.type)).component;
		instance.component = _component.Component;

		if (_component.modes && _component.modes.length > 1) {
			instance.has_modes = true;
		}

		if (node.children) {
			instance.children = node.children.map(v => instance_map[v.id]);
			await Promise.all(node.children.map(v => walk_layout(v)));
		}
	}

	components.forEach(async c => {
		const _c = load_component(c.type);
		component_set.add(_c);
		_component_map.set(c.type, _c);
	});

	let ready = false;

	Promise.all(Array.from(component_set)).then(() => {
		walk_layout(layout).then(async () => {
			$$invalidate(9, ready = true);
			await tick();
			window.__gradio_loader__[id].$set({ status: "complete" });
		}).catch(e => {
			console.error(e);
			window.__gradio_loader__[id].$set({ status: "error" });
		});
	});

	function set_prop(obj, prop, val) {
		if (!obj?.props) {
			obj.props = {};
		}

		obj.props[prop] = val;
		$$invalidate(6, rootNode);
	}

	let handled_dependencies = [];

	async function handle_mount() {
		await tick();
		var a = target.getElementsByTagName("a");

		for (var i = 0; i < a.length; i++) {
			const _target = a[i].getAttribute("target");
			if (_target !== "_blank") a[i].setAttribute("target", "_blank");
		}

		dependencies.forEach(({ targets, trigger, inputs, outputs, queue, backend_fn, frontend_fn, ...rest }, i) => {
			const target_instances = targets.map(t => [t, instance_map[t]]);

			// page events
			if (targets.length === 0 && !handled_dependencies[i]?.includes(-1) && trigger === "load" && // check all input + output elements are on the page
			outputs.every(v => instance_map[v].instance) && inputs.every(v => instance_map[v].instance)) {
				const req = fn({
					action: "predict",
					backend_fn,
					frontend_fn,
					payload: {
						fn_index: i,
						data: inputs.map(id => instance_map[id].props.value)
					},
					queue: queue === null ? enable_queue : queue,
					queue_callback: handle_update,
					loading_status
				});

				function handle_update(output) {
					output.data.forEach((value, i) => {
						if (typeof value === "object" && value !== null && value.__type__ === "update") {
							for (const [update_key, update_value] of Object.entries(value)) {
								if (update_key === "__type__") {
									continue;
								} else {
									$$invalidate(8, instance_map[outputs[i]].props[update_key] = update_value, instance_map);
								}
							}

							$$invalidate(6, rootNode);
						} else {
							$$invalidate(8, instance_map[outputs[i]].props.value = value, instance_map);
						}
					});
				}

				if (!(queue === null ? enable_queue : queue)) {
					req.then(handle_update);
				}

				handled_dependencies[i] = [-1];
			}

			target_instances.forEach(([id, { instance }]) => {
				if (handled_dependencies[i]?.includes(id) || !instance) return;

				instance?.$on(trigger, () => {
					if (loading_status.get_status_for_fn(i) === "pending") {
						return;
					}

					// page events
					const req = fn({
						action: "predict",
						backend_fn,
						frontend_fn,
						payload: {
							fn_index: i,
							data: inputs.map(id => instance_map[id].props.value)
						},
						output_data: outputs.map(id => instance_map[id].props.value),
						queue: queue === null ? enable_queue : queue,
						queue_callback: handle_update,
						loading_status
					});

					if (!(queue === null ? enable_queue : queue)) {
						req.then(handle_update);
					}
				});

				function handle_update(output) {
					output.data.forEach((value, i) => {
						if (typeof value === "object" && value !== null && value.__type__ === "update") {
							for (const [update_key, update_value] of Object.entries(value)) {
								if (update_key === "__type__") {
									continue;
								} else {
									$$invalidate(8, instance_map[outputs[i]].props[update_key] = update_value, instance_map);
								}
							}

							$$invalidate(6, rootNode);
						} else {
							$$invalidate(8, instance_map[outputs[i]].props.value = value, instance_map);
						}
					});
				}

				if (!handled_dependencies[i]) handled_dependencies[i] = [];
				handled_dependencies[i].push(id);
			});
		});
	}

	function handle_destroy(id) {
		handled_dependencies = handled_dependencies.map(dep => {
			return dep.filter(_id => _id !== id);
		});
	}

	dependencies.forEach((v, i) => {
		loading_status.register(i, v.inputs, v.outputs);
	});

	function set_status(statuses) {
		for (const id in statuses) {
			let loading_status = statuses[id];
			let dependency = dependencies[loading_status.fn_index];
			loading_status.scroll_to_output = dependency.scroll_to_output;
			loading_status.visible = dependency.show_progress;
			set_prop(instance_map[id], "loading_status", loading_status);
		}

		const inputs_to_update = loading_status.get_inputs_to_update();

		for (const [id, pending_status] of inputs_to_update) {
			set_prop(instance_map[id], "pending", pending_status === "pending");
		}
	}

	function handle_darkmode() {
		let url = new URL(window.location.toString());
		const color_mode = url.searchParams.get("__theme");

		if (color_mode !== null) {
			if (color_mode === "dark") {
				darkmode();
			} else if (color_mode === "system") {
				use_system_theme();
			}
		} else if (url.searchParams.get("__dark-theme") === "true") {
			darkmode(); // light is default, so we don't need to do anything else
		} else {
			use_system_theme();
		}
	}

	function use_system_theme() {
		update_scheme();
		window?.matchMedia("(prefers-color-scheme: dark)")?.addEventListener("change", update_scheme);

		function update_scheme() {
			const is_dark = window?.matchMedia?.("(prefers-color-scheme: dark)").matches ?? null;

			if (is_dark) {
				darkmode();
			}
		}
	}

	function darkmode() {
		target.classList.add("dark");

		if (app_mode) {
			document.body.style.backgroundColor = "rgb(11, 15, 25)"; // bg-gray-950 for scrolling outside the body
		}
	}

	if (window.__gradio_mode__ !== "website") {
		handle_darkmode();
	}

	const destroy_handler = ({ detail }) => handle_destroy(detail);

	const click_handler = () => {
		$$invalidate(7, api_docs_visible = !api_docs_visible);
	};

	$$self.$$set = $$props => {
		if ('root' in $$props) $$invalidate(0, root = $$props.root);
		if ('fn' in $$props) $$invalidate(16, fn = $$props.fn);
		if ('components' in $$props) $$invalidate(1, components = $$props.components);
		if ('layout' in $$props) $$invalidate(17, layout = $$props.layout);
		if ('dependencies' in $$props) $$invalidate(2, dependencies = $$props.dependencies);
		if ('enable_queue' in $$props) $$invalidate(18, enable_queue = $$props.enable_queue);
		if ('title' in $$props) $$invalidate(3, title = $$props.title);
		if ('analytics_enabled' in $$props) $$invalidate(4, analytics_enabled = $$props.analytics_enabled);
		if ('target' in $$props) $$invalidate(19, target = $$props.target);
		if ('id' in $$props) $$invalidate(20, id = $$props.id);
		if ('autoscroll' in $$props) $$invalidate(21, autoscroll = $$props.autoscroll);
		if ('show_api' in $$props) $$invalidate(5, show_api = $$props.show_api);
	};

	$$self.$$.update = () => {
		if ($$self.$$.dirty[0] & /*autoscroll*/ 2097152) {
			app_state.update(s => ({ ...s, autoscroll }));
		}

		if ($$self.$$.dirty[0] & /*$loading_status*/ 4194304) {
			set_status($loading_status);
		}
	};

	return [
		root,
		components,
		dependencies,
		title,
		analytics_enabled,
		show_api,
		rootNode,
		api_docs_visible,
		instance_map,
		ready,
		$_,
		app_mode,
		loading_status,
		dynamic_ids,
		handle_mount,
		handle_destroy,
		fn,
		layout,
		enable_queue,
		target,
		id,
		autoscroll,
		$loading_status,
		destroy_handler,
		click_handler
	];
}

class Blocks extends SvelteComponent {
	constructor(options) {
		super();

		init(
			this,
			options,
			instance$3,
			create_fragment$3,
			safe_not_equal,
			{
				root: 0,
				fn: 16,
				components: 1,
				layout: 17,
				dependencies: 2,
				enable_queue: 18,
				title: 3,
				analytics_enabled: 4,
				target: 19,
				id: 20,
				autoscroll: 21,
				show_api: 5
			},
			null,
			[-1, -1]
		);
	}
}

/* src/Login.svelte generated by Svelte v3.49.0 */

function create_if_block$1(ctx) {
	let p;
	let t;

	return {
		c() {
			p = element("p");
			t = text(/*auth_message*/ ctx[1]);
			attr(p, "class", "my-4");
		},
		m(target, anchor) {
			insert(target, p, anchor);
			append(p, t);
		},
		p(ctx, dirty) {
			if (dirty & /*auth_message*/ 2) set_data(t, /*auth_message*/ ctx[1]);
		},
		d(detaching) {
			if (detaching) detach(p);
		}
	};
}

function create_fragment$2(ctx) {
	let div;
	let form;
	let h2;
	let t1;
	let t2;
	let label0;
	let t4;
	let input0;
	let t5;
	let label1;
	let t7;
	let input1;
	let t8;
	let input2;
	let form_action_value;
	let if_block = /*auth_message*/ ctx[1] && create_if_block$1(ctx);

	return {
		c() {
			div = element("div");
			form = element("form");
			h2 = element("h2");
			h2.textContent = "login";
			t1 = space();
			if (if_block) if_block.c();
			t2 = space();
			label0 = element("label");
			label0.textContent = "username";
			t4 = space();
			input0 = element("input");
			t5 = space();
			label1 = element("label");
			label1.textContent = "password";
			t7 = space();
			input1 = element("input");
			t8 = space();
			input2 = element("input");
			attr(h2, "class", "text-2xl font-semibold my-2");
			attr(label0, "class", "block uppercase mt-4");
			attr(label0, "for", "username");
			attr(input0, "class", "p-2 block");
			attr(input0, "type", "text");
			attr(input0, "name", "username");
			attr(label1, "class", "block uppercase mt-4");
			attr(label1, "for", "password");
			attr(input1, "class", "p-2 block");
			attr(input1, "type", "password");
			attr(input1, "name", "password");
			attr(input2, "type", "submit");
			attr(input2, "class", "block bg-amber-500 hover:bg-amber-400 dark:hover:bg-amber-600 transition px-4 py-2 rounded text-white font-semibold cursor-pointer mt-4");
			attr(form, "class", "mx-auto p-4 bg-gray-50 shadow-md w-1/2");
			attr(form, "id", "login");
			attr(form, "method", "POST");
			attr(form, "action", form_action_value = /*root*/ ctx[0] + "login");
			attr(div, "class", "login container mt-8");
		},
		m(target, anchor) {
			insert(target, div, anchor);
			append(div, form);
			append(form, h2);
			append(form, t1);
			if (if_block) if_block.m(form, null);
			append(form, t2);
			append(form, label0);
			append(form, t4);
			append(form, input0);
			append(form, t5);
			append(form, label1);
			append(form, t7);
			append(form, input1);
			append(form, t8);
			append(form, input2);
		},
		p(ctx, [dirty]) {
			if (/*auth_message*/ ctx[1]) {
				if (if_block) {
					if_block.p(ctx, dirty);
				} else {
					if_block = create_if_block$1(ctx);
					if_block.c();
					if_block.m(form, t2);
				}
			} else if (if_block) {
				if_block.d(1);
				if_block = null;
			}

			if (dirty & /*root*/ 1 && form_action_value !== (form_action_value = /*root*/ ctx[0] + "login")) {
				attr(form, "action", form_action_value);
			}
		},
		i: noop,
		o: noop,
		d(detaching) {
			if (detaching) detach(div);
			if (if_block) if_block.d();
		}
	};
}

function instance$2($$self, $$props, $$invalidate) {
	let { root } = $$props;
	let { id } = $$props;
	let { auth_message } = $$props;
	window.__gradio_loader__[id].$set({ status: "complete" });

	$$self.$$set = $$props => {
		if ('root' in $$props) $$invalidate(0, root = $$props.root);
		if ('id' in $$props) $$invalidate(2, id = $$props.id);
		if ('auth_message' in $$props) $$invalidate(1, auth_message = $$props.auth_message);
	};

	return [root, auth_message, id];
}

class Login extends SvelteComponent {
	constructor(options) {
		super();
		init(this, options, instance$2, create_fragment$2, safe_not_equal, { root: 0, id: 2, auth_message: 1 });
	}
}

function fade(node, { delay = 0, duration = 400, easing = identity } = {}) {
    const o = +getComputedStyle(node).opacity;
    return {
        delay,
        duration,
        easing,
        css: t => `opacity: ${t * o}`
    };
}

function is_date(obj) {
    return Object.prototype.toString.call(obj) === '[object Date]';
}

function tick_spring(ctx, last_value, current_value, target_value) {
    if (typeof current_value === 'number' || is_date(current_value)) {
        // @ts-ignore
        const delta = target_value - current_value;
        // @ts-ignore
        const velocity = (current_value - last_value) / (ctx.dt || 1 / 60); // guard div by 0
        const spring = ctx.opts.stiffness * delta;
        const damper = ctx.opts.damping * velocity;
        const acceleration = (spring - damper) * ctx.inv_mass;
        const d = (velocity + acceleration) * ctx.dt;
        if (Math.abs(d) < ctx.opts.precision && Math.abs(delta) < ctx.opts.precision) {
            return target_value; // settled
        }
        else {
            ctx.settled = false; // signal loop to keep ticking
            // @ts-ignore
            return is_date(current_value) ?
                new Date(current_value.getTime() + d) : current_value + d;
        }
    }
    else if (Array.isArray(current_value)) {
        // @ts-ignore
        return current_value.map((_, i) => tick_spring(ctx, last_value[i], current_value[i], target_value[i]));
    }
    else if (typeof current_value === 'object') {
        const next_value = {};
        for (const k in current_value) {
            // @ts-ignore
            next_value[k] = tick_spring(ctx, last_value[k], current_value[k], target_value[k]);
        }
        // @ts-ignore
        return next_value;
    }
    else {
        throw new Error(`Cannot spring ${typeof current_value} values`);
    }
}
function spring(value, opts = {}) {
    const store = writable(value);
    const { stiffness = 0.15, damping = 0.8, precision = 0.01 } = opts;
    let last_time;
    let task;
    let current_token;
    let last_value = value;
    let target_value = value;
    let inv_mass = 1;
    let inv_mass_recovery_rate = 0;
    let cancel_task = false;
    function set(new_value, opts = {}) {
        target_value = new_value;
        const token = current_token = {};
        if (value == null || opts.hard || (spring.stiffness >= 1 && spring.damping >= 1)) {
            cancel_task = true; // cancel any running animation
            last_time = now();
            last_value = new_value;
            store.set(value = target_value);
            return Promise.resolve();
        }
        else if (opts.soft) {
            const rate = opts.soft === true ? .5 : +opts.soft;
            inv_mass_recovery_rate = 1 / (rate * 60);
            inv_mass = 0; // infinite mass, unaffected by spring forces
        }
        if (!task) {
            last_time = now();
            cancel_task = false;
            task = loop(now => {
                if (cancel_task) {
                    cancel_task = false;
                    task = null;
                    return false;
                }
                inv_mass = Math.min(inv_mass + inv_mass_recovery_rate, 1);
                const ctx = {
                    inv_mass,
                    opts: spring,
                    settled: true,
                    dt: (now - last_time) * 60 / 1000
                };
                const next_value = tick_spring(ctx, last_value, value, target_value);
                last_time = now;
                last_value = value;
                store.set(value = next_value);
                if (ctx.settled) {
                    task = null;
                }
                return !ctx.settled;
            });
        }
        return new Promise(fulfil => {
            task.promise.then(() => {
                if (token === current_token)
                    fulfil();
            });
        });
    }
    const spring = {
        set,
        update: (fn, opts) => set(fn(target_value, value), opts),
        subscribe: store.subscribe,
        stiffness,
        damping,
        precision
    };
    return spring;
}

/* src/components/StatusTracker/Loader.svelte generated by Svelte v3.49.0 */

function create_fragment$1(ctx) {
	let div;
	let svg;
	let g0;
	let path0;
	let path1;
	let path2;
	let path3;
	let g1;
	let path4;
	let path5;
	let path6;
	let path7;

	return {
		c() {
			div = element("div");
			svg = svg_element("svg");
			g0 = svg_element("g");
			path0 = svg_element("path");
			path1 = svg_element("path");
			path2 = svg_element("path");
			path3 = svg_element("path");
			g1 = svg_element("g");
			path4 = svg_element("path");
			path5 = svg_element("path");
			path6 = svg_element("path");
			path7 = svg_element("path");
			attr(path0, "d", "M255.926 0.754768L509.702 139.936V221.027L255.926 81.8465V0.754768Z");
			attr(path0, "fill", "#FF7C00");
			attr(path0, "fill-opacity", "0.4");
			attr(path1, "d", "M509.69 139.936L254.981 279.641V361.255L509.69 221.55V139.936Z");
			attr(path1, "fill", "#FF7C00");
			attr(path2, "d", "M0.250138 139.937L254.981 279.641V361.255L0.250138 221.55V139.937Z");
			attr(path2, "fill", "#FF7C00");
			attr(path2, "fill-opacity", "0.4");
			attr(path3, "d", "M255.923 0.232622L0.236328 139.936V221.55L255.923 81.8469V0.232622Z");
			attr(path3, "fill", "#FF7C00");
			set_style(g0, "transform", "translate(" + /*$top*/ ctx[0][0] + "px, " + /*$top*/ ctx[0][1] + "px)");
			attr(path4, "d", "M255.926 141.5L509.702 280.681V361.773L255.926 222.592V141.5Z");
			attr(path4, "fill", "#FF7C00");
			attr(path4, "fill-opacity", "0.4");
			attr(path5, "d", "M509.69 280.679L254.981 420.384V501.998L509.69 362.293V280.679Z");
			attr(path5, "fill", "#FF7C00");
			attr(path6, "d", "M0.250138 280.681L254.981 420.386V502L0.250138 362.295V280.681Z");
			attr(path6, "fill", "#FF7C00");
			attr(path6, "fill-opacity", "0.4");
			attr(path7, "d", "M255.923 140.977L0.236328 280.68V362.294L255.923 222.591V140.977Z");
			attr(path7, "fill", "#FF7C00");
			set_style(g1, "transform", "translate(" + /*$bottom*/ ctx[1][0] + "px, " + /*$bottom*/ ctx[1][1] + "px)");
			attr(svg, "class", "text-xl");
			attr(svg, "width", "5em");
			attr(svg, "height", "5em");
			attr(svg, "viewBox", "-1200 -1200 3000 3000");
			attr(svg, "fill", "none");
			attr(svg, "xmlns", "http://www.w3.org/2000/svg");
			attr(div, "class", "m-12 z-20");
		},
		m(target, anchor) {
			insert(target, div, anchor);
			append(div, svg);
			append(svg, g0);
			append(g0, path0);
			append(g0, path1);
			append(g0, path2);
			append(g0, path3);
			append(svg, g1);
			append(g1, path4);
			append(g1, path5);
			append(g1, path6);
			append(g1, path7);
		},
		p(ctx, [dirty]) {
			if (dirty & /*$top*/ 1) {
				set_style(g0, "transform", "translate(" + /*$top*/ ctx[0][0] + "px, " + /*$top*/ ctx[0][1] + "px)");
			}

			if (dirty & /*$bottom*/ 2) {
				set_style(g1, "transform", "translate(" + /*$bottom*/ ctx[1][0] + "px, " + /*$bottom*/ ctx[1][1] + "px)");
			}
		},
		i: noop,
		o: noop,
		d(detaching) {
			if (detaching) detach(div);
		}
	};
}

function instance$1($$self, $$props, $$invalidate) {
	let $top;
	let $bottom;
	const top = spring([0, 0]);
	component_subscribe($$self, top, value => $$invalidate(0, $top = value));
	const bottom = spring([0, 0]);
	component_subscribe($$self, bottom, value => $$invalidate(1, $bottom = value));
	let dismounted;

	function animate() {
		return new Promise(async res => {
				await Promise.all([top.set([125, 140]), bottom.set([-125, -140])]);
				await Promise.all([top.set([-125, 140]), bottom.set([125, -140])]);
				await Promise.all([top.set([-125, 0]), bottom.set([125, -0])]);
				await Promise.all([top.set([125, 0]), bottom.set([-125, 0])]);
				res();
			});
	}

	async function run() {
		await animate();
		if (!dismounted) run();
	}

	async function loading() {
		await Promise.all([top.set([125, 0]), bottom.set([-125, 0])]);
		run();
	}

	onMount(() => {
		loading();
		return () => dismounted = true;
	});

	return [$top, $bottom, top, bottom];
}

class Loader extends SvelteComponent {
	constructor(options) {
		super();
		init(this, options, instance$1, create_fragment$1, safe_not_equal, {});
	}
}

var StatusTracker_svelte_svelte_type_style_lang = '';

/* src/components/StatusTracker/StatusTracker.svelte generated by Svelte v3.49.0 */

function create_if_block_5(ctx) {
	let span;
	let t1;
	let if_block_anchor;
	let if_block = /*message_visible*/ ctx[8] && create_if_block_6(ctx);

	return {
		c() {
			span = element("span");
			span.textContent = "Error";
			t1 = space();
			if (if_block) if_block.c();
			if_block_anchor = empty();
			attr(span, "class", "error svelte-1ka70lm");
		},
		m(target, anchor) {
			insert(target, span, anchor);
			insert(target, t1, anchor);
			if (if_block) if_block.m(target, anchor);
			insert(target, if_block_anchor, anchor);
		},
		p(ctx, dirty) {
			if (/*message_visible*/ ctx[8]) {
				if (if_block) {
					if_block.p(ctx, dirty);

					if (dirty & /*message_visible*/ 256) {
						transition_in(if_block, 1);
					}
				} else {
					if_block = create_if_block_6(ctx);
					if_block.c();
					transition_in(if_block, 1);
					if_block.m(if_block_anchor.parentNode, if_block_anchor);
				}
			} else if (if_block) {
				if_block.d(1);
				if_block = null;
			}
		},
		i(local) {
			transition_in(if_block);
		},
		o: noop,
		d(detaching) {
			if (detaching) detach(span);
			if (detaching) detach(t1);
			if (if_block) if_block.d(detaching);
			if (detaching) detach(if_block_anchor);
		}
	};
}

// (128:1) {#if status === "pending"}
function create_if_block(ctx) {
	let div0;
	let style_transform = `scaleX(${/*progress*/ ctx[11] || 0})`;
	let t0;
	let div1;
	let t1;
	let t2;
	let loader;
	let t3;
	let if_block2_anchor;
	let current;

	function select_block_type_1(ctx, dirty) {
		if (/*queue_position*/ ctx[1] !== null && /*queue_size*/ ctx[2] !== undefined && /*queue_position*/ ctx[1] >= 0) return create_if_block_3;
		if (/*queue_position*/ ctx[1] === 0) return create_if_block_4;
	}

	let current_block_type = select_block_type_1(ctx);
	let if_block0 = current_block_type && current_block_type(ctx);
	let if_block1 = /*timer*/ ctx[4] && create_if_block_2(ctx);
	loader = new Loader({});
	let if_block2 = !/*timer*/ ctx[4] && create_if_block_1();

	return {
		c() {
			div0 = element("div");
			t0 = space();
			div1 = element("div");
			if (if_block0) if_block0.c();
			t1 = space();
			if (if_block1) if_block1.c();
			t2 = space();
			create_component(loader.$$.fragment);
			t3 = space();
			if (if_block2) if_block2.c();
			if_block2_anchor = empty();
			attr(div0, "class", "progress-bar svelte-1ka70lm");
			set_style(div0, "transform", style_transform, false);
			attr(div1, "class", "meta-text dark:text-gray-400 svelte-1ka70lm");
		},
		m(target, anchor) {
			insert(target, div0, anchor);
			insert(target, t0, anchor);
			insert(target, div1, anchor);
			if (if_block0) if_block0.m(div1, null);
			append(div1, t1);
			if (if_block1) if_block1.m(div1, null);
			insert(target, t2, anchor);
			mount_component(loader, target, anchor);
			insert(target, t3, anchor);
			if (if_block2) if_block2.m(target, anchor);
			insert(target, if_block2_anchor, anchor);
			current = true;
		},
		p(ctx, dirty) {
			if (dirty & /*progress*/ 2048 && style_transform !== (style_transform = `scaleX(${/*progress*/ ctx[11] || 0})`)) {
				set_style(div0, "transform", style_transform, false);
			}

			if (current_block_type === (current_block_type = select_block_type_1(ctx)) && if_block0) {
				if_block0.p(ctx, dirty);
			} else {
				if (if_block0) if_block0.d(1);
				if_block0 = current_block_type && current_block_type(ctx);

				if (if_block0) {
					if_block0.c();
					if_block0.m(div1, t1);
				}
			}

			if (/*timer*/ ctx[4]) {
				if (if_block1) {
					if_block1.p(ctx, dirty);
				} else {
					if_block1 = create_if_block_2(ctx);
					if_block1.c();
					if_block1.m(div1, null);
				}
			} else if (if_block1) {
				if_block1.d(1);
				if_block1 = null;
			}

			if (!/*timer*/ ctx[4]) {
				if (if_block2) ; else {
					if_block2 = create_if_block_1();
					if_block2.c();
					if_block2.m(if_block2_anchor.parentNode, if_block2_anchor);
				}
			} else if (if_block2) {
				if_block2.d(1);
				if_block2 = null;
			}
		},
		i(local) {
			if (current) return;
			transition_in(loader.$$.fragment, local);
			current = true;
		},
		o(local) {
			transition_out(loader.$$.fragment, local);
			current = false;
		},
		d(detaching) {
			if (detaching) detach(div0);
			if (detaching) detach(t0);
			if (detaching) detach(div1);

			if (if_block0) {
				if_block0.d();
			}

			if (if_block1) if_block1.d();
			if (detaching) detach(t2);
			destroy_component(loader, detaching);
			if (detaching) detach(t3);
			if (if_block2) if_block2.d(detaching);
			if (detaching) detach(if_block2_anchor);
		}
	};
}

// (149:2) {#if message_visible}
function create_if_block_6(ctx) {
	let div4;
	let div0;
	let t0;
	let div3;
	let div1;
	let t1;
	let button;
	let t3;
	let div2;
	let t4;
	let div3_intro;
	let mounted;
	let dispose;

	return {
		c() {
			div4 = element("div");
			div0 = element("div");
			t0 = space();
			div3 = element("div");
			div1 = element("div");
			t1 = text("Error\n\t\t\t\t\t\t");
			button = element("button");
			button.textContent = "×";
			t3 = space();
			div2 = element("div");
			t4 = text(/*message*/ ctx[6]);
			attr(div0, "class", "absolute left-0 md:left-auto border-black right-0 top-0 h-96 md:w-1/2 bg-gradient-to-b md:bg-gradient-to-bl from-red-500/5 via-transparent to-transparent");
			attr(button, "class", "ml-auto text-gray-900 text-2xl pr-1");
			attr(div1, "class", "flex items-center bg-gradient-to-r from-red-500/10 to-red-200/10 px-3 py-1 text-lg font-bold text-red-500");
			attr(div2, "class", "px-3 py-3 text-base font-mono");
			attr(div3, "class", "absolute bg-white top-7 left-4 right-4 md:right-8 md:left-auto rounded-xl border border-gray-100 dark:border-gray-800 overflow-hidden shadow-2xl shadow-red-500/10 md:w-96 pointer-events-auto");
			attr(div4, "class", "fixed inset-0 z-[100]");
		},
		m(target, anchor) {
			insert(target, div4, anchor);
			append(div4, div0);
			append(div4, t0);
			append(div4, div3);
			append(div3, div1);
			append(div1, t1);
			append(div1, button);
			append(div3, t3);
			append(div3, div2);
			append(div2, t4);

			if (!mounted) {
				dispose = [
					listen(button, "click", /*close_message*/ ctx[12]),
					listen(div3, "click", stop_propagation(/*click_handler*/ ctx[19]))
				];

				mounted = true;
			}
		},
		p(ctx, dirty) {
			if (dirty & /*message*/ 64) set_data(t4, /*message*/ ctx[6]);
		},
		i(local) {
			if (!div3_intro) {
				add_render_callback(() => {
					div3_intro = create_in_transition(div3, fade, { duration: 100 });
					div3_intro.start();
				});
			}
		},
		o: noop,
		d(detaching) {
			if (detaching) detach(div4);
			mounted = false;
			run_all(dispose);
		}
	};
}

// (133:34) 
function create_if_block_4(ctx) {
	let t;

	return {
		c() {
			t = text("processing |");
		},
		m(target, anchor) {
			insert(target, t, anchor);
		},
		p: noop,
		d(detaching) {
			if (detaching) detach(t);
		}
	};
}

// (131:3) {#if queue_position !== null && queue_size !== undefined && queue_position >= 0}
function create_if_block_3(ctx) {
	let t0;
	let t1_value = /*queue_position*/ ctx[1] + 1 + "";
	let t1;
	let t2;
	let t3;
	let t4;

	return {
		c() {
			t0 = text("queue: ");
			t1 = text(t1_value);
			t2 = text("/");
			t3 = text(/*queue_size*/ ctx[2]);
			t4 = text(" |");
		},
		m(target, anchor) {
			insert(target, t0, anchor);
			insert(target, t1, anchor);
			insert(target, t2, anchor);
			insert(target, t3, anchor);
			insert(target, t4, anchor);
		},
		p(ctx, dirty) {
			if (dirty & /*queue_position*/ 2 && t1_value !== (t1_value = /*queue_position*/ ctx[1] + 1 + "")) set_data(t1, t1_value);
			if (dirty & /*queue_size*/ 4) set_data(t3, /*queue_size*/ ctx[2]);
		},
		d(detaching) {
			if (detaching) detach(t0);
			if (detaching) detach(t1);
			if (detaching) detach(t2);
			if (detaching) detach(t3);
			if (detaching) detach(t4);
		}
	};
}

// (137:3) {#if timer}
function create_if_block_2(ctx) {
	let t0;
	let t1_value = (/*eta*/ ctx[0] ? `/${/*formatted_eta*/ ctx[9]}` : "") + "";
	let t1;

	return {
		c() {
			t0 = text(/*formatted_timer*/ ctx[10]);
			t1 = text(t1_value);
		},
		m(target, anchor) {
			insert(target, t0, anchor);
			insert(target, t1, anchor);
		},
		p(ctx, dirty) {
			if (dirty & /*formatted_timer*/ 1024) set_data(t0, /*formatted_timer*/ ctx[10]);
			if (dirty & /*eta, formatted_eta*/ 513 && t1_value !== (t1_value = (/*eta*/ ctx[0] ? `/${/*formatted_eta*/ ctx[9]}` : "") + "")) set_data(t1, t1_value);
		},
		d(detaching) {
			if (detaching) detach(t0);
			if (detaching) detach(t1);
		}
	};
}

// (144:2) {#if !timer}
function create_if_block_1(ctx) {
	let p;

	return {
		c() {
			p = element("p");
			p.textContent = "Loading...";
			attr(p, "class", "timer svelte-1ka70lm");
		},
		m(target, anchor) {
			insert(target, p, anchor);
		},
		d(detaching) {
			if (detaching) detach(p);
		}
	};
}

function create_fragment(ctx) {
	let div;
	let current_block_type_index;
	let if_block;
	let current;
	const if_block_creators = [create_if_block, create_if_block_5];
	const if_blocks = [];

	function select_block_type(ctx, dirty) {
		if (/*status*/ ctx[3] === "pending") return 0;
		if (/*status*/ ctx[3] === "error") return 1;
		return -1;
	}

	if (~(current_block_type_index = select_block_type(ctx))) {
		if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
	}

	return {
		c() {
			div = element("div");
			if (if_block) if_block.c();
			attr(div, "class", "wrap svelte-1ka70lm");
			toggle_class(div, "opacity-0", !/*status*/ ctx[3] || /*status*/ ctx[3] === "complete");
			toggle_class(div, "cover-bg", /*status*/ ctx[3] === "pending" || /*status*/ ctx[3] === "error");
			toggle_class(div, "generating", /*status*/ ctx[3] === "generating");
			toggle_class(div, "!hidden", !/*visible*/ ctx[5]);
		},
		m(target, anchor) {
			insert(target, div, anchor);

			if (~current_block_type_index) {
				if_blocks[current_block_type_index].m(div, null);
			}

			/*div_binding*/ ctx[20](div);
			current = true;
		},
		p(ctx, [dirty]) {
			let previous_block_index = current_block_type_index;
			current_block_type_index = select_block_type(ctx);

			if (current_block_type_index === previous_block_index) {
				if (~current_block_type_index) {
					if_blocks[current_block_type_index].p(ctx, dirty);
				}
			} else {
				if (if_block) {
					group_outros();

					transition_out(if_blocks[previous_block_index], 1, 1, () => {
						if_blocks[previous_block_index] = null;
					});

					check_outros();
				}

				if (~current_block_type_index) {
					if_block = if_blocks[current_block_type_index];

					if (!if_block) {
						if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
						if_block.c();
					} else {
						if_block.p(ctx, dirty);
					}

					transition_in(if_block, 1);
					if_block.m(div, null);
				} else {
					if_block = null;
				}
			}

			if (dirty & /*status*/ 8) {
				toggle_class(div, "opacity-0", !/*status*/ ctx[3] || /*status*/ ctx[3] === "complete");
			}

			if (dirty & /*status*/ 8) {
				toggle_class(div, "cover-bg", /*status*/ ctx[3] === "pending" || /*status*/ ctx[3] === "error");
			}

			if (dirty & /*status*/ 8) {
				toggle_class(div, "generating", /*status*/ ctx[3] === "generating");
			}

			if (dirty & /*visible*/ 32) {
				toggle_class(div, "!hidden", !/*visible*/ ctx[5]);
			}
		},
		i(local) {
			if (current) return;
			transition_in(if_block);
			current = true;
		},
		o(local) {
			transition_out(if_block);
			current = false;
		},
		d(detaching) {
			if (detaching) detach(div);

			if (~current_block_type_index) {
				if_blocks[current_block_type_index].d();
			}

			/*div_binding*/ ctx[20](null);
		}
	};
}

let items = [];
let called = false;

async function scroll_into_view(el, enable = true) {
	if (window.__gradio_mode__ === "website" || window.__gradio_mode__ !== "app" && enable !== true) {
		return;
	}

	items.push(el);
	if (!called) called = true; else return;
	await tick();

	requestAnimationFrame(() => {
		let min = [0, 0];

		for (let i = 0; i < items.length; i++) {
			const element = items[i];
			const box = element.getBoundingClientRect();

			if (i === 0 || box.top + window.scrollY <= min[0]) {
				min[0] = box.top + window.scrollY;
				min[1] = i;
			}
		}

		window.scrollTo({ top: min[0] - 20, behavior: "smooth" });
		called = false;
		items = [];
	});
}

function instance($$self, $$props, $$invalidate) {
	let progress;
	let formatted_timer;
	let $app_state;
	component_subscribe($$self, app_state, $$value => $$invalidate(18, $app_state = $$value));
	let { eta = null } = $$props;
	let { queue = false } = $$props;
	let { queue_position } = $$props;
	let { queue_size } = $$props;
	let { status } = $$props;
	let { scroll_to_output = false } = $$props;
	let { timer = true } = $$props;
	let { visible = true } = $$props;
	let { message = null } = $$props;
	let el;
	let _timer = false;
	let timer_start = 0;
	let timer_diff = 0;
	let old_eta = null;
	let message_visible = false;

	const start_timer = () => {
		$$invalidate(15, timer_start = performance.now());
		$$invalidate(16, timer_diff = 0);
		_timer = true;
		run();
	}; // timer = setInterval(, 100);

	function run() {
		requestAnimationFrame(() => {
			$$invalidate(16, timer_diff = (performance.now() - timer_start) / 1000);
			if (_timer) run();
		});
	}

	const stop_timer = () => {
		$$invalidate(16, timer_diff = 0);
		if (!_timer) return;
		_timer = false;
	};

	onDestroy(() => {
		if (_timer) stop_timer();
	});

	let formatted_eta = null;

	const close_message = () => {
		$$invalidate(8, message_visible = false);
	};

	function click_handler(event) {
		bubble.call(this, $$self, event);
	}

	function div_binding($$value) {
		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
			el = $$value;
			$$invalidate(7, el);
		});
	}

	$$self.$$set = $$props => {
		if ('eta' in $$props) $$invalidate(0, eta = $$props.eta);
		if ('queue' in $$props) $$invalidate(13, queue = $$props.queue);
		if ('queue_position' in $$props) $$invalidate(1, queue_position = $$props.queue_position);
		if ('queue_size' in $$props) $$invalidate(2, queue_size = $$props.queue_size);
		if ('status' in $$props) $$invalidate(3, status = $$props.status);
		if ('scroll_to_output' in $$props) $$invalidate(14, scroll_to_output = $$props.scroll_to_output);
		if ('timer' in $$props) $$invalidate(4, timer = $$props.timer);
		if ('visible' in $$props) $$invalidate(5, visible = $$props.visible);
		if ('message' in $$props) $$invalidate(6, message = $$props.message);
	};

	$$self.$$.update = () => {
		if ($$self.$$.dirty & /*eta, old_eta, queue, timer_start*/ 172033) {
			{
				if (eta === null) {
					$$invalidate(0, eta = old_eta);
				} else if (queue) {
					$$invalidate(0, eta = (performance.now() - timer_start) / 1000 + eta);
				}

				if (eta != null) {
					$$invalidate(9, formatted_eta = eta.toFixed(1));
					$$invalidate(17, old_eta = eta);
				}
			}
		}

		if ($$self.$$.dirty & /*eta, timer_diff*/ 65537) {
			$$invalidate(11, progress = eta === null || eta <= 0 || !timer_diff
			? null
			: Math.min(timer_diff / eta, 1));
		}

		if ($$self.$$.dirty & /*status*/ 8) {
			{
				if (status === "pending") {
					start_timer();
				} else {
					stop_timer();
				}
			}
		}

		if ($$self.$$.dirty & /*el, scroll_to_output, status, $app_state*/ 278664) {
			el && scroll_to_output && (status === "pending" || status === "complete") && scroll_into_view(el, $app_state.autoscroll);
		}

		if ($$self.$$.dirty & /*status, message*/ 72) {
			{
				close_message();

				if (status === "error" && message) {
					$$invalidate(8, message_visible = true);
				}
			}
		}

		if ($$self.$$.dirty & /*timer_diff*/ 65536) {
			$$invalidate(10, formatted_timer = timer_diff.toFixed(1));
		}
	};

	return [
		eta,
		queue_position,
		queue_size,
		status,
		timer,
		visible,
		message,
		el,
		message_visible,
		formatted_eta,
		formatted_timer,
		progress,
		close_message,
		queue,
		scroll_to_output,
		timer_start,
		timer_diff,
		old_eta,
		$app_state,
		click_handler,
		div_binding
	];
}

class StatusTracker extends SvelteComponent {
	constructor(options) {
		super();

		init(this, options, instance, create_fragment, safe_not_equal, {
			eta: 0,
			queue: 13,
			queue_position: 1,
			queue_size: 2,
			status: 3,
			scroll_to_output: 14,
			timer: 4,
			visible: 5,
			message: 6
		});
	}
}

const QUEUE_FULL_MSG = "This application is too busy. Keep trying!";
const BROKEN_CONNECTION_MSG = "Connection errored out.";
async function post_data(url, body) {
  try {
    var response = await fetch(url, {
      method: "POST",
      body: JSON.stringify(body),
      headers: { "Content-Type": "application/json" }
    });
  } catch (e) {
    return [{ error: BROKEN_CONNECTION_MSG }, 500];
  }
  const output = await response.json();
  return [output, response.status];
}
const ws_map = /* @__PURE__ */ new Map();
const fn = (session_hash, api_endpoint, is_space) => async ({
  action,
  payload,
  queue,
  backend_fn,
  frontend_fn,
  output_data,
  queue_callback,
  loading_status
}) => {
  const fn_index = payload.fn_index;
  payload.session_hash = session_hash;
  if (frontend_fn !== void 0) {
    payload.data = await frontend_fn(payload.data.concat(output_data));
  }
  if (backend_fn == false) {
    return payload;
  }
  if (queue && ["predict", "interpret"].includes(action)) {
    let send_message = function(fn2, data) {
      ws_map.get(fn2)?.send(JSON.stringify(data));
    };
    loading_status.update(fn_index, "pending", queue, null, null, null, null);
    var ws_endpoint = api_endpoint === "api/" ? location.href : api_endpoint;
    var ws_protocol = ws_endpoint.startsWith("https") ? "wss:" : "ws:";
    if (false) {
      const SPACE_REGEX = /embed\/(.*)\/\+/g;
      var ws_path = Array.from(ws_endpoint.matchAll(SPACE_REGEX))[0][1].concat("/");
      var ws_host = "spaces.huggingface.tech/";
    } else {
      var ws_path = location.pathname === "/" ? "/" : location.pathname;
      var ws_host = location.origin === "http://localhost:3000" ? "".replace("http://", "").slice(0, -1) : location.host;
    }
    const WS_ENDPOINT = `${ws_protocol}//${ws_host}${ws_path}queue/join`;
    var websocket = new WebSocket(WS_ENDPOINT);
    ws_map.set(fn_index, websocket);
    websocket.onclose = (evt) => {
      if (!evt.wasClean) {
        loading_status.update(fn_index, "error", queue, null, null, null, BROKEN_CONNECTION_MSG);
      }
    };
    websocket.onmessage = async function(event) {
      const data = JSON.parse(event.data);
      switch (data.msg) {
        case "send_data":
          send_message(fn_index, payload);
          break;
        case "queue_full":
          loading_status.update(fn_index, "error", queue, null, null, null, QUEUE_FULL_MSG);
          websocket.close();
          return;
        case "estimation":
          loading_status.update(fn_index, get_store_value(loading_status)[data.fn_index]?.status || "pending", queue, data.queue_size, data.rank, data.rank_eta, null);
          break;
        case "process_generating":
          loading_status.update(fn_index, data.success ? "generating" : "error", queue, null, null, data.output.average_duration, !data.success ? data.output.error : null);
          if (data.success) {
            queue_callback(data.output);
          }
          break;
        case "process_completed":
          loading_status.update(fn_index, data.success ? "complete" : "error", queue, null, null, data.output.average_duration, !data.success ? data.output.error : null);
          if (data.success) {
            queue_callback(data.output);
          }
          websocket.close();
          return;
        case "process_starts":
          loading_status.update(fn_index, "pending", queue, data.rank, 0, null, null);
          break;
      }
    };
  } else {
    loading_status.update(fn_index, "pending", queue, null, null, null, null);
    var [output, status_code] = await post_data(api_endpoint + action + "/", {
      ...payload,
      session_hash
    });
    if (status_code == 200) {
      loading_status.update(fn_index, "complete", queue, null, null, output.average_duration, null);
    } else {
      loading_status.update(fn_index, "error", queue, null, null, null, output.error);
      throw output.error || "API Error";
    }
    return output;
  }
};

var global$1 = "/*\n! tailwindcss v3.1.6 | MIT License | https://tailwindcss.com\n*//*\n1. Prevent padding and border from affecting element width. (https://github.com/mozdevs/cssremedy/issues/4)\n2. Allow adding a border to an element by just adding a border-width. (https://github.com/tailwindcss/tailwindcss/pull/116)\n*/\n\n*,\n::before,\n::after {\n  box-sizing: border-box; /* 1 */\n  border-width: 0; /* 2 */\n  border-style: solid; /* 2 */\n  border-color: #e5e7eb; /* 2 */\n}\n\n::before,\n::after {\n  --tw-content: '';\n}\n\n/*\n1. Use a consistent sensible line-height in all browsers.\n2. Prevent adjustments of font size after orientation changes in iOS.\n3. Use a more readable tab size.\n4. Use the user's configured `sans` font-family by default.\n*/\n\nhtml {\n  line-height: 1.5; /* 1 */\n  -webkit-text-size-adjust: 100%; /* 2 */\n  -moz-tab-size: 4; /* 3 */\n  tab-size: 4; /* 3 */\n  font-family: Source Sans Pro, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, \"Helvetica Neue\", Arial, \"Noto Sans\", sans-serif, \"Apple Color Emoji\", \"Segoe UI Emoji\", \"Segoe UI Symbol\", \"Noto Color Emoji\"; /* 4 */\n}\n\n/*\n1. Remove the margin in all browsers.\n2. Inherit line-height from `html` so users can set them as a class directly on the `html` element.\n*/\n\nbody {\n  margin: 0; /* 1 */\n  line-height: inherit; /* 2 */\n}\n\n/*\n1. Add the correct height in Firefox.\n2. Correct the inheritance of border color in Firefox. (https://bugzilla.mozilla.org/show_bug.cgi?id=190655)\n3. Ensure horizontal rules are visible by default.\n*/\n\nhr {\n  height: 0; /* 1 */\n  color: inherit; /* 2 */\n  border-top-width: 1px; /* 3 */\n}\n\n/*\nAdd the correct text decoration in Chrome, Edge, and Safari.\n*/\n\nabbr:where([title]) {\n  text-decoration: underline dotted;\n}\n\n/*\nRemove the default font size and weight for headings.\n*/\n\nh1,\nh2,\nh3,\nh4,\nh5,\nh6 {\n  font-size: inherit;\n  font-weight: inherit;\n}\n\n/*\nReset links to optimize for opt-in styling instead of opt-out.\n*/\n\na {\n  color: inherit;\n  text-decoration: inherit;\n}\n\n/*\nAdd the correct font weight in Edge and Safari.\n*/\n\nb,\nstrong {\n  font-weight: bolder;\n}\n\n/*\n1. Use the user's configured `mono` font family by default.\n2. Correct the odd `em` font sizing in all browsers.\n*/\n\ncode,\nkbd,\nsamp,\npre {\n  font-family: IBM Plex Mono, ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, \"Liberation Mono\", \"Courier New\", monospace; /* 1 */\n  font-size: 1em; /* 2 */\n}\n\n/*\nAdd the correct font size in all browsers.\n*/\n\nsmall {\n  font-size: 80%;\n}\n\n/*\nPrevent `sub` and `sup` elements from affecting the line height in all browsers.\n*/\n\nsub,\nsup {\n  font-size: 75%;\n  line-height: 0;\n  position: relative;\n  vertical-align: baseline;\n}\n\nsub {\n  bottom: -0.25em;\n}\n\nsup {\n  top: -0.5em;\n}\n\n/*\n1. Remove text indentation from table contents in Chrome and Safari. (https://bugs.chromium.org/p/chromium/issues/detail?id=999088, https://bugs.webkit.org/show_bug.cgi?id=201297)\n2. Correct table border color inheritance in all Chrome and Safari. (https://bugs.chromium.org/p/chromium/issues/detail?id=935729, https://bugs.webkit.org/show_bug.cgi?id=195016)\n3. Remove gaps between table borders by default.\n*/\n\ntable {\n  text-indent: 0; /* 1 */\n  border-color: inherit; /* 2 */\n  border-collapse: collapse; /* 3 */\n}\n\n/*\n1. Change the font styles in all browsers.\n2. Remove the margin in Firefox and Safari.\n3. Remove default padding in all browsers.\n*/\n\nbutton,\ninput,\noptgroup,\nselect,\ntextarea {\n  font-family: inherit; /* 1 */\n  font-size: 100%; /* 1 */\n  font-weight: inherit; /* 1 */\n  line-height: inherit; /* 1 */\n  color: inherit; /* 1 */\n  margin: 0; /* 2 */\n  padding: 0; /* 3 */\n}\n\n/*\nRemove the inheritance of text transform in Edge and Firefox.\n*/\n\nbutton,\nselect {\n  text-transform: none;\n}\n\n/*\n1. Correct the inability to style clickable types in iOS and Safari.\n2. Remove default button styles.\n*/\n\nbutton,\n[type='button'],\n[type='reset'],\n[type='submit'] {\n  -webkit-appearance: button; /* 1 */\n  background-color: transparent; /* 2 */\n  background-image: none; /* 2 */\n}\n\n/*\nUse the modern Firefox focus style for all focusable elements.\n*/\n\n:-moz-focusring {\n  outline: auto;\n}\n\n/*\nRemove the additional `:invalid` styles in Firefox. (https://github.com/mozilla/gecko-dev/blob/2f9eacd9d3d995c937b4251a5557d95d494c9be1/layout/style/res/forms.css#L728-L737)\n*/\n\n:-moz-ui-invalid {\n  box-shadow: none;\n}\n\n/*\nAdd the correct vertical alignment in Chrome and Firefox.\n*/\n\nprogress {\n  vertical-align: baseline;\n}\n\n/*\nCorrect the cursor style of increment and decrement buttons in Safari.\n*/\n\n::-webkit-inner-spin-button,\n::-webkit-outer-spin-button {\n  height: auto;\n}\n\n/*\n1. Correct the odd appearance in Chrome and Safari.\n2. Correct the outline style in Safari.\n*/\n\n[type='search'] {\n  -webkit-appearance: textfield; /* 1 */\n  outline-offset: -2px; /* 2 */\n}\n\n/*\nRemove the inner padding in Chrome and Safari on macOS.\n*/\n\n::-webkit-search-decoration {\n  -webkit-appearance: none;\n}\n\n/*\n1. Correct the inability to style clickable types in iOS and Safari.\n2. Change font properties to `inherit` in Safari.\n*/\n\n::-webkit-file-upload-button {\n  -webkit-appearance: button; /* 1 */\n  font: inherit; /* 2 */\n}\n\n/*\nAdd the correct display in Chrome and Safari.\n*/\n\nsummary {\n  display: list-item;\n}\n\n/*\nRemoves the default spacing and border for appropriate elements.\n*/\n\nblockquote,\ndl,\ndd,\nh1,\nh2,\nh3,\nh4,\nh5,\nh6,\nhr,\nfigure,\np,\npre {\n  margin: 0;\n}\n\nfieldset {\n  margin: 0;\n  padding: 0;\n}\n\nlegend {\n  padding: 0;\n}\n\nol,\nul,\nmenu {\n  list-style: none;\n  margin: 0;\n  padding: 0;\n}\n\n/*\nPrevent resizing textareas horizontally by default.\n*/\n\ntextarea {\n  resize: vertical;\n}\n\n/*\n1. Reset the default placeholder opacity in Firefox. (https://github.com/tailwindlabs/tailwindcss/issues/3300)\n2. Set the default placeholder color to the user's configured gray 400 color.\n*/\n\ninput::placeholder,\ntextarea::placeholder {\n  opacity: 1; /* 1 */\n  color: #9ca3af; /* 2 */\n}\n\n/*\nSet the default cursor for buttons.\n*/\n\nbutton,\n[role=\"button\"] {\n  cursor: pointer;\n}\n\n/*\nMake sure disabled buttons don't get the pointer cursor.\n*/\n:disabled {\n  cursor: default;\n}\n\n/*\n1. Make replaced elements `display: block` by default. (https://github.com/mozdevs/cssremedy/issues/14)\n2. Add `vertical-align: middle` to align replaced elements more sensibly by default. (https://github.com/jensimmons/cssremedy/issues/14#issuecomment-634934210)\n   This can trigger a poorly considered lint error in some tools but is included by design.\n*/\n\nimg,\nsvg,\nvideo,\ncanvas,\naudio,\niframe,\nembed,\nobject {\n  display: block; /* 1 */\n  vertical-align: middle; /* 2 */\n}\n\n/*\nConstrain images and videos to the parent width and preserve their intrinsic aspect ratio. (https://github.com/mozdevs/cssremedy/issues/14)\n*/\n\nimg,\nvideo {\n  max-width: 100%;\n  height: auto;\n}\n\n[type='text'],[type='email'],[type='url'],[type='password'],[type='number'],[type='date'],[type='datetime-local'],[type='month'],[type='search'],[type='tel'],[type='time'],[type='week'],[multiple],textarea,select {\n  appearance: none;\n  background-color: #fff;\n  border-color: #6b7280;\n  border-width: 1px;\n  border-radius: 0px;\n  padding-top: 0.5rem;\n  padding-right: 0.75rem;\n  padding-bottom: 0.5rem;\n  padding-left: 0.75rem;\n  font-size: 1rem;\n  line-height: 1.5rem;\n  --tw-shadow: 0 0 #0000;\n}\n\n[type='text']:focus, [type='email']:focus, [type='url']:focus, [type='password']:focus, [type='number']:focus, [type='date']:focus, [type='datetime-local']:focus, [type='month']:focus, [type='search']:focus, [type='tel']:focus, [type='time']:focus, [type='week']:focus, [multiple]:focus, textarea:focus, select:focus {\n  outline: 2px solid transparent;\n  outline-offset: 2px;\n  --tw-ring-inset: var(--tw-empty,/*!*/ /*!*/);\n  --tw-ring-offset-width: 0px;\n  --tw-ring-offset-color: #fff;\n  --tw-ring-color: #2563eb;\n  --tw-ring-offset-shadow: var(--tw-ring-inset) 0 0 0 var(--tw-ring-offset-width) var(--tw-ring-offset-color);\n  --tw-ring-shadow: var(--tw-ring-inset) 0 0 0 calc(1px + var(--tw-ring-offset-width)) var(--tw-ring-color);\n  box-shadow: var(--tw-ring-offset-shadow), var(--tw-ring-shadow), var(--tw-shadow);\n  border-color: #2563eb;\n}\n\ninput::placeholder,textarea::placeholder {\n  color: #6b7280;\n  opacity: 1;\n}\n\n::-webkit-datetime-edit-fields-wrapper {\n  padding: 0;\n}\n\n::-webkit-date-and-time-value {\n  min-height: 1.5em;\n}\n\n::-webkit-datetime-edit,::-webkit-datetime-edit-year-field,::-webkit-datetime-edit-month-field,::-webkit-datetime-edit-day-field,::-webkit-datetime-edit-hour-field,::-webkit-datetime-edit-minute-field,::-webkit-datetime-edit-second-field,::-webkit-datetime-edit-millisecond-field,::-webkit-datetime-edit-meridiem-field {\n  padding-top: 0;\n  padding-bottom: 0;\n}\n\nselect {\n  background-image: url(\"data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e\");\n  background-position: right 0.5rem center;\n  background-repeat: no-repeat;\n  background-size: 1.5em 1.5em;\n  padding-right: 2.5rem;\n  color-adjust: exact;\n}\n\n[multiple] {\n  background-image: initial;\n  background-position: initial;\n  background-repeat: unset;\n  background-size: initial;\n  padding-right: 0.75rem;\n  color-adjust: unset;\n}\n\n[type='checkbox'],[type='radio'] {\n  appearance: none;\n  padding: 0;\n  color-adjust: exact;\n  display: inline-block;\n  vertical-align: middle;\n  background-origin: border-box;\n  user-select: none;\n  flex-shrink: 0;\n  height: 1rem;\n  width: 1rem;\n  color: #2563eb;\n  background-color: #fff;\n  border-color: #6b7280;\n  border-width: 1px;\n  --tw-shadow: 0 0 #0000;\n}\n\n[type='checkbox'] {\n  border-radius: 0px;\n}\n\n[type='radio'] {\n  border-radius: 100%;\n}\n\n[type='checkbox']:focus,[type='radio']:focus {\n  outline: 2px solid transparent;\n  outline-offset: 2px;\n  --tw-ring-inset: var(--tw-empty,/*!*/ /*!*/);\n  --tw-ring-offset-width: 2px;\n  --tw-ring-offset-color: #fff;\n  --tw-ring-color: #2563eb;\n  --tw-ring-offset-shadow: var(--tw-ring-inset) 0 0 0 var(--tw-ring-offset-width) var(--tw-ring-offset-color);\n  --tw-ring-shadow: var(--tw-ring-inset) 0 0 0 calc(2px + var(--tw-ring-offset-width)) var(--tw-ring-color);\n  box-shadow: var(--tw-ring-offset-shadow), var(--tw-ring-shadow), var(--tw-shadow);\n}\n\n[type='checkbox']:checked,[type='radio']:checked {\n  border-color: transparent;\n  background-color: currentColor;\n  background-size: 100% 100%;\n  background-position: center;\n  background-repeat: no-repeat;\n}\n\n[type='checkbox']:checked {\n  background-image: url(\"data:image/svg+xml,%3csvg viewBox='0 0 16 16' fill='white' xmlns='http://www.w3.org/2000/svg'%3e%3cpath d='M12.207 4.793a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0l-2-2a1 1 0 011.414-1.414L6.5 9.086l4.293-4.293a1 1 0 011.414 0z'/%3e%3c/svg%3e\");\n}\n\n[type='radio']:checked {\n  background-image: url(\"data:image/svg+xml,%3csvg viewBox='0 0 16 16' fill='white' xmlns='http://www.w3.org/2000/svg'%3e%3ccircle cx='8' cy='8' r='3'/%3e%3c/svg%3e\");\n}\n\n[type='checkbox']:checked:hover,[type='checkbox']:checked:focus,[type='radio']:checked:hover,[type='radio']:checked:focus {\n  border-color: transparent;\n  background-color: currentColor;\n}\n\n[type='checkbox']:indeterminate {\n  background-image: url(\"data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 16 16'%3e%3cpath stroke='white' stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M4 8h8'/%3e%3c/svg%3e\");\n  border-color: transparent;\n  background-color: currentColor;\n  background-size: 100% 100%;\n  background-position: center;\n  background-repeat: no-repeat;\n}\n\n[type='checkbox']:indeterminate:hover,[type='checkbox']:indeterminate:focus {\n  border-color: transparent;\n  background-color: currentColor;\n}\n\n[type='file'] {\n  background: unset;\n  border-color: inherit;\n  border-width: 0;\n  border-radius: 0;\n  padding: 0;\n  font-size: unset;\n  line-height: inherit;\n}\n\n[type='file']:focus {\n  outline: 1px auto -webkit-focus-ring-color;\n}\n\t.bg-gray-950 {\n\t\tbackground-color: #0b0f19;\n\t}\n\t.dark:bg-gray-950 {\n\t}\n\n\t.dark {\n\t\tbackground-color: #0b0f19;\n\t\t--tw-bg-opacity: 1;\n\t\tbackground-color: rgb(11 15 25 / var(--tw-bg-opacity));\n\t\t--tw-text-opacity: 1;\n\t\tcolor: rgb(209 213 219 / var(--tw-text-opacity));\n\t}\n\t.dark .text-gray-500, \n\t.dark .text-gray-600 {\n  --tw-text-opacity: 1;\n  color: rgb(209 213 219 / var(--tw-text-opacity));\n}\n\t.dark .\\!text-gray-500, \n\t.dark .text-gray-600 {\n  --tw-text-opacity: 1;\n  color: rgb(209 213 219 / var(--tw-text-opacity));\n}\n\n\t.dark .text-gray-700, \n\t.dark .text-gray-800, \n\t.dark .text-gray-900 {\n  --tw-text-opacity: 1;\n  color: rgb(229 231 235 / var(--tw-text-opacity));\n}\n\n\t.dark .\\!text-gray-700, \n\t.dark .text-gray-800, \n\t.dark .text-gray-900 {\n  --tw-text-opacity: 1;\n  color: rgb(229 231 235 / var(--tw-text-opacity));\n}\n\n\t.dark .text-gray-700, \n\t.dark .\\!text-gray-800, \n\t.dark .text-gray-900 {\n  --tw-text-opacity: 1;\n  color: rgb(229 231 235 / var(--tw-text-opacity));\n}\n\n\t.dark .border, \n\t.dark .border-gray-100, \n\t.dark .border-gray-200, \n\t.dark .border-gray-300 {\n  --tw-border-opacity: 1;\n  border-color: rgb(55 65 81 / var(--tw-border-opacity));\n}\n\n\t.dark .\\!border, \n\t.dark .border-gray-100, \n\t.dark .border-gray-200, \n\t.dark .border-gray-300 {\n  --tw-border-opacity: 1;\n  border-color: rgb(55 65 81 / var(--tw-border-opacity));\n}\n\n\t.dark .border, \n\t.dark .border-gray-100, \n\t.dark .border-gray-200, \n\t.dark .\\!border-gray-300 {\n  --tw-border-opacity: 1;\n  border-color: rgb(55 65 81 / var(--tw-border-opacity));\n}\n\n\t.dark .bg-white {\n\t\tbackground-color: #0b0f19;\n\t\t--tw-bg-opacity: 1;\n\t\tbackground-color: rgb(11 15 25 / var(--tw-bg-opacity));\n\t}\n\n\t.dark .bg-gray-50 {\n  --tw-bg-opacity: 1;\n  background-color: rgb(17 24 39 / var(--tw-bg-opacity));\n}\n\n\t.dark .bg-gray-200 {\n  --tw-bg-opacity: 1;\n  background-color: rgb(31 41 55 / var(--tw-bg-opacity));\n}\n\n\t.dark .\\!bg-gray-200 {\n  --tw-bg-opacity: 1;\n  background-color: rgb(31 41 55 / var(--tw-bg-opacity));\n}\n\n\t.unequal-height {\n  align-items: flex-start;\n}\n\n*, ::before, ::after {\n  --tw-border-spacing-x: 0;\n  --tw-border-spacing-y: 0;\n  --tw-translate-x: 0;\n  --tw-translate-y: 0;\n  --tw-rotate: 0;\n  --tw-skew-x: 0;\n  --tw-skew-y: 0;\n  --tw-scale-x: 1;\n  --tw-scale-y: 1;\n  --tw-pan-x:  ;\n  --tw-pan-y:  ;\n  --tw-pinch-zoom:  ;\n  --tw-scroll-snap-strictness: proximity;\n  --tw-ordinal:  ;\n  --tw-slashed-zero:  ;\n  --tw-numeric-figure:  ;\n  --tw-numeric-spacing:  ;\n  --tw-numeric-fraction:  ;\n  --tw-ring-inset:  ;\n  --tw-ring-offset-width: 0px;\n  --tw-ring-offset-color: #fff;\n  --tw-ring-color: rgb(59 130 246 / 0.5);\n  --tw-ring-offset-shadow: 0 0 #0000;\n  --tw-ring-shadow: 0 0 #0000;\n  --tw-shadow: 0 0 #0000;\n  --tw-shadow-colored: 0 0 #0000;\n  --tw-blur:  ;\n  --tw-brightness:  ;\n  --tw-contrast:  ;\n  --tw-grayscale:  ;\n  --tw-hue-rotate:  ;\n  --tw-invert:  ;\n  --tw-saturate:  ;\n  --tw-sepia:  ;\n  --tw-drop-shadow:  ;\n  --tw-backdrop-blur:  ;\n  --tw-backdrop-brightness:  ;\n  --tw-backdrop-contrast:  ;\n  --tw-backdrop-grayscale:  ;\n  --tw-backdrop-hue-rotate:  ;\n  --tw-backdrop-invert:  ;\n  --tw-backdrop-opacity:  ;\n  --tw-backdrop-saturate:  ;\n  --tw-backdrop-sepia:  ;\n}\n\n::backdrop {\n  --tw-border-spacing-x: 0;\n  --tw-border-spacing-y: 0;\n  --tw-translate-x: 0;\n  --tw-translate-y: 0;\n  --tw-rotate: 0;\n  --tw-skew-x: 0;\n  --tw-skew-y: 0;\n  --tw-scale-x: 1;\n  --tw-scale-y: 1;\n  --tw-pan-x:  ;\n  --tw-pan-y:  ;\n  --tw-pinch-zoom:  ;\n  --tw-scroll-snap-strictness: proximity;\n  --tw-ordinal:  ;\n  --tw-slashed-zero:  ;\n  --tw-numeric-figure:  ;\n  --tw-numeric-spacing:  ;\n  --tw-numeric-fraction:  ;\n  --tw-ring-inset:  ;\n  --tw-ring-offset-width: 0px;\n  --tw-ring-offset-color: #fff;\n  --tw-ring-color: rgb(59 130 246 / 0.5);\n  --tw-ring-offset-shadow: 0 0 #0000;\n  --tw-ring-shadow: 0 0 #0000;\n  --tw-shadow: 0 0 #0000;\n  --tw-shadow-colored: 0 0 #0000;\n  --tw-blur:  ;\n  --tw-brightness:  ;\n  --tw-contrast:  ;\n  --tw-grayscale:  ;\n  --tw-hue-rotate:  ;\n  --tw-invert:  ;\n  --tw-saturate:  ;\n  --tw-sepia:  ;\n  --tw-drop-shadow:  ;\n  --tw-backdrop-blur:  ;\n  --tw-backdrop-brightness:  ;\n  --tw-backdrop-contrast:  ;\n  --tw-backdrop-grayscale:  ;\n  --tw-backdrop-hue-rotate:  ;\n  --tw-backdrop-invert:  ;\n  --tw-backdrop-opacity:  ;\n  --tw-backdrop-saturate:  ;\n  --tw-backdrop-sepia:  ;\n}\n.container {\n  width: 100%;\n}\n.\\!container {\n  width: 100% !important;\n}\n@media (min-width: 640px) {\n\n  .container {\n    max-width: 640px;\n  }\n\n  .\\!container {\n    max-width: 640px !important;\n  }\n}\n@media (min-width: 768px) {\n\n  .container {\n    max-width: 768px;\n  }\n\n  .\\!container {\n    max-width: 768px !important;\n  }\n}\n@media (min-width: 1024px) {\n\n  .container {\n    max-width: 1024px;\n  }\n\n  .\\!container {\n    max-width: 1024px !important;\n  }\n}\n@media (min-width: 1280px) {\n\n  .container {\n    max-width: 1280px;\n  }\n\n  .\\!container {\n    max-width: 1280px !important;\n  }\n}\n@media (min-width: 1536px) {\n\n  .container {\n    max-width: 1536px;\n  }\n\n  .\\!container {\n    max-width: 1536px !important;\n  }\n}\n.gr-form > .gr-block {\n  border-radius: 0px;\n  border-width: 0px;\n  --tw-shadow: 0 0 #0000 !important;\n  --tw-shadow-colored: 0 0 #0000 !important;\n  box-shadow: var(--tw-ring-offset-shadow, 0 0 #0000), var(--tw-ring-shadow, 0 0 #0000), var(--tw-shadow) !important;\n}\n.row > *,\n\t.row > .gr-form > * {\n\t\tmin-width: min(160px, 100%);\n\t\tflex: 1 1 0%;\n\t}\n.col > *, \n\t.col > .gr-form > * {\n  width: 100%;\n}\n.scroll-hide {\n\t\t-ms-overflow-style: none;\n\t\tscrollbar-width: none;\n\t}\n.scroll-hide::-webkit-scrollbar {\n\t\tdisplay: none;\n\t}\n.sr-only {\n  position: absolute;\n  width: 1px;\n  height: 1px;\n  padding: 0;\n  margin: -1px;\n  overflow: hidden;\n  clip: rect(0, 0, 0, 0);\n  white-space: nowrap;\n  border-width: 0;\n}\n.pointer-events-none {\n  pointer-events: none;\n}\n.pointer-events-auto {\n  pointer-events: auto;\n}\n.visible {\n  visibility: visible;\n}\n.\\!visible {\n  visibility: visible !important;\n}\n.invisible {\n  visibility: hidden;\n}\n.static {\n  position: static;\n}\n.fixed {\n  position: fixed;\n}\n.absolute {\n  position: absolute;\n}\n.\\!absolute {\n  position: absolute !important;\n}\n.relative {\n  position: relative;\n}\n.sticky {\n  position: sticky;\n}\n.inset-0 {\n  top: 0px;\n  right: 0px;\n  bottom: 0px;\n  left: 0px;\n}\n.inset-2 {\n  top: 0.5rem;\n  right: 0.5rem;\n  bottom: 0.5rem;\n  left: 0.5rem;\n}\n.inset-x-0 {\n  left: 0px;\n  right: 0px;\n}\n.bottom-\\[50px\\] {\n  bottom: 50px;\n}\n.bottom-0 {\n  bottom: 0px;\n}\n.left-0 {\n  left: 0px;\n}\n.right-0 {\n  right: 0px;\n}\n.top-0 {\n  top: 0px;\n}\n.top-7 {\n  top: 1.75rem;\n}\n.left-4 {\n  left: 1rem;\n}\n.right-4 {\n  right: 1rem;\n}\n.top-2 {\n  top: 0.5rem;\n}\n.right-2 {\n  right: 0.5rem;\n}\n.top-10 {\n  top: 2.5rem;\n}\n.top-\\[2px\\] {\n  top: 2px;\n}\n.right-6 {\n  right: 1.5rem;\n}\n.top-6 {\n  top: 1.5rem;\n}\n.top-\\[-3px\\] {\n  top: -3px;\n}\n.bottom-2 {\n  bottom: 0.5rem;\n}\n.isolate {\n  isolation: isolate;\n}\n.z-10 {\n  z-index: 10;\n}\n.z-\\[5\\] {\n  z-index: 5;\n}\n.z-20 {\n  z-index: 20;\n}\n.z-\\[100\\] {\n  z-index: 100;\n}\n.z-50 {\n  z-index: 50;\n}\n.z-40 {\n  z-index: 40;\n}\n.m-12 {\n  margin: 3rem;\n}\n.\\!m-0 {\n  margin: 0px !important;\n}\n.m-auto {\n  margin: auto;\n}\n.m-1 {\n  margin: 0.25rem;\n}\n.m-1\\.5 {\n  margin: 0.375rem;\n}\n.m-0 {\n  margin: 0px;\n}\n.mx-auto {\n  margin-left: auto;\n  margin-right: auto;\n}\n.my-2 {\n  margin-top: 0.5rem;\n  margin-bottom: 0.5rem;\n}\n.my-4 {\n  margin-top: 1rem;\n  margin-bottom: 1rem;\n}\n.mx-2 {\n  margin-left: 0.5rem;\n  margin-right: 0.5rem;\n}\n.mx-3 {\n  margin-left: 0.75rem;\n  margin-right: 0.75rem;\n}\n.\\!mt-0 {\n  margin-top: 0px !important;\n}\n.\\!mb-0 {\n  margin-bottom: 0px !important;\n}\n.\\!ml-0 {\n  margin-left: 0px !important;\n}\n.\\!mr-0 {\n  margin-right: 0px !important;\n}\n.mb-6 {\n  margin-bottom: 1.5rem;\n}\n.mb-2 {\n  margin-bottom: 0.5rem;\n}\n.ml-1 {\n  margin-left: 0.25rem;\n}\n.mt-6 {\n  margin-top: 1.5rem;\n}\n.mb-4 {\n  margin-bottom: 1rem;\n}\n.ml-0\\.5 {\n  margin-left: 0.125rem;\n}\n.ml-0 {\n  margin-left: 0px;\n}\n.mt-8 {\n  margin-top: 2rem;\n}\n.mt-4 {\n  margin-top: 1rem;\n}\n.mr-1 {\n  margin-right: 0.25rem;\n}\n.ml-auto {\n  margin-left: auto;\n}\n.mr-2 {\n  margin-right: 0.5rem;\n}\n.mt-7 {\n  margin-top: 1.75rem;\n}\n.mt-3 {\n  margin-top: 0.75rem;\n}\n.mb-7 {\n  margin-bottom: 1.75rem;\n}\n.ml-2 {\n  margin-left: 0.5rem;\n}\n.mr-\\[-4px\\] {\n  margin-right: -4px;\n}\n.mt-\\[0\\.05rem\\] {\n  margin-top: 0.05rem;\n}\n.mb-3 {\n  margin-bottom: 0.75rem;\n}\n.mr-0\\.5 {\n  margin-right: 0.125rem;\n}\n.mr-0 {\n  margin-right: 0px;\n}\n.mt-10 {\n  margin-top: 2.5rem;\n}\n.mb-1 {\n  margin-bottom: 0.25rem;\n}\n.-mb-\\[2px\\] {\n  margin-bottom: -2px;\n}\n.\\!mr-4 {\n  margin-right: 1rem !important;\n}\n.\\!mb-4 {\n  margin-bottom: 1rem !important;\n}\n.mt-1 {\n  margin-top: 0.25rem;\n}\n.box-border {\n  box-sizing: border-box;\n}\n.block {\n  display: block;\n}\n.\\!block {\n  display: block !important;\n}\n.inline-block {\n  display: inline-block;\n}\n.inline {\n  display: inline;\n}\n.flex {\n  display: flex;\n}\n.inline-flex {\n  display: inline-flex;\n}\n.table {\n  display: table;\n}\n.grid {\n  display: grid;\n}\n.contents {\n  display: contents;\n}\n.hidden {\n  display: none;\n}\n.\\!hidden {\n  display: none !important;\n}\n.aspect-square {\n  aspect-ratio: 1 / 1;\n}\n.h-\\[22px\\] {\n  height: 22px;\n}\n.h-full {\n  height: 100%;\n}\n.h-5 {\n  height: 1.25rem;\n}\n.h-\\[60px\\] {\n  height: 60px;\n}\n.\\!h-9 {\n  height: 2.25rem !important;\n}\n.h-7 {\n  height: 1.75rem;\n}\n.h-96 {\n  height: 24rem;\n}\n.h-0 {\n  height: 0px;\n}\n.h-\\[12px\\] {\n  height: 12px;\n}\n.h-\\[60\\%\\] {\n  height: 60%;\n}\n.h-1\\.5 {\n  height: 0.375rem;\n}\n.h-1 {\n  height: 0.25rem;\n}\n.h-14 {\n  height: 3.5rem;\n}\n.h-6 {\n  height: 1.5rem;\n}\n.h-\\[40vh\\] {\n  height: 40vh;\n}\n.h-60 {\n  height: 15rem;\n}\n.h-10 {\n  height: 2.5rem;\n}\n.h-2\\/4 {\n  height: 50%;\n}\n.h-4 {\n  height: 1rem;\n}\n.h-20 {\n  height: 5rem;\n}\n.h-2 {\n  height: 0.5rem;\n}\n.h-\\[50\\%\\] {\n  height: 50%;\n}\n.h-3 {\n  height: 0.75rem;\n}\n.max-h-\\[55vh\\] {\n  max-height: 55vh;\n}\n.max-h-96 {\n  max-height: 24rem;\n}\n.max-h-60 {\n  max-height: 15rem;\n}\n.max-h-\\[30rem\\] {\n  max-height: 30rem;\n}\n.max-h-\\[15rem\\] {\n  max-height: 15rem;\n}\n.min-h-\\[350px\\] {\n  min-height: 350px;\n}\n.min-h-screen {\n  min-height: 100vh;\n}\n.min-h-\\[15rem\\] {\n  min-height: 15rem;\n}\n.min-h-\\[6rem\\] {\n  min-height: 6rem;\n}\n.min-h-\\[8rem\\] {\n  min-height: 8rem;\n}\n.min-h-\\[200px\\] {\n  min-height: 200px;\n}\n.min-h-\\[16rem\\] {\n  min-height: 16rem;\n}\n.min-h-\\[2\\.3rem\\] {\n  min-height: 2.3rem;\n}\n.min-h-\\[10rem\\] {\n  min-height: 10rem;\n}\n.w-full {\n  width: 100%;\n}\n.w-1\\/2 {\n  width: 50%;\n}\n.\\!w-9 {\n  width: 2.25rem !important;\n}\n.w-\\[12px\\] {\n  width: 12px;\n}\n.w-5 {\n  width: 1.25rem;\n}\n.w-\\[60\\%\\] {\n  width: 60%;\n}\n.w-1\\.5 {\n  width: 0.375rem;\n}\n.w-1 {\n  width: 0.25rem;\n}\n.w-6 {\n  width: 1.5rem;\n}\n.w-3\\/12 {\n  width: 25%;\n}\n.w-5\\/12 {\n  width: 41.666667%;\n}\n.w-10 {\n  width: 2.5rem;\n}\n.w-2\\/4 {\n  width: 50%;\n}\n.w-0 {\n  width: 0px;\n}\n.w-4 {\n  width: 1rem;\n}\n.\\!w-full {\n  width: 100% !important;\n}\n.w-20 {\n  width: 5rem;\n}\n.w-2 {\n  width: 0.5rem;\n}\n.w-3 {\n  width: 0.75rem;\n}\n.max-w-full {\n  max-width: 100%;\n}\n.max-w-none {\n  max-width: none;\n}\n.\\!flex-none {\n  flex: none !important;\n}\n.flex-1 {\n  flex: 1 1 0%;\n}\n.flex-none {\n  flex: none;\n}\n.shrink-0 {\n  flex-shrink: 0;\n}\n.shrink {\n  flex-shrink: 1;\n}\n.flex-grow {\n  flex-grow: 1;\n}\n.table-auto {\n  table-layout: auto;\n}\n.border-collapse {\n  border-collapse: collapse;\n}\n.origin-left {\n  transform-origin: left;\n}\n.translate-x-px {\n  --tw-translate-x: 1px;\n  transform: translate(var(--tw-translate-x), var(--tw-translate-y)) rotate(var(--tw-rotate)) skewX(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y));\n}\n.rotate-90 {\n  --tw-rotate: 90deg;\n  transform: translate(var(--tw-translate-x), var(--tw-translate-y)) rotate(var(--tw-rotate)) skewX(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y));\n}\n.scale-90 {\n  --tw-scale-x: .9;\n  --tw-scale-y: .9;\n  transform: translate(var(--tw-translate-x), var(--tw-translate-y)) rotate(var(--tw-rotate)) skewX(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y));\n}\n.scale-x-\\[-1\\] {\n  --tw-scale-x: -1;\n  transform: translate(var(--tw-translate-x), var(--tw-translate-y)) rotate(var(--tw-rotate)) skewX(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y));\n}\n.-scale-y-\\[1\\] {\n  --tw-scale-y: -1;\n  transform: translate(var(--tw-translate-x), var(--tw-translate-y)) rotate(var(--tw-rotate)) skewX(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y));\n}\n.transform {\n  transform: translate(var(--tw-translate-x), var(--tw-translate-y)) rotate(var(--tw-rotate)) skewX(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y));\n}\n.\\!transform {\n  transform: translate(var(--tw-translate-x), var(--tw-translate-y)) rotate(var(--tw-rotate)) skewX(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y)) !important;\n}\n@keyframes ping {\n\n  75%, 100% {\n    transform: scale(2);\n    opacity: 0;\n  }\n}\n.animate-ping {\n  animation: ping 1s cubic-bezier(0, 0, 0.2, 1) infinite;\n}\n.cursor-pointer {\n  cursor: pointer;\n}\n.\\!cursor-not-allowed {\n  cursor: not-allowed !important;\n}\n.cursor-default {\n  cursor: default;\n}\n.cursor-crosshair {\n  cursor: crosshair;\n}\n.cursor-move {\n  cursor: move;\n}\n.cursor-col-resize {\n  cursor: col-resize;\n}\n.cursor-row-resize {\n  cursor: row-resize;\n}\n.cursor-ns-resize {\n  cursor: ns-resize;\n}\n.cursor-ew-resize {\n  cursor: ew-resize;\n}\n.cursor-sw-resize {\n  cursor: sw-resize;\n}\n.cursor-s-resize {\n  cursor: s-resize;\n}\n.cursor-se-resize {\n  cursor: se-resize;\n}\n.cursor-w-resize {\n  cursor: w-resize;\n}\n.cursor-e-resize {\n  cursor: e-resize;\n}\n.cursor-nw-resize {\n  cursor: nw-resize;\n}\n.cursor-n-resize {\n  cursor: n-resize;\n}\n.cursor-ne-resize {\n  cursor: ne-resize;\n}\n.cursor-grab {\n  cursor: grab;\n}\n.touch-none {\n  touch-action: none;\n}\n.resize {\n  resize: both;\n}\n.appearance-none {\n  appearance: none;\n}\n.grid-cols-1 {\n  grid-template-columns: repeat(1, minmax(0, 1fr));\n}\n.grid-cols-2 {\n  grid-template-columns: repeat(2, minmax(0, 1fr));\n}\n.grid-cols-3 {\n  grid-template-columns: repeat(3, minmax(0, 1fr));\n}\n.grid-cols-4 {\n  grid-template-columns: repeat(4, minmax(0, 1fr));\n}\n.grid-cols-5 {\n  grid-template-columns: repeat(5, minmax(0, 1fr));\n}\n.grid-cols-6 {\n  grid-template-columns: repeat(6, minmax(0, 1fr));\n}\n.grid-cols-7 {\n  grid-template-columns: repeat(7, minmax(0, 1fr));\n}\n.grid-cols-8 {\n  grid-template-columns: repeat(8, minmax(0, 1fr));\n}\n.grid-cols-9 {\n  grid-template-columns: repeat(9, minmax(0, 1fr));\n}\n.grid-cols-10 {\n  grid-template-columns: repeat(10, minmax(0, 1fr));\n}\n.grid-cols-11 {\n  grid-template-columns: repeat(11, minmax(0, 1fr));\n}\n.grid-cols-12 {\n  grid-template-columns: repeat(12, minmax(0, 1fr));\n}\n.flex-row {\n  flex-direction: row;\n}\n.flex-col {\n  flex-direction: column;\n}\n.flex-wrap {\n  flex-wrap: wrap;\n}\n.items-start {\n  align-items: flex-start;\n}\n.items-end {\n  align-items: flex-end;\n}\n.items-center {\n  align-items: center;\n}\n.items-baseline {\n  align-items: baseline;\n}\n.justify-end {\n  justify-content: flex-end;\n}\n.justify-center {\n  justify-content: center;\n}\n.justify-between {\n  justify-content: space-between;\n}\n.gap-6 {\n  gap: 1.5rem;\n}\n.gap-3 {\n  gap: 0.75rem;\n}\n.gap-4 {\n  gap: 1rem;\n}\n.gap-2 {\n  gap: 0.5rem;\n}\n.gap-px {\n  gap: 1px;\n}\n.gap-1\\.5 {\n  gap: 0.375rem;\n}\n.gap-1 {\n  gap: 0.25rem;\n}\n.space-y-2 > :not([hidden]) ~ :not([hidden]) {\n  --tw-space-y-reverse: 0;\n  margin-top: calc(0.5rem * calc(1 - var(--tw-space-y-reverse)));\n  margin-bottom: calc(0.5rem * var(--tw-space-y-reverse));\n}\n.space-y-4 > :not([hidden]) ~ :not([hidden]) {\n  --tw-space-y-reverse: 0;\n  margin-top: calc(1rem * calc(1 - var(--tw-space-y-reverse)));\n  margin-bottom: calc(1rem * var(--tw-space-y-reverse));\n}\n.space-x-2 > :not([hidden]) ~ :not([hidden]) {\n  --tw-space-x-reverse: 0;\n  margin-right: calc(0.5rem * var(--tw-space-x-reverse));\n  margin-left: calc(0.5rem * calc(1 - var(--tw-space-x-reverse)));\n}\n.space-x-4 > :not([hidden]) ~ :not([hidden]) {\n  --tw-space-x-reverse: 0;\n  margin-right: calc(1rem * var(--tw-space-x-reverse));\n  margin-left: calc(1rem * calc(1 - var(--tw-space-x-reverse)));\n}\n.space-x-1 > :not([hidden]) ~ :not([hidden]) {\n  --tw-space-x-reverse: 0;\n  margin-right: calc(0.25rem * var(--tw-space-x-reverse));\n  margin-left: calc(0.25rem * calc(1 - var(--tw-space-x-reverse)));\n}\n.divide-x > :not([hidden]) ~ :not([hidden]) {\n  --tw-divide-x-reverse: 0;\n  border-right-width: calc(1px * var(--tw-divide-x-reverse));\n  border-left-width: calc(1px * calc(1 - var(--tw-divide-x-reverse)));\n}\n.place-self-start {\n  place-self: start;\n}\n.self-start {\n  align-self: flex-start;\n}\n.overflow-hidden {\n  overflow: hidden;\n}\n.\\!overflow-visible {\n  overflow: visible !important;\n}\n.overflow-x-auto {\n  overflow-x: auto;\n}\n.overflow-y-auto {\n  overflow-y: auto;\n}\n.overflow-x-scroll {\n  overflow-x: scroll;\n}\n.overflow-y-scroll {\n  overflow-y: scroll;\n}\n.truncate {\n  overflow: hidden;\n  text-overflow: ellipsis;\n  white-space: nowrap;\n}\n.whitespace-nowrap {\n  white-space: nowrap;\n}\n.whitespace-pre-wrap {\n  white-space: pre-wrap;\n}\n.break-all {\n  word-break: break-all;\n}\n.rounded {\n  border-radius: 0.25rem;\n}\n.rounded-lg {\n  border-radius: 0.5rem;\n}\n.rounded-xl {\n  border-radius: 0.75rem;\n}\n.rounded-full {\n  border-radius: 9999px;\n}\n.rounded-sm {\n  border-radius: 0.125rem;\n}\n.rounded-\\[22px\\] {\n  border-radius: 22px;\n}\n.rounded-none {\n  border-radius: 0px;\n}\n.\\!rounded-lg {\n  border-radius: 0.5rem !important;\n}\n.\\!rounded-none {\n  border-radius: 0px !important;\n}\n.rounded-md {\n  border-radius: 0.375rem;\n}\n.rounded-t-lg {\n  border-top-left-radius: 0.5rem;\n  border-top-right-radius: 0.5rem;\n}\n.\\!rounded-br-none {\n  border-bottom-right-radius: 0px !important;\n}\n.\\!rounded-br-lg {\n  border-bottom-right-radius: 0.5rem !important;\n}\n.\\!rounded-bl-none {\n  border-bottom-left-radius: 0px !important;\n}\n.\\!rounded-bl-lg {\n  border-bottom-left-radius: 0.5rem !important;\n}\n.\\!rounded-tr-none {\n  border-top-right-radius: 0px !important;\n}\n.\\!rounded-tr-lg {\n  border-top-right-radius: 0.5rem !important;\n}\n.\\!rounded-tl-none {\n  border-top-left-radius: 0px !important;\n}\n.\\!rounded-tl-lg {\n  border-top-left-radius: 0.5rem !important;\n}\n.rounded-tl-lg {\n  border-top-left-radius: 0.5rem;\n}\n.rounded-br-lg {\n  border-bottom-right-radius: 0.5rem;\n}\n.rounded-br-none {\n  border-bottom-right-radius: 0px;\n}\n.rounded-bl-none {\n  border-bottom-left-radius: 0px;\n}\n.rounded-bl-lg {\n  border-bottom-left-radius: 0.5rem;\n}\n.rounded-tr-lg {\n  border-top-right-radius: 0.5rem;\n}\n.border {\n  border-width: 1px;\n}\n.border-2 {\n  border-width: 2px;\n}\n.\\!border-0 {\n  border-width: 0px !important;\n}\n.border-0 {\n  border-width: 0px;\n}\n.border-4 {\n  border-width: 4px;\n}\n.\\!border {\n  border-width: 1px !important;\n}\n.\\!border-t-0 {\n  border-top-width: 0px !important;\n}\n.\\!border-b-0 {\n  border-bottom-width: 0px !important;\n}\n.\\!border-l-0 {\n  border-left-width: 0px !important;\n}\n.\\!border-r-0 {\n  border-right-width: 0px !important;\n}\n.border-b {\n  border-bottom-width: 1px;\n}\n.border-t {\n  border-top-width: 1px;\n}\n.border-l {\n  border-left-width: 1px;\n}\n.border-r {\n  border-right-width: 1px;\n}\n.border-t-0 {\n  border-top-width: 0px;\n}\n.border-b-2 {\n  border-bottom-width: 2px;\n}\n.border-b-0 {\n  border-bottom-width: 0px;\n}\n.border-solid {\n  border-style: solid;\n}\n.border-dashed {\n  border-style: dashed;\n}\n.\\!border-none {\n  border-style: none !important;\n}\n.border-gray-100 {\n  --tw-border-opacity: 1;\n  border-color: rgb(243 244 246 / var(--tw-border-opacity));\n}\n.border-gray-200 {\n  --tw-border-opacity: 1;\n  border-color: rgb(229 231 235 / var(--tw-border-opacity));\n}\n.border-black {\n  --tw-border-opacity: 1;\n  border-color: rgb(0 0 0 / var(--tw-border-opacity));\n}\n.border-orange-500 {\n  --tw-border-opacity: 1;\n  border-color: rgb(255 124 0 / var(--tw-border-opacity));\n}\n.border-gray-300 {\n  --tw-border-opacity: 1;\n  border-color: rgb(209 213 219 / var(--tw-border-opacity));\n}\n.border-green-400 {\n  --tw-border-opacity: 1;\n  border-color: rgb(74 222 128 / var(--tw-border-opacity));\n}\n.border-gray-200\\/60 {\n  border-color: rgb(229 231 235 / 0.6);\n}\n.border-transparent {\n  border-color: transparent;\n}\n.border-white {\n  --tw-border-opacity: 1;\n  border-color: rgb(255 255 255 / var(--tw-border-opacity));\n}\n.border-indigo-600 {\n  --tw-border-opacity: 1;\n  border-color: rgb(79 70 229 / var(--tw-border-opacity));\n}\n.border-red-200 {\n  --tw-border-opacity: 1;\n  border-color: rgb(254 202 202 / var(--tw-border-opacity));\n}\n.border-gray-400 {\n  --tw-border-opacity: 1;\n  border-color: rgb(156 163 175 / var(--tw-border-opacity));\n}\n.border-orange-200 {\n  --tw-border-opacity: 1;\n  border-color: rgb(255 216 180 / var(--tw-border-opacity));\n}\n.\\!border-red-300 {\n  --tw-border-opacity: 1 !important;\n  border-color: rgb(252 165 165 / var(--tw-border-opacity)) !important;\n}\n.\\!border-yellow-300 {\n  --tw-border-opacity: 1 !important;\n  border-color: rgb(253 224 71 / var(--tw-border-opacity)) !important;\n}\n.\\!border-green-300 {\n  --tw-border-opacity: 1 !important;\n  border-color: rgb(134 239 172 / var(--tw-border-opacity)) !important;\n}\n.\\!border-blue-300 {\n  --tw-border-opacity: 1 !important;\n  border-color: rgb(147 197 253 / var(--tw-border-opacity)) !important;\n}\n.\\!border-purple-300 {\n  --tw-border-opacity: 1 !important;\n  border-color: rgb(216 180 254 / var(--tw-border-opacity)) !important;\n}\n.\\!border-gray-300 {\n  --tw-border-opacity: 1 !important;\n  border-color: rgb(209 213 219 / var(--tw-border-opacity)) !important;\n}\n.\\!border-pink-300 {\n  --tw-border-opacity: 1 !important;\n  border-color: rgb(249 168 212 / var(--tw-border-opacity)) !important;\n}\n.border-b-slate-300 {\n  --tw-border-opacity: 1;\n  border-bottom-color: rgb(203 213 225 / var(--tw-border-opacity));\n}\n.border-r-slate-300 {\n  --tw-border-opacity: 1;\n  border-right-color: rgb(203 213 225 / var(--tw-border-opacity));\n}\n.\\!bg-red-200 {\n  --tw-bg-opacity: 1 !important;\n  background-color: rgb(254 202 202 / var(--tw-bg-opacity)) !important;\n}\n.\\!bg-green-200 {\n  --tw-bg-opacity: 1 !important;\n  background-color: rgb(187 247 208 / var(--tw-bg-opacity)) !important;\n}\n.\\!bg-blue-200 {\n  --tw-bg-opacity: 1 !important;\n  background-color: rgb(191 219 254 / var(--tw-bg-opacity)) !important;\n}\n.\\!bg-yellow-200 {\n  --tw-bg-opacity: 1 !important;\n  background-color: rgb(254 240 138 / var(--tw-bg-opacity)) !important;\n}\n.\\!bg-purple-200 {\n  --tw-bg-opacity: 1 !important;\n  background-color: rgb(233 213 255 / var(--tw-bg-opacity)) !important;\n}\n.\\!bg-teal-200 {\n  --tw-bg-opacity: 1 !important;\n  background-color: rgb(153 246 228 / var(--tw-bg-opacity)) !important;\n}\n.\\!bg-orange-200 {\n  --tw-bg-opacity: 1 !important;\n  background-color: rgb(255 216 180 / var(--tw-bg-opacity)) !important;\n}\n.\\!bg-cyan-200 {\n  --tw-bg-opacity: 1 !important;\n  background-color: rgb(165 243 252 / var(--tw-bg-opacity)) !important;\n}\n.\\!bg-lime-200 {\n  --tw-bg-opacity: 1 !important;\n  background-color: rgb(217 249 157 / var(--tw-bg-opacity)) !important;\n}\n.\\!bg-pink-200 {\n  --tw-bg-opacity: 1 !important;\n  background-color: rgb(251 207 232 / var(--tw-bg-opacity)) !important;\n}\n.\\!bg-gray-200 {\n  --tw-bg-opacity: 1 !important;\n  background-color: rgb(229 231 235 / var(--tw-bg-opacity)) !important;\n}\n.bg-gray-50 {\n  --tw-bg-opacity: 1;\n  background-color: rgb(249 250 251 / var(--tw-bg-opacity));\n}\n.bg-gray-200 {\n  --tw-bg-opacity: 1;\n  background-color: rgb(229 231 235 / var(--tw-bg-opacity));\n}\n.bg-gray-100 {\n  --tw-bg-opacity: 1;\n  background-color: rgb(243 244 246 / var(--tw-bg-opacity));\n}\n.bg-gray-950 {\n  --tw-bg-opacity: 1;\n  background-color: rgb(11 15 25 / var(--tw-bg-opacity));\n}\n.bg-amber-500 {\n  --tw-bg-opacity: 1;\n  background-color: rgb(245 158 11 / var(--tw-bg-opacity));\n}\n.bg-white\\/90 {\n  background-color: rgb(255 255 255 / 0.9);\n}\n.bg-white {\n  --tw-bg-opacity: 1;\n  background-color: rgb(255 255 255 / var(--tw-bg-opacity));\n}\n.bg-slate-100 {\n  --tw-bg-opacity: 1;\n  background-color: rgb(241 245 249 / var(--tw-bg-opacity));\n}\n.bg-red-500\\/10 {\n  background-color: rgb(239 68 68 / 0.1);\n}\n.bg-red-500\\/5 {\n  background-color: rgb(239 68 68 / 0.05);\n}\n.\\!bg-red-500\\/10 {\n  background-color: rgb(239 68 68 / 0.1) !important;\n}\n.bg-red-400 {\n  --tw-bg-opacity: 1;\n  background-color: rgb(248 113 113 / var(--tw-bg-opacity));\n}\n.bg-red-500 {\n  --tw-bg-opacity: 1;\n  background-color: rgb(239 68 68 / var(--tw-bg-opacity));\n}\n.bg-black\\/90 {\n  background-color: rgb(0 0 0 / 0.9);\n}\n.bg-transparent {\n  background-color: transparent;\n}\n.bg-orange-50 {\n  --tw-bg-opacity: 1;\n  background-color: rgb(255 242 229 / var(--tw-bg-opacity));\n}\n.bg-green-400 {\n  --tw-bg-opacity: 1;\n  background-color: rgb(74 222 128 / var(--tw-bg-opacity));\n}\n.bg-gray-300 {\n  --tw-bg-opacity: 1;\n  background-color: rgb(209 213 219 / var(--tw-bg-opacity));\n}\n.bg-indigo-500 {\n  --tw-bg-opacity: 1;\n  background-color: rgb(99 102 241 / var(--tw-bg-opacity));\n}\n.bg-indigo-400 {\n  --tw-bg-opacity: 1;\n  background-color: rgb(129 140 248 / var(--tw-bg-opacity));\n}\n.bg-indigo-600 {\n  --tw-bg-opacity: 1;\n  background-color: rgb(79 70 229 / var(--tw-bg-opacity));\n}\n.bg-amber-100 {\n  --tw-bg-opacity: 1;\n  background-color: rgb(254 243 199 / var(--tw-bg-opacity));\n}\n.bg-blue-400 {\n  --tw-bg-opacity: 1;\n  background-color: rgb(96 165 250 / var(--tw-bg-opacity));\n}\n.bg-gray-400 {\n  --tw-bg-opacity: 1;\n  background-color: rgb(156 163 175 / var(--tw-bg-opacity));\n}\n.\\!bg-transparent {\n  background-color: transparent !important;\n}\n.\\!bg-red-100 {\n  --tw-bg-opacity: 1 !important;\n  background-color: rgb(254 226 226 / var(--tw-bg-opacity)) !important;\n}\n.\\!bg-yellow-100 {\n  --tw-bg-opacity: 1 !important;\n  background-color: rgb(254 249 195 / var(--tw-bg-opacity)) !important;\n}\n.\\!bg-green-100 {\n  --tw-bg-opacity: 1 !important;\n  background-color: rgb(220 252 231 / var(--tw-bg-opacity)) !important;\n}\n.\\!bg-blue-100 {\n  --tw-bg-opacity: 1 !important;\n  background-color: rgb(219 234 254 / var(--tw-bg-opacity)) !important;\n}\n.\\!bg-purple-100 {\n  --tw-bg-opacity: 1 !important;\n  background-color: rgb(243 232 255 / var(--tw-bg-opacity)) !important;\n}\n.\\!bg-gray-100 {\n  --tw-bg-opacity: 1 !important;\n  background-color: rgb(243 244 246 / var(--tw-bg-opacity)) !important;\n}\n.\\!bg-pink-100 {\n  --tw-bg-opacity: 1 !important;\n  background-color: rgb(252 231 243 / var(--tw-bg-opacity)) !important;\n}\n.bg-black {\n  --tw-bg-opacity: 1;\n  background-color: rgb(0 0 0 / var(--tw-bg-opacity));\n}\n.bg-slate-800 {\n  --tw-bg-opacity: 1;\n  background-color: rgb(30 41 59 / var(--tw-bg-opacity));\n}\n.bg-amber-600 {\n  --tw-bg-opacity: 1;\n  background-color: rgb(217 119 6 / var(--tw-bg-opacity));\n}\n.bg-opacity-20 {\n  --tw-bg-opacity: 0.2;\n}\n.bg-opacity-80 {\n  --tw-bg-opacity: 0.8;\n}\n.bg-gradient-to-b {\n  background-image: linear-gradient(to bottom, var(--tw-gradient-stops));\n}\n.bg-gradient-to-r {\n  background-image: linear-gradient(to right, var(--tw-gradient-stops));\n}\n.bg-gradient-to-br {\n  background-image: linear-gradient(to bottom right, var(--tw-gradient-stops));\n}\n.bg-gradient-to-t {\n  background-image: linear-gradient(to top, var(--tw-gradient-stops));\n}\n.bg-gradient-to-tr {\n  background-image: linear-gradient(to top right, var(--tw-gradient-stops));\n}\n.from-red-500\\/5 {\n  --tw-gradient-from: rgb(239 68 68 / 0.05);\n  --tw-gradient-to: rgb(239 68 68 / 0);\n  --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to);\n}\n.from-red-500\\/10 {\n  --tw-gradient-from: rgb(239 68 68 / 0.1);\n  --tw-gradient-to: rgb(239 68 68 / 0);\n  --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to);\n}\n.from-orange-400 {\n  --tw-gradient-from: #FF9633;\n  --tw-gradient-to: rgb(255 150 51 / 0);\n  --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to);\n}\n.from-gray-50 {\n  --tw-gradient-from: #f9fafb;\n  --tw-gradient-to: rgb(249 250 251 / 0);\n  --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to);\n}\n.from-gray-100 {\n  --tw-gradient-from: #f3f4f6;\n  --tw-gradient-to: rgb(243 244 246 / 0);\n  --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to);\n}\n.from-red-200 {\n  --tw-gradient-from: #fecaca;\n  --tw-gradient-to: rgb(254 202 202 / 0);\n  --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to);\n}\n.from-indigo-200 {\n  --tw-gradient-from: #c7d2fe;\n  --tw-gradient-to: rgb(199 210 254 / 0);\n  --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to);\n}\n.from-red-50 {\n  --tw-gradient-from: #fef2f2;\n  --tw-gradient-to: rgb(254 242 242 / 0);\n  --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to);\n}\n.from-red-500 {\n  --tw-gradient-from: #ef4444;\n  --tw-gradient-to: rgb(239 68 68 / 0);\n  --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to);\n}\n.from-blue-400 {\n  --tw-gradient-from: #60a5fa;\n  --tw-gradient-to: rgb(96 165 250 / 0);\n  --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to);\n}\n.from-gray-400 {\n  --tw-gradient-from: #9ca3af;\n  --tw-gradient-to: rgb(156 163 175 / 0);\n  --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to);\n}\n.from-orange-200\\/70 {\n  --tw-gradient-from: rgb(255 216 180 / 0.7);\n  --tw-gradient-to: rgb(255 216 180 / 0);\n  --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to);\n}\n.from-gray-100\\/70 {\n  --tw-gradient-from: rgb(243 244 246 / 0.7);\n  --tw-gradient-to: rgb(243 244 246 / 0);\n  --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to);\n}\n.\\!from-red-100 {\n  --tw-gradient-from: #fee2e2 !important;\n  --tw-gradient-to: rgb(254 226 226 / 0) !important;\n  --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to) !important;\n}\n.\\!from-yellow-100 {\n  --tw-gradient-from: #fef9c3 !important;\n  --tw-gradient-to: rgb(254 249 195 / 0) !important;\n  --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to) !important;\n}\n.\\!from-green-100 {\n  --tw-gradient-from: #dcfce7 !important;\n  --tw-gradient-to: rgb(220 252 231 / 0) !important;\n  --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to) !important;\n}\n.\\!from-blue-100 {\n  --tw-gradient-from: #dbeafe !important;\n  --tw-gradient-to: rgb(219 234 254 / 0) !important;\n  --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to) !important;\n}\n.\\!from-purple-100 {\n  --tw-gradient-from: #f3e8ff !important;\n  --tw-gradient-to: rgb(243 232 255 / 0) !important;\n  --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to) !important;\n}\n.\\!from-gray-100 {\n  --tw-gradient-from: #f3f4f6 !important;\n  --tw-gradient-to: rgb(243 244 246 / 0) !important;\n  --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to) !important;\n}\n.\\!from-pink-100 {\n  --tw-gradient-from: #fce7f3 !important;\n  --tw-gradient-to: rgb(252 231 243 / 0) !important;\n  --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to) !important;\n}\n.from-\\[rgba\\(255\\2c 255\\2c 255\\2c 0\\)\\] {\n  --tw-gradient-from: rgba(255,255,255,0);\n  --tw-gradient-to: rgb(255 255 255 / 0);\n  --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to);\n}\n.from-amber-400 {\n  --tw-gradient-from: #fbbf24;\n  --tw-gradient-to: rgb(251 191 36 / 0);\n  --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to);\n}\n.via-transparent {\n  --tw-gradient-to: rgb(0 0 0 / 0);\n  --tw-gradient-stops: var(--tw-gradient-from), transparent, var(--tw-gradient-to);\n}\n.to-transparent {\n  --tw-gradient-to: transparent;\n}\n.to-red-200\\/10 {\n  --tw-gradient-to: rgb(254 202 202 / 0.1);\n}\n.to-orange-200 {\n  --tw-gradient-to: #FFD8B4;\n}\n.to-white {\n  --tw-gradient-to: #fff;\n}\n.to-gray-100 {\n  --tw-gradient-to: #f3f4f6;\n}\n.to-gray-50 {\n  --tw-gradient-to: #f9fafb;\n}\n.to-red-50 {\n  --tw-gradient-to: #fef2f2;\n}\n.to-indigo-500 {\n  --tw-gradient-to: #6366f1;\n}\n.to-amber-100 {\n  --tw-gradient-to: #fef3c7;\n}\n.to-amber-400 {\n  --tw-gradient-to: #fbbf24;\n}\n.to-green-300 {\n  --tw-gradient-to: #86efac;\n}\n.to-gray-300 {\n  --tw-gradient-to: #d1d5db;\n}\n.to-orange-300\\/80 {\n  --tw-gradient-to: rgb(255 176 102 / 0.8);\n}\n.to-gray-200\\/80 {\n  --tw-gradient-to: rgb(229 231 235 / 0.8);\n}\n.\\!to-red-200 {\n  --tw-gradient-to: #fecaca !important;\n}\n.\\!to-yellow-200 {\n  --tw-gradient-to: #fef08a !important;\n}\n.\\!to-green-200 {\n  --tw-gradient-to: #bbf7d0 !important;\n}\n.\\!to-blue-200 {\n  --tw-gradient-to: #bfdbfe !important;\n}\n.\\!to-purple-200 {\n  --tw-gradient-to: #e9d5ff !important;\n}\n.\\!to-gray-200 {\n  --tw-gradient-to: #e5e7eb !important;\n}\n.\\!to-pink-200 {\n  --tw-gradient-to: #fbcfe8 !important;\n}\n.to-amber-500 {\n  --tw-gradient-to: #f59e0b;\n}\n.fill-current {\n  fill: currentColor;\n}\n.object-contain {\n  object-fit: contain;\n}\n.object-cover {\n  object-fit: cover;\n}\n.object-fill {\n  object-fit: fill;\n}\n.p-6 {\n  padding: 1.5rem;\n}\n.p-4 {\n  padding: 1rem;\n}\n.p-2 {\n  padding: 0.5rem;\n}\n.p-3 {\n  padding: 0.75rem;\n}\n.p-1 {\n  padding: 0.25rem;\n}\n.p-0 {\n  padding: 0px;\n}\n.p-2\\.5 {\n  padding: 0.625rem;\n}\n.\\!p-0 {\n  padding: 0px !important;\n}\n.px-2 {\n  padding-left: 0.5rem;\n  padding-right: 0.5rem;\n}\n.py-0\\.5 {\n  padding-top: 0.125rem;\n  padding-bottom: 0.125rem;\n}\n.py-0 {\n  padding-top: 0px;\n  padding-bottom: 0px;\n}\n.px-4 {\n  padding-left: 1rem;\n  padding-right: 1rem;\n}\n.py-6 {\n  padding-top: 1.5rem;\n  padding-bottom: 1.5rem;\n}\n.py-2 {\n  padding-top: 0.5rem;\n  padding-bottom: 0.5rem;\n}\n.px-3 {\n  padding-left: 0.75rem;\n  padding-right: 0.75rem;\n}\n.py-1 {\n  padding-top: 0.25rem;\n  padding-bottom: 0.25rem;\n}\n.py-3 {\n  padding-top: 0.75rem;\n  padding-bottom: 0.75rem;\n}\n.py-1\\.5 {\n  padding-top: 0.375rem;\n  padding-bottom: 0.375rem;\n}\n.px-1 {\n  padding-left: 0.25rem;\n  padding-right: 0.25rem;\n}\n.px-\\[0\\.325rem\\] {\n  padding-left: 0.325rem;\n  padding-right: 0.325rem;\n}\n.py-\\[0\\.05rem\\] {\n  padding-top: 0.05rem;\n  padding-bottom: 0.05rem;\n}\n.py-2\\.5 {\n  padding-top: 0.625rem;\n  padding-bottom: 0.625rem;\n}\n.px-1\\.5 {\n  padding-left: 0.375rem;\n  padding-right: 0.375rem;\n}\n.px-\\[0\\.4rem\\] {\n  padding-left: 0.4rem;\n  padding-right: 0.4rem;\n}\n.pb-6 {\n  padding-bottom: 1.5rem;\n}\n.pb-0\\.5 {\n  padding-bottom: 0.125rem;\n}\n.pb-0 {\n  padding-bottom: 0px;\n}\n.pt-6 {\n  padding-top: 1.5rem;\n}\n.pl-4 {\n  padding-left: 1rem;\n}\n.pr-1 {\n  padding-right: 0.25rem;\n}\n.pt-2 {\n  padding-top: 0.5rem;\n}\n.pb-\\[0\\.225rem\\] {\n  padding-bottom: 0.225rem;\n}\n.pt-\\[0\\.15rem\\] {\n  padding-top: 0.15rem;\n}\n.pb-2 {\n  padding-bottom: 0.5rem;\n}\n.pt-1\\.5 {\n  padding-top: 0.375rem;\n}\n.pt-1 {\n  padding-top: 0.25rem;\n}\n.text-left {\n  text-align: left;\n}\n.text-center {\n  text-align: center;\n}\n.text-right {\n  text-align: right;\n}\n.text-justify {\n  text-align: justify;\n}\n.font-mono {\n  font-family: IBM Plex Mono, ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, \"Liberation Mono\", \"Courier New\", monospace;\n}\n.font-sans {\n  font-family: Source Sans Pro, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, \"Helvetica Neue\", Arial, \"Noto Sans\", sans-serif, \"Apple Color Emoji\", \"Segoe UI Emoji\", \"Segoe UI Symbol\", \"Noto Color Emoji\";\n}\n.text-3xl {\n  font-size: 1.875rem;\n  line-height: 2.25rem;\n}\n.text-2xl {\n  font-size: 1.5rem;\n  line-height: 2rem;\n}\n.text-lg {\n  font-size: 1.125rem;\n  line-height: 1.75rem;\n}\n.text-xs {\n  font-size: 0.75rem;\n  line-height: 1rem;\n}\n.text-sm {\n  font-size: 0.875rem;\n  line-height: 1.25rem;\n}\n.text-xl {\n  font-size: 1.25rem;\n  line-height: 1.75rem;\n}\n.text-base {\n  font-size: 1rem;\n  line-height: 1.5rem;\n}\n.text-\\[0\\.855rem\\] {\n  font-size: 0.855rem;\n}\n.text-\\[10px\\] {\n  font-size: 10px;\n}\n.text-4xl {\n  font-size: 2.25rem;\n  line-height: 2.5rem;\n}\n.font-semibold {\n  font-weight: 600;\n}\n.font-bold {\n  font-weight: 700;\n}\n.uppercase {\n  text-transform: uppercase;\n}\n.lowercase {\n  text-transform: lowercase;\n}\n.capitalize {\n  text-transform: capitalize;\n}\n.italic {\n  font-style: italic;\n}\n.ordinal {\n  --tw-ordinal: ordinal;\n  font-variant-numeric: var(--tw-ordinal) var(--tw-slashed-zero) var(--tw-numeric-figure) var(--tw-numeric-spacing) var(--tw-numeric-fraction);\n}\n.leading-7 {\n  line-height: 1.75rem;\n}\n.leading-tight {\n  line-height: 1.25;\n}\n.leading-none {\n  line-height: 1;\n}\n.leading-snug {\n  line-height: 1.375;\n}\n.\\!text-red-500 {\n  --tw-text-opacity: 1 !important;\n  color: rgb(239 68 68 / var(--tw-text-opacity)) !important;\n}\n.\\!text-green-500 {\n  --tw-text-opacity: 1 !important;\n  color: rgb(34 197 94 / var(--tw-text-opacity)) !important;\n}\n.\\!text-blue-500 {\n  --tw-text-opacity: 1 !important;\n  color: rgb(59 130 246 / var(--tw-text-opacity)) !important;\n}\n.\\!text-yellow-500 {\n  --tw-text-opacity: 1 !important;\n  color: rgb(234 179 8 / var(--tw-text-opacity)) !important;\n}\n.\\!text-purple-500 {\n  --tw-text-opacity: 1 !important;\n  color: rgb(168 85 247 / var(--tw-text-opacity)) !important;\n}\n.\\!text-teal-500 {\n  --tw-text-opacity: 1 !important;\n  color: rgb(20 184 166 / var(--tw-text-opacity)) !important;\n}\n.\\!text-orange-500 {\n  --tw-text-opacity: 1 !important;\n  color: rgb(255 124 0 / var(--tw-text-opacity)) !important;\n}\n.\\!text-cyan-500 {\n  --tw-text-opacity: 1 !important;\n  color: rgb(6 182 212 / var(--tw-text-opacity)) !important;\n}\n.\\!text-lime-500 {\n  --tw-text-opacity: 1 !important;\n  color: rgb(132 204 22 / var(--tw-text-opacity)) !important;\n}\n.\\!text-pink-500 {\n  --tw-text-opacity: 1 !important;\n  color: rgb(236 72 153 / var(--tw-text-opacity)) !important;\n}\n.\\!text-gray-500 {\n  --tw-text-opacity: 1 !important;\n  color: rgb(107 114 128 / var(--tw-text-opacity)) !important;\n}\n.\\!text-gray-700 {\n  --tw-text-opacity: 1 !important;\n  color: rgb(55 65 81 / var(--tw-text-opacity)) !important;\n}\n.text-amber-500 {\n  --tw-text-opacity: 1;\n  color: rgb(245 158 11 / var(--tw-text-opacity));\n}\n.text-pink-400 {\n  --tw-text-opacity: 1;\n  color: rgb(244 114 182 / var(--tw-text-opacity));\n}\n.text-gray-300 {\n  --tw-text-opacity: 1;\n  color: rgb(209 213 219 / var(--tw-text-opacity));\n}\n.text-white {\n  --tw-text-opacity: 1;\n  color: rgb(255 255 255 / var(--tw-text-opacity));\n}\n.text-gray-700 {\n  --tw-text-opacity: 1;\n  color: rgb(55 65 81 / var(--tw-text-opacity));\n}\n.text-gray-500 {\n  --tw-text-opacity: 1;\n  color: rgb(107 114 128 / var(--tw-text-opacity));\n}\n.text-green-500 {\n  --tw-text-opacity: 1;\n  color: rgb(34 197 94 / var(--tw-text-opacity));\n}\n.text-red-500 {\n  --tw-text-opacity: 1;\n  color: rgb(239 68 68 / var(--tw-text-opacity));\n}\n.text-blue-500 {\n  --tw-text-opacity: 1;\n  color: rgb(59 130 246 / var(--tw-text-opacity));\n}\n.text-gray-900 {\n  --tw-text-opacity: 1;\n  color: rgb(17 24 39 / var(--tw-text-opacity));\n}\n.text-red-400 {\n  --tw-text-opacity: 1;\n  color: rgb(248 113 113 / var(--tw-text-opacity));\n}\n.text-gray-800 {\n  --tw-text-opacity: 1;\n  color: rgb(31 41 55 / var(--tw-text-opacity));\n}\n.text-indigo-600 {\n  --tw-text-opacity: 1;\n  color: rgb(79 70 229 / var(--tw-text-opacity));\n}\n.text-black {\n  --tw-text-opacity: 1;\n  color: rgb(0 0 0 / var(--tw-text-opacity));\n}\n.text-gray-400 {\n  --tw-text-opacity: 1;\n  color: rgb(156 163 175 / var(--tw-text-opacity));\n}\n.text-green-600 {\n  --tw-text-opacity: 1;\n  color: rgb(22 163 74 / var(--tw-text-opacity));\n}\n.text-gray-600 {\n  --tw-text-opacity: 1;\n  color: rgb(75 85 99 / var(--tw-text-opacity));\n}\n.text-gray-200 {\n  --tw-text-opacity: 1;\n  color: rgb(229 231 235 / var(--tw-text-opacity));\n}\n.text-orange-500 {\n  --tw-text-opacity: 1;\n  color: rgb(255 124 0 / var(--tw-text-opacity));\n}\n.text-indigo-500 {\n  --tw-text-opacity: 1;\n  color: rgb(99 102 241 / var(--tw-text-opacity));\n}\n.text-red-600 {\n  --tw-text-opacity: 1;\n  color: rgb(220 38 38 / var(--tw-text-opacity));\n}\n.text-green-400 {\n  --tw-text-opacity: 1;\n  color: rgb(74 222 128 / var(--tw-text-opacity));\n}\n.text-blue-400 {\n  --tw-text-opacity: 1;\n  color: rgb(96 165 250 / var(--tw-text-opacity));\n}\n.text-blue-600 {\n  --tw-text-opacity: 1;\n  color: rgb(37 99 235 / var(--tw-text-opacity));\n}\n.text-orange-600 {\n  --tw-text-opacity: 1;\n  color: rgb(238 116 0 / var(--tw-text-opacity));\n}\n.\\!text-gray-800 {\n  --tw-text-opacity: 1 !important;\n  color: rgb(31 41 55 / var(--tw-text-opacity)) !important;\n}\n.underline {\n  text-decoration-line: underline;\n}\n.placeholder-gray-400::placeholder {\n  --tw-placeholder-opacity: 1;\n  color: rgb(156 163 175 / var(--tw-placeholder-opacity));\n}\n.opacity-50 {\n  opacity: 0.5;\n}\n.opacity-0 {\n  opacity: 0;\n}\n.opacity-80 {\n  opacity: 0.8;\n}\n.opacity-75 {\n  opacity: 0.75;\n}\n.opacity-20 {\n  opacity: 0.2;\n}\n.opacity-40 {\n  opacity: 0.4;\n}\n.opacity-90 {\n  opacity: 0.9;\n}\n.shadow-md {\n  --tw-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);\n  --tw-shadow-colored: 0 4px 6px -1px var(--tw-shadow-color), 0 2px 4px -2px var(--tw-shadow-color);\n  box-shadow: var(--tw-ring-offset-shadow, 0 0 #0000), var(--tw-ring-shadow, 0 0 #0000), var(--tw-shadow);\n}\n.shadow-sm {\n  --tw-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05);\n  --tw-shadow-colored: 0 1px 2px 0 var(--tw-shadow-color);\n  box-shadow: var(--tw-ring-offset-shadow, 0 0 #0000), var(--tw-ring-shadow, 0 0 #0000), var(--tw-shadow);\n}\n.shadow-2xl {\n  --tw-shadow: 0 25px 50px -12px rgb(0 0 0 / 0.25);\n  --tw-shadow-colored: 0 25px 50px -12px var(--tw-shadow-color);\n  box-shadow: var(--tw-ring-offset-shadow, 0 0 #0000), var(--tw-ring-shadow, 0 0 #0000), var(--tw-shadow);\n}\n.shadow {\n  --tw-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1);\n  --tw-shadow-colored: 0 1px 3px 0 var(--tw-shadow-color), 0 1px 2px -1px var(--tw-shadow-color);\n  box-shadow: var(--tw-ring-offset-shadow, 0 0 #0000), var(--tw-ring-shadow, 0 0 #0000), var(--tw-shadow);\n}\n.shadow-inner {\n  --tw-shadow: inset 0 2px 4px 0 rgb(0 0 0 / 0.05);\n  --tw-shadow-colored: inset 0 2px 4px 0 var(--tw-shadow-color);\n  box-shadow: var(--tw-ring-offset-shadow, 0 0 #0000), var(--tw-ring-shadow, 0 0 #0000), var(--tw-shadow);\n}\n.\\!shadow-none {\n  --tw-shadow: 0 0 #0000 !important;\n  --tw-shadow-colored: 0 0 #0000 !important;\n  box-shadow: var(--tw-ring-offset-shadow, 0 0 #0000), var(--tw-ring-shadow, 0 0 #0000), var(--tw-shadow) !important;\n}\n.shadow-red-500\\/10 {\n  --tw-shadow-color: rgb(239 68 68 / 0.1);\n  --tw-shadow: var(--tw-shadow-colored);\n}\n.outline-none {\n  outline: 2px solid transparent;\n  outline-offset: 2px;\n}\n.outline {\n  outline-style: solid;\n}\n.\\!ring-2 {\n  --tw-ring-offset-shadow: var(--tw-ring-inset) 0 0 0 var(--tw-ring-offset-width) var(--tw-ring-offset-color) !important;\n  --tw-ring-shadow: var(--tw-ring-inset) 0 0 0 calc(2px + var(--tw-ring-offset-width)) var(--tw-ring-color) !important;\n  box-shadow: var(--tw-ring-offset-shadow), var(--tw-ring-shadow), var(--tw-shadow, 0 0 #0000) !important;\n}\n.ring-1 {\n  --tw-ring-offset-shadow: var(--tw-ring-inset) 0 0 0 var(--tw-ring-offset-width) var(--tw-ring-offset-color);\n  --tw-ring-shadow: var(--tw-ring-inset) 0 0 0 calc(1px + var(--tw-ring-offset-width)) var(--tw-ring-color);\n  box-shadow: var(--tw-ring-offset-shadow), var(--tw-ring-shadow), var(--tw-shadow, 0 0 #0000);\n}\n.ring {\n  --tw-ring-offset-shadow: var(--tw-ring-inset) 0 0 0 var(--tw-ring-offset-width) var(--tw-ring-offset-color);\n  --tw-ring-shadow: var(--tw-ring-inset) 0 0 0 calc(3px + var(--tw-ring-offset-width)) var(--tw-ring-color);\n  box-shadow: var(--tw-ring-offset-shadow), var(--tw-ring-shadow), var(--tw-shadow, 0 0 #0000);\n}\n.ring-inset {\n  --tw-ring-inset: inset;\n}\n.\\!ring-orange-500 {\n  --tw-ring-opacity: 1 !important;\n  --tw-ring-color: rgb(255 124 0 / var(--tw-ring-opacity)) !important;\n}\n.ring-gray-200 {\n  --tw-ring-opacity: 1;\n  --tw-ring-color: rgb(229 231 235 / var(--tw-ring-opacity));\n}\n.ring-orange-500 {\n  --tw-ring-opacity: 1;\n  --tw-ring-color: rgb(255 124 0 / var(--tw-ring-opacity));\n}\n.blur {\n  --tw-blur: blur(8px);\n  filter: var(--tw-blur) var(--tw-brightness) var(--tw-contrast) var(--tw-grayscale) var(--tw-hue-rotate) var(--tw-invert) var(--tw-saturate) var(--tw-sepia) var(--tw-drop-shadow);\n}\n.drop-shadow-lg {\n  --tw-drop-shadow: drop-shadow(0 10px 8px rgb(0 0 0 / 0.04)) drop-shadow(0 4px 3px rgb(0 0 0 / 0.1));\n  filter: var(--tw-blur) var(--tw-brightness) var(--tw-contrast) var(--tw-grayscale) var(--tw-hue-rotate) var(--tw-invert) var(--tw-saturate) var(--tw-sepia) var(--tw-drop-shadow);\n}\n.grayscale {\n  --tw-grayscale: grayscale(100%);\n  filter: var(--tw-blur) var(--tw-brightness) var(--tw-contrast) var(--tw-grayscale) var(--tw-hue-rotate) var(--tw-invert) var(--tw-saturate) var(--tw-sepia) var(--tw-drop-shadow);\n}\n.invert {\n  --tw-invert: invert(100%);\n  filter: var(--tw-blur) var(--tw-brightness) var(--tw-contrast) var(--tw-grayscale) var(--tw-hue-rotate) var(--tw-invert) var(--tw-saturate) var(--tw-sepia) var(--tw-drop-shadow);\n}\n.sepia {\n  --tw-sepia: sepia(100%);\n  filter: var(--tw-blur) var(--tw-brightness) var(--tw-contrast) var(--tw-grayscale) var(--tw-hue-rotate) var(--tw-invert) var(--tw-saturate) var(--tw-sepia) var(--tw-drop-shadow);\n}\n.filter {\n  filter: var(--tw-blur) var(--tw-brightness) var(--tw-contrast) var(--tw-grayscale) var(--tw-hue-rotate) var(--tw-invert) var(--tw-saturate) var(--tw-sepia) var(--tw-drop-shadow);\n}\n.backdrop-blur {\n  --tw-backdrop-blur: blur(8px);\n  backdrop-filter: var(--tw-backdrop-blur) var(--tw-backdrop-brightness) var(--tw-backdrop-contrast) var(--tw-backdrop-grayscale) var(--tw-backdrop-hue-rotate) var(--tw-backdrop-invert) var(--tw-backdrop-opacity) var(--tw-backdrop-saturate) var(--tw-backdrop-sepia);\n}\n.transition-colors {\n  transition-property: color, background-color, border-color, text-decoration-color, fill, stroke;\n  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);\n  transition-duration: 150ms;\n}\n.transition {\n  transition-property: color, background-color, border-color, text-decoration-color, fill, stroke, opacity, box-shadow, transform, filter, backdrop-filter;\n  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);\n  transition-duration: 150ms;\n}\n.transition-all {\n  transition-property: all;\n  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);\n  transition-duration: 150ms;\n}\n.transition-opacity {\n  transition-property: opacity;\n  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);\n  transition-duration: 150ms;\n}\n.duration-75 {\n  transition-duration: 75ms;\n}\n.duration-500 {\n  transition-duration: 500ms;\n}\n.ease-out {\n  transition-timing-function: cubic-bezier(0, 0, 0.2, 1);\n}\n\n.gradio-container {\n\tline-height: 1.5; /* 1 */\n\t-webkit-text-size-adjust: 100%; /* 2 */\n\t-moz-tab-size: 4; /* 3 */\n\ttab-size: 4; /* 3 */\n\tfont-family: Source Sans Pro, ui-sans-serif, system-ui, -apple-system,\n\t\tBlinkMacSystemFont, \"Segoe UI\", Roboto, \"Helvetica Neue\", Arial, \"Noto Sans\",\n\t\tsans-serif, \"Apple Color Emoji\", \"Segoe UI Emoji\", \"Segoe UI Symbol\",\n\t\t\"Noto Color Emoji\"; /* 4 */\n}\n\n.cropper-container {\n\tdirection: ltr;\n\tfont-size: 0;\n\tline-height: 0;\n\tposition: relative;\n\t-ms-touch-action: none;\n\ttouch-action: none;\n\t-webkit-user-select: none;\n\t-moz-user-select: none;\n\t-ms-user-select: none;\n\tuser-select: none;\n}\n\n.cropper-container img {\n\tdisplay: block;\n\theight: 100%;\n\timage-orientation: 0deg;\n\tmax-height: none !important;\n\tmax-width: none !important;\n\tmin-height: 0 !important;\n\tmin-width: 0 !important;\n\twidth: 100%;\n}\n\n.cropper-wrap-box,\n.cropper-canvas,\n.cropper-drag-box,\n.cropper-crop-box,\n.cropper-modal {\n\tbottom: 0;\n\tleft: 0;\n\tposition: absolute;\n\tright: 0;\n\ttop: 0;\n}\n\n.cropper-wrap-box,\n.cropper-canvas {\n\toverflow: hidden;\n}\n\n.cropper-drag-box {\n\tbackground-color: #fff;\n\topacity: 0;\n}\n\n.cropper-modal {\n\tbackground-color: #000;\n\topacity: 0.5;\n}\n\n.cropper-view-box {\n\tdisplay: block;\n\theight: 100%;\n\toutline: 1px solid #39f;\n\toutline-color: rgba(51, 153, 255, 0.75);\n\toverflow: hidden;\n\twidth: 100%;\n}\n\n.cropper-dashed {\n\tborder: 0 dashed #eee;\n\tdisplay: block;\n\topacity: 0.5;\n\tposition: absolute;\n}\n\n.cropper-dashed.dashed-h {\n\tborder-bottom-width: 1px;\n\tborder-top-width: 1px;\n\theight: calc(100% / 3);\n\tleft: 0;\n\ttop: calc(100% / 3);\n\twidth: 100%;\n}\n\n.cropper-dashed.dashed-v {\n\tborder-left-width: 1px;\n\tborder-right-width: 1px;\n\theight: 100%;\n\tleft: calc(100% / 3);\n\ttop: 0;\n\twidth: calc(100% / 3);\n}\n\n.cropper-center {\n\tdisplay: block;\n\theight: 0;\n\tleft: 50%;\n\topacity: 0.75;\n\tposition: absolute;\n\ttop: 50%;\n\twidth: 0;\n}\n\n.cropper-center::before,\n.cropper-center::after {\n\tbackground-color: #eee;\n\tcontent: \" \";\n\tdisplay: block;\n\tposition: absolute;\n}\n\n.cropper-center::before {\n\theight: 1px;\n\tleft: -3px;\n\ttop: 0;\n\twidth: 7px;\n}\n\n.cropper-center::after {\n\theight: 7px;\n\tleft: 0;\n\ttop: -3px;\n\twidth: 1px;\n}\n\n.cropper-face,\n.cropper-line,\n.cropper-point {\n\tdisplay: block;\n\theight: 100%;\n\topacity: 0.1;\n\tposition: absolute;\n\twidth: 100%;\n}\n\n.cropper-face {\n\tbackground-color: #fff;\n\tleft: 0;\n\ttop: 0;\n}\n\n.cropper-line {\n\tbackground-color: #39f;\n}\n\n.cropper-line.line-e {\n\tcursor: ew-resize;\n\tright: -3px;\n\ttop: 0;\n\twidth: 5px;\n}\n\n.cropper-line.line-n {\n\tcursor: ns-resize;\n\theight: 5px;\n\tleft: 0;\n\ttop: -3px;\n}\n\n.cropper-line.line-w {\n\tcursor: ew-resize;\n\tleft: -3px;\n\ttop: 0;\n\twidth: 5px;\n}\n\n.cropper-line.line-s {\n\tbottom: -3px;\n\tcursor: ns-resize;\n\theight: 5px;\n\tleft: 0;\n}\n\n.cropper-point {\n\tbackground-color: #39f;\n\theight: 5px;\n\topacity: 0.75;\n\twidth: 5px;\n}\n\n.cropper-point.point-e {\n\tcursor: ew-resize;\n\tmargin-top: -3px;\n\tright: -3px;\n\ttop: 50%;\n}\n\n.cropper-point.point-n {\n\tcursor: ns-resize;\n\tleft: 50%;\n\tmargin-left: -3px;\n\ttop: -3px;\n}\n\n.cropper-point.point-w {\n\tcursor: ew-resize;\n\tleft: -3px;\n\tmargin-top: -3px;\n\ttop: 50%;\n}\n\n.cropper-point.point-s {\n\tbottom: -3px;\n\tcursor: s-resize;\n\tleft: 50%;\n\tmargin-left: -3px;\n}\n\n.cropper-point.point-ne {\n\tcursor: nesw-resize;\n\tright: -3px;\n\ttop: -3px;\n}\n\n.cropper-point.point-nw {\n\tcursor: nwse-resize;\n\tleft: -3px;\n\ttop: -3px;\n}\n\n.cropper-point.point-sw {\n\tbottom: -3px;\n\tcursor: nesw-resize;\n\tleft: -3px;\n}\n\n.cropper-point.point-se {\n\tbottom: -3px;\n\tcursor: nwse-resize;\n\theight: 20px;\n\topacity: 1;\n\tright: -3px;\n\twidth: 20px;\n}\n\n@media (min-width: 768px) {\n\t.cropper-point.point-se {\n\t\theight: 15px;\n\t\twidth: 15px;\n\t}\n}\n\n@media (min-width: 992px) {\n\t.cropper-point.point-se {\n\t\theight: 10px;\n\t\twidth: 10px;\n\t}\n}\n\n@media (min-width: 1200px) {\n\t.cropper-point.point-se {\n\t\theight: 5px;\n\t\topacity: 0.75;\n\t\twidth: 5px;\n\t}\n}\n\n.cropper-point.point-se::before {\n\tbackground-color: #39f;\n\tbottom: -50%;\n\tcontent: \" \";\n\tdisplay: block;\n\theight: 200%;\n\topacity: 0;\n\tposition: absolute;\n\tright: -50%;\n\twidth: 200%;\n}\n\n.cropper-invisible {\n\topacity: 0;\n}\n\n.cropper-bg {\n\tbackground-image: url(\"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQAQMAAAAlPW0iAAAAA3NCSVQICAjb4U/gAAAABlBMVEXMzMz////TjRV2AAAACXBIWXMAAArrAAAK6wGCiw1aAAAAHHRFWHRTb2Z0d2FyZQBBZG9iZSBGaXJld29ya3MgQ1M26LyyjAAAABFJREFUCJlj+M/AgBVhF/0PAH6/D/HkDxOGAAAAAElFTkSuQmCC\");\n}\n\n.cropper-hide {\n\tdisplay: block;\n\theight: 0;\n\tposition: absolute;\n\twidth: 0;\n}\n\n.cropper-hidden {\n\tdisplay: none !important;\n}\n\n.cropper-move {\n\tcursor: move;\n}\n\n.cropper-crop {\n\tcursor: crosshair;\n}\n\n.cropper-disabled .cropper-drag-box,\n.cropper-disabled .cropper-face,\n.cropper-disabled .cropper-line,\n.cropper-disabled .cropper-point {\n\tcursor: not-allowed;\n}\n\n.placeholder\\:text-gray-400::placeholder {\n  --tw-text-opacity: 1;\n  color: rgb(156 163 175 / var(--tw-text-opacity));\n}\n\n.first\\:rounded-t:first-child {\n  border-top-left-radius: 0.25rem;\n  border-top-right-radius: 0.25rem;\n}\n\n.last\\:mb-0:last-child {\n  margin-bottom: 0px;\n}\n\n.last\\:rounded-b:last-child {\n  border-bottom-right-radius: 0.25rem;\n  border-bottom-left-radius: 0.25rem;\n}\n\n.last\\:border-none:last-child {\n  border-style: none;\n}\n\n.dark .odd\\:bg-gray-50:nth-child(odd) {\n  --tw-bg-opacity: 1;\n  background-color: rgb(17 24 39 / var(--tw-bg-opacity));\n}\n\n.odd\\:bg-gray-50:nth-child(odd) {\n  --tw-bg-opacity: 1;\n  background-color: rgb(249 250 251 / var(--tw-bg-opacity));\n}\n\n.checked\\:shadow-inner:checked {\n  --tw-shadow: inset 0 2px 4px 0 rgb(0 0 0 / 0.05);\n  --tw-shadow-colored: inset 0 2px 4px 0 var(--tw-shadow-color);\n  box-shadow: var(--tw-ring-offset-shadow, 0 0 #0000), var(--tw-ring-shadow, 0 0 #0000), var(--tw-shadow);\n}\n\n.focus-within\\:bg-orange-50:focus-within {\n  --tw-bg-opacity: 1;\n  background-color: rgb(255 242 229 / var(--tw-bg-opacity));\n}\n\n.focus-within\\:ring-1:focus-within {\n  --tw-ring-offset-shadow: var(--tw-ring-inset) 0 0 0 var(--tw-ring-offset-width) var(--tw-ring-offset-color);\n  --tw-ring-shadow: var(--tw-ring-inset) 0 0 0 calc(1px + var(--tw-ring-offset-width)) var(--tw-ring-color);\n  box-shadow: var(--tw-ring-offset-shadow), var(--tw-ring-shadow), var(--tw-shadow, 0 0 #0000);\n}\n\n.dark .hover\\:text-gray-500:hover {\n  --tw-text-opacity: 1;\n  color: rgb(209 213 219 / var(--tw-text-opacity));\n}\n\n.dark .hover\\:text-gray-700:hover {\n  --tw-text-opacity: 1;\n  color: rgb(229 231 235 / var(--tw-text-opacity));\n}\n\n\n\t.dark .hover\\:border-gray-300:hover {\n  --tw-border-opacity: 1;\n  border-color: rgb(55 65 81 / var(--tw-border-opacity));\n}\n\n.dark .hover\\:bg-gray-50:hover {\n  --tw-bg-opacity: 1;\n  background-color: rgb(17 24 39 / var(--tw-bg-opacity));\n}\n\n.hover\\:cursor-none:hover {\n  cursor: none;\n}\n\n.hover\\:divide-orange-100:hover > :not([hidden]) ~ :not([hidden]) {\n  --tw-divide-opacity: 1;\n  border-color: rgb(255 229 204 / var(--tw-divide-opacity));\n}\n\n.hover\\:border-gray-300:hover {\n  --tw-border-opacity: 1;\n  border-color: rgb(209 213 219 / var(--tw-border-opacity));\n}\n\n.hover\\:border-orange-400:hover {\n  --tw-border-opacity: 1;\n  border-color: rgb(255 150 51 / var(--tw-border-opacity));\n}\n\n.hover\\:bg-amber-400:hover {\n  --tw-bg-opacity: 1;\n  background-color: rgb(251 191 36 / var(--tw-bg-opacity));\n}\n\n.hover\\:bg-orange-50:hover {\n  --tw-bg-opacity: 1;\n  background-color: rgb(255 242 229 / var(--tw-bg-opacity));\n}\n\n.hover\\:bg-gray-100:hover {\n  --tw-bg-opacity: 1;\n  background-color: rgb(243 244 246 / var(--tw-bg-opacity));\n}\n\n.hover\\:bg-green-400:hover {\n  --tw-bg-opacity: 1;\n  background-color: rgb(74 222 128 / var(--tw-bg-opacity));\n}\n\n.hover\\:bg-indigo-500:hover {\n  --tw-bg-opacity: 1;\n  background-color: rgb(99 102 241 / var(--tw-bg-opacity));\n}\n\n.hover\\:bg-gray-400:hover {\n  --tw-bg-opacity: 1;\n  background-color: rgb(156 163 175 / var(--tw-bg-opacity));\n}\n\n.hover\\:bg-red-500:hover {\n  --tw-bg-opacity: 1;\n  background-color: rgb(239 68 68 / var(--tw-bg-opacity));\n}\n\n.hover\\:bg-blue-400:hover {\n  --tw-bg-opacity: 1;\n  background-color: rgb(96 165 250 / var(--tw-bg-opacity));\n}\n\n.hover\\:bg-gray-50:hover {\n  --tw-bg-opacity: 1;\n  background-color: rgb(249 250 251 / var(--tw-bg-opacity));\n}\n\n.hover\\:from-gray-100:hover {\n  --tw-gradient-from: #f3f4f6;\n  --tw-gradient-to: rgb(243 244 246 / 0);\n  --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to);\n}\n\n.hover\\:to-gray-100:hover {\n  --tw-gradient-to: #f3f4f6;\n}\n\n.hover\\:to-red-100:hover {\n  --tw-gradient-to: #fee2e2;\n}\n\n.hover\\:to-green-400:hover {\n  --tw-gradient-to: #4ade80;\n}\n\n.hover\\:to-orange-200\\/90:hover {\n  --tw-gradient-to: rgb(255 216 180 / 0.9);\n}\n\n.hover\\:to-gray-100\\/90:hover {\n  --tw-gradient-to: rgb(243 244 246 / 0.9);\n}\n\n.hover\\:text-gray-400:hover {\n  --tw-text-opacity: 1;\n  color: rgb(156 163 175 / var(--tw-text-opacity));\n}\n\n.hover\\:text-orange-500:hover {\n  --tw-text-opacity: 1;\n  color: rgb(255 124 0 / var(--tw-text-opacity));\n}\n\n.hover\\:text-gray-500:hover {\n  --tw-text-opacity: 1;\n  color: rgb(107 114 128 / var(--tw-text-opacity));\n}\n\n.hover\\:text-gray-700:hover {\n  --tw-text-opacity: 1;\n  color: rgb(55 65 81 / var(--tw-text-opacity));\n}\n\n.hover\\:text-gray-50:hover {\n  --tw-text-opacity: 1;\n  color: rgb(249 250 251 / var(--tw-text-opacity));\n}\n\n.hover\\:underline:hover {\n  text-decoration-line: underline;\n}\n\n.hover\\:opacity-20:hover {\n  opacity: 0.2;\n}\n\n.hover\\:shadow-xl:hover {\n  --tw-shadow: 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1);\n  --tw-shadow-colored: 0 20px 25px -5px var(--tw-shadow-color), 0 8px 10px -6px var(--tw-shadow-color);\n  box-shadow: var(--tw-ring-offset-shadow, 0 0 #0000), var(--tw-ring-shadow, 0 0 #0000), var(--tw-shadow);\n}\n\n.hover\\:shadow:hover {\n  --tw-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1);\n  --tw-shadow-colored: 0 1px 3px 0 var(--tw-shadow-color), 0 1px 2px -1px var(--tw-shadow-color);\n  box-shadow: var(--tw-ring-offset-shadow, 0 0 #0000), var(--tw-ring-shadow, 0 0 #0000), var(--tw-shadow);\n}\n\n.hover\\:shadow-md:hover {\n  --tw-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);\n  --tw-shadow-colored: 0 4px 6px -1px var(--tw-shadow-color), 0 2px 4px -2px var(--tw-shadow-color);\n  box-shadow: var(--tw-ring-offset-shadow, 0 0 #0000), var(--tw-ring-shadow, 0 0 #0000), var(--tw-shadow);\n}\n\n.hover\\:ring:hover {\n  --tw-ring-offset-shadow: var(--tw-ring-inset) 0 0 0 var(--tw-ring-offset-width) var(--tw-ring-offset-color);\n  --tw-ring-shadow: var(--tw-ring-inset) 0 0 0 calc(3px + var(--tw-ring-offset-width)) var(--tw-ring-color);\n  box-shadow: var(--tw-ring-offset-shadow), var(--tw-ring-shadow), var(--tw-shadow, 0 0 #0000);\n}\n\n.hover\\:ring-1:hover {\n  --tw-ring-offset-shadow: var(--tw-ring-inset) 0 0 0 var(--tw-ring-offset-width) var(--tw-ring-offset-color);\n  --tw-ring-shadow: var(--tw-ring-inset) 0 0 0 calc(1px + var(--tw-ring-offset-width)) var(--tw-ring-color);\n  box-shadow: var(--tw-ring-offset-shadow), var(--tw-ring-shadow), var(--tw-shadow, 0 0 #0000);\n}\n\n.hover\\:\\!ring-orange-500:hover {\n  --tw-ring-opacity: 1 !important;\n  --tw-ring-color: rgb(255 124 0 / var(--tw-ring-opacity)) !important;\n}\n\n.hover\\:ring-orange-300:hover {\n  --tw-ring-opacity: 1;\n  --tw-ring-color: rgb(255 176 102 / var(--tw-ring-opacity));\n}\n\n.hover\\:brightness-110:hover {\n  --tw-brightness: brightness(1.1);\n  filter: var(--tw-blur) var(--tw-brightness) var(--tw-contrast) var(--tw-grayscale) var(--tw-hue-rotate) var(--tw-invert) var(--tw-saturate) var(--tw-sepia) var(--tw-drop-shadow);\n}\n\n.focus\\:border-green-400:focus {\n  --tw-border-opacity: 1;\n  border-color: rgb(74 222 128 / var(--tw-border-opacity));\n}\n\n.focus\\:border-blue-300:focus {\n  --tw-border-opacity: 1;\n  border-color: rgb(147 197 253 / var(--tw-border-opacity));\n}\n\n.focus\\:bg-gradient-to-b:focus {\n  background-image: linear-gradient(to bottom, var(--tw-gradient-stops));\n}\n\n.focus\\:from-blue-100:focus {\n  --tw-gradient-from: #dbeafe;\n  --tw-gradient-to: rgb(219 234 254 / 0);\n  --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to);\n}\n\n.focus\\:to-blue-50:focus {\n  --tw-gradient-to: #eff6ff;\n}\n\n.focus\\:shadow-inner:focus {\n  --tw-shadow: inset 0 2px 4px 0 rgb(0 0 0 / 0.05);\n  --tw-shadow-colored: inset 0 2px 4px 0 var(--tw-shadow-color);\n  box-shadow: var(--tw-ring-offset-shadow, 0 0 #0000), var(--tw-ring-shadow, 0 0 #0000), var(--tw-shadow);\n}\n\n.focus\\:ring-2:focus {\n  --tw-ring-offset-shadow: var(--tw-ring-inset) 0 0 0 var(--tw-ring-offset-width) var(--tw-ring-offset-color);\n  --tw-ring-shadow: var(--tw-ring-inset) 0 0 0 calc(2px + var(--tw-ring-offset-width)) var(--tw-ring-color);\n  box-shadow: var(--tw-ring-offset-shadow), var(--tw-ring-shadow), var(--tw-shadow, 0 0 #0000);\n}\n\n.focus\\:ring-1:focus {\n  --tw-ring-offset-shadow: var(--tw-ring-inset) 0 0 0 var(--tw-ring-offset-width) var(--tw-ring-offset-color);\n  --tw-ring-shadow: var(--tw-ring-inset) 0 0 0 calc(1px + var(--tw-ring-offset-width)) var(--tw-ring-color);\n  box-shadow: var(--tw-ring-offset-shadow), var(--tw-ring-shadow), var(--tw-shadow, 0 0 #0000);\n}\n\n.focus\\:ring:focus {\n  --tw-ring-offset-shadow: var(--tw-ring-inset) 0 0 0 var(--tw-ring-offset-width) var(--tw-ring-offset-color);\n  --tw-ring-shadow: var(--tw-ring-inset) 0 0 0 calc(3px + var(--tw-ring-offset-width)) var(--tw-ring-color);\n  box-shadow: var(--tw-ring-offset-shadow), var(--tw-ring-shadow), var(--tw-shadow, 0 0 #0000);\n}\n\n.focus\\:ring-inset:focus {\n  --tw-ring-inset: inset;\n}\n\n.focus\\:ring-blue-500:focus {\n  --tw-ring-opacity: 1;\n  --tw-ring-color: rgb(59 130 246 / var(--tw-ring-opacity));\n}\n\n.focus\\:ring-indigo-200:focus {\n  --tw-ring-opacity: 1;\n  --tw-ring-color: rgb(199 210 254 / var(--tw-ring-opacity));\n}\n\n.focus\\:ring-blue-200:focus {\n  --tw-ring-opacity: 1;\n  --tw-ring-color: rgb(191 219 254 / var(--tw-ring-opacity));\n}\n\n.focus\\:ring-opacity-50:focus {\n  --tw-ring-opacity: 0.5;\n}\n\n.focus\\:ring-offset-0:focus {\n  --tw-ring-offset-width: 0px;\n}\n\n.focus\\:ring-offset-indigo-300:focus {\n  --tw-ring-offset-color: #a5b4fc;\n}\n\n.dark .focus\\:odd\\:bg-white:nth-child(odd):focus {\n\t\tbackground-color: #0b0f19;\n\t\t--tw-bg-opacity: 1;\n\t\tbackground-color: rgb(11 15 25 / var(--tw-bg-opacity));\n\t}\n\n.focus\\:odd\\:bg-white:nth-child(odd):focus {\n  --tw-bg-opacity: 1;\n  background-color: rgb(255 255 255 / var(--tw-bg-opacity));\n}\n\n.active\\:shadow-inner:active {\n  --tw-shadow: inset 0 2px 4px 0 rgb(0 0 0 / 0.05);\n  --tw-shadow-colored: inset 0 2px 4px 0 var(--tw-shadow-color);\n  box-shadow: var(--tw-ring-offset-shadow, 0 0 #0000), var(--tw-ring-shadow, 0 0 #0000), var(--tw-shadow);\n}\n\n.disabled\\:cursor-not-allowed:disabled {\n  cursor: not-allowed;\n}\n\n.disabled\\:\\!cursor-not-allowed:disabled {\n  cursor: not-allowed !important;\n}\n\n.disabled\\:text-gray-400:disabled {\n  --tw-text-opacity: 1;\n  color: rgb(156 163 175 / var(--tw-text-opacity));\n}\n\n.group:last-child .group-last\\:first\\:rounded-bl-lg:first-child {\n  border-bottom-left-radius: 0.5rem;\n}\n\n.group:last-child .group-last\\:last\\:rounded-br-lg:last-child {\n  border-bottom-right-radius: 0.5rem;\n}\n\n.group:hover .group-hover\\:border-orange-400 {\n  --tw-border-opacity: 1;\n  border-color: rgb(255 150 51 / var(--tw-border-opacity));\n}\n\n.group:hover .group-hover\\:from-orange-500 {\n  --tw-gradient-from: #FF7C00;\n  --tw-gradient-to: rgb(255 124 0 / 0);\n  --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to);\n}\n\n.group:hover .group-hover\\:text-orange-500 {\n  --tw-text-opacity: 1;\n  color: rgb(255 124 0 / var(--tw-text-opacity));\n}\n\n.group:hover .group-hover\\:opacity-100 {\n  opacity: 1;\n}\n\n.group:hover .group-hover\\:opacity-50 {\n  opacity: 0.5;\n}\n\n.group:hover .group-hover\\:grayscale-0 {\n  --tw-grayscale: grayscale(0);\n  filter: var(--tw-blur) var(--tw-brightness) var(--tw-contrast) var(--tw-grayscale) var(--tw-hue-rotate) var(--tw-invert) var(--tw-saturate) var(--tw-sepia) var(--tw-drop-shadow);\n}\n\n.dark .dark\\:bg-gray-950 {\n\t\tbackground-color: #0b0f19;\n\t}\n\n.dark .dark .dark\\:text-gray-500 {\n  --tw-text-opacity: 1;\n  color: rgb(209 213 219 / var(--tw-text-opacity));\n}\n\n.dark .dark .dark\\:bg-white {\n\t\tbackground-color: #0b0f19;\n\t\t--tw-bg-opacity: 1;\n\t\tbackground-color: rgb(11 15 25 / var(--tw-bg-opacity));\n\t}\n\n.dark .dark\\:divide-gray-800 > :not([hidden]) ~ :not([hidden]) {\n  --tw-divide-opacity: 1;\n  border-color: rgb(31 41 55 / var(--tw-divide-opacity));\n}\n\n.dark .dark\\:divide-gray-700 > :not([hidden]) ~ :not([hidden]) {\n  --tw-divide-opacity: 1;\n  border-color: rgb(55 65 81 / var(--tw-divide-opacity));\n}\n\n.dark .dark\\:border-none {\n  border-style: none;\n}\n\n.dark .dark\\:border-gray-700 {\n  --tw-border-opacity: 1;\n  border-color: rgb(55 65 81 / var(--tw-border-opacity));\n}\n\n.dark .dark\\:border-gray-800 {\n  --tw-border-opacity: 1;\n  border-color: rgb(31 41 55 / var(--tw-border-opacity));\n}\n\n.dark .dark\\:border-gray-600 {\n  --tw-border-opacity: 1;\n  border-color: rgb(75 85 99 / var(--tw-border-opacity));\n}\n\n.dark .dark\\:\\!border-red-900 {\n  --tw-border-opacity: 1 !important;\n  border-color: rgb(127 29 29 / var(--tw-border-opacity)) !important;\n}\n\n.dark .dark\\:\\!border-yellow-900 {\n  --tw-border-opacity: 1 !important;\n  border-color: rgb(113 63 18 / var(--tw-border-opacity)) !important;\n}\n\n.dark .dark\\:\\!border-green-900 {\n  --tw-border-opacity: 1 !important;\n  border-color: rgb(20 83 45 / var(--tw-border-opacity)) !important;\n}\n\n.dark .dark\\:\\!border-blue-900 {\n  --tw-border-opacity: 1 !important;\n  border-color: rgb(30 58 138 / var(--tw-border-opacity)) !important;\n}\n\n.dark .dark\\:\\!border-purple-900 {\n  --tw-border-opacity: 1 !important;\n  border-color: rgb(88 28 135 / var(--tw-border-opacity)) !important;\n}\n\n.dark .dark\\:\\!border-gray-900 {\n  --tw-border-opacity: 1 !important;\n  border-color: rgb(17 24 39 / var(--tw-border-opacity)) !important;\n}\n\n.dark .dark\\:\\!border-pink-900 {\n  --tw-border-opacity: 1 !important;\n  border-color: rgb(131 24 67 / var(--tw-border-opacity)) !important;\n}\n\n.dark .dark\\:border-slate-300 {\n  --tw-border-opacity: 1;\n  border-color: rgb(203 213 225 / var(--tw-border-opacity));\n}\n\n.dark .dark\\:border-b-slate-700 {\n  --tw-border-opacity: 1;\n  border-bottom-color: rgb(51 65 85 / var(--tw-border-opacity));\n}\n\n.dark .dark\\:border-r-slate-700 {\n  --tw-border-opacity: 1;\n  border-right-color: rgb(51 65 85 / var(--tw-border-opacity));\n}\n\n.dark .dark\\:\\!bg-red-700 {\n  --tw-bg-opacity: 1 !important;\n  background-color: rgb(185 28 28 / var(--tw-bg-opacity)) !important;\n}\n\n.dark .dark\\:\\!bg-green-700 {\n  --tw-bg-opacity: 1 !important;\n  background-color: rgb(21 128 61 / var(--tw-bg-opacity)) !important;\n}\n\n.dark .dark\\:\\!bg-blue-700 {\n  --tw-bg-opacity: 1 !important;\n  background-color: rgb(29 78 216 / var(--tw-bg-opacity)) !important;\n}\n\n.dark .dark\\:\\!bg-yellow-700 {\n  --tw-bg-opacity: 1 !important;\n  background-color: rgb(161 98 7 / var(--tw-bg-opacity)) !important;\n}\n\n.dark .dark\\:\\!bg-purple-700 {\n  --tw-bg-opacity: 1 !important;\n  background-color: rgb(126 34 206 / var(--tw-bg-opacity)) !important;\n}\n\n.dark .dark\\:\\!bg-teal-700 {\n  --tw-bg-opacity: 1 !important;\n  background-color: rgb(15 118 110 / var(--tw-bg-opacity)) !important;\n}\n\n.dark .dark\\:\\!bg-orange-700 {\n  --tw-bg-opacity: 1 !important;\n  background-color: rgb(206 100 0 / var(--tw-bg-opacity)) !important;\n}\n\n.dark .dark\\:\\!bg-cyan-700 {\n  --tw-bg-opacity: 1 !important;\n  background-color: rgb(14 116 144 / var(--tw-bg-opacity)) !important;\n}\n\n.dark .dark\\:\\!bg-lime-700 {\n  --tw-bg-opacity: 1 !important;\n  background-color: rgb(77 124 15 / var(--tw-bg-opacity)) !important;\n}\n\n.dark .dark\\:\\!bg-pink-700 {\n  --tw-bg-opacity: 1 !important;\n  background-color: rgb(190 24 93 / var(--tw-bg-opacity)) !important;\n}\n\n.dark .dark\\:\\!bg-gray-700 {\n  --tw-bg-opacity: 1 !important;\n  background-color: rgb(55 65 81 / var(--tw-bg-opacity)) !important;\n}\n\n.dark .dark\\:bg-gray-800 {\n  --tw-bg-opacity: 1;\n  background-color: rgb(31 41 55 / var(--tw-bg-opacity));\n}\n\n.dark .dark\\:bg-gray-700 {\n  --tw-bg-opacity: 1;\n  background-color: rgb(55 65 81 / var(--tw-bg-opacity));\n}\n\n.dark .dark\\:bg-gray-950 {\n  --tw-bg-opacity: 1;\n  background-color: rgb(11 15 25 / var(--tw-bg-opacity));\n}\n\n.dark .dark\\:bg-gray-900 {\n  --tw-bg-opacity: 1;\n  background-color: rgb(17 24 39 / var(--tw-bg-opacity));\n}\n\n.dark .dark\\:bg-transparent {\n  background-color: transparent;\n}\n\n.dark .dark\\:bg-gray-600 {\n  --tw-bg-opacity: 1;\n  background-color: rgb(75 85 99 / var(--tw-bg-opacity));\n}\n\n.dark .dark\\:bg-\\[\\#0b0f19\\] {\n  --tw-bg-opacity: 1;\n  background-color: rgb(11 15 25 / var(--tw-bg-opacity));\n}\n\n.dark .dark\\:bg-indigo-900 {\n  --tw-bg-opacity: 1;\n  background-color: rgb(49 46 129 / var(--tw-bg-opacity));\n}\n\n.dark .dark\\:bg-indigo-500 {\n  --tw-bg-opacity: 1;\n  background-color: rgb(99 102 241 / var(--tw-bg-opacity));\n}\n\n.dark .dark\\:bg-gray-400 {\n  --tw-bg-opacity: 1;\n  background-color: rgb(156 163 175 / var(--tw-bg-opacity));\n}\n\n.dark .dark\\:bg-gray-500 {\n  --tw-bg-opacity: 1;\n  background-color: rgb(107 114 128 / var(--tw-bg-opacity));\n}\n\n.dark .dark\\:bg-white {\n  --tw-bg-opacity: 1;\n  background-color: rgb(255 255 255 / var(--tw-bg-opacity));\n}\n\n.dark .dark\\:bg-red-600 {\n  --tw-bg-opacity: 1;\n  background-color: rgb(220 38 38 / var(--tw-bg-opacity));\n}\n\n.dark .dark\\:bg-opacity-80 {\n  --tw-bg-opacity: 0.8;\n}\n\n.dark .dark\\:from-orange-400 {\n  --tw-gradient-from: #FF9633;\n  --tw-gradient-to: rgb(255 150 51 / 0);\n  --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to);\n}\n\n.dark .dark\\:from-gray-700 {\n  --tw-gradient-from: #374151;\n  --tw-gradient-to: rgb(55 65 81 / 0);\n  --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to);\n}\n\n.dark .dark\\:from-gray-600 {\n  --tw-gradient-from: #4b5563;\n  --tw-gradient-to: rgb(75 85 99 / 0);\n  --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to);\n}\n\n.dark .dark\\:from-indigo-600 {\n  --tw-gradient-from: #4f46e5;\n  --tw-gradient-to: rgb(79 70 229 / 0);\n  --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to);\n}\n\n.dark .dark\\:from-red-700 {\n  --tw-gradient-from: #b91c1c;\n  --tw-gradient-to: rgb(185 28 28 / 0);\n  --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to);\n}\n\n.dark .dark\\:from-indigo-500 {\n  --tw-gradient-from: #6366f1;\n  --tw-gradient-to: rgb(99 102 241 / 0);\n  --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to);\n}\n\n.dark .dark\\:from-gray-900 {\n  --tw-gradient-from: #111827;\n  --tw-gradient-to: rgb(17 24 39 / 0);\n  --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to);\n}\n\n.dark .dark\\:from-blue-500 {\n  --tw-gradient-from: #3b82f6;\n  --tw-gradient-to: rgb(59 130 246 / 0);\n  --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to);\n}\n\n.dark .dark\\:from-gray-500 {\n  --tw-gradient-from: #6b7280;\n  --tw-gradient-to: rgb(107 114 128 / 0);\n  --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to);\n}\n\n.dark .dark\\:from-orange-700 {\n  --tw-gradient-from: #CE6400;\n  --tw-gradient-to: rgb(206 100 0 / 0);\n  --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to);\n}\n\n.dark .dark\\:\\!from-red-700 {\n  --tw-gradient-from: #b91c1c !important;\n  --tw-gradient-to: rgb(185 28 28 / 0) !important;\n  --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to) !important;\n}\n\n.dark .dark\\:\\!from-yellow-700 {\n  --tw-gradient-from: #a16207 !important;\n  --tw-gradient-to: rgb(161 98 7 / 0) !important;\n  --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to) !important;\n}\n\n.dark .dark\\:\\!from-green-700 {\n  --tw-gradient-from: #15803d !important;\n  --tw-gradient-to: rgb(21 128 61 / 0) !important;\n  --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to) !important;\n}\n\n.dark .dark\\:\\!from-blue-700 {\n  --tw-gradient-from: #1d4ed8 !important;\n  --tw-gradient-to: rgb(29 78 216 / 0) !important;\n  --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to) !important;\n}\n\n.dark .dark\\:\\!from-purple-700 {\n  --tw-gradient-from: #7e22ce !important;\n  --tw-gradient-to: rgb(126 34 206 / 0) !important;\n  --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to) !important;\n}\n\n.dark .dark\\:\\!from-gray-700 {\n  --tw-gradient-from: #374151 !important;\n  --tw-gradient-to: rgb(55 65 81 / 0) !important;\n  --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to) !important;\n}\n\n.dark .dark\\:\\!from-pink-700 {\n  --tw-gradient-from: #be185d !important;\n  --tw-gradient-to: rgb(190 24 93 / 0) !important;\n  --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to) !important;\n}\n\n.dark .dark\\:from-\\[rgba\\(0\\2c 0\\2c 0\\2c 0\\)\\] {\n  --tw-gradient-from: rgba(0,0,0,0);\n  --tw-gradient-to: rgb(0 0 0 / 0);\n  --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to);\n}\n\n.dark .dark\\:from-red-500 {\n  --tw-gradient-from: #ef4444;\n  --tw-gradient-to: rgb(239 68 68 / 0);\n  --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to);\n}\n\n.dark .dark\\:to-orange-600 {\n  --tw-gradient-to: #EE7400;\n}\n\n.dark .dark\\:to-gray-800 {\n  --tw-gradient-to: #1f2937;\n}\n\n.dark .dark\\:to-gray-500 {\n  --tw-gradient-to: #6b7280;\n}\n\n.dark .dark\\:to-red-600 {\n  --tw-gradient-to: #dc2626;\n}\n\n.dark .dark\\:to-indigo-700 {\n  --tw-gradient-to: #4338ca;\n}\n\n.dark .dark\\:to-gray-400 {\n  --tw-gradient-to: #9ca3af;\n}\n\n.dark .dark\\:to-orange-700 {\n  --tw-gradient-to: #CE6400;\n}\n\n.dark .dark\\:to-gray-700 {\n  --tw-gradient-to: #374151;\n}\n\n.dark .dark\\:\\!to-red-800 {\n  --tw-gradient-to: #991b1b !important;\n}\n\n.dark .dark\\:\\!to-yellow-800 {\n  --tw-gradient-to: #854d0e !important;\n}\n\n.dark .dark\\:\\!to-green-800 {\n  --tw-gradient-to: #166534 !important;\n}\n\n.dark .dark\\:\\!to-blue-800 {\n  --tw-gradient-to: #1e40af !important;\n}\n\n.dark .dark\\:\\!to-purple-800 {\n  --tw-gradient-to: #6b21a8 !important;\n}\n\n.dark .dark\\:\\!to-gray-800 {\n  --tw-gradient-to: #1f2937 !important;\n}\n\n.dark .dark\\:\\!to-pink-800 {\n  --tw-gradient-to: #9d174d !important;\n}\n\n.dark .dark\\:to-gray-950 {\n  --tw-gradient-to: #0b0f19;\n}\n\n.dark .dark\\:fill-slate-200 {\n  fill: #e2e8f0;\n}\n\n.dark .dark\\:\\!text-red-300 {\n  --tw-text-opacity: 1 !important;\n  color: rgb(252 165 165 / var(--tw-text-opacity)) !important;\n}\n\n.dark .dark\\:\\!text-green-300 {\n  --tw-text-opacity: 1 !important;\n  color: rgb(134 239 172 / var(--tw-text-opacity)) !important;\n}\n\n.dark .dark\\:\\!text-blue-300 {\n  --tw-text-opacity: 1 !important;\n  color: rgb(147 197 253 / var(--tw-text-opacity)) !important;\n}\n\n.dark .dark\\:\\!text-yellow-300 {\n  --tw-text-opacity: 1 !important;\n  color: rgb(253 224 71 / var(--tw-text-opacity)) !important;\n}\n\n.dark .dark\\:\\!text-purple-300 {\n  --tw-text-opacity: 1 !important;\n  color: rgb(216 180 254 / var(--tw-text-opacity)) !important;\n}\n\n.dark .dark\\:\\!text-teal-300 {\n  --tw-text-opacity: 1 !important;\n  color: rgb(94 234 212 / var(--tw-text-opacity)) !important;\n}\n\n.dark .dark\\:\\!text-orange-300 {\n  --tw-text-opacity: 1 !important;\n  color: rgb(255 176 102 / var(--tw-text-opacity)) !important;\n}\n\n.dark .dark\\:\\!text-cyan-300 {\n  --tw-text-opacity: 1 !important;\n  color: rgb(103 232 249 / var(--tw-text-opacity)) !important;\n}\n\n.dark .dark\\:\\!text-lime-300 {\n  --tw-text-opacity: 1 !important;\n  color: rgb(190 242 100 / var(--tw-text-opacity)) !important;\n}\n\n.dark .dark\\:\\!text-pink-300 {\n  --tw-text-opacity: 1 !important;\n  color: rgb(249 168 212 / var(--tw-text-opacity)) !important;\n}\n\n.dark .dark\\:\\!text-gray-300 {\n  --tw-text-opacity: 1 !important;\n  color: rgb(209 213 219 / var(--tw-text-opacity)) !important;\n}\n\n.dark .dark\\:\\!text-gray-50 {\n  --tw-text-opacity: 1 !important;\n  color: rgb(249 250 251 / var(--tw-text-opacity)) !important;\n}\n\n.dark .dark\\:text-pink-600 {\n  --tw-text-opacity: 1;\n  color: rgb(219 39 119 / var(--tw-text-opacity));\n}\n\n.dark .dark\\:text-gray-500 {\n  --tw-text-opacity: 1;\n  color: rgb(107 114 128 / var(--tw-text-opacity));\n}\n\n.dark .dark\\:text-white {\n  --tw-text-opacity: 1;\n  color: rgb(255 255 255 / var(--tw-text-opacity));\n}\n\n.dark .dark\\:text-gray-200 {\n  --tw-text-opacity: 1;\n  color: rgb(229 231 235 / var(--tw-text-opacity));\n}\n\n.dark .dark\\:text-gray-400 {\n  --tw-text-opacity: 1;\n  color: rgb(156 163 175 / var(--tw-text-opacity));\n}\n\n.dark .dark\\:text-slate-200 {\n  --tw-text-opacity: 1;\n  color: rgb(226 232 240 / var(--tw-text-opacity));\n}\n\n.dark .dark\\:text-indigo-300 {\n  --tw-text-opacity: 1;\n  color: rgb(165 180 252 / var(--tw-text-opacity));\n}\n\n.dark .dark\\:text-green-400 {\n  --tw-text-opacity: 1;\n  color: rgb(74 222 128 / var(--tw-text-opacity));\n}\n\n.dark .dark\\:text-slate-300 {\n  --tw-text-opacity: 1;\n  color: rgb(203 213 225 / var(--tw-text-opacity));\n}\n\n.dark .dark\\:text-gray-50 {\n  --tw-text-opacity: 1;\n  color: rgb(249 250 251 / var(--tw-text-opacity));\n}\n\n.dark .dark\\:text-red-100 {\n  --tw-text-opacity: 1;\n  color: rgb(254 226 226 / var(--tw-text-opacity));\n}\n\n.dark .dark\\:text-yellow-100 {\n  --tw-text-opacity: 1;\n  color: rgb(254 249 195 / var(--tw-text-opacity));\n}\n\n.dark .dark\\:text-green-100 {\n  --tw-text-opacity: 1;\n  color: rgb(220 252 231 / var(--tw-text-opacity));\n}\n\n.dark .dark\\:text-blue-100 {\n  --tw-text-opacity: 1;\n  color: rgb(219 234 254 / var(--tw-text-opacity));\n}\n\n.dark .dark\\:text-purple-100 {\n  --tw-text-opacity: 1;\n  color: rgb(243 232 255 / var(--tw-text-opacity));\n}\n\n.dark .dark\\:placeholder-gray-100::placeholder {\n  --tw-placeholder-opacity: 1;\n  color: rgb(243 244 246 / var(--tw-placeholder-opacity));\n}\n\n.dark .dark\\:ring-gray-600 {\n  --tw-ring-opacity: 1;\n  --tw-ring-color: rgb(75 85 99 / var(--tw-ring-opacity));\n}\n\n.dark .dark .dark\\:placeholder\\:text-gray-500::placeholder {\n  --tw-text-opacity: 1;\n  color: rgb(209 213 219 / var(--tw-text-opacity));\n}\n\n.dark .dark\\:placeholder\\:text-gray-500::placeholder {\n  --tw-text-opacity: 1;\n  color: rgb(107 114 128 / var(--tw-text-opacity));\n}\n\n.dark .dark\\:odd\\:bg-gray-900:nth-child(odd) {\n  --tw-bg-opacity: 1;\n  background-color: rgb(17 24 39 / var(--tw-bg-opacity));\n}\n\n.dark .dark\\:focus-within\\:bg-gray-800:focus-within {\n  --tw-bg-opacity: 1;\n  background-color: rgb(31 41 55 / var(--tw-bg-opacity));\n}\n\n.dark .dark\\:hover\\:border-gray-600:hover {\n  --tw-border-opacity: 1;\n  border-color: rgb(75 85 99 / var(--tw-border-opacity));\n}\n\n.dark .dark\\:hover\\:border-orange-700:hover {\n  --tw-border-opacity: 1;\n  border-color: rgb(206 100 0 / var(--tw-border-opacity));\n}\n\n.dark .dark\\:hover\\:bg-amber-600:hover {\n  --tw-bg-opacity: 1;\n  background-color: rgb(217 119 6 / var(--tw-bg-opacity));\n}\n\n.dark .dark\\:hover\\:bg-gray-700:hover {\n  --tw-bg-opacity: 1;\n  background-color: rgb(55 65 81 / var(--tw-bg-opacity));\n}\n\n.dark .dark\\:hover\\:bg-gray-800:hover {\n  --tw-bg-opacity: 1;\n  background-color: rgb(31 41 55 / var(--tw-bg-opacity));\n}\n\n.dark .dark\\:hover\\:from-gray-800:hover {\n  --tw-gradient-from: #1f2937;\n  --tw-gradient-to: rgb(31 41 55 / 0);\n  --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to);\n}\n\n.dark .dark\\:hover\\:to-gray-600:hover {\n  --tw-gradient-to: #4b5563;\n}\n\n.dark .dark\\:hover\\:to-orange-500:hover {\n  --tw-gradient-to: #FF7C00;\n}\n\n.dark .dark\\:hover\\:text-gray-400:hover {\n  --tw-text-opacity: 1;\n  color: rgb(156 163 175 / var(--tw-text-opacity));\n}\n\n.dark .dark\\:focus\\:border-gray-600:focus {\n  --tw-border-opacity: 1;\n  border-color: rgb(75 85 99 / var(--tw-border-opacity));\n}\n\n.dark .dark\\:focus\\:from-blue-900:focus {\n  --tw-gradient-from: #1e3a8a;\n  --tw-gradient-to: rgb(30 58 138 / 0);\n  --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to);\n}\n\n.dark .dark\\:focus\\:to-gray-900:focus {\n  --tw-gradient-to: #111827;\n}\n\n.dark .dark\\:focus\\:ring-0:focus {\n  --tw-ring-offset-shadow: var(--tw-ring-inset) 0 0 0 var(--tw-ring-offset-width) var(--tw-ring-offset-color);\n  --tw-ring-shadow: var(--tw-ring-inset) 0 0 0 calc(0px + var(--tw-ring-offset-width)) var(--tw-ring-color);\n  box-shadow: var(--tw-ring-offset-shadow), var(--tw-ring-shadow), var(--tw-shadow, 0 0 #0000);\n}\n\n.dark .dark\\:focus\\:ring-gray-700:focus {\n  --tw-ring-opacity: 1;\n  --tw-ring-color: rgb(55 65 81 / var(--tw-ring-opacity));\n}\n\n.dark .dark\\:focus\\:ring-offset-indigo-700:focus {\n  --tw-ring-offset-color: #4338ca;\n}\n\n@media (min-width: 640px) {\n\n  .sm\\:grid-cols-1 {\n    grid-template-columns: repeat(1, minmax(0, 1fr));\n  }\n\n  .sm\\:grid-cols-2 {\n    grid-template-columns: repeat(2, minmax(0, 1fr));\n  }\n\n  .sm\\:grid-cols-3 {\n    grid-template-columns: repeat(3, minmax(0, 1fr));\n  }\n\n  .sm\\:grid-cols-4 {\n    grid-template-columns: repeat(4, minmax(0, 1fr));\n  }\n\n  .sm\\:grid-cols-5 {\n    grid-template-columns: repeat(5, minmax(0, 1fr));\n  }\n\n  .sm\\:grid-cols-6 {\n    grid-template-columns: repeat(6, minmax(0, 1fr));\n  }\n\n  .sm\\:grid-cols-7 {\n    grid-template-columns: repeat(7, minmax(0, 1fr));\n  }\n\n  .sm\\:grid-cols-8 {\n    grid-template-columns: repeat(8, minmax(0, 1fr));\n  }\n\n  .sm\\:grid-cols-9 {\n    grid-template-columns: repeat(9, minmax(0, 1fr));\n  }\n\n  .sm\\:grid-cols-10 {\n    grid-template-columns: repeat(10, minmax(0, 1fr));\n  }\n\n  .sm\\:grid-cols-11 {\n    grid-template-columns: repeat(11, minmax(0, 1fr));\n  }\n\n  .sm\\:grid-cols-12 {\n    grid-template-columns: repeat(12, minmax(0, 1fr));\n  }\n}\n\n@media (min-width: 768px) {\n\n  .md\\:left-auto {\n    left: auto;\n  }\n\n  .md\\:right-8 {\n    right: 2rem;\n  }\n\n  .md\\:bottom-4 {\n    bottom: 1rem;\n  }\n\n  .md\\:min-h-\\[15rem\\] {\n    min-height: 15rem;\n  }\n\n  .md\\:w-1\\/2 {\n    width: 50%;\n  }\n\n  .md\\:w-96 {\n    width: 24rem;\n  }\n\n  .md\\:grid-cols-1 {\n    grid-template-columns: repeat(1, minmax(0, 1fr));\n  }\n\n  .md\\:grid-cols-2 {\n    grid-template-columns: repeat(2, minmax(0, 1fr));\n  }\n\n  .md\\:grid-cols-3 {\n    grid-template-columns: repeat(3, minmax(0, 1fr));\n  }\n\n  .md\\:grid-cols-4 {\n    grid-template-columns: repeat(4, minmax(0, 1fr));\n  }\n\n  .md\\:grid-cols-5 {\n    grid-template-columns: repeat(5, minmax(0, 1fr));\n  }\n\n  .md\\:grid-cols-6 {\n    grid-template-columns: repeat(6, minmax(0, 1fr));\n  }\n\n  .md\\:grid-cols-7 {\n    grid-template-columns: repeat(7, minmax(0, 1fr));\n  }\n\n  .md\\:grid-cols-8 {\n    grid-template-columns: repeat(8, minmax(0, 1fr));\n  }\n\n  .md\\:grid-cols-9 {\n    grid-template-columns: repeat(9, minmax(0, 1fr));\n  }\n\n  .md\\:grid-cols-10 {\n    grid-template-columns: repeat(10, minmax(0, 1fr));\n  }\n\n  .md\\:grid-cols-11 {\n    grid-template-columns: repeat(11, minmax(0, 1fr));\n  }\n\n  .md\\:grid-cols-12 {\n    grid-template-columns: repeat(12, minmax(0, 1fr));\n  }\n\n  .md\\:bg-gradient-to-bl {\n    background-image: linear-gradient(to bottom left, var(--tw-gradient-stops));\n  }\n\n  .md\\:text-xl {\n    font-size: 1.25rem;\n    line-height: 1.75rem;\n  }\n}\n\n@media (min-width: 1024px) {\n\n  .lg\\:grid-cols-1 {\n    grid-template-columns: repeat(1, minmax(0, 1fr));\n  }\n\n  .lg\\:grid-cols-2 {\n    grid-template-columns: repeat(2, minmax(0, 1fr));\n  }\n\n  .lg\\:grid-cols-3 {\n    grid-template-columns: repeat(3, minmax(0, 1fr));\n  }\n\n  .lg\\:grid-cols-4 {\n    grid-template-columns: repeat(4, minmax(0, 1fr));\n  }\n\n  .lg\\:grid-cols-5 {\n    grid-template-columns: repeat(5, minmax(0, 1fr));\n  }\n\n  .lg\\:grid-cols-6 {\n    grid-template-columns: repeat(6, minmax(0, 1fr));\n  }\n\n  .lg\\:grid-cols-7 {\n    grid-template-columns: repeat(7, minmax(0, 1fr));\n  }\n\n  .lg\\:grid-cols-8 {\n    grid-template-columns: repeat(8, minmax(0, 1fr));\n  }\n\n  .lg\\:grid-cols-9 {\n    grid-template-columns: repeat(9, minmax(0, 1fr));\n  }\n\n  .lg\\:grid-cols-10 {\n    grid-template-columns: repeat(10, minmax(0, 1fr));\n  }\n\n  .lg\\:grid-cols-11 {\n    grid-template-columns: repeat(11, minmax(0, 1fr));\n  }\n\n  .lg\\:grid-cols-12 {\n    grid-template-columns: repeat(12, minmax(0, 1fr));\n  }\n}\n\n@media (min-width: 1280px) {\n\n  .xl\\:bottom-8 {\n    bottom: 2rem;\n  }\n\n  .xl\\:max-h-\\[18rem\\] {\n    max-height: 18rem;\n  }\n\n  .xl\\:min-h-\\[450px\\] {\n    min-height: 450px;\n  }\n\n  .xl\\:grid-cols-1 {\n    grid-template-columns: repeat(1, minmax(0, 1fr));\n  }\n\n  .xl\\:grid-cols-2 {\n    grid-template-columns: repeat(2, minmax(0, 1fr));\n  }\n\n  .xl\\:grid-cols-3 {\n    grid-template-columns: repeat(3, minmax(0, 1fr));\n  }\n\n  .xl\\:grid-cols-4 {\n    grid-template-columns: repeat(4, minmax(0, 1fr));\n  }\n\n  .xl\\:grid-cols-5 {\n    grid-template-columns: repeat(5, minmax(0, 1fr));\n  }\n\n  .xl\\:grid-cols-6 {\n    grid-template-columns: repeat(6, minmax(0, 1fr));\n  }\n\n  .xl\\:grid-cols-7 {\n    grid-template-columns: repeat(7, minmax(0, 1fr));\n  }\n\n  .xl\\:grid-cols-8 {\n    grid-template-columns: repeat(8, minmax(0, 1fr));\n  }\n\n  .xl\\:grid-cols-9 {\n    grid-template-columns: repeat(9, minmax(0, 1fr));\n  }\n\n  .xl\\:grid-cols-10 {\n    grid-template-columns: repeat(10, minmax(0, 1fr));\n  }\n\n  .xl\\:grid-cols-11 {\n    grid-template-columns: repeat(11, minmax(0, 1fr));\n  }\n\n  .xl\\:grid-cols-12 {\n    grid-template-columns: repeat(12, minmax(0, 1fr));\n  }\n}\n\n@media (min-width: 1536px) {\n\n  .\\32xl\\:max-h-\\[20rem\\] {\n    max-height: 20rem;\n  }\n\n  .\\32xl\\:grid-cols-1 {\n    grid-template-columns: repeat(1, minmax(0, 1fr));\n  }\n\n  .\\32xl\\:grid-cols-2 {\n    grid-template-columns: repeat(2, minmax(0, 1fr));\n  }\n\n  .\\32xl\\:grid-cols-3 {\n    grid-template-columns: repeat(3, minmax(0, 1fr));\n  }\n\n  .\\32xl\\:grid-cols-4 {\n    grid-template-columns: repeat(4, minmax(0, 1fr));\n  }\n\n  .\\32xl\\:grid-cols-5 {\n    grid-template-columns: repeat(5, minmax(0, 1fr));\n  }\n\n  .\\32xl\\:grid-cols-6 {\n    grid-template-columns: repeat(6, minmax(0, 1fr));\n  }\n\n  .\\32xl\\:grid-cols-7 {\n    grid-template-columns: repeat(7, minmax(0, 1fr));\n  }\n\n  .\\32xl\\:grid-cols-8 {\n    grid-template-columns: repeat(8, minmax(0, 1fr));\n  }\n\n  .\\32xl\\:grid-cols-9 {\n    grid-template-columns: repeat(9, minmax(0, 1fr));\n  }\n\n  .\\32xl\\:grid-cols-10 {\n    grid-template-columns: repeat(10, minmax(0, 1fr));\n  }\n\n  .\\32xl\\:grid-cols-11 {\n    grid-template-columns: repeat(11, minmax(0, 1fr));\n  }\n\n  .\\32xl\\:grid-cols-12 {\n    grid-template-columns: repeat(12, minmax(0, 1fr));\n  }\n}\n";

var tokens = ".dark .gr-box {\n\t\t--tw-text-opacity: 1;\n\t\tcolor: rgb(229 231 235 / var(--tw-text-opacity));\n\t\tbackground-color: #0b0f19;\n\t\t--tw-bg-opacity: 1;\n\t\tbackground-color: rgb(11 15 25 / var(--tw-bg-opacity));\n}\n\n.gr-box {\n\t\tposition: relative;\n\t\tborder-radius: 0.5rem;\n\t\t--tw-bg-opacity: 1;\n\t\tbackground-color: rgb(255 255 255 / var(--tw-bg-opacity));\n\t\tfont-size: 0.875rem;\n\t\tline-height: 1.25rem;\n\t\t--tw-text-opacity: 1;\n\t\tcolor: rgb(55 65 81 / var(--tw-text-opacity));\n\t\t--tw-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05);\n\t\t--tw-shadow-colored: 0 1px 2px 0 var(--tw-shadow-color);\n\t\tbox-shadow: var(--tw-ring-offset-shadow, 0 0 #0000), var(--tw-ring-shadow, 0 0 #0000), var(--tw-shadow);\n}\n\n.dark .gr-box {\n\t\t--tw-bg-opacity: 1;\n\t\tbackground-color: rgb(31 41 55 / var(--tw-bg-opacity));\n}\n\n.dark .gr-box-unrounded {\n\t\t--tw-text-opacity: 1;\n\t\tcolor: rgb(229 231 235 / var(--tw-text-opacity));\n\t\tbackground-color: #0b0f19;\n\t\t--tw-bg-opacity: 1;\n\t\tbackground-color: rgb(11 15 25 / var(--tw-bg-opacity));\n}\n\n.gr-box-unrounded {\n\t\tposition: relative;\n\t\t--tw-bg-opacity: 1;\n\t\tbackground-color: rgb(255 255 255 / var(--tw-bg-opacity));\n\t\tfont-size: 0.875rem;\n\t\tline-height: 1.25rem;\n\t\t--tw-text-opacity: 1;\n\t\tcolor: rgb(55 65 81 / var(--tw-text-opacity));\n\t\t--tw-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05);\n\t\t--tw-shadow-colored: 0 1px 2px 0 var(--tw-shadow-color);\n\t\tbox-shadow: var(--tw-ring-offset-shadow, 0 0 #0000), var(--tw-ring-shadow, 0 0 #0000), var(--tw-shadow);\n}\n\n.dark .gr-box-unrounded {\n\t\t--tw-bg-opacity: 1;\n\t\tbackground-color: rgb(31 41 55 / var(--tw-bg-opacity));\n}\n\n\n\t.dark .gr-input {\n\t\t--tw-border-opacity: 1;\n\t\tborder-color: rgb(55 65 81 / var(--tw-border-opacity));\n}\n\n.gr-input {\n\t\t--tw-border-opacity: 1;\n\t\tborder-color: rgb(229 231 235 / var(--tw-border-opacity));\n}\n\n.gr-input::placeholder {\n\t\t--tw-text-opacity: 1;\n\t\tcolor: rgb(156 163 175 / var(--tw-text-opacity));\n}\n\n.gr-input:checked {\n\t\t--tw-shadow: inset 0 2px 4px 0 rgb(0 0 0 / 0.05);\n\t\t--tw-shadow-colored: inset 0 2px 4px 0 var(--tw-shadow-color);\n\t\tbox-shadow: var(--tw-ring-offset-shadow, 0 0 #0000), var(--tw-ring-shadow, 0 0 #0000), var(--tw-shadow);\n}\n\n.gr-input:focus {\n\t\t--tw-border-opacity: 1;\n\t\tborder-color: rgb(147 197 253 / var(--tw-border-opacity));\n\t\t--tw-ring-offset-shadow: var(--tw-ring-inset) 0 0 0 var(--tw-ring-offset-width) var(--tw-ring-offset-color);\n\t\t--tw-ring-shadow: var(--tw-ring-inset) 0 0 0 calc(3px + var(--tw-ring-offset-width)) var(--tw-ring-color);\n\t\tbox-shadow: var(--tw-ring-offset-shadow), var(--tw-ring-shadow), var(--tw-shadow, 0 0 #0000);\n\t\t--tw-ring-color: rgb(191 219 254 / var(--tw-ring-opacity));\n\t\t--tw-ring-opacity: 0.5;\n}\n\n.dark .gr-input {\n\t\t--tw-border-opacity: 1;\n\t\tborder-color: rgb(55 65 81 / var(--tw-border-opacity));\n\t\t--tw-text-opacity: 1;\n\t\tcolor: rgb(229 231 235 / var(--tw-text-opacity));\n}\n\n.dark .dark .gr-input::placeholder {\n\t\t--tw-text-opacity: 1;\n\t\tcolor: rgb(209 213 219 / var(--tw-text-opacity));\n}\n\n.dark .gr-input::placeholder {\n\t\t--tw-text-opacity: 1;\n\t\tcolor: rgb(107 114 128 / var(--tw-text-opacity));\n}\n\n.dark .gr-input:focus {\n\t\t--tw-border-opacity: 1;\n\t\tborder-color: rgb(75 85 99 / var(--tw-border-opacity));\n\t\t--tw-ring-offset-shadow: var(--tw-ring-inset) 0 0 0 var(--tw-ring-offset-width) var(--tw-ring-offset-color);\n\t\t--tw-ring-shadow: var(--tw-ring-inset) 0 0 0 calc(0px + var(--tw-ring-offset-width)) var(--tw-ring-color);\n\t\tbox-shadow: var(--tw-ring-offset-shadow), var(--tw-ring-shadow), var(--tw-shadow, 0 0 #0000);\n}\n\n\n\t.dark .gr-label {\n\t\t--tw-text-opacity: 1;\n\t\tcolor: rgb(209 213 219 / var(--tw-text-opacity));\n}\n\n.gr-label {\n\t\tmargin-bottom: 0.5rem;\n\t\tdisplay: block;\n\t\tfont-size: 0.875rem;\n\t\tline-height: 1.25rem;\n\t\t--tw-text-opacity: 1;\n\t\tcolor: rgb(75 85 99 / var(--tw-text-opacity));\n}\n\n.gr-panel {\n\t\tpadding-top: 0.625rem;\n\t\tpadding-bottom: 0.625rem;\n\t\tpadding-left: 0.75rem;\n\t\tpadding-right: 0.75rem;\n}\n\n.dark .gr-box-sm,  \n\t.dark .gr-box-sm-gray-100,  \n\t.dark .gr-box-sm-gray-200,  \n\t.dark .gr-box-sm-gray-300 {\n\t\t--tw-border-opacity: 1;\n\t\tborder-color: rgb(55 65 81 / var(--tw-border-opacity));\n}\n\n.gr-box-sm > :not([hidden]) ~ :not([hidden]) {\n\t\t--tw-space-x-reverse: 0;\n\t\tmargin-right: calc(0.5rem * var(--tw-space-x-reverse));\n\t\tmargin-left: calc(0.5rem * calc(1 - var(--tw-space-x-reverse)));\n}\n\n.gr-box-sm {\n\t\tborder-width: 1px;\n\t\tpadding-top: 0.375rem;\n\t\tpadding-bottom: 0.375rem;\n\t\tpadding-left: 0.75rem;\n\t\tpadding-right: 0.75rem;\n}\n\n.gr-text-input {\n\t\tpadding: 0.625rem;\n\t\t--tw-shadow: inset 0 2px 4px 0 rgb(0 0 0 / 0.05);\n\t\t--tw-shadow-colored: inset 0 2px 4px 0 var(--tw-shadow-color);\n\t\tbox-shadow: var(--tw-ring-offset-shadow, 0 0 #0000), var(--tw-ring-shadow, 0 0 #0000), var(--tw-shadow);\n}\n\n.gr-text-input:disabled {\n\t\t--tw-shadow: 0 0 #0000;\n\t\t--tw-shadow-colored: 0 0 #0000;\n\t\tbox-shadow: var(--tw-ring-offset-shadow, 0 0 #0000), var(--tw-ring-shadow, 0 0 #0000), var(--tw-shadow);\n}\n\n\n\t.dark .gr-check-radio {\n\t\t--tw-border-opacity: 1;\n\t\tborder-color: rgb(55 65 81 / var(--tw-border-opacity));\n}\n\n.gr-check-radio {\n\t\t--tw-border-opacity: 1;\n\t\tborder-color: rgb(209 213 219 / var(--tw-border-opacity));\n\t\t--tw-text-opacity: 1;\n\t\tcolor: rgb(37 99 235 / var(--tw-text-opacity));\n\t\t--tw-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05);\n\t\t--tw-shadow-colored: 0 1px 2px 0 var(--tw-shadow-color);\n\t\tbox-shadow: var(--tw-ring-offset-shadow, 0 0 #0000), var(--tw-ring-shadow, 0 0 #0000), var(--tw-shadow);\n}\n\n.gr-check-radio:focus {\n\t\t--tw-border-opacity: 1;\n\t\tborder-color: rgb(147 197 253 / var(--tw-border-opacity));\n\t\t--tw-ring-offset-shadow: var(--tw-ring-inset) 0 0 0 var(--tw-ring-offset-width) var(--tw-ring-offset-color);\n\t\t--tw-ring-shadow: var(--tw-ring-inset) 0 0 0 calc(3px + var(--tw-ring-offset-width)) var(--tw-ring-color);\n\t\tbox-shadow: var(--tw-ring-offset-shadow), var(--tw-ring-shadow), var(--tw-shadow, 0 0 #0000);\n\t\t--tw-ring-color: rgb(191 219 254 / var(--tw-ring-opacity));\n\t\t--tw-ring-opacity: 0.5;\n\t\t--tw-ring-offset-width: 0px;\n}\n\n.gr-check-radio:disabled {\n\t\tcursor: not-allowed !important;\n\t\t--tw-text-opacity: 1;\n\t\tcolor: rgb(156 163 175 / var(--tw-text-opacity));\n}\n\n.dark .gr-check-radio {\n\t\t--tw-border-opacity: 1;\n\t\tborder-color: rgb(55 65 81 / var(--tw-border-opacity));\n\t\t--tw-bg-opacity: 1;\n\t\tbackground-color: rgb(17 24 39 / var(--tw-bg-opacity));\n}\n\n.dark .gr-check-radio:checked {\n\t\t--tw-bg-opacity: 1;\n\t\tbackground-color: rgb(37 99 235 / var(--tw-bg-opacity));\n}\n\n.dark .gr-check-radio:focus {\n\t\t--tw-ring-opacity: 1;\n\t\t--tw-ring-color: rgb(55 65 81 / var(--tw-ring-opacity));\n}\n\n.gr-checkbox {\n\t\tborder-radius: 0.25rem;\n}\n\n.gr-input-label {\n\t\tbackground-image: linear-gradient(to top, var(--tw-gradient-stops));\n\t\t--tw-gradient-from: #f9fafb;\n\t\t--tw-gradient-to: rgb(249 250 251 / 0);\n\t\t--tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to);\n\t\t--tw-gradient-to: #fff;\n\t\ttransition-property: color, background-color, border-color, text-decoration-color, fill, stroke, opacity, box-shadow, transform, filter, backdrop-filter;\n\t\ttransition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);\n\t\ttransition-duration: 150ms;\n}\n\n.gr-input-label:hover {\n\t\t--tw-gradient-from: #f3f4f6;\n\t\t--tw-gradient-to: rgb(243 244 246 / 0);\n\t\t--tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to);\n}\n\n.dark .gr-input-label {\n\t\t--tw-gradient-from: #111827;\n\t\t--tw-gradient-to: rgb(17 24 39 / 0);\n\t\t--tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to);\n\t\t--tw-gradient-to: #1f2937;\n}\n\n.gr-radio {\n\t\tborder-radius: 9999px;\n}\n\n.dark .gr-button,  \n\t.dark .gr-button-gray-100,  \n\t.dark .gr-button-gray-200,  \n\t.dark .gr-button-gray-300 {\n\t\t--tw-border-opacity: 1;\n\t\tborder-color: rgb(55 65 81 / var(--tw-border-opacity));\n}\n\n.dark .gr-button {\n\t\tbackground-color: #0b0f19;\n\t\t--tw-bg-opacity: 1;\n\t\tbackground-color: rgb(11 15 25 / var(--tw-bg-opacity));\n\t}\n\n.gr-button {\n\t\tdisplay: inline-flex;\n\t\talign-items: center;\n\t\tjustify-content: center;\n\t\tborder-radius: 0.25rem;\n\t\tborder-width: 1px;\n\t\t--tw-bg-opacity: 1;\n\t\tbackground-color: rgb(255 255 255 / var(--tw-bg-opacity));\n\t\tbackground-image: linear-gradient(to bottom right, var(--tw-gradient-stops));\n\t\tpadding-left: 0.5rem;\n\t\tpadding-right: 0.5rem;\n\t\tpadding-top: 0.125rem;\n\t\tpadding-bottom: 0.125rem;\n\t\ttext-align: center;\n\t\tfont-size: 0.875rem;\n\t\tline-height: 1.25rem;\n\t\t--tw-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05);\n\t\t--tw-shadow-colored: 0 1px 2px 0 var(--tw-shadow-color);\n\t\tbox-shadow: var(--tw-ring-offset-shadow, 0 0 #0000), var(--tw-ring-shadow, 0 0 #0000), var(--tw-shadow);\n}\n\n.gr-button:hover {\n\t\t--tw-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1);\n\t\t--tw-shadow-colored: 0 1px 3px 0 var(--tw-shadow-color), 0 1px 2px -1px var(--tw-shadow-color);\n\t\tbox-shadow: var(--tw-ring-offset-shadow, 0 0 #0000), var(--tw-ring-shadow, 0 0 #0000), var(--tw-shadow);\n}\n\n.gr-button:active {\n\t\t--tw-shadow: inset 0 2px 4px 0 rgb(0 0 0 / 0.05);\n\t\t--tw-shadow-colored: inset 0 2px 4px 0 var(--tw-shadow-color);\n\t\tbox-shadow: var(--tw-ring-offset-shadow, 0 0 #0000), var(--tw-ring-shadow, 0 0 #0000), var(--tw-shadow);\n}\n\n.dark .gr-button {\n\t\t--tw-border-opacity: 1;\n\t\tborder-color: rgb(75 85 99 / var(--tw-border-opacity));\n\t\t--tw-bg-opacity: 1;\n\t\tbackground-color: rgb(55 65 81 / var(--tw-bg-opacity));\n}\n\n.gr-button-primary {\n\t\t--tw-border-opacity: 1;\n\t\tborder-color: rgb(255 216 180 / var(--tw-border-opacity));\n\t\t--tw-gradient-from: rgb(255 216 180 / 0.7);\n\t\t--tw-gradient-to: rgb(255 216 180 / 0);\n\t\t--tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to);\n\t\t--tw-gradient-to: rgb(255 176 102 / 0.8);\n\t\t--tw-text-opacity: 1;\n\t\tcolor: rgb(238 116 0 / var(--tw-text-opacity));\n}\n\n.gr-button-primary:hover {\n\t\t--tw-gradient-to: rgb(255 216 180 / 0.9);\n}\n\n.dark .gr-button-primary {\n\t\t--tw-border-opacity: 1;\n\t\tborder-color: rgb(238 116 0 / var(--tw-border-opacity));\n\t\t--tw-gradient-from: #CE6400;\n\t\t--tw-gradient-to: rgb(206 100 0 / 0);\n\t\t--tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to);\n\t\t--tw-gradient-to: #CE6400;\n\t\t--tw-text-opacity: 1;\n\t\tcolor: rgb(255 255 255 / var(--tw-text-opacity));\n}\n\n.dark .gr-button-primary:hover {\n\t\t--tw-gradient-to: #FF7C00;\n}\n\n.dark .gr-button-secondary {\n\t\t--tw-text-opacity: 1;\n\t\tcolor: rgb(229 231 235 / var(--tw-text-opacity));\n}\n\n\n\t.dark .gr-button-secondary {\n\t\t--tw-border-opacity: 1;\n\t\tborder-color: rgb(55 65 81 / var(--tw-border-opacity));\n}\n\n.gr-button-secondary {\n\t\t--tw-border-opacity: 1;\n\t\tborder-color: rgb(229 231 235 / var(--tw-border-opacity));\n\t\t--tw-gradient-from: rgb(243 244 246 / 0.7);\n\t\t--tw-gradient-to: rgb(243 244 246 / 0);\n\t\t--tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to);\n\t\t--tw-gradient-to: rgb(229 231 235 / 0.8);\n\t\t--tw-text-opacity: 1;\n\t\tcolor: rgb(55 65 81 / var(--tw-text-opacity));\n}\n\n.gr-button-secondary:hover {\n\t\t--tw-gradient-to: rgb(243 244 246 / 0.9);\n}\n\n.dark .gr-button-secondary {\n\t\t--tw-border-opacity: 1;\n\t\tborder-color: rgb(75 85 99 / var(--tw-border-opacity));\n\t\t--tw-gradient-from: #4b5563;\n\t\t--tw-gradient-to: rgb(75 85 99 / 0);\n\t\t--tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to);\n\t\t--tw-gradient-to: #374151;\n\t\t--tw-text-opacity: 1;\n\t\tcolor: rgb(255 255 255 / var(--tw-text-opacity));\n}\n\n.dark .gr-button-secondary:hover {\n\t\t--tw-gradient-to: #4b5563;\n}\n\n.gr-button-sm {\n\t\tborder-radius: 0.375rem;\n\t\tpadding-left: 0.75rem;\n\t\tpadding-right: 0.75rem;\n\t\tpadding-top: 0.25rem;\n\t\tpadding-bottom: 0.25rem;\n\t\tfont-size: 0.875rem;\n\t\tline-height: 1.25rem;\n}\n\n.gr-button-lg {\n\t\tborder-radius: 0.5rem;\n\t\tpadding-top: 0.5rem;\n\t\tpadding-bottom: 0.5rem;\n\t\tpadding-left: 1rem;\n\t\tpadding-right: 1rem;\n\t\tfont-size: 1rem;\n\t\tline-height: 1.5rem;\n\t\tfont-weight: 600;\n}\n\n.gr-samples-table {\n\t\twidth: 100%;\n}\n\n.gr-samples-table img.gr-sample-image, \n\t.gr-samples-table video.gr-sample-video {\n\t\theight: 5rem;\n\t\twidth: 5rem;\n\t\tobject-fit: cover;\n}\n\n.gr-samples-gallery {\n\t\tdisplay: flex;\n\t\tflex-wrap: wrap;\n\t\tgap: 0.5rem;\n}\n\n.gr-samples-gallery img.gr-sample-image, \n\t.gr-samples-gallery video.gr-sample-video {\n\t\tmax-height: 5rem;\n\t\tobject-fit: cover;\n}\n\n.dark .gr-samples-gallery .gr-sample-textbox,  \n\t.dark .gr-samples-gallery .gr-sample-textbox-gray-100,  \n\t.dark .gr-samples-gallery .gr-sample-textbox-gray-200,  \n\t.dark .gr-samples-gallery .gr-sample-textbox-gray-300,  .dark \n\t.gr-samples-gallery .gr-sample-slider,  \n\t.dark \n\t.gr-samples-gallery .gr-sample-slider-gray-100,  \n\t.dark \n\t.gr-samples-gallery .gr-sample-slider-gray-200,  \n\t.dark \n\t.gr-samples-gallery .gr-sample-slider-gray-300,  .dark \n\t.gr-samples-gallery .gr-sample-checkbox,  \n\t.dark \n\t.gr-samples-gallery .gr-sample-checkbox-gray-100,  \n\t.dark \n\t.gr-samples-gallery .gr-sample-checkbox-gray-200,  \n\t.dark \n\t.gr-samples-gallery .gr-sample-checkbox-gray-300,  .dark \n\t.gr-samples-gallery .gr-sample-checkboxgroup,  \n\t.dark \n\t.gr-samples-gallery .gr-sample-checkboxgroup-gray-100,  \n\t.dark \n\t.gr-samples-gallery .gr-sample-checkboxgroup-gray-200,  \n\t.dark \n\t.gr-samples-gallery .gr-sample-checkboxgroup-gray-300,  .dark \n\t.gr-samples-gallery .gr-sample-file,  \n\t.dark \n\t.gr-samples-gallery .gr-sample-file-gray-100,  \n\t.dark \n\t.gr-samples-gallery .gr-sample-file-gray-200,  \n\t.dark \n\t.gr-samples-gallery .gr-sample-file-gray-300,  .dark \n\t.gr-samples-gallery .gr-sample-number,  \n\t.dark \n\t.gr-samples-gallery .gr-sample-number-gray-100,  \n\t.dark \n\t.gr-samples-gallery .gr-sample-number-gray-200,  \n\t.dark \n\t.gr-samples-gallery .gr-sample-number-gray-300,  .dark \n\t.gr-samples-gallery .gr-sample-audio,  \n\t.dark \n\t.gr-samples-gallery .gr-sample-audio-gray-100,  \n\t.dark \n\t.gr-samples-gallery .gr-sample-audio-gray-200,  \n\t.dark \n\t.gr-samples-gallery .gr-sample-audio-gray-300,  .dark \n\t.gr-samples-gallery .gr-sample-3d,  \n\t.dark \n\t.gr-samples-gallery .gr-sample-3d-gray-100,  \n\t.dark \n\t.gr-samples-gallery .gr-sample-3d-gray-200,  \n\t.dark \n\t.gr-samples-gallery .gr-sample-3d-gray-300 {\n\t\t--tw-border-opacity: 1;\n\t\tborder-color: rgb(55 65 81 / var(--tw-border-opacity));\n}\n\n.dark .gr-samples-gallery .gr-sample-textbox,  .dark \n\t.gr-samples-gallery .gr-sample-slider,  .dark \n\t.gr-samples-gallery .gr-sample-checkbox,  .dark \n\t.gr-samples-gallery .gr-sample-checkboxgroup,  .dark \n\t.gr-samples-gallery .gr-sample-file,  .dark \n\t.gr-samples-gallery .gr-sample-number,  .dark \n\t.gr-samples-gallery .gr-sample-audio,  .dark \n\t.gr-samples-gallery .gr-sample-3d {\n\t\tbackground-color: #0b0f19;\n\t\t--tw-bg-opacity: 1;\n\t\tbackground-color: rgb(11 15 25 / var(--tw-bg-opacity));\n\t}\n\n.gr-samples-gallery .gr-sample-textbox, \n\t.gr-samples-gallery .gr-sample-slider, \n\t.gr-samples-gallery .gr-sample-checkbox, \n\t.gr-samples-gallery .gr-sample-checkboxgroup, \n\t.gr-samples-gallery .gr-sample-file, \n\t.gr-samples-gallery .gr-sample-number, \n\t.gr-samples-gallery .gr-sample-audio, \n\t.gr-samples-gallery .gr-sample-3d {\n\t\tdisplay: flex;\n\t\tcursor: pointer;\n\t\talign-items: center;\n\t\tborder-radius: 0.5rem;\n\t\tborder-width: 1px;\n\t\t--tw-bg-opacity: 1;\n\t\tbackground-color: rgb(255 255 255 / var(--tw-bg-opacity));\n\t\tpadding-left: 0.5rem;\n\t\tpadding-right: 0.5rem;\n\t\tpadding-top: 0.375rem;\n\t\tpadding-bottom: 0.375rem;\n\t\ttext-align: left;\n\t\tfont-size: 0.875rem;\n\t\tline-height: 1.25rem;\n}\n\n.dark .gr-samples-gallery .gr-sample-textbox:hover,  .dark \n\t.gr-samples-gallery .gr-sample-slider:hover,  .dark \n\t.gr-samples-gallery .gr-sample-checkbox:hover,  .dark \n\t.gr-samples-gallery .gr-sample-checkboxgroup:hover,  .dark \n\t.gr-samples-gallery .gr-sample-file:hover,  .dark \n\t.gr-samples-gallery .gr-sample-number:hover,  .dark \n\t.gr-samples-gallery .gr-sample-audio:hover,  .dark \n\t.gr-samples-gallery .gr-sample-3d:hover {\n\t\t--tw-bg-opacity: 1;\n\t\tbackground-color: rgb(17 24 39 / var(--tw-bg-opacity));\n}\n\n.gr-samples-gallery .gr-sample-textbox:hover, \n\t.gr-samples-gallery .gr-sample-slider:hover, \n\t.gr-samples-gallery .gr-sample-checkbox:hover, \n\t.gr-samples-gallery .gr-sample-checkboxgroup:hover, \n\t.gr-samples-gallery .gr-sample-file:hover, \n\t.gr-samples-gallery .gr-sample-number:hover, \n\t.gr-samples-gallery .gr-sample-audio:hover, \n\t.gr-samples-gallery .gr-sample-3d:hover {\n\t\t--tw-bg-opacity: 1;\n\t\tbackground-color: rgb(249 250 251 / var(--tw-bg-opacity));\n}\n\n.dark .gr-samples-gallery .gr-sample-textbox, .dark \n\t.gr-samples-gallery .gr-sample-slider, .dark \n\t.gr-samples-gallery .gr-sample-checkbox, .dark \n\t.gr-samples-gallery .gr-sample-checkboxgroup, .dark \n\t.gr-samples-gallery .gr-sample-file, .dark \n\t.gr-samples-gallery .gr-sample-number, .dark \n\t.gr-samples-gallery .gr-sample-audio, .dark \n\t.gr-samples-gallery .gr-sample-3d {\n\t\tbackground-color: transparent;\n}\n\n.dark .gr-samples-gallery .gr-sample-textbox:hover, .dark \n\t.gr-samples-gallery .gr-sample-slider:hover, .dark \n\t.gr-samples-gallery .gr-sample-checkbox:hover, .dark \n\t.gr-samples-gallery .gr-sample-checkboxgroup:hover, .dark \n\t.gr-samples-gallery .gr-sample-file:hover, .dark \n\t.gr-samples-gallery .gr-sample-number:hover, .dark \n\t.gr-samples-gallery .gr-sample-audio:hover, .dark \n\t.gr-samples-gallery .gr-sample-3d:hover {\n\t\t--tw-bg-opacity: 1;\n\t\tbackground-color: rgb(31 41 55 / var(--tw-bg-opacity));\n}\n\n.dark .gr-samples-gallery .gr-sample-dataframe,  \n\t.dark .gr-samples-gallery .gr-sample-dataframe-gray-100,  \n\t.dark .gr-samples-gallery .gr-sample-dataframe-gray-200,  \n\t.dark .gr-samples-gallery .gr-sample-dataframe-gray-300 {\n\t\t--tw-border-opacity: 1;\n\t\tborder-color: rgb(55 65 81 / var(--tw-border-opacity));\n}\n\n.dark .gr-samples-gallery .gr-sample-dataframe {\n\t\tbackground-color: #0b0f19;\n\t\t--tw-bg-opacity: 1;\n\t\tbackground-color: rgb(11 15 25 / var(--tw-bg-opacity));\n\t}\n\n.gr-samples-gallery .gr-sample-dataframe {\n\t\tborder-collapse: collapse;\n\t\tcursor: pointer;\n\t\talign-items: center;\n\t\toverflow: hidden;\n\t\tborder-radius: 0.5rem;\n\t\tborder-width: 1px;\n\t\t--tw-bg-opacity: 1;\n\t\tbackground-color: rgb(255 255 255 / var(--tw-bg-opacity));\n\t\tpadding-left: 0.5rem;\n\t\tpadding-right: 0.5rem;\n\t\tpadding-top: 0.375rem;\n\t\tpadding-bottom: 0.375rem;\n\t\ttext-align: left;\n\t\tfont-size: 0.875rem;\n\t\tline-height: 1.25rem;\n}\n\n.dark .gr-samples-gallery .gr-sample-dataframe:hover {\n\t\t--tw-bg-opacity: 1;\n\t\tbackground-color: rgb(17 24 39 / var(--tw-bg-opacity));\n}\n\n.gr-samples-gallery .gr-sample-dataframe:hover {\n\t\t--tw-bg-opacity: 1;\n\t\tbackground-color: rgb(249 250 251 / var(--tw-bg-opacity));\n}\n\n.dark .gr-samples-gallery .gr-sample-dataframe {\n\t\tbackground-color: transparent;\n}\n\n.dark .gr-samples-gallery .gr-sample-dataframe:hover {\n\t\t--tw-bg-opacity: 1;\n\t\tbackground-color: rgb(31 41 55 / var(--tw-bg-opacity));\n}\n\n\n\t.dark img.gr-sample-image,  \n\t.dark \nvideo.gr-sample-video {\n\t\t--tw-border-opacity: 1;\n\t\tborder-color: rgb(55 65 81 / var(--tw-border-opacity));\n}\n\nimg.gr-sample-image, \nvideo.gr-sample-video {\n\t\tmax-width: none;\n\t\tflex: none;\n\t\tborder-radius: 0.5rem;\n\t\tborder-width: 2px;\n\t\t--tw-border-opacity: 1;\n\t\tborder-color: rgb(229 231 235 / var(--tw-border-opacity));\n}\n\nimg.gr-sample-image:hover, \nvideo.gr-sample-video:hover {\n\t\t--tw-border-opacity: 1;\n\t\tborder-color: rgb(255 150 51 / var(--tw-border-opacity));\n}\n\n.group:hover img.gr-sample-image, .group:hover \nvideo.gr-sample-video {\n\t\t--tw-border-opacity: 1;\n\t\tborder-color: rgb(255 150 51 / var(--tw-border-opacity));\n}\n\n.dark img.gr-sample-image, .dark \nvideo.gr-sample-video {\n\t\t--tw-border-opacity: 1;\n\t\tborder-color: rgb(55 65 81 / var(--tw-border-opacity));\n}\n\n.dark img.gr-sample-image:hover, .dark \nvideo.gr-sample-video:hover {\n\t\t--tw-border-opacity: 1;\n\t\tborder-color: rgb(206 100 0 / var(--tw-border-opacity));\n}\n\n.dark .group:hover img.gr-sample-image, .dark .group:hover \nvideo.gr-sample-video {\n\t\t--tw-border-opacity: 1;\n\t\tborder-color: rgb(206 100 0 / var(--tw-border-opacity));\n}\n";

var colors$2 = {};

var log$1 = {};

var picocolors_browser = {exports: {}};

var x=String;
var create=function() {return {isColorSupported:false,reset:x,bold:x,dim:x,italic:x,underline:x,inverse:x,hidden:x,strikethrough:x,black:x,red:x,green:x,yellow:x,blue:x,magenta:x,cyan:x,white:x,gray:x,bgBlack:x,bgRed:x,bgGreen:x,bgYellow:x,bgBlue:x,bgMagenta:x,bgCyan:x,bgWhite:x}};
picocolors_browser.exports=create();
picocolors_browser.exports.createColors = create;

Object.defineProperty(log$1, "__esModule", {
    value: true
});
log$1.dim = dim;
log$1.default = void 0;
var _picocolors = _interopRequireDefault$1(picocolors_browser.exports);
function _interopRequireDefault$1(obj) {
    return obj && obj.__esModule ? obj : {
        default: obj
    };
}
let alreadyShown = new Set();
function log(type, messages, key) {
    if (typeof process !== "undefined" && ({}).JEST_WORKER_ID) return;
    if (key && alreadyShown.has(key)) return;
    if (key) alreadyShown.add(key);
    console.warn("");
    messages.forEach((message)=>console.warn(type, "-", message));
}
function dim(input) {
    return _picocolors.default.dim(input);
}
var _default$1 = {
    info (key, messages) {
        log(_picocolors.default.bold(_picocolors.default.cyan("info")), ...Array.isArray(key) ? [
            key
        ] : [
            messages,
            key
        ]);
    },
    warn (key, messages) {
        log(_picocolors.default.bold(_picocolors.default.yellow("warn")), ...Array.isArray(key) ? [
            key
        ] : [
            messages,
            key
        ]);
    },
    risk (key, messages) {
        log(_picocolors.default.bold(_picocolors.default.magenta("risk")), ...Array.isArray(key) ? [
            key
        ] : [
            messages,
            key
        ]);
    }
};
log$1.default = _default$1;

Object.defineProperty(colors$2, "__esModule", {
    value: true
});
colors$2.default = void 0;
var _log = _interopRequireDefault(log$1);
function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : {
        default: obj
    };
}
function warn({ version , from , to  }) {
    _log.default.warn(`${from}-color-renamed`, [
        `As of Tailwind CSS ${version}, \`${from}\` has been renamed to \`${to}\`.`,
        "Update your configuration file to silence this warning.", 
    ]);
}
var _default = {
    inherit: "inherit",
    current: "currentColor",
    transparent: "transparent",
    black: "#000",
    white: "#fff",
    slate: {
        50: "#f8fafc",
        100: "#f1f5f9",
        200: "#e2e8f0",
        300: "#cbd5e1",
        400: "#94a3b8",
        500: "#64748b",
        600: "#475569",
        700: "#334155",
        800: "#1e293b",
        900: "#0f172a"
    },
    gray: {
        50: "#f9fafb",
        100: "#f3f4f6",
        200: "#e5e7eb",
        300: "#d1d5db",
        400: "#9ca3af",
        500: "#6b7280",
        600: "#4b5563",
        700: "#374151",
        800: "#1f2937",
        900: "#111827"
    },
    zinc: {
        50: "#fafafa",
        100: "#f4f4f5",
        200: "#e4e4e7",
        300: "#d4d4d8",
        400: "#a1a1aa",
        500: "#71717a",
        600: "#52525b",
        700: "#3f3f46",
        800: "#27272a",
        900: "#18181b"
    },
    neutral: {
        50: "#fafafa",
        100: "#f5f5f5",
        200: "#e5e5e5",
        300: "#d4d4d4",
        400: "#a3a3a3",
        500: "#737373",
        600: "#525252",
        700: "#404040",
        800: "#262626",
        900: "#171717"
    },
    stone: {
        50: "#fafaf9",
        100: "#f5f5f4",
        200: "#e7e5e4",
        300: "#d6d3d1",
        400: "#a8a29e",
        500: "#78716c",
        600: "#57534e",
        700: "#44403c",
        800: "#292524",
        900: "#1c1917"
    },
    red: {
        50: "#fef2f2",
        100: "#fee2e2",
        200: "#fecaca",
        300: "#fca5a5",
        400: "#f87171",
        500: "#ef4444",
        600: "#dc2626",
        700: "#b91c1c",
        800: "#991b1b",
        900: "#7f1d1d"
    },
    orange: {
        50: "#fff7ed",
        100: "#ffedd5",
        200: "#fed7aa",
        300: "#fdba74",
        400: "#fb923c",
        500: "#f97316",
        600: "#ea580c",
        700: "#c2410c",
        800: "#9a3412",
        900: "#7c2d12"
    },
    amber: {
        50: "#fffbeb",
        100: "#fef3c7",
        200: "#fde68a",
        300: "#fcd34d",
        400: "#fbbf24",
        500: "#f59e0b",
        600: "#d97706",
        700: "#b45309",
        800: "#92400e",
        900: "#78350f"
    },
    yellow: {
        50: "#fefce8",
        100: "#fef9c3",
        200: "#fef08a",
        300: "#fde047",
        400: "#facc15",
        500: "#eab308",
        600: "#ca8a04",
        700: "#a16207",
        800: "#854d0e",
        900: "#713f12"
    },
    lime: {
        50: "#f7fee7",
        100: "#ecfccb",
        200: "#d9f99d",
        300: "#bef264",
        400: "#a3e635",
        500: "#84cc16",
        600: "#65a30d",
        700: "#4d7c0f",
        800: "#3f6212",
        900: "#365314"
    },
    green: {
        50: "#f0fdf4",
        100: "#dcfce7",
        200: "#bbf7d0",
        300: "#86efac",
        400: "#4ade80",
        500: "#22c55e",
        600: "#16a34a",
        700: "#15803d",
        800: "#166534",
        900: "#14532d"
    },
    emerald: {
        50: "#ecfdf5",
        100: "#d1fae5",
        200: "#a7f3d0",
        300: "#6ee7b7",
        400: "#34d399",
        500: "#10b981",
        600: "#059669",
        700: "#047857",
        800: "#065f46",
        900: "#064e3b"
    },
    teal: {
        50: "#f0fdfa",
        100: "#ccfbf1",
        200: "#99f6e4",
        300: "#5eead4",
        400: "#2dd4bf",
        500: "#14b8a6",
        600: "#0d9488",
        700: "#0f766e",
        800: "#115e59",
        900: "#134e4a"
    },
    cyan: {
        50: "#ecfeff",
        100: "#cffafe",
        200: "#a5f3fc",
        300: "#67e8f9",
        400: "#22d3ee",
        500: "#06b6d4",
        600: "#0891b2",
        700: "#0e7490",
        800: "#155e75",
        900: "#164e63"
    },
    sky: {
        50: "#f0f9ff",
        100: "#e0f2fe",
        200: "#bae6fd",
        300: "#7dd3fc",
        400: "#38bdf8",
        500: "#0ea5e9",
        600: "#0284c7",
        700: "#0369a1",
        800: "#075985",
        900: "#0c4a6e"
    },
    blue: {
        50: "#eff6ff",
        100: "#dbeafe",
        200: "#bfdbfe",
        300: "#93c5fd",
        400: "#60a5fa",
        500: "#3b82f6",
        600: "#2563eb",
        700: "#1d4ed8",
        800: "#1e40af",
        900: "#1e3a8a"
    },
    indigo: {
        50: "#eef2ff",
        100: "#e0e7ff",
        200: "#c7d2fe",
        300: "#a5b4fc",
        400: "#818cf8",
        500: "#6366f1",
        600: "#4f46e5",
        700: "#4338ca",
        800: "#3730a3",
        900: "#312e81"
    },
    violet: {
        50: "#f5f3ff",
        100: "#ede9fe",
        200: "#ddd6fe",
        300: "#c4b5fd",
        400: "#a78bfa",
        500: "#8b5cf6",
        600: "#7c3aed",
        700: "#6d28d9",
        800: "#5b21b6",
        900: "#4c1d95"
    },
    purple: {
        50: "#faf5ff",
        100: "#f3e8ff",
        200: "#e9d5ff",
        300: "#d8b4fe",
        400: "#c084fc",
        500: "#a855f7",
        600: "#9333ea",
        700: "#7e22ce",
        800: "#6b21a8",
        900: "#581c87"
    },
    fuchsia: {
        50: "#fdf4ff",
        100: "#fae8ff",
        200: "#f5d0fe",
        300: "#f0abfc",
        400: "#e879f9",
        500: "#d946ef",
        600: "#c026d3",
        700: "#a21caf",
        800: "#86198f",
        900: "#701a75"
    },
    pink: {
        50: "#fdf2f8",
        100: "#fce7f3",
        200: "#fbcfe8",
        300: "#f9a8d4",
        400: "#f472b6",
        500: "#ec4899",
        600: "#db2777",
        700: "#be185d",
        800: "#9d174d",
        900: "#831843"
    },
    rose: {
        50: "#fff1f2",
        100: "#ffe4e6",
        200: "#fecdd3",
        300: "#fda4af",
        400: "#fb7185",
        500: "#f43f5e",
        600: "#e11d48",
        700: "#be123c",
        800: "#9f1239",
        900: "#881337"
    },
    get lightBlue () {
        warn({
            version: "v2.2",
            from: "lightBlue",
            to: "sky"
        });
        return this.sky;
    },
    get warmGray () {
        warn({
            version: "v3.0",
            from: "warmGray",
            to: "stone"
        });
        return this.stone;
    },
    get trueGray () {
        warn({
            version: "v3.0",
            from: "trueGray",
            to: "neutral"
        });
        return this.neutral;
    },
    get coolGray () {
        warn({
            version: "v3.0",
            from: "coolGray",
            to: "gray"
        });
        return this.gray;
    },
    get blueGray () {
        warn({
            version: "v3.0",
            from: "blueGray",
            to: "slate"
        });
        return this.slate;
    }
};
colors$2.default = _default;

let colors$1 = colors$2;
var colors_1 = (colors$1.__esModule ? colors$1 : { default: colors$1 }).default;

const ordered_colors = [
  "red",
  "green",
  "blue",
  "yellow",
  "purple",
  "teal",
  "orange",
  "cyan",
  "lime",
  "pink"
];
const color_values = [
  { color: "red", primary: 600, secondary: 100 },
  { color: "green", primary: 600, secondary: 100 },
  { color: "blue", primary: 600, secondary: 100 },
  { color: "yellow", primary: 500, secondary: 100 },
  { color: "purple", primary: 600, secondary: 100 },
  { color: "teal", primary: 600, secondary: 100 },
  { color: "orange", primary: 600, secondary: 100 },
  { color: "cyan", primary: 600, secondary: 100 },
  { color: "lime", primary: 500, secondary: 100 },
  { color: "pink", primary: 600, secondary: 100 }
];
const colors = color_values.reduce((acc, { color, primary, secondary }) => ({
  ...acc,
  [color]: {
    primary: colors_1[color][primary],
    secondary: colors_1[color][secondary]
  }
}), {});

let id = -1;
window.__gradio_loader__ = [];
const ENTRY_CSS = "./assets/index.9e3f12cd.css";
const FONTS = ["https://fonts.googleapis.com/css?family=Source Sans Pro","https://fonts.googleapis.com/css?family=IBM Plex Mono"];
let app_id = null;
async function reload_check(root) {
  const result = await (await fetch(root + "app_id")).text();
  if (app_id === null) {
    app_id = result;
  } else if (app_id != result) {
    location.reload();
  }
  setTimeout(() => reload_check(root), 250);
}
async function get_source_config(source) {
  let config = await (await fetch(source + "config")).json();
  config.root = source;
  return config;
}
async function get_config(source) {
  if (location.origin === "http://localhost:3000") {
    let config = await fetch("" + "config");
    const result = await config.json();
    return result;
  } else if (source) {
    if (!source.endsWith("/")) {
      source += "/";
    }
    const config = await get_source_config(source);
    return config;
  } else {
    return window.gradio_config;
  }
}
function mount_custom_css(target, css_string) {
  if (css_string) {
    let style = document.createElement("style");
    style.innerHTML = css_string;
    target.appendChild(style);
  }
}
function mount_css(url, target) {
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = url;
  target.appendChild(link);
  return new Promise((res, rej) => {
    link.addEventListener("load", () => res());
    link.addEventListener("error", () => rej(new Error(`Unable to preload CSS for ${url}`)));
  });
}
async function handle_config(target, source) {
  let config;
  try {
    let [_config] = await Promise.all([
      get_config(source),
      "prod" === "dev" ? Promise.resolve : mount_css(ENTRY_CSS, target)
    ]);
    config = _config;
  } catch (e) {
    console.error(e);
    return null;
  }
  mount_custom_css(target, config.css);
  if (config.root === void 0) {
    config.root = "";
  }
  if (config.dev_mode) {
    reload_check(config.root);
  }
  config.target = target;
  return config;
}
function mount_app(config, target, wrapper, id2, autoscroll) {
  if (config.detail === "Not authenticated" || config.auth_required) {
    new Login({
      target: wrapper,
      props: {
        auth_message: config.auth_message,
        root: config.root,
        id: id2
      }
    });
  } else {
    let session_hash = Math.random().toString(36).substring(2);
    config.fn = fn(session_hash, config.root + "api/", config.is_space);
    new Blocks({
      target: wrapper,
      props: { ...config, target: wrapper, id: id2, autoscroll }
    });
  }
  if (target) {
    target.append(wrapper);
  }
}
function create_custom_element() {
  FONTS.map((f) => mount_css(f, document.head));
  class GradioApp extends HTMLElement {
    constructor() {
      super();
      this._id = ++id;
      this.root = this.attachShadow({ mode: "open" });
      window.scoped_css_attach = (link) => {
        this.root.append(link);
      };
      this.wrapper = document.createElement("div");
      this.wrapper.classList.add("gradio-container");
      this.wrapper.style.position = "relative";
      this.wrapper.style.width = "100%";
      this.wrapper.style.minHeight = "100vh";
      window.__gradio_loader__[this._id] = new StatusTracker({
        target: this.wrapper,
        props: {
          status: "pending",
          timer: false,
          queue_position: null,
          queue_size: null
        }
      });
      this.root.append(this.wrapper);
    }
    async connectedCallback() {
      const event = new CustomEvent("domchange", {
        bubbles: true,
        cancelable: false,
        composed: true
      });
      var observer = new MutationObserver((mutations) => {
        this.dispatchEvent(event);
      });
      observer.observe(this.root, { childList: true });
      const space = this.getAttribute("space");
      let source = space ? `https://hf.space/embed/${space}/+/` : this.getAttribute("src");
      const initial_height = this.getAttribute("initial_height");
      let autoscroll = this.getAttribute("autoscroll");
      const _autoscroll = autoscroll === "true" ? true : false;
      this.wrapper.style.minHeight = initial_height || "300px";
      const config = await handle_config(this.root, source);
      if (config === null) {
        this.wrapper.remove();
      } else {
        mount_app(config, this.root, this.wrapper, this._id, _autoscroll);
      }
    }
  }
  customElements.define("gradio-app", GradioApp);
}
async function unscoped_mount() {
  const target = document.querySelector("#root");
  target.classList.add("gradio-container");
  window.__gradio_loader__[0] = new StatusTracker({
    target,
    props: {
      status: "pending",
      timer: false,
      queue_position: null,
      queue_size: null
    }
  });
  const config = await handle_config(target, null);
  mount_app(config, false, target, 0);
}
if (window.location !== window.parent.location) {
  window.scoped_css_attach = (link) => {
    document.head.append(link);
  };
  unscoped_mount();
} else {
  create_custom_element();
}

export { writable as $, empty as A, destroy_each as B, group_outros as C, check_outros as D, createEventDispatcher as E, spring as F, subscribe as G, binding_callbacks as H, onDestroy as I, bubble as J, add_flush_callback as K, src_url_equal as L, action_destroyer as M, bind as N, component_subscribe as O, assign as P, StatusTracker as Q, get_spread_update as R, SvelteComponent as S, get_spread_object as T, set_attributes as U, getContext as V, stop_propagation as W, X, set_style as Y, setContext as Z, set_store_value as _, space as a, beforeUpdate as a0, afterUpdate as a1, colors as a2, set_input_value as a3, flush as a4, HtmlTag as a5, tick as a6, update_keyed_each as a7, outro_and_destroy_block as a8, onMount as a9, add_render_callback as aa, select_option as ab, select_value as ac, add_resize_listener as ad, ordered_colors as ae, create_bidirectional_transition as af, fade as ag, to_number as ah, create_in_transition as ai, create_out_transition as aj, destroy_block as ak, globals as al, raf as am, attr as b, create_component as c, toggle_class as d, element as e, insert as f, append as g, set_data as h, init as i, transition_in as j, transition_out as k, listen as l, mount_component as m, detach as n, destroy_component as o, create_slot as p, get_all_dirty_from_scope as q, get_slot_changes as r, safe_not_equal as s, text as t, update_slot_base as u, svg_element as v, noop as w, is_function as x, prevent_default as y, run_all as z };
