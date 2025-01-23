import {Session} from "koishi";

export class Result<T> {
  data: T
  ok: boolean = false

  constructor(success: T) {
    this.data = success;
    if (success != null) {
      this.ok = true;
    }
  }
}

export function parseCmdAt(session: Session, cmd: Array<string>) {
  let result: string[] = []
  let helpOk = false
  session.elements.forEach(element => {
    if (element.type === 'text') {
      const text = element.attrs.content.trim();
      if (cmd.indexOf(text) != -1) {
        helpOk = true
      } else {
        if (text.length > 0) {
          helpOk = false
        }
      }
    }
  })
  if (!helpOk) {
    return new Result<string[]>(null)
  }
  for (const element of session.elements) {
    if (element.type === 'at' && session.userId !== element.attrs.id) {
      result.push(element.attrs.id)
    }
  }
  return new Result<string[]>(result)
}
