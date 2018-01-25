package com.xuanting;

import com.xuanting.entity.User;
import com.xuanting.service.MusicService;
import com.xuanting.service.UserService;
import junit.framework.TestCase;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.junit4.SpringJUnit4ClassRunner;
import org.springframework.transaction.annotation.Transactional;

import javax.annotation.Resource;

/**
 * Created by xiu on 2018/1/22.
 */
@RunWith(SpringJUnit4ClassRunner.class)
@ContextConfiguration(locations = {"classpath*:applicationContext.xml", "classpath*:springmvc-servlet.xml"})
public class AllTest extends TestCase{

    @Resource(name = "userService")
    private UserService userService;
    @Resource(name = "musicService")
    private MusicService musicService;

    //用户登录 -- 错误的账号密码
    @Test
    @Transactional   //标明此方法需使用事务
    //@Rollback(false)  //标明使用完此方法后事务不回滚,true时为回滚
    public void test_userLogin1(){
        assertEquals(0, userService.userLogin(new User(0, "admin", "admin")).getUno());
    }

    //用户登录 -- 正确的账号密码
    @Test
    @Transactional   //标明此方法需使用事务
    public void test_userLogin2(){
        assertEquals(98, userService.userLogin(new User(0, "xiu", "123")).getUno());
    }

    //用户注册 -- 空的账号密码
    @Test
    @Transactional   //标明此方法需使用事务
    public void test_addUser1(){
        assertEquals(0, userService.addUser(new User(0, null, null)).getUno());
    }

    //用户注册 -- 合法的账号密码
    @Test
    @Transactional   //标明此方法需使用事务
    public void test_addUser2(){
        assertEquals("zhangsan", userService.addUser(new User(0, "zhangsan", "123456")).getUacc());
    }

    //歌曲查询 -- 根据歌曲名称和用户id查询歌曲是否存在
    @Test
    @Transactional   //标明此方法需使用事务
    public void test_musicExist(){
        assertEquals(true, musicService.musicExist("黄明志 - 泰国恰恰.mp3", 98));
    }

}