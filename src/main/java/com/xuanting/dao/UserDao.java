package com.xuanting.dao;

import com.xuanting.entity.User;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Created by xiu on 2017/11/9.
 */
@Repository("userDao")
public class UserDao extends BaseDao{

    //添加用户，并返回用户对象
    public User addUser(User user){
        try {
            getSession().save(user);
            return user;
        }catch (Exception e){
            e.printStackTrace();
        }
        return null;
    }

    //修改用户
    public User updUser(User user){
        try{
            getSession().update(user);
            return user;
        }catch (Exception e){
            e.printStackTrace();
        }
        return null;
    }

    //删除用户[危险操作]
/*    public boolean delUser(User user){
        try{
            getSession().delete(user);
            return true;
        }catch (Exception e){
            e.printStackTrace();
        }
        return false;
    }*/

    //根据id查询用户
    public User selUserById(User user){
        return getSession().get(user.getClass(), user.getUno());
    }

    //根据hql查询用户
    public List selUser(String hql){
        return getSession().createQuery(hql).list();
    }
}
