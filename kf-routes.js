/**
 * 客服管理API路由处理
 */
import { KFManagement } from './kf-management.js';
import { ApiResponse } from './response.js';

export function createKFRouter(env) {
    const kf = new KFManagement(env.WECHAT_CORP_ID, env.WECHAT_KF_SECRET);
    return kf;
}

/**
 * 客服帐号管理路由
 */
export async function handleKFAccountList(env) {
    try {
        const kf = createKFRouter(env);
        const result = await kf.listAccounts();
        return ApiResponse.success(result, '获取客服帐号列表成功');
    } catch (error) {
        return ApiResponse.internalError('获取客服帐号列表失败', { error: error.message });
    }
}

export async function handleKFAccountAdd(request, env) {
    try {
        const body = await request.json();
        if (!body.name) {
            return ApiResponse.badRequest('缺少客服名称参数 name');
        }
        const kf = createKFRouter(env);
        const result = await kf.addAccount(body.name, body.media_id);
        return ApiResponse.success(result, '添加客服帐号成功');
    } catch (error) {
        return ApiResponse.internalError('添加客服帐号失败', { error: error.message });
    }
}

export async function handleKFAccountUpdate(request, env) {
    try {
        const body = await request.json();
        if (!body.open_kfid) {
            return ApiResponse.badRequest('缺少客服ID参数 open_kfid');
        }
        const kf = createKFRouter(env);
        const result = await kf.updateAccount(body.open_kfid, body.name, body.media_id);
        return ApiResponse.success(result, '修改客服帐号成功');
    } catch (error) {
        return ApiResponse.internalError('修改客服帐号失败', { error: error.message });
    }
}

export async function handleKFAccountDelete(request, env) {
    try {
        const body = await request.json();
        if (!body.open_kfid) {
            return ApiResponse.badRequest('缺少客服ID参数 open_kfid');
        }
        const kf = createKFRouter(env);
        const result = await kf.deleteAccount(body.open_kfid);
        return ApiResponse.success(result, '删除客服帐号成功');
    } catch (error) {
        return ApiResponse.internalError('删除客服帐号失败', { error: error.message });
    }
}

export async function handleKFContactWay(request, env) {
    try {
        const body = await request.json();
        if (!body.open_kfid || !body.scene) {
            return ApiResponse.badRequest('缺少参数 open_kfid 或 scene');
        }
        const kf = createKFRouter(env);
        const result = await kf.getContactWay(body.open_kfid, body.scene);
        return ApiResponse.success(result, '获取客服链接成功');
    } catch (error) {
        return ApiResponse.internalError('获取客服链接失败', { error: error.message });
    }
}

/**
 * 接待人员管理路由
 */
export async function handleKFServicerList(request, env) {
    try {
        const url = new URL(request.url);
        const openKfid = url.searchParams.get('open_kfid');
        if (!openKfid) {
            return ApiResponse.badRequest('缺少参数 open_kfid');
        }
        const kf = createKFRouter(env);
        const result = await kf.listServicers(openKfid);
        return ApiResponse.success(result, '获取接待人员列表成功');
    } catch (error) {
        return ApiResponse.internalError('获取接待人员列表失败', { error: error.message });
    }
}

export async function handleKFServicerAdd(request, env) {
    try {
        const body = await request.json();
        if (!body.open_kfid) {
            return ApiResponse.badRequest('缺少参数 open_kfid');
        }
        const kf = createKFRouter(env);
        const result = await kf.addServicer(body.open_kfid, body.userid_list || [], body.department_id_list || []);
        return ApiResponse.success(result, '添加接待人员成功');
    } catch (error) {
        return ApiResponse.internalError('添加接待人员失败', { error: error.message });
    }
}

export async function handleKFServicerDelete(request, env) {
    try {
        const body = await request.json();
        if (!body.open_kfid) {
            return ApiResponse.badRequest('缺少参数 open_kfid');
        }
        const kf = createKFRouter(env);
        const result = await kf.deleteServicer(body.open_kfid, body.userid_list || [], body.department_id_list || []);
        return ApiResponse.success(result, '删除接待人员成功');
    } catch (error) {
        return ApiResponse.internalError('删除接待人员失败', { error: error.message });
    }
}

/**
 * 会话管理路由
 */
export async function handleKFServiceState(request, env) {
    try {
        const body = await request.json();
        if (!body.open_kfid || !body.external_userid) {
            return ApiResponse.badRequest('缺少参数 open_kfid 或 external_userid');
        }
        const kf = createKFRouter(env);
        const result = await kf.getServiceState(body.open_kfid, body.external_userid);
        return ApiResponse.success(result, '获取会话状态成功');
    } catch (error) {
        return ApiResponse.internalError('获取会话状态失败', { error: error.message });
    }
}

export async function handleKFServiceStateTrans(request, env) {
    try {
        const body = await request.json();
        if (!body.open_kfid || !body.external_userid || body.service_state === undefined) {
            return ApiResponse.badRequest('缺少参数 open_kfid、external_userid 或 service_state');
        }
        const kf = createKFRouter(env);
        const result = await kf.transServiceState(
            body.open_kfid,
            body.external_userid,
            body.service_state,
            body.servicer_userid,
        );
        return ApiResponse.success(result, '变更会话状态成功');
    } catch (error) {
        return ApiResponse.internalError('变更会话状态失败', { error: error.message });
    }
}

/**
 * 消息发送路由
 */
