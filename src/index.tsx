import {Context, Schema} from 'koishi'
import {SingleBoyHelper} from "./helper";

export const name = 'single-boy-help'
export const inject = ['database']


export interface Config {
  // 自我帮助关键词
  self: Array<string>,
  // 帮助他人关键词
  others: Array<string>,
  // 绑定好友关键词
  bind: Array<string>,
  // 解绑好友关键词
  unbind: Array<string>,
}

export const Config: Schema<Config> = Schema.object({
  self: Schema.array(String).description('自我帮助触发词').default(['🦌']),
  others: Schema.array(String).description('帮助他人触发词').default(['帮🦌']),
  bind: Schema.array(String).description('绑定好友关键词').default(['添加🦌友']),
  unbind: Schema.array(String).description('解绑好友关键词').default(['解除🦌友关系']),
})

export function apply(ctx: Context, config: Config) {
  ctx.command('single-boy-help.self')
}
