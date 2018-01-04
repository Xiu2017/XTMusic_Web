/**
 * Created by xiu on 2018/1/3.
 */

$(function () {
    //为动态列表绑定双击事件
    $(".listmain table:eq(" + selected + ")").on("dblclick", "tr:not(:first)", function () {
        //改变选中列表的样式
        $(".listmain table:eq(" + selected + ") tr").removeClass();
        $(this).addClass("now");

        //初始化进度条
        $(".time-bar").text($(this).find("td:eq(4)").text() + " - " + $(this).find("td:eq(3)").text());
        $(".time-bar").css("background-size", "0% 60px");

        //执行播放
        playMusic($(this).find("td:eq(0)").text());
    });
});


//播放操作
function playMusic(num) {
    //读取专辑封面
    getPicture(musics[num]);
    //清除定时器重置歌词界面并读取歌词
    clearTimeout(timeout);
    $(".lrc").scrollTop(0);
    readLyric(getLyric(num));
    //让audio就绪并播放
    $("#audio").attr("src", window.URL.createObjectURL(musics[num]));
    $("#audio")[0].play();
    //改变播放按钮状态
    $(".button-play").html("&#xe82f;");
    //清除定时器并显示播放进度
    clearInterval(interval);
    playBar();
}