package com.xuanting.web;

import com.xuanting.entity.User;
import com.xuanting.service.UserService;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import javax.annotation.Resource;
import javax.servlet.http.HttpSession;

/**
 * Created by xiu on 2017/11/9.
 */
@RestController
@RequestMapping("/loginAction")
public class LoginAction {

    @Resource(name = "userService")
    private UserService userService;

    //登录
    @RequestMapping("/doLogin")
    public User doLogin(User user, HttpSession session){
        User u = userService.userLogin(user);
        u.setUpwd("");
        session.setAttribute("user", u);
        return u;
    }

    //注册
    @RequestMapping("/doRegister")
    public User addUser(User user, HttpSession session){
        if(userService.selUserByName(user)){
            return user;
        }
        user = userService.addUser(user);
        user.setUpwd("");
        session.setAttribute("user", user);
        return user;
    }

    //注销
    @RequestMapping("/doSignOut")
    public void signOut(HttpSession session){
        session.setAttribute("user",null);
    }

    public void setUserService(UserService userService) {
        this.userService = userService;
    }
}
