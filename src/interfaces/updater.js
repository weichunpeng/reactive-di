// @flow

import type {Key} from 'reactive-di/interfaces/deps' // eslint-disable-line

export type SingleSyncUpdate = Object
export type SingleAsyncUpdateResult = Promise<SingleSyncUpdate>
    | Observable<SingleSyncUpdate, Error>
export type SingleAsyncUpdate = () => SingleAsyncUpdateResult
export type SingleUpdate = (SingleSyncUpdate | SingleAsyncUpdate)
    | [SingleSyncUpdate, SingleAsyncUpdate]

export type MultiSyncUpdate = [Key, Object] | Object
export type MultiAsyncUpdateResult = Promise<MultiSyncUpdate[]>
    | Observable<MultiSyncUpdate[], Error>
export type MultiAsyncUpdate = () => MultiAsyncUpdateResult
export type MultiUpdate = MultiSyncUpdate | MultiAsyncUpdate
