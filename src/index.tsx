import {Context, h, Schema} from 'koishi'
import {SingleBoyHelper} from "./helper";
import {parseCmdAt} from "./utils";

export const name = 'single-boy-help'
export const inject = ['database']


export interface Config {
  // 自我帮助关键词
  help: Array<string>,
  // 帮助他人关键词
  forceHelp: Array<string>,
  // 绑定好友关键词
  bind: Array<string>,
  // 解绑好友关键词
  unbind: Array<string>,
  // Ollama 地址
}

export const Config: Schema<Config> = Schema.object({
  help: Schema.array(String).description('帮助他人触发词').default(['🦌','帮🦌']),
  forceHelp: Schema.array(String).description('强行帮助他人触发词').default(['强🦌']),
  bind: Schema.array(String).description('绑定好友关键词').default(['添加🦌友']),
  unbind: Schema.array(String).description('解绑好友关键词').default(['解除🦌友关系']),
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
      result = parseCmdAt(session, config.forceHelp);
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
      if (session.content === '查询排行榜') {
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


