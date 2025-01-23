import {$, Context, h, Session} from "koishi";
import {checkPermission, InitDB, queryToday} from "./db";


export class SingleBoyHelper {
  private readonly ctx: Context;

  constructor(ctx: Context) {
    this.ctx = ctx;
    InitDB(ctx)
  }

  async Self(session: Session): Promise<string> {
    await this.ctx.database.create('masturbation', {
      platform: session.platform,
      user: session.userId,
      time: session.timestamp,
      guild: session.guildId
    })
    const length = (await queryToday(this.ctx, session.platform, session.guildId, session.userId)).length;
    if (length < 5) {
      return <>才🦌{length}次就不行啦，真是杂鱼</>
    } else if (length < 10) {
      return <>已经🦌了{length}次啦，看来真是精力充沛呢</>
    } else if (length < 15) {
      return <>已经🦌了{length}次了，休息一下吧</>
    } else {
      return <>已经🦌了{length} 次了，今天的手冲冠军非你莫属哦</>
    }
  }

  async Other(session: Session, users: Array<string>, force: boolean = false): Promise<string> {
    if (users.length == 0) {
      return '帮🦌失败，请 at 你想帮🦌的好友'
    }
    let helps: string[] = [];
    let helpsErrs: string[] = [];
    for (let at of users) {
      if (force || await checkPermission(this.ctx, session, session.userId, at)) {
        helps.push(at)
        await this.ctx.database.create('masturbation', {
          platform: session.platform,
          user: at,
          helper: session.userId,
          time: session.timestamp,
          guild: session.guildId
        })
      } else {
        helpsErrs.push(at)
      }
    }
    let fragment = ''
    if (helps.length > 0) {
      fragment += '成功帮助';
      helps.forEach(help => {
        fragment += h('at', {id: help}) + ' '
      })
      fragment += '🦌了 '
    }
    if (helpsErrs.length > 0) {
      fragment += '帮🦌失败，你没有 🦌'
      helpsErrs.forEach((helpErr) => {
        fragment += h('at', {id: helpErr}) + ' '
      })
      fragment += '的权限';
    }
    return fragment
  }


  async Bind(session: Session, users: Array<string>): Promise<string> {
    if (users.length == 0) {
      return '添加失败，请 at 你想绑定的🦌友';
    }
    let fragment = '已添加'
    for (let at of users) {
      if (!await checkPermission(this.ctx, session,  at,session.userId)) {
        await this.ctx.database.create('masturbationAuth', {
          platform: session.platform,
          user: session.userId,
          helper: at,
          time: session.timestamp,
          guild: session.guildId
        })
        fragment += h('at', {id: at})
      }
    }
    return fragment + '为🦌友'
  }

  async Unbind(session: Session, users: Array<string>) {
    if (users.length == 0) {
      return '解绑失败，请 at 你想解绑的🦌友';
    }
    let res = []
    for (const user of users) {
      let result = await this.ctx.database.remove('masturbationAuth', (row) => {
        return $.and(
          $.eq(row.platform, session.platform),
          $.eq(row.guild, session.guildId),
          $.eq(row.user, session.userId),
          $.eq(row.helper, user)
        )
      })
      if (result.matched  > 0){
        res.push(h('at', {id: user}))
      }
    }
    if (res.length == 0){
      return '你们之间不是🦌友哦'
    }
    return '已解除' + res.join(',') + '的🦌友关系'
  }
  async Rankings(session: Session) {
    const today = new Date();
    let begin = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime()
    const result = await this.ctx.database.select('masturbation')
      .where(row =>
        $.and(
          $.eq(row.platform, session.platform),
          $.eq(row.guild, session.guildId),
          $.gt(row.time, begin))
      ).groupBy('user',{
        count: row => $.count(row.id)
      }).orderBy('count', 'desc').execute();


    if(result.length == 0){
      return "今天没有人🦌哦，欢迎献出你的第一次捏"
    }
    let res =`\n今日🦌友排行榜\n`
    for (let i = 0; i < result.length; i++) {
      let item = result[i]
      const user = await session.bot.getGuildMember(session.guildId,item.user );
      let userName = user.nick;
      if(userName === ''){
        userName = user.user.name
      }
      res += `\n${userName}    ${item.count} 次`
    }
    res+='\n\n'
    return res
  }
}




