function Validator(formSelector) {

    var _this = this

    function getParent(element, selector) {
        while (element.parentElement) {
            if (element.parentElement.matches(selector)) {
                return element.parentElement
            }
            element = element.parentElement
        }
    }

    var formRules = {}

    var validatorRules = {
        required: function (value) {
            return value ? undefined : 'Vui lòng nhập trường này'
        },
        email: function (value) {
            var regex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/
            return regex.test(value) ? undefined : 'Vui lòng nhập email'
        },
        min: function (min) {
            return function (value) {
                return value.length >= min ? undefined : `Vui lòng nhập tối thiếu ${min} ký tự`
            }
        },
        max: function (max) {
            return function (value) {
                return value.length <= max ? undefined : `Số ký tự tối đa là ${max}`
            }
        },
        confirmed: function(value) {
                var formElement = document.querySelector(formSelector)
                var getConfirmValue = formElement.querySelector('#password').value
                return value === getConfirmValue ? undefined : 'Giá trị nhập vào không chính xác'
        },
        hasToChecked: function (attribute) {
            return attribute === 'checked' ? undefined : 'Vui lòng chọn ít nhất một tùy chọn'
        }
    }

    var formElement = document.querySelector(formSelector)
    if(formElement) {
        var inputs = formElement.querySelectorAll('[name][rules]')
        for(var input of inputs) {
            var rules = input.getAttribute('rules').split('|')
            for(var rule of rules) {
                var ruleFunc = validatorRules[rule]
                var isRuleHasValue = rule.includes(':')
                if(isRuleHasValue) {
                    var ruleInfo = rule.split(':')
                    ruleFunc = validatorRules[ruleInfo[0]]
                    ruleFunc = ruleFunc(ruleInfo[1])
                }

                if(Array.isArray(formRules[input.name])) {
                    formRules[input.name].push(ruleFunc)
                } else {
                    formRules[input.name] = [ruleFunc]
                }
            }
            input.onblur = handleValidate
            input.oninput = handleClearError
        }
        function handleValidate(e) {
            var rules = formRules[e.target.name]
            var errorMessage
            var input = e.target
            for(var rule of rules) {
                switch(e.target.type) {
                    case 'radio':
                        var radios = document.getElementsByName(e.target.name);
                        for (var i = 0; i < radios.length; i++) { 
                            errorMessage = rule(radios[i].checked)
                            if (radios[i].checked) { 
                                break
                            }
                        }
                        break
                    case 'checkbox':
                        var radios = document.getElementsByName(e.target.name);
                        for (var i = 0; i < radios.length; i++) { 
                            errorMessage = rule(radios[i].checked)
                            if (radios[i].checked) { 
                                break
                            }
                        }
                        break
                    default: 
                        errorMessage = rule(e.target.value)
                }
                if (errorMessage) break
            }

            var formGroup = getParent(e.target, '.form-group')
            var formMessage = formGroup.querySelector('.form-message')
            if(errorMessage) {
                if(formGroup) {
                    formGroup.classList.add('invalid')
                    if(formMessage) {
                        formMessage.innerText = errorMessage
                    }
                } 
            } else {
                formGroup.classList.remove('invalid')
                formMessage.innerText = ''
            }
            return errorMessage
        }
        function handleClearError(e) { // thêm hàm này để khi nhập value vào ô input thì sẽ ko hiện lỗi đỏ
            var formGroup = getParent(e.target, '.form-group')
            if (formGroup.classList.contains('invalid')) {
                formGroup.classList.remove('invalid')
            }

            var formMessage = formGroup.querySelector('.form-message')
            if (formMessage) {
                formMessage.innerText = ''
            }
        }
    }
    console.log(formRules)

    formElement.onsubmit = function(e) {
        e.preventDefault()
        var isFormValid = true
        var inputs = formElement.querySelectorAll('[name][rules]')
        for(var input of inputs) {
            var isValid = handleValidate({target: input})
            if(isValid) { //nếu có lỗi
                isFormValid = false
            }
            // if (input.type === 'checkbox' || input.type === 'radio') {
            //     if (input.matches(':checked')) {
            //         handleClearError({ target: input })
            //     }
            // }
        }
        // for(var input of inputs) {
        //     if (input.type != 'checkbox' && input.type != 'radio') {
        //         if (!handleValidate({target: input})) {
        //             isFormValid = true
        //         }
        //     }
        // }
        console.log(isFormValid)
        if(isFormValid) {
            if(typeof _this.onSubmit == 'function') {
                var enableInputs = formElement.querySelectorAll('[name]')
                var formValues = Array.from(enableInputs).reduce(function(values, input) {
                    switch(input.type) {
                        case 'radio':
                            if(input.matches(':checked')){
                                values[input.name] = input.value
                            } 
                            break
                        case 'checkbox':
                            if(input.matches(':checked')){
                                if(Array.isArray(values[input.name])) {
                                    values[input.name].push(input.value)
                                } else {
                                    values[input.name] = [input.value]
                                }
                            } else {
                                if(!Array.isArray(values[input.name])){
                                    values[input.name] = ''
                                }
                            }
                            break
                        case 'file':
                            values[input.name] = input.files;
                            break
                        default: 
                            values[input.name] = input.value
                    }
                    return values
                }, {})
                _this.onSubmit(formValues)
            } else {
                console.log('...')
            }
        }
    }
}