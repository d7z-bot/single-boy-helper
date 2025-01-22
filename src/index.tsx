import {Context, Schema} from 'koishi'
import {SingleBoyHelper} from "./helper";
import {Ollama} from "ollama";
import {exportMd} from "./model";

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
  // Ollama 地址
  ollamaHost: string,
  // 使用的模型
  ollamaModel: string,
  // 提示词
  prompt: string
}

export const Config: Schema<Config> = Schema.object({
  self: Schema.array(String).description('自我帮助触发词').default(['🦌']),
  others: Schema.array(String).description('帮助他人触发词').default(['帮🦌']),
  bind: Schema.array(String).description('绑定好友关键词').default(['添加🦌友']),
  unbind: Schema.array(String).description('解绑好友关键词').default(['解除🦌友关系']),
  ollamaHost: Schema.string().description('ollama 地址').default('http://localhost:11434/').role('url'),
  ollamaModel: Schema.string().description('ollama 模型').default('gemma2:9b-instruct-q8_0'),
  prompt: Schema.string().collapse().description('提示词').default('').role('textarea',{ rows: [2, 4] }),
})

export function apply(ctx: Context, config: Config) {
  let helper = new SingleBoyHelper(ctx);
  helper.Self(config.self);
  helper.Others(config.others);
  helper.Bind(config.bind);
  const ollama = new Ollama({
    host: config.ollamaHost
  });

  ctx.on('message', async (message) => {
    const element = message.elements[0];
    if (message.elements.length >= 2 && element.type === 'at' && element.attrs.id === message.bot.user.id && message.elements[1].type === 'text') {
      const msg = message.elements[1].attrs.content as string;
      let resp = await ollama.chat({
        model: "deepseek-r1:14b",
        messages: [
          ...exportMd.messages,{
            role: 'user', content:msg,
          }
        ],
        stream: false,
      })
      await message.send(<><at id={message.userId}></at>{resp.message.content.split('</think>')[1].trim()}
        <br/><br/>消耗 {resp.eval_count} token
      </>)
    }
  })


}


