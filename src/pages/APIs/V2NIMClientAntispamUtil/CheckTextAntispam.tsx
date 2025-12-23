import { Button, Card, Form, Input, Space, message } from 'antd';
import { useState } from 'react';

import { to } from '@/utils/errorHandle';

import styles from '../nim.module.less';

const { TextArea } = Input;

interface CheckTextAntispamFormValues {
  text: string;
}

const defaultFormValues: CheckTextAntispamFormValues = {
  text: '这是一段需要检测的文本内容',
};

// 持久化存储最终执行的参数
const storageKey = `V2NIMClientAntispamUtil.checkTextAntispam`;

const CheckTextAntispamPage = () => {
  // 表单数据
  const [form] = Form.useForm();
  // 表单提交正在加载状态
  const [loading, setLoading] = useState(false);

  // 获取初始值
  const initialValues = { ...defaultFormValues };

  // 表单提交: 触发 API 调用
  const handleCheckTextAntispam = async (values: CheckTextAntispamFormValues) => {
    if (!(window.nim && window.nim.V2NIMLoginService.getLoginUser())) {
      message.error('NIM SDK 尚未初始化和登录');
      return;
    }

    const { text } = values;
    if (!text || text.trim() === '') {
      message.error('请输入要检测的文本内容');
      return;
    }

    setLoading(true);

    // 打印 API 入参
    console.log('API V2NIMClientAntispamUtil.checkTextAntispam execute, params:', text);

    // 执行 API
    const [error, result] = await to(() =>
      window.nim?.V2NIMClientAntispamUtil.checkTextAntispam(text)
    );
    if (error) {
      message.error(`客户端反垃圾检测失败: ${error.toString()}`);
      console.error('客户端反垃圾检测失败:', error.toString());
    } else {
      message.success('客户端反垃圾检测成功');
      console.log('客户端反垃圾检测结果:', result);
    }
    // finally
    setLoading(false);
    // 存储最终执行的参数
    localStorage.setItem(storageKey, JSON.stringify(values));
  };

  // 重置表单到默认值
  const handleReset = () => {
    // 清除 localStorage 中的数据
    localStorage.removeItem(storageKey);
    // 重置表单为默认值
    form.setFieldsValue(defaultFormValues);
    message.success('表单已重置为默认值');
  };

  // 输出调用语句到控制台
  const handleOutput = () => {
    const values = form.getFieldsValue();
    const { text } = values;

    if (!text || text.trim() === '') {
      message.error('请先输入要检测的文本内容');
      return;
    }

    const callStatement = `const result = await window.nim.V2NIMClientAntispamUtil.checkTextAntispam("${text}");`;

    console.log('V2NIMClientAntispamUtil.checkTextAntispam 调用语句:');
    console.log(callStatement);
    message.success('调用语句已输出到控制台');
  };

  return (
    <div className={styles.formContainer}>
      <Form
        form={form}
        labelCol={{ span: 4 }}
        wrapperCol={{ span: 20 }}
        onFinish={handleCheckTextAntispam}
        style={{ marginTop: 24 }}
        initialValues={initialValues}
      >
        <Form.Item key="api" label={null} className={styles.leftAligned}>
          <p className={styles.interfaceAPI}>
            <a
              href={`https://doc.yunxin.163.com/messaging2/references/web/typedoc/Latest/zh/v2/nim/index.html#V2NIMClientAntispamUtil`}
              target="_blank"
            >
              {storageKey}
            </a>
          </p>
        </Form.Item>

        <Form.Item
          label="检测文本"
          name="text"
          rules={[{ required: true, message: '请输入要检测的文本内容' }]}
          tooltip="输入需要进行客户端反垃圾检测的文本内容"
        >
          <TextArea rows={4} placeholder="请输入要检测的文本内容" />
        </Form.Item>

        <Form.Item label={null}>
          <Space size="middle" style={{ width: '100%' }}>
            <Button type="primary" htmlType="submit" loading={loading} style={{ flex: 1 }}>
              执行检测
            </Button>
            <Button type="default" onClick={handleReset}>
              重置
            </Button>
            <Button type="default" onClick={handleOutput}>
              输出调用语句
            </Button>
          </Space>
        </Form.Item>
      </Form>

      {/* 使用说明 */}
      <Card title="使用说明" style={{ marginTop: 16 }} size="small">
        <ul style={{ margin: 0, paddingLeft: 20 }}>
          <li>
            <strong>功能：</strong>检测文本内容是否包含敏感词
          </li>
          <li>
            <strong>参数：</strong>text (待检测的文本字符串)
          </li>
          <li>
            <strong>返回值：</strong>检测结果对象
          </li>
          <li>
            <strong>用途：</strong>客户端本地反垃圾检测，快速过滤敏感内容
          </li>
        </ul>
      </Card>

      {/* 重要提醒 */}
      <Card
        title="⚠️ 重要提醒"
        style={{
          marginTop: 16,
          border: '2px solid #ff9c6e',
          backgroundColor: '#fff7e6',
        }}
        size="small"
        styles={{
          header: {
            backgroundColor: '#ffe7ba',
            color: '#d46b08',
            fontWeight: 'bold',
          },
        }}
      >
        <ul style={{ margin: 0, paddingLeft: 20, color: '#d46b08' }}>
          <li>需在初始化时通过 V2NIMClientAntispamUtilConfig 启用客户端反垃圾功能</li>
          <li>若启用了客户端反垃圾功能, 那么发送消息时自动会得到应用</li>
          <li>客户端反垃圾仅做本地检测，不依赖网络请求</li>
          <li>敏感词库由云信服务端配置并下发</li>
        </ul>
      </Card>
    </div>
  );
};

export default CheckTextAntispamPage;
