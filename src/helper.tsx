import {$, Context, h, Session} from "koishi";

declare module 'koishi' {
  interface Tables {
    masturbation: Masturbation,
    masturbationAuth: MasturbationAuth,
  }
}

interface Masturbation {
  id: number
  platform: string
  guild: string
  user: string // 用户
  helper: string // 帮助用户
  time: number
}

interface MasturbationAuth {
  id: number
  platform: string
  guild: string
  user: string
  helper: string
  time: number
}

export class SingleBoyHelper {
  private ctx: Context;
  private self: Array<string>
  private help: Array<string>

  constructor(ctx: Context, self: Array<string>, help: Array<string>) {
    this.ctx = ctx;
    this.self = self;
    this.help = help;
    ctx.model.extend('masturbation', {
      // 各字段的类型声明
      id: 'unsigned',
      platform: 'string',
      guild: 'string',
      user: 'string',
      helper: 'string',
      time: 'decimal',
    }, {
      primary: 'id',
      autoInc: true,
    })
    ctx.model.extend('masturbationAuth', {
      // 各字段的类型声明
      id: 'unsigned',
      platform: 'string',
      guild: 'string',
      user: 'string',
      helper: 'string',
      time: 'decimal',
    }, {
      primary: 'id',
      autoInc: true,
    })
  }

  async Send(session: Session) {
    if (this.self.indexOf(session.content) != -1) {
      await this.ctx.database.create('masturbation', {
        platform: session.platform,
        user: session.userId,
        time: session.timestamp,
        guild: session.guildId
      })
      await session.send(<>
        <at id={session.userId}/>
        今天才 🦌 了 {(await this.queryOnToday(session)).length} 次，真是杂鱼呢</>)
    } else {
      let helpOk = false
      session.elements.forEach(element => {
        if (element.type === 'text' && this.help.indexOf(element.attrs.content.trim()) != -1) {
          helpOk = true
        }
      })
      if (helpOk) {
        let helps:string[] = [];
        let helpsErrs:string[] = [];
        for (const element of session.elements) {
          if (element.type == 'at' && session.userId !== element.attrs.id && element.attrs.id !== session.bot.user.id) {
            if (await this.checkPermission(session, element.attrs.id)) {
              await this.ctx.database.create('masturbation', {
                platform: session.platform,
                user:  element.attrs.id,
                helper:session.userId,
                time: session.timestamp,
                guild: session.guildId
              })
              helps.push(element.attrs.id)
            }else {
              helpsErrs.push(element.attrs.id)
            }
          }
        }
        let fragment = ""
        if (helps.length > 0) {
          fragment+= '成功帮助';
          helps.forEach(help => {
            fragment += h('at',{id:help}) + ' '
          })
          fragment +='🦌了 '
        }
        if (helpsErrs.length > 0) {
          helpsErrs.forEach((helpErr) => {
            fragment += h('at',{id:helpErr}) + ' '
          })
          fragment+= '帮助失败，你没有 🦌 的权限';

        }
        await session.send(fragment)
      }

    }
  }

  private async queryOnToday(session: Session) {
    const today = new Date();
    let begin = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime()
    let end = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59).getTime()
    return this.ctx.database.select("masturbation").where(row =>
      $.and(
        $.eq(row.platform, session.platform),
        $.eq(row.user, session.userId),
        $.eq(row.guild, session.guildId),
        $.gt(row.time, begin), $.lt(row.time, end),)
    ).execute()
  }

  private async checkPermission(session: Session,userid:string) {
    let data = await this.ctx.database.select("masturbationAuth").where(row =>
      $.and(
        $.eq(row.platform, session.platform),
        $.eq(row.guild, session.guildId),
        $.eq(row.user, userid),
        $.eq(row.helper, session.userId),
      )
    ).execute();
    return data.length > 0;
  }
}



