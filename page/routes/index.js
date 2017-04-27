var express = require('express');
var http = require('http');
var querystring = require('querystring');
var session = require('express-session'); //如果要使用session，需要单独包含这个模块
var router = express.Router();
var util = require('util');
var fs = require('fs');
var path = require('path');
var moment = require('moment');
var formidable = require('formidable');//上传文件
// 配置option
var o_method = "GET";
var o_host = "58.60.185.51";
var o_port ="5755";
var o_path = "/xfyhpc-ty-web";
router.get('/exit_btn', function(req, res, next) {
    session.cookie = "";
    res.render('login');
});
// 初始页面
router.get('/', function(req, res, next) {
    res.render('login');
});
router.get("/laydata",function (req, res, next) {
    res.render("laydata");
});
//文件上传路径ok
router.post('/fileupload', function (req, res, next) {
    var form =new formidable.IncomingForm();
    form.keepExtensions =true;//keep .jpg/.png
    form.uploadDir ="public/upload/";
    form.defer=true;
    form.parse(req, function (err, fields, files) {
        var boundaryKey = Math.random().toString(16); //随机数，目的是防止上传文件中出现分隔符导致服务器无法正确识别文件起始位置
        var options = {
            host: o_host,
            port: o_port,
            path: o_path+'/upload.do?saveNoPress',
            method: 'POST'
        };
        var reqHttps = http.request(options, function(resHttps) {
            resHttps.on('data', function(body) {
                //console.log("body:"+body);
                body = JSON.parse(body);
                if(body.msg==0){
                    res.send(body.list[0]);
                }else {
                    res.send("<script>alert('添加失败');history.go(-1);</script>");
                }
            });
        });
        var payload = '--' + boundaryKey + '\r\n'
            + 'Content-Type: image/jpeg\r\n'
            + 'Content-Disposition: form-data; name="media"; filename="'+files.Filedata.path+'"\r\n'
            + 'Content-Transfer-Encoding: binary\r\n\r\n';
        //console.log(payload.length);
        var enddata  = '\r\n--' + boundaryKey + '--';
        //console.log('enddata:'+enddata.length);
        reqHttps.setHeader('Content-Type', 'multipart/form-data; boundary='+boundaryKey+'');
        reqHttps.setHeader('Content-Length', Buffer.byteLength(payload)+Buffer.byteLength(enddata)+files.Filedata.size);
        reqHttps.write(payload);
        var fileStream = fs.createReadStream(files.Filedata.path, { bufferSize: 4 * 1024 });
        fileStream.pipe(reqHttps, {end: false});
        fileStream.on('end', function(data) {
            reqHttps.end(enddata);
        });
        reqHttps.on('error', function(e) {
            console.error("error:"+e);
        });
    });
});
// 登录页面
router.get('/login', function (req, res, next) {
    res.render("login", {title: "登录"});
});
// 登录验证
router.post('/checklogin', function (req, res, next) {
    var name = req.body.username;
    var pass = req.body.password;
    //输入验证
    if (!name || name == "") {
        res.send("<script>alert('用户名不能为空');history.go(-1);</script>");
        return;
    }
    if (!pass || pass == "") {
        res.send("<script>alert('密码不能为空');history.go(-1);</script>");
        return;
    }
    var body = '';
    http.get("http://58.60.185.51:5755/xfyhpc-ty-web/system.do?loginCheck&code=" + name + "&password=" + pass+"&json", function (result) {
        result.setEncoding('utf8');
        result.on('data', function (d) {
            body += d;
        }).on('end', function (response) {
            body = JSON.parse(body);
            var status = body.msg;
            if (status == 0) {
                var code = body.infoDto.code;
                var head_pic = body.infoDto.head_pic;
                var login_xzqy = body.infoDto.xzqy;
                res.redirect('/list_data');
            } else {
                res.send("<script>alert('账号密码输入错误');history.go(-1);</script>");
            }
            // //设置cookie在session中
            session.cookie = result.headers["set-cookie"];
            session.xzqy = login_xzqy;
            session.code = code;
            session.head_pic = head_pic;
        });
    }).on('error', function (e) {
        console.log("Got error: " + e.message);
    });
});
// 建筑单位列表ok
router.get('/list_data', function (req, res, next) {
    var body = "";
    var currentPage = req.query.currentPage;
    var unitname = req.query.unitname;
    if(unitname==null || typeof(unitname)==undefined){
        unitname="";
    }
    var unitname = encodeURIComponent(unitname);
    var code = session.code;
    var head_pic = session.head_pic;
    //console.info(currentPage);
    if(currentPage==null || currentPage==0){
        currentPage=1;
    }
    var local_session = session.cookie;
    if (!local_session || local_session == "") {
        res.render("login");
    } else {
        var option = {
            method: o_method,
            host: o_host,
            port: o_port,
            path: o_path+"/unit/list.do?currentPage=" + currentPage + "&pageSize=10&unitName="+unitname,//目标页面
            headers: {
                "cookie": local_session
            }
        };
        var request = http.request(option);
        request.end();
        request.on("response", function (response) {
            response.on("data", function (data) {
                body += data;
            });
            response.on("end", function () {
                var list = JSON.parse(body).data.list;
                var pageSize = JSON.parse(body).data.pageSize;
                var totalPage = JSON.parse(body).data.totalPage;
                var totalRows = JSON.parse(body).data.totalRows;
                var currentPage = JSON.parse(body).data.currentPage;
                res.render('list_data', {title: '消安科技',unit_name:unitname,code:code,head_pic:head_pic, list: list,pageSize:pageSize,totalPage:totalPage,totalRows:totalRows,currentPage:currentPage});
            })
        })
    }
});
// 建筑单位详情ok
router.get('/form_table', function (req, res, next) {
    var body = '';
    //这是需要提交的数据
    var id = req.query.unitId;
    var code = session.code;
    var head_pic = session.head_pic;
    var local_session = session.cookie;
    if (!local_session || local_session == "") {
        res.render("login");
    } else {
        var option = {
            method: o_method,
            host: o_host,
            port: o_port,
            path: o_path+"/unit/detail.do?unitId=" + id,//目标页面
            headers: {
                "cookie": local_session
            }
        };
        var request = http.request(option);
        request.end();
        request.on("response", function (response) {
            response.on("data", function (data) {
                body += data;
            });
            response.on("end", function () {
                var lists = JSON.parse(body).data;
                res.render('form_table', {title: '消安科技',code:code,head_pic:head_pic, list: lists});
            });
        });
    }
});
// 编辑建筑单位ok
router.post("/edit_form_table", function (req, res, next) {
    var body = '';
    var local_session = session.cookie;
    var params = req.body;
    var str = {
        unitId:  params.unitId,
        unitName:params.unitName,
        unitImage: params.unitImage,
        unitAddress:params.unitAddress,
        unitType:params.unitType,
        houseNumber:params.houseNumber,
        unitNature:params.unitNature,
        businessScope:params.businessScope,
        enterpriseNature:params.enterpriseNature,
        xzqy:params.xzqy,
        lon:params.lon,
        lat:params.lat,
        unitDetail:{
            licensePhoto:params.licensePhoto,
            businessLicenseStrn:params.businessLicenseStrn,
            licenseExpiryDate:params.licenseExpiryDate,
            registeredCapital:params.registeredCapital,
            totalAssets:params.totalAssets,
            chineseNameAndShares:params.chineseNameAndShares,
            outsideNameAndShares:params.outsideNameAndShares,
            placeArea:params.placeArea,
            buildingHeight:params.buildingHeight,
            buildingLayer:params.buildingLayer,
            venueLeasingExpiryDate:params.venueLeasingExpiryDate,
            openingTime:params.openingTime,
            buildingDiaxmj:params.buildingDiaxmj,
            overallFloorage:params.overallFloorage,
            ownerName:params.ownerName,
            ownerIdCard:params.ownerIdCard,
            ownerTelNumber:params.ownerTelNumber,
            fsmPersonCharge:params.fsmPersonCharge,
            fsmPersonChargeIdCard:params.fsmPersonChargeIdCard,
            fsmPersonChargeTelNumber:params.fsmPersonChargeTelNumber,
            csmPersonCharge:params.csmPersonCharge,
            csmPersonChargeIdCard:params.csmPersonChargeIdCard,
            csmPersonChargeTelNumber:params.csmPersonChargeTelNumber,
            fmPersonCharge:params.fmPersonCharge,
            fmPersonChargeIdCard:params.fmPersonChargeIdCard,
            fmPersonChargeTelNumber:params.fmPersonChargeTelNumber,
            pcName:params.pcName,
            pcPersonCharge:params.pcPersonCharge,
            pcPersonChargeIdCard:params.pcPersonChargeIdCard,
            pcPersonChargeTelNumber:params.pcPersonChargeTelNumber,

            operatorName:params.operatorName[0],
            operatorIdCard:params.operatorIdCard[0],
            operatorTelNumber:params.operatorTelNumber[0],
        },
        unitOperatorList:[{
            operatorName:params.operatorName[0],
            operatorIdCard:params.operatorIdCard[0],
            operatorRelation:params.operatorRelation[0],
            operatorTelNumber:params.operatorTelNumber[0],
        }]
    };
    var str_data = JSON.stringify(str);
    if (!local_session || local_session == "") {
        res.render("login");
    } else {
        if (!req.body) return res.sendStatus(400);
        var option = {
            method: "put",
            host: o_host,
            port: o_port,
            path: o_path+"/unit/edit.do",//目标页面
            headers: {
                "cookie": local_session,
                "Content-Type": 'application/json'
            }
        };
        var request = http.request(option);
        request.write(str_data);
        request.end();
        request.on("response", function (response) {
            response.on("data", function (data) {
                body += data;
            });
            response.on("end", function () {
                body = JSON.parse(body);
                console.info(body);
                if(body.msg == 0){
                    res.send("<script>alert('编辑成功');history.go(-1);</script>");
                }else {
                    res.send("<script>alert('编辑失败');history.go(-1);</script>");
                }
            })
        })
    }
});
// 新增建筑单位ok
router.get("/add_unit", function (req, res, next) {
    var code = session.code;
    var head_pic = session.head_pic;
    res.render("add_unit",{code:code,head_pic:head_pic});
    router.post("/add_form_table", function (req, res, next) {
        var body = '';
        var local_session = session.cookie;
        var params = req.body;
        var add_xzqy = session.xzqy;
        var add_str = {
            unitName:params.unitName,
            unitImage: params.unitImage,
            unitAddress:params.unitAddress,
            unitType:params.unitType,
            houseNumber:params.houseNumber,
            unitNature:params.unitNature,
            businessScope:params.businessScope,
            enterpriseNature:params.enterpriseNature,
            xzqy:add_xzqy,
            lon:params.lon,
            lat:params.lat,
            unitDetail:{
                licensePhoto:params.licensePhoto,
                businessLicenseStrn:params.businessLicenseStrn,
                licenseExpiryDate:params.licenseExpiryDate,
                registeredCapital:params.registeredCapital,
                totalAssets:params.totalAssets,
                chineseNameAndShares:params.chineseNameAndShares,
                outsideNameAndShares:params.outsideNameAndShares,
                placeArea:params.placeArea,
                buildingHeight:params.buildingHeight,
                buildingLayer:params.buildingLayer,
                venueLeasingExpiryDate:params.venueLeasingExpiryDate,
                openingTime:params.openingTime,
                buildingDiaxmj:params.buildingDiaxmj,
                overallFloorage:params.overallFloorage,
                ownerName:params.ownerName,
                ownerIdCard:params.ownerIdCard,
                ownerTelNumber:params.ownerTelNumber,
                fsmPersonCharge:params.fsmPersonCharge,
                fsmPersonChargeIdCard:params.fsmPersonChargeIdCard,
                fsmPersonChargeTelNumber:params.fsmPersonChargeTelNumber,
                csmPersonCharge:params.csmPersonCharge,
                csmPersonChargeIdCard:params.csmPersonChargeIdCard,
                csmPersonChargeTelNumber:params.csmPersonChargeTelNumber,
                fmPersonCharge:params.fmPersonCharge,
                fmPersonChargeIdCard:params.fmPersonChargeIdCard,
                fmPersonChargeTelNumber:params.fmPersonChargeTelNumber,
                pcName:params.pcName,
                pcPersonCharge:params.pcPersonCharge,
                pcPersonChargeIdCard:params.pcPersonChargeIdCard,
                pcPersonChargeTelNumber:params.pcPersonChargeTelNumber,

                operatorName:params.operatorName[0],
                operatorIdCard:params.operatorIdCard[0],
                operatorTelNumber:params.operatorTelNumber[0],
            },
            unitOperatorList:[{
                operatorName:params.operatorName[0],
                operatorIdCard:params.operatorIdCard[0],
                operatorRelation:params.operatorRelation[0],
                operatorTelNumber:params.operatorTelNumber[0],
            }]
        };
        var add_data = JSON.stringify(add_str);
        console.info(add_data);
        if (!local_session || local_session == "") {
            res.render("login");
        } else {
            var option = {
                method: "post",
                host: o_host,
                port: o_port,
                path: o_path+"/unit/add.do",//目标页面
                headers: {
                    "cookie": local_session,
                    "Content-Type": 'application/json'
                }
            };
            var request = http.request(option);
            request.write(add_data);
            request.end();
            request.on("response",function(response){
                response.on('data',function(d){
                    body += d;
                }).on('end', function(){
                    body = JSON.parse(body);
                   if(body.msg==0){
                       res.send("<script>alert('添加成功');history.go(-1);</script>");
                   }else {
                       res.send("<script>alert('添加失败');history.go(-1);</script>");
                   }
                });
            });
        }
    });
});
//问题清单ok
router.get('/problem_list', function (req, res, next) {
    var body = '';
    //这是需要提交的数据
    var id = req.query.unitId;
    var code = session.code;
    var head_pic = session.head_pic;
    var currentPage =1;
    var pageSize = 10;
    var local_session = session.cookie;
    if (!local_session || local_session == "") {
        res.render("login");
    } else {
        var option = {
            method: o_method,
            host: o_host,
            port: o_port,
            path: o_path+"/hidden/issueList.do?currentPage=" + currentPage+"&pageSize="+pageSize+"&unitId="+id,//目标页面
            headers: {
                "cookie": local_session
            }
        };
        var request = http.request(option);
        request.end();
        request.on("response", function (response) {
            response.on("data", function (data) {
                body += data;
            });
            response.on("end", function () {
                body = JSON.parse(body);
                var lists = body.data.list;
                var len = lists.length,
                    i = 0;
                for (; i < len; i++) {
                    var a = body.data.list[i].actionDate.time;
                    var time = new Date(a);
                }
                if(len!=0){
                    res.render('problem_list',{list:lists,code:code,head_pic:head_pic,time:time,len:len});
                }else{
                    res.send("<script>alert('没有数据');history.go(-1);</script>");
                }

            });
        });
    }
});
//整改清单ok
router.get('/rectification_list', function (req, res, next) {
    var body = '';
    //这是需要提交的数据
    var id = req.query.hiddenId;
    var local_session = session.cookie;
    var code = session.code;
    var head_pic = session.head_pic;
    if (!local_session || local_session == "") {
        res.render("login");
    } else {
        var option = {
            method: o_method,
            host: o_host,
            port: o_port,
            path: o_path+"/hidden/rectifyList.do?hiddenId="+id,//目标页面
            headers: {
                "cookie": local_session
            }
        };
        var request = http.request(option);
        request.end();
        request.on("response", function (response) {
            response.on("data", function (data) {
                body += data;
            });
            response.on("end", function () {
                body = JSON.parse(body);
                var d = body.data[0].actionDate.time;
                var time = new Date(d);
                var data = body.data[0];
                res.render('rectification_list',{data:data,code:code,head_pic:head_pic,time:time});
            });
        });
    }
});
// 责任清单ok
router.get('/duty_list', function (req, res, next) {
    var body = '';
    //这是需要提交的数据
    var hiddenId = req.query.hiddenId;
    var hiddenMeasuresId = req.query.hiddenMeasuresId;
    var local_session = session.cookie;
    var code = session.code;
    var head_pic = session.head_pic;
    if (!local_session || local_session == "") {
        res.render("login");
    } else {
        var option = {
            method: o_method,
            host: o_host,
            port: o_port,
            path: o_path+"/hidden/dutyList.do?hiddenId=" + hiddenId+"&hiddenMeasuresId="+hiddenMeasuresId,//目标页面
            headers: {
                "cookie": local_session
            }
        };
        var request = http.request(option);
        request.end();
        request.on("response", function (response) {
            response.on("data", function (data) {
                body += data;
            });
            response.on("end", function () {
                // console.info(body);
                body = JSON.parse(body);
                var data = body.data;
                var recordList_0 = data.recordList[0];
                var d = data.recordList[0].date.time
                var time_0 = new Date(d);//问题时间
                var recordList_1 = data.recordList[1];
                var t = data.recordList[1].date.time;
                var time_1 = new Date(t);//整改时间
                var recordList_2 = data.recordList[2];
                var two = data.recordList[2].date.time;
                var time_2 = new Date(two);//责任时间
                var hiddenDutyList = data.hiddenDutyList[0];
                // console.info(typeof (hiddenDutyList));
                res.render('duty_list',{data:data,code:code,head_pic:head_pic,hiddenDutyList:hiddenDutyList,recordList_0:recordList_0,time_0:time_0,recordList_1:recordList_1,time_1:time_1,recordList_2:recordList_2,time_2:time_2});
            });
        });
    }
});
// 导出功能ok
router.get('/download', function (req, res, next) {
    var body = '';
    //这是需要提交的数据
    var id = req.query.unitid;
    var local_session = session.cookie;
    if (!local_session || local_session == "") {
        res.render("login");
    } else {
        var option = {
            method: o_method,
            host: o_host,
            port: o_port,
            //http://58.60.185.51:5755/xfyhpc-ty-web/hidden/issueList.do?currentPage=1 &pageSize=10&unitId=e0540ae246084ddb8305164ebe57b8a4
            path: o_path+"/hidden/download.do?unitid="+id,//目标页面
            headers: {
                "cookie": local_session
            }
        };
        var request = http.request(option);
        request.end();
        request.on("response", function (response) {
            response.on("data", function (data) {
                body += data;
            });
            response.on("end", function () {
                body = JSON.parse(body);
                var URL = body.url;
                // console.info(body);
                // console.info(URL);
                res.write(URL);
                res.end();
            });
        });
    }
});
// 搜索单位ok
router.post('/seach_unit', function (req, res, next) {
    var body = "";
    var currentPage = req.query.currentPage;
    var code = session.code;
    var head_pic = session.head_pic;
    if(currentPage==null || currentPage==0){
        currentPage=1;
    }
    var unit_name=req.body.seach_input;
    if(unit_name==null){
        unit_name="";
    }
    var seach_input = encodeURIComponent(unit_name);
    // console.info(seach_input);
    var local_session = session.cookie;
    if (!local_session || local_session == "") {
        res.render("login");
    } else {
        var option = {
            method: o_method,
            host: o_host,
            port: o_port,
            path: o_path+"/unit/list.do?currentPage="+currentPage+"&pageSize=10&unitName="+seach_input,//目标页面
            headers: {
                "cookie": local_session
            }
        };
        var request = http.request(option);
        request.end();
        request.on("response", function (response) {
            response.on("data", function (data) {
                body += data;
            });
            response.on("end", function () {
                 // console.info(body);
                 var list = JSON.parse(body).data.list;
                 var pageSize = JSON.parse(body).data.pageSize;
                 var totalPage = JSON.parse(body).data.totalPage;
                 var totalRows = JSON.parse(body).data.totalRows;
                 var currentPage = JSON.parse(body).data.currentPage;
                 res.render('list_data', {title: '消安科技', unit_name:unit_name,code:code,head_pic:head_pic,list: list,pageSize:pageSize,totalPage:totalPage,totalRows:totalRows,currentPage:currentPage});
            })
        })
    }
});
// 选择时间区间进行导出
router.post('/get_data', function (req, res, next) {
    var body = '';
    //这是需要提交的数据
    var starttime = req.body.start;
    var endtime = req.body.end;
    //var unitId = req.body.unitId;
    var unitId = "6a1b0a8e157a49e8911f3baca0ee7fb8";
    var code = session.code;
    var head_pic = session.head_pic;
    var currentPage = 1;
    var pageSize =  10;
    console.info(starttime+"   "+ endtime+"  "+unitId);
    var local_session = session.cookie;
    if (!local_session || local_session == "") {
        res.render("login");
    } else {
        var option = {
            method: o_method,
            host: "192.168.1.26",
            port: "8888",
            path: o_path+"/hidden/seachCheckList.do?unitid="+unitId+"&currentPage="+currentPage+"&pageSize="+pageSize+"&starttime="+starttime+"&endtime="+endtime,//目标页面
            headers: {
                "cookie": local_session
            }
        };
        var request = http.request(option);
        request.end();
        request.on("response", function (response) {
            response.on("data", function (data) {
                body += data;
            });
            response.on("end", function () {
                body = JSON.parse(body).tyCheckDtos;
                var currentPage = body.currentPage;
                var totalPage = body.totalPage;
                var lists = body.list;
                var hiddenList = body.list.hiddenList;
                var len = lists.length,
                    i = 0;
                for (; i < len; i++) {
                    var a = body.list[i].checkTime.time;
                    var time = new Date(a);
                }
                res.render('export_list', {title: '消安科技',list:lists,currentPage:currentPage,totalPage:totalPage,hiddenList:hiddenList,time:time});
            });
        });
    }
});
// 导出分页
router.get('/get_data_page', function (req, res, next) {
    var body = '';
    //这是需要提交的数据
    // var starttime = req.body.start;
    // var endtime = req.body.end;
    //var unitId = req.body.unitId;
    var starttime = "2017-01-01";
    var endtime = "2017-12-01";
    var unitId = "6a1b0a8e157a49e8911f3baca0ee7fb8";
    var currentPage = req.query.currentPage;
    var pageSize =  req.query.pageSize;
    var local_session = session.cookie;
    if (!local_session || local_session == "") {
        res.render("login");
    } else {
        var option = {
            method: o_method,
            host: "192.168.1.26",
            port: "8888",
            path: o_path+"/hidden/seachCheckList.do?unitid="+unitId+"&currentPage="+currentPage+"&pageSize="+pageSize+"&starttime="+starttime+"&endtime="+endtime,//目标页面
            headers: {
                "cookie": local_session
            }
        };
        var request = http.request(option);
        request.end();
        request.on("response", function (response) {
            response.on("data", function (data) {
                body += data;
            });
            response.on("end", function () {
                body = JSON.parse(body).tyCheckDtos;
                // console.info(body);
                var currentPage = body.currentPage;
                var totalPage = body.totalPage;
                var lists = body.list;
                var hiddenList = body.list.hiddenList;
                var len = lists.length,
                    i = 0;
                for (; i < len; i++) {
                    var a = body.list[i].checkTime.time;
                    var time = new Date(a);
                    // console.info("第一次"+time);
                }
                //console.info(body);
                // window.open("export_list");
                res.render('export_list', {title: '消安科技',list:lists,currentPage:currentPage,totalPage:totalPage,hiddenList:hiddenList,time:time});
                // res.redirect('export_list', {title: '消安科技',code:code,head_pic:head_pic});
            });
        });
    }
});
// 条件筛选导出
router.post('/dowmload_data', function (req, res, next) {
    var body = '';
    //这是需要提交的数据
    var unitid = "6a1b0a8e157a49e8911f3baca0ee7fb8";
    var starttime = req.body.starttime;
    var endtime = req.body.endtime;
    var currentPage = "1";
    var pageSize = "10";
    var tycheckinclusions = req.body.tycheckinclusions;
    var tyhiddeninclusions = req.body.tyhiddeninclusions;
    var local_session = session.cookie;
    if (!local_session || local_session == "") {
        res.render("login");
    } else {
        var option = {
            method: "post",
            host: "192.168.1.26",
            port: "8888",
            path: o_path+"/hidden/download.do",//目标页面
            headers: {
                "cookie": local_session,
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        };
        var request = http.request(option);
        var post_data = querystring.stringify({
            unitid:unitid,
            starttime:starttime,
            endtime:endtime,
            tycheckinclusions:tycheckinclusions,
            tyhiddeninclusions:tyhiddeninclusions,
            currentPage:currentPage,
            pageSize:pageSize
        });
        request.write(post_data);
        request.end();
        request.on("response", function (response) {
            response.on("data", function (data) {
                body += data;
            });
            response.on("end", function () {
                body = JSON.parse(body);
                var URL = body.url;
                res.write(URL);
                res.end();
            });
        });
    }
});
module.exports = router;

