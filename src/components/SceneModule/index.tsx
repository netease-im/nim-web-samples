import { CodeOutlined, CopyOutlined, EyeInvisibleOutlined, UpOutlined } from '@ant-design/icons';

import { Button, Card, Divider, Tabs, Tooltip, message } from 'antd';
import React, { useState } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { prism } from 'react-syntax-highlighter/dist/esm/styles/prism';

import styles from './index.module.less';

interface SceneModuleProps {
  /** 模块标题 */
  title: string;
  /** 模块描述 */
  description?: string;
  /** 示例组件 */
  children: React.ReactNode;
  /** TypeScript 源码字符串 */
  tsCode: string;
  /** CSS 源码字符串 */
  cssCode?: string;
  /** 是否默认展开代码 */
  defaultCodeVisible?: boolean;
}

const SceneModule: React.FC<SceneModuleProps> = ({
  title,
  description,
  children,
  tsCode,
  cssCode,
  defaultCodeVisible = false,
}) => {
  const [codeVisible, setCodeVisible] = useState(defaultCodeVisible);
  const [activeTab, setActiveTab] = useState('ts');

  // 复制指定代码到剪贴板
  const handleCopyCode = async (code: string, type: string) => {
    try {
      await navigator.clipboard.writeText(code);
      message.success(`${type}代码已复制到剪贴板`);
    } catch (err) {
      message.error('复制失败，请手动复制');
    }
  };

  // 切换代码显示状态
  const toggleCodeVisible = () => {
    setCodeVisible(!codeVisible);
  };

  // 创建带复制按钮的代码块
  const createCodeBlock = (code: string, language: string, type: string) => (
    <div className={styles.codeBlock}>
      <div className={styles.copyButton}>
        <Tooltip title={`复制${type}代码`}>
          <CopyOutlined onClick={() => handleCopyCode(code, type)} />
        </Tooltip>
      </div>
      <SyntaxHighlighter
        language={language}
        style={{ ...prism }}
        customStyle={{
          backgroundColor: 'transparent',
          background: 'none',
          margin: 0,
          padding: '16px 24px',
        }}
        className={styles.syntaxHighlighter}
        showLineNumbers={false}
      >
        {code}
      </SyntaxHighlighter>
    </div>
  );

  // 准备Tabs数据
  const tabItems = [
    {
      key: 'ts',
      label: 'TypeScript',
      children: createCodeBlock(tsCode, 'tsx', 'TypeScript'),
    },
  ];

  // 如果有CSS代码，添加CSS标签页
  if (cssCode) {
    tabItems.push({
      key: 'css',
      label: 'CSS',
      children: createCodeBlock(cssCode, 'less', 'CSS'),
    });
  }

  return (
    <Card className={styles.sceneModule}>
      {/* 示例展示区域 */}
      <div className={styles.demoArea}>{children}</div>

      {/* 标题和描述区域 */}
      <div className={styles.header}>
        <Divider orientation="start">{title}</Divider>
        {description && <p className={styles.description}>{description}</p>}
      </div>

      {/* 操作按钮区域 */}
      <div className={styles.actionArea}>
        <Tooltip title={codeVisible ? '收起代码' : '显示代码'}>
          {codeVisible ? (
            <EyeInvisibleOutlined onClick={toggleCodeVisible} />
          ) : (
            <CodeOutlined onClick={toggleCodeVisible} />
          )}
        </Tooltip>
      </div>

      {/* 代码展示区域 - 使用Tabs */}
      {codeVisible && (
        <div className={styles.codeArea}>
          <Tabs
            activeKey={activeTab}
            onChange={setActiveTab}
            items={tabItems}
            size="small"
            className={styles.codeTabs}
            centered
          />

          {/* 收起代码按钮 */}
          <div className={styles.collapseButtonArea}>
            <Button
              type="text"
              size="small"
              icon={<UpOutlined />}
              onClick={toggleCodeVisible}
              className={styles.collapseButton}
            >
              收起代码
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
};

export default SceneModule;
