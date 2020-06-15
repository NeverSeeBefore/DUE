import Due from "./index.js";
import { constructProxy } from "./proxy.js";

let uid = 0;

export function initMixin (Due) {
    Due.prototype._init = function(options){
        const vm = this;
        vm.uid = uid ++;    // 编号
        vm._isDue = true;   // 
        // 初始化data
        if(options && options.data){
            vm._data = constructProxy(vm, options.data, "");
            
        }
        console.log(vm);
        // 初始化created

        // 初始化methods

        // 初始化computed

        // 初始化el并挂载
    }
}


