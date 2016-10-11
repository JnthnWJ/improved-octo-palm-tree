/* */ 
"format cjs";
import { clone, extend } from './util';
import { h } from './h';

export function cloneElement(vnode, props) {
	return h(
		vnode.nodeName,
		extend(clone(vnode.attributes), props),
		arguments.length>2 ? [].slice.call(arguments, 2) : vnode.children
	);
}
