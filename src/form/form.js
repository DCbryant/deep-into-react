import {useForm} from './index'
import FormContext from './context'
import React, {forwardRef, useImperativeHandle} from 'react'

function Form({
  form,
  onFinish,
  onFinishFailed,
  initialValues,
  children
}, ref) {
  const formInstance = useForm(form, initialValues)
  const { setCallback, dispatch  ,...providerFormInstance } = formInstance

  setCallback({
      onFinish,
      onFinishFailed
  })

  useImperativeHandle(ref,() => providerFormInstance , [])

  const RenderChildren = (
    <FormContext.Provider value={formInstance} >
      {children}
    </FormContext.Provider>
  )

  return (
    <form
      onReset={(e)=>{
          e.preventDefault()
          e.stopPropagation()
          formInstance.resetFields() /* 重置表单 */
      }}
      onSubmit={(e)=>{
          e.preventDefault()
          e.stopPropagation()
          formInstance.submit()      /* 提交表单 */
      }}
    >
      {RenderChildren}
    </form>
  )
}

export default forwardRef(Form)