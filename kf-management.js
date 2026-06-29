/**
 * 微信客服管理API
 * 基于企业微信客服接口 https://kf.weixin.qq.com/api/doc/path/94747
 */

export class KFManagement {
    constructor(corpid, corpsecret) {
        this.corpid = corpid;
        this.corpsecret = corpsecret;
        this.baseUrl = 'https://qyapi.weixin.qq.com/cgi-bin';
        this.accessToken = null;
        this.tokenExpiresAt = 0;
        this.timeout = 30000;
    }

    async getAccessToken() {
        if (this.accessToken && Date.now() < this.tokenExpiresAt) {
            return this.accessToken;
        }

        const url = `${this.baseUrl}/gettoken?corpid=${this.corpid}&corpsecret=${this.corpsecret}`;
        const response = await fetch(url, {
            method: 'GET',
            signal: AbortSignal.timeout(this.timeout),
        });

        if (!response.ok) {
            throw new Error(`获取access_token失败: ${response.statusText}`);
        }

        const result = await response.json();
        if (result.errcode !== 0) {
            throw new Error(`获取access_token失败: ${result.errmsg}`);
        }

        this.accessToken = result.access_token;
        this.tokenExpiresAt = Date.now() + 7200 * 1000;
        return this.accessToken;
    }

    async request(method, path, body = null) {
        const token = await this.getAccessToken();
        const url = `${this.baseUrl}${path}${path.includes('?') ? '&' : '?'}access_token=${token}`;

        const options = {
            method,
            signal: AbortSignal.timeout(this.timeout),
            headers: { 'Content-Type': 'application/json' },
        };

        if (body) {
            options.body = JSON.stringify(body);
        }

        const response = await fetch(url, options);
        if (!response.ok) {
            throw new Error(`请求失败: HTTP ${response.status}`);
        }

        const result = await response.json();
        if (result.errcode !== 0) {
            throw new Error(`API错误 [${result.errcode}]: ${result.errmsg}`);
        }

        const { errcode, errmsg, ...data } = result;
        return data;
    }

    // ==================== 客服帐号管理 ====================

    /**
     * 添加客服帐号
     * POST /kf/account/add
     */
    async addAccount(name, mediaId) {
        return this.request('POST', '/kf/account/add', {
            name,
            media_id: mediaId,
        });
    }

    /**
     * 删除客服帐号
     * POST /kf/account/del
     */
    async deleteAccount(openKfid) {
        return this.request('POST', '/kf/account/del', {
            open_kfid: openKfid,
        });
    }

    /**
     * 修改客服帐号
     * POST /kf/account/update
     */
    async updateAccount(openKfid, name, mediaId) {
        const body = { open_kfid: openKfid };
        if (name) body.name = name;
        if (mediaId) body.media_id = mediaId;
        return this.request('POST', '/kf/account/update', body);
    }

    /**
     * 获取客服帐号列表
     * GET /kf/account/list
     */
    async listAccounts(offset = 0, limit = 100) {
        return this.request('POST', '/kf/account/list', { offset, limit });
    }

    /**
     * 获取客服帐号链接
     * POST /kf/add_contact_way
     */
    async getContactWay(openKfid, scene) {
        return this.request('POST', '/kf/add_contact_way', {
            open_kfid: openKfid,
            scene,
        });
    }

    // ==================== 接待人员管理 ====================

    /**
     * 添加接待人员
     * POST /kf/servicer/add
     */
    async addServicer(openKfid, useridList = [], departmentIdList = []) {
        const body = { open_kfid: openKfid };
        if (useridList.length > 0) body.userid_list = useridList;
        if (departmentIdList.length > 0) body.department_id_list = departmentIdList;
        return this.request('POST', '/kf/servicer/add', body);
    }

    /**
     * 删除接待人员
     * POST /kf/servicer/del
     */
    async deleteServicer(openKfid, useridList = [], departmentIdList = []) {
        const body = { open_kfid: openKfid };
        if (useridList.length > 0) body.userid_list = useridList;
        if (departmentIdList.length > 0) body.department_id_list = departmentIdList;
        return this.request('POST', '/kf/servicer/del', body);
    }

    /**
     * 获取接待人员列表
     * GET /kf/servicer/list
     */
    async listServicers(openKfid) {
        return this.request('GET', `/kf/servicer/list?open_kfid=${openKfid}`);
    }

    // ==================== 会话管理 ====================

    /**
     * 获取会话状态
     * POST /kf/service_state/get
     */
    async getServiceState(openKfid, externalUserid) {
        return this.request('POST', '/kf/service_state/get', {
            open_kfid: openKfid,
            external_userid: externalUserid,
        });
    }

    /**
     * 变更会话状态
     * POST /kf/service_state/trans
     */
    async transServiceState(openKfid, externalUserid, serviceState, servicerUserid) {
        const body = {
            open_kfid: openKfid,
            external_userid: externalUserid,
            service_state: serviceState,
        };
        if (servicerUserid) body.servicer_userid = servicerUserid;
        return this.request('POST', '/kf/service_state/trans', body);
    }

    // ==================== 消息管理 ====================

    /**
     * 发送消息
     * POST /kf/send_msg
     */
    async sendMessage(touser, openKfid, msgtype, content) {
        const body = {
            touser,
            open_kfid: openKfid,
            msgtype,
            ...content,
        };
        return this.request('POST', '/kf/send_msg', body);
    }

    async sendTextMessage(touser, openKfid, text) {
        return this.sendMessage(touser, openKfid, 'text', {
            text: { content: text },
        });
    }

