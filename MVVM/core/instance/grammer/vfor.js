import VNode from "../../vdom/vnode.js"
import { getValue } from "../../util/ObjectUtil.js";

export default function vforInit(vm, elm, parent, instructions) {
    //instructions '(key) in list' list 存放才第五位data中
    let virtualNode = new VNode(elm.nodeName, elm, [], "", getVirtualNodeData(instructions)[2], parent, 0);
    virtualNode.instructions = instructions;
    // 移除掉
    parent.elm.removeChild(elm);
    // 由于删除时会意外的将elm之后的文本节点也删除，为了不影响原结构，在此加回去
    parent.elm.appendChild(document.createTextNode(""));
    // 分析指令 instructions
    let resultSet = analysisInstructions(vm, instructions, elm, parent);
    return virtualNode;
}

function getVirtualNodeData (instructions) {
    let insSet = instructions.trim().split(" ");
    // console.log(insSet);
    if(insSet.length != 3 || insSet[1] != "in" && insSet[1] != "of"){
        throw new Error("error: instructions of vfor is not suitable ");
    }
    return insSet;
}
function analysisInstructions(vm, instructions, elm, parent){
    let insSet = getVirtualNodeData(instructions);
    let dataSet = getValue(vm._data, insSet[2]);
    if(!dataSet){                       
        throw new Error("error: " + insSet[2] + "not found");
    }
    let resultSet = [];
    for (let i = 0; i < dataSet.length; i++) {
        let tempDom = document.createElement(elm.nodeName);
        tempDom.innerHTML = elm.innerHTML;
        let env = analysisKV(insSet[0], dataSet[i], i);     //获取局部变量  
        tempDom.setAttribute("env", JSON.stringify(env));   // 将变量设置到dom中
        parent.elm.appendChild(tempDom)
        resultSet.push(tempDom);
    }
    return resultSet;
}
function analysisKV (instructions, vlaue, index){
    if(/([\w\d_$]+)/.test(instructions)){   //(key) /(key,index)
        instructions = instructions.trim().substring(1, instructions.length - 1);
    }
    let keys = instructions.split(",");     // key  /  key,index
    if(keys.length == 0){
        throw new Error("error: the key of vfor's instructions ");
    }
    let obj = {};
    if(keys.length >= 1){
        obj[keys[0].trim()] = vlaue;
    }
    if(keys.length >= 2){
        obj[keys[1].trim()] = index;
    }
    return obj;
}
