import { nanoid } from 'nanoid';

export class User {
  user_id!: string;
  first_name!: string;
  last_name!: string;
  email!: string;
  image_file!: string;
  password!: string;
  online!: boolean;

  constructor(obj?: any) {
    this.user_id = obj ? obj.user_id || nanoid() : '';
    this.first_name = obj ? obj.first_name : '';
    this.last_name = obj ? obj.last_name : '';
    this.email = obj ? obj.email : '';
    this.image_file = obj ? obj.image_file : '';
    this.password = obj ? obj.password : '';
    this.online = obj ? obj.online : false;
  }

  public toObject() {
    return {
      user_id: this.user_id,
      first_name: this.first_name,
      last_name: this.last_name,
      email: this.email,
      password: this.password,
      image_file: this.image_file,
      online: this.online,
    };
  }
}
export class Message {
  message_id!: string;
  message_content!: string;
  send_date!: number;
  from_user!: string;
  to_user!: string;

  constructor(obj?: any) {
    this.message_id = obj ? obj.message_id || nanoid() : '';
    this.message_content = obj ? obj.message_content : '';
    this.send_date = obj ? obj.send_date || Date.now() : '';
    this.from_user = obj ? obj.from_user || '' : '';
    this.to_user = obj ? obj.to_user || '' : '';
  }

  public toObject(): object {
    return {
      message_id: this.message_id,
      message_content: this.message_content,
      send_date: this.send_date,
      from_user: this.from_user,
      to_user: this.to_user,
    };
  }
}
