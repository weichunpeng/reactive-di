// @flow

import type {
    IHasForceUpdate,
    IComponent,
    IContext,
    IMaster,
    IConsumerListener,
    IConsumer,
    IConsumerMeta,
    IGetable,
    IArg
} from './interfaces'

import resolveArgs from './resolveArgs'
import ConsumerListener from './ConsumerListener'

const emptyArgs: any = [{}]
const emptyHook: any = {
    cached: {}
}
const fakeUpdater = {
    forceUpdate() {}
}

export default class Consumer<
    Props: any,
    State,
    Element,
    Component
> {
    t: 2
    displayName: string
    id: number
    closed: boolean
    pulled: boolean
    context: IContext
    masters: IMaster[]
    state: State

    _resolved: boolean
    _refs: number
    _meta: IConsumerMeta
    _args: ?IArg[]
    _argVals: [State]

    _proto: IGetable<IComponent<Props, State, Element>>
    _updaters: IHasForceUpdate[]
    _errorComponent: ?IConsumerListener<{error: Error}, Element, Component>
    _isOwnContext: boolean

    constructor(
        meta: IConsumerMeta,
        context: IContext
    ) {
        this.t = 2
        this._refs = 0
        this.closed = false
        this.pulled = false
        this._resolved = false
        this._isOwnContext = !!meta.register

        this._errorComponent = null
        this._args = (null: any)
        this._argVals = emptyArgs
        this.masters = []
        this.state = this._argVals[0]
        this._updaters = []

        this._meta = meta
        this.displayName = meta.name
        this.id = meta.id
        this.context = context
        context.disposables.push(this)
    }

    create(updater: IHasForceUpdate): IConsumerListener<Props, Element, Component> {
        const meta = this._meta
        const context = this.context
        if (!this._resolved) {
            this._resolved = true
            context.binder.begin((this: IConsumer<Props, Element>), false)

            this._proto = context.protoFactory
                ? context.protoFactory.resolveSource(meta.key)
                : ({cached: meta.key}: Object)

            this._errorComponent = meta.errorComponent
                ? context.resolveConsumer(meta.errorComponent).create(fakeUpdater, {})
                : null

            this._args = meta.args ? context.resolveDeps(meta.args) : null
            if (this._args) {
                this._argVals = (new Array(this._args.length): any)
            }
            context.binder.end()
        }

        this._updaters.push(updater)

        return new ConsumerListener(
            this.displayName,
            updater,
            meta.hook ? context.resolveHook(meta.hook) : emptyHook,
            this,
            this._proto,
            this._errorComponent,
            context
        )
    }

    _pull(): void {
        this.pulled = true
        if (this._args && !resolveArgs(this._args, this._argVals)) {
            return
        }
        this.state = this._argVals[0]
        const updaters = this._updaters
        for (let i = 0, l = updaters.length; i < l; i++) {
            updaters[i].forceUpdate()
        }
    }

    pull(): void {
        try {
            this._pull()
        } catch (e) {
            this.context.errorHandler.setError(e)
        }
    }

    dispose(): void {
        const context: ?IContext = this._isOwnContext ? this.context : null
        const masters = this.masters
        for (let i = 0, l = masters.length; i < l; i++) {
            const master = masters[i]
            master.refs-- // eslint-disable-line
            if (master.refs === 0) {
                master.willUnmount(context)
            }
        }
        if (this._isOwnContext) {
            this._errorComponent = null
            this._args = (null: any)
            this._argVals = emptyArgs
            this.masters = []
            this.state = this._argVals[0]
            this._updaters = []
            this.closed = true
        }
    }

    willUnmount(updater: IHasForceUpdate): void {
        const newUpdaters: IHasForceUpdate[] = []
        const updaters = this._updaters
        for (let i = 0, l = updaters.length; i < l; i++) {
            const item = updaters[i]
            if (item !== updater) {
                newUpdaters.push(item)
            }
        }
        this._updaters = newUpdaters

        this._refs--
        if (this._refs === 0) {
            if (this._isOwnContext) {
                this.context.dispose()
            } else {
                this.dispose()
            }
        }
    }

    willMount(): void {
        if (this._refs === 0) {
            const masters = this.masters
            for (let i = 0, l = masters.length; i < l; i++) {
                const master = masters[i]
                if (master.refs === 0) {
                    master.willMount(this.context)
                }
                master.refs++ // eslint-disable-line
            }
            if (this._args && !resolveArgs(this._args, this._argVals)) {
                this.state = this._argVals[0]
            }
        }

        this._refs++
    }
}
