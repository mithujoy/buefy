import Dialog from './Dialog'

import config, { VueInstance } from '../../utils/config'
import { merge } from '../../utils/helpers'
import { use, registerComponent, registerComponentProgrammatic } from '../../utils/plugins'

let localVueInstance

function open(propsData) {
    const slot = propsData.message
    delete propsData.message
    const vm = typeof window !== 'undefined' && window.Vue ? window.Vue : localVueInstance || VueInstance
    const DialogComponent = vm.extend(Dialog)
    const component = new DialogComponent({
        el: document.createElement('div'),
        propsData
    })
    if (slot) {
        const CustomSlot = vm.extend({
            template: `<div>${slot}</div>`
        })
        component.$slots.default = new CustomSlot().$mount()._vnode
        component.$forceUpdate()
    }
    if (!config.defaultProgrammaticPromise) {
        return component
    } else {
        return new Promise((resolve) => {
            component.$on('confirm', (event) => resolve({ result: event || true, dialog: component }))
            component.$on('cancel', () => resolve({ result: false, dialog: component }))
        })
    }
}

const DialogProgrammatic = {
    alert(params) {
        if (typeof params === 'string') {
            params = {
                message: params
            }
        }
        const defaultParam = {
            canCancel: false
        }
        const propsData = merge(defaultParam, params)
        return open(propsData)
    },
    confirm(params) {
        const defaultParam = {}
        const propsData = merge(defaultParam, params)
        return open(propsData)
    },
    prompt(params) {
        const defaultParam = {
            hasInput: true,
            confirmText: 'Done'
        }
        const propsData = merge(defaultParam, params)
        return open(propsData)
    }
}

const Plugin = {
    install(Vue) {
        localVueInstance = Vue
        registerComponent(Vue, Dialog)
        registerComponentProgrammatic(Vue, 'dialog', DialogProgrammatic)
    }
}

use(Plugin)

export default Plugin

export {
    DialogProgrammatic,
    Dialog as BDialog
}
