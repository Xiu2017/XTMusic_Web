package com.xuanting.web;

import com.xuanting.Utils.FileUtils;
import com.xuanting.entity.Music;
import com.xuanting.entity.User;
import com.xuanting.service.MusicService;
import com.xuanting.service.UserService;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import javax.annotation.Resource;
import javax.servlet.http.HttpSession;
import java.io.File;
import java.io.IOException;

/**
 * Created by xiu on 2017/12/22.
 */
@RestController
@RequestMapping("/uploadAction")
public class UploadAction {

    @Resource(name = "musicService")
    private MusicService musicService;

    @Resource(name = "userService")
    private UserService userService;

    //接收用户上传的音乐
    @RequestMapping("/uploadFile")
    public String uploadFile(MultipartFile mfile, Music music,String albumBase64, HttpSession session){
        User user = (User) session.getAttribute("user");
        if(user == null){
            return "0";
        }
        //System.out.println("标题:"+ music.getTitle()+",用户："+user.getUacc());
        //上传文件
        if(!mfile.isEmpty()){
            //获取服务器路径
            String basePath = session.getServletContext().getRealPath("/Music");
            String realName=mfile.getOriginalFilename();//真实上传的文件名
            music.setName(realName);
            if(musicService.musicExist(music)){
                return "-2";
            }
            //执行上传操作
            try {
                File musicFile = new File(basePath+"/"+realName);
                if(!musicFile.exists()){
                    mfile.transferTo(musicFile);
                }
                music.setPath("Music/"+realName);
                String path = basePath+"/album/"+realName.substring(0, realName.lastIndexOf("."))+".png";
                if(albumBase64 != null && FileUtils.generateImage(albumBase64, path)){
                    music.setAlbumPath("Music/album/"+realName.substring(0, realName.lastIndexOf("."))+".png");
                }
                //System.out.println(music.getPath()+"\n"+music.getAlbumPath());
                music = musicService.addMusic(music);
                user = userService.selUserById(user);
                user.getMusic().add(music);
                if(userService.updUser(user, session)){
                    return "1";
                }
                //System.out.println("上传路径:"+basePath+"/"+realName);
            } catch (IOException e) {
                e.printStackTrace();
                return "-1";
            }
        }
        return "-1";
    }

    public void setMusicService(MusicService musicService) {
        this.musicService = musicService;
    }
}
