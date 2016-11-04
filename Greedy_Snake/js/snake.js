/**
 * 贪吃蛇脚本
 * @author Mr.Bubbles :)
 * ^_^
 * 方向键控制蛇的行动，撞到墙壁和碰到自己为失败
 * 50分之后食物透明度增加，120分之后出现敌方贪吃蛇
 * 采用canvas和js实现，固定时间间隔刷新画面
 * 
 */
//获取canvas环境
var c = document.getElementById("stage");
var context = c.getContext('2d');
//按钮的控制
var startBtn = null;
var stopBtn = null;
var gameLoop = null;
var go = false;

var mode = 0; //0表示任务模式，1经典模式，2探测模式，3战场模式
var status = 0; //游戏状态控制 0开始、1已经开始，2暂停
var score = 0; //当前玩家的得分

//蛇的参数
var x = 0,
	y = 0; //当前蛇头的位置
var snakeLength = 8; //蛇身长度
var snakeSize = 8; //蛇身的大小
var foodCoor = 0; //食物的坐标
var snakeMap = []; //蛇的身体Map，核心，不断push进入头部的位置，
//抹除尾巴的位置，循环就形成了动画效果
var direction = 2; //当前蛇的行驶方向,0-top,1-right,2-down,3-left
//绘制效果
var interval = 150; //更新画面间隔
var alpha = 1; //雾化透明度

//敌方设置
var enemyMap = [];
var enemyDir = 0; //敌方的方向
var enemyRanflg = 0; //敌方随机出现标志，如果为1说明当前敌方还未消失
var enemy_x = 0,
	enemy_y = 0; //敌方蛇头位置
var enemySnakeLength = 0;

function init() {
	score = 0; //当前玩家的得分
	//蛇的参数
	x = 0,
		y = 0; //当前蛇头的位置
	snakeLength = 8; //蛇身长度
	snakeSize = 8; //蛇身的大小
	foodCoor = 0; //食物的坐标
	snakeMap = []; //蛇的身体Map，核心，不断push进入头部的位置，
	//抹除尾巴的位置，循环就形成了动画效果
	direction = 2; //当前蛇的行驶方向,0-top,1-right,2-down,3-left
	//绘制效果
	interval = 150; //更新画面间隔
	alpha = 1; //雾化透明度

	//敌方设置
	enemyMap = [];
	enemyDir = 0; //敌方的方向
	enemyRanflg = 0; //敌方随机出现标志，如果为1说明当前敌方还未消失
	enemy_x = 0,
		enemy_y = 0; //敌方蛇头位置
	enemySnakeLength = 0;

}

//状态显示区
var positionTxt = document.getElementById('position');
var foodTxt = document.getElementById('foodAlert');
var enemyTxt = document.getElementById('enemyAlert');
var scoreTxt = document.getElementById('score');
//按钮设置区域
startBtn = document.getElementById('btn_start');
stopBtn = document.getElementById('btn_stop');
stopBtn.disabled = true;
stopBtn.addEventListener("click", stopGame, false);

// 游戏开启
function start() {
	//暂停状态点击
	if(status == 1) {
		clearTimeout(gameLoop);
		document.getElementById('kaishi').innerHTML = "继续";
		status = 2;
		return;
		//运行状态点击
	} else if(status == 2) {
		gameLoop = window.setInterval(cycle, interval);
		document.getElementById('kaishi').innerHTML = "暂停";
		status = 1;
		return;
		//初始状态点击
	} else {
		stopBtn.disabled = false;
		init();
		document.getElementById('kaishi').innerHTML = "暂停";
		//循环更新画面
		status = 1;
		gameLoop = window.setInterval(cycle, interval);
		
		//随机产生食物
		randFood();
		
		scoreTxt.innerHTML = "你的得分是：" + score; //分数刷新
	}
}
//循环更新画面
function cycle() {
	//绘制蛇
	getSnakeColor();
	//蛇头方向判定
	switch(direction) {
		case 0:
			x = x - snakeSize;
			break;
		case 1:
			y = y - snakeSize;
			break;
		case 2:
			x = x + snakeSize;
			break;
		case 3:
			y = y + snakeSize;
			break;
	}
	context.fillRect(x, y, snakeSize, snakeSize); //填充蛇头

	if(detectConflict()==false) return; //判定碰撞
	//更新蛇身体数组
	snakeMap.push({
		'x': x,
		'y': y
	});
	//更新蛇身数组，保持蛇身的长度
	if(snakeMap.length > snakeLength) {
		var tail = snakeMap.shift();
		if(tail['x'] == foodCoor * 8 && tail['y'] == foodCoor * 8) {
			context.globalAlpha = alpha;
			context.fillStyle = "#000"; //内部填充颜色 
			context.strokeStyle = "#000"; //边框颜色 
			context.fillRect(foodCoor * 8, foodCoor * 8, snakeSize, snakeSize);
		} else {
			context.clearRect(tail['x'], tail['y'], snakeSize, snakeSize);
		}
	}
	detectFood(); //检测是否吃到食物
	//敌人设置，只在任务模式和战场模式出现
	if(mode == 0 || mode == 3) {
		var objScore = 0;
		//模式控制，待优化代码
		if(mode == 0) {
			objScore = 120;
		} else if(mode == 3) {
			objScore = 0;
		}
		//敌方活动设置
		if(score >= objScore) { /********DEBUG**********/
			//执行随机化过程
			if(enemyRanflg == 0) {
				var randomNum = Math.round(Math.random() * 3); //随机方向出现
				var randomLen = Math.ceil((Math.random() + 0.5) * 15); //随机长度
				var randomPos = Math.round(Math.random() * 50) * 8; //随机位置
				switch(randomNum) {
					case 2:
						enemy_x = 0;
						enemy_y = randomPos;
						break;
					case 3:
						enemy_y = 0;
						enemy_x = randomPos;
						break;
					case 0:
						enemy_x = 400;
						enemy_y = randomPos;
						break;
					case 1:
						enemy_x = 400;
						enemy_y = randomPos;
						break;
				}
				enemyDir = randomNum;
				enemySnakeLength = randomLen;
				enemyRanflg = 1;
			}
			enemyMove();
		}
	}
	document.onkeydown = function(e) {
			//txt.innerHTML=e.keyCode;
			var code = e.keyCode - 37; //左方向键37，上方向键38，右方向键39，下方向键40
			if(Math.abs(code - direction) == 2) {
				return;
			}
			switch(code) {
				case 0:
					direction = 0;
					break;
				case 1:
					direction = 1;
					break;
				case 2:
					direction = 2;
					break;
				case 3:
					direction = 3;
					break;
			}
		}
		
}