    async sendImageMessage(touser, openKfid, mediaId) {
        return this.sendMessage(touser, openKfid, 'image', {
            image: { media_id: mediaId },
        });
    }

    async sendVoiceMessage(touser, openKfid, mediaId) {
        return this.sendMessage(touser, openKfid, 'voice', {
            voice: { media_id: mediaId },
        });
    }

    async sendVideoMessage(touser, openKfid, mediaId) {
        return this.sendMessage(touser, openKfid, 'video', {
            video: { media_id: mediaId },
        });
    }

    async sendFileMessage(touser, openKfid, mediaId) {
        return this.sendMessage(touser, openKfid, 'file', {
            file: { media_id: mediaId },
        });
    }

    async sendLinkMessage(touser, openKfid, title, desc, url, thumbMediaId) {
        return this.sendMessage(touser, openKfid, 'link', {
            link: { title, desc, url, thumb_media_id: thumbMediaId },
        });
    }

    async sendMiniprogramMessage(touser, openKfid, appid, title, thumbMediaId, pagepath) {
        return this.sendMessage(touser, openKfid, 'miniprogram', {
            miniprogram: {
                appid,
                title,
                thumb_media_id: thumbMediaId,
                pagepath,
            },
        });
    }

    async sendMenuMessage(touser, openKfid, headContent, list, tailContent) {
        return this.sendMessage(touser, openKfid, 'msgmenu', {
            msgmenu: {
                head_content: headContent,
                list,
                tail_content: tailContent,
            },
        });
    }

    async sendLocationMessage(touser, openKfid, name, address, latitude, longitude) {
        return this.sendMessage(touser, openKfid, 'location', {
            location: { name, address, latitude, longitude },
        });
    }

    async sendWelcomeMsg(code, msgtype, content) {
        const body = { code, msgtype, ...content };
        return this.request('POST', '/kf/send_msg_on_event', body);
    }

    async recallMessage(msgid, open_kfid) {
        return this.request('POST', '/kf/recall_msg', { msgid, open_kfid });
    }

    async getMediaUrl(mediaId) {
        const token = await this.getAccessToken();
        return `${this.baseUrl}/media/get?access_token=${token}&media_id=${mediaId}`;
    }

    // ==================== 消息同步 ====================

    /**
     * 获取消息（同步消息）
     * POST /kf/sync_msg
     */
    async syncMessages(cursor, token, limit = 1000, voiceFormat = 0, openKfid) {
        const body = { limit, voice_format: voiceFormat };
        if (cursor) body.cursor = cursor;
        if (token) body.token = token;
        if (openKfid) body.open_kfid = openKfid;
        return this.request('POST', '/kf/sync_msg', body);
    }

    // ==================== 客户管理 ====================

    /**
     * 获取客户基本信息
     * POST /kf/customer/batchget
     */
    async batchGetCustomers(externalUseridList, needEnterSessionContext = 0) {
        return this.request('POST', '/kf/customer/batchget', {
            external_userid_list: externalUseridList,
            need_enter_session_context: needEnterSessionContext,
        });
    }

    // ==================== 「升级服务」配置 ====================

    /**
     * 获取配置的专员与客户群
     * GET /kf/customer/get_upgrade_service_config
     */
    async getUpgradeServiceConfig() {
        return this.request('GET', '/kf/customer/get_upgrade_service_config');
    }

    /**
     * 为客户升级为专员或客户群服务
     * POST /kf/customer/upgrade_service
     */
    async upgradeService(openKfid, externalUserid, type, member, groupChat) {
        const body = {
            open_kfid: openKfid,
            external_userid: externalUserid,
            type,
        };
        if (type === 1 && member) body.member = member;
        if (type === 2 && groupChat) body.groupchat = groupChat;
        return this.request('POST', '/kf/customer/upgrade_service', body);
    }

    /**
     * 为客户取消推荐
     * POST /kf/customer/cancel_upgrade_service
     */
    async cancelUpgradeService(openKfid, externalUserid) {
        return this.request('POST', '/kf/customer/cancel_upgrade_service', {
            open_kfid: openKfid,
            external_userid: externalUserid,
        });
    }

    // ==================== 统计管理 ====================

    /**
     * 获取「客服帐号统计」数据
     * POST /kf/get_corp_statistic
     */
    async getCorpStatistic(openKfid, startTime, endTime) {
        const body = { start_time: startTime, end_time: endTime };
        if (openKfid) body.open_kfid = openKfid;
        return this.request('POST', '/kf/get_corp_statistic', body);
    }

    /**
     * 获取「接待人员统计」数据
     * POST /kf/get_servicer_statistic
     */
    async getServicerStatistic(openKfid, servicerUserid, startTime, endTime) {
        const body = { start_time: startTime, end_time: endTime };
        if (openKfid) body.open_kfid = openKfid;
        if (servicerUserid) body.servicer_userid = servicerUserid;
        return this.request('POST', '/kf/get_servicer_statistic', body);
    }

    // ==================== 其他 ====================

    /**
     * 获取知识库列表
     * POST /kf/knowledge/list_group
     */
    async listKnowledgeGroups(cursor, limit = 100, groupId) {
        const body = { limit };
        if (cursor) body.cursor = cursor;
        if (groupId) body.group_id = groupId;
        return this.request('POST', '/kf/knowledge/list_group', body);
    }

    // ==================== 别名（兼容路由层调用） ====================

    async getCustomerInfo(externalUseridList, needEnterSessionContext = 0) {
        return this.batchGetCustomers(externalUseridList, needEnterSessionContext);
    }

    async getStatistics(openKfid, startTime, endTime) {
        return this.getCorpStatistic(openKfid, startTime, endTime);
    }
}
