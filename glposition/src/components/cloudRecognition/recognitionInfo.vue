<template>
  <div>
    <div style="height:50px;border-bottom:1px solid #DFDCDC;">
      <el-page-header @back="$router.push({path:$route.query.databaseId==1?'/localRecognitionList':'/cloudRecognitionList',query:JSON.parse($route.query.oldQuery)})" content="识别图库信息" style="font-size:20px;font-weight:bold;color:#000;"></el-page-header>
    </div>
    <el-form ref="formData" :model="formData" label-width="130px">
      <el-form-item label="识别图库名称：">
        {{formData.name}}
      </el-form-item>
    </el-form>
    <el-form ref="formData" :inline="true" :model="formData" label-width="130px">
      <el-form-item label="识别图库类型：">
        <span v-if="formData.type==0">无限制</span>
      </el-form-item>
      <el-form-item label="识别图库大小：" style="margin-left:296px;">
        <span v-if="formData.size==0">无限制</span>
      </el-form-item>
    </el-form>
    <el-form ref="formData" :inline="true" :model="formData" label-width="130px">
      <el-form-item label="创建时间：">
        {{formData.createTime}}
      </el-form-item>
      <el-form-item label="修改时间：" style="margin-left:200px;">
        {{formData.updateTime}}
      </el-form-item>
    </el-form>
    <el-form ref="formData" :inline="true" :model="formData" label-width="130px">
      <el-form-item label="识别图库密钥：">
        <span ref="imageDatabaseId">{{formData.secret}}</span> <el-button type="text" @click="copy('imageDatabaseId')">复制密钥</el-button>
      </el-form-item>
    </el-form>
    <el-row class="tac" style="border-bottom:1px solid #eeeeee; padding:15px 0;">
      <el-input v-model="inputX" style="width: 250px" suffix-icon="el-icon-search" maxlength="50" placeholder="请输入识别图名称/ID"></el-input>
      <el-button :disabled="!imgIdList.length" v-if="$route.query.databaseId==1" style="float:right;margin-right:15px" type="success" @click="downloadImg(null)">下载识别图</el-button>
      <el-button style="float:right;margin-right:15px" type="primary" @click="isShowUp=true;">上传识别图</el-button>
      <!-- <el-button style="float:right;margin-right:15px" type="primary" @click="showSomeUp=true;">上传空间多图</el-button> -->
    </el-row>
    <el-table ref="imageRef" :data="imageTable" style="width: 100%;margin-bottom:32px;" class="mt15 mb15" :max-height="tableHeight" @selection-change="handleSelectionChange" row-key="id" :header-cell-style="headerCellStyle" :cell-style="cellStyle">
      <el-table-column type="selection" v-if="$route.query.databaseId==1" width="50" :reserve-selection="true" :selectable="(row)=>row.status ==1 &&row.type!==5||row.status ==11 &&row.type==5"></el-table-column>
      <el-table-column prop="identifiedImageId" label="ID" align="center"></el-table-column>
      <el-table-column prop="name" label="识别图名称" align="center"></el-table-column>
      <el-table-column prop="type" label="类型" width="100" align="center">
        <template slot-scope="scope">
          <span v-if="scope.row.type==1">单张图片</span>
          <span v-if="scope.row.type==2">双面图片</span>
          <span v-if="scope.row.type==3">正三棱柱</span>
          <span v-if="scope.row.type==4">长方体</span>
           <span v-if="scope.row.type==5">空间多图</span>
        </template>
      </el-table-column>
      <el-table-column label="预览" width="280" align="center">
        <template slot-scope="scope">
          <img style="width:50px;" v-for="(decodeUrl,i) in scope.row.decodeUrlList" :key="i" v-lazy="`/static/${decodeUrl}`" >
        </template>
      </el-table-column>
      <el-table-column prop="status" label="状态" width="160" align="center">
        <template slot-scope="scope">
          <span v-if="scope.row.type!=5&&scope.row.status==1">正常</span>
          <span v-if="scope.row.type!=5&&scope.row.status==2">异常</span>
          <span v-if="scope.row.type!=5&&scope.row.status===0">待生效</span>
          <span v-if="scope.row.type!=5&&scope.row.status==3">更新</span>
          <span v-if="scope.row.type!=5&&scope.row.status==4">已停止</span>
          <span v-if="scope.row.type==5&&scope.row.status!=11">{{statusList.find(v=>v.code==scope.row.status)?statusList.find(v=>v.code==scope.row.status).msg:''}}</span>
          <span v-if="scope.row.type==5&&scope.row.status==11">正常</span>
        </template>
      </el-table-column>
      <el-table-column prop="createTime" label="创建时间" width="160" align="center"></el-table-column>
      <el-table-column prop="updateTime" label="修改时间" width="160" align="center"></el-table-column>
      <el-table-column label="操作" width="220" align="center">
        <template slot-scope="scope">
          <el-button type="primary" size="mini" :disabled="!(scope.row.status ==1 &&scope.row.type!==5||scope.row.status ==11 &&scope.row.type==5)" v-if="$route.query.databaseId==1" @click="downloadImg(scope.row.identifiedImageId)">下载</el-button>
          <el-button type="primary" size="mini" @click="scope.row.type==5?$router.push({path:'/recognitionSomeMsg',query:{msg:JSON.stringify({...$route.query}),row:JSON.stringify(scope.row)}}):$router.push({path:'/recognitionMsg',query:{msg:JSON.stringify({...$route.query}),row:JSON.stringify(scope.row)}})">管理</el-button>
          <el-button type="danger" size="mini" @click="del(scope.row.id,scope.row.name)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    <div>
      <pagination v-if="showPagination"></pagination>
    </div>
    <div v-if="isShowUp">
      <upImgDialog @upImgDialogClose="upImgDialogClose"></upImgDialog>
    </div>
    
      <upSomeDialog @dialogClose="dialogClose"  :showSomeUp="showSomeUp" v-if="showSomeUp" @showImg="showImg"></upSomeDialog>
      <el-dialog title="上传成功" :visible.sync="upEnd" width="30%" @close="upEnd = false;reload();" style="text-align: center" :show-close="false" :close-on-click-modal='false' >
      <img src="../../assets/ok.png" alt="" width="100" height="100">
      <p>
        <span>上传成功，开始进行转换，你可以在<router-link :to="'/replaceList?type=3'">转换列表</router-link>或者识别图库列表看到你的空间多图</span>
      </p>
     <div style="text-align:right">
        <el-button type="primary" @click="upEnd = false;reload();" class="btnW">确 定</el-button>
     </div>
    </el-dialog>
  </div>
