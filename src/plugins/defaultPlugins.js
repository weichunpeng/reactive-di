/* @flow */

import ComposePlugin from 'reactive-di/plugins/compose/ComposePlugin'
import FactoryPlugin from 'reactive-di/plugins/factory/FactoryPlugin'
import ClassPlugin from 'reactive-di/plugins/class/ClassPlugin'
import ValuePlugin from 'reactive-di/plugins/value/ValuePlugin'
import AliasPlugin from 'reactive-di/plugins/alias/AliasPlugin'

const plugins: Array<Class<Plugin>> = [
    ComposePlugin,
    FactoryPlugin,
    ClassPlugin,
    ValuePlugin,
    AliasPlugin
];

export default plugins
