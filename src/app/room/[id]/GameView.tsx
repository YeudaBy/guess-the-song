"use client"

import {useCallback, useEffect, useRef, useState} from 'react';
import {Track} from '@/server/entities/Track';
import {Participant} from "@/server/entities/Participant";
import {Card, Icon, Text, Title} from "@tremor/react";
import {RiCheckboxCircleFill, RiCloseCircleFill, RiQuestionMark} from "@remixicon/react";
import {TrackMetadata} from "@/server/sp-fetcher";
import {Room, TrackInRoom} from "@/server/entities/Room";
import {repo} from "remult";


export function GameManager({room, currentPlayer, onGameEnds}: {
    room: Room
    currentPlayer: Participant;
    onGameEnds: () => void
}) {
    const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
    const [scores, setScores] = useState<{ [key: string]: number }>({});
    const [ready, setReady] = useState(3)

    console.log({room, currentPlayer})

    const handleGuess = (correct: boolean, timeRemaining: number, totalDuration: number) => {
        if (correct) {
            const pointsEarned = Math.ceil(
                5 * (timeRemaining / totalDuration)
            );
            setScores(prev => ({
                ...prev,
                // @ts-ignore todo
                [currentPlayer.name]: (prev[currentPlayer.naem] || 0) + pointsEarned
            }));
        }

        if (currentTrackIndex < room.tracks!.length - 1) {
            setCurrentTrackIndex(prev => prev + 1);
        } else {
            onGameEnds()
        }
    };

    useEffect(() => {
        // start-up countdown
        if (ready <= 0) return;

        const timer = setTimeout(() => {
            setReady(prev => prev - 1);
        }, 1000);

        return () => clearTimeout(timer);
    }, [ready]);

    if (ready !== 0) return (
        <Card className={"flex flex-col items-center"}>
            <Title>מוכנים?</Title>

            <Text className={"text-9xl"}>{ready}</Text>
        </Card>
    )

    return (
        <div>
            <Text>
                Score:
            </Text>
            {
                Object.entries(scores).map(([name, score]) => {
                    return <Text>
                        {name}: {score}
                    </Text>
                })
            }
            <GameView
                track={room.tracks![currentTrackIndex]}
                duration={room.songDuration}
                onGuess={handleGuess}
            />
        </div>
    );
}


