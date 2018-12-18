# redux-action-types README

redux action types 自动化工具1

## Features
在编写redux action types 时，自动生成值,在js或ts文件中使用`// enableAutoFixActionTypes`来启用功能
```js
// enableAutoFixActionTypes

// AUTH_LOGIN->登录
// SPIDERS_SET_TASK_ID=
export default class ActionTypes {
}

//   |
//   ∨

// enableAutoFixActionTypes

// AUTH_LOGIN->登录
// SPIDERS_SET_TASK_ID=
export default class ActionTypes {

    /**
     * 登录-开始
     */
    static readonly AUTH_LOGIN_REQUEST = "auth_login_request"
    /**
     * 登录-成功
     */
    static readonly AUTH_LOGIN_SUCCESS = "auth_login_success"
    /**
     * 登录-失败
     */
    static readonly AUTH_LOGIN_FAILURE = "auth_login_failure"

    // -------------------------

    /**
     * ---
     */
    static readonly SPIDERS_SET_TASK_ID = "spiders_set_task_id"
}
```

## Requirements



## Extension Settings



## Known Issues



## Release Notes


### 1.0.0

Initial release

----