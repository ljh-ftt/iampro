const axios = require('axios');

async function testFrontend() {
  try {
    console.log('1. 测试根路径 (/)');
    const rootResponse = await axios.get('http://localhost:8080/');
    console.log('   状态码:', rootResponse.status);
    console.log('   内容长度:', rootResponse.data.length);
    console.log('   是否包含 <body> 标签:', rootResponse.data.includes('<body>'));
    console.log('   是否包含 <div id="app"> 标签:', rootResponse.data.includes('<div id="app">'));
    
    console.log('\n2. 测试登录路径 (/login)');
    const loginResponse = await axios.get('http://localhost:8080/login');
    console.log('   状态码:', loginResponse.status);
    console.log('   内容长度:', loginResponse.data.length);
    console.log('   是否包含 <body> 标签:', loginResponse.data.includes('<body>'));
    console.log('   是否包含 <div id="app"> 标签:', loginResponse.data.includes('<div id="app">'));
    
    console.log('\n前端响应正常！');
    
    // 检查是否有编译后的JS文件
    try {
      const jsResponse = await axios.get('http://localhost:8080/js/app.js', { validateStatus: false });
      console.log('\n3. 检查编译后的JS文件 (/js/app.js)');
      console.log('   状态码:', jsResponse.status);
      console.log('   内容长度:', jsResponse.data.length);
    } catch (e) {
      console.log('\n3. 编译后的JS文件检查失败:', e.message);
    }
    
  } catch (error) {
    console.log('错误:', error.message);
    if (error.response) {
      console.log('状态码:', error.response.status);
      console.log('响应内容:', error.response.data.substring(0, 200) + '...');
    }
  }
}

testFrontend();
