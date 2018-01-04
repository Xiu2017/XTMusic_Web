<%--
  User: xiu
  Date: 2017/11/9
  Time: 19:41
--%>
<%@ page contentType="text/html;charset=UTF-8" isELIgnored="false" language="java" %>
<html>
<head>
    <title>炫听音乐</title>
    <link rel="shortcut icon" href="${pageContext.request.contextPath}/images/favicon.ico" >
    <link rel="stylesheet" href="${pageContext.request.contextPath}/css/main.css" />
    <link rel="stylesheet" href="${pageContext.request.contextPath}/css/scroll.css" />
    <script src="${pageContext.request.contextPath}/js/jquery-3.2.1.min.js"></script>
    <script src="${pageContext.request.contextPath}/js/base64util.js"></script>
    <script src="${pageContext.request.contextPath}/js/id3-minimized.js"></script>
    <script src="${pageContext.request.contextPath}/js/rgbaster.min.js"></script>
    <script src="${pageContext.request.contextPath}/js/main.js"></script>
</head>
<body>
    <div class="background"></div>
    <div class="top-bar">
        <div class="time-bar">
            炫听音乐
        </div>
    </div>
    <div class="main">
        <div class="menu">
            <div class="user">
                <div class="userimg">
                    &#xe823;
                </div>
                <form class="register" action="" method="post">
                    <input name="uacc" placeholder="账号"/>
                    <input name="upwd" type="password" placeholder="密码"/>
                    <input name="repwd" type="password" placeholder="确认密码"/>
                </form>
                <form class="sign_in" action="" method="post">
                    <input name="uacc" placeholder="账号"/>
                    <input name="upwd" type="password" placeholder="密码"/>
                </form>
                <span>登录</span>
                <span>注册</span>
                <span>用户名</span>
                <span>[注销]</span>
            </div>
            <div class="songlist">
                <div>播放列表</div>
                <ul>
                    <li id="local" class="now"><span>本地音乐</span><span class="addlocal" onclick="clickAdd()">＋</span></li>
                    <%--<li id="history">最近播放</li>--%>
                    <li id="cloud">云端音乐<span></span></li>
                </ul>
            </div>
        </div>
        <div class="list">
<%--            <div class="listinfo">
                <div class="img">
                    &lt;%&ndash;<span>&#xe83b;</span>&ndash;%&gt;
                </div>
                <div class="info"></div>
            </div>--%>
            <div class="listmain">
                <table id="locallist">
                    <tr>
                        <td></td>
                        <td></td>
                        <td></td>
                        <td>音乐标题</td>
                        <td>歌手</td>
                        <td>专辑</td>
                        <td></td>
                    </tr>
                </table>
                <table id="cloudlist">
                    <tr>
                        <td></td>
                        <td></td>
                        <td></td>
                        <td>音乐标题</td>
                        <td>歌手</td>
                        <td>专辑</td>
                        <td></td>
                    </tr>
                </table>
                <div class="emptylist">暂无音乐</div>
            </div>
        </div>
        <div class="lyric">
            <div class="album"></div>
            <div class="lrc">
                <ul>
                    <li class="now">炫听音乐，炫酷生活</li>
                </ul>
            </div>
            <div class="play-bar">
<%--                <div class="btn-bar">
                    <span class="button-last">&#xe804;</span>
                    <span class="button-play">&#xe81f;</span>
                    <span class="button-next">&#xe807;</span>
                </div>--%>
                <span class="button-last">&#xe82d;</span>
                <span class="button-play">&#xe831;</span>
                <span class="button-next">&#xe82e;</span>
            </div>
        </div>
    </div>

    <div class="editinfo">
        <div>
            确认歌曲信息
        </div>
        <form id="upload" enctype="multipart/form-data">
            <table>
                <tr>
                    <td>标题</td>
                    <td><input name="title" /></td>
                </tr>
                <tr>
                    <td>歌手</td>
                    <td><input name="artist" /></td>
                </tr>
                <tr>
                    <td>专辑</td>
                    <td><input name="album" /></td>
                </tr>
            </table>
            <input type="hidden" name="time" />
            <input type="hidden" name="num" />
        </form>
        <div>
            <span onclick="upload()">确认上传</span>
            <span onclick="javascript:$(this).parent().parent().slideToggle(200);">取消上传</span>
        </div>
    </div>

    <input type="file" id="files" multiple="multiple" webkitdirectory style="display: none" />
    <audio id="audio" />
    <audio id="util" />
</body>
</html>
