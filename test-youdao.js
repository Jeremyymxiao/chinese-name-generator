import fetch from 'node-fetch';
import crypto from 'crypto';

const config = {
  appKey: '61e052e5686cd9e9',
  appSecret: 'y8swxqjl8rAPSj1EtTbEcHY6qHTdaowM',
  endpoint: 'https://openapi.youdao.com/ttsapi'
};

function generateSalt() {
  return crypto.randomBytes(16).toString('hex');
}

function getCurrentTimestamp() {
  // 获取当前时间的Unix时间戳（秒）
  const now = new Date();
  return Math.floor(now.getTime() / 1000);
}

async function testYouDaoTTS() {
  try {
    // 1. 准备基础参数
    const q = '你好';  // 测试文本
    const salt = generateSalt();
    const curtime = getCurrentTimestamp();
    
    console.log('Current time:', new Date().toISOString());
    console.log('Current timestamp:', curtime);
    
    // 2. 计算input (根据文档，当q长度<=20时，input=q；当q长度>20时，input=q前10个字符+q长度+q后10个字符)
    const input = q.length <= 20 ? q : `${q.substring(0, 10)}${q.length}${q.substring(q.length - 10)}`;
    
    // 3. 生成签名字符串 (应用ID+input+salt+curtime+应用密钥)
    const signStr = config.appKey + input + salt + curtime + config.appSecret;
    
    // 4. 计算签名
    const sign = crypto.createHash('sha256').update(signStr).digest('hex');
    
    console.log('Request preparation:', {
      q,
      input,
      salt,
      curtime,
      signStr,
      sign
    });

    // 5. 准备请求参数（注意：这里的q需要进行URL编码）
    const params = new URLSearchParams();
    params.append('q', q);  // URLSearchParams会自动进行URL编码
    params.append('appKey', config.appKey);
    params.append('salt', salt);
    params.append('sign', sign);
    params.append('signType', 'v3');
    params.append('curtime', curtime.toString());
    params.append('voiceName', 'youxiaoqin');
    params.append('format', 'mp3');
    params.append('volume', '1.0');
    params.append('speed', '1.0');
    params.append('langType', 'zh-CHS');

    console.log('Making request with params:', Object.fromEntries(params));
    
    const response = await fetch(config.endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString()
    });

    const contentType = response.headers.get('content-type');
    console.log('Response headers:', {
      status: response.status,
      statusText: response.statusText,
      contentType
    });

    if (contentType?.includes('application/json')) {
      const jsonResponse = await response.json();
      console.log('API Error Response:', jsonResponse);
      
      // 如果是错误响应，打印更多信息以便调试
      if (jsonResponse.errorCode) {
        console.log('Full request details for debugging:');
        console.log('1. Original text:', q);
        console.log('2. Salt:', salt);
        console.log('3. Curtime:', curtime);
        console.log('4. Input for signature:', input);
        console.log('5. Full signature string:', signStr);
        console.log('6. Final signature:', sign);
        console.log('7. Full URL-encoded body:', params.toString());
      }
    } else if (contentType?.includes('audio/')) {
      const buffer = await response.arrayBuffer();
      console.log('Success! Received audio data of size:', buffer.byteLength, 'bytes');
    } else {
      console.log('Unexpected content type:', contentType);
      const text = await response.text();
      console.log('Response body:', text);
    }
  } catch (error) {
    console.error('Network Error:', error);
  }
}

testYouDaoTTS(); 