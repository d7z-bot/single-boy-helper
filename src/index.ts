import {Context, h, Schema} from 'koishi'
import {SingleBoyHelper} from "./helper";
import {parseCmdAt} from "./utils";

export const name = 'single-boy-helper'
export const inject = ['database']
export const usage = `
## 一款简单易用的活跃群友气氛的软件 (🦌)

项目地址: https://github.com/d7z-team/single-boy-helper
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
}

export const Config: Schema<Config> = Schema.object({
  help: Schema.array(String).description('帮助他人触发词').default(['🦌','帮🦌']),
  force: Schema.array(String).description('强行帮助他人触发词').default(['强🦌']),
  bind: Schema.array(String).description('绑定好友关键词').default(['添加🦌友']),
  unbind: Schema.array(String).description('解绑好友关键词').default(['解除🦌友关系']),
  rank: Schema.string().description('查询榜单').default('今日🦌榜'),
})

export function apply(ctx: Context, config: Config) {
  let helper = new SingleBoyHelper(ctx);
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
    if (result !== ''){
      await session.send(h('at',{ id: session.userId })+' ' + result)
    }
  })


}


