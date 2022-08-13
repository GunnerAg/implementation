import { celebrate, Joi } from 'celebrate'

const ValidateLogin = celebrate({
  body: Joi.object({
    email: Joi.string().required(),
    password: Joi.string().required()
  })
})

const ValidateLoginBoddy = celebrate({
  body: Joi.object({
    email: Joi.string().required(),
    password: Joi.string().required()
  })
})

const ValidateSignUpBoddy = celebrate({
  body: Joi.object({
    email: Joi.string().required(),
    password: Joi.string().required()
  })
})

const ValidateUpdateMeBoddy = celebrate({
  body: Joi.object({
    email: Joi.string().optional(),
    password: Joi.string().optional(),
    name: Joi.string().optional(),
    phone: Joi.number().optional(),
    webUrl: Joi.string().optional(),
    industry: Joi.string().optional()
  })
})

const ValidateCompanyByField = celebrate({
  body: Joi.object({
    email: Joi.string().optional(),
    name: Joi.string().optional(),
    phone: Joi.number().optional(),
    webUrl: Joi.string().optional(),
    industry: Joi.string().optional()
  })
})

const ValidateProjectBoddy = celebrate({
  body: Joi.object({
    name: Joi.string().required(),
    webUrl: Joi.string().required()
  })
})

const ValidatePasswordChange = celebrate({
  body: Joi.object({
    lastPassword: Joi.string().required(),
    newPassword: Joi.string().required()
  })
})

// SDK

const ValidateConnectionBoddy = celebrate({
  body: Joi.object({
    email: Joi.string().required(),
    code: Joi.string().optional(),
    wallet: Joi.string().optional()
  })
})

export {
  ValidateLogin,
  ValidatePasswordChange,
  ValidateCompanyByField,
  ValidateLoginBoddy,
  ValidateSignUpBoddy,
  ValidateUpdateMeBoddy,
  ValidateConnectionBoddy,
  ValidateProjectBoddy
}
