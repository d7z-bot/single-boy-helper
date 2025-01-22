import {$, Context, Session} from "koishi";

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

export function InitDB(ctx: Context) {
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


export async function queryOnToday(ctx: Context, session: Session) {
  const today = new Date();
  let begin = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime()
  let end = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59).getTime()
  return ctx.database.select("masturbation").where(row =>
    $.and(
      $.eq(row.platform, session.platform),
      $.eq(row.user, session.userId),
      $.eq(row.guild, session.guildId),
      $.gt(row.time, begin), $.lt(row.time, end),)
  ).execute()
}

export async function checkPermissionPush(ctx: Context, session: Session, userid: string) {
  let data = await ctx.database.select("masturbationAuth").where(row =>
    $.and(
      $.eq(row.platform, session.platform),
      $.eq(row.guild, session.guildId),
      $.eq(row.user, userid),
      $.eq(row.helper, session.userId),
    )
  ).execute();
  if (data.length > 0) {
    await ctx.database.create('masturbation', {
      platform: session.platform,
      user: userid,
      helper: session.userId,
      time: session.timestamp,
      guild: session.guildId
    })
  }
  return data.length > 0;
}
