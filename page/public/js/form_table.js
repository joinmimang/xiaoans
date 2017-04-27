/**
 * Created by Administrator on 2017/3/28.
 */
$(function () {
//        tab页切换
    $('#myTab a:first').tab('show');
    $('#myTab a').click(function (e) {
        e.preventDefault();
        $(this).tab('show');
    });
//        表单验证规则
    $('#defaultForm').bootstrapValidator({
        message: 'This value is not valid',
        fields: {
            /*验证：规则*/
            username: {//验证input项：验证规则
                message: 'The username is not valid',
                validators: {
                    notEmpty: {//非空验证：提示消息
                        message: '单位场所不能为空'
                    },
//                            stringLength: {
//                                min: 6,
//                                max: 30,
//                                message: '用户名长度必须在6到30之间'
//                            },
//                           },
//                     regexp: {
//                         regexp: /^[a-zA-Z0-9_\.]+$/,
//                         message: '用户名由数字字母下划线和.组成'
//                     }
                }
            },
            name: {
                validators: {
                    notEmpty: {
                        message: '姓名不能为空'
                    },
                    regexp:{
                        regexp:/^[A-Za-z\u4e00-\u9fa5]*$/,
                        message:"姓名不能是数字或特殊字符"
                    }
                }
            },
            idcare: {
                message: "身份证号",
                validators: {
                    notEmpty: {
                        message: '身份证不能为空'
                    },
                    regexp:{
                        regexp:/^(\d{15}$|^\d{18}$|^\d{17}(\d|X|x))$/,
                        message:'请输入正确的身份证'
                    }
                }
            },
            phone: {
                message: '请输入手机号',
                validators: {
                    notEmpty: {
                        message: '手机号不能为空'
                    },
                    regexp: {
                        regexp: /^1[3|5|8]{1}[0-9]{9}$/,
                        message: '请输入正确的手机号码'
                    }
                }
            },
        }
    });
//        判断表单验证是否通过
    $('#send_btn').click(function () {
        $('#defaultForm').bootstrapValidator('validate');
        if (!$("#defaultForm").data("bootstrapValidator").isValid()) {//判断校检是否通过
            alert("验证不通过");
            return;
        } else {
            //提交动作
            alert("验证通过");
        }
    });
//        经营者删除与增加
    $("#parent-list").delegate(".remove_btn_run", "click", function(){
        $(this).parent().parent().parent("li").remove();
    });
    $(".add_btn_run").click(function () {
        var _html = "<li>" +
            "<div class='row form-group run_people'>" +
            "<div class='col-xs-1 text_center padding_left_none padding_right_none' style='width: 75px;'>" +
            "<label class='font_color'>姓名</label>" +
            "</div>" +
            "<div class='col-xs-1 padding_left_none'>" +
            "<input type='text' name='name' class='form-control' placeholder='姓名'></div>" +
            "<div class='col-xs-1 text_center padding_left_none padding_right_none' style='width: 75px;'>" +
            "<label class='font_color'>手机号</label>" +
            "</div>" +
            "<div class='col-xs-2 padding_left_none'>" +
            "<input type='text' name='phone' class='form-control' placeholder='手机号'></div>" +
            "<div class='col-xs-1 text_center padding_left_none padding_right_none' style='width: 75px;'>" +
            "<label class='font_color'>身份证</label>" +
            "</div>" +
            "<div class='col-xs-2 padding_left_none'>" +
            "<input type='text' name='idcare' class='form-control' placeholder='身份证号码'></div>" +
            "<div class='col-xs-2 text_center padding_left_none padding_right_none' style='width: 110px;'>" +
            "<label class='font_color'>与经营者关系</label>" +
            "</div>" +
            "<div class='col-xs-2 padding_left_none'>" +
            "<input type='text' class='form-control' placeholder='与经营者关系'></div>" +
            "<div class='remove'>" +
            "<button type='button' class='btn btn-primary remove_btn_run' style='margin-left: 54px;'>删除</button></div>" +
            "</div>" +
            "<hr>" +
            "</li>";
        $("#parent-list li:last-child").append(_html);
    });
});