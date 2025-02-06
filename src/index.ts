import {Context, h, Schema} from 'koishi'
import {HelperConfig, SingleBoyHelper} from "./helper";
import {parseCmdAt} from "./utils";
import {at} from "@satorijs/element";

export const name = 'single-boy-helper'
export const inject = ['database', 'ai']
  export const usage = `
## 一款简单易用的活跃群友气氛的软件 (🦌)

项目地址: https://github.com/d7z-bot/single-boy-helper
`;


export interface Config {
  // 自我帮助关键词
  help: Array<string>,
  // 帮助他人关键词
  force: Array<string>,
  // 绑定好友关键词
  bind: Array<string>,
  // 解绑好友关键词
  unbind: Array<string>,
  // 榜单
  rank: string,
  // 提示词配置
  config: HelperConfig
}

export const Config: Schema<Config> = Schema.object({
  help: Schema.array(String).description('帮助他人触发词').default(['🦌', '帮🦌']),
  force: Schema.array(String).description('强行帮助他人触发词').default(['强🦌']),
  bind: Schema.array(String).description('绑定好友关键词').default(['添加🦌友']),
  unbind: Schema.array(String).description('解绑好友关键词').default(['解除🦌友关系']),
  rank: Schema.string().description('查询榜单').default('今日🦌榜'),
  config: Schema.object({
    template: Schema.object({
      self: Schema.string().description('自我帮助')
        .role('textarea', {rows: [2, 4]})
        .default('成功帮自己撸了一次，现在已经撸了 {{ Count }} 次了'),
      other: Schema.string().description('帮助他人')
        .role('textarea', {rows: [2, 4]})
        .default('成功帮 {0} 撸了一次'),
      fail: Schema.string().description('帮助他人失败')
        .role('textarea', {rows: [2, 4]})
        .default('帮撸失败，你不是 {0} 的撸友'),
    }).description('提示词配置'),
  }).description('扩展配置')
})

export function apply(ctx: Context, config: Config) {
  let helper = new SingleBoyHelper(ctx, config.config);
  ctx.command("single-boy.masturbation").action(async (ctx) => {
    return at(ctx.session.userId) + await helper.Self(ctx.session)
  })
  ctx.command("single-boy.help <user:user>").action(async (ctx, user: string) => {
    if (user === "" || user === undefined) {
      return at(ctx.session.userId) + "参数错误"
    }
    let data = user.split(":");
    return at(ctx.session.userId) + await helper.Other(ctx.session, [data[1]])
  })
  ctx.command("single-boy.force-help <user:user>").action(async (ctx, user: string) => {
    if (user === "" || user === undefined) {
      return at(ctx.session.userId) + "参数错误"
    }
    let data = user.split(":");
    return at(ctx.session.userId) + await helper.Other(ctx.session, [data[1]], true)
  })

  ctx.command("single-boy.bind <user:user>").action(async (ctx, user: string) => {
    if (user === "" || user === undefined) {
      return at(ctx.session.userId) + "参数错误"
    }
    let data = user.split(":");
    return at(ctx.session.userId) + await helper.Bind(ctx.session, [data[1]])
  })
  ctx.command("single-boy.unbind <user:user>").action(async (ctx, user: string) => {
    if (user === "" || user === undefined) {
      return at(ctx.session.userId) + "参数错误"
    }
    let data = user.split(":");
    return at(ctx.session.userId) + await helper.Unbind(ctx.session, [data[1]])
  })
  ctx.command("single-boy.rank").action(async (ctx) => {
    return at(ctx.session.userId) + await helper.Rankings(ctx.session)
  })

  ctx.on('message', async (session) => {
    let exec = async function () {
      let result = parseCmdAt(session, config.help);
      if (result.ok) {
        if (result.data.length == 0) {
          return helper.Self(session)
        } else {
          return helper.Other(session, result.data)
        }
      }
      result = parseCmdAt(session, config.force);
      if (result.ok) {
        if (result.data.length == 0) {
          return helper.Self(session)
        } else {
          return helper.Other(session, result.data, true)
        }
      }
      result = parseCmdAt(session, config.bind);
      if (result.ok) {
        return helper.Bind(session, result.data);
      }
      result = parseCmdAt(session, config.unbind);
      if (result.ok) {
        return helper.Unbind(session, result.data);
      }
      if (session.content === config.rank) {
        return await helper.Rankings(session)
      }
      return Promise.any('')

    }
    const result = await exec();
    if (result !== '') {
      await session.send(h('at', {id: session.userId}) + ' ' + result)
    }
  })


}


