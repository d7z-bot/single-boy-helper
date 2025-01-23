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
      return <>诶～才🦌{length}次就缴械投降啦？杂鱼♡ 杂鱼♡！连这点程度都撑不住，果然是小·垃·圾～</>
    } else if (length < 10) {
      return <>呜哇——居然🦌了{length}次？！（⊙ｏ⊙）超～厉害？不愧是♡精力怪兽♡！这么想被夸的话…就施舍你一句小·变·态～（戳脸）</>
    } else if (length < 15) {
      return <>哦呀～？才🦌{length}次就喊停啦？♪（歪头）嘴上说着没问题～其实已经虚～脱·了·吧？（突然凑近）呐、杂鱼能量这么快见底的话…只能颁给你「小·菜·鸡♡耐力勋章」啦！（吐舌）</>
    } else {
      return <>欸～～{length}次达成？！（✧ω✧）这就是传说中的『手·冲·冠·军·候·补·生♡』嘛！「恭喜这位虚♂不♂可♂耐の小·宇·宙·爆·发·魔·人～！」（拍手跺脚）</>
    }
  }

  async Other(session: Session, users: Array<string>, force: boolean = false): Promise<string> {
    if (users.length == 0) {
      return '帮🦌失败，请 at 你想帮的🦌友'
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
      fragment += '成功帮' +
      helps.map(help => h('at', {id: help})).join(",")
      fragment += '🦌了一发'
    }

    if (helpsErrs.length > 0) {
      fragment += '帮🦌失败，你不是' +
      helpsErrs.map(help => h('at', {id: help})).join(",")
      fragment += '的🦌友';
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




