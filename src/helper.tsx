import {Context, h} from "koishi";
import {parseCmdAt} from "./utils";
import {checkPermissionPush, InitDB, queryOnToday} from "./db";


export class SingleBoyHelper {
  private readonly ctx: Context;

  constructor(ctx: Context) {
    this.ctx = ctx;
    InitDB(ctx)
  }

  Self(triggers: Array<string>) {
    this.ctx.on('message', async (session) => {
      if (triggers.indexOf(session.content.trim()) != -1) {
        await this.ctx.database.create('masturbation', {
          platform: session.platform,
          user: session.userId,
          time: session.timestamp,
          guild: session.guildId
        })

        const length = (await queryOnToday(this.ctx, session)).length;
        if (length < 5) {
          await session.send(<>
            <at id={session.userId}/>
            今天才🦌了 {length} 次，真是杂鱼呢</>)
        } else if (length < 10) {
          await session.send(<>
            <at id={session.userId}/>
            今天🦌了 {length} 次，真是精力充沛呢</>)
        } else if (length < 15) {
          await session.send(<>
            <at id={session.userId}/>
            今天已经🦌了{length}次了，休息一下吧</>)
        } else {
          await session.send(<>
            <at id={session.userId}/>
            已经🦌了{length} 次了，今天的🏆非你莫属哦</>)
        }
      }
    })
  }

  Others(triggers: Array<string>) {
    this.ctx.on('message', async (session) => {
      let users = parseCmdAt(session, triggers);
      if (!users.ok) {
        return;
      }
      if (users.data.length == 0) {
        await session.send(<>
          <at id={session.userId}/>
          帮🦌失败，请 at 你想帮🦌的好友</>)
        return;
      }
      let helps: string[] = [];
      let helpsErrs: string[] = [];
      for (let at of users.data) {
        if (await checkPermissionPush(this.ctx, session, at)) {
          helps.push(at)
        } else {
          helpsErrs.push(at)
        }
      }
      let fragment = '' + h('at', {id: session.userId})
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
      await session.send(fragment)
    })
  }


  Bind(triggers: Array<string>) {
    this.ctx.on('message', async (session) => {
      const users = parseCmdAt(session, triggers);
      if (!users.ok) {
        return;
      }
      if (users.data.length == 0) {
        return;
      }
      let fragment = '' + h('at', {id: session.userId}) + '已添加 '
      for (let at of users.data) {
        await this.ctx.database.create('masturbationAuth', {
          platform: session.platform,
          user: session.userId,
          helper: at,
          time: session.timestamp,
          guild: session.guildId
        })
        fragment += h('at', {id: at})
      }

      session.send(fragment + '为🦌友')
    })
  }


}



