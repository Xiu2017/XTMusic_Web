package com.xuanting.entity;

import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.Id;
import javax.persistence.Table;
import java.io.Serializable;

/**
 * 音乐
 * Created by xiu on 2017/11/9.
 */
@Entity
@Table(name = "xt_music")
public class Music implements Serializable{

    private int mid;  //编号[主键]
    private String name;  //文件名
    private String title;  //标题
    private String artist;  //歌手
    private String album;  //专辑
    private String time;  //时长
    private String path;  //音乐路径
    private String albumPath;  //专辑图片路径
    private String lyricPath;  //歌词路径

    public Music() {

    }

    public Music(int mid, String name, String title, String artist, String album, String time, String albumPath, String lyricPath, String path) {
        this.mid = mid;
        this.name = name;
        this.title = title;
        this.artist = artist;
        this.album = album;
        this.time = time;
        this.albumPath = albumPath;
        this.lyricPath = lyricPath;
        this.path = path;
    }

    @Id
    @GeneratedValue
    public int getMid() {
        return mid;
    }

    public void setMid(int mid) {
        this.mid = mid;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getArtist() {
        return artist;
    }

    public void setArtist(String artist) {
        this.artist = artist;
    }

    public String getAlbum() {
        return album;
    }

    public void setAlbum(String album) {
        this.album = album;
    }

    public String getTime() {
        return time;
    }

    public void setTime(String time) {
        this.time = time;
    }

    public String getAlbumPath() {
        return albumPath;
    }

    public void setAlbumPath(String albumPath) {
        this.albumPath = albumPath;
    }

    public String getLyricPath() {
        return lyricPath;
    }

    public void setLyricPath(String lyricPath) {
        this.lyricPath = lyricPath;
    }

    public String getPath() {
        return path;
    }

    public void setPath(String path) {
        this.path = path;
    }
}