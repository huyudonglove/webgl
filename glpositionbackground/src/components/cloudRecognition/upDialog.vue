<template>
  <div>
   
    <el-dialog title="更换识别图上传" :visible.sync="dialogVisible" @close="close" width="700px" center>
      <el-form  ref="formSize" :model="form"  label-width="140px" :rules="rules" >
        <el-form-item :label="formSize.type==1&&direction=='front'?'上传识别图：':'上传正面识别图：'"  v-if="direction=='front'" prop="fileIds" ref="fileIds">
          <singleUpComponent @changeImg="changeImg" :imgType="formSize.type" :width="formSize.identifiedImageWidth" :length="formSize.identifiedImageLength" :height="formSize.identifiedImageHeight" :bottom="formSize.identifiedImageBottomSideLength" :direction="'front'"></singleUpComponent>
        </el-form-item>
        <el-form-item v-if="formSize.type==3&&direction=='left'||formSize.type==4&&direction=='left'" label="上传左面识别图：" prop="fileIds" ref="fileIds">
          <singleUpComponent @changeImg="changeImg" :imgType="formSize.type"  :width="formSize.identifiedImageWidth" :length="formSize.identifiedImageLength" :height="formSize.identifiedImageHeight" :bottom="formSize.identifiedImageBottomSideLength" :direction="'left'"></singleUpComponent>
        </el-form-item>
        <el-form-item  v-if="formSize.type==3&&direction=='right'||formSize.type==4&&direction=='right'" label="上传右面识别图：" prop="fileIds" ref="fileIds">
          <singleUpComponent @changeImg="changeImg" :imgType="formSize.type" :width="formSize.identifiedImageWidth" :length="formSize.identifiedImageLength" :height="formSize.identifiedImageHeight" :bottom="formSize.identifiedImageBottomSideLength" :direction="'right'"></singleUpComponent>
        </el-form-item>
        <el-form-item v-if="formSize.type==2&&direction=='back'||formSize.type==4&&direction=='back'" label="上传背面识别图：" prop="fileIds" ref="fileIds">
          <singleUpComponent @changeImg="changeImg" :imgType="formSize.type" :width="formSize.identifiedImageWidth" :length="formSize.identifiedImageLength" :height="formSize.identifiedImageHeight" :bottom="formSize.identifiedImageBottomSideLength" :direction="'back'"></singleUpComponent>
        </el-form-item>
        <el-form-item label="">
          <div>请上传适合比例的.jpg 或 .png <span style="color:#409eff;">（最大2M）</span></div>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button  type="primary" @click="add('formSize')">保存</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import {identifiedImageUpdate} from '../../http/request'
import singleUpComponent from './singleUpComponent'
import {Base64} from 'js-base64'
export default {
  name:'upImgDialog',
  props:['formSize','direction'],
  inject:['reload','replace'],
  components:{
    singleUpComponent
  },
  data(){
    return{
      dialogVisible:true,
      frontImgUrl:'',
      leftImgUrl:'',
      rightImgUrl:'',
      backImgUrl:'',
      saveT:false,
      form:{
        fileIds:''
      },
      formSecond:{
        frontImgFileId:undefined,
        leftImgFileId:undefined,
        rightImgFileId:undefined,
        backImgFileId:undefined,
        // frontImgUrl:undefined,
        // leftImgUrl:undefined,
        // rightImgUrl:undefined,
        // backImgUrl:undefined,
      },
      rules: {
        fileIds: [
          {required: true, message: '请上传更改识别图'},
        ]
      }
    }
  },
  created(){
    this.saveT=false;
    this.form = Object.assign(this.form, this.formSize);
    // this.form={...this.formSize,fileIds:''}
  },
  watch:{
  },
  computed:{
    frontImgFileId(){
      return this.formSecond.frontImgFileId
    },
    leftImgFileId(){
      return this.formSecond.leftImgFileId
    },
    rightImgFileId(){
      return this.formSecond.rightImgFileId
    },
    backImgFileId(){
      return this.formSecond.backImgFileId
    },
  },
  methods:{
    
    close(){
      this.$emit("dialogClose");
    },
    changeImg(fileId,type,direction){
     
     this.formSecond[direction+'ImgFileId'] = fileId;
     this.form.fileIds=fileId
     this.$nextTick(() => {
        this.$refs.fileIds.clearValidate()
      })
    //  this.formSecond[direction+'Url'] = fileId;
    //  console.log(fileId,type,direction,'fileId,type,direction')
    },
    add(){
      this.$refs.formSize.validate((valid) => {
        if (valid) {         
          identifiedImageUpdate({...this.form,
            "url1":this.formSecond.frontImgFileId?this.formSecond.frontImgFileId:this.$route.query.frontImgFileId?this.$route.query.frontImgFileId:this.form.url1,
            "url2":(()=>{
               if(this.form.type==2){
               return this.formSecond.backImgFileId?this.formSecond.backImgFileId:this.$route.query.backImgFileId?this.$route.query.backImgFileId:this.form.url1
              }else if(this.form.type==3 ||this.form.type==4){
               return  this.formSecond.leftImgFileId?this.formSecond.leftImgFileId:this.$route.query.leftImgFileId?this.$route.query.leftImgFileId:this.form.url2
              }else{
               return  null
              }
            })(),
            "url3":this.formSecond.rightImgFileId?this.formSecond.rightImgFileId:this.$route.query.rightImgFileId?this.$route.query.rightImgFileId:this.form.url3,
            "url4":(()=>{
              if(this.form.type==4){
               return this.formSecond.backImgFileId?this.formSecond.backImgFileId:this.$route.query.backImgFileId?this.$route.query.backImgFileId:this.form.url4
              }else{
               return null
              }
            })()
            
            }).then(res=>{
            this.frontImgFileId? this.replace('frontImgFileId',this.frontImgFileId):undefined;
            this.leftImgFileId?this.replace('leftImgFileId',this.leftImgFileId):undefined;
            this.rightImgFileId?this.replace('rightImgFileId',this.rightImgFileId):undefined;
            this.backImgFileId?this.replace('backImgFileId',this.backImgFileId):undefined;
            this.reload();
          })
        } else {
          console.log('error submit!!');
          return false;
        }
      });
    }
  }
}
</script>

<style scoped>
</style>
