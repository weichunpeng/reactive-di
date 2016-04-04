/* @flow */
import type {
    Tag,
    DepFn
} from 'reactive-di/i/annotationInterfaces'
import type {ClassAnnotation} from 'reactive-di/i/pluginsInterfaces'
import type {
    Context,
    ResolvableDep,
    ResolveDepsResult
} from 'reactive-di/i/nodeInterfaces'

import {createObjectProxy} from 'reactive-di/utils/createProxy'
import {fastCreateObject} from 'reactive-di/utils/fastCall'
import getFunctionName from 'reactive-di/utils/getFunctionName'

export class ClassDep<V: Object> {
    kind: 'klass';
    displayName: string;
    tags: Array<Tag>;
    isRecalculate: boolean;

    _value: V;
    _target: DepFn<V>;
    _resolver: () => ResolveDepsResult;

    constructor(annotation: ClassAnnotation) {
        this.kind = 'klass'
        const fnName: string = getFunctionName(annotation.target);
        this.displayName = this.kind + '@' + fnName
        this.tags = [this.kind, fnName]

        this._target = annotation.target
    }

    init(resolver: () => ResolveDepsResult): void {
        this._resolver = resolver
    }

    resolve(): V {
        if (!this.isRecalculate) {
            return this._value
        }
        const {deps, middlewares} = this._resolver()
        let object: V;
        object = fastCreateObject(this._target, deps);
        if (middlewares) {
            if (typeof object !== 'object') {
                throw new Error(`No object returns from ${this.displayName}`)
            }
            object = createObjectProxy(object, middlewares)
        }
        this._value = object
        this.isRecalculate = false

        return this._value
    }
}

// implements Plugin
export default class ClassPlugin {
    kind: 'klass' = 'klass';

    create(annotation: ClassAnnotation, acc: Context): ResolvableDep { // eslint-disable-line
        return new ClassDep(annotation);
    }

    finalize(dep: ClassDep, annotation: ClassAnnotation, acc: Context): void {
        dep.init(acc.createDepResolver(annotation, dep.tags))
    }
}
