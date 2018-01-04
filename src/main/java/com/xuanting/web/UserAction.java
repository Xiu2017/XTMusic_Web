package com.xuanting.web;

import com.xuanting.service.UserService;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import javax.annotation.Resource;

/**
 * Created by xiu on 2017/11/9.
 */
@RestController
@RequestMapping("userAction")
public class UserAction {

    //注入userService
    @Resource(name = "userService")
    private UserService userService;

    public void setUserService(UserService userService) {
        this.userService = userService;
    }
}
