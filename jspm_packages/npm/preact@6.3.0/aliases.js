/* */ 
"format cjs";
(function(process) {
  (function(global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) : typeof define === 'function' && define.amd ? define(['exports'], factory) : (factory((global.preact = global.preact || {})));
  }(this, function(exports) {
    function VNode(nodeName, attributes, children) {
      this.nodeName = nodeName;
      this.attributes = attributes;
      this.children = children;
      this.key = attributes && attributes.key;
    }
    var options = {};
    var stack = [];
    function h(nodeName, attributes) {
      var children = [],
          lastSimple = undefined,
          child = undefined,
          simple = undefined,
          i = undefined;
      for (i = arguments.length; i-- > 2; ) {
        stack.push(arguments[i]);
      }
      if (attributes && attributes.children) {
        if (!stack.length)
          stack.push(attributes.children);
        delete attributes.children;
      }
      while (stack.length) {
        if ((child = stack.pop()) instanceof Array) {
          for (i = child.length; i--; )
            stack.push(child[i]);
        } else if (child != null && child !== false) {
          if (typeof child == 'number' || child === true)
            child = String(child);
          simple = typeof child == 'string';
          if (simple && lastSimple) {
            children[children.length - 1] += child;
          } else {
            children.push(child);
            lastSimple = simple;
          }
        }
      }
      var p = new VNode(nodeName, attributes || undefined, children);
      if (options.vnode)
        options.vnode(p);
      return p;
    }
    function extend(obj, props) {
      if (props) {
        for (var i in props) {
          obj[i] = props[i];
        }
      }
      return obj;
    }
    function clone(obj) {
      return extend({}, obj);
    }
    function delve(obj, key) {
      for (var p = key.split('.'),
          i = 0; i < p.length && obj; i++) {
        obj = obj[p[i]];
      }
      return obj;
    }
    function isFunction(obj) {
      return 'function' === typeof obj;
    }
    function isString(obj) {
      return 'string' === typeof obj;
    }
    function hashToClassName(c) {
      var str = '';
      for (var prop in c) {
        if (c[prop]) {
          if (str)
            str += ' ';
          str += prop;
        }
      }
      return str;
    }
    var lcCache = {};
    var toLowerCase = function toLowerCase(s) {
      return lcCache[s] || (lcCache[s] = s.toLowerCase());
    };
    var resolved = typeof Promise !== 'undefined' && Promise.resolve();
    var defer = resolved ? function(f) {
      resolved.then(f);
    } : setTimeout;
    function cloneElement(vnode, props) {
      return h(vnode.nodeName, extend(clone(vnode.attributes), props), arguments.length > 2 ? [].slice.call(arguments, 2) : vnode.children);
    }
    var NO_RENDER = 0;
    var SYNC_RENDER = 1;
    var FORCE_RENDER = 2;
    var ASYNC_RENDER = 3;
    var EMPTY = {};
    var ATTR_KEY = typeof Symbol !== 'undefined' ? Symbol['for']('preactattr') : '__preactattr_';
    var NON_DIMENSION_PROPS = {
      boxFlex: 1,
      boxFlexGroup: 1,
      columnCount: 1,
      fillOpacity: 1,
      flex: 1,
      flexGrow: 1,
      flexPositive: 1,
      flexShrink: 1,
      flexNegative: 1,
      fontWeight: 1,
      lineClamp: 1,
      lineHeight: 1,
      opacity: 1,
      order: 1,
      orphans: 1,
      strokeOpacity: 1,
      widows: 1,
      zIndex: 1,
      zoom: 1
    };
    var NON_BUBBLING_EVENTS = {
      blur: 1,
      error: 1,
      focus: 1,
      load: 1,
      resize: 1,
      scroll: 1
    };
    function createLinkedState(component, key, eventPath) {
      var path = key.split('.'),
          p0 = path[0];
      return function(e) {
        var _component$setState;
        var t = e && e.currentTarget || this,
            s = component.state,
            obj = s,
            v = isString(eventPath) ? delve(e, eventPath) : t.nodeName ? (t.nodeName + t.type).match(/^input(che|rad)/i) ? t.checked : t.value : e,
            i = undefined;
        if (path.length > 1) {
          for (i = 0; i < path.length - 1; i++) {
            obj = obj[path[i]] || (obj[path[i]] = {});
          }
          obj[path[i]] = v;
          v = s[p0];
        }
        component.setState((_component$setState = {}, _component$setState[p0] = v, _component$setState));
      };
    }
    var items = [];
    function enqueueRender(component) {
      if (!component._dirty && (component._dirty = true) && items.push(component) == 1) {
        (options.debounceRendering || defer)(rerender);
      }
    }
    function rerender() {
      var p = undefined,
          list = items;
      items = [];
      while (p = list.pop()) {
        if (p._dirty)
          renderComponent(p);
      }
    }
    function isFunctionalComponent(vnode) {
      var nodeName = vnode && vnode.nodeName;
      return nodeName && isFunction(nodeName) && !(nodeName.prototype && nodeName.prototype.render);
    }
    function buildFunctionalComponent(vnode, context) {
      return vnode.nodeName(getNodeProps(vnode), context || EMPTY);
    }
    function isSameNodeType(node, vnode) {
      if (isString(vnode)) {
        return node instanceof Text;
      }
      if (isString(vnode.nodeName)) {
        return isNamedNode(node, vnode.nodeName);
      }
      if (isFunction(vnode.nodeName)) {
        return node._componentConstructor === vnode.nodeName || isFunctionalComponent(vnode);
      }
    }
    function isNamedNode(node, nodeName) {
      return node.normalizedNodeName === nodeName || toLowerCase(node.nodeName) === toLowerCase(nodeName);
    }
    function getNodeProps(vnode) {
      var props = clone(vnode.attributes);
      props.children = vnode.children;
      var defaultProps = vnode.nodeName.defaultProps;
      if (defaultProps) {
        for (var i in defaultProps) {
          if (props[i] === undefined) {
            props[i] = defaultProps[i];
          }
        }
      }
      return props;
    }
    function removeNode(node) {
      var p = node.parentNode;
      if (p)
        p.removeChild(node);
    }
    function setAccessor(node, name, old, value, isSvg) {
      if (name === 'className')
        name = 'class';
      if (name === 'class' && value && typeof value === 'object') {
        value = hashToClassName(value);
      }
      if (name === 'key') {} else if (name === 'class' && !isSvg) {
        node.className = value || '';
      } else if (name === 'style') {
        if (!value || isString(value) || isString(old)) {
          node.style.cssText = value || '';
        }
        if (value && typeof value === 'object') {
          if (!isString(old)) {
            for (var i in old) {
              if (!(i in value))
                node.style[i] = '';
            }
          }
          for (var i in value) {
            node.style[i] = typeof value[i] === 'number' && !NON_DIMENSION_PROPS[i] ? value[i] + 'px' : value[i];
          }
        }
      } else if (name === 'dangerouslySetInnerHTML') {
        if (value)
          node.innerHTML = value.__html;
      } else if (name[0] == 'o' && name[1] == 'n') {
        var l = node._listeners || (node._listeners = {});
        name = toLowerCase(name.substring(2));
        if (value) {
          if (!l[name])
            node.addEventListener(name, eventProxy, !!NON_BUBBLING_EVENTS[name]);
        } else if (l[name]) {
          node.removeEventListener(name, eventProxy, !!NON_BUBBLING_EVENTS[name]);
        }
        l[name] = value;
      } else if (name !== 'list' && name !== 'type' && !isSvg && name in node) {
        setProperty(node, name, value == null ? '' : value);
        if (value == null || value === false)
          node.removeAttribute(name);
      } else {
        var ns = isSvg && name.match(/^xlink\:?(.+)/);
        if (value == null || value === false) {
          if (ns)
            node.removeAttributeNS('http://www.w3.org/1999/xlink', toLowerCase(ns[1]));
          else
            node.removeAttribute(name);
        } else if (typeof value !== 'object' && !isFunction(value)) {
          if (ns)
            node.setAttributeNS('http://www.w3.org/1999/xlink', toLowerCase(ns[1]), value);
          else
            node.setAttribute(name, value);
        }
      }
    }
    function setProperty(node, name, value) {
      try {
        node[name] = value;
      } catch (e) {}
    }
    function eventProxy(e) {
      return this._listeners[e.type](options.event && options.event(e) || e);
    }
    var nodes = {};
    function collectNode(node) {
      removeNode(node);
      if (node instanceof Element) {
        node._component = node._componentConstructor = null;
        var _name = node.normalizedNodeName || toLowerCase(node.nodeName);
        (nodes[_name] || (nodes[_name] = [])).push(node);
      }
    }
    function createNode(nodeName, isSvg) {
      var name = toLowerCase(nodeName),
          node = nodes[name] && nodes[name].pop() || (isSvg ? document.createElementNS('http://www.w3.org/2000/svg', nodeName) : document.createElement(nodeName));
      node.normalizedNodeName = name;
      return node;
    }
    var mounts = [];
    var diffLevel = 0;
    var isSvgMode = false;
    function flushMounts() {
      var c = undefined;
      while (c = mounts.pop()) {
        if (c.componentDidMount)
          c.componentDidMount();
      }
    }
    function diff(dom, vnode, context, mountAll, parent, componentRoot) {
      if (!diffLevel++)
        isSvgMode = parent instanceof SVGElement;
      var ret = idiff(dom, vnode, context, mountAll);
      if (parent && ret.parentNode !== parent)
        parent.appendChild(ret);
      if (!--diffLevel && !componentRoot)
        flushMounts();
      return ret;
    }
    function idiff(dom, vnode, context, mountAll) {
      var originalAttributes = vnode && vnode.attributes;
      while (isFunctionalComponent(vnode)) {
        vnode = buildFunctionalComponent(vnode, context);
      }
      if (vnode == null)
        vnode = '';
      if (isString(vnode)) {
        if (dom) {
          if (dom instanceof Text && dom.parentNode) {
            dom.nodeValue = vnode;
            return dom;
          }
          recollectNodeTree(dom);
        }
        return document.createTextNode(vnode);
      }
      if (isFunction(vnode.nodeName)) {
        return buildComponentFromVNode(dom, vnode, context, mountAll);
      }
      var out = dom,
          nodeName = vnode.nodeName,
          prevSvgMode = isSvgMode;
      if (!isString(nodeName)) {
        nodeName = String(nodeName);
      }
      isSvgMode = nodeName === 'svg' ? true : nodeName === 'foreignObject' ? false : isSvgMode;
      if (!dom) {
        out = createNode(nodeName, isSvgMode);
      } else if (!isNamedNode(dom, nodeName)) {
        out = createNode(nodeName, isSvgMode);
        while (dom.firstChild)
          out.appendChild(dom.firstChild);
        recollectNodeTree(dom);
      }
      if (vnode.children && vnode.children.length === 1 && typeof vnode.children[0] === 'string' && out.childNodes.length === 1 && out.firstChild instanceof Text) {
        out.firstChild.nodeValue = vnode.children[0];
      } else if (vnode.children && vnode.children.length || out.firstChild) {
        innerDiffNode(out, vnode.children, context, mountAll);
      }
      var props = out[ATTR_KEY];
      if (!props) {
        out[ATTR_KEY] = props = {};
        for (var a = out.attributes,
            i = a.length; i--; ) {
          props[a[i].name] = a[i].value;
        }
      }
      diffAttributes(out, vnode.attributes, props);
      if (originalAttributes && typeof originalAttributes.ref === 'function') {
        (props.ref = originalAttributes.ref)(out);
      }
      isSvgMode = prevSvgMode;
      return out;
    }
    function innerDiffNode(dom, vchildren, context, mountAll) {
      var originalChildren = dom.childNodes,
          children = [],
          keyed = {},
          keyedLen = 0,
          min = 0,
          len = originalChildren.length,
          childrenLen = 0,
          vlen = vchildren && vchildren.length,
          j = undefined,
          c = undefined,
          vchild = undefined,
          child = undefined;
      if (len) {
        for (var i = 0; i < len; i++) {
          var _child = originalChildren[i],
              key = vlen ? (c = _child._component) ? c.__key : (c = _child[ATTR_KEY]) ? c.key : null : null;
          if (key || key === 0) {
            keyedLen++;
            keyed[key] = _child;
          } else {
            children[childrenLen++] = _child;
          }
        }
      }
      if (vlen) {
        for (var i = 0; i < vlen; i++) {
          vchild = vchildren[i];
          child = null;
          var key = vchild.key;
          if (key != null) {
            if (keyedLen && key in keyed) {
              child = keyed[key];
              keyed[key] = undefined;
              keyedLen--;
            }
          } else if (!child && min < childrenLen) {
            for (j = min; j < childrenLen; j++) {
              c = children[j];
              if (c && isSameNodeType(c, vchild)) {
                child = c;
                children[j] = undefined;
                if (j === childrenLen - 1)
                  childrenLen--;
                if (j === min)
                  min++;
                break;
              }
            }
            if (!child && min < childrenLen && isFunction(vchild.nodeName) && mountAll) {
              child = children[min];
              children[min++] = undefined;
            }
          }
          child = idiff(child, vchild, context, mountAll);
          if (child && child !== dom && child !== originalChildren[i]) {
            dom.insertBefore(child, originalChildren[i] || null);
          }
        }
      }
      if (keyedLen) {
        for (var i in keyed) {
          if (keyed[i])
            recollectNodeTree(keyed[i]);
        }
      }
      if (min < childrenLen) {
        removeOrphanedChildren(children);
      }
    }
    function removeOrphanedChildren(children, unmountOnly) {
      for (var i = children.length; i--; ) {
        if (children[i]) {
          recollectNodeTree(children[i], unmountOnly);
        }
      }
    }
    function recollectNodeTree(node, unmountOnly) {
      var component = node._component;
      if (component) {
        unmountComponent(component, !unmountOnly);
      } else {
        if (node[ATTR_KEY] && node[ATTR_KEY].ref)
          node[ATTR_KEY].ref(null);
        if (!unmountOnly) {
          collectNode(node);
        }
        if (node.childNodes && node.childNodes.length) {
          removeOrphanedChildren(node.childNodes, unmountOnly);
        }
      }
    }
    function diffAttributes(dom, attrs, old) {
      for (var _name in old) {
        if (!(attrs && _name in attrs) && old[_name] != null) {
          setAccessor(dom, _name, old[_name], old[_name] = undefined, isSvgMode);
        }
      }
      if (attrs) {
        for (var _name2 in attrs) {
          if (_name2 !== 'children' && _name2 !== 'innerHTML' && (!(_name2 in old) || attrs[_name2] !== (_name2 === 'value' || _name2 === 'checked' ? dom[_name2] : old[_name2]))) {
            setAccessor(dom, _name2, old[_name2], old[_name2] = attrs[_name2], isSvgMode);
          }
        }
      }
    }
    var components = {};
    function collectComponent(component) {
      var name = component.constructor.name,
          list = components[name];
      if (list)
        list.push(component);
      else
        components[name] = [component];
    }
    function createComponent(Ctor, props, context) {
      var inst = new Ctor(props, context),
          list = components[Ctor.name];
      Component.call(inst, props, context);
      if (list) {
        for (var i = list.length; i--; ) {
          if (list[i].constructor === Ctor) {
            inst.nextBase = list[i].nextBase;
            list.splice(i, 1);
            break;
          }
        }
      }
      return inst;
    }
    function setComponentProps(component, props, opts, context, mountAll) {
      if (component._disable)
        return;
      component._disable = true;
      if (component.__ref = props.ref)
        delete props.ref;
      if (component.__key = props.key)
        delete props.key;
      if (!component.base || mountAll) {
        if (component.componentWillMount)
          component.componentWillMount();
      } else if (component.componentWillReceiveProps) {
        component.componentWillReceiveProps(props, context);
      }
      if (context && context !== component.context) {
        if (!component.prevContext)
          component.prevContext = component.context;
        component.context = context;
      }
      if (!component.prevProps)
        component.prevProps = component.props;
      component.props = props;
      component._disable = false;
      if (opts !== NO_RENDER) {
        if (opts === SYNC_RENDER || options.syncComponentUpdates !== false || !component.base) {
          renderComponent(component, SYNC_RENDER, mountAll);
        } else {
          enqueueRender(component);
        }
      }
      if (component.__ref)
        component.__ref(component);
    }
    function renderComponent(component, opts, mountAll, isChild) {
      if (component._disable)
        return;
      var skip = undefined,
          rendered = undefined,
          props = component.props,
          state = component.state,
          context = component.context,
          previousProps = component.prevProps || props,
          previousState = component.prevState || state,
          previousContext = component.prevContext || context,
          isUpdate = component.base,
          nextBase = component.nextBase,
          initialBase = isUpdate || nextBase,
          initialChildComponent = component._component,
          inst = undefined,
          cbase = undefined;
      if (isUpdate) {
        component.props = previousProps;
        component.state = previousState;
        component.context = previousContext;
        if (opts !== FORCE_RENDER && component.shouldComponentUpdate && component.shouldComponentUpdate(props, state, context) === false) {
          skip = true;
        } else if (component.componentWillUpdate) {
          component.componentWillUpdate(props, state, context);
        }
        component.props = props;
        component.state = state;
        component.context = context;
      }
      component.prevProps = component.prevState = component.prevContext = component.nextBase = null;
      component._dirty = false;
      if (!skip) {
        if (component.render)
          rendered = component.render(props, state, context);
        if (component.getChildContext) {
          context = extend(clone(context), component.getChildContext());
        }
        while (isFunctionalComponent(rendered)) {
          rendered = buildFunctionalComponent(rendered, context);
        }
        var childComponent = rendered && rendered.nodeName,
            toUnmount = undefined,
            base = undefined;
        if (isFunction(childComponent)) {
          inst = initialChildComponent;
          var childProps = getNodeProps(rendered);
          if (inst && inst.constructor === childComponent) {
            setComponentProps(inst, childProps, SYNC_RENDER, context);
          } else {
            toUnmount = inst;
            inst = createComponent(childComponent, childProps, context);
            inst.nextBase = inst.nextBase || nextBase;
            inst._parentComponent = component;
            component._component = inst;
            setComponentProps(inst, childProps, NO_RENDER, context);
            renderComponent(inst, SYNC_RENDER, mountAll, true);
          }
          base = inst.base;
        } else {
          cbase = initialBase;
          toUnmount = initialChildComponent;
          if (toUnmount) {
            cbase = component._component = null;
          }
          if (initialBase || opts === SYNC_RENDER) {
            if (cbase)
              cbase._component = null;
            base = diff(cbase, rendered, context, mountAll || !isUpdate, initialBase && initialBase.parentNode, true);
          }
        }
        if (initialBase && base !== initialBase && inst !== initialChildComponent) {
          var baseParent = initialBase.parentNode;
          if (baseParent && base !== baseParent) {
            baseParent.replaceChild(base, initialBase);
          }
          if (!cbase && !toUnmount && component._parentComponent) {
            initialBase._component = null;
            recollectNodeTree(initialBase);
          }
        }
        if (toUnmount) {
          unmountComponent(toUnmount, base !== initialBase);
        }
        component.base = base;
        if (base && !isChild) {
          var componentRef = component,
              t = component;
          while (t = t._parentComponent) {
            componentRef = t;
          }
          base._component = componentRef;
          base._componentConstructor = componentRef.constructor;
        }
      }
      if (!isUpdate || mountAll) {
        mounts.unshift(component);
      } else if (!skip && component.componentDidUpdate) {
        component.componentDidUpdate(previousProps, previousState, previousContext);
      }
      var cb = component._renderCallbacks,
          fn = undefined;
      if (cb)
        while (fn = cb.pop())
          fn.call(component);
      if (!diffLevel && !isChild)
        flushMounts();
    }
    function buildComponentFromVNode(dom, vnode, context, mountAll) {
      var c = dom && dom._component,
          oldDom = dom,
          isDirectOwner = c && dom._componentConstructor === vnode.nodeName,
          isOwner = isDirectOwner,
          props = getNodeProps(vnode);
      while (c && !isOwner && (c = c._parentComponent)) {
        isOwner = c.constructor === vnode.nodeName;
      }
      if (c && isOwner && (!mountAll || c._component)) {
        setComponentProps(c, props, ASYNC_RENDER, context, mountAll);
        dom = c.base;
      } else {
        if (c && !isDirectOwner) {
          unmountComponent(c, true);
          dom = oldDom = null;
        }
        c = createComponent(vnode.nodeName, props, context);
        if (dom && !c.nextBase)
          c.nextBase = dom;
        setComponentProps(c, props, SYNC_RENDER, context, mountAll);
        dom = c.base;
        if (oldDom && dom !== oldDom) {
          oldDom._component = null;
          recollectNodeTree(oldDom);
        }
      }
      return dom;
    }
    function unmountComponent(component, remove) {
      var base = component.base;
      component._disable = true;
      if (component.componentWillUnmount)
        component.componentWillUnmount();
      component.base = null;
      var inner = component._component;
      if (inner) {
        unmountComponent(inner, remove);
      } else if (base) {
        if (base[ATTR_KEY] && base[ATTR_KEY].ref)
          base[ATTR_KEY].ref(null);
        component.nextBase = base;
        if (remove) {
          removeNode(base);
          collectComponent(component);
        }
        removeOrphanedChildren(base.childNodes, !remove);
      }
      if (component.__ref)
        component.__ref(null);
      if (component.componentDidUnmount)
        component.componentDidUnmount();
    }
    function Component(props, context) {
      this._dirty = true;
      this.context = context;
      this.props = props;
      if (!this.state)
        this.state = {};
    }
    extend(Component.prototype, {
      linkState: function linkState(key, eventPath) {
        var c = this._linkedStates || (this._linkedStates = {});
        return c[key + eventPath] || (c[key + eventPath] = createLinkedState(this, key, eventPath));
      },
      setState: function setState(state, callback) {
        var s = this.state;
        if (!this.prevState)
          this.prevState = clone(s);
        extend(s, isFunction(state) ? state(s, this.props) : state);
        if (callback)
          (this._renderCallbacks = this._renderCallbacks || []).push(callback);
        enqueueRender(this);
      },
      forceUpdate: function forceUpdate() {
        renderComponent(this, FORCE_RENDER);
      },
      render: function render() {}
    });
    function render(vnode, parent, merge) {
      return diff(merge, vnode, {}, false, parent);
    }
    exports.createElement = h;
    exports.h = h;
    exports.cloneElement = cloneElement;
    exports.Component = Component;
    exports.render = render;
    exports.rerender = rerender;
    exports.options = options;
    Object.defineProperty(exports, '__esModule', {value: true});
  }));
})(require('process'));
