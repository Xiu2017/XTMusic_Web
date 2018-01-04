/**
 * Created by xiu on 2017/11/14.
 */
//全局变量
var media = [];  //浏览器支持的音频格式
var musics = [];  //所有本地歌曲文件
var lyrics = [];  //所有本地歌词文件
var cloud = [];  //云音乐
var interval;  //保存刷新进度条的定时器
var timeout;  //保存刷新歌词的定时器
var count = 0;  //歌曲计数
var times = [];  //歌词时间轴
var delay = -0.5;  //歌词延迟
var currentAjax = null;  //用于中断ajax请求
var ajaxCount = 0;  //用于统计ajax的重试次数
var temp;  //临时数据
var selected = 0;  //选中的列表
var login = false;  //用户登录状态

//全局常量
//用于计算哈希值
var I64BIT_TABLE = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789_-'.split('');


//一系列的监听事件
$(function () {

    //检查浏览器支持的音频
    checkAudio();

    //自适应排版
    adaptable();

    //自适应
    $(window).resize(function () {
        //布局适应
        adaptable();
        //歌词重定位
        reloLyric(liHeight(), 0)
    });

    //控制滚动条显隐
    $(".songlist ul").hover(function () {
        $(this).css("overflow-y", "auto");
    }, function () {
        $(this).css("overflow-y", "hidden");
    });

    //点击歌单
    $(".songlist li").click(function () {
        var len = 0;
        if ($(this)[0].id == "local") {
            $(".songlist li").removeClass();
            $(this).addClass("now");
            $("#locallist").show();
            $("#cloudlist").hide();
            len = $(".listmain table:eq(0) tr:not(:first)").length;
            selected = 0;
        } else {
            if (!login) {
                alert("请先登录！");
                return;
            }
            $(".songlist li").removeClass();
            $(this).addClass("now");
            selMusic();
            $("#locallist").hide();
            $("#cloudlist").show();
            len = $(".listmain table:eq(1) tr:not(:first)").length;
            selected = 1;
        }
        if (len > 0) {
            $(".emptylist").hide();
        } else {
            $(".emptylist").show();
        }
    });

    //点击登录
    $(".user span:eq(0)").click(function () {
        //如果已经是登录界面，校验表单数据
        if ($(".sign_in").css("display") == "block") {
            testData(".sign_in");
            return;
        }
        resetForm();
        $(".userimg").slideUp();
        $(".register").slideUp();
        $(".sign_in").slideDown();
    });

    //点击注册
    $(".user span:eq(1)").click(function () {
        //如果已经是注册界面，校验表单数据
        if ($(".register").css("display") == "block") {
            testData(".register");
            return;
        }
        resetForm();
        $(".userimg").slideUp();
        $(".sign_in").slideUp();
        $(".register").slideDown();
    });

    //输入框聚焦
    $(".user input").focus(function () {
        resetForm();
    });

    //注销登录
    $(".user span:eq(3)").click(function () {
        sign_out();
    });

    //新建歌单
    $(".songlist div:eq(0)").click(function () {
        //addList();
    });

    //文件Input发生改变的时候，添加音乐
    $("#files").change(function (e) {
        scanFiles(e);
    });

    /*    //播放按钮绑定hover事件
     $(".play-bar").hover(function () {
     var speed = 300;
     $(".lrc ul").stop(true).animate({"paddingTop":"17%"},speed);
     $(".lrc").stop(true).animate({"height":"30%"},speed);
     $(this).stop(true).animate({"height":"20%"},0);
     $(".btn-bar").stop(true).animate({"height":"50%"},speed);
     },function () {
     var speed = 300;
     $(".lrc ul").stop(true).animate({"paddingTop": "24%"}, speed);
     $(".lrc").stop(true).animate({"height": "40%"}, speed);
     $(this).stop(true).animate({"height": "10%"}, speed);
     $(".btn-bar").stop(true).animate({"height": "0%"}, speed);
     });*/

    //为动态列表绑定双击事件
    $(".listmain table").on("dblclick", "tr:not(:first)", function () {
        //改变选中列表的样式
        $(".listmain table tr").removeClass();
        $(this).addClass("now");

        //初始化进度条
        $(".time-bar").text($(this).find("td:eq(4)").text() + " - " + $(this).find("td:eq(3)").text());
        $(".time-bar").css("background-size", "0% 60px");

        //执行播放
        playMusic($(this).find("td:eq(0)").text());
    });

    //歌曲>点击删除按钮
    $(".listmain table:eq(0)").on("click", "#del", function () {
        if ($(".listmain table:eq(0) tr:not(:first)").length == 1) {
            //如果删除了最后一首歌曲，重置播放器界面
            resetAll();
            return;
        } else if ($(this).parent().parent().attr("class") == "now") {
            //如果删除了正在播放的歌曲，播放下一首
            playNext(1);
        }
        //将要删除的歌曲从数组文件中移除
        musics.splice($(this).parent().prev().prev().text(), 1);
        //同时从列表中移除
        $(this).parent().parent().remove();
        //重新计算列表编号
        resetNumber();
    });

    //云音乐>点击删除按钮
    $(".listmain table:eq(1)").on("click", "#del", function () {
        if(!confirm("你确定要把歌曲从云端删除吗？")){
            return;
        }
        var num = $(this).parent().prev().prev().text();
        $.ajax({
            url: "musicAction/delMusic",
            type: "POST",
            data: "mid=" + cloud[num].mid,
            success: function (data) {
                if (data == "false") {
                    alert("删除失败");
                }
            },
            error: function () {
                alert("删除失败");
            }
        });
        if ($(".listmain table:eq(1) tr:not(:first)").length == 1) {
            //如果删除了最后一首歌曲，重置播放器界面
            resetAll();
            selMusic();
            return;
        } else if ($(this).parent().parent().attr("class") == "now") {
            //如果删除了正在播放的歌曲，播放下一首
            playNext(1);
        }
        //将要删除的歌曲从数组文件中移除
        cloud.splice(num, 1);
        //同时从列表中移除
        $(this).parent().parent().remove();

        selMusic();
    });

    //歌曲>点击添加按钮
    $(".listmain table:eq(0)").on("click", "#addto", function () {
        editInfo(this);
    });

    //云音乐>点击下载按钮
    $(".listmain table:eq(1)").on("click", "#down", function () {
        downloadMusic(this);
    });

    //阻止操作歌曲时双击事件冒泡
    $(".listmain table:eq(0)").on("dblclick", "#addto,#del", function (event) {
        event.stopPropagation();
    });

    //为进度条绑定点击事件
    $(".time-bar").on("click", function () {
        if ($("#audio")[0].duration) {
            $("#audio")[0].currentTime = ($("#audio")[0].duration / $(".time-bar").outerWidth()) * event.offsetX;
            //重定向歌词进度
            reloLyric();
        }
    });

    //监听歌曲是否播放完成
    $("#audio").on("ended", function () {
        playNext(1);
    });

    //播放上一首
    $(".button-last").on("click", function () {
        playNext(-1);
    });

    //播放暂停/恢复
    $(".button-play").on("click", function () {
        //判断audio是否已经就绪
        if (!$("#audio")[0].src) return;

        //执行暂停/播放操作
        if ($("#audio")[0].paused) {
            $("#audio")[0].play();
            $(".button-play").html("&#xe82f;");
        } else {
            $("#audio")[0].pause();
            $(".button-play").html("&#xe831;");
        }
    });

    //播放下一首
    $(".button-next").on("click", function () {
        playNext(1);
    });
});

