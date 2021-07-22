import React , {unstable_batchedUpdates, useRef, useState} from 'react'

/* 对外接口  */
const formInstanceApi = [
  'setCallback',
  'dispatch',
  'registerValidateFields',
  'resetFields',
  'setFields',
  'setFieldsValue',
  'getFieldsValue',
  'getFieldValue',
  'validateFields',
  'submit',
  'unRegisterValidate'
]

export function useForm(form, defaultFormValue = {}) {
  const formRef = useRef(null)
  const [, forceUpdate] = useState({})
  if (!formRef.current) {
    formRef.current = form
  } else {
    const formStoreCurrent = new FormStore(forceUpdate, defaultFormValue)
    /* 获取实例方法 */
    formRef.current = formStoreCurrent.getForm()
  }
  return formRef.current
}


const isReg = value => value instanceof RegExp;

class FormStore {
  constructor(forceUpdate, defaultFormValue = {}) {
    this.FormUpdate = forceUpdate;
    this.model = {};
    this.control = {}
    this.isSchedule = false;
    this.callback = {}
    this.penddingValidateQueue = []
    this.defaultFormValue = defaultFormValue;
  }

  getForm () {
    return formInstanceApi.reduce((map, item) => {
      map[item] = this[item].bind(this)
      return map
    }, [])
  }

  static createValidate(validate) {
    const {value, required, rule, message} = validate
    return {
      value,
      rule: rule || (() => true),
      required: required || false,
      message: message || '',
      status: 'pendding'
    }
  }

  setCallback(callback) {
    if(callback) {
      this.callback = callback
    }
  }

  dispatch(action, ...args) {
    if (!action && (typeof action !== 'object')) {
      return null
    }
    const {type} = action
    if (formInstanceApi.includes(type)) {
      return this[type](...args)
    } else if (typeof this[type] === 'function') {
      return this[type](...args)
    }
  }

  registerValidateFields(name, control, model) {
    if (this.defaultFormValue[name]) {
      model.value = this.defaultFormValue[name]
      const validate = FormStore.createValidate(model)
      this.model[name] = validate
      this.control[name] = control
    }
  }

  unRegisterValidate(name) {
    delete this.model[name]
    delete this.control[name]
  }

  notifyChange(name) {
    const controller = this.control[name]
    if (controller) {
      controller.changeValue()
    }
  }

  resetFields() {
    Object.keys(this.model).forEach(modelName => {
      this.setValueClearStatus(this.model[modelName], modelName, null)
    })
  }

  setFields (object) {
    if (typeof object !== 'object') return
    Object.keys(object).forEach(modelName=>{
      this.setFieldsValue(modelName, object[modelName])
  })
  }

  setFieldsValue(name, modelValue) {
    const model = this.model[name]
    if (!model) return false

    if (typeof modelValue === 'object') {
      const { message ,rule , value  } = modelValue
      if (message) {
        model.message = message
      }
      if (rule) {
        model.rule = rule
      }
      if(value) {
        model.value = value
      }
      model.status = 'pendding'
      this.validateFieldValue(name, true)
    } else {
      this.setValueClearStatus(model, name, modelValue)
    }
  }

  setValueClearStatus(model, name, value) {
    model.value = value
    model.status = 'pendding'
    this.notifyChange(name)
  }

  getFieldsValue() {
    const formData = {}
    Object.keys (this.model).forEach(modelName => {
      formData[modelName] = this.model[modelName].value;
    });
    return formData
  }

  getFieldModel(name) {
    const model = this.model[name];
    return model ? model : {}
  }

  getFieldValue(name) {
    const model = this.model[name];
    if (!model && this.defaultFormValue[name]) {
      return this.defaultFormValue[name]
    }
    return model ? model.value : null;
  }

  validateFieldValue(name, forceUpdate = false) {
    const model = this.model[name];
    const lastStatus = model.status
    if (!model) return null;
    const { required ,rule , value  } = model
    let status = 'resolve'
    if (required && !value) {
      status = 'reject'
    } else if (isReg(rule)) {
      status = rule.test(value) ? 'resolve' : 'reject'
    } else if (typeof value === 'function') {
      status = rule(value) ? 'resolve' : 'reject'
    }
    model.status = status

    if (lastStatus !== status || forceUpdate) {
      const notify = this.notifyChange(name)
      this.penddingValidateQueue.push(notify)
    }
    this.scheduleValidate()
    return status
  }

  scheduleValidate() {
    if (this.isSchedule) return
    this.isSchedule = true

    Promise.resolve().then(() => {
      unstable_batchedUpdates(() => {
        do {
          const notify = this.penddingValidateQueue.shift()
          notify && notify()  /* 触发更新 */
        } while (this.penddingValidateQueue.length > 0);
        this.isSchedule = false
      })
    }, err => {

    })
  }

  validateFields(callback) {
    let status = true
    Object.keys(this.model).forEach(modelName => {
      const status = this.validateFieldValue(modelName, true)
      if (status === 'reject') {
        status = false
      }
    })
    callback(status)
  }

  submit(cb) {
    this.validateFields((res) => {
      const { onFinish, onFinishFailed} = this.callback
      cb && cb(res)
      if(!res) {
        onFinishFailed && typeof onFinishFailed === 'function' && onFinishFailed() /* 验证失败 */
        onFinish && typeof onFinish === 'function' && onFinish(this.getFieldsValue())     /* 验证成功 */
      }
    })
  }

}

export default FormStore