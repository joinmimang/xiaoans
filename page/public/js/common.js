/**
 * Created by Administrator on 2017/3/17.
 */
// $(function () {
//     //        菜单栏下拉
//     //$("#mune_list ul li").next("ul").hide();
//     $("#mune_list ul li").click(function() {
//         $(this).children("div").removeClass("triangle-down").addClass("triangle-up");
//         $(this).next("ul").toggle(200);
//         $(this).next("ul").css("background-color","#273543");
//         $(this).css({ color: "#FFF", background: "#273543" });
//         $(this).parent().siblings().children("ul").hide();
//         $(this).parent().siblings().children("li").css("background-color","#2E3E4E");
//         var up_dowm = $(this).siblings("ul").css("display");
//         var that = $(this);
//         if(up_dowm=="none"){
//             $(this).parent().siblings().find("div").removeClass('triangle-down').addClass("triangle-up");
//         }else{
//             $(this).parent().siblings().find("div").removeClass('triangle-up').addClass("triangle-down");
//         }
//     });
//     var small_mune = $(".active").parent();
//     small_mune.addClass("ul_active");
//     small_mune.siblings("li").addClass("li_active");
//     small_mune.parent().siblings().children("ul").hide();
//     small_mune.siblings("li").children("div").removeClass('triangle-down').addClass("triangle-up");
// });