//查询用户上传的音乐
function selMusic() {
    var name = $(".listmain table:eq(1) tr.now").find("td:eq(3)").text();
    $.ajax({
        url: "musicAction/selMusic",
        type: "POST",
        dataType: "JSON",
        success: function (data) {
            cloud = data;
            var len = data.length;
            if (len > 0) {
                $(".emptylist").hide();
            } else {
                $(".emptylist").show();
            }
            $(".listmain table:eq(1) tr:not(:first)").remove();
            for (var i = 0; i < len; i++) {
                var tr = "<tr>";
                tr += "<td>" + i + "</td>";
                tr += "<td>" + PrefixInteger(i + 1, len.toString().length) + "</td>";
                tr += "<td><span id='down' style='font-size: 12px'>&#xe808;</span> <span id='del'>&#xe838;</span></td>";
                tr += "<td>" + data[i].title + "</td>";
                tr += "<td>" + data[i].artist + "</td>";
                tr += "<td>" + data[i].album + "</td>";
                tr += "<td>" + data[i].time + "</td></tr>";
                $(".listmain table:eq(1)").append(tr);
            }
            if (name == null || name == "") {
                return;
            }
            $(".listmain table:eq(1) tr:not(:first)").each(function (idx, elm) {
                var len = $(elm).find("td:eq(3):contains(" + name + ")").length;
                if (len == 1) {
                    $(elm).addClass("now");
                }
            });
        }
    });
}

//下载云音乐
function downloadMusic(obj) {
    var num = $(obj).parent().parent().find("td:eq(0)").text();
    window.open("musicAction/downloadMusic?path="+cloud[num].path);
}

//编辑歌曲信息
function editInfo(obj) {
    if (!login) {
        alert("请先登录！");
        return;
    }
    var $tr = $(obj).parent().parent();
    $(".editinfo input[name='title']").val($tr.find("td:eq(3)").text());
    $(".editinfo input[name='artist']").val($tr.find("td:eq(4)").text());
    $(".editinfo input[name='album']").val($tr.find("td:eq(5)").text());
    $(".editinfo input[name='time']").val($tr.find("td:eq(6)").text());
    $(".editinfo input[name='num']").val($tr.find("td:eq(0)").text());
    $(".editinfo input[name='title']").focus();
    $(".editinfo").slideToggle(200);
}

