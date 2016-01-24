/* @flow */

/* eslint-disable no-unused-vars */

import type {
    Hooks,
    Info,
    Dependency,
    DepId,
    DepFn,
    Loader
} from '../annotations/annotationInterfaces'
import type {FromJS, SimpleMap, Cursor} from '../modelInterfaces'
import type {Subscription, Observer, Observable} from '../observableInterfaces'

export type EntityMeta<E> = {
    pending: boolean;
    rejected: boolean;
    fulfilled: boolean;
    reason: ?E;
}

export type MetaSource<E> = {
    meta: EntityMeta<E>;
}

/* eslint-disable no-use-before-define, no-undef */

export type Cacheable = {
    isRecalculate: boolean;
};

export type DepBase<V> = {
    isRecalculate: boolean;
    value: V;
    relations: Array<Cacheable>;
    id: DepId;
    info: Info;
}

export type ModelDep<V: Object> = {
    kind: 'model';
    base: DepBase<V>;
    fromJS: FromJS<V>;
    cursor: Cursor<V>;
}

export type AsyncModelDep<V: Object, E> = {
    kind: 'asyncmodel';
    base: DepBase<V>;

    fromJS: FromJS<V>;
    cursor: Cursor<V>;

    meta: EntityMeta<E>;
    asyncRelations: Array<Cacheable>;
}

export type DepArgs<M> = {
    deps: Array<AnyDep>;
    depNames: ?Array<string>;
    middlewares: ?Array<M>;
}

export type Invoker<V, T, M> = {
    hooks: Hooks<V>;
    target: T;
    depArgs: DepArgs<M>;
}

export type ClassInvoker<V> = Invoker<V, Class<V>, ClassDep>;
export type ClassDep<V: Object> = {
    kind: 'class';
    base: DepBase<V>;
    invoker: ClassInvoker<V>;
}

export type FactoryInvoker<V> = Invoker<V, DepFn<V>, FactoryDep>;
export type FactoryDep<V: any> = {
    kind: 'factory';
    base: DepBase<V>;
    invoker: FactoryInvoker<V>;
}

export type MetaDep<E> = {
    kind: 'meta';
    base: DepBase<EntityMeta<E>>;
    sources: Array<MetaSource>;
}

export type AsyncResult<V, E> = Observable<V, E>|Promise<V>;
export type AsyncSetter<V, E> = (data: AsyncResult<V, E>) => void;

export type SetterResult<V, E> = DepFn<AsyncResult<V, E>>;
export type SetterInvoker<V, E> = Invoker<SetterResult<V, E>, DepFn<SetterResult<V, E>>, FactoryDep>;
export type SetterDep<V: Object, E> = {
    kind: 'setter';
    base: DepBase<SetterResult<V, E>>;
    invoker: SetterInvoker<V, E>;
    set: AsyncSetter<V, E>;
}

export type LoaderInvoker<V, E> = Invoker<AsyncResult<V, E>, DepFn<AsyncResult<V, E>>, FactoryDep>;
export type LoaderDep<V: Object, E> = {
    kind: 'loader';
    base: DepBase<AsyncResult<V, E>>;
    invoker: LoaderInvoker<V, E>;
    set: AsyncSetter<V, E>;
}

export type AnyDep =
    ModelDep
    | FactoryDep
    | ClassDep
    | MetaDep
    | SetterDep
    | LoaderDep;

export type DepSubscriber = {
    subscribe(dep: AnyDep): Subscription;
}

export type Notifier = {
    notify(): void;
}

export type DepProcessor = {
    resolve(dep: AnyDep): any;
}

export type ProcessorType = (rec: AnyDep, dep: DepProcessor) => void;
export type ProcessorTypeMap = SimpleMap<string, ProcessorType>;