export function GameView({track, duration, onGuess}: {
    track: TrackInRoom;
    duration: number;
    onGuess: (correct: boolean, timeLeft: number, duration: number) => void;
}) {
    const [gameState, setGameState] = useState({
        metadata: null as TrackMetadata | null,
        audioSrc: "",
        loading: true,
        timeLeft: duration,
        options: [] as string[],
        showHint: false,
        selectedOption: null as string | null,
        isRevealing: false,
        shouldAdvance: false,
        isAudioLoaded: false,
        error: null as string | null
    });

    useEffect(() => {
        console.log(gameState)
    }, [gameState]);

    useEffect(() => {
        setGameState(prevState => ({
            ...prevState,
            audioSrc: prevState.metadata?.audioPreview || ""
        }))
    }, [gameState.metadata]);

    const audioRef = useRef<HTMLAudioElement>(null);
    const timerRef = useRef<NodeJS.Timeout>();
    const errorTimeoutRef = useRef<NodeJS.Timeout>();
    const soundRefs = {
        correct: useRef<HTMLAudioElement>(null),
        wrong: useRef<HTMLAudioElement>(null)
    };

    const cleanup = useCallback(() => {
        if (timerRef.current) {
            clearInterval(timerRef.current);
        }
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
        }
        if (errorTimeoutRef.current) {
            clearTimeout(errorTimeoutRef.current);
        }
    }, []);

    // Game setup effect
    useEffect(() => {
        const prepare = async () => {
            try {
                setGameState(prev => ({...prev, loading: true, error: null, metadata: track.metadata}));

                const randomNames = await repo(Track).find({
                    orderBy: {randomValue: "asc"}, limit: 5
                })

                const uniqueOptions = [...new Set([track.track?.name, ...randomNames.map((e: any) => e.name)])];
                const shuffledOptions = uniqueOptions
                    .sort(() => Math.random() - 0.5)
                    .slice(0, 4); // Limit to 4 options

                setGameState(prev => ({
                    ...prev,
                    options: shuffledOptions,
                    loading: false,
                    timeLeft: duration,
                    showHint: false,
                    selectedOption: null,
                    isRevealing: false,
                    shouldAdvance: false
                }));
            } catch (error) {
                console.error('Error preparing game:', error);
                setGameState(prev => ({
                    ...prev,
                    loading: false,
                    error: error instanceof Error ? error.message : 'An unexpected error occurred'
                }));

                // Auto-advance after error
                errorTimeoutRef.current = setTimeout(() => {
                    onGuess(false, 0, duration);
                }, 3000);
            }
        };

        cleanup();
        prepare();

        return cleanup;
    }, [track, duration, cleanup, onGuess]);

    // Audio setup effect
    useEffect(() => {
        if (!gameState.audioSrc || !audioRef.current) return;

        const audio = audioRef.current;

        const handleCanPlay = () => {
            setGameState(prev => ({...prev, isAudioLoaded: true}));
            audio.play()
                .then(() => startTimer())
                .catch(error => {
                    console.error('Audio playback failed:', error);
                    setGameState(prev => ({
                        ...prev,
                        error: 'Failed to play audio. Please check your audio settings.'
                    }));
                });
        };

        audio.src = gameState.audioSrc;
        audio.load();
        audio.addEventListener('canplay', handleCanPlay);

        return () => {
            audio.removeEventListener('canplay', handleCanPlay);
            audio.pause();
            audio.currentTime = 0;
        };
    }, [gameState.audioSrc]);

    const startTimer = useCallback(() => {
        if (timerRef.current) clearInterval(timerRef.current);

        const startTime = Date.now();
        const initialTimeLeft = gameState.timeLeft;

        timerRef.current = setInterval(() => {
            const elapsedSeconds = Math.floor((Date.now() - startTime) / 1000);
            const newTimeLeft = Math.max(0, initialTimeLeft - elapsedSeconds);

            if (newTimeLeft <= 0) {
                if (timerRef.current) clearInterval(timerRef.current);
                handleTimeUp();
                return;
            }

            setGameState(prev => ({...prev, timeLeft: newTimeLeft}));
        }, 100);
    }, [gameState.timeLeft]);

    const handleTimeUp = useCallback(() => {
        cleanup();
        setGameState(prev => ({
            ...prev,
            selectedOption: track.track!.name,
            isRevealing: true
        }));

        if (window.navigator.vibrate) {
            window.navigator.vibrate(1000);
        }

        // soundRefs.wrong.current?.play(); todo

        setTimeout(() => {
            setGameState(prev => ({...prev, shouldAdvance: true}));
            onGuess(false, 0, duration);
        }, 2000);
    }, [cleanup, track, duration, onGuess]);

    const handleSubmitGuess = useCallback((option: string) => {
        const audio = audioRef.current
        cleanup();
        const isCorrect = option === track.track!.name;

        setGameState(prev => ({
            ...prev,
            selectedOption: option,
            isRevealing: true
        }));

        if (window.navigator.vibrate) {
            window.navigator.vibrate(isCorrect ? [100, 100, 100] : [500]);
        }

        // const soundRef = isCorrect ? soundRefs.correct : soundRefs.wrong;
        const soundSrc = isCorrect ? "/sounds/right.wav" : "/sounds/wrong.wav";
        setGameState(prevState => ({
            ...prevState,
            audioSrc: soundSrc
        }))
        audioRef.current?.play();
        audioRef.current?.addEventListener("ended", () => {
            setGameState(prevState => ({
                ...prevState,
                audioSrc: ""
            }))
        })

        const finalTimeLeft = gameState.timeLeft;

        setTimeout(() => {
            setGameState(prev => ({...prev, shouldAdvance: true}));
            onGuess(isCorrect, finalTimeLeft, duration);
        }, 2000);
    }, [cleanup, track, gameState.timeLeft, duration, onGuess]);

    return (
        <Card style={{
            background: hexToRgba(gameState.metadata?.baseColor || '#000000', 50),
            transition: 'background .3s ease'
        }} className={`h-full w-full flex flex-col`}>
            <div className="flex-1 flex flex-col p-2">
                {gameState.loading ? (
                    <div className="flex-1 flex justify-center items-center">
                        <Text>טוען משחק...</Text>
                    </div>
                ) : gameState.error ? (
                    <div className="flex-1 flex justify-center items-center flex-col gap-4">
                        <Text className="text-red-500">{gameState.error}</Text>
                    </div>
                ) : (
                    <>
                        <div className="flex justify-between items-center mb-4">
                            <Title>נחש את השיר</Title>
                            <Text className="text-lg font-semibold">
                                {gameState.timeLeft} שניות
                            </Text>
                        </div>

                        {gameState.metadata?.imageUrl && (
                            <div className="relative w-full aspect-[1/1] mb-4">
                                <div
                                    className={`
                    absolute inset-0 rounded-xl overflow-hidden
                    transition-all duration-1000 ease-in-out
                    ${gameState.showHint ? 'opacity-100' : 'opacity-0'}
                  `}
                                >
                                    <img
                                        src={gameState.metadata.imageUrl}
                                        alt="רמז"
                                        className={`
                      w-full h-full object-cover
                      transition-all duration-1000
                      ${gameState.showHint ? 'blur-sm scale-105' : 'blur-none scale-100'}
                    `}
                                    />
                                </div>
                                {!gameState.showHint && (
                                    <div
                                        className="absolute inset-0 flex flex-col items-center justify-center bg-gray-100 rounded-xl">
                                        <Icon icon={RiQuestionMark} className="w-16 h-16 text-gray-400 mb-2"/>
                                        <button
                                            onClick={() => setGameState(prev => ({...prev, showHint: true}))}
                                            className="px-4 py-2 bg-white rounded-lg shadow hover:shadow-md transition-all"
                                        >
                                            הצג רמז
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}

                        <div className="grid grid-cols-1 gap-3">
                            {gameState.options.map(option => {
                                const isSelected = gameState.selectedOption === option;
                                const isCorrect = option === track.track!.name;
                                const shouldShow = !gameState.isRevealing || isSelected || isCorrect;

                                return (
                                    <button
                                        key={option}
                                        onClick={() => !gameState.isRevealing && handleSubmitGuess(option)}
                                        className={`
                      relative overflow-hidden
                      p-4 rounded-xl text-right transition-all
                      ${shouldShow ? 'opacity-100 transform scale-100' : 'opacity-50 transform scale-95'}
                      ${!gameState.isRevealing
                                            ? 'hover:bg-blue-50 bg-white border border-gray-200'
                                            : isCorrect
                                                ? 'bg-green-100 border-2 border-green-500'
                                                : isSelected
                                                    ? 'bg-red-100 border-2 border-red-500'
                                                    : 'bg-gray-100 border border-gray-300'
                                        }
                    `}
                                        disabled={gameState.isRevealing}
                                    >
                                        <div className="flex justify-between items-center">
                      <span className={gameState.isRevealing && isCorrect ? 'font-bold' : ''}>
                        {option}
                      </span>
                                            {gameState.isRevealing && (isSelected || isCorrect) && (
                                                <Icon
                                                    icon={isCorrect ? RiCheckboxCircleFill : RiCloseCircleFill}
                                                    className={`h-6 w-6 ${isCorrect ? 'text-green-500' : 'text-red-500'}`}
                                                />
                                            )}
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </>
                )}
            </div>

            <audio ref={audioRef}/>
            <audio ref={soundRefs.correct} src="/sounds/right.wav"/>
            <audio ref={soundRefs.wrong} src="/sounds/wrong.wav"/>


            <pre
                className={"bg-tremor-background-emphasis text-white fixed bottom-5 right-0 left-0 text-xs break-words"}>
                {JSON.stringify(gameState)}
            </pre>
        </Card>
    );
}


function shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}


function hexToRgba(hex: string, alpha: number): string {
    const r = parseInt(hex.slice(1, 3), 16)
    const g = parseInt(hex.slice(3, 5), 16)
    const b = parseInt(hex.slice(5, 7), 16)
    const a = +(alpha / 255).toFixed(2)
    return `rgba(${r}, ${g}, ${b}, ${a})`
}
