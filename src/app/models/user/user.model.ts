export class User {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    id?: string;
    avatar: string;
    online: boolean;
    authenticated: boolean;

    constructor(obj?: any) {
        this.firstName = obj ? obj.firstName : '';
        this.lastName = obj ? obj.lastName : '';
        this.email = obj ? obj.email : '';
        this.password = obj ? obj.password : '';
        this.avatar = obj ? obj.avatar : '';
        this.online = obj ? obj.online : false;
        this.authenticated = obj ? obj.authenticated : false;
        this.id = obj ? obj.id : '';
    }

    toJSON() {
        return {
            firstName: this.firstName,
            lastName: this.lastName,
            email: this.email,
            avatar: this.avatar,
            online: this.online
        };
    }
}
