"use strict"
class Canvas {
    constructor() {
        this.addElem = (tagName, container = document.body) => {
          return container.appendChild(
            document.createElement(tagName)
          )
        }
        this.parent = document.querySelector(".parent")
        this.canvas = this.addElem("canvas", this.parent)
        this.area = this.canvas.getContext ( "2d" )
        this.setStyle = (propName,propValue) => {
            this.canvas.style[propName] = propValue
        }
        var fill = (color = "fff") => {
            this.area.fillStyle = color
            this.area.fill()
        }
        var stroke = (color) => {
            this.area.strokeStyle = color ? color : "fff"
            this.area.stroke ()
        }
        var setWidth = ( num ) => {
            this.area.lineWidth = num ? num : 1
        }
        this.drawLine = ( obj ) => {
            this.area.beginPath ()
            this.area.moveTo (obj.x1, obj.y1)
            this.area.lineTo (obj.x2, obj.y2)
            stroke(obj.s ? obj.s : null)
            obj.w ? setWidth (obj.w)
                : setWidth(null)
            this.area.closePath()
        }
        this.drawRect = ( obj ) => {
            this.area.beginPath ()
            this.area.rect (obj.x, obj.y, obj.w, obj.h)
            setWidth ( obj.sw ? obj.sw : null)
            obj.s ? stroke(obj.s) : fill(obj.f)
            this.area.closePath()
        }
    }
}

