import API from "./api"
import { parse } from 'node-html-parser';

const {
    dialogflow,
    BasicCard,
    Image,
} = require('actions-on-google')
const dialogApp = dialogflow();

dialogApp.intent('Quiz_Topic', async (conv) => {
    conv.data.topic = conv.parameters[`quiz-topic`];
    console.log("Topic received", conv.data.topic);
    conv.followup('quiz-question-next', {});
});

let newQuestion = async conv =>{
    let question = await API.getBest(null,0)
    console.log(question);
    conv.data.question = question[0];
    conv.followup('quiz-question', {
        question:question[0]
    });
}

dialogApp.intent('Quiz_Question_Next', newQuestion);
dialogApp.intent('Quiz_Answer - correct',conv=>{
    if(conv.parameters[`next`] == true){
        newQuestion(conv)
    }
});
dialogApp.intent('Quiz_Answer - incorrect', conv=>{
    if(conv.parameters[`next`] == true){
        newQuestion(conv)
    }
});



dialogApp.intent('Quiz_Answer', conv => {
    let htmlAnswer = parse(conv.data.question.body.answer);
    let images = htmlAnswer.querySelectorAll('img');
    let text = htmlAnswer.innerText;
    
    for(let image of images){
        htmlAnswer.removeChild(image);
    }
    conv.data.question.body.answer = text;
    conv.ask(text); // this Simple Response is necessary

    if(images){
        conv.ask(new BasicCard({
            image: new Image({
                url: images[0].getAttribute('src'), //url of your image.
                alt: images[0].getAttribute('alt'),
            }),
        }))
    }
    conv.ask("Did you get it right?"); // this Simple Response is necessary
})

dialogApp.intent('Quiz_Answer_Followup', conv => {
    conv.data.lastAnswer = 'correct';
    let correct = conv.parameters[`correct`];
    let followup = 'quiz-answer-correct';
    if(!correct) {
        followup = 'quiz-answer-incorrect';
        conv.data.lastAnswer = 'incorrect';
    }
    conv.followup(followup,{});
})

export default dialogApp;