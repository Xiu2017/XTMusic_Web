package com.xuanting.service;

import com.xuanting.dao.UserDao;
import com.xuanting.entity.User;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import javax.annotation.Resource;
import javax.servlet.http.HttpSession;
import java.util.List;

/**
 * Created by xiu on 2017/11/9.
 */
@Service("userService")
@Transactional(propagation = Propagation.REQUIRED)
public class UserService {

    //注入userDao
    @Resource(name = "userDao")
    private UserDao userDao;

    //用户注册
    public User addUser(User user){
        User u = userDao.addUser(user);
        if(u == null){
            return user;
        }
        return u;
    }

    //用户登录
    public User userLogin(User user){
        //防止SQL注入
        String acc = user.getUacc().replace("'","''").replace("\"","\"\"");
        String pwd = user.getUpwd().replace("'","''").replace("\"","\"\"");
        //通过账号密码登录
        String hql = "from User where uacc='" + acc + "' and " +
                "upwd='" + pwd + "'";
        //通过cookie登录
/*        if(user.getUcookie() != null && user.getUcookie().length() > 0){
            hql = "from User where ucookie='"+user.getUcookie()+"' and ustatus=1";
        }*/
        List list = userDao.selUser(hql);
        if (list != null && list.size() == 1){
            return (User)list.get(0);
        }
        return user;
    }

    //根据id查询用户
    public User selUserById(User user){
        return userDao.selUserById(user);
    }

    //修改用户
    public boolean updUser(User user, HttpSession session){
        user = userDao.updUser(user);
        if(user != null){
            session.setAttribute("user", user);
            return true;
        }
        return false;
    }

    //查询用户名是否存在
    public boolean selUserByName(User user){
        String hql = "from User where uacc='"+user.getUacc()+"'";
        List list = userDao.selUser(hql);
        if(list != null && list.size() >= 1){
            return true;
        }
        return false;
    }

    public void setUserDao(UserDao userDao) {
        this.userDao = userDao;
    }
}
