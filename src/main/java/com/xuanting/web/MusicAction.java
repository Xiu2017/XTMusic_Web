package com.xuanting.web;

import com.xuanting.entity.Music;
import com.xuanting.entity.User;
import com.xuanting.service.MusicService;
import com.xuanting.service.UserService;
import org.apache.commons.io.FileUtils;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import javax.annotation.Resource;
import javax.servlet.http.HttpSession;
import java.io.File;
import java.io.IOException;
import java.util.List;

/**
 * Created by xiu on 2018/1/3.
 */
@RestController
@RequestMapping("/musicAction")
public class MusicAction {

    @Resource(name = "userService")
    private UserService userService;

    @Resource(name = "musicService")
    private MusicService musicService;

    //查询所有音乐
    @RequestMapping("/selMusic")
    public List<Music> selMusic(HttpSession session){
        User user = (User) session.getAttribute("user");
        user = userService.selUserById(user);
        return user.getMusic();
    }

    //删除音乐
    @RequestMapping("/delMusic")
    public boolean delMusic(Music music){
        return musicService.delMusic(music);
    }

    //下载音乐
    @RequestMapping("/downloadMusic")
    public ResponseEntity<byte[]> downloadMusic(String path, HttpSession session) throws IOException {
        System.out.println(path);
        if(path != null){
            //获取要下载的文件路径
            String basePath=session.getServletContext().getRealPath(path);
            File outFile=new File(basePath);
            if(outFile.exists()){//要下载的文件是存在的
                HttpHeaders headers=new HttpHeaders();//构建一个头文件对象
                //设置文件以下载方式打开
                headers.setContentDispositionFormData("attachment", new String(path.getBytes("UTF-8"),"iso-8859-1"));
                //设置文件类型
                headers.setContentType(MediaType.APPLICATION_OCTET_STREAM);
                return new ResponseEntity<byte[]>(FileUtils.readFileToByteArray(new File(basePath)),headers, HttpStatus.OK);
            }
        }
        return null;
    }
}
