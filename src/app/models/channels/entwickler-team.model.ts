export class Channel {
  id: string;
  name: string;
  description: string;
  admin: string;
  chosen: boolean;
  openedThread: boolean;

  constructor(obj?: any) {
    this.id = obj && obj.id ? obj.id : '';
    this.name = obj && obj.name ? obj.name : '';
    this.description = obj && obj.description ? obj.description : '';
    this.admin = obj && obj.admin ? obj.admin : '';
    this.chosen = obj && obj.chosen ? obj.chosen : false;
    this.openedThread = obj && obj.openedThread ? obj.openedThread : false;
  }

  toJSON() {
    return {
      id: this.id,
      name: this.name,
      description: this.description,
      admin: this.admin,
      chosen: this.chosen,
      openedThread: this.openedThread
    };
  }
}
