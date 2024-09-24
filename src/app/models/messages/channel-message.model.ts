export class Message {
    id: string;
    content: string;
    name: string;
    reactions: string[]; // Array für Reaktionen
    time: string;

    constructor(obj?: any) {
        this.id = obj && obj.id ? obj.id : '';
        this.content = obj && obj.content ? obj.content : '';
        this.name = obj && obj.name ? obj.name : '';
        this.reactions = obj && obj.reactions ? obj.reactions : [];
        this.time = obj && obj.time ? obj.time : '';
    }

    toJSON() {
        return {
            id: this.id,
            content: this.content,
            name: this.name,
            reactions: this.reactions,
            time: this.time
        };
    }
}