function Mine(tr,td,MineNum){
    this.tr = tr;
    this.td = td;
    this.MineNum = MineNum;
    this.square = []; // 存储所有方块的信息
    this.tds = []; //存储所有方块的dom对象
    this.surplusmine = MineNum; //剩余雷的数量
    this.allAllright = false; //存储最终结果
    this.parent = document.querySelector('.gameBox');
}
Mine.prototype.creatRadom = function(){
    var square = new Array(this.tr * this.td); //生成一个空数组
    for(var i = 0; i < square.length; i++){
        square[i] = i;
    }
    square.sort(function(){
        return 0.5 - Math.random();
    });
    return square.slice(0,this.MineNum);
}

//初始化
Mine.prototype.init = function(){
    var rn = this.creatRadom();
    var n = 0;
    for(var i = 0; i < this.tr; i++){
        this.square[i] = [];
        for(var j = 0; j < this.td; j++){
            if(rn.indexOf( ++ n) != -1){
                this.square[i][j] = {type:'mine',x:j,y:i};
            }else{
                this.square[i][j] = {type:'number',x:j,y:i,value:0};
            }
        }
    }
    this.parent.oncontextmenu = function(){return false;};
    this.mineNumDom = document.querySelector('.MineNum');
    this.mineNumDom.innerHTML = this.MineNum;
    this.update();
    this.createDom();
    
}
Mine.prototype.getAround = function(square){
    var x = square['x'];
    var y = square['y'];
    var result = [];
    for(var i = x - 1; i <= x + 1; i++){
        for(var j = y - 1; j <= y + 1; j++){
            if(i < 0 ||
               j < 0 ||
               i > this.td-1 ||
               j > this.tr-1 ||
               (i == x && j == y) ||
               this.square[j][i].type == 'mine' 
                ){
                    continue;
                }
            result.push([j,i]);
        }
    }
    return result;
}

// 更新数据
Mine.prototype.update = function(){
    for(var i = 0; i < this.tr; i++){
        for(var j = 0; j < this.td; j++){
            if(this.square[i][j].type == 'number'){
                continue;
            }
            var num = this.getAround(this.square[i][j]);
            for(var k = 0; k < num.length; k++){
                this.square[num[k][0]][num[k][1]].value += 1;
            }
        }
    }
}

//创建表格
Mine.prototype.createDom = function(){
    var This = this;
    var domTable = document.createElement('table');
        for(var i = 0; i < this.tr; i++ ){
            var domTr = document.createElement('tr');
            this.tds[i] = [];
            for(var j = 0; j < this.td; j++ ){
                var domTd = document.createElement('td');
                domTd.pos = [i,j];
                console.log(domTd.pos);
                domTd.onmousedown = function(){
                    This.play(event,this);
                }
                this.tds[i][j] = domTd;
                // if(this.square[i][j].type == 'mine'){
                //     domTd.className = 'mine';
                // }
                // if(this.square[i][j].type == 'number'){
                //     domTd.innerHTML = this.square[i][j].value;
                // } 
                domTr.appendChild(domTd);
            }
            domTable.appendChild(domTr);
        }
        this.parent.innerHTML = '';
        this.parent.appendChild(domTable);
}   

// 游戏结束函数
Mine.prototype.gameOver = function(clickTd){
    for(var i = 0; i < this.tr; i++){
        for(var j = 0; j < this.td; j++){
            if(this.square[i][j].type == 'mine'){
                this.tds[i][j].className = 'mine';
            }
            this.tds[i][j].onmousedown = null;
        }
        
    }
    if(clickTd){
        clickTd.style.backgroundColor = '#f00';
    }
   
}


Mine.prototype.play = function(event, obj){
    var This = this;
    if(event.which == 1 && obj.className != 'flag'){
       var curSquare = this.square[obj.pos[0]][obj.pos[1]];
       var cl = ['zero','one','two','three','four','five','six','seven','eight'];
       if(curSquare.type == 'number'){
           obj.innerHTML = curSquare.value;
           obj.className = cl[curSquare.value]; 
           if(curSquare.value == 0){
               obj.innerHTML = '';
               function getAllzero(square){
                   var around = This.getAround(square);
                   for(var i = 0; i < around.length; i++){
                       var x = around[i][0];
                       var y = around[i][1];
                       This.tds[x][y].className = cl[This.square[x][y].value];
                       if(This.square[x][y].value == 0){
                           if(!This.tds[x][y].check){
                            This.tds[x][y].check = true;
                            getAllzero(This.square[x][y]);
                           }    
                       }
                       else{
                        This.tds[x][y].innerHTML = This.square[x][y].value;
                    }
                   }

               }
               getAllzero(curSquare);
           }
       }else{
           this.gameOver(obj);
       }
    }
     // 用户点击右键
    if(event.which ==3){
        if(obj.className && obj.className != 'flag'){
            return;
        }
        obj.className = obj.className == 'flag' ? '' : 'flag';
        if(this.square[obj.pos[0]][obj.pos[1]].type == 'mine'){
            this.allAllright = true;
        }else{
            this.allAllright = false;
        }

        if(obj.className == 'flag'){
            this.mineNumDom.innerHTML = -- this.MineNum; 
        }else{
            this.mineNumDom.innerHTML = ++ this.MineNum; 
        }
        if(this.MineNum == 0){
            if(this.allAllright){
                alert('游戏通过!!!');
            }else{
                alert('游戏失败。。');
                this.gameOver();
            }
        }
    }
}

var btns = document.querySelectorAll('.btn button'); //获取所有button
var mine = null; //存储生成的对象
var ln = 0;
var arr = [[9,9,10],[16,16,40],[28,28,99]];

for(let i = 0; i < btns.length - 1; i++){
    btns[i].onclick = function(){
        btns[ln].className = '';
        this.className = 'active';
        mine = new Mine(...arr[i]);
        mine.init();
        ln = i;
    }
}
btns[0].onclick();
btns[3].onclick = function(){
    mine.init();
}