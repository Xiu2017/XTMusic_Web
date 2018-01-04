package com.xuanting.dao;

import com.xuanting.entity.Music;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Created by xiu on 2017/11/9.
 */
@Repository("musicDao")
public class MusicDao extends BaseDao{

    //添加歌曲信息
    public Music addMusic(Music music){
        try{
            getSession().save(music);
            return music;
        }catch (Exception e){
            e.printStackTrace();
        }
        return null;
    }

    //删除歌曲信息
    public boolean delMusic(Music music){
        try{
            getSession().delete(music);
            return true;
        }catch (Exception e){
            e.printStackTrace();
        }
        return false;
    }

    //修改歌曲信息
    public Music updMusic(Music music){
        try {
            getSession().update(music);
            return music;
        }catch (Exception e){
            e.printStackTrace();
        }
        return null;
    }

    //根据id查询歌曲信息
    public Music selMusicById(Music music){
        return getSession().get(music.getClass(), music.getMid());
    }

    //根据hql查询歌曲信息
    public List selMusic(String hql){
        return getSession().createQuery(hql).list();
    }
}
