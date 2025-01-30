// select elements
let quizDetails = document.querySelector(".quiz-details");
let quizLists = quizDetails.querySelectorAll(".menu select");
let startButton = quizDetails.querySelector("#start");
let countSpan = document.querySelector(".count span");
let bulletsContainer = document.querySelector(".bullets .spans");
let quizContainer = document.querySelector(".quiz-app");
let questionArea = document.querySelector(".quiz-area");
let answersArea = document.querySelector(".answers-area");
let submitButton = document.querySelector(".submit-button");
let resultContainer = document.querySelector(".results");
let resultScore = resultContainer.querySelectorAll(".score span");
let circularProgress = document.querySelector(".circular-progress");
let progressValue = document.querySelector(".circular-progress span");
let feedback = document.querySelector(".feedback");
let countDown = document.querySelector(".countdown");
let categorySpan = document.querySelector(".category span");

// show loading animation before displying quiz details
setTimeout(() => {
    document.querySelector(".loading").style.display = "none";
    quizDetails.style.display = "block";
}, 3000)    


// counters
let currentIndex = 0;
let correctAnswers = 0;
let currentBullet = 0;
let timeInterval;

// manage quiz details
let categoryIndex = parseInt(quizLists[0].value);
let noOfQuestions = parseInt(quizLists[1].value);
let difficultyIndex = parseInt(quizLists[2].value);
let timer = parseInt(quizLists[3].value);
let categoryName;

quizLists.forEach((menu, index) => {
    menu.addEventListener("change", function(){
        categoryIndex = parseInt(quizLists[0].value);
        noOfQuestions = parseInt(quizLists[1].value);
        difficultyIndex = parseInt(quizLists[2].value);
        timer = parseInt(quizLists[3].value);  
        categoryName = categoryIndex===0?"Programming":categoryIndex===1?"Technology":categoryIndex===2?"Sports":"Mathematics";
        categorySpan.innerHTML = categoryName;
    })
});


// manage questions 
function getQuestions() {
    let myRequest = new XMLHttpRequest();
    
    myRequest.onreadystatechange = function() {
        if(this.readyState === 4 && this.status === 200){
            let questionsObj = JSON.parse(this.responseText);
            let category = questionsObj[categoryIndex];
            let difficultyLevel = category.levels[difficultyIndex];
            let questions = difficultyLevel.questions;

            // let qCount = questionsObj.length;
            let qCount = noOfQuestions;
    
            // create bullets and set the question count
            createBullets(qCount);

            // shuffle questions
            shuffleArr(questions);

            // add questionn data
            addQuesionData(questions[currentIndex], qCount);
            
            // Clear any existing interval, avoid adding multiple timers
            // if(timeInterval){
            //     clearInterval(timeInterval);
            // }
            setTimer(qCount);

            submitButton.onclick = () => {
                let correctAnswer = questions[currentIndex].correct_answer;
                currentIndex++;
                checkAnswer(correctAnswer, qCount);
                addQuesionData(questions[currentIndex], qCount);
                updateBullets(qCount);
                if(currentIndex === qCount){
                    showResult(qCount);
                    clearInterval(timeInterval);
                }
            }
        }
    }

    myRequest.open("GET", "html_questions.json", true);
    myRequest.send();
}


function loading() {
    setTimeout(() => {
        document.querySelector(".loading").style.display = "flex";
    },1000)        
    setTimeout(() => {
        document.querySelector(".loading").style.display = "none";
    },4000)        
}

// start a quiz
startButton.onclick = () => {
    quizDetails.style.display = "none";
    loading();
    setTimeout(() => {
        quizContainer.style.display = "block";
    }, 5000);
    setTimeout(() => {
        getQuestions();        
    }, 7000);
}


// shuffle array
function shuffleArr(questions){
    let random = 0;
    let temp = "";
    // start from the last element and shuffle backward
    for(let i = questions.length - 1 ; i > 0 ; i--){
        // generate a random index from 0 to i
        random = Math.floor(Math.random() *  (i+1));
        temp = questions[i];
        questions[i] = questions[random];
        questions[random] = temp;
    }
}


function createBullets(num) {
    bulletsContainer.innerHTML = "";
    countSpan.innerHTML = num;
    // create spans
    for(let i=0 ; i<num ; i++) {
        let bullet = document.createElement("span");
        if(i === 0){
            bullet.className = "done";
        }
        bulletsContainer.appendChild(bullet);
    }
}

