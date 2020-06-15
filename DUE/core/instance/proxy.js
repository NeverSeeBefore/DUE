
const arrayProto = Array.prototype;
function defArrayFunc(obj, func, namespace, vm) {
    Object.defineProperty(obj, func, {
        enumerable: true,
        configurable: true,
        value: function (...args) {
            let original = arrayProto[func];
            const result = original.apply(this, args);
            console.log(getNameSpace(namespace, func));
            return result;
        }
    })
}

function proxyArr(vm, arr, namespace) {
    let obj= {
        eleType: 'Array',
        toString: function ( ) {
            let result = "";
            for (let i = 0; i < arr.length; i ++){
                result += arr[i] + ', ';
            }
            return result.substring(0, result.length - 2);
        },
        push: function () {
            
        },
        pop() {
            
        },
        shift() {
            
        },
        unshift() {
            
        }
    };
    defArrayFunc(obj, "push", namespace, vm);
    defArrayFunc(obj, "pop", namespace, vm);
    defArrayFunc(obj, "shift", namespace, vm);
    defArrayFunc(obj, "unshift", namespace, vm);

    arr.__proto__ = obj;
    return arr;
}

// 
function constructObjectProxy (vm, obj, namespace){
    let proxyObj = {};
    for (const prop in obj) {
        // 代理对象
        Object.defineProperty(proxyObj, prop, {
            configurable: true,
            get(){
                return obj[prop];
            },
            set: function (value) {
                // console.log('===', prop, value);
                console.log(getNameSpace(namespace, prop));
                obj[prop] = value;
            }
        });
        // vm 本身
        Object.defineProperty(vm, prop, {
            configurable: true,
            get(){
                return obj[prop];
            },
            set: function (value) {
                console.log(getNameSpace(namespace, prop));
                obj[prop] = value;
            }
        })
        if(obj[prop] instanceof Object){
            proxyObj[prop] = constructProxy(vm, obj[prop], getNameSpace(namespace, prop));
        }
    }
    return proxyObj;
}
function getNameSpace(nowNameSpace, nowProp) {
    if(nowNameSpace == null || nowNameSpace == '') {
        return nowProp;
    }else if(nowProp == null || nowProp == ''){
        return  nowNameSpace;
    }else {
        return nowNameSpace + '.' + nowProp;
    }
}

// 捕获数据的修改，
export function constructProxy (vm, obj, namespace){  
    let proxyObj = null;
    if(obj instanceof Array) {          // 判断是否为数组
        proxyObj = new Array((obj.length));
        for (let i = 0; i < obj.length; i ++) {
            proxyObj[i] = constructProxy(vm, obj[i], namespace);
        }
        proxyObj = proxyArr(vm, obj, namespace);
    }else if(obj instanceof Object) {   // 判断是否为对象
        proxyObj = constructObjectProxy(vm, obj, namespace);
    }else{
        throw new Error('error');
    }
    return proxyObj;
}