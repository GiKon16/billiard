import { FC, useRef, useEffect, useState } from 'react';
import styles from './Board.module.scss';
import ColorMenu from '../colorMenu/ColorMenu';

interface Ball {
    x: number,
    y: number,
    radius: number,
    color: string,
    isDragging: boolean,
    speedX: number,
    speedY: number
}

const Canvas: FC = () => {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);

    let selectedBall: Ball | null = null;
    const [selectedBallIndex, setSelectedBallIndex] = useState<number | null>(null);
    const [balls, setBalls] = useState<Ball[]>([
        { x: 465, y: 230, radius: 10, color: '#5749d1', isDragging: false, speedX: 0, speedY: 0 },
        { x: 420, y: 245, radius: 20, color: '#5749d1', isDragging: false, speedX: 0, speedY: 0 },
        { x: 510, y: 245, radius: 20, color: '#5749d1', isDragging: false, speedX: 0, speedY: 0 },
        { x: 555, y: 285, radius: 30, color: '#5749d1', isDragging: false, speedX: 0, speedY: 0 },
        { x: 465, y: 285, radius: 30, color: '#5749d1', isDragging: false, speedX: 0, speedY: 0 },
        { x: 375, y: 285, radius: 30, color: '#5749d1', isDragging: false, speedX: 0, speedY: 0 },
        { x: 330, y: 350, radius: 40, color: '#5749d1', isDragging: false, speedX: 0, speedY: 0 },
        { x: 420, y: 350, radius: 40, color: '#5749d1', isDragging: false, speedX: 0, speedY: 0 },
        { x: 510, y: 350, radius: 40, color: '#5749d1', isDragging: false, speedX: 0, speedY: 0 },
        { x: 600, y: 350, radius: 40, color: '#5749d1', isDragging: false, speedX: 0, speedY: 0 },

        { x: 700, y: 215, radius: 30, color: '#ffffff', isDragging: false, speedX: 0, speedY: 0 },
    ]); 

    const colors: string[] = [
        '#2663ad',
        '#a81b43',
        '#26943c',  
        '#5749d1',
        '#5fc6e8',
        '#96268f',
        '#c2602b',
        '#1e166b'
    ];
    const [isColorMenuOpen, setIsColorMenuOpen] = useState<boolean>(false);

    const handleColorChange = (color: string) => {
        if (selectedBallIndex !== null) {
            setBalls(prevBalls => {
                const updatedBalls: Ball[] = [...prevBalls];
                updatedBalls[selectedBallIndex].color = color;
                return updatedBalls;
            });
        }
        setIsColorMenuOpen(false);
    };

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const context = canvas.getContext('2d');
        if (!context) return;

        const drawBall = (ball: Ball) => {
            context.beginPath();
            context.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
            context.fillStyle = ball.color;
            context.fill();
            context.closePath();
        };

        const draw = () => {
            context.clearRect(0, 0, canvas.width, canvas.height);
            balls.forEach((ball) => {
                drawBall(ball);
                ball.x += ball.speedX;
                ball.y += ball.speedY;
                checkWallCollision(ball);
                applyFriction(ball);
            });
            checkCollisions();
        };

        const checkWallCollision = (ball: Ball) => {
            if (ball.x - ball.radius < 0 || ball.x + ball.radius > canvas.width) {
                ball.speedX *= -0.8; 
            }
            if (ball.y - ball.radius < 0 || ball.y + ball.radius > canvas.height) {
                ball.speedY *= -0.8; 
            }
        };

        const applyFriction = (ball: Ball) => {
            ball.speedX *= 0.99; 
            ball.speedY *= 0.99; 
        };

        const checkCollisions = () => {
            for (let i = 0; i < balls.length; i++) {
                for (let j = i + 1; j < balls.length; j++) {
                    const dx: number = balls[j].x - balls[i].x;
                    const dy: number = balls[j].y - balls[i].y;
                    const distance: number = Math.sqrt(dx * dx + dy * dy);

                    if (distance < balls[i].radius + balls[j].radius) {
                        const angle: number = Math.atan2(dy, dx);
                        const magnitude1: number = Math.sqrt(balls[i].speedX * balls[i].speedX + balls[i].speedY * balls[i].speedY);
                        const magnitude2: number = Math.sqrt(balls[j].speedX * balls[j].speedX + balls[j].speedY * balls[j].speedY);
                        const direction1: number = Math.atan2(balls[i].speedY, balls[i].speedX);
                        const direction2: number = Math.atan2(balls[j].speedY, balls[j].speedX);

                        const newspeedX1: number = magnitude1 * Math.cos(direction1 - angle);
                        const newspeedY1: number = magnitude1 * Math.sin(direction1 - angle);
                        const newspeedX2: number = magnitude2 * Math.cos(direction2 - angle);
                        const newspeedY2: number = magnitude2 * Math.sin(direction2 - angle);

                        const finalspeedX1: number = ((balls[i].radius - balls[j].radius) * newspeedX1 + (balls[j].radius + balls[j].radius) * newspeedX2) / (balls[i].radius + balls[j].radius);
                        const finalspeedX2: number = ((balls[i].radius + balls[i].radius) * newspeedX1 + (balls[j].radius - balls[i].radius) * newspeedX2) / (balls[i].radius + balls[j].radius);

                        const finalspeedY1: number = newspeedY1;
                        const finalspeedY2: number = newspeedY2;

                        balls[i].speedX = Math.cos(angle) * finalspeedX1 + Math.cos(angle + Math.PI / 2) * finalspeedY1;
                        balls[i].speedY = Math.sin(angle) * finalspeedX1 + Math.sin(angle + Math.PI / 2) * finalspeedY1;
                        balls[j].speedX = Math.cos(angle) * finalspeedX2 + Math.cos(angle + Math.PI / 2) * finalspeedY2;
                        balls[j].speedY = Math.sin(angle) * finalspeedX2 + Math.sin(angle + Math.PI / 2) * finalspeedY2;
                    }
                }
            }
        };

        const updateCanvas = () => {
            draw();
            requestAnimationFrame(updateCanvas);
        };

        updateCanvas();

        const handleMouseClick = (event: MouseEvent) => {
            const mouseX: number = event.clientX - canvas.offsetLeft;
            const mouseY: number = event.clientY - canvas.offsetTop;

            balls.forEach((ball) => {
                const dx: number = mouseX - ball.x;
                const dy: number = mouseY - ball.y;
                const distance: number = Math.sqrt(dx * dx + dy * dy);

                if (distance < ball.radius && !selectedBall) {
                    selectedBall = ball; 
                    selectedBall.isDragging = true;
                }
            });

            if (selectedBall && selectedBall.isDragging) {
                selectedBall.speedX = (mouseX - selectedBall.x) / 3;
                selectedBall.speedY = (mouseY - selectedBall.y) / 3;
                selectedBall.isDragging = false;
                selectedBall = null;
            }
        };

        const handleRightClick = (event: MouseEvent) => {
            const mouseX: number = event.clientX - canvas.offsetLeft;
            const mouseY: number = event.clientY - canvas.offsetTop;

            balls.forEach((ball, index) => {
                const dx: number = mouseX - ball.x;
                const dy: number = mouseY - ball.y;
                const distance: number = Math.sqrt(dx * dx + dy * dy);

                if (distance < ball.radius) {
                    event.preventDefault();
                    setSelectedBallIndex(index);
                    setIsColorMenuOpen(true);                 
                }
            });
        };

        canvas.addEventListener('click', handleMouseClick);
        canvas.addEventListener('contextmenu', handleRightClick);

        return () => {
            canvas.removeEventListener('click', handleMouseClick);
            canvas.removeEventListener('contextmenu', handleRightClick);
        };
    }, []);

    return (
        <>
        { 
            isColorMenuOpen && 
            <ColorMenu 
                colors={ colors } 
                handleColorChange={ handleColorChange } 
                closeColorMenu={ () => setIsColorMenuOpen(false) }/> 
        }
        <canvas 
            className={ styles.board } 
            ref={ canvasRef } 
            width={ 1000 } 
            height={ 500 } />
        </>
   );     
};

export default Canvas;