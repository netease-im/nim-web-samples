import { Layout, Menu, Typography } from 'antd';
import { ReactNode, useCallback, useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import { MenuItemWithRender, apiMenuItems } from '../../configs/apiMenu';

const { Sider, Content } = Layout;
const { Title } = Typography;

interface MenuItem {
  key: string;
  label: string;
  children?: MenuItem[];
  renderFn?: () => Promise<{ default: unknown }>;
}

interface APILayoutProps {
  children: ReactNode | ((selectedKey: string) => ReactNode);
  /** 菜单配置项，默认使用 apiMenuItems */
  menuItems?: MenuItemWithRender[];
  /** 路由基础路径，默认 '/apis' */
  baseRoute?: string;
  /** 默认选中的 key，默认 'NIMInit' */
  defaultKey?: string;
}

const APILayout = ({
  children,
  menuItems = apiMenuItems,
  baseRoute = '/apis',
  defaultKey = 'NIMInit',
}: APILayoutProps) => {
  const navigate = useNavigate();
  const location = useLocation();

  // 使用 useMemo 缓存路径解析结果
  const { service, method } = useMemo(() => {
    // 动态生成正则表达式以匹配不同的 baseRoute
    const escapedBaseRoute = baseRoute.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`^${escapedBaseRoute}/([^/]+)/([^/]+)$`);
    const match = location.pathname.match(regex);
    if (match) {
      return { service: match[1], method: match[2] };
    }
    return { service: null, method: null };
  }, [location.pathname, baseRoute]);

  // 使用 useMemo 缓存菜单项处理结果
  const { cleanedMenuItems, findParentKeysFn } = useMemo(() => {
    // 清理菜单项，移除自定义属性以避免传递到 DOM
    const cleanMenuItems = (
      items: MenuItem[]
    ): {
      key: string;
      label: string;
      children?: MenuItem[];
    }[] => {
      return items.map(item => {
        const { renderFn, ...cleanItem } = item;
        return {
          ...cleanItem,
          children: item.children ? cleanMenuItems(item.children) : undefined,
        };
      });
    };

    // 查找包含当前选中项的父级菜单
    const findParentKeys = (items: MenuItem[], targetKey: string): string[] => {
      const parentKeys: string[] = [];

      for (const item of items) {
        if (item.children) {
          // 检查子菜单中是否包含目标 key
          const hasTarget = item.children.some(child => child.key === targetKey);
          if (hasTarget) {
            parentKeys.push(item.key);
          }
          // 递归查找更深层的父级
          const deeperParents = findParentKeys(item.children, targetKey);
          parentKeys.push(...deeperParents);
        }
      }
      return parentKeys;
    };

    return {
      cleanedMenuItems: cleanMenuItems(menuItems),
      findParentKeysFn: findParentKeys,
    };
  }, [menuItems]);

  // 二级菜单选择 key
  const [selectedKey, setSelectedKey] = useState(() => {
    if (service && method) {
      return `${service}-${method}`;
    }
    return defaultKey;
  });

  // 一级菜单打开 key
  const [openKeys, setOpenKeys] = useState<string[]>(() => {
    if (service && method) {
      const currentKey = `${service}-${method}`;
      return findParentKeysFn(menuItems, currentKey);
    }
    return [];
  });

  // 当路由变化时更新选中状态
  useEffect(() => {
    if (service && method) {
      const currentKey = `${service}-${method}`;
      setSelectedKey(currentKey);
      setOpenKeys(findParentKeysFn(menuItems, currentKey));
    } else {
      setSelectedKey(defaultKey);
      setOpenKeys([]);
    }
  }, [service, method, findParentKeysFn, defaultKey]);

  const handleMenuClick = useCallback(
    ({ key }: { key: string }) => {
      if (key === defaultKey) {
        navigate(baseRoute);
        return;
      }

      // 解析 key 获取 service 和 method
      const [serviceKey, methodKey] = key.split('-');
      if (methodKey) {
        navigate(`${baseRoute}/${serviceKey}/${methodKey}`);
      }
    },
    [navigate, baseRoute, defaultKey]
  );

  const handleOpenChange = useCallback((keys: string[]) => {
    setOpenKeys(keys);
  }, []);

  // 清理菜单项，移除自定义属性以避免传递到 DOM
  const cleanMenuItems = (
    items: MenuItem[]
  ): {
    key: string;
    label: string;
    children?: MenuItem[];
  }[] => {
    return items.map(item => {
      const { renderFn, ...cleanItem } = item;
      return {
        ...cleanItem,
        children: item.children ? cleanMenuItems(item.children) : undefined,
      };
    });
  };

  // 使用 useMemo 缓存选中项的显示名称
  const selectedLabel = useMemo(() => {
    const findLabel = (items: MenuItem[], targetKey: string): string => {
      for (const item of items) {
        if (item.key === targetKey) return item.label;
        if (!item.children) continue;
        for (const child of item.children) {
          if (child.key === targetKey) return `${item.label} - ${child.label}`;
        }
      }
      return targetKey;
    };

    return findLabel(menuItems, selectedKey);
  }, [menuItems, selectedKey]);

  return (
    <Layout>
      <Layout
        style={{
          height: '100%',
          background: '#fff',
          borderRadius: '8px',
          display: 'flex',
        }}
      >
        <Sider
          width={320}
          style={{
            background: '#fff',
            borderRight: '1px solid #f0f0f0',
            textAlign: 'left',
          }}
        >
          <div
            style={{
              flex: 1,
              paddingTop: '24px',
              overflow: 'auto',
            }}
          >
            <Menu
              mode="inline"
              selectedKeys={[selectedKey]}
              openKeys={openKeys}
              style={{ borderRight: 0, minHeight: '100%' }}
              items={cleanedMenuItems}
              onClick={handleMenuClick}
              onOpenChange={handleOpenChange}
            />
          </div>
        </Sider>
        <Content style={{}}>
          <div style={{ padding: '24px 24px 0 24px', flexShrink: 0 }}>
            <Title level={4} style={{ marginTop: 0, marginBottom: '20px' }}>
              {selectedLabel}
            </Title>
          </div>
          <div
            style={{
              flex: 1,
              padding: '0 24px 24px 24px',
              overflow: 'auto',
            }}
          >
            {typeof children === 'function' ? children(selectedKey) : children}
          </div>
        </Content>
      </Layout>
    </Layout>
  );
};

export default APILayout;
