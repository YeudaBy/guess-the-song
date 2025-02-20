"use client"

import {useCallback, useEffect, useRef, useState} from 'react';
import {Track} from '@/server/entities/Track';
import {Participant} from "@/server/entities/Participant";
import {Button, Card, Icon, Text, Title} from "@tremor/react";
import {RiCheckboxCircleFill, RiCloseCircleFill, RiQuestionMark} from "@remixicon/react";
import {TrackMetadata} from "@/server/sp-fetcher";
import {TrackInRoom} from "@/server/entities/Room";

interface GameViewProps {
    track: TrackInRoom;
    duration: number;
    onGuess: (correct: boolean, timeLeft: number, duration: number) => void;
}

export function GameView({track, duration, onGuess}: GameViewProps) {
    const [gameState, setGameState] = useState({
        metadata: null as TrackMetadata | null,
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
                setGameState(prev => ({...prev, loading: true, error: null}));


                const randomNames = await Track.getRandom(5);

                const uniqueOptions = [...new Set([track.track?.name, ...randomNames.map((e: any) => e.name)])];
                const shuffledOptions = uniqueOptions
                    .sort(() => Math.random() - 0.5)
                    .slice(0, 4); // Limit to 4 options

                setGameState(prev => ({
                    ...prev,
                    metadata: track.metadata,
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
        if (!gameState.metadata?.audioPreview || !audioRef.current) return;

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

        const handleEnded = () => {
            // Only restart if not revealing answer
            if (!gameState.isRevealing) {
                audio.currentTime = 0;
                audio.play().catch(console.error);
            }
        };

        audio.src = gameState.metadata.audioPreview;
        audio.load();
        audio.addEventListener('canplay', handleCanPlay);
        audio.addEventListener('ended', handleEnded);

        return () => {
            audio.removeEventListener('canplay', handleCanPlay);
            audio.removeEventListener('ended', handleEnded);
            audio.pause();
            audio.currentTime = 0;
        };
    }, [gameState.metadata?.audioPreview, gameState.isRevealing]);

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

        soundRefs.wrong.current?.play();

        setTimeout(() => {
            setGameState(prev => ({...prev, shouldAdvance: true}));
            onGuess(false, 0, duration);
        }, 2000);
    }, [cleanup, track, duration, onGuess]);

    const handleSubmitGuess = useCallback((option: string) => {
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

        const soundRef = isCorrect ? soundRefs.correct : soundRefs.wrong;
        soundRef.current?.play();

        const finalTimeLeft = gameState.timeLeft;

        setTimeout(() => {
            setGameState(prev => ({...prev, shouldAdvance: true}));
            onGuess(isCorrect, finalTimeLeft, duration);
        }, 2000);
    }, [cleanup, track, gameState.timeLeft, duration, onGuess]);

    return (
        <Card className="h-[100dvh] flex flex-col overflow-hidden">
            <div className="flex-1 flex flex-col p-4 overflow-y-auto">
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
                            <Text className="text-lg font-semibold animate-pulse">
                                {gameState.timeLeft} שניות
                            </Text>
                        </div>

                        {gameState.metadata?.imageUrl && (
                            <div className="relative w-full aspect-[2/1] mb-4">
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
                      ${gameState.showHint ? 'blur-md scale-105' : 'blur-none scale-100'}
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
        </Card>
    );
}


interface GameManagerProps {
    tracks: TrackInRoom[];
    duration: number;
    currentPlayer: Participant;
}

export function GameManager({
                                tracks,
                                duration,
                                currentPlayer
                            }: GameManagerProps) {
    const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
    const [scores, setScores] = useState<{ [key: string]: number }>({});
    const [ready, setReady] = useState(false)

    const handleGuess = (correct: boolean, timeRemaining: number, totalDuration: number) => {
        if (correct) {
            const pointsEarned = Math.ceil(
                5 * (timeRemaining / totalDuration)
            );
            setScores(prev => ({
                ...prev,
                // @ts-ignore todo
                [currentPlayer.id]: (prev[currentPlayer.id] || 0) + pointsEarned
            }));
        }

        if (currentTrackIndex < tracks.length - 1) {
            setCurrentTrackIndex(prev => prev + 1);
        } else {
        }
    };

    if (!ready) return (
        <Card>
            <Text>מוכנים?</Text>
            <Button onClick={() => setReady(true)}>
                בואו נצא לדרך!
            </Button>
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
                track={tracks[currentTrackIndex]}
                duration={duration}
                onGuess={handleGuess}
            />
        </div>
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