//碰撞判定
function detectConflict() {
	//碰到墙壁判定
	if(x < 0 || x > 400 || y < 0 || y > 400) {
		alert("碰到墙壁了！");
		stopGame();
		return false;
	}
	//自身碰撞判定
	for(var i = 0; i < snakeMap.length; i++) {
		if(snakeMap[i].x == x && snakeMap[i].y == y) {
			alert("碰撞到自己了！");
			stopGame();
			return false;
		}
	}
	//敌方碰撞判定
	for(var i = 0; i < enemyMap.length; i++) {
		if(enemyMap[i].x == x && enemyMap[i].y == y) {
			alert("碰撞到敌人了！");
			stopGame();
			return false;
		}
	}
	return true;
}

//改变食物透明度
function changeAlpha() {
	alpha -= 0.1;
	if(alpha <= 0.2) {
		alpha = 0.2;
	}
}
//食物判定
function detectFood() {
	//食物碰撞检测
	if(foodCoor * 8 == x && foodCoor * 8 == y) {
		randFood();
		snakeLength++;
		//分数刷新
		score += 10; //增加得分
		scoreTxt.innerHTML = "你的得分是：" + score;
		//重新设置游戏速度
		interval -= 5;
		clearInterval(gameLoop);
		gameLoop = window.setInterval(cycle, interval);
		if(interval <= 80) { //避免速度过快
			interval = 80;
		}
		if(score >= 0 && (mode==0 ||mode==2)) { //雾化开启
			changeAlpha();
		}
	}
	/*
	 * 食物靠近检测
	 * 雾化效果变化
	 */
	if(score >= 50) {
		positionTxt.innerHTML = "系统定位：" + x + "," + y;
		if(x > foodCoor * 8 - 60 && x < foodCoor * 8 + 60 && y > foodCoor * 8 - 60 && y < foodCoor * 8 + 60) {
			foodTxt.style.color = "red";
			foodTxt.innerHTML = "食物出现：食物在附近";
			context.globalAlpha = Math.abs(0 - Math.max(x, y)) * 0.01 - 0.2;
			context.fillStyle = "#000"; //内部填充颜色 
			context.strokeStyle = "#000"; //边框颜色 
			context.clearRect(foodCoor * 8, foodCoor * 8, snakeSize, snakeSize);
			context.fillRect(foodCoor * 8, foodCoor * 8, snakeSize, snakeSize);
		} else {
			foodTxt.innerHTML = "食物出现：未检测到食物";
			foodTxt.style.color = "black";
			context.globalAlpha = alpha;
			context.fillStyle = "#000"; //内部填充颜色 
			context.strokeStyle = "#000"; //边框颜色 
			context.clearRect(foodCoor * 8, foodCoor * 8, snakeSize, snakeSize);
			context.fillRect(foodCoor * 8, foodCoor * 8, snakeSize, snakeSize);
		}
	} else {
		foodTxt.innerHTML = "食物出现：食物检测准备中";
		positionTxt.innerHTML = "系统定位：系统定位准备中";
	}
}

/**
 * 实现随机产生食物
 * 产生一个随机数0-50之间，产生一个方块即可
 */
function randFood() {
	context.globalAlpha = alpha;
	context.fillStyle = "#000"; //内部填充颜色 
	context.strokeStyle = "#000"; //边框颜色 
	foodCoor = Math.ceil(Math.random() * 50);
	context.fillRect(foodCoor * 8, foodCoor * 8, snakeSize, snakeSize);
}

