import { mergeAttr } from "../instance/mount.js";

// 接受一个对象，接受一个引用名，
// 对象存在这个引用名时，返回对应的值
export function getValue(obj, name) {   // key.a
    if(!obj){
        return obj;
    }
    let nameList = name.split(".");     // 通过 . 拆分，通过for循环，
    let temp =  obj;                    
    for(let i = 0; i < nameList.length; i ++){// 每次循环都相当于递进一层，
        if(temp[nameList[i]]){
            temp = temp[nameList[i]];
        } else {                        // 如果某层没有改属性，则返回undefined
            return undefined;
        }
    }
    return temp;                        // temp为最终结果
}


export function setValue(obj, data, value){ // 那个对象的那个属性变成什么值
    if(!obj){
        return ;
    }
    let attrList = data.split('.');
    let temp = obj;
    for(let i = 0; i < attrList.length - 1; i ++){
        if(temp[attrList[i]]){
            temp = temp[attrList[i]];
        }else{
            return;
        }
    }
    if(temp[attrList[attrList.length - 1]] != null){
        temp[attrList[attrList.length - 1]] = value;
    }
}

export function getEnvAttr(vm, vnode){
    let result = mergeAttr(vm._data, vnode.env);
    result = mergeAttr(result, vm._computed);
    return result;
}