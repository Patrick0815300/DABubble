export interface User {
  user_id: string;
  firstName: string;
  lastName: string;
  email: string;
  image_file: string;
  password: string;
  online: boolean;
}

export interface Message {
  message_id: string;
  message_content: string;
  send_date: string;
  from_user: string;
  to_user: string;
}
