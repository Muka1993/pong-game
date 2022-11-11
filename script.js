// Variáveis ​​globais
var DIRECTION = {
	IDLE: 0,
	UP: 1,
	DOWN: 2,
	LEFT: 3,
	RIGHT: 4
};

var rounds = [5, 5, 3, 3, 2];
var colors = ['#1ab9bc', '#638a57', '#3498db', '#e74c3c', '#9b59b6'];

// ALERT

let nome = prompt("Digite seu nome");
window.alert(nome + ' ' + 'Vamos para o jogo!' );



// MARQUEE

let marquee = document.querySelector('span');
marquee.innerHTML = nome + ' ' +  '&nbsp;&nbsp; BEM VINDO!!! &nbsp;&nbsp;&nbsp; AO GAME &nbsp;&nbsp;&nbsp; PONG';



// AUDIO

const point = new Audio('receba-luva-de-pedreiro.mp3');
const effect = new Audio('orb.mp3');
const gameOver = new Audio('lose1.mp3');
const level = new Audio('sonic-extra-life.mp3');
const winner = new Audio('gta-mission-complete.mp3');


// O objeto bola (o cubo que quica para frente e para trás)
var Ball = {
	new: function (incrementedSpeed) {
		return {
			width: 18,
			height: 18,
			x: (this.canvas.width / 2) - 9,
			y: (this.canvas.height / 2) - 9,
			moveX: DIRECTION.IDLE,
			moveY: DIRECTION.IDLE,
			speed: incrementedSpeed || 12
		};
	}
};

//  objeto paddle (as duas linhas que se movem para cima e para baixo)
var Paddle = {
	new: function (side) {
		return {
			width: 18,
			height: 90,
			x: side === 'left' ? 150 : this.canvas.width - 150,
			y: (this.canvas.height / 2) - 35,
			score: 0,
			move: DIRECTION.IDLE,
			speed: 10
			
		};
	}
};


