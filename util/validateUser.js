const joi = require("joi")

const validateSchema = user =>{
    const schema = joi.object({
        name: joi.string().min(1).max(50).required(),
        email: joi.string().email().required(),
        mobile: joi.number().min(10).required(),
        gender: joi.string().min(4).max(6).required(),
        type: joi.number().max(5).min(1).required(),
        state: joi.string().min(2).required(),
        city: joi.string().min(2).required(),
        paid: joi.boolean()
    })
    console.log(schema.validate(user))
    const valid = schema.validate(user)
    return valid.error == null
}
module.exports = {validateSchema}