//敌方贪吃蛇的移动
function enemyMove() {
	getEnemyColor();
	switch(enemyDir) {
		case 0:
			enemy_x = enemy_x - snakeSize;
			enemyTxt.style.color = "red";
			enemyTxt.innerHTML = "敌人出现：右方"
			break;
		case 1:
			enemy_y = enemy_y - snakeSize;
			enemyTxt.style.color = "red";
			enemyTxt.innerHTML = "敌人出现：下方";
			break;
		case 2:
			enemy_x = enemy_x + snakeSize;
			enemyTxt.style.color = "red";
			enemyTxt.innerHTML = "敌人出现：左方"
			break;
		case 3:
			enemy_y = enemy_y + snakeSize;
			enemyTxt.style.color = "red";
			enemyTxt.innerHTML = "敌人出现：上方"
			break;
	}
	//更新蛇身体数组
	enemyMap.push({
		'x': enemy_x,
		'y': enemy_y
	});
	context.fillRect(enemy_x, enemy_y, snakeSize, snakeSize); //填充蛇头
	//更新蛇身数组，保持蛇身的长度
	if(enemyMap.length > enemySnakeLength) {
		var tail = enemyMap.shift();
		context.clearRect(tail['x'], tail['y'], snakeSize, snakeSize);
	}
	for(var i = 0; i < snakeMap.length; i++) {
		if(snakeMap[i].x == enemy_x && snakeMap[i].y == enemy_y) {
			alert("碰撞到敌人了！");
			stopGame();
		}
	}
	//敌方蛇边界处理
	var flag = 0;
	for(var i = 0; i < enemyMap.length; i++) {
		if(enemyMap[i].x >= 0 && enemyMap[i].x <= 400 &&
			enemyMap[i].y >= 0 && enemyMap[i].y <= 400) {
			flag = 1;
			break;
		}
	}
	if(flag == 0) {
		enemyMap = [];
		enemyRanflg = 0;
		return;
	}

}

function getSnakeColor() {
	context.globalAlpha = 1;
	context.fillStyle = "#006699"; //内部填充颜色 
	context.strokeStyle = "#006699"; //边框颜色 
}

function getEnemyColor() {
	context.globalAlpha = 1;
	context.fillStyle = "red"; //内部填充颜色 
	context.strokeStyle = "red"; //边框颜色 
}

//停止游戏事件
function stopGame() {
	init();
	context.clearRect(0, 0, 400, 400);
	status = 0;
	clearInterval(gameLoop);
	clearTimeout(gameLoop);
	stopBtn.disabled = false;
	document.getElementById('kaishi').innerHTML = "开始";
}
//帮助文本
function help() {
	alert("任务模式\n\n1.点击Start开始游戏。\n\n2.点击Stop停止游戏。\n\n" +
		"3.50分之后食物雾化开启，会逐渐变成透明，探测器开启，处于食物附近的时候会提示。\n\n" +
		"4.120分之后出现敌方贪吃蛇干扰行动。\n\n");
}
/**
 * 模式选择部分
 */
//任务模式，全部出现
function enterTaskMode(){
	mode = 0;
	document.getElementById('mode_title').src='img/task_mode.png';
	document.getElementById('task_choose').style.display = "none";
	document.getElementById('snake').style.display = "block";
	document.getElementById('msgBoard').style.display = "block";
	snakeLength=8;
}

//经典模式，消息版面不出现
function enterClassicMode(){
	mode = 1;
	document.getElementById('mode_title').src='img/classic_mode.png';
	document.getElementById('task_choose').style.display = "none";
	document.getElementById('snake').style.display = "block";
	document.getElementById('msgBoard').style.display = "none";
	snakeLength=9999;
}
//探测模式，消息版出现
function enterDetectMode(){
	mode = 2;
	document.getElementById('mode_title').src='img/detect_mode.png';
	document.getElementById('task_choose').style.display = "none";
	document.getElementById('snake').style.display = "block";
}

function enterWarMode(){
	mode = 3;
	document.getElementById('mode_title').src='img/war_mode.png';
	document.getElementById('task_choose').style.display = "none";
	document.getElementById('snake').style.display = "block";
	document.getElementById('foodAlert').style.display = "none";
}
/*function enterGame(event) {
	switch(event.toElement.id) {
		case "task_button":
			mode = 0;
			document.getElementById('mode_title').src='img/task_mode.png';
			break;
		case "classic_button":
			mode = 1;
			document.getElementById('mode_title').src='img/classic_mode.png';
			break;
		case "detect_button":
			mode = 2;
			document.getElementById('mode_title').src='img/detect_mode.png';
			break;
		case "war_button":
			mode = 3;
			document.getElementById('mode_title').src='img/war_mode.png';
			break;
	}
	document.getElementById('task_choose').style.display = "none";
	document.getElementById('snake').style.display = "block";
}*/

//返回主菜单
function backToMain(){
	document.getElementById('task_choose').style.display="none";
	document.getElementById('game_panel').style.display="block";
}

//返回模式选择
function backToSelect(){
	stopGame();
	document.getElementById('snake').style.display="none";
	document.getElementById('task_choose').style.display="block";
}