var Game = {
	initialize: function () {
		this.canvas = document.querySelector('canvas');
		this.context = this.canvas.getContext('2d');

		this.canvas.width = 1600;
		this.canvas.height = 1000;

		this.canvas.style.width = (this.canvas.width / 2) + 'px';
		this.canvas.style.height = (this.canvas.height / 2) + 'px';

		this.player = Paddle.new.call(this, 'left');
		this.paddle = Paddle.new.call(this, 'right');
		this.ball = Ball.new.call(this);

		this.paddle.speed = 8;
		this.running = this.over = false;
		this.turn = this.paddle;
		this.timer = this.round = 0;
		this.color = '#bc551a';

		Pong.menu();
		Pong.listen();
	},

	endGameMenu: function (text) {
		// Alterar o tamanho e a cor da fonte da tela
		Pong.context.font = '50px Courier New';
		Pong.context.fillStyle = this.color;

		// Desenhe o retângulo atrás do texto 'Pressione qualquer tecla para começar'.
		Pong.context.fillRect(
			Pong.canvas.width / 2 - 350,
			Pong.canvas.height / 2 - 48,
			700,
			100
		);

		// Altere a cor da tela;
		Pong.context.fillStyle = '#fff';

		// Desenhe o texto do menu do jogo final ('Game Over' e 'Winner')
		Pong.context.fillText(text,
			Pong.canvas.width / 2,
			Pong.canvas.height / 2 + 15
		);

		setTimeout(function () {
			Pong = Object.assign({}, Game);
			Pong.initialize();
		}, 3000);
	},

	menu: function () {
		// Desenhe todos os objetos Pong em seu estado atual
		Pong.draw();

		// Alterar o tamanho e a cor da fonte da tela
		this.context.font = '50px Courier New';
		this.context.fillStyle = this.color;

		// Desenhe o retângulo atrás do texto 'Pressione qualquer tecla para começar'.
		this.context.fillRect(
			this.canvas.width / 2 - 350,
			this.canvas.height / 2 - 48,
			700,
			100
		);

		// Altere a cor da tela;
		this.context.fillStyle = '#fff';

		// Desenhe o texto 'pressione qualquer tecla para começar'
		this.context.fillText(nome + ' ' + 'pressione alguma tecla',
			this.canvas.width / 2,
			this.canvas.height / 2 + 15
		);

	},

	// Atualize todos os objetos (mova o jogador, raquete, bola, incremente a pontuação, etc.)
	update: function () {
		if (!this.over) {
			// Se a bola colidir com os limites limite - corrija as coordenadas xey.
			if (this.ball.x <= 0) Pong._resetTurn.call(this, this.paddle, this.player);
			if (this.ball.x >= this.canvas.width - this.ball.width) Pong._resetTurn.call(this, this.player, this.paddle);
			if (this.ball.y <= 0) this.ball.moveY = DIRECTION.DOWN;
			if (this.ball.y >= this.canvas.height - this.ball.height) this.ball.moveY = DIRECTION.UP;

			// Mover jogador se o valor player.move foi atualizado por um evento de teclado
			if (this.player.move === DIRECTION.UP) this.player.y -= this.player.speed;
			else if (this.player.move === DIRECTION.DOWN) this.player.y += this.player.speed;

			// No novo saque (início de cada turno) mova a bola para o lado correto

			// e randomize a direção para adicionar algum desafio.
			if (Pong._turnDelayIsOver.call(this) && this.turn) {
				this.ball.moveX = this.turn === this.player ? DIRECTION.LEFT : DIRECTION.RIGHT;
				this.ball.moveY = [DIRECTION.UP, DIRECTION.DOWN][Math.round(Math.random())];
				this.ball.y = Math.floor(Math.random() * this.canvas.height - 200) + 200;
				this.turn = null;
			}

			// Se o jogador colidir com os limites, atualize as coordenadas x e y.
			if (this.player.y <= 0) this.player.y = 0;
			else if (this.player.y >= (this.canvas.height - this.player.height)) this.player.y = (this.canvas.height - this.player.height);

			// Mova a bola na direção pretendida com base nos valores moveY e moveX
			if (this.ball.moveY === DIRECTION.UP) this.ball.y -= (this.ball.speed / 1.5);
			else if (this.ball.moveY === DIRECTION.DOWN) this.ball.y += (this.ball.speed / 1.5);
			if (this.ball.moveX === DIRECTION.LEFT) this.ball.x -= this.ball.speed;
			else if (this.ball.moveX === DIRECTION.RIGHT) this.ball.x += this.ball.speed;

			// Movimento da pá do punho (AI) PARA CIMA e PARA BAIXO
			if (this.paddle.y > this.ball.y - (this.paddle.height / 2)) {
				if (this.ball.moveX === DIRECTION.RIGHT) this.paddle.y -= this.paddle.speed / 1.5;
				else this.paddle.y -= this.paddle.speed / 4;
			}
			if (this.paddle.y < this.ball.y - (this.paddle.height / 2)) {
				if (this.ball.moveX === DIRECTION.RIGHT) this.paddle.y += this.paddle.speed / 1.5;
				else this.paddle.y += this.paddle.speed / 4;
			}

			// Colisão na parede da pá do punho (AI)
			if (this.paddle.y >= this.canvas.height - this.paddle.height) this.paddle.y = this.canvas.height - this.paddle.height;
			else if (this.paddle.y <= 0) this.paddle.y = 0;

			// Lidar com colisões jogador-bola
			if (this.ball.x - this.ball.width <= this.player.x && this.ball.x >= this.player.x - this.player.width) {
				if (this.ball.y <= this.player.y + this.player.height && this.ball.y + this.ball.height >= this.player.y) {
					this.ball.x = (this.player.x + this.ball.width);
					this.ball.moveX = DIRECTION.RIGHT;
                    
					effect.play();
				}
			}

			// Lidar com colisão de paddle-ball
			if (this.ball.x - this.ball.width <= this.paddle.x && this.ball.x >= this.paddle.x - this.paddle.width) {
				if (this.ball.y <= this.paddle.y + this.paddle.height && this.ball.y + this.ball.height >= this.paddle.y) {
					this.ball.x = (this.paddle.x - this.ball.width);
					this.ball.moveX = DIRECTION.LEFT;

					effect.play();
				}
			}
		}

		// Lidar com o final da transição de rodada
		// Verifique se o jogador ganhou a rodada.

		if (this.player.score === rounds[this.round]) {
			// Verifique se há mais rodadas/níveis restantes e exiba a tela de vitória se
			// não há.
			if (!rounds[this.round + 1]) {
				this.over = true;
				setTimeout(function () { Pong.endGameMenu( nome + ' ' +'você venceu!!!'); }, 2000);
				winner.play();
			} 
			else {
				// Se houver outra rodada, redefina todos os valores e incremente o número da rodada.
				this.color = this._generateRoundColor();
				this.player.score = this.paddle.score = 0;
				this.player.speed += 0.5;
				this.paddle.speed += 1;
				this.ball.speed += 1;
				this.round += 1;
				level.play();
					
			}
		}
		// Verifique se o remo/AI ganhou a rodada.
		else if (this.paddle.score === rounds[this.round]) {
			this.over = true;
			setTimeout(function () { Pong.endGameMenu(nome + ' ' + 'Game Over!' ); }, 1000);

			setTimeout(function() { Pong.endGameMenu
				gameOver.play();},
				 1000);
			
		}
	},

	// Desenhe os objetos para o elemento canvas
	draw: function () {
		// Limpar a tela
		this.context.clearRect(
			0,
			0,
			this.canvas.width,
			this.canvas.height
		);

		// Defina o estilo de preenchimento para preto
		this.context.fillStyle = this.color;

		// Desenhe o fundo
		this.context.fillRect(
			0,
			0,
			this.canvas.width,
			this.canvas.height
		);

		// Defina o estilo de preenchimento para branco (para as pás e a bola)
		this.context.fillStyle = '#fff';

		// Desenhe o jogador
		this.context.fillRect(
			this.player.x,
			this.player.y,
			this.player.width,
			this.player.height
		);

		// Desenhe a pá
		this.context.fillRect(
			this.paddle.x,
			this.paddle.y,
			this.paddle.width,
			this.paddle.height
		);

		// Desenhe a Bola
		if (Pong._turnDelayIsOver.call(this)) {
			this.context.fillRect(
				this.ball.x,
				this.ball.y,
				this.ball.width,
				this.ball.height
			);
		}

		// Desenhe a rede (Linha no meio)
		this.context.beginPath();
		this.context.setLineDash([7, 15]);
		this.context.moveTo((this.canvas.width / 2), this.canvas.height - 140);
		this.context.lineTo((this.canvas.width / 2), 140);
		this.context.lineWidth = 10;
		this.context.strokeStyle = '#fff';
		this.context.stroke();

		// Defina a fonte de tela padrão e alinhe-a ao centro
		this.context.font = '100px Courier New';
		this.context.textAlign = 'center';

		// Desenhe a pontuação dos jogadores (esquerda)
		this.context.fillText(
			this.player.score.toString(),
			(this.canvas.width / 2) - 300,
			200
		);

		

		// Desenhe a pontuação das pás (direita)
		this.context.fillText(
			this.paddle.score.toString(),
			(this.canvas.width / 2) + 300,
			200
		);

		// Alterar o tamanho da fonte para o texto da pontuação central
		this.context.font = '40px Courier New';
		

		// Empate a pontuação vencedora (centro)
		this.context.fillText(
			'Round ' + (Pong.round + 1),
			(this.canvas.width / 2),
			35
		);

		// Altere o tamanho da fonte para o valor da pontuação central
		this.context.font = '30px Courier';

		// Desenhe o número da rodada atual
		this.context.fillText(
			rounds[Pong.round] ? rounds[Pong.round] : rounds[Pong.round - 1],
			(this.canvas.width / 2),
			100
		);
	},

	loop: function () {
		Pong.update();
		Pong.draw();

		// Se o jogo não acabou, desenhe o próximo quadro.
		if (!Pong.over) requestAnimationFrame(Pong.loop);
	},

	listen: function () {
		document.addEventListener('keydown', function (key) {
			// Manipule a função 'Pressione qualquer tecla para começar' e inicie o jogo.
			if (Pong.running === false) {
				Pong.running = true;
				window.requestAnimationFrame(Pong.loop);
			}

			// Lidar com eventos de seta para cima e tecla W
			if (key.keyCode === 38 || key.keyCode === 87) Pong.player.move = DIRECTION.UP;

			// Lidar com eventos de tecla de seta para baixo e S
			if (key.keyCode === 40 || key.keyCode === 83) Pong.player.move = DIRECTION.DOWN;
		});

		// Pare o jogador de se mover quando não houver nenhuma tecla sendo pressionada.
		document.addEventListener('keyup', function (key) { Pong.player.move = DIRECTION.IDLE; });
	},

	// Redefina a localização da bola, o jogador vira e define um atraso antes do início da próxima rodada.
	_resetTurn: function(victor, loser) {
		this.ball = Ball.new.call(this, this.ball.speed);
		this.turn = loser;
		this.timer = (new Date()).getTime();

		victor.score++;
		point.play();
	},

	// Aguarde um atraso ter passado após cada turno.
	_turnDelayIsOver: function() {
		return ((new Date()).getTime() - this.timer >= 1000);
	},

	// Selecione uma cor aleatória como plano de fundo de cada nível/rodada.
	_generateRoundColor: function () {
		var newColor = colors[Math.floor(Math.random() * colors.length)];
		if (newColor === this.color) return Pong._generateRoundColor();
		return newColor;
	}
};

var Pong = Object.assign({}, Game);
Pong.initialize();



// TYPING NOME

const items = [
	'PONG',
	'RECRIADO POR',
	'SAMUEL CANDIDO',
	];
	
	const app = document.getElementById('app');
	let count = 0;
	let index = 0;
	let typingEffect = () => {
	  let text = items[index];
	  if (count < text.length) {
		setTimeout(() => {
		  app.innerHTML += text[count];
		  count++;
		  typingEffect();
		}, Math.floor(Math.random(10) * 100));
	  } else {
		count = 0;
		index = index + 1 < items.length ? index + 1 : 0;
		setTimeout(() => {
		  app.innerHTML = '';
		  typingEffect();
		}, 2900);
	  }
	};
	
	typingEffect();

	

	// DARK MODE

	const toggleMode = document.querySelector(".btn")

toggleMode.addEventListener("click", (e) => {
  const html = document.querySelector("html")
  if (html.classList.contains("dark")) {
      html.classList.remove("dark")
  e.target.innerHTML = "Dark Mode"
  } else {
    html.classList.add("dark")
    e.target.innerHTML = "Light Mode"
  }
})

