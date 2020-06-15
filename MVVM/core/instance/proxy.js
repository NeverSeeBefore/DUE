import { renderData } from "./render.js";
import rebuild from "./mount.js";
import { getValue } from "../util/ObjectUtil.js";

const arrayProto = Array.prototype;
function defArrayFunc(obj, func, namespace, vm) {

    Object.defineProperty(obj, func, {
        enumerable:true,
        configurable:true,
        value: function (...args){
            let original = arrayProto[func];
            const result = original.apply(this, args);
            // console.log(getNameSpace(namespace, ''))
            // 重新构建节点
            rebuild(vm, getNameSpace(namespace, ""))
            renderData(vm, getNameSpace(namespace, ""));
            return result;
        }
    });
}

function proxyArr (vm, arr, namespace){
    let obj = {
        eleType: 'Array',
        toString: function () {
            let result = "";
            for (let i = 0; i < arr.length; i++) {
                result += arr[i] +', ';
            }
            return result.substring(0, result.length - 2);
        },
        push() {

        },
        pop() {},
        shift() {},
        unshift() {}
    };
    defArrayFunc.call(vm, obj, 'push', namespace, vm);
    defArrayFunc.call(vm, obj, 'prop', namespace, vm);
    defArrayFunc.call(vm, obj, 'shift', namespace, vm);
    defArrayFunc.call(vm, obj, 'unshift', namespace, vm);
    arr.__proto__ = obj;
    return arr;
}

function constructObjectProxy (vm, obj, namespace){
    let proxyObj = {};
    for(let prop in obj){
        // proxyObj
        Object.defineProperty(proxyObj, prop, {//代理给proxyObj, 代理的属性是prop，对prop的配置是{。。。}
            configurable: true,
            get() {
                return obj[prop];
            },
            set: function (value) {
                // console.log('proxyObj ' + getNameSpace(namespace, prop));
                obj[prop] = value;
                let val = getValue(vm._data, getNameSpace(namespace, prop));
                if(val instanceof Array){
                    rebuild(vm, getNameSpace(namespace, prop));
                }
                renderData(vm, getNameSpace(namespace, prop));
            }
        });
        // 在vm上也设置代理
        Object.defineProperty(vm, prop, {//代理给proxyObj, 代理的属性是prop，对prop的配置是{。。。}
            configurable: true,
            get() {
                return obj[prop];
            },
            set: function (value) {
                // console.log('vm ' + getNameSpace(namespace, prop));
                obj[prop] = value;
                let val = getValue(vm._data, getNameSpace(namespace, prop));
                if(val instanceof Array){
                    rebuild(vm, getNameSpace(namespace, prop));
                }
                renderData(vm, getNameSpace(namespace, prop));                
            }
        });
        if(obj[prop] instanceof Object) { // 如果这个属性是对象，继续调用constructProxy设置代理
            proxyObj[prop] = constructProxy(vm, obj[prop], getNameSpace(namespace, prop));
        }
    }

    return proxyObj;
}


// 我们要知道哪个属性被修改了，我们才能对页面上的内容进行更新
// 所以我们必须先能捕获修改这个事件
// 所以我们需要用代理的方式来实现监听属性的修改
export function constructProxy(vm, obj, namespace){// vm:Due对象 obj:要代理的对象 namespace:

    let proxyObj = null;
    if(obj instanceof Array){ //代理数组
        proxyObj = new Array(obj.length);
        // 对数组的每一个元素代理
        for (let i = 0; i < obj.length; i++) {
            proxyObj[i] = constructProxy(vm, obj[i], namespace);
        }
        // 对这个数组代理
        proxyObj =proxyArr(vm, obj, namespace);
    }else if(obj instanceof Object){//代理对象
        proxyObj = constructObjectProxy(vm, obj, namespace);
    }else{
        throw new Error('error' + obj);
    }
    return proxyObj;
}


function getNameSpace(nowNameSpace, nowProp) {
    if(nowNameSpace == null || nowNameSpace == ""){
        return nowProp;
    } else if(nowProp == null || nowProp == ""){
        return nowNameSpace;
    } else {
        return nowNameSpace + '.' + nowProp;
    }
}