class GameCanvas extends Canvas {
    constructor(){
        super()
        this.setSize = (width, height) => {
            rims.x2 = this.canvas.width =  width
            rims.y2 = this.canvas.height = height
        }
        var walls = []
        var questLoc = []
        var questions = []
        var rims = {
            x: 0,
            y: 0,
            x2: this.canvas.width,
            y2: this.canvas.height
        }
        var left = (persC, persS) => {
                return walls.some( el => {
                    return persC.x + persS.w >= el.x
                        && persC.x < el.x + el.w
                        && persC.y >= el.y
                        && persC.y + persS.h <= el.y
                        + el.h
                })
        }
        var right = (persC, persS) => {
                return walls.some( el => {
                    return persC.x <= el.w + el.x
                        && persC.x >= el.x
                        + el.w
                        && persC.y >= el.y
                        && persC.y + persS.h <= el.y
                        + el.h
                })
        }
        var top = (persC, persS) => {
                return walls.some( el => {
                    return persC.y + persS.h >= el.y
                        && persC.y < el.y + el.h
                        && persC.x >= el.x
                        && persC.x + persS.w <= el.x
                        + el.w
                })
        }
        var bottom = (persC, persS ) => {
                return walls.some( el => {
                    return persC.y <= el.y + el.h
                        && persC.y >= el.y + el.w
                        && persC.x >= el.x
                        && persC.x + persS.w <= el.x
                        + el.w
                })
        }
        var limiter = (persC,persS, func) => {
                if(walls.length) return !func(persC,persS)
                return true
        }

        var stepAudio = new Audio()
        stepAudio.src = "audio/step.mp3"
        var screamAudio = new Audio()
        screamAudio.src = "audio/die_scream.mp3"
        var questAudio = new Audio()
        questAudio.src = "audio/quest.mp3"
        var winAudio = new Audio()
        winAudio.src = "audio/win.mp3"
        var fonAudio = new Audio()
        fonAudio.src = "audio/podzem.mp3"

        var plrImg = new Image()
        plrImg.src = "images/pers.png"
        var enmImg = new Image()
        enmImg.src = "images/evil.png"
        var queImg = new Image()
        queImg.src = "images/quest.png"
        var finImg = new Image()
        finImg.src = "images/finish.png"

        var finishLoc = {
            x: 976,
            y: 480
        }
        var plrStep = 16
        var plrSize = {
            w:16, h:16
        }
        var bldColor = {
            f: "#172235"
        }
        var clearOL = (objLoc, objSize ) => {
            let {x, y} = objLoc
            let {w, h} = objSize
            this.area.clearRect(x, y, w, h)
        }
        var plrMove = event => {
            fonAudio.play()
            var oldLoc = plrHis[plrHis.length -1]
            // Избавиться от if-ов
            if(
                event.keyCode == 38
                && plrLoc.y !== rims.y
                && limiter(plrLoc, plrSize, bottom)
            ){
                clearOL ( oldLoc, plrSize )
                plrLoc.y -= plrStep
                stepAudio.play()
                this.drawPlayer()
                checkFin()
                checkQuest(plrLoc) ?
                  askQuestion(questions[currentQuestion++])
                    : null
                checkEnemy(plrLoc, plrHis[enmCurPos]) ?
                  gameOver("YOU DIED", "died", screamAudio)
                    : null
            }
            if(
                event.keyCode == 40
                && plrLoc.y <= rims.y2 - plrSize.h * 2
                && limiter(plrLoc, plrSize, top)
            ){
                clearOL ( oldLoc, plrSize )
                plrLoc.y += plrStep
                stepAudio.play()
                this.drawPlayer()
                checkFin()
                checkQuest(plrLoc) ?
                  askQuestion(questions[currentQuestion++])
                    : null
                checkEnemy(plrLoc, plrHis[enmCurPos]) ?
                  gameOver("YOU DIED", "died", screamAudio)
                    : null
            }
            if(
                event.keyCode == 37
                && plrLoc.x > rims.x
                && limiter(plrLoc, plrSize, right)
            ){
                clearOL ( oldLoc, plrSize )
                plrLoc.x -= plrStep
                stepAudio.play()
                this.drawPlayer()
                checkFin()
                checkQuest(plrLoc) ?
                  askQuestion(questions[currentQuestion++])
                    : null
                checkEnemy(plrLoc, plrHis[enmCurPos]) ?
                  gameOver("YOU DIED", "died", screamAudio)
                    : null
            }
            if(
                event.keyCode == 39
                && plrLoc.x + plrSize.w < rims.x2
                && limiter(plrLoc, plrSize, left)
            ){
                clearOL ( oldLoc, plrSize )
                plrLoc.x += plrStep
                stepAudio.play()
                this.drawPlayer()
                checkFin()
                checkQuest(plrLoc) ?
                  askQuestion(questions[currentQuestion++])
                    : null
                checkEnemy(plrLoc, plrHis[enmCurPos]) ?
                  gameOver("YOU DIED", "died", screamAudio)
                    : null
            }
        }
        var plrHis =[]
        var plrLoc = {
            x:0, y:0
        }
        var bldLoc = {
            x:0, y:0
        }
        this.drawPlayer = () => {
            this.area.beginPath()//test
            this.area.drawImage (plrImg, plrLoc.x, plrLoc.y)
            plrHis.push (
                Object.assign({}, plrLoc )
            )
            this.area.closePath()//test
        }
        this.playerStart = () => {
            clearOL(plrLoc, plrSize)//test
            this.drawPlayer()
            document.onkeydown = function(e){
                plrHis.length === 1 && e.keyCode >= 37 && e.keyCode <= 40
                  ? enemyStart() : null
                plrMove(e)
            }
        }
        var drawWall = obj => {
            walls.push(obj)
            this.drawRect(obj)
        }
        var drawBuilder = toggle => {
            if(this.que){
              setQuestion()
              return
            }
            var color = toggle ? bldColor :{f:"pink"}
            var bld = Object.assign(
                {}, bldLoc, plrSize, color
            )
            this.drawRect (bld)
            toggle ? walls.push(bld)
                : console.log(toggle)
        }
        var drawCuestion = qLoc => {
          this.area.drawImage(queImg, qLoc.x, qLoc.y)
          questLoc.push(Object.assign(
            {}, qLoc
          ))
        }
        this.drawFinish = () => {
          this.area.beginPath()
          this.area.drawImage(finImg, finishLoc.x, finishLoc.y)
          this.area.closePath()
        }
        var gameFin = () => {
          clearOL(plrLoc, plrSize)
          this.drawFinish()
          setTimeout(function(){gameOver("YOU WON", "win", winAudio)}.bind(this),500)
        }
        var checkFin = () => {
          plrLoc.x === finishLoc.x && plrLoc.y === finishLoc.y ?
          gameFin() : null
        }
        var checkQuest = currentLoc => {
          return questLoc.some(
            (el, ind, arr) =>
            {
              var check = el.x === currentLoc.x && el.y === currentLoc.y
              check ? arr.splice(ind,1) : null
              return check
            }
          )
        }
        var currentQuestion = 0
        var success = () => {e
          fonAudio.play()
          var oldQuest = document.querySelector(".questWindow")
          Array.from(oldQuest.children).forEach(
            el => el.remove()
          )
          oldQuest.innerText = "You answered correctly!"
          setTimeout(function(){
            oldQuest.remove()
            document.onkeydown = function(e) { plrMove(e) }
            enemyPause = false
          },2000)
        }
        var askQuestion = arrElem => {
          fonAudio.pause()
          currentQuestion === questions.length - 1 ?
            currentQuestion = 0 : null
          document.onkeydown = null
          enemyPause = true
          questAudio.play()
          var nQues = this.addElem("div")
          nQues.className = "questWindow"
          arrElem.forEach(
            elem => {
              var tag = this.addElem(elem.tagName, nQues)
                    for(var attr in elem.attrs){
                      tag[attr] = elem.attrs[attr]
                    }
                    elem.answers ?
                      tag.onclick = function(event){
                        document.querySelectorAll("span")[0]
                          .innerText === elem.answers[0]
                        && document.querySelectorAll("span")[1]
                          .innerText === elem.answers[1]
                        && document.querySelectorAll("span")[2]
                          .innerText === elem.answers[2]
                        ? success ()
                        : gameOver("YOU DIED", "died", screamAudio)
                      }
                    : null
            }
          )
        }
        // Функционал для создания лабиринта start
        this.toggle = false
        this.que = false
        var stepBackward = t => {
          walls.pop()
          clearOL(bldLoc, plrSize)
          var l = walls.length
          l ? bldLoc.x = walls[l-1].x : null
          l ? bldLoc.y = walls[l-1].y : null
          this.toggle = false
          drawBuilder(t)
        }
        this.startBuilder = () => {
          drawBuilder()
          document.onkeydown = e => {
                  console.log(this.toggle)
                  e.keyCode == 17 ? this.toggle = true
                  : e.keyCode == 16 ? this.toggle = false
                  : e.keyCode == 226 ? stepBackward(this.toggle)
                  : e.keyCode == 90 ? this.que = true
                  : moveBld(e,this.toggle)
          }
        }
        var setQuestion = () => {
          if(!this.toggle && this.que){
            drawCuestion(bldLoc)
            this.que = false
          }
        }
        this.finBuilder = () => {
                clearOL(bldLoc, plrSize)
                document.onkeydown = null
                console.log(JSON.stringify(walls))
                console.warn("questions")
                console.log(JSON.stringify(questLoc))
        }
        var moveBld = (event, t) => {
            if(
                event.keyCode == 38
                && bldLoc.y !== rims.y
            ){
                bldLoc.y -= plrStep
                drawBuilder(t)
            }
            if(
                event.keyCode == 40
                && bldLoc.y <= rims.y2 - plrSize.h * 2
            ){
                bldLoc.y += plrStep
                drawBuilder(t)
            }
            if(
                event.keyCode == 37
                && bldLoc.x !== rims.x
            ){
                bldLoc.x -= plrStep
                drawBuilder(t)
            }
            if(
                event.keyCode == 39
                && bldLoc.x !== rims.x2 - plrSize.w
            ){
                bldLoc.x += plrStep
                drawBuilder(t)
            }
        }
      // end
        this.drawLab = () => {
          fetch("json/test.json")
            .then(response => response.json()
              .then(resp =>  resp.forEach(
                el => drawWall(el)
              )))
          fetch("json/queLoc.json")
            .then(response => response.json()
              .then(resp => resp.forEach(
                el => drawCuestion(el)
              )))
          fetch("json/questions.json")
            .then(response => response.json()
            .then(resp => resp.forEach(
              el => questions.push(el)
            )))
        }
        var checkEnemy = (pLoc, eLoc) => {
          var check = pLoc.x === eLoc.x && pLoc.y === eLoc.y
          return check
        }
        var enmCurPos = 0
        var enemyPause = false
        var enemyMove = () => {
          fonAudio.ended ? fonAudio.play() : null
          var timer = setInterval(function(){
              clearOL(plrHis[enmCurPos], plrSize)
              !enemyPause ? enmCurPos++ : null
              this.area.drawImage(enmImg, plrHis[enmCurPos].x, plrHis[enmCurPos].y)
              if(
                  plrHis[enmCurPos].x === plrLoc.x
                  && plrHis[enmCurPos].y === plrLoc.y
              ){
                  clearInterval(timer)
                  gameOver("YOU DIED", "died", screamAudio)
              }
          }.bind(this),300)
        }
        var enemyStart = () => {
            setTimeout( function() {
                this.area.drawImage (enmImg, plrHis[0].x, plrHis[0].y)
                enemyMove()
            }.bind(this), 5000 )
        }
        var gameOver = (endText, endClass, audio) => {
            fonAudio.pause()
            audio instanceof Audio && audio? audio.play() : null
            var oldOver = document.querySelector("." + endClass)
            oldOver ? oldOver.remove() : null
            var oldQuest = document.querySelector(".questWindow")
            oldQuest ? oldQuest.remove() : null
            enemyPause = true
            document.onkeydown = null
            this.canvas.remove()
            var over = this.addElem("div", this.parent)
            over.className = endClass
            var mess = this.addElem("div", over)
            mess.innerText = endText
        }
        this.startAll= async function(){
            await game.drawLab()
            game.playerStart()
            game.drawFinish()
        }
    }
}
var game = new GameCanvas(parent)
game.setSize(992, 496)
game.setStyle("background","#92959baa")
game.setStyle("marginTop", "2vw")
window.onload = function(event){
  game.startAll()
}
// game.startBuilder()
