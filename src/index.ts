import { Context, Schema } from 'koishi'

export const name = 'single-boy-help'
export const inject = ['database']

export interface Config {
  single: Array<string>
}

export const Config: Schema<Config> = Schema.object({
  single: Schema.array(String).description('自我帮助触发词').required(false).default(['撸','🦌']),
})

export function apply(ctx: Context,config: Config) {
  ctx.on('message', msg => {
    if (config.single.indexOf(msg.content)){
      console.log(msg)
    }
  })
}
