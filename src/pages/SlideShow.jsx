import { useState, useEffect, useRef, useCallback } from "react";
import "../styles//SlideShow.css";
import song from '../assets/music/love-me-like-you-do.mp3'
import pic0 from '../assets/_NEP0558.jpg'
import pic1 from '../assets/couple21.jpg'
import pic2 from '../assets/couple22.jpg'
import pic3 from '../assets/couple23.jpg'
import pic4 from '../assets/couple24.jpg'
import pic5 from '../assets/couple25.jpg'


const PHOTOS = [
  {
    src: pic1,
    caption: "forever with you",
  },
  {
    src: pic2,
    caption: "our first adventure",
  },
  {
    src: pic0,
    caption: "laughing until 3am",
  },
  {
    src: pic3,
    caption: "you + me",
  },
  {
    src: pic4,
    caption: "golden hour",
  },
  {
    src: pic5,
    caption: "my whole heart",
  }
];

// song
const MUSIC_SRC = song; 


const DRIFTS = [
  { tx: 0,    ty: -80 },
  { tx: 0,    ty:  80 },
  { tx: -80,  ty: 0   },
  { tx:  80,  ty: 0   },
  { tx: -55,  ty: -55 },
  { tx:  55,  ty: -55 },
  { tx: -55,  ty:  55 },
  { tx:  55,  ty:  55 },
];

function randomBetween(min, max) {
  return Math.random() * (max - min) + min;
}

function generateCard(photo, id) {
  const drift = DRIFTS[Math.floor(Math.random() * DRIFTS.length)];
  return {
    id,
    photo,
    left:   randomBetween(5, 65),
    top:    randomBetween(5, 60),
    rotate: randomBetween(-10, 10),
    scale:  randomBetween(0.9, 1.1),
    drift,
    phase: "entering",
  };
}

const VISIBLE_MS     = 4200;
const ENTER_MS       =  800;
const LEAVE_MS       =  800;
const SPAWN_INTERVAL = 1500;
const MAX_VISIBLE    = 5;

export default function SlideShow() {
  const [started, setStarted] = useState(false);
  const [cards,   setCards]   = useState([]);
  const counterRef            = useRef(0);
  const photoIndexRef         = useRef(0);
  const audioRef              = useRef(null);
  const intervalRef           = useRef(null);

  const spawnCard = useCallback(() => {
    const photo = PHOTOS[photoIndexRef.current % PHOTOS.length];
    photoIndexRef.current += 1;

    const newCard = generateCard(photo, counterRef.current++);

    setCards((prev) => {
      const next = prev.length >= MAX_VISIBLE ? prev.slice(1) : prev;
      return [...next, newCard];
    });

    setTimeout(() => {
      setCards((prev) =>
        prev.map((c) => (c.id === newCard.id ? { ...c, phase: "visible" } : c))
      );
    }, ENTER_MS);

    setTimeout(() => {
      setCards((prev) =>
        prev.map((c) => (c.id === newCard.id ? { ...c, phase: "leaving" } : c))
      );
    }, ENTER_MS + VISIBLE_MS);

    setTimeout(() => {
      setCards((prev) => prev.filter((c) => c.id !== newCard.id));
    }, ENTER_MS + VISIBLE_MS + LEAVE_MS);
  }, []);

  const handlePlay = () => {
    setStarted(true);

    if (audioRef.current) {
      audioRef.current.volume = 0.75;
      audioRef.current.play().catch(() => {
        console.log('Play Error')
      });
    }

    [0, 1, 2].forEach((i) => setTimeout(spawnCard, i * 600));
    intervalRef.current = setInterval(spawnCard, SPAWN_INTERVAL);
  };

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  return (
    <div className="slideshow-scene">
      <audio ref={audioRef} src={MUSIC_SRC} loop preload="auto" />

      <div className="slideshow-bg" aria-hidden="true" />

      {/* Title */}
      <div className={`slideshow-title-wrap${started ? " title-hidden" : ""}`}>
        <h1 className="slideshow-title">Our story</h1>
        <p className="slideshow-subtitle">every moment with you</p>
      </div>

      {/* Play overlay */}
      {!started && (
        <div className="play-overlay">
          <button className="play-btn" onClick={handlePlay} aria-label="Play slideshow">
            <span className="play-icon" aria-hidden="true">▶</span>
            <span className="play-label">Play</span>
          </button>
          <p className="play-hint">turn up the volume ✦</p>
        </div>
      )}

      {/* Photo stage */}
      <div className="slideshow-table" aria-live="polite" aria-label="photo slideshow">
        {cards.map((card) => {
          const { drift, phase, left, top, rotate, scale, photo, id } = card;

          const style = {
            left:        `${left}%`,
            top:         `${top}%`,
            "--rotate":  `${rotate}deg`,
            "--scale":   scale,
            "--drift-x": `${drift.tx}px`,
            "--drift-y": `${drift.ty}px`,
          };

          return (
            <div
              key={id}
              className={`photo-card photo-card--${phase}`}
              style={style}
              aria-hidden="true"
            >
              <img
                src={photo.src}
                alt=""
                className="photo-img"
                loading="lazy"
                draggable="false"
              />
              <p className="photo-caption">{photo.caption}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}