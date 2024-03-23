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
    const [colors, setColor] = useState<string[]>([
        '#2663ad',
        '#a81b43',
        '#26943c',
        '#5749d1',
        '#5fc6e8',
        '#96268f',
        '#c2602b',
        '#1e166b'
    ]);
    let selectedBall: Ball | null = null;
    const [balls, setBalls] = useState<Ball[]>([
        { x: 438.5, y: 144, radius: 20, color: '#5749d1', isDragging: false, speedX: 0, speedY: 0 },
        { x: 459, y: 180, radius: 20, color: '#5749d1', isDragging: false, speedX: 0, speedY: 0 },
        { x: 418, y: 180, radius: 20, color: '#5749d1', isDragging: false, speedX: 0, speedY: 0 },
        { x: 397.5, y: 215, radius: 20, color: '#5749d1', isDragging: false, speedX: 0, speedY: 0 },
        { x: 438.5, y: 215, radius: 20, color: '#5749d1', isDragging: false, speedX: 0, speedY: 0 },
        { x: 479.5, y: 215, radius: 20, color: '#5749d1', isDragging: false, speedX: 0, speedY: 0 },
        { x: 377, y: 250, radius: 20, color: '#5749d1', isDragging: false, speedX: 0, speedY: 0 },
        { x: 418, y: 250, radius: 20, color: '#5749d1', isDragging: false, speedX: 0, speedY: 0 },
        { x: 459, y: 250, radius: 20, color: '#5749d1', isDragging: false, speedX: 0, speedY: 0 },
        { x: 500, y: 250, radius: 20, color: '#5749d1', isDragging: false, speedX: 0, speedY: 0 },

        { x: 700, y: 215, radius: 20, color: '#ffffff', isDragging: false, speedX: 0, speedY: 0 },
    ]); 
    const [selectedBallIndex, setSelectedBallIndex] = useState<number | null>(null);
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

        const drawBall = (ball: any) => {
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

        const checkWallCollision = (ball: any) => {
            if (ball.x - ball.radius < 0 || ball.x + ball.radius > canvas.width) {
                ball.speedX *= -0.8; 
            }
            if (ball.y - ball.radius < 0 || ball.y + ball.radius > canvas.height) {
                ball.speedY *= -0.8; 
            }
        };

        const applyFriction = (ball: any) => {
            ball.speedX *= 0.99; 
            ball.speedY *= 0.99; 
        };

        const checkCollisions = () => {
            for (let i = 0; i < balls.length; i++) {
                for (let j = i + 1; j < balls.length; j++) {
                    const dx = balls[j].x - balls[i].x;
                    const dy = balls[j].y - balls[i].y;
                    const distance = Math.sqrt(dx * dx + dy * dy);

                    if (distance < balls[i].radius + balls[j].radius) {
                        const angle = Math.atan2(dy, dx);
                        const magnitude1 = Math.sqrt(balls[i].speedX * balls[i].speedX + balls[i].speedY * balls[i].speedY);
                        const magnitude2 = Math.sqrt(balls[j].speedX * balls[j].speedX + balls[j].speedY * balls[j].speedY);
                        const direction1 = Math.atan2(balls[i].speedY, balls[i].speedX);
                        const direction2 = Math.atan2(balls[j].speedY, balls[j].speedX);

                        const newspeedX1 = magnitude1 * Math.cos(direction1 - angle);
                        const newspeedY1 = magnitude1 * Math.sin(direction1 - angle);
                        const newspeedX2 = magnitude2 * Math.cos(direction2 - angle);
                        const newspeedY2 = magnitude2 * Math.sin(direction2 - angle);

                        const finalspeedX1 = ((balls[i].radius - balls[j].radius) * newspeedX1 + (balls[j].radius + balls[j].radius) * newspeedX2) / (balls[i].radius + balls[j].radius);
                        const finalspeedX2 = ((balls[i].radius + balls[i].radius) * newspeedX1 + (balls[j].radius - balls[i].radius) * newspeedX2) / (balls[i].radius + balls[j].radius);

                        const finalspeedY1 = newspeedY1;
                        const finalspeedY2 = newspeedY2;

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
            const mouseX = event.clientX - canvas.offsetLeft;
            const mouseY = event.clientY - canvas.offsetTop;

            balls.forEach((ball, index) => {
                const dx = mouseX - ball.x;
                const dy = mouseY - ball.y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < ball.radius && !selectedBall) {
                    selectedBall = ball; 
                    setSelectedBallIndex(index);
                    setIsColorMenuOpen(true);                 
                    selectedBall.isDragging = true;
                    console.log(selectedBall);
                }
            });

            if (selectedBall && selectedBall.isDragging) {
                selectedBall.speedX = (mouseX - selectedBall.x) / 3;
                selectedBall.speedY = (mouseY - selectedBall.y) / 3;
                selectedBall.isDragging = false;
                selectedBall = null;
            }
        };

        canvas.addEventListener('click', handleMouseClick);

        return () => {
            canvas.removeEventListener('click', handleMouseClick);
        };
    }, []);

    return (
        <>
        {isColorMenuOpen && <ColorMenu colors={ colors } handleColorChange={ handleColorChange }/>}
        <canvas 
            className={ styles.board } 
            ref={ canvasRef } 
            width={ 1000 } 
            height={ 500 } />
        </>
   );     
};

    export default Canvas;