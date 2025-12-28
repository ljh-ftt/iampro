const axios = require('axios');

async function testLogin() {
  try {
    // 测试登录API
    const response = await axios.post('http://localhost:3001/api/auth/login', {
      phone: '13800138001',
      password: '123456'
    });
    console.log('登录成功!');
    console.log('Token:', response.data.token);
    console.log('User info:', response.data.user);
    return true;
  } catch (error) {
    console.error('登录失败:', error.message);
    if (error.response) {
      console.error('错误状态:', error.response.status);
      console.error('错误数据:', error.response.data);
    }
    return false;
  }
}

testLogin();
