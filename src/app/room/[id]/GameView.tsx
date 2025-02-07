"use client"

import {useEffect, useRef, useState} from 'react';
import {Track} from '@/server/entities/Track';
import {Participant} from "@/server/entities/Participant";
import {Button, Card, Icon, Text, Title} from "@tremor/react";
import {repo} from "remult";
import {RiCheckboxCircleFill, RiCloseCircleFill, RiQuestionMark} from "@remixicon/react";

interface GameViewProps {
    track: Track;
    duration: number;
    onGuess: (correct: boolean, timeLeft: number, duration: number) => void;
}

const trackRepo = repo(Track)

interface TrackMetadata {
    audioPreview: string;
    imageUrl?: string;
}

export function GameView({track, duration, onGuess}: GameViewProps) {
    const [metadata, setMetadata] = useState<TrackMetadata>();
    const [loading, setLoading] = useState(false);
    const [timeLeft, setTimeLeft] = useState(duration);
    const [options, setOptions] = useState<string[]>([]);
    const [showHint, setShowHint] = useState(false);
    const [selectedOption, setSelectedOption] = useState<string | null>(null);
    const [isRevealing, setIsRevealing] = useState(false);
    const [shouldAdvance, setShouldAdvance] = useState(false);
    const [isAudioLoaded, setIsAudioLoaded] = useState(false);

    const audioRef = useRef<HTMLAudioElement>(null);
    const timerRef = useRef<NodeJS.Timeout>();
    const correctSoundRef = useRef<HTMLAudioElement>(null);
    const wrongSoundRef = useRef<HTMLAudioElement>(null);

    // Effect for game setup
    useEffect(() => {
        const prepare = async () => {
            try {
                setLoading(true);
                setIsAudioLoaded(false);

                const newMetadata = await track.getMetadata();
                setMetadata(newMetadata);

                const response = await fetch("/api/random-name");
                if (!response.ok) throw new Error('Failed to fetch random names');

                const randomNames = await response.json();
                const uniqueOptions = [...new Set([track.name, ...randomNames])];
                const shuffledOptions = shuffleArray(uniqueOptions);
                setOptions(shuffledOptions);
            } catch (error) {
                console.error('Error preparing game:', error);
            } finally {
                setLoading(false);
            }
        };

        cleanup();
        setTimeLeft(duration);
        setShowHint(false);
        setSelectedOption(null);
        setIsRevealing(false);
        setShouldAdvance(false);

        prepare();

        return () => cleanup();
    }, [track, duration]);

    // Separate effect for audio setup and autoplay
    useEffect(() => {
        if (!metadata?.audioPreview || !audioRef.current) return;

        const audio = audioRef.current;

        const handleCanPlay = () => {
            setIsAudioLoaded(true);
            audio.play()
                .then(() => startTimer())
                .catch(error => console.error('Audio playback failed:', error));
        };

        const handleEnded = () => {
            audio.currentTime = 0;
            audio.play().catch(console.error);
        };

        audio.src = metadata.audioPreview;
        audio.load();
        audio.addEventListener('canplay', handleCanPlay);
        audio.addEventListener('ended', handleEnded);

        return () => {
            audio.removeEventListener('canplay', handleCanPlay);
            audio.removeEventListener('ended', handleEnded);
            audio.pause();
            audio.currentTime = 0;
        };
    }, [metadata?.audioPreview]);

    const cleanup = () => {
        if (timerRef.current) {
            clearInterval(timerRef.current);
        }
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
        }
    };

    const startTimer = () => {
        if (timerRef.current) clearInterval(timerRef.current);

        const startTime = Date.now();
        const initialTimeLeft = timeLeft;

        timerRef.current = setInterval(() => {
            const elapsedSeconds = Math.floor((Date.now() - startTime) / 1000);
            const newTimeLeft = Math.max(0, initialTimeLeft - elapsedSeconds);

            if (newTimeLeft <= 0) {
                if (timerRef.current) clearInterval(timerRef.current);
                handleTimeUp();
                return;
            }

            setTimeLeft(newTimeLeft);
        }, 100);
    };

    const handleTimeUp = () => {
        cleanup();
        setSelectedOption(track.name);
        setIsRevealing(true);
        window.navigator.vibrate?.(1000);
        wrongSoundRef.current?.play();

        setTimeout(() => {
            setShouldAdvance(true);
            onGuess(false, 0, duration);
        }, 2000);
    };

    const handleSubmitGuess = async (option: string) => {
        cleanup();
        setSelectedOption(option);
        setIsRevealing(true);

        const isCorrect = option === track.name;

        window.navigator.vibrate?.(isCorrect ? [100, 100, 100] : [500]);
        if (isCorrect) {
            correctSoundRef.current?.play();
        } else {
            wrongSoundRef.current?.play();
        }

        // Keep the current timeLeft value for the duration of the reveal
        const finalTimeLeft = timeLeft;

        setTimeout(() => {
            setShouldAdvance(true);
            onGuess(isCorrect, finalTimeLeft, duration);
        }, 2000);
    };

    return (
        <Card className="min-h-[100dvh] max-h-[100dvh] flex flex-col">
            <div className="flex-1 flex flex-col p-4 overflow-hidden">
                {loading ? (
                    <div className="flex-1 flex justify-center items-center">
                        <Text>טוען משחק...</Text>
                    </div>
                ) : (
                    <>
                        <div className="flex justify-between items-center mb-4 shrink-0">
                            <Title>נחש את השיר</Title>
                            <Text className="text-lg font-semibold animate-pulse">
                                {timeLeft} שניות
                            </Text>
                        </div>

                        {metadata?.imageUrl && (
                            <div className="relative w-full aspect-square mb-4 shrink-0">
                                <div className={`
                                    absolute inset-0 rounded-xl overflow-hidden
                                    transition-all duration-1000 ease-in-out
                                    ${showHint ? 'opacity-100' : 'opacity-0'}
                                `}>
                                    <img
                                        src={metadata.imageUrl}
                                        alt="רמז"
                                        className={`
                                            w-full h-full object-cover
                                            transition-all duration-1000
                                            ${showHint ? 'blur-md scale-105' : 'blur-none scale-100'}
                                        `}
                                    />
                                </div>
                                {!showHint && (
                                    <div
                                        className="absolute inset-0 flex flex-col items-center justify-center bg-gray-100 rounded-xl">
                                        <Icon icon={RiQuestionMark} className="w-20 h-20 text-gray-400 mb-2"/>
                                        <button
                                            onClick={() => setShowHint(true)}
                                            className="px-4 py-2 bg-white rounded-lg shadow hover:shadow-md transition-all"
                                        >
                                            הצג רמז
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}

                        <div className="flex-1 overflow-y-auto min-h-0 pb-4">
                            <div className="grid grid-cols-1 gap-3">
                                {options.map((option) => {
                                    const isSelected = selectedOption === option;
                                    const isCorrect = option === track.name;
                                    const shouldShow = !isRevealing || isSelected || isCorrect;

                                    return (
                                        <button
                                            key={option}
                                            onClick={() => !isRevealing && handleSubmitGuess(option)}
                                            className={`
                                                relative overflow-hidden
                                                p-4 rounded-xl text-right transition-all
                                                ${shouldShow ? 'opacity-100 transform scale-100' : 'opacity-50 transform scale-95'}
                                                ${!isRevealing ? 'hover:bg-blue-50 bg-white border border-gray-200' :
                                                isCorrect ? 'bg-green-100 border-2 border-green-500' :
                                                    isSelected ? 'bg-red-100 border-2 border-red-500' :
                                                        'bg-gray-100 border border-gray-300'}
                                            `}
                                            disabled={isRevealing}
                                        >
                                            <div className="flex justify-between items-center">
                                                <span className={isRevealing && isCorrect ? 'font-bold' : ''}>
                                                    {option}
                                                </span>
                                                {isRevealing && (isSelected || isCorrect) && (
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
                        </div>
                    </>
                )}
            </div>

            <audio ref={audioRef}/>
            <audio ref={correctSoundRef} src="/sounds/right.wav"/>
            <audio ref={wrongSoundRef} src="/sounds/wrong.wav"/>
        </Card>
    );
}

interface GameManagerProps {
    tracks: Track[];
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
