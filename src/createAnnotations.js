/* @flow */

import ClassAnnotationImpl from './plugins/class/ClassAnnotationImpl'
import FactoryAnnotationImpl from './plugins/factory/FactoryAnnotationImpl'
import MetaAnnotationImpl from './plugins/meta/MetaAnnotationImpl'
import SetterAnnotationImpl from './plugins/setter/SetterAnnotationImpl'
import GetterAnnotationImpl from './plugins/getter/GetterAnnotationImpl'
import type {
    DepItem,
    DepFn,
    Dependency,
    AnnotationDriver
} from './interfaces/annotationInterfaces'
import type {Loader} from './plugins/asyncmodel/asyncmodelInterfaces'
import ModelAnnotationImpl from './plugins/model/ModelAnnotationImpl'
import AsyncModelAnnotationImpl from './plugins/asyncmodel/AsyncModelAnnotationImpl'

/* eslint-disable no-undef */

export type Annotations = {
    klass(...deps: Array<DepItem>): <P: Object>(target: Class<P>) => Class<P>;
    factory(...deps: Array<DepItem>): <T: DepFn>(target: T) => T;
    getter<V: Object>(target: Class<V>): () => void;
    meta<T: Dependency>(target: T): () => void;
    model<V: Object>(target: Class<V>): Class<V>;
    asyncmodel<V: Object, E>(loader?: ?Loader<V, E>): (target: Class<V>) => Class<V>;
    setter<V: Object, E>(model: Class<V>, ...deps: Array<DepItem>): (target: Loader<V, E>) => Loader<V, E>;
}

export default function createAnnotations(
    driver: AnnotationDriver,
    tags: Array<string> = []
): Annotations {
    return {
        /* eslint-disable no-unused-vars */
        klass(...deps: Array<DepItem>): <P: Object>(target: Class<P>) => Class<P> {
            return function _klass<P: Object>(target: Class<P>): Class<P> {
                return driver.annotate(target, new ClassAnnotationImpl(
                    target,
                    deps,
                    tags
                ))
            }
        },

        factory(...deps: Array<DepItem>): <T: DepFn>(target: T) => T {
            return function _factory<T: DepFn>(target: T): T {
                return driver.annotate(target, new FactoryAnnotationImpl(
                    target,
                    deps,
                    tags
                ))
            }
        },

        meta<T: Dependency>(target: T): () => void {
            function dummyTargetId(): void {}
            return driver.annotate((dummyTargetId: any), new MetaAnnotationImpl(
                target,
                tags
            ))
        },

        getter<V: Object>(target: Class<V>): () => void {
            function dummyTargetId(): void {}
            return driver.annotate((dummyTargetId: any), new GetterAnnotationImpl(
                target,
                tags
            ))
        },

        model<V: Object>(target: Class<V>): Class<V> {
            return driver.annotate(target, new ModelAnnotationImpl(
                target,
                tags
            ))
        },

        asyncmodel<V: Object, E>(loader?: ?Loader<V, E>): (target: Class<V>) => Class<V> {
            return function _asyncmodel(target: Class<V>): Class<V> {
                return driver.annotate(target, new AsyncModelAnnotationImpl(
                    target,
                    tags,
                    loader
                ))
            };
        },

        setter<V: Object, E>(model: Class<V>, ...deps: Array<DepItem>): (target: Loader<V, E>) => Loader<V, E> {
            return function _setter(target: Loader<V, E>): Loader<V, E> {
                return driver.annotate(target, new SetterAnnotationImpl(
                    model,
                    target,
                    deps,
                    tags
                ))
            };
        }
        /* eslint-enable no-undef */
    }
}
