import {Context, Schema} from 'koishi'
import {SingleBoyHelper} from "./helper";

export const name = 'single-boy-help'
export const inject = ['database']


export interface Config {
  single: Array<string>
  multiple: Array<string>
}

export const Config: Schema<Config> = Schema.object({
  single: Schema.array(String).description('自我帮助触发词').required(false).default(['撸', '🦌']),
  multiple: Schema.array(String).description('帮助他人触发词').required(false).default(['帮撸', '帮🦌']),
})




export function apply(ctx: Context, config: Config) {
  let helper = new SingleBoyHelper(ctx,config.single,config.multiple);
  ctx.on('message', async (session) =>  await helper.Send(session))
}


