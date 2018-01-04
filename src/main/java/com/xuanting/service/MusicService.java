package com.xuanting.service;

import com.xuanting.dao.MusicDao;
import com.xuanting.entity.Music;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import javax.annotation.Resource;
import java.util.List;

/**
 * Created by xiu on 2017/11/9.
 */
@Service("musicService")
@Transactional(propagation = Propagation.REQUIRED)
public class MusicService{

    //注入songDao
    @Resource(name = "musicDao")
    private MusicDao musicDao;

    //添加歌曲信息
    public Music addMusic(Music music){
        return musicDao.addMusic(music);
    }

    //根据名称查询歌曲是否存在
    public boolean musicExist(Music music){
        //通过账号密码登录
        String hql = "from Music where name='" + music.getName() + "'";
        List list = musicDao.selMusic(hql);
        if (list != null && list.size() > 0){
            return true;
        }
        return false;
    }

    //根据ID删除歌曲
    public boolean delMusic(Music music){
        return musicDao.delMusic(music);
    }

    public void setMusicDao(MusicDao musicDao) {
        this.musicDao = musicDao;
    }
}