//上传音乐
function upload() {
    if (!login) {
        alert("请先登录！");
        return;
    }
    $(".editinfo").slideToggle(200);
    var formData = new FormData($("#upload")[0]);
    var f = musics[formData.get("num")];
    var url = f.urn || f.name;
    //读取专辑信息
    ID3.loadTags(url, function () {
        var picture = ID3.getAllTags(url).picture;
        if (picture) {
            var base64String = "";
            for (var i = 0; i < picture.data.length; i++) {
                base64String += String.fromCharCode(picture.data[i]);
            }
            var base64 = "data:" + picture.format + ";base64," +
                window.btoa(base64String);
            formData.append("albumBase64", base64);
        }
        formData.append("mfile", musics[formData.get("num")]);
        $.ajax({
            url: 'uploadAction/uploadFile',
            type: 'POST',
            cache: false,
            data: formData,
            processData: false,
            contentType: false,
            xhr: function () {
                var xhr = $.ajaxSettings.xhr();
                if (onprogress && xhr.upload) {
                    xhr.upload.addEventListener("progress", onprogress, false);
                    return xhr;
                }
            },
            success: function (data) {
                if (data == 1) {
                    $("#cloud").css("background-size", "0% 30px");
                    $("#cloud").css("background-color", "rgba(0,255,0,0.2)");
                    $("#cloud span").text("上传成功");
                    setTimeout(function () {
                        $("#cloud").css("background-color", "rgba(0,0,0,0)");
                        $("#cloud span").text("");
                    }, 2000);
                    //alert("上传成功");
                } else if (data == -2) {
                    $("#cloud").css("background-size", "0% 30px");
                    $("#cloud").css("background-color", "rgba(0,255,0,0.2)");
                    $("#cloud span").text("歌曲已存在");
                    setTimeout(function () {
                        $("#cloud").css("background-color", "rgba(0,0,0,0)");
                        $("#cloud span").text("");
                    }, 2000);
                } else if (data == 0) {
                    $("#cloud").css("background-size", "0% 30px");
                    $("#cloud").css("background-color", "rgba(255,0,0,0.2)");
                    alert("请先登录");
                    setTimeout(function () {
                        $("#cloud").css("background-color", "rgba(0,0,0,0)");
                        $("#cloud span").text("");
                    }, 2000);
                } else {
                    //alert("上传失败");
                    $("#cloud").css("background-size", "0% 30px");
                    $("#cloud").css("background-color", "rgba(255,0,0,0.2)");
                    $("#cloud span").text("上传失败");
                    setTimeout(function () {
                        $("#cloud").css("background-color", "rgba(0,0,0,0)");
                        $("#cloud span").text("");
                    }, 2000);
                }
            },
            error: function () {
                //alert("上传失败");
                $("#cloud").css("background-size", "0% 30px");
                $("#cloud").css("background-color", "rgba(255,0,0,0.2)");
                $("#cloud span").text("上传失败");
                setTimeout(function () {
                    $("#cloud").css("background-color", "rgba(0,0,0,0)");
                    $("#cloud span").text("");
                }, 2000);
            }
        });
    }, {
        tags: ["picture"],
        dataReader: ID3.FileAPIReader(f)
    });
}

//监听上传进度
function onprogress(evt) {
    var loaded = evt.loaded;     //已经上传大小情况
    var tot = evt.total;      //附件总大小
    var per = Math.floor(100 * loaded / tot);  //已经上传的百分比
    $("#cloud").css("background-size", per + "% 30px");
    $("#cloud span").text("上传中" + per + "%");
}

//校验表单数据
function testData(who) {
    var err_count = 0;
    var uacc = $(who).find("input[name='uacc']").val();
    var upwd = $(who).find("input[name='upwd']").val();
    var repwd = $(who).find("input[name='repwd']").val();
    if (uacc.length == 0) {
        err_count++;
        $(who).find("input[name='uacc']").val("").attr("placeholder", "账号不能为空");
    }
    if (upwd.length == 0) {
        err_count++;
        $(who).find("input[name='upwd']").val("").attr("placeholder", "密码不能为空");
    }
    if (who == ".register" && repwd != upwd) {
        err_count++;
        $(who).find("input[name='repwd']").val("").attr("placeholder", "两次输入的密码不一致");
    }
    if (err_count == 0) {
        sign_in(who);
    }
}

function adaptable() {
    //定时100毫秒，用于等待窗口大小改变完成
    setTimeout(function () {
        //进度条标题
        $(".top-bar").css("line-height", $(".top-bar").height() + "px");
        //用户信息居中
        $(".user .userimg,.user form").css("margin-top", ($(".user").height() - 150) / 2 + "px");
        //新建列表文字居中
        $(".songlist div").css("line-height", $(".songlist div").height() + "px");
        //歌词居中
        $(".lrc").css("padding", ($(".lrc").innerHeight() / 2.5) + "px 0");
        //播放按钮
        $(".play-bar span").css("line-height", $(".play-bar").height() + "px");
    }, 100);
}

