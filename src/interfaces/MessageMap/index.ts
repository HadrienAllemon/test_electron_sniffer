import { JcvMessage } from "./JcvMessage";
import { JduMessage } from "./JduMessage";
import { JerMessage } from "./JerMessage";
import { JgdMessage } from "./JgdMessage";
import { JhrMessage } from "./JhrMessage";

export type MessageMap = {
    jhr: JhrMessage;
    jcv: JcvMessage;
    jgd: JgdMessage;
    jdu: JduMessage;
    jer: JerMessage;
    [key: string]: any; // default
};