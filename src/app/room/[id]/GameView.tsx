"use client"

import {useEffect, useRef, useState} from 'react';
import {Track} from '@/server/Track';
import {Participant} from "@/server/Participant";
import {Button, Card, Text} from "@tremor/react";
import {dbNamesOf, repo, SqlDatabase} from "remult";

interface GameViewProps {
    track: Track;
    duration: number;
    onGuess: (correct: boolean, timeLeft: number, duration: number) => void;
}

const trackRepo = repo(Track)

export function GameView({track, duration, onGuess}: GameViewProps) {
    const [previewUrl, setPreviewUrl] = useState<string>();
    const [imageUrl, setImageUrl] = useState<string>();
    const [timeLeft, setTimeLeft] = useState(duration);
    const [options, setOptions] = useState<string[]>([])
    const [guess, setGuess] = useState('');
    const [showHint, setShowHint] = useState(false);
    const audioRef = useRef<HTMLAudioElement>(null);
    const timerRef = useRef<NodeJS.Timeout>();

    useEffect(() => {
        track.getMetadata().then(r => {
            setPreviewUrl(r?.previewUrl)
            setImageUrl(r?.imageUrl)
        })
    }, [track]);

    useEffect(() => {
        setOptions([track.name])

        const getRandomNames = async () => {
            const trackDbName = await dbNamesOf(Track)
            const sql = SqlDatabase.getDb()
            const q = `SELECT name
                       FROM ${trackDbName}
                       ORDER BY RANDOM() LIMIT 4`
            const result = await sql.execute(q)
            return result.rows
        }

        getRandomNames().then(console.log)
    }, [track]);

    // התחלת השמעה וטיימר
    useEffect(() => {
        // איפוס מצב
        setTimeLeft(duration);
        setGuess('');
        setShowHint(false);

        // השמעת השיר
        if (audioRef.current && previewUrl) {
            audioRef.current.src = previewUrl;
            audioRef.current.play();
        }

        // הפעלת טיימר
        timerRef.current = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    clearInterval(timerRef.current);
                    handleTimeUp();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        // ניקוי
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
            if (audioRef.current) audioRef.current.pause();
        };
    }, [track, previewUrl, duration]);

    const handleTimeUp = () => {
        // בדיקת ניחוש
        const isCorrect = guess.toLowerCase().trim() === track.name.toLowerCase().trim();
        onGuess(isCorrect, 0, duration);  // 0 זמן שנותר, duration הזמן הכולל
    };

    const handleSubmitGuess = () => {
        const isCorrect = guess.toLowerCase().trim() === track.name.toLowerCase().trim();

        // עצירת הטיימר
        if (timerRef.current) clearInterval(timerRef.current);

        // עצירת השיר
        if (audioRef.current) audioRef.current.pause();

        // דיווח על הניחוש עם זמן שנותר
        onGuess(isCorrect, timeLeft, duration);
    };

    return (
        <div className="game-view">
            <div className="timer">
                זמן שנותר: {timeLeft} שניות
            </div>

            <div className="track-image">
                {imageUrl && (
                    <img
                        src={imageUrl}
                        alt="שיר נוכחי"
                        style={{
                            filter: showHint ? 'blur(10px)' : 'none',
                            transition: 'filter 0.3s ease'
                        }}
                    />
                )}
                {!showHint && (
                    <button onClick={() => setShowHint(true)}>
                        הראה רמז
                    </button>
                )}
            </div>

            <div className="guess-input">
                <input
                    type="text"
                    value={guess}
                    onChange={(e) => setGuess(e.target.value)}
                    placeholder="הקלד את שם השיר"
                />
                <button onClick={handleSubmitGuess}>
                    נחש
                </button>
            </div>

            <audio ref={audioRef}/>
        </div>
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
            // חישוב נקודות יחסית לזמן שנותר
            const pointsEarned = Math.ceil(
                5 * (timeRemaining / totalDuration)
            );

            // עדכון ניקוד למשתמש הנוכחי
            setScores(prev => ({
                ...prev,
                [currentPlayer.id]: (prev[currentPlayer.id] || 0) + pointsEarned
            }));
        }

        // המשך לשיר הבא או סיום משחק
        if (currentTrackIndex < tracks.length - 1) {
            setCurrentTrackIndex(prev => prev + 1);
        } else {
            // סיום משחק - הצגת תוצאות
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
        <GameView
            track={tracks[currentTrackIndex]}
            duration={duration}
            onGuess={handleGuess}
        />
    );
}