//注册&登录
function sign_in(who) {
    var param = $(who).serialize();
    var url = who == ".sign_in" ? "doLogin" : "doRegister";
    $.ajax({
        url: "loginAction/" + url,
        type: "POST",
        data: param,
        dataType: "JSON",
        success: function (data) {
            //判断登录是否失败
            if (data.uno == 0) {
                if (who == ".sign_in") {
                    alert("账号或密码错误");
                } else {
                    alert("用户名已存在");
                }
                return;
            }
            //如果成功，开始处理数据
            showData(data);
            selMusic();
        },
        error: function () {
            if (who == ".sign_in") {
                alert("登录失败");
            } else {
                alert("注册失败");
            }
        }
    });
}

//处理登录数据
function showData(data) {
    //显示用户界面
    resetForm();
    $(".register").slideUp();
    $(".sign_in").slideUp();
    $(".user span").hide();
    $(".userimg").text(data.uacc[0]).slideDown();
    $(".user span:eq(2)").text(data.uacc).slideDown();
    $(".user span:eq(3)").slideDown();
    login = true;
}

//注销登录
function sign_out() {
    //显示初始界面
    resetForm();
    $(".user input").val("");
    $(".register").slideUp();
    $(".sign_in").slideUp();
    $(".user span").hide();
    $(".userimg").html("&#xe823;");
    $(".user span:eq(0)").slideDown();
    $(".user span:eq(1)").slideDown();

    $(".listmain table:eq(" + 1 + ") tr:not(:first)").remove();
    $("#local").click();

    //通知服务器清空用户信息
    $.ajax({
        url: "loginAction/doSignOut"
    });

    login = false;
}

//新建歌单
function addList() {
    var slname = prompt("请输入歌单名称");
    if (slname.length > 0) {
        $.ajax({
            url: "",
            type: "POST",
            data: "slname=" + slname,
            dataType: "JSON",
            success: function (data) {

            }
        });
    } else {
        addList();
    }
}

//重置表单
function resetForm() {
    $("input[name='uacc']").attr("placeholder", "账号");
    $("input[name='upwd']").attr("placeholder", "密码");
    $("input[name='repwd']").attr("placeholder", "重复密码");
}

//触发文件input点击操作
function clickAdd() {
    $("#files").click();
}

//扫描歌曲文件和歌词文件
function scanFiles(e) {
    var files = e.target.files;
    var regex = eval("/.*\.(" + media + ")$/");
    for (var i = 0, f; f = files[i]; ++i) {
        var path = f.name || f.webkitRelativePath;
        if (regex.test(path.toLowerCase())) {
            musics.push(f);
        } else if (/.*\.lrc/.test(path)) {
            lyrics.push(f);
        }
    }
    //去除同名文件
    musics = unique(musics);
    lyrics = unique(lyrics);

    //判断是否扫描到新歌曲
    if (musics.length == count) {
        alert("没有扫描到新歌曲");
        return;
    }

    //如果歌曲数量不为0，添加歌曲到列表
    if (musics.length > count) {
        $(".emptylist").hide();
        $("#local").html("本地音乐 " + musics.length + "<span class='addlocal' onclick='clickAdd()'>＋</span>");

        //创建带编号和文件名的列表
        for (var i = count; i < musics.length; i++) {
            var fileName = musics[i].name;
            fileName = fileName.substr(0, fileName.length - 4);
            var tr = "<tr>";
            tr += "<td></td>";
            tr += "<td></td>";
            tr += "<td><span id='addto'>＋</span><span id='del'>&#xe838;</span></td>";
            tr += "<td>" + fileName + "</td>";
            tr += "<td>Loading...</td>";
            tr += "<td>Loading...</td>";
            tr += "<td>00:00</td></tr>";
            $(".listmain table:eq(0)").append(tr);
        }

        //重新编号
        resetNumber();
        count = 0;

        addToList();
    }
}

