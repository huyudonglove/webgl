<template>
  <div>
    <el-input v-model="imgName" disabled style="width:330px;color:#8488D1;"></el-input>
    <el-upload
      ref="imgUpload"
      style="display:inline-block;"
      class="upload-demo"
      :action="'/api/file/upload'"
      :data="params"
      :headers="header"
      :show-file-list="false"
      :before-upload="beforeCallback"
      :on-progress="progress"
      :on-success="successCallback">  
      <el-button type="primary"  plain style="width:150px;">选择</el-button>
      </el-upload>
      <el-dialog :title="fileName+'上传中'" :visible.sync="isUpload" width="30%" :append-to-body="true" :close-on-click-modal="false" :show-close="false">
        <el-progress :text-inside="false" :stroke-width="26" :percentage="percent"></el-progress>
        <span>图片正在上传中，请不要关闭页面及浏览器</span>
        <span slot="footer" class="dialog-footer">
        </span>
      </el-dialog>
  </div>
</template>
<script>
import {checkImgIsRepeat} from '../../http/request'
export default {
  name:'upComponent',
  props:['imgType','length','width','height','bottom','direction'],
  data(){
    return{
      params:{
        type:'image',
        moduleCode:'locus_position_identifiedImage'
      },
      header:{
        Authorization:localStorage.getItem('locationMiddlegroundToken')
      },
      isUpload:false,
      percent:0,
      imgName:'',
      fileName:'',
      countHeight:0
    }
  },
  watch:{
    isUpload(val){
      if(!val){
        this.percent=0;
      }
    }
  },
  created(){
    window.onbeforeunload = ()=> {
      //窗口关闭前
      if(this.isUpload){
        return '图片正在上传，离开页面将会终止上传，你确定离开吗？';
      }
    };
  },
  methods:{
    judgeImgWidthHeight(judgeFile){
      return new Promise((resolve,reject)=>{
        var myReader = new FileReader();
        myReader.readAsDataURL(judgeFile)
        myReader.onload=(e)=>{
          var imgData = e.target.result;
          var myImage = new Image();
          myImage.src=imgData;
          myImage.onload = ()=>{
            let judgeRule;
            if(this.imgType==1){//单张
              this.countHeight = ((myImage.height/myImage.width)*this.width).toFixed(6);
              judgeRule = true;//单张不需要校验图片

            }
           if(this.imgType==2){//双面
              judgeRule = ((myImage.width/myImage.height)==((this.length*1000000)/(this.width*1000000)));
            }
            if(this.imgType==3){//正三棱柱
              judgeRule = ((myImage.width/myImage.height)==((this.bottom*1000000)/(this.height*1000000)));
            }
            if(this.imgType==4){//长方体
              if(this.direction=='front'||this.direction == 'back'){
                judgeRule = ((myImage.width/myImage.height)==((this.length*1000000)/(this.height*1000000)));
              }else{
                judgeRule = ((myImage.width/myImage.height)==((this.width*1000000)/(this.height*1000000)));
              }
            }
            if(!judgeRule){
              this.$message.error('图片宽高比例与设置不符合，请重新上传');
              reject();
            }else{
              this.isUpload = true;
              resolve();
            }
          }
        }
      })
    },
    beforeCallback(file){
      this.fileName = file.name;
      if(!(file.type=='image/jpg'||file.type=='image/jpeg'||file.type=='image/png')){
        this.$message.error(`上传图片格式必须为jpg或png!`);
        return false;
      }
      if (file.size / 1024 / 1024 > 2) {
        this.$message.error('上传图片大小不能超过2MB!');
        return false;
      }
      return this.judgeImgWidthHeight(file);
    },
    progress(event){
      console.log(event,'event')
      this.percent=parseInt(event.percent);
    },
    abortFile(){
      this.$refs.imgUpload.abort();
    },
    successCallback(response){
      if(response.code){
        this.isUpload = false;
        this.$alert(response.msg, '上传失败', {confirmButtonText: '确定'})
      }else{
        checkImgIsRepeat({
          "fileId":response.data.fileId,
          "databaseId":JSON.parse(JSON.parse(this.$route.query.msg).myData).identifiedImageDatabaseId}).then(res=>{
          this.isUpload = false;
          if(res.code){
            this.$message.error(res.msg);
          }else{
            if(res.data){
              this.$confirm('当前识别图库⾥有类似图片会影响识别效果，是否继续添加？','温馨提示',{
                center:true,
                confirmButtonText:'是',
                cancelButtonText:'否'
                }).then(u=>{
                this.imgName = response.data.originFileName.slice(0,30)
                // this.$alert('上传成功', {
                //   dangerouslyUseHTMLString: true
                // });
                this.$message.success('添加成功')
                this.$emit('changeImg',response.data.fileId,this.imgType,this.direction,this.countHeight)
              }).catch(r=>{
                console.log('取消')
              })
            }else{
              this.imgName = response.data.originFileName.slice(0,30)
              // this.$alert('上传成功', {
              //   dangerouslyUseHTMLString: true
              // });
              this.$message.success('添加成功')
              console.log(response.data.fileId,'response.data.fileId')
              this.$emit('changeImg',response.data.fileId,this.imgType,this.direction,this.countHeight)
            }
          }
        }).catch((err)=>{
          this.isUpload = false;
        })

      }
    },
    upClose(){
      // 弹窗警告
      this.$confirm('图片正在上传，离开页面将会终止上传，你确定离开吗？','警告',{
        center:true,
        confirmButtonText:'确定离开',
        cancelButtonText:'不'
        }).then(u=>{
        this.isUpload=false;
        this.abortFile();
      }).catch(r=>{
        console.log('取消')
      })
    }
  },
  created(){
    window.onbeforeunload = (e)=> {
      //窗口关闭前
      if(this.isUpload){
        return '图片正在上传，离开页面将会终止上传，你确定离开吗？';
      }
    };
  }
}
</script>
<style scoped>

</style>
