const axios = require('axios');
const crypto = require('crypto');

/**
 * 飞书消息推送服务
 */
class FeishuService {
  constructor() {
    this.webhook = process.env.FEISHU_WEBHOOK_URL || '';
  }

  /**
   * 发送设备报修通知
   * @param {Object} repairData 报修数据
   */
  async sendRepairNotification(repairData) {
    try {
      if (!this.webhook) {
        console.log('飞书Webhook URL未配置，跳过通知');
        return;
      }

      const message = {
        msg_type: "interactive",
        card: {
          config: { 
            wide_screen_mode: true,
            enable_forward: true
          },
          header: {
            title: {
              tag: "plain_text",
              content: "📋 设备报修通知"
            },
            template: "red"
          },
          elements: [
            {
              tag: "div",
              fields: [
                {
                  is_short: true,
                  text: {
                    tag: "lark_md",
                    content: "**设备名称**"
                  }
                },
                {
                  is_short: true,
                  text: {
                    tag: "lark_md",
                    content: repairData.equipment_name || '未知设备'
                  }
                },
                {
                  is_short: true,
                  text: {
                    tag: "lark_md",
                    content: "**报修内容**"
                  }
                },
                {
                  is_short: true,
                  text: {
                    tag: "lark_md",
                    content: repairData.description || '无描述'
                  }
                },
                {
                  is_short: true,
                  text: {
                    tag: "lark_md",
                    content: "**紧急程度**"
                  }
                },
                {
                  is_short: true,
                  text: {
                    tag: "lark_md",
                    content: `\`${repairData.priority || 一般}\``
                  }
                },
                {
                  is_short: true,
                  text: {
                    tag: "lark_md",
                    content: "**报修人**"
                  }
                },
                {
                  is_short: true,
                  text: {
                    tag: "lark_md",
                    content: repairData.requester_name || '未知用户'
                  }
                },
                {
                  is_short: true,
                  text: {
                    tag: "lark_md",
                    content: "**报修时间**"
                  }
                },
                {
                  is_short: true,
                  text: {
                    tag: "lark_md",
                    content: new Date(repairData.created_at).toLocaleString('zh-CN')
                  }
                }
              ]
            },
            {
              tag: "div",
              text: {
                tag: "lark_md",
                content: "---"
              }
            },
            {
              tag: "action",
              actions: [
                {
                  tag: "button",
                  text: {
                    tag: "plain_text",
                    content: "查看详情"
                  },
                  url: "101.43.126.159:8080",  // 系统访问地址
                  type: "default"
                }
              ]
            }
          ]
        }
      };

      const response = await axios.post(this.webhook, message, {
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 10000
      });

      if (response.data.code === 0) {
        console.log('飞书通知发送成功');
        return { success: true, message: '通知发送成功' };
      } else {
        console.error('飞书通知发送失败:', response.data);
        return { success: false, message: '通知发送失败' };
      }

    } catch (error) {
      console.error('飞书通知发送异常:', error.message);
      return { success: false, message: '通知发送异常' };
    }
  }

  /**
   * 发送维修完成通知
   * @param {Object} repairData 维修数据
   */
  async sendRepairCompletedNotification(repairData) {
    try {
      if (!this.webhook) {
        console.log('飞书Webhook URL未配置，跳过通知');
        return;
      }

      const message = {
        msg_type: "interactive",
        card: {
          config: { 
            wide_screen_mode: true,
            enable_forward: true
          },
          header: {
            title: {
              tag: "plain_text",
              content: "✅ 设备维修完成通知"
            },
            template: "green"
          },
          elements: [
            {
              tag: "div",
              fields: [
                {
                  is_short: true,
                  text: {
                    tag: "lark_md",
                    content: "**设备名称**"
                  }
                },
                {
                  is_short: true,
                  text: {
                    tag: "lark_md",
                    content: repairData.equipment_name || '未知设备'
                  }
                },
                {
                  is_short: true,
                  text: {
                    tag: "lark_md",
                    content: "**维修内容**"
                  }
                },
                {
                  is_short: true,
                  text: {
                    tag: "lark_md",
                    content: repairData.work_description || '无描述'
                  }
                },
                {
                  is_short: true,
                  text: {
                    tag: "lark_md",
                    content: "**维修人**"
                  }
                },
                {
                  is_short: true,
                  text: {
                    tag: "lark_md",
                    content: repairData.repairer_name || '未知维修员'
                  }
                },
                {
                  is_short: true,
                  text: {
                    tag: "lark_md",
                    content: "**完成时间**"
                  }
                },
                {
                  is_short: true,
                  text: {
                    tag: "lark_md",
                    content: new Date(repairData.repaired_at).toLocaleString('zh-CN')
                  }
                }
              ]
            }
          ]
        }
      };

      const response = await axios.post(this.webhook, message, {
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 10000
      });

      if (response.data.code === 0) {
        console.log('飞书维修完成通知发送成功');
        return { success: true, message: '通知发送成功' };
      } else {
        console.error('飞书维修完成通知发送失败:', response.data);
        return { success: false, message: '通知发送失败' };
      }

    } catch (error) {
      console.error('飞书维修完成通知发送异常:', error.message);
      return { success: false, message: '通知发送异常' };
    }
  }
}

module.exports = new FeishuService();