//将音乐添加到列表
function addToList() {
    //如果没有正在播放的歌曲，将扫描进度显示在进度条
    if (!$("#audio").attr("src")) {
        $(".time-bar").text("正在读取音乐信息" + Math.round(count / musics.length * 100) + "%");
        $(".time-bar").css("background-size", (count / musics.length * 100) + "% 60px");
    }

    var url = musics[count].urn || musics[count].name;
    //计算文件名的hash值
    var hashVal = hash(musics[count].name);
    //从localStorage中读取音乐信息
    var info = JSON.parse(localStorage.getItem(hashVal))
    //如果存在,写入列表
    if (info) {
        getInfo(info);
    } else {
        //否则解析音乐信息
        ID3.loadTags(url, function () {
            var tags = ID3.getAllTags(url);
            var info = [];
            info.push(tags.title);
            info.push(tags.artist || "未知歌手");
            info.push(tags.album || "未知专辑");
            //将读取到的音乐信息写入列表
            if (info[0]) {
                $(".listmain table:eq(0) tr:eq(" + (count + 1) + ") td:eq(3)").text(info[0]);
            }
            $(".listmain table:eq(0) tr:eq(" + (count + 1) + ") td:eq(4)").text(info[1]);
            $(".listmain table:eq(0) tr:eq(" + (count + 1) + ") td:eq(5)").text(info[2]);
            //读取时间
            $("#util").attr("src", window.URL.createObjectURL(musics[count]));
            //temp = info;
            getTime(info, hashVal);
        }, {
            tags: ["title", "artist", "album"],
            dataReader: ID3.FileAPIReader(musics[count])
        });
    }
}

//获取歌曲时间
function getTime(info, hashVal) {
    //线程休眠1ms，防止浏览器提示栈溢出
    setTimeout(function () {
        var duration = $("#util")[0].duration;
        //判断歌曲时间是否已经取出
        if (isNaN(duration)) {
            //如果没有取出时间，递归
            getTime(info, hashVal);
        } else {
            //将tr追加到列表中
            info.push(convertTime(duration));
            $(".listmain table:eq(0) tr:eq(" + (count + 1) + ") td:eq(6)").text(info[3]);
            //将读取到的音乐信息保存到localStorage
            localStorage.setItem(hashVal, JSON.stringify(info));
            count++;

            //如果不是最后一个音乐文件，递归读取
            if (count < musics.length) {
                addToList();
            } else if (!$("#audio").attr("src")) {
                $(".time-bar").text("读取完成100%");
                $(".time-bar").css("background-size", "100% 60px");
                setTimeout(function () {
                    $(".time-bar").text("炫听音乐");
                    $(".time-bar").css("background-size", "0% 60px");
                }, 2000);
            }
        }
    }, 1);
}

//将localStorage中读取音乐的信息写入列表
function getInfo(info) {
    if (info[0]) {
        $(".listmain table:eq(0) tr:eq(" + (count + 1) + ") td:eq(" + (3) + ")").text(info[0]);
    }
    $(".listmain table:eq(0) tr:eq(" + (count + 1) + ") td:eq(" + (4) + ")").text(info[1]);
    $(".listmain table:eq(0) tr:eq(" + (count + 1) + ") td:eq(" + (5) + ")").text(info[2]);
    $(".listmain table:eq(0) tr:eq(" + (count + 1) + ") td:eq(" + (6) + ")").text(info[3]);
    count++;
    //如果不是最后一个音乐文件，递归
    if (count < musics.length) {
        addToList();
    } else if (!$("#audio").attr("src")) {
        $(".time-bar").text("读取完成100%");
        $(".time-bar").css("background-size", "100% 60px");
        setTimeout(function () {
            $(".time-bar").text("炫听音乐");
            $(".time-bar").css("background-size", "0% 60px");
        }, 2000);
    }
}

//对歌曲列表重新编号，适用于删除某首歌曲的后续操作
function resetNumber() {
    var $tr = $(".listmain table:eq(0) tr:not(:first)");
    count = $tr.length;
    $("#local").html("本地音乐 " + count + "<span class='addlocal' onclick='clickAdd()'>＋</span>");
    $tr.each(function (i) {
        $(this).find("td:eq(0)").text(i);
        $(this).find("td:eq(1)").text(PrefixInteger(i + 1, count.toString().length));
    });
}

//重置播放器到默认状态，删除最后一首歌曲时触发的操作
function resetAll() {
    //暂停并重置按钮
    $("#audio")[0].pause();
    $(".button-play").html("&#xe831;");
    $("#audio").attr("src", null);
    //重置歌词界面
    $(".lrc ul").empty();
    $(".lrc ul").append("<li class='now'>炫听音乐，炫酷生活</li>");
    //重置列表
    $(".listmain table:eq(" + selected + ") tr:not(:first)").remove();
    $(".emptylist").show();
    $("#local").html("本地音乐 <span class='addlocal' onclick='clickAdd()'>＋</span>");
    //重置进度条
    $(".time-bar").text("炫听音乐");
    $(".time-bar").css("background-size", "0% 60px");
    //重置背景和专辑图片
    $(".background").css("background-image", "url('./images/background.jpg')");
    $(".album").css("background-image", "url('./images/album.png')");
    //重置定时器
    clearTimeout(timeout);
    clearInterval(interval);
    //停止请求
    if (ajaxCount) ajaxCount.abort();

}

