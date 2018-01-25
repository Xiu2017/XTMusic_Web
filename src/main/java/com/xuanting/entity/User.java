package com.xuanting.entity;

import org.hibernate.validator.constraints.NotBlank;

import javax.persistence.*;
import java.io.Serializable;
import java.util.ArrayList;
import java.util.List;

/**
 * 用户
 * Created by xiu on 2017/11/9.
 */
@Entity
@Table(name = "xt_user")
public class User implements Serializable{

    private int uno;  //编号[主键]
    private String uacc;  //账户
    private String upwd;  //密码

    //一个用户对应多首歌
    private List<Music> music = new ArrayList<Music>();

    public User() {
    }

    public User(int uno, String uacc, String upwd) {
        this.uno = uno;
        this.uacc = uacc;
        this.upwd = upwd;
    }

    @Id
    @GeneratedValue
    public int getUno() {
        return uno;
    }

    public void setUno(int uno) {
        this.uno = uno;
    }

    @NotBlank
    public String getUacc() {
        return uacc;
    }

    public void setUacc(String uacc) {
        this.uacc = uacc;
    }

    @NotBlank
    public String getUpwd() {
        return upwd;
    }

    public void setUpwd(String upwd) {
        this.upwd = upwd;
    }

    @OneToMany(fetch = FetchType.EAGER)
    @JoinColumn(name = "uno")
    @OrderBy("mid desc")
    public List<Music> getMusic() {
        return music;
    }

    public void setMusic(List<Music> music) {
        this.music = music;
    }
}
