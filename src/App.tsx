import { Layout, Menu } from 'antd';
import { useEffect, useState } from 'react';
import { Link, Navigate, Route, HashRouter as Router, Routes } from 'react-router-dom';

import { apiRoutes } from '@/pages/APIs/route';
import { chatroomsRoutes } from '@/pages/ChatroomApis/route';

import './App.less';

const { Header, Content } = Layout;

function App() {
  const [current, setCurrent] = useState('apis');

  const menuItems = [
    {
      key: 'apis',
      label: <Link to="/apis">NIM API 示例</Link>,
    },
    {
      key: 'chatroomApis',
      label: <Link to="/chatroomApis">聊天室 API 示例</Link>,
    },
  ];

  useEffect(() => {
    const hash = window.location.hash;
    if (hash.startsWith('#/apis')) {
      setCurrent('apis');
    } else if (hash.startsWith('#/chatroomApis')) {
      setCurrent('chatroomApis');
    } else if (!hash || hash === '#/' || hash === '#') {
      setCurrent('apis');
    }
  }, []);

  return (
    <Router>
      <Layout style={{ position: 'relative', minHeight: '100vh' }}>
        <Header
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            background: '#fff',
            borderBottom: '1px solid #f0f0f0',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <img
              style={{ width: 28, height: 28, marginRight: 10 }}
              src="https://yx-web-nosdn.netease.im/common/526c6014b8139bfca69b6a5266fdc7ab/yunxindoc_logo.png"
              alt="logo"
            />
            <img
              style={{ width: 'auto', height: 28 }}
              src="https://yx-web-nosdn.netease.im/common/22b1a76874a24721be25a8da2f77dac4/yunxindoc_name.png"
              alt="logo-text"
            />
          </div>
          <Menu
            mode="horizontal"
            selectedKeys={[current]}
            items={menuItems}
            onClick={({ key }) => setCurrent(key)}
            style={{ flex: 1, justifyContent: 'flex-end' }}
          />
        </Header>
        <Content
          style={{
            position: 'relative',
            height: 'calc(100vh - 64px)',
          }}
        >
          <Routes>
            <Route path="/" element={<Navigate to="/apis" replace />} />
            {chatroomsRoutes}
            {apiRoutes}
          </Routes>
        </Content>
      </Layout>
    </Router>
  );
}

export default App;