//播放操作
function playMusic(num) {
    //清除定时器重置歌词界面
    clearTimeout(timeout);
    $(".lrc").scrollTop(0);
    if (selected == 0) {  //如果是本地歌曲
        //读取专辑封面
        getPicture(musics[num]);
        //读取歌词
        readLyric(getLyric(num));
        //让audio就绪并播放
        $("#audio").attr("src", window.URL.createObjectURL(musics[num]));
        $("#audio")[0].play();
    } else {
        getCloudPicture(cloud[num].albumPath);
        //并读取歌词
        readLyric(null);
        $("#audio").attr("src", cloud[num].path);
        $("#audio")[0].play();
    }
    //改变播放按钮状态
    $(".button-play").html("&#xe82f;");
    //清除定时器并显示播放进度
    clearInterval(interval);
    playBar();
}

//播放进度条
function playBar() {
    interval = setInterval(function () {
        //计算播放进度百分比
        var pre = $("#audio")[0].currentTime / $("#audio")[0].duration * 100;
        //更新显示的进度
        $(".time-bar").css("background-size", pre + "% 60px");
    }, 100);
}

//上、下一首操作
function playNext(step) {
    //var next = parseInt($(".listmain table:eq("+selected+") .now").find("td:eq(0)").text()) + step;
    //取出正在播放的歌曲，计算下一首歌曲的节点
    var $now = $(".listmain table:eq(" + selected + ") tr.now");
    if ($now.length == 0 && selected == 0) {
        selected = 1;
        $now = $(".listmain table:eq(" + selected + ") tr.now");
    } else if ($now.length == 0 && selected == 1) {
        selected = 0;
        $now = $(".listmain table:eq(" + selected + ") tr.now");
    }

    var $next;
    //如果是下一首操作
    if (step == 1) {
        //判断当前歌曲是否为最后一首
        if ($now[0] == $(".listmain table:eq(" + selected + ") tr:last")[0]) {
            //跳到第一首
            $next = $(".listmain table:eq(" + selected + ") tr:eq(1)");
        } else {
            //否则去到下一首
            $next = $now.next();
        }
        //如果是上一首操作，原理同上
    } else {
        if ($now[0] == $(".listmain table:eq(" + selected + ") tr:eq(1)")[0]) {
            $next = $(".listmain table:eq(" + selected + ") tr:last");
        } else {
            $next = $now.prev();
        }
    }

    //激活tr的双击事件
    $next.dblclick();
}

//获取服务器专辑封面
function getCloudPicture(path) {
    if (path != null) {
        $(".background").css("background-image", "url('" + path + "')");
        $(".album").css("background-image", "url('" + path + "')");
    } else {
        $(".background").css("background-image", "url('./images/background.jpg')");
        $(".album").css("background-image", "url('./images/album.png')");
    }
}

//获取单首音乐专辑封面，并设置为背景
function getPicture(f) {
    var url = f.urn || f.name;
    ID3.loadTags(url, function () {
        var picture = ID3.getAllTags(url).picture;
        if (picture) {
            var base64String = "";
            for (var i = 0; i < picture.data.length; i++) {
                base64String += String.fromCharCode(picture.data[i]);
            }
            var base64 = "data:" + picture.format + ";base64," +
                window.btoa(base64String);
            $(".background").css("background-image", "url('" + base64 + "')");
            $(".album").css("background-image", "url('" + base64 + "')");
        } else {
            $(".background").css("background-image", "url('./images/background.jpg')");
            $(".album").css("background-image", "url('./images/album.png')");
        }
    }, {
        tags: ["picture"],
        dataReader: ID3.FileAPIReader(f)
    });
}

//检索本地歌词文件
function getLyric(num) {
    if (num = -1) return null;
    var musicName = musics[num].name;
    musicName = musicName.substr(0, musicName.length - 4);
    var lrcFile = null;
    for (var i = 0; i < lyrics.length; i++) {
        var lrcName = lyrics[i].name;
        lrcName = lrcName.substr(0, lrcName.length - 4);
        if (lrcName == musicName) {
            lrcFile = lyrics[i];
            break;
        }
    }
    return lrcFile;
}

//读取歌词文件并处理歌词
function readLyric(lrcFile) {
    //判断歌词文件是否为空，如果为空，向酷狗服务器请求歌词
    if (lrcFile == null) {
        //提示用户正在搜索歌词
        $(".lrc ul").empty();
        $(".lrc ul").append("<li class='now'>正在搜索歌词</li>");
        //获取歌曲名称和时间
        if (selected == 0) {
            var num = $(".listmain table:eq(0) .now").find("td:eq(0)").text();
            var duration = $(".listmain table:eq(0) .now").find("td:eq(6)").text();
            var name = musics[num].name;
        } else {
            var num = $(".listmain table:eq(1) .now").find("td:eq(0)").text();
            var duration = $(".listmain table:eq(1) .now").find("td:eq(6)").text();
            var name = cloud[num].name;
        }
        name = name.substr(0, name.length - 4);
        //中断所有ajax请求，防止多次点击造成的请求
        if (currentAjax) currentAjax.abort();
        //向酷狗服务器请求歌词
        seaMusic(name, convertString(duration));
    } else {
        //如果存在本地歌词，进行本地歌词文件的读取
        var reader = new FileReader();
        reader.readAsText(lrcFile);
        reader.onload = function () {
            //解析歌词文本
            delrc(reader.result);
        };
    }
}

