import 'dotenv/config';
import Openai from 'openai';

export class Gpt {

    constructor(
        private openai = new Openai({apiKey: process.env.OPENAI_API_KEY})
    ){}

    async chat(message: string, botName?: string) {
        const gptResponse = await this.openai.chat.completions.create({
            messages:[
                botName ? {
                    role: 'system',
                    content: `te llamas ${botName} y eres un asistente de estudio `
                } : 
                {
                    role: 'system',
                    content:'sabes todo sobre anime'
                },               
                {
                    role: 'system',
                    content:'responde de la manera mas puntual y corta posible'
                },                
                {
                    role: 'system',
                    content:'eres un asistente de estudio y tratas de ser lo mas preciso posible'
                }               
                ,
                {
                    role: 'user',
                    content: message || ''
                }
            ],
            
        model: 'gpt-3.5-turbo',});

        return gptResponse.choices[0].message.content;
    }

}