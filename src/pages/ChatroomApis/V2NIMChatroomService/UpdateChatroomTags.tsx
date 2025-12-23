import { Button, Card, Form, Input, Space, Switch, Tag, message } from 'antd';
import { V2NIMChatroomtagsUpdateParams } from 'nim-web-sdk-ng/dist/v2/CHATROOM_BROWSER_SDK/V2NIMChatroomInfoService';
import { useEffect, useState } from 'react';

import { to } from '@/utils/errorHandle';

const { TextArea } = Input;

interface UpdateChatroomTagsFormValues {
  tagsInput: string;
  notifyTargetTags?: string;
  notificationEnabled: boolean;
  notificationExtension?: string;
}

const defaultFormValues: UpdateChatroomTagsFormValues = {
  tagsInput: '',
  notifyTargetTags: '',
  notificationEnabled: true,
  notificationExtension: '',
};

// 持久化存储key
const storageKey = `V2NIMChatroomService.updateChatroomTags`;

const UpdateChatroomTagsPage = () => {
  const [form] = Form.useForm<UpdateChatroomTagsFormValues>();
  const [loading, setLoading] = useState(false);
  const [tagsList, setTagsList] = useState<string[]>([]);

  // 初始化时从 localStorage 加载数据
  useEffect(() => {
    try {
      const cachedValues = localStorage.getItem(storageKey);
      if (cachedValues) {
        const parsed = JSON.parse(cachedValues);
        form.setFieldsValue(parsed);

        // 恢复标签列表
        if (parsed.tagsInput) {
          const tags = parsed.tagsInput
            .split(',')
            .map((t: string) => t.trim())
            .filter(Boolean);
          setTagsList(tags);
        }
      }
    } catch (error) {
      console.warn('加载缓存配置失败:', error);
    }
  }, [form]);

  // 添加标签
  const handleAddTag = () => {
    const tagsInput = form.getFieldValue('tagsInput');
    if (!tagsInput?.trim()) {
      message.warning('请输入标签内容');
      return;
    }

    const newTags = tagsInput
      .split(',')
      .map((t: string) => t.trim())
      .filter(Boolean);
    const uniqueTags = Array.from(new Set([...tagsList, ...newTags]));

    if (uniqueTags.length > 10) {
      message.error('最多支持设置 10 个标签');
      return;
    }

    // 检查每个标签长度
    const invalidTag = uniqueTags.find(tag => tag.length > 32);
    if (invalidTag) {
      message.error(`标签 "${invalidTag}" 长度超过 32 个字符`);
      return;
    }

    setTagsList(uniqueTags);
    form.setFieldsValue({ tagsInput: '' });
    message.success(`已添加 ${newTags.length} 个标签`);
  };

  // 移除标签
  const handleRemoveTag = (tagToRemove: string) => {
    setTagsList(tagsList.filter(tag => tag !== tagToRemove));
    message.success('标签已移除');
  };

  // 清空所有标签
  const handleClearTags = () => {
    setTagsList([]);
    message.success('已清空所有标签');
  };

  // 表单提交: 触发 API 调用
  const handleUpdateChatroomTags = async (values: UpdateChatroomTagsFormValues) => {
    if (!(window.chatroomV2 && window.chatroomV2.getChatroomInfo())) {
      message.error('尚未初始化或登录');
      return;
    }

    const { notifyTargetTags, notificationEnabled, notificationExtension } = values;

    // 至少需要设置一个字段
    if (tagsList.length === 0 && !notifyTargetTags?.trim()) {
      message.error('至少需要设置标签列表或通知目标标签中的一个');
      return;
    }

    setLoading(true);

    // 构建更新参数
    const updateParams: V2NIMChatroomtagsUpdateParams = {
      notificationEnabled,
    };

    if (tagsList.length > 0) {
      updateParams.tags = tagsList;
    }

    if (notifyTargetTags?.trim()) {
      updateParams.notifyTargetTags = notifyTargetTags.trim();
    }

    if (notificationExtension?.trim()) {
      updateParams.notificationExtension = notificationExtension.trim();
    }

    // 打印 API 入参
    console.log(
      'API chatroomV2.V2NIMChatroomService.updateChatroomTags execute, params:',
      updateParams
    );

    // 执行 API
    const [error] = await to(() =>
      window.chatroomV2?.V2NIMChatroomService.updateChatroomTags(updateParams)
    );

    setLoading(false);

    if (error) {
      message.error(`更新聊天室标签失败: ${error.toString()}`);
      console.error('更新聊天室标签失败:', error.toString());
      return;
    }

    message.success('更新聊天室标签成功');
    console.log('更新聊天室标签成功');

    // 存储最终执行的参数
    const storageData = {
      ...values,
      tagsInput: tagsList.join(', '),
    };
    localStorage.setItem(storageKey, JSON.stringify(storageData));
  };

  // 重置表单到默认值
  const handleReset = () => {
    localStorage.removeItem(storageKey);
    form.setFieldsValue(defaultFormValues);
    setTagsList([]);
    message.success('表单已重置为默认值');
  };

  // 输出调用语句到控制台
  const handleOutput = () => {
    const values = form.getFieldsValue();
    const { notifyTargetTags, notificationEnabled, notificationExtension } = values;

    // 构建参数对象
    const updateParams: V2NIMChatroomtagsUpdateParams = {
      notificationEnabled,
    };

    if (tagsList.length > 0) {
      updateParams.tags = tagsList;
    }

    if (notifyTargetTags?.trim()) {
      updateParams.notifyTargetTags = notifyTargetTags.trim();
    }

    if (notificationExtension?.trim()) {
      updateParams.notificationExtension = notificationExtension.trim();
    }

    const callStatement = `await window.chatroomV2.V2NIMChatroomService.updateChatroomTags(${JSON.stringify(updateParams, null, 2)});`;

    console.log('V2NIMChatroomService.updateChatroomTags 调用语句:');
    console.log(callStatement);
    message.success('调用语句已输出到控制台');
  };

  return (
    <div style={{ padding: '24px' }}>
      <Form
        form={form}
        labelCol={{ span: 5 }}
        wrapperCol={{ span: 19 }}
        onFinish={handleUpdateChatroomTags}
        initialValues={defaultFormValues}
      >
        <Form.Item key="api" label={null}>
          <p style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: 0 }}>
            <a
              href="https://doc.yunxin.163.com/messaging2/client-apis/DQyODIyODI#updateChatroomTags"
              target="_blank"
            >
              {storageKey}
            </a>
          </p>
        </Form.Item>

        <Form.Item
          label="标签列表"
          tooltip="用于标识本次登录所属标签，最多 10 个，每个标签最多 32 个字符"
        >
          <Space direction="vertical" style={{ width: '100%' }}>
            <Space.Compact style={{ width: '100%' }}>
              <Form.Item name="tagsInput" noStyle>
                <Input placeholder="输入标签，多个用逗号分隔，如: tag1, tag2" />
              </Form.Item>
              <Button type="primary" onClick={handleAddTag}>
                添加标签
              </Button>
            </Space.Compact>

            {tagsList.length > 0 && (
              <div style={{ marginTop: 8 }}>
                <Space wrap>
                  {tagsList.map(tag => (
                    <Tag key={tag} closable onClose={() => handleRemoveTag(tag)} color="blue">
                      {tag}
                    </Tag>
                  ))}
                </Space>
                <Button
                  type="link"
                  size="small"
                  danger
                  onClick={handleClearTags}
                  style={{ marginTop: 8 }}
                >
                  清空所有标签
                </Button>
                <div style={{ marginTop: 8, color: '#666', fontSize: '12px' }}>
                  当前已添加 {tagsList.length} 个标签（最多 10 个）
                </div>
              </div>
            )}
          </Space>
        </Form.Item>

        <Form.Item
          label="通知目标标签"
          name="notifyTargetTags"
          tooltip="指定登录/登出聊天室通知广播的标签用户，标签表达式"
        >
          <TextArea rows={2} placeholder='请输入标签表达式，如: {"tag": "tag1"}' />
        </Form.Item>

        <Form.Item
          label="通知成员"
          name="notificationEnabled"
          valuePropName="checked"
          tooltip="是否通知聊天室内成员"
        >
          <Switch checkedChildren="开启" unCheckedChildren="关闭" />
        </Form.Item>

        <Form.Item
          label="通知扩展"
          name="notificationExtension"
          tooltip="本次操作生成的通知中的扩展字段"
        >
          <TextArea rows={2} placeholder="请输入通知扩展字段" />
        </Form.Item>

        <Form.Item wrapperCol={{ offset: 5, span: 19 }}>
          <Space size="middle">
            <Button type="primary" htmlType="submit" loading={loading}>
              更新聊天室标签
            </Button>
            <Button onClick={handleReset}>重置</Button>
            <Button onClick={handleOutput}>输出调用语句</Button>
          </Space>
        </Form.Item>
      </Form>

      {/* 使用说明 */}
      <Card title="使用说明" style={{ marginTop: 16 }} size="small">
        <ul style={{ margin: 0, paddingLeft: 20 }}>
          <li>
            <strong>功能：</strong>批量更新聊天室标签信息
          </li>
          <li>
            <strong>参数：</strong>updateParams (标签更新参数对象)
          </li>
          <li>
            <strong>必填字段：</strong>tags、notifyTargetTags 至少填一个
          </li>
          <li>
            <strong>标签限制：</strong>最多 10 个标签，每个标签最多 32 个字符
          </li>
          <li>
            <strong>回调：</strong>更新成功后触发 onChatroomTagsUpdated 事件
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
          <li>至少需要设置 tags 或 notifyTargetTags 中的一个</li>
          <li>同一个长连接最多支持设置 10 个标签，每个标签最多 32 个字符</li>
          <li>调用前请确保指定标签存在</li>
          <li>更新成功后，聊天室内所有成员会收到 onChatroomTagsUpdated 回调</li>
          <li>如果开启通知，聊天室内成员还会收到类型为 TAGS_UPDATE 的通知消息</li>
          <li>修改聊天室用户的标签后会通知被修改人的所有在线端，并广播通知聊天室内所有用户</li>
        </ul>
      </Card>
    </div>
  );
};

export default UpdateChatroomTagsPage;
