

let number = 1;
export default class VNode {
    /**
     * 
     * @param {*} tag 
     * @param {*} elm 
     * @param {*} children 
     * @param {*} text 
     * @param {*} data 
     * @param {*} parent 
     * @param {*} nodeType 
     */
    constructor(
        tag,        // 标签类型DIV SPAN INPUT #TEXT
        elm,        // 对应的真是节点
        children,   // 当前节点的子节点
        text,       // 当前虚拟结点中的文本
        data,       // VNodeData, 暂时保留，暂无意义
        parent,     // 父级节点
        nodeType,   // 节点类型
    ) {
        this.tag = tag;
        this.elm = elm;
        this.children = children;
        this.text = text;
        this.data = data;
        this.parent = parent;
        this.nodeType = nodeType;
        this.env = {}               // 当前节点的环境变量
        this.instructions = null;   // 存放指令
        this.template = [];         // 当前结点涉及到的模板
        this.number = number ++;
    }
}