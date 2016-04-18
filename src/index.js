/* @flow */
import BaseProvider from 'reactive-di/core/BaseProvider'
import createManagerFactory from 'reactive-di/core/createManagerFactory'
import defaultPlugins from 'reactive-di/plugins/defaultPlugins'
import SimpleMap from 'reactive-di/utils/SimpleMap'
import SimpleSet from 'reactive-di/utils/SimpleSet'
import createHotRelationUpdater from 'reactive-di/core/updaters/createHotRelationUpdater'
import createDummyRelationUpdater from 'reactive-di/core/updaters/createDummyRelationUpdater'
import annotationDriver from 'reactive-di/core/annotationDriver'
import DisposableCollection from 'reactive-di/utils/DisposableCollection'

import {
    fastCall,
    fastCreateObject
} from 'reactive-di/utils/fastCall'

export {
    fastCall,
    fastCreateObject,

    DisposableCollection,
    annotationDriver,
    createHotRelationUpdater,
    createDummyRelationUpdater,
    SimpleSet,
    SimpleMap,
    BaseProvider,
    createManagerFactory,
    defaultPlugins
}
