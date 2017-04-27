/**
 * Created by Administrator on 2017/3/28.
 */
$(function(){
    $('#file_upload_person').uploadify({
        'swf' : '/images/uploadify.swf',
        'uploader':'/fileupload',
        'folder':'upload',
        'buttonImage':'',
        'width':'160',
        'buttonText':'选择图片',
        'fileSizeLimit': 0, //不限制文件大小
        'successTimeout':36000, //超时时间10小时
        'sizeLimit' : 5024000000,
        'fileExt' : '*.jpg;*.JPG;*.jpeg;*.png;',
        'fileDesc' : '*.jpg;*.JPG;*.jpeg;*.png;等图片文件',
        //上传成功
        'onUploadSuccess' : function(file, data, response) {
            $("#person_png").attr("src",data);
        },//over
        //上传错误
        'onUploadError' : function(file, errorCode, errorMsg, errorString) {
        }//over
    });
    $('#file_upload_unit').uploadify({
        'swf' : '/images/uploadify.swf',
        'uploader':'/fileupload',
        'folder':'upload',
        'buttonImage':'',
        'width':'160',
        'buttonText':'选择图片',
        'fileSizeLimit': 0, //不限制文件大小
        'successTimeout':36000, //超时时间10小时
        'sizeLimit' : 5024000000,
        'fileExt' : '*.jpg;*.JPG;*.jpeg;*.png;',
        'fileDesc' : '*.jpg;*.JPG;*.jpeg;*.png;等图片文件',
        //上传成功
        'onUploadSuccess' : function(file, data, response) {
            $("#unit_png").attr("src",data);
        },//over
        //上传错误
        'onUploadError' : function(file, errorCode, errorMsg, errorString) {

        }//over
    });
});