function addQuesionData(questionObj, count) {
    questionArea.innerHTML = "";
    answersArea.innerHTML = "";            
    if(currentIndex < count) {
        // create h2 for question title
        let questionTitle = document.createElement("h2");
        let questionText = document.createTextNode(questionObj.title);
        questionTitle.appendChild(questionText);
        questionArea.appendChild(questionTitle);


        // create the answers
        for(let i=1 ; i<=4 ; i++){ 
            let divAnswer = document.createElement("div");
            divAnswer.className = 'answer';
        
            let radioButton = document.createElement(`input`);
            radioButton.type = "radio";
            radioButton.name = "question";
            radioButton.id = `answer_${i}`;
            radioButton.dataset.answer = questionObj[`option_${i}`];

            if(i === 1){
                radioButton.checked = true;
            }

            let label = document.createElement("label");
            let labelText =document.createTextNode(questionObj[`option_${i}`]);
            label.appendChild(labelText);
            label.htmlFor = `answer_${i}`;

            divAnswer.appendChild(radioButton);
            divAnswer.appendChild(label);

            divAnswer.addEventListener("click", () => {
                radioButton.checked = true;
            })
            answersArea.appendChild(divAnswer);
        }
    }
}

function checkAnswer(correctAnswer, count) {
    let options = document.getElementsByName("question");
    let theChoosenAnswer;
    options.forEach((option)=>{
        if(option.checked){
            theChoosenAnswer = option.dataset.answer;
        }
    })
    if(theChoosenAnswer === correctAnswer){
        correctAnswers++;
    }
}


// first version
function updateBullets(count) {
    currentBullet++;
    if(currentBullet < count){
        let spans = bulletsContainer.querySelectorAll("span")  
        spans[currentBullet].classList.add("done");    
    }
}

// second version
// function updateBullets() {
//     let spans = bulletsContainer.querySelectorAll("span")  
//     spans.forEach((span, index) => {
//         if(currentIndex === index){
//             spans[index].classList.add("done");            
//         }
//     })
// }

function showResult(count){
        quizContainer.style.display = "none";   
        circularProgress.style.background = `conic-gradient(#700c5a 0deg, rgba(255, 255, 255, .1) 0deg)`;
        progressValue.innerHTML = `0%`      
        feedback.innerHTML = "";
        setTimeout(() => {
            resultContainer.style.display = "flex";
            resultScore[0].innerHTML = correctAnswers;
            resultScore[1].innerHTML = count;
        },500)
        setTimeout(() => {
            updateProgress(count);
        },2500)
    
}

function updateProgress(count){
    if(correctAnswers <= 0){
        circularProgress.style.background = `conic-gradient(#700c5a 0deg, rgba(255, 255, 255, .1) 0deg)`;
        progressValue.innerHTML = `0%`      
        feedback.innerHTML = "Don't give up! Practice makes perfect.";      
        return;
    }
    
    let startValue = 0;
    let endValue = Math.round((correctAnswers / count) * 100);
    let progressInterval = setInterval(() => {
        startValue++;
        circularProgress.style.background = `conic-gradient(#700c5a ${startValue * 3.6}deg, rgba(255, 255, 255, .1) 0deg)`;
        progressValue.innerHTML = `${startValue}%`            
        if(startValue === endValue){
            clearInterval(progressInterval);
            feedbackMessage(count);
        }
    },20);
}


function feedbackMessage(count) {
    let percentage = (correctAnswers / count) * 100;
    let message = "";
    if(percentage <= 30){
        message = "Don't give up! Practice makes perfect.";
    }   
    else if(percentage <= 60){
        message = "Halfway there! Keep it up!";
    } 
    else if(percentage <= 90){
        message = "Almost perfect! Excellent work!";
    }
    else{
        message = "Amazing! A flawless score!";
    }
    feedback.innerHTML = message ;
}


function setTimer(count) {
    let timerSpans = countDown.querySelectorAll("span");
    let minutes = Math.trunc(timer / 60);
    let seconds = timer % 60;

    timerSpans[0].innerHTML = minutes.toString().padStart(2, "0");
    timerSpans[1].innerHTML = seconds.toString().padStart(2, "0");    
    
    timeInterval = setInterval(() => {

        if(seconds > 0){
            seconds--;
        }
        else if(minutes > 0){
            minutes--;
            seconds = 59;
        }
        else{
            clearInterval(timeInterval);
            showResult(count);
        }
        timerSpans[0].innerHTML = minutes.toString().padStart(2, "0");
        timerSpans[1].innerHTML = seconds.toString().padStart(2, "0");    
    }, 1000)
}

document.querySelector(".home").onclick = () => {
    currentIndex = 0;
    correctAnswers = 0;
    currentBullet = 0;
    countDown.querySelectorAll("span")[0].innerHTML = "00";
    countDown.querySelectorAll("span")[1].innerHTML = "00";
    resultContainer.style.display = "none";
    loading();
    setTimeout(() => {
        quizDetails.style.display = "block";
    },4500)    
}


document.querySelector(".tryAgain").onclick = () => {
    currentIndex = 0;
    correctAnswers = 0;
    currentBullet = 0;
    countDown.querySelectorAll("span")[0].innerHTML = "00";
    countDown.querySelectorAll("span")[1].innerHTML = "00";
    resultContainer.style.display = "none";
    setTimeout(() => {
        quizContainer.style.display = "block";
    },1000)
    setTimeout(() => {
        getQuestions();   
    },3500)
}
