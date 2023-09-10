import './style.css';
import { createRoot } from 'react-dom/client';
import { Suspense, useEffect, useState, useRef, StrictMode } from 'react';
import { Canvas } from '@react-three/fiber';
import { gsap } from 'gsap';
import { useDetectGPU, PerformanceMonitor, useProgress, Html } from '@react-three/drei';
import ConfettiExplosion from 'react-confetti-explosion';
import Experience from './Experience.jsx';
import useGame from './stores/Game.jsx';
import UserControls from './UserControls';
import MainMenu from './MainMenu.jsx';
import Keyboard from './Keyboard.jsx';

const rootElement = document.getElementById('root');
const root = createRoot(rootElement);

function App() {
	const [countdownSound] = useState(() => new Audio('./static/countdown.mp3'));
  const [countdownStartSound] = useState(() => new Audio('./static/countdown-start.mp3'));
	const [clickSound] = useState(() => new Audio('./static/click.mp3'));
  const [gameStarted, setGameStarted] = useState(false);
  const GPUTier = useDetectGPU();
  const [perfomanceMode, setPerfomanceMode] = useState(0);
  const [dpr, setDpr] = useState(0.5);
	const [minDpr, setMinDpr] = useState(0.5);
	const [maxDpr, setMaxDpr] = useState(0.8);
	const [frenchKeyboard, setFrenchKeyboard] = useState(false);
	const keyboardContent = useRef(null);
	const loadingRef = useRef(null);
	const countdownValue = useRef(null);
	const [loadingStatus, setLoadingStatus] = useState(false);
	const [gameLoaded, setGameLoaded] = useState(false);
	const [gamePaused, setGamePaused] = useState(false);
	const [gamePlaying, setGamePlaying] = useState(false);
	const [pauseMenu, setPauseMenu] = useState(false);
	const [finishStatus, setFinishStatus] = useState(false);
	const finishStats = useRef(null);
	const finishTime = useRef(null);
	const [isExploding, setIsExploding] = useState(false);
	const pauseMenuRef = useRef(null);
	const [countdownStatus, setCountdownStatus] = useState(false);
	const [restartStatus, setRestartStatus] = useState(false);
	const countdown = useGame((state) => state.countdown);
	const start = useGame((state) => state.startGame);
	const pause = useGame((state) => state.pause);
	const resume = useGame((state) => state.resume);
	const restart = useGame((state) => state.restart);
	
	useEffect(() => { 
		console.log(
			`Welcome to Circuit Rush! 🚗\nHope you have fun with this game :)\n\nRepository: %chttps://github.com/iaruso/circuit-rush%c`,
			"color: #e55555; text-decoration: underline; cursor: pointer"
		);
	}, []);

	useEffect(() => {
		const language = navigator.language;
		if (language.startsWith('fr')) {
			setFrenchKeyboard(true);
		} else {
			setFrenchKeyboard(false);
		}
	}, [frenchKeyboard]);

	useEffect(() => {
		GPUTier.fps > 60 ? setPerfomanceMode(2) : GPUTier.fps > 30 ? setPerfomanceMode(1) : setPerfomanceMode(0);
		if (perfomanceMode == 2) {
			setDpr(1);
			setMinDpr(0.8);
			setMaxDpr(2);
		} else if ( perfomanceMode == 1) {
			setDpr(0.8);
			setMinDpr(0.6);
			setMaxDpr(1.2);
		} else {
			setDpr(0.5);
			setMinDpr(0.5);
			setMaxDpr(0.8);
		}
	}, [perfomanceMode]);

	const { phase, startTime, endTime } = useGame((state) => state);

	const quitButton = () => {
		setTimeout(() => {
    	window.location.reload();
		}, 500);
	};

	const handleCanvasKeyDown = (event) => { 
		if (!gameStarted || !gameLoaded) {
			event.preventDefault();
		}
	};

	const handleKeyDown = (event) => {
		if (event.key === 'Enter') {
			if (loadingStatus && !gamePlaying) {
				clickSound.volume = 0.05;
				clickSound.play();
				setGamePlaying(true);
				setTimeout (() => {
					setGameLoaded(true);
					setCountdownStatus(true);
					countdown();
				}, 200);
			}
		}
		if (event.key === 'p' || event.key === 'P') {
			if (phase === 'playing') {
				setPauseMenu(true);
				setGamePaused(true);
			}
		}
		if (event.key === 'Escape') {
			if (phase === 'playing' || phase === 'paused' || phase === 'ended') {
				quitButton();
			}
		}
	};
	
	const resumeButton = () => {
		gsap.to(pauseMenuRef.current, {opacity: 0, duration: 0.8 });
		setTimeout(() => {
			setGamePaused(false);
			setPauseMenu(false);
		}, 500);
	};

	const restartButton = () => {
		if (phase === 'ended') {
			setCountdownStatus(false);
			setFinishStatus(false);
			setTimeout(() => { 
				setCountdownStatus(true);
			}, 2000);
		}
		if (phase === 'paused')  {
			setTimeout(() => { 
				setCountdownStatus(true);
			}, 2000);
		}
		setPauseMenu(false);
		setRestartStatus(true);
		setTimeout(() => {
			setRestartStatus(false);
			setGamePaused(false);
			restart();
		}, 1000);
	};

	useEffect(() => { 
		if (gamePaused) {
			pause();
		} else {
			resume();
		}
	}, [gamePaused]);

	useEffect(() => {
		if (phase === 'loading') {
			setTimeout(() => { 
				setGameStarted(true);
			}, 200);
		}
	}, [phase]);

	useEffect(() => { 
    function padWithZero(number, width = 2) {
			const paddedNumber = String(number);
			return paddedNumber.padStart(width, '0');
    }
    
    if (phase === 'ended') {
			setFinishStatus(true);
			let elapsedTime = 0;
			elapsedTime = endTime - startTime;
			const minutes = Math.floor((elapsedTime / 60000) % 60);
			const seconds = Math.floor((elapsedTime / 1000) % 60);
			const milliseconds = elapsedTime % 1000;

			const formattedTime = `${padWithZero(minutes)}:${padWithZero(seconds)}:${padWithZero(milliseconds, 3)}`;
			
			let currentRecordTime = localStorage.getItem('currentRecordTime');
			let timeDifference = 0;
			setTimeout(() => { 
				gsap.to(finishStats.current, {opacity: 1, duration: 1.5 });
				if (!currentRecordTime) {
					setIsExploding(true);
					currentRecordTime = '';
					localStorage.setItem('currentRecordTime', elapsedTime);
					setTimeout(() => { 
						finishTime.current.innerHTML = formattedTime;
						setIsExploding(true);
					}, 200);
				} else if (currentRecordTime > elapsedTime) { 
					localStorage.setItem('currentRecordTime', elapsedTime);
					timeDifference = currentRecordTime - elapsedTime;
					const minutes = Math.floor((timeDifference / 60000) % 60);
					const seconds = Math.floor((timeDifference / 1000) % 60);
					const milliseconds = timeDifference % 1000;
					const formattedTimeDifference = `${padWithZero(minutes)}:${padWithZero(seconds)}:${padWithZero(milliseconds, 3)}`;
					setTimeout(() => {
						setIsExploding(true);
						finishTime.current.innerHTML = formattedTime + '<br><span class="better-time">(-' + formattedTimeDifference + ')</span>';
					}, 200);
				} else if (currentRecordTime < elapsedTime) { 
					timeDifference =  elapsedTime - currentRecordTime;
					const minutes = Math.floor((timeDifference / 60000) % 60);
					const seconds = Math.floor((timeDifference / 1000) % 60);
					const milliseconds = timeDifference % 1000;
					const formattedTimeDifference = `${padWithZero(minutes)}:${padWithZero(seconds)}:${padWithZero(milliseconds, 3)}`;
					setTimeout(() => { 
						finishTime.current.innerHTML = formattedTime + '<br><span class="worse-time">(+' + formattedTimeDifference + ')</span>';
					}, 200);
				} else {
					setTimeout(() => { 
						finishTime.current.innerHTML = formattedTime;
					}, 200);
				}
			}, 200);
		}
	}, [phase]);

	useEffect(() => {
		let timer;
		const countdown = async () => {
			for (let count = 3; count >= 1; count--) {
				countdownValue.current.textContent = count;
				gsap.fromTo(countdownValue.current, { opacity: 1, scale: 1.2 }, { opacity: 0, scale: 1, duration: 0.6, delay: 0.4 });
				countdownSound.volume = 0.1;
				countdownSound.play();
				await delay(1000);
			}
			countdownValue.current.textContent = 'GO';
			gsap.fromTo(countdownValue.current, { opacity: 1, scale: 1.2 }, { opacity: 0, scale: 1, duration: 0.6, delay: 0.4 });
			countdownStartSound.volume = 0.1;
			countdownStartSound.play();
			setTimeout(() => {
				setCountdownStatus(false);
			}, 1000);
			setTimeout(() => { 
				start();
			}, 200);
		};

		const delay = (ms) => {
			return new Promise((resolve) => setTimeout(resolve, ms));
		};

		if (countdownStatus) {
			timer = setTimeout(countdown, 500);
		}

		return () => {
			clearTimeout(timer);
		};
	}, [countdownStatus]);

	useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [gameStarted, gameLoaded, loadingStatus, phase]);

	useEffect(() => {
    if (keyboardContent.current) {
			const keyboardElement = keyboardContent.current;
			const animation = gsap.fromTo(
				keyboardElement,
				{ opacity: 0 },
				{ opacity: 1, duration: 1.5 }
			);
			return () => {
				animation.kill();
      	clearTimeout(timeout);
    	};
    }
  }, [gameStarted, keyboardContent]);

	useEffect(() => {
		if (loadingStatus) {
			const textElement = loadingRef.current;
			const animation = gsap.fromTo(
				textElement,
				{ opacity: 0 },
				{ opacity: 1, yoyo: true, repeat: -1, duration: 1, ease: 'power2.inOut' }
			);
			return () => {
				animation.kill();
			};
		}
	}, [loadingStatus]);


	function Loader() {
		const { progress } = useProgress()
		loadingRef.current.textContent = progress.toFixed(0) + '%';
		if ( progress > 99.9 ) {
			setTimeout(() => {
				setLoadingStatus(true);
				loadingRef.current.textContent = 'PRESS ENTER TO PLAY';
			}, 2000);
		}
		return <></>
	}

  return (
		<>
			{!gameStarted ? (
				<MainMenu />
			) : (
				<>
					{!gameLoaded ? (
						<div className='loading-screen'>
							<div className="keyboard-controls" ref={keyboardContent}>
								<Keyboard keyboardType={frenchKeyboard} />
							</div>
							<div ref={loadingRef} className="loading-info"></div>
						</div>
					) : null}
					<UserControls>
						<Canvas
							onKeyDown={handleCanvasKeyDown}
							dpr={dpr}
							shadows={perfomanceMode > 0 ? 'soft' : 'basic'}
						>
							<Suspense fallback={<Loader />}>
							{!restartStatus?
								<>
									<color attach="background" args={['#F7F7F7']} />
									<PerformanceMonitor onIncline={() => setDpr(minDpr)} onDecline={() => setDpr(maxDpr)}>
										<Experience perfomanceMode={perfomanceMode} />
									</PerformanceMonitor>
								</>
								: null
							}
							</Suspense>
							{countdownStatus ? 
								<Html wrapperClass={'countdown-overlay'} className='countdown-stats'>
									<p ref={countdownValue} className='countdown-value'></p>
								</Html>
								: null
							}
							{pauseMenu ? 
								<Html wrapperClass={'pause-overlay'} className='pause-stats' ref={pauseMenuRef}>
									<button onClick={resumeButton}>RESUME</button>
									<button onClick={restartButton}>RESTART</button>
									<button onClick={quitButton}>QUIT</button>
								</Html>
								: null
							}
							{finishStatus ? 
								<Html wrapperClass={'finish-overlay'} className='finish-stats' ref={finishStats}>
									<>{isExploding && <ConfettiExplosion force={0.4} duration={3000} particleCount={60} width={600} colors={['#e55555', '#ba3636', '#e55555']}/>}</>
									<div className="finish-time" ref={finishTime}></div>
									<button onClick={restartButton}>RESTART</button>
									<button onClick={quitButton}>QUIT</button>
								</Html>
								: null
							}
						</Canvas>
					</UserControls>
				</>
			)}
		</>
	);
}

root.render(
	<App />
);