//解析歌词文本
function delrc(lrcs) {
    //清空歌词界面
    $(".lrc ul").empty();
    //判断歌词是否为空，为空再次向服务器请求，最多3次，防止网络不稳定
    if (!lrcs) {
        if (ajaxCount <= 2) {
            ajaxCount++;
            readLyric();
        } else {
            ajaxCount = 0;
            $(".lrc ul").append("<li class='now'>找不到歌词</li>");
            //$(".lrc ul").append("<li class='now'><a href='javascript:;' onclick='readLyric()'>找不到歌词，点击重试</a></li>");
        }
        //处理歌词
    } else {
        times = [];
        //将歌词按段落切割存入数组当中
        lrcs = lrcs.split('\r\n');
        //遍历每行歌词
        for (var i = 0; i < lrcs.length; i++) {
            //提取出时间
            var time = lrcs[i].match(/\[\d{2}:\d{2}((\.|\:)\d{2})\]/g);
            //提取出歌词内容
            var lrc = lrcs[i].split(time);
            //去除前后空格
            lrc = $.trim(lrc[1]);
            if (time != null) {
                //将时间进行处理
                time = String(time).split(':');
                //转换为秒
                var sec = parseInt(time[0].split('[')[1]) * 60 + parseFloat(time[1].split(']')[0]);
                //转换为毫秒并保存
                times[i] = Math.round(sec * 100) / 100;

                //写入歌词列表
                $(".lrc ul").append("<li>" + lrc + "</li>");
            }
        }

        //播放歌词
        clearTimeout(timeout);
        reloLyric(liHeight(), 0);
    }
}

//计算歌词列表所有li的中间位置
function liHeight() {
    var height = [];
    height[0] = 0;
    for (var i = 0; i < times.length - 1; i++) {
        height[i + 1] = height[i] + $(".lrc ul li:eq(" + i + ")")[0].offsetHeight;
    }
    return height;
}

//播放歌词
function playLyric(height, i) {
    //获取正在播放的时间
    var currentTime = $("#audio")[0].currentTime;
    //如果正在播放的时间不为空，且播放的时间大于第i行歌词，歌词上移一行，i自增
    if (currentTime && currentTime > times[i] + delay) {
        $(".lrc").animate({"scrollTop": height[i]}, 200);
        $(".lrc ul li").removeClass();
        $(".lrc ul li:eq(" + i + ")").addClass("now");
        i++;
    }
    //定时递归刷新歌词
    timeout = setTimeout(function () {
        playLyric(height, i)
    }, 50);
}

//重定位歌词
function reloLyric() {
    //停止动画
    $(".lrc").stop(false, false);
    //清除定时器
    clearTimeout(timeout);
    var height = liHeight();
    var currentTime = $("#audio")[0].currentTime;
    var idx = times.length - 1;
    //定位播放到第几行歌词
    for (var i = 0; i < times.length - 1; i++) {
        if (times[i] > currentTime) {
            idx = i;
            break;
        }
    }
    //刷新
    $(".lrc").animate({"scrollTop": height[idx]}, 300);
    $(".lrc ul li").removeClass();
    $(".lrc ul li:eq(" + (idx == 0 ? -1 : idx) + ")").addClass("now");
    playLyric(height, idx);
}

//酷狗歌曲搜索
function seaMusic(name, duration) {
    //console.log(name + "," + duration);
    var musicUrl = "http://lyrics.kugou.com/search?ver=1&man=yes&client=pc&keyword=" + name + "&duration=" + duration + "&hash=";
    //var musicUrl = "http://mobilecdn.kugou.com/api/v3/search/song?format=json&keyword=想象之中&page=1&pagesize=1";
    //歌曲链接 var musicUrl = "http://m.kugou.com/app/i/getSongInfo.php?cmd=playInfo&hash=708b4862085169e0328cecdae8c2b689";

    //通过yahoo提供的jsonp代理跨域访问酷狗服务器
    currentAjax = $.ajax({
        url: 'http://query.yahooapis.com/v1/public/yql',
        dataType: 'jsonp',
        data: {
            q: "select * from json where url=\"" + encodeURI(musicUrl) + "\"",
            format: "json"
        },
        success: function (d) {
            //console.log(d);
            //空异常处理
            if (d.query.results == null || d.query.results.json.status == 404) {
                delrc();
            } else {
                var candidates = d.query.results.json.candidates;
                if (!$.isEmptyObject(candidates[0])) {
                    var lrcLink = "http://lyrics.kugou.com/download?ver=1&client=pc&id=" + candidates[0].id + "&accesskey=" + candidates[0].accesskey + "&fmt=lrc&charset=utf8";
                }
                getKugouLrc(lrcLink);

            }
        },
        error: function (xmlHttpRequest, error) {
            $(".lrc ul").empty();
            $(".lrc ul").append("<li class='now'>搜索出错，请检查网络</li>");
        }
    });
}

