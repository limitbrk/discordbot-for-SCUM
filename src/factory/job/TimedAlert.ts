import { BaseMessageOptions, Client, roleMention, TextChannel } from "discord.js";
import { EmbedBuilderUtil, StringUtils } from "../../utils";
import { logger } from "../../Logger";

export class TimeAlert {
    private last_hour = "";
    private last_alert_msg = "";
    constructor(
        private channel: string, 
        private role: string
    ){}

    public checkTime(client: Client<boolean>, hour: string){
        if(this.last_hour === hour) return
        this.last_hour = hour
        if(hour === "23"){ // alert before 24
            this.alert(client)
        }
        if(hour === "24"){ // delete job when 24
            // TODO: Delete Message not work
            this.deleteBotMessage(client)
        }
    }

    private async alert(client: Client<boolean>){
        const deadline = new Date(Date.now() + 10*60*1000);
        const message = {
            content: roleMention(this.role),
            embeds: [EmbedBuilderUtil.trackalert(deadline)],
            components: []
        } as BaseMessageOptions
        ( client.channels.cache.get(this.channel) as TextChannel ).send(message)
            .then(msg => this.last_alert_msg == msg.id)
            .then(() => logger.info("Time alerted!"))
        
    }

    private async deleteBotMessage(client: Client<boolean>){
        if (StringUtils.isEmpty(this.last_alert_msg)) return
        ( client.channels.cache.get(this.channel) as TextChannel ).messages.delete(this.last_alert_msg)
            .then(() => logger.info("Alert deleted!"))
    }
}