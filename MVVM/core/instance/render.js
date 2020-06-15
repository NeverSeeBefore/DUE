import { getValue } from "../util/ObjectUtil.js";

// 通过模板找到哪些节点用到了这个模板
let template2Vnode = new Map();
// 通过节点找到这个节点用到哪些模板
let vnode2Template = new Map();




export function prepareRender (vm, vnode) {
    if(vnode == null){
        return null;
    }
    // 分析文本节点
    if(vnode.nodeType == 3){ 
        analysisTemplateString(vnode);
    }
    // 分析元素身上的属性
    if(vnode.nodeType == 1){
        analysisAttr(vm, vnode);
    }
    if(vnode.nodeType == 0){
        setTemplate2Vnode(vnode.data, vnode);
        setVnode2Template(vnode.data, vnode);
    }
    // if(vnode.nodeType == 1){ 
        for(let i = 0; i < vnode.children.length; i ++){
            prepareRender(vm, vnode.children[i]);
        }
    // }
}
function analysisAttr(vm, vnode) {
    let attrNames = vnode.elm.getAttributeNames();
    if(attrNames.indexOf('v-model') > -1){
        setTemplate2Vnode(vnode.elm.getAttribute("v-model"), vnode);
        setVnode2Template(vnode.elm.getAttribute("v-model"), vnode);
    }
}

function analysisTemplateString(vnode) {
    // console.log(vnode.text);
    let templateStrList = vnode.text.match(/{{[\w\d\s_.]+}}/g)
    for (let i = 0;templateStrList && i < templateStrList.length; i++) {
        setTemplate2Vnode(templateStrList[i], vnode);
        setVnode2Template(templateStrList[i], vnode);
        
    }
    // console.log(templateStrList);
}

function setTemplate2Vnode(template, vnode) {
    // console.log(template);
    let templateName = getTemplateName(template);
    // console.log(templateName);
    let vnodeSet = template2Vnode.get(templateName);
    if(vnodeSet){
        vnodeSet.push(vnode);
    } else {
        template2Vnode.set(templateName, [vnode]);
    }

}
function setVnode2Template(template, vnode) {
    let templateName = getTemplateName(template)
    let templateSet = vnode2Template.get(vnode);
    if(templateSet){
        templateSet.push(templateName);
    } else {
        vnode2Template.set(vnode, [templateName])
    }
}

function getTemplateName(template) {
    // 判断是否有花括号
    // 如果有，则解掉，没有直接返回
    if(template.substring(0, 2) == "{{" && template.substring(template.length - 2, template.length) == "}}"){
        return template.substring(2, template.length - 2).trim();
    }else {
        return template;
    }
}

export function getTemplate2VnodeMap() {
    return template2Vnode;
}
export function getVnode2TemplateMap() {
    return vnode2Template;
}

/**
 * 
 *  */
export function renderMinin(Due) {
    Due.prototype._render = function () {
        renderNode(this, this._vnode);
    }
}

export function renderNode(vm, vnode) {
    if(vnode.nodeType == 3){    // 对文本节点进行操作
        let templates = vnode2Template.get(vnode); // 看节点是都有模板
        if(templates){          // 有的话，将模板替换为对应值
            
            let result = vnode.text;
            for (let i = 0; i < templates.length; i++) {
                // [vm._data, vnode.env] 当前节点的参数，可以来自于Due对象，也可以来自于父级节点
                let templateValue = getTemplateValue([vm._data, vnode.env], templates[i]);
                // console.log(templateValue);
                if(templateValue){
                    result = result.replace('{{' + templates[i] + '}}', templateValue);
                }
            }
            vnode.elm.nodeValue = result;
        }
    } else if(vnode.nodeType == 1 && vnode.tag == "INPUT") { 
        let templates = vnode2Template.get(vnode);
        if(templates){
            for (let i = 0; i < templates.length; i++) {
                let templateValue = getTemplateValue([vm._data, vnode.env], templates[i]);
                if(templateValue){
                    vnode.elm.value = templateValue;
                }
            }
        }
    } else {
        for (let i = 0; i < vnode.children.length; i++) {
            renderNode( vm, vnode.children[i]);
            // getTemplateValue(vm._data, templates[i]);
        }
    }
}

function getTemplateValue(objs, template) {
    for (let i = 0; i < objs.length; i++) {
        let temp = getValue(objs[i], template);
        if(temp != null){
            return temp;
        }
    }
    return null;
}

/**
 * 
 * @param {vnode} vm 
 * @param {String} data 
 */
export function renderData(vm, data) {
    let vnodes = template2Vnode.get(data);
    if(vnodes != null){
        for (let i = 0; i < vnodes.length; i++) {
            renderNode(vm, vnodes[i]);
        }
    }
}

export function getVnodeByTemplate(template){
    return template2Vnode.get(template);
}

export function clearMap() {
    template2Vnode.clear();
    vnode2Template.clear();
}