//酷狗歌词获取
function getKugouLrc(lrcLink) {
    //通过yahoo提供的jsonp代理跨域访问酷狗服务器
    currentAjax = $.ajax({
        url: 'http://query.yahooapis.com/v1/public/yql',
        dataType: 'jsonp',
        data: {
            q: "select * from json where url=\"" + lrcLink + "\"",
            format: "json"
        },
        success: function (d) {
            //console.log(d);
            //空异常处理
            if (!d.query.results) {
                delrc();
            } else {
                var base64 = d.query.results.json.content;
                delrc(new Base64().decode(base64));
            }
        }
    });
}

//====================以下为工具方法====================//

//列表序号整数填充
function PrefixInteger(num, length) {
    return ( "0000" + num ).substr(-length);
}

//将秒数格式化00:00:00
function convertTime(time) {
    var hou = Math.floor(time / 3600);
    if (hou == 0) hou = "";
    else if (hou < 10) hou = "0" + hou + ":";
    else if (hou >= 10) hou = hou + ":";
    var min = Math.floor(time / 60 - Math.floor(time / 3600) * 60);
    if (min < 10) min = "0" + min;
    var sec = Math.round(time) % 60;
    if (sec < 10) sec = "0" + sec;
    return hou + "" + min + ":" + sec;
}
//将字符串时间转换为毫秒
function convertString(str) {
    var strs = str.split(":");
    return (parseInt(strs[0]) * 60 + parseInt(strs[1])) * 1000;
}

//高效去掉数组重复项，有改动。原作者http://www.cnblogs.com/sosoft/
function unique(arr) {
    var result = [], hash = {};
    for (var i = 0, elem; (elem = arr[i]) != null; i++) {
        if (!hash[elem.name]) {
            result.push(elem);
            hash[elem.name] = true;
        }
    }
    return result;
}

//由于太耗资源和时间，暂时弃用
//图片主色计算，原作者https://github.com/briangonzalez/rgbaster.js
function rgbaster(img) {
    RGBaster.colors(img, {
        // return up to 30 top colors from the palette
        paletteSize: 30,

        // don't count white
        exclude: ['rgb(255,255,255)'],

        // do something when done
        success: function (payload) {
            //console.log('Dominant color:', payload.dominant);
            //console.log('Secondary color:', payload.secondary);
            //.log('Palette:', payload.palette);
        }
    });
}

//RGB亮度计算
function brightness(rgbstr) {
    //亮度公式是 Brightness = 0.3 * R + 0.6 * G + 0.1 * B
    //RGB计算色彩知觉亮度的公式 Y = ((R*299)+(G*587)+(B*114))/1000
    var rgb = rgbstr.substr(4, rgbstr.length - 5);
    var rgbs = rgb.split(",");

    var r = parseInt(rgbs[0]);
    var g = parseInt(rgbs[1]);
    var b = parseInt(rgbs[2]);

    return (r * 299 + g * 587 + b * 114) / 1000;
}

//计算字符串或文件的hash值，原作者http://blog.csdn.net/dz_huanbao/article/details/4301129
function hash(input) {
    var hash = 5381;
    var i = input.length - 1;

    if (typeof input == 'string') {
        for (; i > -1; i--)
            hash += (hash << 5) + input.charCodeAt(i);
    }
    else {
        for (; i > -1; i--)
            hash += (hash << 5) + input[i];
    }
    var value = hash & 0x7FFFFFFF;

    var retValue = '';
    do {
        retValue += I64BIT_TABLE[value & 0x3F];
    }
    while (value >>= 6);

    return retValue;
}

//检查浏览器支持的音频格式
function checkAudio() {
    var myAudio = $("#util")[0];
    media = [];
    if (myAudio.canPlayType) {
        if ("" != myAudio.canPlayType('audio/mpeg')) {
            media.push("mp3");
            media.push("m4a");
        }
        if ("" != myAudio.canPlayType('audio/ogg')) {
            media.push("ogg");
        }
        if ("" != myAudio.canPlayType('audio/mp4')) {
            media.push("aac");
        }
        if ("" != myAudio.canPlayType('audio/x-wav')) {
            media.push("wav");
        }
        if ("" != myAudio.canPlayType('audio/flac')) {
            media.push("flac");
        }
        media = media.toString().replace(/,/g, "|");
    } else {
        $(".time-bar").text("很抱歉，您的浏览器不支持播放音频文件，建议使用Google Chrome浏览器");
    }
}