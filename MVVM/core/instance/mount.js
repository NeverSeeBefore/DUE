import VNode from "../vdom/vnode.js";
import { prepareRender, getVnodeByTemplate, clearMap } from "./render.js";
import { vmodel } from "./grammer/vmodel.js";
import vforInit from "./grammer/vfor.js";
import { checkVBind } from "./grammer/vbind.js";
import { checkVOn } from "./grammer/von.js";

export function initMount(Due) {
    Due.prototype.$mount = function (el) {
        let vm = this;
        let rootDom = document.getElementById(el);
        mount(vm, rootDom);
    }
}

export function mount(vm, elm) {
    console.log('begin mount')

    // 进行挂载
    vm._vnode = constructVNode(vm, elm, null);
    // 预备渲染（建立渲染索引，通过模板找vnode，通过vnode找模板）
    prepareRender(vm, vm._vnode);
    // console.log(getTemplate2VnodeMap());
    // console.log(getVnode2TemplateMap());
    console.log("mounted");
}
// 创建虚拟DOM树
function constructVNode(vm, elm, parent) { //深度优先搜索

    // 先分析属性
    let vnode = analysisAttr(vm, elm, parent);
    if(vnode == null){
        // 创建vnode
        let children = [];
        let text = getNodeText(elm);
        let data = null;
        let nodeType = elm.nodeType;
        let tag = elm.nodeName;
        vnode = new VNode(tag, elm, children, text, data, parent, nodeType);
        if(elm.nodeType == 1 && elm.getAttribute('env')){
            vnode.env = mergeAttr(vnode.env, JSON.parse(elm.getAttribute('env')));
        }else {
            vnode.env = mergeAttr(vnode.envm, parent ? parent.env : {});
        }
    }
    checkVBind(vm, vnode);
    checkVOn(vm, vnode);

    let childs = vnode.nodeType == 0 ? vnode.parent.elm.childNodes : vnode.elm.childNodes;      // 找到所有子节点，递归循环；
    for (let i = 0; i < childs.length; i++) {
        let childNodes = constructVNode(vm, childs[i], vnode);
        if(childNodes instanceof VNode){    // 返回单一节点
            vnode.children.push(childNodes);
        }else {                             // 返回节点数组
            vnode.children = vnode.children.concat(childNodes);
        }
    }
    return vnode;
}

// 获取节点的文本
function getNodeText (elm) {
    if(elm.nodeType == 3){
        return elm.nodeValue;
    }else {
        return "";
    }
}

// 分析属性
function analysisAttr(vm, elm, parent){
    if(elm.nodeType == 1){// 元素节点
        let attrNames = elm.getAttributeNames();
        if(attrNames.indexOf("v-model") > -1){  //v-model
            vmodel(vm, elm, elm.getAttribute("v-model"));
        }
        if(attrNames.indexOf('v-for') > -1){    // v-for
            return vforInit(vm, elm, parent, elm.getAttribute('v-for'));
        }
        // if(attrNames.indexOf('v-bind'))
    }
    
}

// 合并env
export function mergeAttr (obj1, obj2){
    if(obj1 == null) {
        return clone(obj2);
    }
    if(obj2 == null) {
        return clone(obj1);
    }
    let result = {};
    let obj1Attrs = Object.getOwnPropertyNames(obj1);
    let obj2Attrs = Object.getOwnPropertyNames(obj2);
    for (let i = 0; i < obj1Attrs.length; i++) {
        result[obj1Attrs[i]] = obj1[obj1Attrs[i]];
    }
    for (let i = 0; i < obj2Attrs.length; i++) {
        result[obj2Attrs[i]] = obj2[obj2Attrs[i]];
    }
    console.log(result, obj1, obj2);
    return result;
}
// export function easyClone(obj) {
    // 无法合并代理对象
    // JSON.parse(JSON.stringify(obj))
// }
function clone(obj){
    if(obj instanceof Array){
        return cloneArray(obj);
    }else if(obj instanceof Object){
        return cloneObject(obj);
    }else {
        return obj
    }
}
function cloneObject(obj) {
    let result = {};
    let names = Object.getOwnPropertyNames(obj);
    for (let i = 0; i < names.length; i++) {
        result[names[i]] = clone(obj[names[i]]);
    }
    return result;
}
function cloneArray(arr) {
    let result = new Array(arr.length);
    for (let i = 0; i < arr.length; i++) {
        result[i] = clone(arr[i]);
    }
    return result;
}

// 重建节点
export default function rebuild (vm, template) {
    let virtualNode = getVnodeByTemplate(template);
    for (let i = 0; i < virtualNode.length; i++) {
        virtualNode[i].parent.elm.innerHTML = "";
        virtualNode[i].parent.elm.appendChild(virtualNode[i].elm);
        let result = constructVNode(vm, virtualNode[i].elm, virtualNode[i].parent);
        virtualNode[i].parent.children = [result];
        console.log('res', result);
        clearMap();
        prepareRender(vm, vm._vnode);
    }
}