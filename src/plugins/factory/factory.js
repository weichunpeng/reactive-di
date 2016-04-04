/* @flow */

import type {DepItem} from 'reactive-di/i/annotationInterfaces'
import type {FactoryAnnotation} from 'reactive-di/i/pluginsInterfaces'
import annotationSingleton from 'reactive-di/core/annotationSingleton'

export function factory(
    target: Function,
    ...deps: Array<DepItem>
): FactoryAnnotation {
    return {
        kind: 'factory',
        target,
        deps
    }
}

export function factoryAnn<V: Function>(
    ...deps: Array<DepItem>
): (target: V) => V {
    return function __factory(target: V): V {
        annotationSingleton.push(factory(target, ...deps))
        return target
    }
}
