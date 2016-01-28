/* @flow */

import EntityMetaImpl, {updateMeta} from '../model/EntityMetaImpl'
import type {
    DepId,
    Info
} from '../../annotations/annotationInterfaces'
import type {
    AnyDep,
    DepBase,
    DepProcessor
} from '../../nodes/nodeInterfaces'
import type {Plugin} from '../../pluginInterfaces'
import type {AnnotationResolver} from '../../resolver/resolverInterfaces'
import type {
    AsyncUpdater,
    EntityMeta
} from '../model/modelInterfaces'
import {DepBaseImpl} from '../pluginImpls'
import type {
    MetaDep,
    MetaAnnotation
} from './metaInterfaces'

// implements MetaDep
class MetaDepImpl<E> {
    kind: 'meta';
    base: DepBase<EntityMeta<E>>;
    sources: Array<AsyncUpdater>;

    constructor(
        id: DepId,
        info: Info
    ) {
        this.kind = 'meta'
        this.base = new DepBaseImpl(id, info)
        this.sources = []
    }
}

// depends on model
// implements Plugin
export default class MetaPlugin {
    resolve<E>(dep: MetaDep<E>, acc: DepProcessor): void {
        const {base, sources} = dep
        const meta: EntityMeta = new EntityMetaImpl();
        for (let i = 0, l = sources.length; i < l; i++) {
            updateMeta(meta, sources[i].meta)
        }
        base.value = merge(base.value, meta)
        base.isRecalculate = false
    }

    create<E>(annotation: MetaAnnotation<E>, acc: AnnotationResolver): void {
        const {base} = annotation
        const dep: MetaDep<E> = new MetaDepImpl(base.id, base.info);

        acc.addRelation(base.id)
        const newAcc: AnnotationResolver = acc.newRoot();
        newAcc.begin(dep)
        newAcc.resolve(base.target)
        newAcc.end(dep)
    }

    finalize<E>(dep: MetaDep<E>, target: AnyDep): void {
        if (target.kind === 'model' && target.updater) {
            target.updater.metaOwners.push(dep.base)
            dep.sources.push(((target.updater: any): AsyncUpdater))
        }
    }
}
