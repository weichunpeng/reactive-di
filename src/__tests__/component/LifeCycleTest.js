// @flow
/* eslint-env mocha */

import {spy, match} from 'sinon'
import assert from 'power-assert'

import React from 'react'
import ReactDOM from 'react-dom/server'

import {
    hooks,
    theme,
    component,
    source,
    deps
} from 'reactive-di/annotations'

import type {StyleSheet} from 'reactive-di/interfaces/component'

import {Component} from 'fake-react'
import Di from 'reactive-di/core/Di'
import BaseModel from 'reactive-di/utils/BaseModel'

import ReactComponentFactory from 'reactive-di/adapters/ReactComponentFactory'

import {renderIntoDocument} from 'react-addons-test-utils'
import {findDOMNode} from 'react-dom'
type ReactComponent<Props, State> = React$Component<*, Props, State>

function render(raw) {
    return renderIntoDocument(React.createElement(raw))
}

describe('LifeCycleTest', () => {
    type ModelARec = {
        val?: string;
    }

    it('handle lc updates', () => {
        @source({key: 'ModelA'})
        class ModelA extends BaseModel<ModelARec> {
            val: string;
            static defaults: ModelARec = {
                val: 'state-value'
            };
            copy: (rec: ModelARec) => ModelA;
        }


        interface Props {}
        interface State {
            m: ModelA;
        }

        function TestComponent(props: Props, state: State, h): mixed {
            return <div>{state.m.val}</div>
        }
        deps({m: ModelA})(TestComponent)
        component()(TestComponent)

        const onMount = spy()
        const onUnmount = spy()
        const onUpdate = spy()

        @hooks(TestComponent)
        class TestComponentHooks {
            onMount: (tc: ReactComponent<Props, State>) => void = onMount
        }

        const di = new Di(new ReactComponentFactory(React))

        const TestComponentEl = di.wrapComponent(TestComponent)

        assert(onMount.notCalled)
        assert(onUpdate.notCalled)
        const componentA = render(TestComponentEl)
        assert(onMount.calledOnce)
        assert(onUpdate.notCalled)
    })
})