</template>
<script>
import {mapState} from 'vuex';
import {getImageList,downloadIdentifiedImage,getStatusList,identifiedImageDelete} from '../../http/request'
import pagination from '../../share/pagination'
import upImgDialog from './upImgDialog'
import upSomeDialog from './upSomeDialog'
import VueCookies from 'vue-cookies'
import { Base64 } from 'js-base64'
export default {
  name:'recognitionInfo',
  inject:['replace','reload','cellStyle','headerCellStyle'],
  components:{
    pagination,
    upImgDialog,
    upSomeDialog
  },
  data(){
    return{
      inputX:'',
      formData:{
        name:'',
        type:0,
        size:0,
        createTime:'',
        updateTime:'',
        secret:''
      },
      upEnd:false,
      showSomeUp:false,
      imgIdList:[],
      imageTable:[],
      showPagination:false,
      isShowUp:false,
      statusList:[],
      tableHeight:200
    }
  },
  computed:{
    ...mapState('pagination',{page:'clickPage',limit:'limitPage'}),
  },
  watch:{
    page(){
      this.replace('page',this.page);
    },
    limit(){
      this.replace('limit',this.limit);
    },
    inputX(){
      this.$store.commit('pagination/setClickPage',1);//重置第1页
      this.replace('inputX',this.inputX);
    },
    $route(){//判断路由query变化执行请求
      if(this.$route.name=='recognitionInfo'){
        this.listData();
      }
    }
  },
  methods:{
    copy(ref){
      window.getSelection().removeAllRanges();
      var r = document.createRange(); 
      r.selectNode(this.$refs[ref]); 
      window.getSelection().addRange(r); 
      document.execCommand("Copy");
      window.getSelection().removeAllRanges();
      this.$message({
        message: '复制成功',
        duration: 500,
        type: 'success'
      })
    },
    upImgDialogClose(){
      this.isShowUp = false;
    },
    handleSelectionChange(val) {
      this.imgIdList=val.map(v=>v.identifiedImageId)
    },
    downloadImg(identifiedImageId){
        let aTag = document.createElement('a');
        // aTag.download = '识别图包.zip';
        let ids=identifiedImageId?identifiedImageId+'':this.imgIdList.join(',');
        aTag.href = `/api/location/middleground/IdentifiedImage/Database/download?databaseID=${this.formData.secret}&ids=${ids}`;
        aTag.click();
    },
    getState(){
      getStatusList({type:3}).then(res=>{
        this.statusList=res.data;
        var arr = res.data.map(v=>v.msg);
        var newArr = Array.from(new Set(arr));
        if(arr.length>newArr.length){
          this.statusList.splice(arr.indexOf('已停止'),1);
        }      
      })
    },
    listData(){
      getImageList({"identifiedImageDatabaseId":this.formData.secret,...this.$route.query}).then(res=>{
        this.imageTable=res.data.items.map(v=>{
          if(v.type==5){
            v.decodeUrlList=v.fileList?v.fileList.map(u=>{
              return Base64.decode(u.fileId)
            }):[]
          }else{
            v.decodeUrlList = []; 
            if(v.type==1||v.type==2){
              v.url1?v.decodeUrlList.push(Base64.decode(v.url1)):null; 
              v.url2?v.decodeUrlList.push(Base64.decode(v.url2)):null;
            }else if(v.type==3){
              v.url2?v.decodeUrlList.push(Base64.decode(v.url2)):null;
              v.url1?v.decodeUrlList.push(Base64.decode(v.url1)):null; 
              v.url3?v.decodeUrlList.push(Base64.decode(v.url3)):null;
            }else if(v.type==4){
              v.url4?v.decodeUrlList.push(Base64.decode(v.url4)):null;
              v.url2?v.decodeUrlList.push(Base64.decode(v.url2)):null;
              v.url1?v.decodeUrlList.push(Base64.decode(v.url1)):null; 
              v.url3?v.decodeUrlList.push(Base64.decode(v.url3)):null;
            }
          }
          return v
        });
        this.$store.commit('pagination/setTotal', res.data.total);
      })
    },
    dialogClose(){
      this.reload()
      // this.showSomeUp = false;
    },
    showImg(){
      this.showSomeUp=false
      this.upEnd=true
      this.listData();
    },
    del(id,name){
      identifiedImageDelete({id,name}).then(res=>{
        this.listData();
      })
    },
  },
  created(){
    this.getState();
    let paramsData = JSON.parse(this.$route.query.myData);
    this.formData.name = paramsData.name;
    this.formData.type = paramsData.type;
    this.formData.size = paramsData.size;
    this.formData.createTime = paramsData.createTime;
    this.formData.updateTime = paramsData.updateTime;
    this.formData.secret = paramsData.identifiedImageDatabaseId; 
    this.listData();
    let pageRecord = this.$route.query.page||1;//记录上一次页码操作
    let limitRecord = this.$route.query.limit||20;//记录上一次limit操作
    this.inputX = this.$route.query.inputX||'';
    this.$nextTick(()=>{
      this.$store.commit('pagination/setClickPage',pageRecord);
      this.$store.commit('pagination/setLimitPage',limitRecord);
      this.showPagination = true;//加载分页组件
    })
  },
  updated(){
    if(this.$route.name=='recognitionInfo'){
      this.$nextTick(()=>{
        this.tableHeight = window.innerHeight - this.$refs.imageRef.$el.offsetTop - 130;
      })
    }
  },
}
</script>
<style scoped>

</style>