"use strict"
class Canvas {
    constructor() {
        this.canvas = document.createElement ( "canvas" )
        document.body.appendChild ( this.canvas )
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
                console.log(func.name)
                if(walls.length) return !func(persC,persS)
                return true
        }
        var plrImg = new Image()
        plrImg.src = "images/pers.png"
        var enmImg = new Image()
        enmImg.src = "images/evil.png"
        var plrStep = 16
        var plrSize = {
            w:16, h:16
        }
        var plrColor = {
            f: "green"
        }
        var enmColor = {
            f: "red"
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
            var oldLoc = plrHis[plrHis.length -1]
            // Избавиться от if-ов
            if(
                event.keyCode == 38
                && plrLoc.y !== rims.y
                && limiter(plrLoc, plrSize, bottom)
            ){
                clearOL ( oldLoc, plrSize )
                plrLoc.y -= plrStep
                this.drawPlayer()
            }
            if(
                event.keyCode == 40
                && plrLoc.y <= rims.y2 - plrSize.h * 2
                && limiter(plrLoc, plrSize, top)
            ){
                clearOL ( oldLoc, plrSize )
                plrLoc.y += plrStep
                this.drawPlayer()
            }
            if(
                event.keyCode == 37
                && plrLoc.x > rims.x
                && limiter(plrLoc, plrSize, right)
            ){
                clearOL ( oldLoc, plrSize )
                plrLoc.x -= plrStep
                this.drawPlayer()
            }
            if(
                event.keyCode == 39
                && plrLoc.x + plrSize.w < rims.x2
                && limiter(plrLoc, plrSize, left)
            ){
                clearOL ( oldLoc, plrSize )
                plrLoc.x += plrStep
                this.drawPlayer()
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
            this.area.drawImage (plrImg, plrLoc.x, plrLoc.y)
            plrHis.push (
                Object.assign({}, plrLoc )
            )
        }
        this.playerStart = () => {
            this.drawPlayer()
            document.onkeydown = function(e){
                plrMove(e)
            }
        }
        var drawWall = obj => {
            walls.push(obj)
            this.drawRect(obj)
            console.log(walls)
        }
        var drawBuilder = toggle => {
            console.warn(2)
            var color = toggle ? bldColor :{f:"pink"}
            var bld = Object.assign(
                {}, bldLoc, plrSize, color
            )
            this.drawRect (bld)
            toggle ? walls.push(bld)
                : console.log(toggle)
        }
        var moveBld = (event, t) => {
            console.log(this)
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
        var stepBackward = t => {
          walls.pop()
          console.log(walls.length,"stepBacward")
          clearOL(bldLoc, plrSize)
          var l = walls.length
          l ? bldLoc.x = walls[l-1].x : null
          l ? bldLoc.y = walls[l-1].y : null
          this.toggle = false
          drawBuilder(t)
        }
        this.toggle = false
        this.startBuilder = () => {
          drawBuilder()
          document.onkeydown = e => {
                  console.log(this.toggle)
                  e.keyCode == 17 ? this.toggle = true
                      : e.keyCode == 16 ? this.toggle = false
                              : e.keyCode == 226 ? stepBackward(this.toggle)
                                      :moveBld(e,this.toggle)

          }

        }
        this.finBuilder = () => {
                clearOL(bldLoc, plrSize)
                document.onkeydown = null
                console.log(JSON.stringify(walls))
        }
        this.drawLab = () => {
          fetch("json/test.json")
            .then(response => response.json()
              .then(resp =>  resp.forEach(
                el => drawWall(el)
              )))
        }
        this.enemyStart = () => {
            console.log(this,1)
            setTimeout( function() {
                console.log(this,2)
                console.log (this,3)
                this.area.drawImage (enmImg, plrHis[0].x, plrHis[0].y)
                var curPos = 0
                var timer = setInterval(function(){
                    console.log(this)
                    clearOL(plrHis[curPos++], plrSize)
                    this.area.drawImage(enmImg, plrHis[curPos].x, plrHis[curPos].y)
                    if(
                        plrHis[curPos].x === plrLoc.x
                        && plrHis[curPos].y === plrLoc.y
                    ){
                        alert("YOU DIED")
                        clearInterval(timer)
                        document.onkeydown = null
                    }
                }.bind(this),500)
            }.bind(this), 5000 )
        }
    }
}

var game = new GameCanvas()
game.setSize(992, 496)
game.setStyle("background","#92959baa")
game.setStyle("marginTop", "2vw")
// async function startAll(){
//   await game.drawLab()
//   game.playerStart()
//   game.enemyStart ()
// }
// startAll()

game.startBuilder()