export async function handleKFSendMessage(request, env) {
    try {
        const body = await request.json();
        if (!body.touser || !body.open_kfid || !body.msgtype) {
            return ApiResponse.badRequest('缺少参数 touser、open_kfid 或 msgtype');
        }
        const kf = createKFRouter(env);
        const { touser, open_kfid, msgtype, ...content } = body;
        const result = await kf.sendMessage(touser, open_kfid, msgtype, content);

        // 存储发送记录到 KV，供聊天窗口展示
        if (env.CONVERSATIONS && result.msgid) {
            const sentMsg = {
                msgid: result.msgid,
                open_kfid,
                external_userid: touser,
                send_time: Math.floor(Date.now() / 1000),
                origin: 5,
                msgtype,
                ...content,
            };
            const key = `__SENT_MSG__${open_kfid}__${touser}`;
            const existing = await env.CONVERSATIONS.get(key, 'json') || [];
            existing.push(sentMsg);
            // 只保留最近 200 条
            const trimmed = existing.slice(-200);
            await env.CONVERSATIONS.put(key, JSON.stringify(trimmed));
        }

        return ApiResponse.success(result, '发送消息成功');
    } catch (error) {
        return ApiResponse.internalError('发送消息失败', { error: error.message });
    }
}

/**
 * 同步消息路由
 */
export async function handleKFSyncMsg(request, env) {
    try {
        const body = await request.json();
        const kf = createKFRouter(env);
        const result = await kf.syncMessages(body.cursor, body.token, body.limit, body.voice_format, body.open_kfid);
        return ApiResponse.success(result, '同步消息成功');
    } catch (error) {
        return ApiResponse.internalError('同步消息失败', { error: error.message });
    }
}

/**
 * 获取已发送消息记录（从 KV 读取）
 */
export async function handleKFSentMessages(request, env) {
    try {
        const body = await request.json();
        if (!body.open_kfid || !body.external_userid) {
            return ApiResponse.badRequest('缺少参数 open_kfid 或 external_userid');
        }
        const key = `__SENT_MSG__${body.open_kfid}__${body.external_userid}`;
        const msgs = await env.CONVERSATIONS.get(key, 'json') || [];
        return ApiResponse.success({ msg_list: msgs });
    } catch (error) {
        return ApiResponse.internalError('获取发送记录失败', { error: error.message });
    }
}

/**
 * 获取客户信息路由
 */
export async function handleKFCustomerInfo(request, env) {
    try {
        const body = await request.json();
        if (!body.external_userid_list || !Array.isArray(body.external_userid_list)) {
            return ApiResponse.badRequest('缺少参数 external_userid_list（数组）');
        }
        const kf = createKFRouter(env);
        const result = await kf.getCustomerInfo(body.external_userid_list, body.need_enter_session_context);
        return ApiResponse.success(result, '获取客户信息成功');
    } catch (error) {
        return ApiResponse.internalError('获取客户信息失败', { error: error.message });
    }
}

/**
 * 获取统计数据路由
 */
export async function handleKFStatistics(request, env) {
    try {
        const body = await request.json();
        if (!body.open_kfid || !body.start_time || !body.end_time) {
            return ApiResponse.badRequest('缺少参数 open_kfid、start_time 或 end_time');
        }
        const kf = createKFRouter(env);
        const result = await kf.getStatistics(body.open_kfid, body.start_time, body.end_time);
        return ApiResponse.success(result, '获取统计数据成功');
    } catch (error) {
        return ApiResponse.internalError('获取统计数据失败', { error: error.message });
    }
}

export async function handleKFRecallMsg(request, env) {
    try {
        const body = await request.json();
        if (!body.msgid || !body.open_kfid) {
            return ApiResponse.badRequest('缺少参数 msgid 或 open_kfid');
        }
        const kf = createKFRouter(env);
        const result = await kf.recallMessage(body.msgid, body.open_kfid);
        return ApiResponse.success(result, '消息撤回成功');
    } catch (error) {
        return ApiResponse.internalError('消息撤回失败', { error: error.message });
    }
}

export async function handleKFMediaProxy(request, env) {
    try {
        const url = new URL(request.url);
        const mediaId = url.searchParams.get('media_id');
        if (!mediaId) {
            return ApiResponse.badRequest('缺少参数 media_id');
        }
        const kf = createKFRouter(env);
        const mediaUrl = await kf.getMediaUrl(mediaId);
        const resp = await fetch(mediaUrl);
        if (!resp.ok) {
            return ApiResponse.internalError('获取媒体文件失败');
        }
        return new Response(resp.body, {
            headers: {
                'Content-Type': resp.headers.get('Content-Type') || 'application/octet-stream',
                'Content-Disposition': resp.headers.get('Content-Disposition') || '',
                'Cache-Control': 'public, max-age=86400',
            },
        });
    } catch (error) {
        return ApiResponse.internalError('获取媒体文件失败', { error: error.message });
    }
}

export async function handleKFSendWelcomeMsg(request, env) {
    try {
        const body = await request.json();
        if (!body.code) {
            return ApiResponse.badRequest('缺少参数 code');
        }
        const kf = createKFRouter(env);
        const result = await kf.sendWelcomeMsg(body.code, body.msgtype, body);
        return ApiResponse.success(result, '欢迎语发送成功');
    } catch (error) {
        return ApiResponse.internalError('欢迎语发送失败', { error: error.message });
    }
}
