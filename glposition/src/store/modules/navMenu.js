import http from  '../../http'
import router from '../../router'
import {Message} from 'element-ui'

const state={
  menus:[],
};
const mutations={
	init(state, payload) {
    // console.log(payload,'payload')
    state.menus = payload.res.data.data
	}
};
const actions={
	menuInit({commit},params){
   return new Promise(function (resolve, reject) {
    return http.post('/api/location/middleground/user/treeMenu', params).then(res => {
      if(res.code){
        Message.error(res.msg)
      }else{
        resolve(res)
        commit("init", { res, params})
      }
    }).catch(err => {
    })
   })
   

   }

};
export default {
  namespaced:true,//用于在全局引用此文件里的方法时标识这一个的文件名
  state,
  actions,
  mutations
}
